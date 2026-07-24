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
          background: "#09090b",
          backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34,197,94,0.16), transparent 60%)",
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
            color: "#fafafa",
            letterSpacing: -2,
          }}
        >
          <span style={{ display: "flex", color: "#fafafa" }}>4</span>
          <span style={{ display: "flex", color: "#6b6b74" }}>–</span>
          <span style={{ display: "flex", color: "#86868f" }}>2</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
          <span style={{ display: "flex", width: 14, height: 14, borderRadius: 999, background: "#ffffff" }} />
          <span style={{ display: "flex", color: "#a1a1aa", fontSize: 28 }}>Bianchi vs Neri</span>
          <span style={{ display: "flex", width: 14, height: 14, borderRadius: 999, background: "#52525b" }} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 56,
            padding: "14px 32px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "#111114",
          }}
        >
          <span style={{ display: "flex", width: 16, height: 16, borderRadius: 999, background: "#22c55e" }} />
          <span style={{ display: "flex", color: "#fafafa", fontSize: 36, fontWeight: 700 }}>
            Calciotto di Pippi
          </span>
        </div>
      </div>
    ),
    size
  );
}
