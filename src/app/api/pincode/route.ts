import { fail, handle, ok } from "@/lib/server/http";

const METRO = /^(11|40|56|60|50|70|41|12|20)/;
const NON_SERVICEABLE = /^(19|79|74(4|5))/; // e.g. remote J&K / North-East / Andaman pockets

export const GET = handle(async (req) => {
  const pin = new URL(req.url).searchParams.get("pin")?.trim() ?? "";
  if (!/^[1-9]\d{5}$/.test(pin)) return fail("Enter a valid 6-digit PIN code.", 422);
  if (NON_SERVICEABLE.test(pin)) return ok({ serviceable: false, message: "We don't deliver to this PIN code yet. Our team is expanding coverage." });
  const metro = METRO.test(pin);
  const days = metro ? 3 : 6;
  const eta = new Date(Date.now() + days * 864e5).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  return ok({ serviceable: true, metro, eta, cod: true, express: metro, message: `Delivery by ${eta}${metro ? " · Express available" : ""}` });
});
