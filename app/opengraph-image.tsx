import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#efe5cf",
          
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            fontSize: 120,
            fontWeight: 700,
            color: "#231a12",
            letterSpacing: -2,
          }}
        >
          <span style={{ display: "flex", color: "#231a12" }}>4</span>
          <span style={{ display: "flex", color: "#6f5c47" }}>–</span>
          <span style={{ display: "flex", color: "#6f5c47" }}>2</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
          <span style={{ display: "flex", width: 14, height: 14, borderRadius: 999, background: "#ffffff", border: "2px solid #231a12" }} />
          <span style={{ display: "flex", color: "#5b4a39", fontSize: 28 }}>Bianchi vs Neri</span>
          <span style={{ display: "flex", width: 14, height: 14, borderRadius: 999, background: "#231a12" }} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 56,
            padding: "14px 32px",
            borderRadius: 999,
            border: "3px solid #1d4f91",
            background: "#d1291c",
          }}
        >
          <span style={{ display: "flex", width: 16, height: 16, borderRadius: 999, background: "#f2b705" }} />
          <span style={{ display: "flex", color: "#f2b705", fontSize: 36, fontWeight: 700 }}>
            Calciotto di Pippi
          </span>
        </div>
      </div>
    ),
    size
  );
}
