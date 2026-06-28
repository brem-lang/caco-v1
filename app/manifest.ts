import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Coffee Shop POS",
    short_name: "Coffee POS",
    description: "Point of Sale & Inventory Management System",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#6F4E37",
    theme_color: "#6F4E37",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
