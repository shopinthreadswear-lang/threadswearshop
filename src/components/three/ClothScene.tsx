"use client";
/* eslint-disable react-hooks/immutability -- three.js materials, uniforms and the camera are imperative objects that R3F
   mutates every frame by design; they never feed React rendering, so the compiler's immutability rule does not apply. */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, MathUtils, MeshPhysicalMaterial, PMREMGenerator, Vector2, type Mesh, type WebGLProgramParametersWithUniforms } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { FabricPreset } from "./fabrics";
import { weaveNormalMap } from "./weave";

export type ClothVariant = "hero" | "swatch" | "cta";

export type ClothSceneProps = {
  fabric: FabricPreset;
  variant: ClothVariant;
  active: boolean; // false → render loop paused (off-screen)
  reducedMotion: boolean;
  quality: "high" | "low";
  onReady?: () => void;
};

const NOISE = /* glsl */ `
// 3D simplex noise — Ashima Arts / Stefan Gustavson (MIT)
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

const CLOTH = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform vec2 uPointer;
uniform float uPointerAmt;
uniform float uDrape;
uniform float uFreq;
${NOISE}
// Height of the cloth at a point on the (flat) plane. Broad folds + slow noise + a pointer "press".
float clothH(vec2 p){
  p *= uFreq;
  float t = uTime;
  float h = 0.0;
  h += sin(p.x*0.55 + t*0.32 + sin(p.y*0.35 + t*0.18)*1.4) * 0.55;
  h += sin((p.x*0.32 - p.y*0.58) + t*0.21) * 0.38;
  h += snoise(vec3(p*0.22, t*0.07)) * 0.5;
  h += snoise(vec3(p*0.75, t*0.11)) * 0.09;
  vec2 d = p - uPointer;
  float r2 = dot(d,d);
  h += uPointerAmt * (-0.75*exp(-r2*0.35) + 0.12*sin(sqrt(r2)*3.2 - t*3.0)*exp(-sqrt(r2)*0.7));
  h *= mix(1.0, 0.3 + 0.7*smoothstep(-8.0, 6.0, -p.y), uDrape);
  h /= uFreq; // keep fold depth proportional when folds are tighter
  return h * uAmp;
}
`;

function makeMaterial(f: FabricPreset) {
  const uniforms = {
    uTime: { value: 0 },
    uAmp: { value: f.amplitude },
    uPointer: { value: new Vector2(0, 0) },
    uPointerAmt: { value: 0 },
    uDrape: { value: 0.6 },
    uFreq: { value: 1 },
  };
  const normalMap = weaveNormalMap(f.weave);
  const m = new MeshPhysicalMaterial({
    color: new Color(f.color),
    roughness: f.roughness,
    metalness: 0,
    sheen: f.sheen,
    sheenRoughness: f.sheenRoughness,
    sheenColor: new Color(f.sheenColor),
    normalMap,
    normalScale: new Vector2(f.normalStrength, f.normalStrength),
  });
  normalMap.repeat.set(f.weaveRepeat, f.weaveRepeat);
  m.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${CLOTH}`)
      .replace(
        "#include <beginnormal_vertex>",
        /* glsl */ `
        vec2 cp = position.xy;
        float ch = clothH(cp);
        const float ce = 0.05;
        float chx = clothH(cp + vec2(ce, 0.0)) - clothH(cp - vec2(ce, 0.0));
        float chy = clothH(cp + vec2(0.0, ce)) - clothH(cp - vec2(0.0, ce));
        vec3 objectNormal = normalize(vec3(-chx / (2.0 * ce), -chy / (2.0 * ce), 1.0));
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3(tangent.xyz);
        #endif`,
      )
      .replace("#include <begin_vertex>", "vec3 transformed = vec3(position.xy, position.z + ch);");
  };
  m.customProgramCacheKey = () => "tw-cloth";
  return { material: m, uniforms };
}

type Layout = { size: [number, number]; rotX: number; rotZ: number; camZ: number; camY: number; fov: number; freq: number; amp: number; key: [number, number, number]; keyI: number };
const LAYOUT: Record<ClothVariant, Layout> = {
  // Full-bleed cloth, lit frontally so the copy above it stays calm.
  hero: { size: [26, 17], rotX: -0.62, rotZ: -0.06, camZ: 10, camY: -0.6, fov: 38, freq: 1, amp: 1, key: [-3, 5, 9], keyI: 2.6 },
  // A draped square with visible edges, turned for a diagonal composition and raked by a low key light.
  swatch: { size: [4.3, 4.3], rotX: -0.5, rotZ: 0.2, camZ: 10.5, camY: -0.15, fov: 34, freq: 2.2, amp: 2.4, key: [-7, 3, 4], keyI: 1.7 },
  cta: { size: [26, 15], rotX: -0.55, rotZ: -0.06, camZ: 10, camY: -0.4, fov: 38, freq: 1, amp: 1, key: [-3, 5, 9], keyI: 2.6 },
};

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.32;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Cloth({ fabric, variant, reducedMotion, quality, onReady }: Omit<ClothSceneProps, "active">) {
  const mesh = useRef<Mesh>(null);
  const layout = LAYOUT[variant];
  const seg = quality === "high" ? (variant === "swatch" ? 140 : 220) : variant === "swatch" ? 80 : 110;
  const { material, uniforms } = useMemo(() => {
    const m = makeMaterial(fabric);
    m.uniforms.uFreq.value = LAYOUT[variant].freq;
    m.uniforms.uAmp.value = fabric.amplitude * LAYOUT[variant].amp;
    return m;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- fabric changes are tweened below
  const target = useRef({ color: new Color(fabric.color), sheen: new Color(fabric.sheenColor) });
  const pointer = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, energy: 0 });
  const readyFired = useRef(false);
  const { camera, size, invalidate } = useThree();

  // Morph to a new fabric: colours/physical values tween in useFrame, the weave swaps instantly mid-tween.
  useEffect(() => {
    target.current.color.set(fabric.color);
    target.current.sheen.set(fabric.sheenColor);
    const t = setTimeout(() => {
      const map = weaveNormalMap(fabric.weave);
      map.repeat.set(fabric.weaveRepeat, fabric.weaveRepeat);
      material.normalMap = map;
      material.normalScale.set(fabric.normalStrength, fabric.normalStrength);
      invalidate();
    }, reducedMotion ? 0 : 260);
    invalidate();
    return () => clearTimeout(t);
  }, [fabric, material, reducedMotion, invalidate]);

  useEffect(() => () => material.dispose(), [material]); // geometry is disposed by R3F; shared weave textures are cached

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const k = reducedMotion ? 1 : 1 - Math.pow(0.002, dt); // frame-rate independent easing
    // Fabric tween
    material.color.lerp(target.current.color, k);
    material.sheenColor.lerp(target.current.sheen, k);
    material.roughness = MathUtils.lerp(material.roughness, fabric.roughness, k);
    material.sheen = MathUtils.lerp(material.sheen, fabric.sheen, k);
    material.sheenRoughness = MathUtils.lerp(material.sheenRoughness, fabric.sheenRoughness, k);
    uniforms.uAmp.value = MathUtils.lerp(uniforms.uAmp.value, fabric.amplitude * layout.amp, k);

    if (reducedMotion) {
      uniforms.uTime.value = 6;
      if (!readyFired.current) {
        readyFired.current = true;
        onReady?.();
      }
      return;
    }
    uniforms.uTime.value += dt * fabric.speed;

    // Pointer → plane coordinates (visible extents at the cloth's depth), energy from movement speed.
    const p = pointer.current;
    const halfH = Math.tan((layout.fov * Math.PI) / 360) * layout.camZ;
    const halfW = halfH * (size.width / size.height);
    const px = (state.pointer.x * halfW) / layout.freq;
    const py = (state.pointer.y * halfH) / Math.cos(layout.rotX) / layout.freq;
    const speed = Math.hypot(px - p.lastX, py - p.lastY) / Math.max(dt, 1e-3);
    p.lastX = px;
    p.lastY = py;
    p.energy = MathUtils.clamp(MathUtils.lerp(p.energy, Math.min(speed / 12, 1), 1 - Math.pow(0.02, dt)), 0, 1);
    p.x = MathUtils.lerp(p.x, px, 1 - Math.pow(0.004, dt));
    p.y = MathUtils.lerp(p.y, py, 1 - Math.pow(0.004, dt));
    uniforms.uPointer.value.set(p.x, p.y);
    uniforms.uPointerAmt.value = p.energy * (variant === "swatch" ? 1.4 : 1);

    // Scroll: the hero cloth eases back and settles as the visitor leaves it.
    let scroll = 0;
    if (variant === "hero") scroll = MathUtils.clamp(window.scrollY / Math.max(window.innerHeight, 1), 0, 1);
    uniforms.uDrape.value = 0.6 + scroll * 0.4;
    // Subtle camera parallax towards the pointer + scroll dolly
    camera.position.x = MathUtils.lerp(camera.position.x, state.pointer.x * 0.35, 1 - Math.pow(0.01, dt));
    camera.position.y = MathUtils.lerp(camera.position.y, layout.camY + state.pointer.y * 0.2 - scroll * 0.8, 1 - Math.pow(0.01, dt));
    camera.position.z = layout.camZ + scroll * 1.6;
    camera.lookAt(0, -scroll * 0.6, 0);
    if (mesh.current) mesh.current.rotation.z = layout.rotZ + Math.sin(uniforms.uTime.value * 0.1) * 0.03;

    if (!readyFired.current) {
      readyFired.current = true;
      onReady?.();
    }
  });

  return (
    <mesh ref={mesh} rotation={[layout.rotX, 0, layout.rotZ]} material={material}>
      <planeGeometry args={[layout.size[0], layout.size[1], seg, Math.round(seg * (layout.size[1] / layout.size[0]))]} />
    </mesh>
  );
}

/** Lowers resolution when the device can't hold ~50fps; never raises it above the initial cap. */
function AdaptiveResolution({ maxDpr }: { maxDpr: number }) {
  const samples = useRef<number[]>([]);
  const dpr = useRef(maxDpr);
  useFrame((state, delta) => {
    samples.current.push(delta);
    if (samples.current.length < 90) return;
    const avg = samples.current.reduce((a, b) => a + b, 0) / samples.current.length;
    samples.current = [];
    if (1 / avg < 48 && dpr.current > 1) {
      dpr.current = Math.max(1, dpr.current - 0.25);
      state.setDpr(dpr.current);
    }
  });
  return null;
}

export default function ClothScene(props: ClothSceneProps) {
  const { variant, active, reducedMotion, quality } = props;
  const layout = LAYOUT[variant];
  const maxDpr = typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, quality === "high" ? 1.75 : 1.25);
  return (
    <Canvas
      dpr={maxDpr}
      frameloop={reducedMotion ? "demand" : active ? "always" : "never"}
      gl={{ antialias: quality === "high", alpha: true, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: layout.fov, position: [0, layout.camY, layout.camZ], near: 0.1, far: 60 }}
      aria-hidden
      style={{ pointerEvents: "none" }}
      eventSource={typeof document !== "undefined" ? (document.body as HTMLElement) : undefined}
      eventPrefix="client"
    >
      <Environment />
      <hemisphereLight args={["#fff6e8", "#141210", 0.35]} />
      <directionalLight position={layout.key} intensity={layout.keyI} color="#fff0db" />
      <directionalLight position={[2, -6, 5]} intensity={0.9} color="#ffe4c2" />
      <directionalLight position={[7, -2, 3]} intensity={0.7} color="#c9d4ff" />
      <Cloth {...props} />
      {!reducedMotion && <AdaptiveResolution maxDpr={maxDpr} />}
    </Canvas>
  );
}
