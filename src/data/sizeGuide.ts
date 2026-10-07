/** Garment measurements in centimetres (body-to-garment fit already applied). */
export const sizeCharts = {
  tops: {
    label: "T-Shirts, Shirts, Knitwear & Outerwear",
    columns: ["Size", "Neck", "Chest", "Shoulder", "Length", "Sleeve"],
    rows: [
      ["XS", 37, 92, 42, 68, 61],
      ["S", 38.5, 98, 44, 70, 62],
      ["M", 40, 104, 46, 72, 63],
      ["L", 42, 110, 48, 74, 64],
      ["XL", 44, 116, 50, 76, 65],
      ["XXL", 46, 124, 52, 78, 66],
    ] as (string | number)[][],
    note: "Oversized and Relaxed fits are cut 6–10cm larger through the chest. Size down for a closer fit.",
  },
  tailoring: {
    label: "Blazers, Suiting & Designer Wear",
    columns: ["Size", "Chest", "Shoulder", "Length", "Sleeve"],
    rows: [
      ["36", 92, 43, 71, 62],
      ["38", 97, 44.5, 72, 63],
      ["40", 102, 46, 73, 64],
      ["42", 107, 47.5, 74, 65],
      ["44", 112, 49, 75, 66],
      ["46", 117, 50.5, 76, 66.5],
    ] as (string | number)[][],
    note: "Jacket size corresponds to your chest measurement in inches. Complimentary alterations on all suits.",
  },
};

export type ChartKey = keyof typeof sizeCharts;

export function chartForCategory(category?: string): ChartKey {
  if (!category) return "tops";
  if (category === "blazers-suiting") return "tailoring";
  return "tops";
}

export const howToMeasure = [
  { title: "Chest", text: "Measure around the fullest part of your chest, under the arms, keeping the tape horizontal." },
  { title: "Shoulder", text: "Measure from the edge of one shoulder to the other, across the top of your back." },
  { title: "Length", text: "Measure from the highest point of the shoulder, next to the collar, down to the hem." },
  { title: "Sleeve", text: "Measure from the shoulder seam to the end of the cuff with your arm slightly bent." },
  { title: "Neck", text: "Measure around the base of your neck where a shirt collar sits, with one finger’s room." },
  { title: "Fit tip", text: "Compare with a piece you already love: lay it flat, measure armpit to armpit and double it for the chest." },
];
