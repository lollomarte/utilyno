/**
 * Il sigillo LOQO: un hub centrale connesso a 5 nodi (agenzia, proprietario,
 * inquilino, amministratore, admin) dentro un doppio anello che richiama il
 * trattamento "Timbro" già usato per i badge di stato — la stessa idea di
 * profondità incisa, qui portata a un elemento di marca a sé stante. Non è
 * un'icona decorativa: è la rappresentazione letterale della headline
 * dell'homepage ("LOQO le mette nello stesso posto").
 */
const NODE_ANGLES_DEG = [-90, -18, 54, 126, 198];
const CENTER = 50;
const ORBIT = 30;
const NODE_R = 4.5;
const HUB_R = 7;

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
}

const NODES = NODE_ANGLES_DEG.map((a) => polar(a, ORBIT));

export function LoqoSeal({
  size = 40,
  color = "#0e2f3c",
  ring = true,
  className,
}: {
  size?: number;
  color?: string;
  ring?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      role="img"
      aria-label="Sigillo LOQO"
    >
      {ring && (
        <>
          <circle cx={CENTER} cy={CENTER} r={46} stroke={color} strokeWidth={2} opacity={0.3} />
          <circle cx={CENTER} cy={CENTER} r={38} stroke={color} strokeWidth={1} opacity={0.18} />
        </>
      )}
      {NODES.map((n, i) => (
        <line key={`l-${i}`} x1={CENTER} y1={CENTER} x2={n.x} y2={n.y} stroke={color} strokeWidth={1.75} opacity={0.45} />
      ))}
      {NODES.map((n, i) => (
        <circle key={`n-${i}`} cx={n.x} cy={n.y} r={NODE_R} fill={color} />
      ))}
      <circle cx={CENTER} cy={CENTER} r={HUB_R} fill={color} />
    </svg>
  );
}
