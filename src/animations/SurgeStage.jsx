import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { getScene } from './scenes/index.js';
import { getLegacyConfig } from './legacyConfig.js';
import { useCanvasScene } from './useCanvasScene.js';
import './SurgeStage.css';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return undefined;
    const on = (e) => setReduced(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/**
 * Viewport-filling presentation for one rolled entry. Owns: dismissal (button + Escape),
 * focus management, scroll lock, optional Fullscreen API, reduced-motion fallback, delayed
 * result reveal, and cleanup of every timer/listener/rAF loop when it unmounts.
 * `fallback` renders the legacy CSS overlay for entries without a dedicated scene.
 */
export default function SurgeStage({ entry, onClose, fallback }) {
  const scene = getScene(entry.id);
  const legacy = getLegacyConfig(entry.id);
  const reduced = usePrefersReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const closeBtn = useRef(null);
  const fsBtn = useRef(null);
  const onCloseRef = useRef(onClose);
  const descId = useId();
  const useCanvas = !!scene && !reduced;
  const showResult = reduced || revealed;

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useCanvasScene(canvasRef, scene, useCanvas, entry.id);

  // Result reveal timed to the scene's climax (≈55% in); legacy fallback uses a fixed delay.
  useEffect(() => {
    if (reduced) return undefined;
    const id = setTimeout(() => setRevealed(true), scene ? scene.duration * 550 : 2000);
    return () => clearTimeout(id);
  }, [reduced, scene]);

  const requestClose = useCallback(() => setClosing(true), []);
  useEffect(() => {
    if (!closing) return undefined;
    const id = setTimeout(() => onCloseRef.current?.(), reduced ? 0 : 260);
    return () => clearTimeout(id);
  }, [closing, reduced]);

  // Focus, scroll-lock, Escape and a minimal two-button focus trap.
  useEffect(() => {
    const prev = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtn.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); requestClose(); }
      else if (e.key === 'Tab') {
        const els = [closeBtn.current, fsBtn.current].filter(Boolean);
        const i = els.indexOf(document.activeElement);
        e.preventDefault();
        els[(i + (e.shiftKey ? els.length - 1 : 1)) % els.length]?.focus();
      }
    };
    const onFs = () => setIsFs(document.fullscreenElement === rootRef.current);
    window.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFs);
    const root = rootRef.current;
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFs);
      document.body.style.overflow = prevOverflow;
      if (document.fullscreenElement === root) document.exitFullscreen?.().catch(() => {});
      if (prev instanceof HTMLElement) prev.focus();
    };
  }, [requestClose]);

  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    else rootRef.current?.requestFullscreen?.().catch(() => {});
  };
  const canFs = typeof document !== 'undefined' && !!document.fullscreenEnabled;

  return (
    <div
      ref={rootRef}
      className={`surge-stage sev-${entry.severity} ${closing ? 'is-closing' : ''} ${reduced ? 'is-reduced' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Wild magic surge, result ${entry.id}`}
      aria-describedby={descId}
      style={{ '--stage-tint': legacy.tint, '--stage-accent': legacy.color }}
    >
      <div className="surge-stage__bg" aria-hidden="true" />
      {useCanvas ? (
        <canvas ref={canvasRef} className="surge-stage__canvas" aria-hidden="true" />
      ) : (
        !reduced && <div className="surge-stage__legacy" aria-hidden="true">{fallback}</div>
      )}

      <div className="surge-stage__controls">
        {canFs && (
          <button ref={fsBtn} type="button" className="surge-stage__btn" onClick={toggleFs} aria-pressed={isFs}>
            {isFs ? 'Exit full screen' : 'Full screen'}
          </button>
        )}
        <button ref={closeBtn} type="button" className="surge-stage__btn surge-stage__btn--close" onClick={requestClose}>
          Close <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div id={descId} className={`surge-stage__result ${showResult ? 'is-revealed' : ''}`} aria-live="polite">
        <div className="surge-stage__num">Surge No. {entry.id}</div>
        <p className="surge-stage__effect">{entry.effect}</p>
        <div className="surge-stage__meta">{entry.severity} · {entry.source}</div>
        <div className="surge-stage__hint" aria-hidden="true">Esc to close</div>
      </div>
    </div>
  );
}
