import { useEffect } from 'react';
import { rng } from './scenes/toolkit.js';

/**
 * Runs a canvas scene on <canvas ref>. Handles devicePixelRatio, resize, and guarantees the
 * rAF loop + ResizeObserver are torn down on unmount/interrupt. Stops drawing once the scene
 * has finished (final frame stays on screen) so an idle result screen costs no CPU.
 */
export function useCanvasScene(canvasRef, scene, enabled, seed) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !scene || !canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let raf = 0, start = 0, state = null, W = 0, H = 0, finished = false, lastT = 0;

    const renderAt = (t) => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      scene.draw(ctx, W, H, Math.min(t, scene.duration), state);
    };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
      if (w === W && h === H) return;
      W = w; H = h;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      state = scene.init(W, H, rng(seed));
      if (finished) renderAt(scene.duration);
    };
    const frame = (now) => {
      if (!start) start = now;
      lastT = (now - start) / 1000;
      renderAt(lastT);
      if (lastT < scene.duration) raf = requestAnimationFrame(frame);
      else finished = true;
    };

    resize();
    raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [canvasRef, scene, enabled, seed]);
}
