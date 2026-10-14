import type { Product } from "@/lib/types";

export const products: Product[] = [
  {
    id: "studio-cups",
    title: "Handmade Studio Cups",
    description:
      "Four hand-thrown cups from a Jingdezhen workshop. The gallery shows the bisque stack and glazed pieces from the same benches. Each cup sits a little differently because the wall is pulled by hand. Packed weight includes the molded pulp tray we use for air freight.",
    price: 42,
    compare_at: 68,
    images: ["/products/cups-1.jpg", "/products/cups-2.jpg", "/products/cups-3.jpg"],
    stock_quantity: 36,
    ordered: 20,
    weight: 0.92,
    dimensions: "24 × 24 × 12 cm",
    origin: "Jingdezhen, Jiangxi",
    material: "High-fire stoneware",
    shipping_time_estimate: "8–15 business days",
    china_supplier_url: "https://example.com/suppliers/jingdezhen-kiln",
  },
  {
    id: "linen-throw",
    title: "Washed Linen Throw",
    description:
      "One washed linen throw, about 140 × 180 cm when it is open, milled in Nantong. It folds into a small carton, which is why the freight stays reasonable. The stack photographs show the cloth and the color lot. This listing ships in oat.",
    price: 58,
    compare_at: 104,
    images: ["/products/linen-1.jpg", "/products/linen-2.jpg", "/products/linen-3.jpg"],
    stock_quantity: 40,
    ordered: 18,
    weight: 0.51,
    dimensions: "30 × 24 × 8 cm, packed",
    origin: "Nantong, Jiangsu",
    material: "Washed linen",
    shipping_time_estimate: "8–15 business days",
    china_supplier_url: "https://example.com/suppliers/nantong-mill",
  },
  {
    id: "arc-floor-lamp",
    title: "Arc Floor Lamp",
    description:
      "A matte steel arc floor lamp from a Zhongshan lighting workshop. The shade is spun, the stem is a single arc, and the carton is long because the stem does not fold. This lot ships in graphite. The second photo is the black finish from the same tool, so you can see the arc clearly. Bulb not included. Cord is two-prong, 180 cm.",
    price: 128,
    compare_at: 210,
    images: ["/products/lamp-1.jpg", "/products/lamp-2.jpg"],
    stock_quantity: 14,
    ordered: 9,
    weight: 3.6,
    dimensions: "130 × 26 × 24 cm",
    origin: "Zhongshan, Guangdong",
    material: "Spun steel, matte graphite",
    shipping_time_estimate: "8–15 business days",
    china_supplier_url: "https://example.com/suppliers/zhongshan-lighting",
  },
  {
    id: "woven-leather-tote",
    title: "Woven Leather Tote",
    description:
      "A woven leather tote cut and laced in Guangzhou. The strap is a metal chain set on leather. It ships in a small carton, and the weight below is the packed weight, not the leather on its own.",
    price: 88,
    compare_at: 146,
    images: ["/products/tote-1.jpg"],
    stock_quantity: 22,
    ordered: 12,
    weight: 0.74,
    dimensions: "40 × 30 × 14 cm",
    origin: "Guangzhou, Guangdong",
    material: "Woven leather, metal chain",
    shipping_time_estimate: "8–15 business days",
    china_supplier_url: "https://example.com/suppliers/guangzhou-leather",
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getRelatedProducts(id: string): Product[] {
  return products.filter((product) => product.id !== id);
}
