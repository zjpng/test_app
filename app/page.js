import RippleCanvas from "./RippleCanvas";

export default function Home() {
  return (
    <>
      <RippleCanvas />
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(180, 220, 255, 0.6)",
          fontFamily: "system-ui, sans-serif",
          fontSize: "13px",
          letterSpacing: "0.05em",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        click or drag to create ripples
      </div>
    </>
  );
}
