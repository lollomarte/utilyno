import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Calciotto di Pippi",
    short_name: "Calciotto di Pippi",
    description: "Statistiche del gruppo di calciotto amatoriale",
    start_url: "/",
    display: "standalone",
    background_color: "#efe5cf",
    theme_color: "#efe5cf",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
