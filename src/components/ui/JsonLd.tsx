export function JsonLd({ data }: { data: object }) {
  // Escape `<` so JSON can never break out of the script element.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
