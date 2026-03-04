"use client";

import { useEffect, useRef, useCallback } from "react";

const DAMPING = 0.985;
const SPEED = 0.25; // wave speed (c^2 in wave equation)

export default function RippleCanvas() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const animFrameRef = useRef(null);

  const initGrid = useCallback((width, height) => {
    const cols = Math.floor(width / 2);
    const rows = Math.floor(height / 2);
    const size = cols * rows;
    return {
      cols,
      rows,
      current: new Float32Array(size),
      previous: new Float32Array(size),
    };
  }, []);

  const disturb = useCallback((x, y, amplitude = 800) => {
    const state = stateRef.current;
    if (!state) return;
    const { cols, rows, current } = state;
    const cx = Math.floor(x / 2);
    const cy = Math.floor(y / 2);
    const radius = 3;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= radius) {
            current[ny * cols + nx] += amplitude * (1 - dist / radius);
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stateRef.current = initGrid(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    // Render loop
    const render = () => {
      const state = stateRef.current;
      if (!state) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const { cols, rows, current, previous } = state;

      // Update wave equation: u[t+1] = 2*u[t] - u[t-1] + c^2 * laplacian(u[t])
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const i = y * cols + x;
          const laplacian =
            current[i - 1] +
            current[i + 1] +
            current[i - cols] +
            current[i + cols] -
            4 * current[i];
          previous[i] =
            (2 * current[i] - previous[i] + SPEED * laplacian) * DAMPING;
        }
      }

      // Swap buffers
      state.current = previous;
      state.previous = current;

      // Draw
      const imageData = ctx.createImageData(cols, rows);
      const data = imageData.data;
      const newCurrent = state.current;

      for (let i = 0; i < cols * rows; i++) {
        const val = newCurrent[i];
        const clamped = Math.max(-255, Math.min(255, val));

        let r, g, b;
        if (clamped > 0) {
          // Crests: bright cyan → white
          const t = clamped / 255;
          r = Math.floor(t * 220);
          g = Math.floor(180 + t * 75);
          b = Math.floor(220 + t * 35);
        } else {
          // Troughs: dark blue → deep indigo
          const t = -clamped / 255;
          r = Math.floor(t * 30);
          g = Math.floor(t * 20);
          b = Math.floor(60 + t * 120);
        }

        const px = i * 4;
        data[px] = r;
        data[px + 1] = g;
        data[px + 2] = b;
        data[px + 3] = 255;
      }

      // Draw at 2x scale (each simulation cell = 2x2 pixels)
      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = cols;
      tmpCanvas.height = rows;
      tmpCanvas.getContext("2d").putImageData(imageData, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tmpCanvas, 0, 0, canvas.width, canvas.height);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [initGrid]);

  const handlePointerDown = useCallback(
    (e) => {
      disturb(e.clientX, e.clientY);
    },
    [disturb]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (e.buttons === 1) {
        disturb(e.clientX, e.clientY, 300);
      }
    },
    [disturb]
  );

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      style={{ display: "block", cursor: "crosshair", touchAction: "none" }}
    />
  );
}
