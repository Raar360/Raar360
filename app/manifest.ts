import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pip's Backpack",
    short_name: "Pip's Backpack",
    description: "Therapeutic storytelling for children and coaches.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF3E8",
    theme_color: "#FAF3E8",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
