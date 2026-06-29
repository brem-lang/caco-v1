import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CA.CO",
    short_name: "CA.CO",
    description: "Chill Area Coffee — Point of Sale & Management System",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#6F4E37",
    theme_color: "#6F4E37",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/logo.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
