import { useSurgeStore } from '../../store/useSurgeStore';
import { rollSurge } from '../../utils/rollEngine';
import { useEffect, useRef, useState } from 'react';
import SurgeStage from '../../animations/SurgeStage';
import { getLegacyConfig } from '../../animations/legacyConfig';
import './PlayerView.css';

// ================================================================
// Precomputed particle data (module level — render stays pure)
// ================================================================

function makeParticles(count, base) {
  return [...Array(count)].map(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 6}s`,
    duration: `${2 + Math.random() * 4}s`,
    size: `${4 + Math.random() * 12}px`,
    opacity: Math.random() * 0.6 + 0.2,
    ...base,
  }));
}

const STAR_COUNT = 30;
const STARS = [...Array(STAR_COUNT)].map(() => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: `${Math.random() * 8}s`,
  duration: `${5 + Math.random() * 8}s`,
  size: `${3 + Math.random() * 6}px`,
  opacity: Math.random() * 0.8 + 0.4,
}));

const SPARKLES = [...Array(20)].map((_, i) => {
  const angle = (i / 20) * Math.PI * 2;
  const distance = 60 + Math.random() * 100;
  return {
    delay: `${Math.random() * 0.5}s`,
    tx: `${Math.cos(angle) * distance}px`,
    ty: `${Math.sin(angle) * distance}px`,
  };
});

// Per-entry legacy config now lives in src/animations/legacyConfig.js (fallback layer);
// dedicated scenes are registered in src/animations/scenes/.
const getEntryAnimation = getLegacyConfig;

// ================================================================
// Full-screen effect overlay — per-entry custom animation
// ================================================================

function FullScreenEffect({ entryId }) {
  const anim = getEntryAnimation(entryId);
  const particles = makeParticles(40, { color: anim.color, shape: anim.particle });

  return (
    <div className={`fullscreen-effect fs-${anim.type}`}>
      {/* Background tint layer */}
      <div className="fs-tint" style={{ backgroundColor: anim.tint }} />

      {/* Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className={`fs-particle fs-shape-${p.shape}`}
          style={{
            left: p.left,
            top: p.top,
            '--color': anim.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Type-specific dramatic overlays */}
      {(anim.type === 'teleport-60' || anim.type === 'blink' || anim.type === 'warp' || anim.type === 'bonus-teleport') && (
        <>
          <div className="fs-portal-ring" />
          <div className="fs-portal-ring" style={{ animationDelay: '0.5s' }} />
          <div className="fs-portal-core" />
        </>
      )}
      {(anim.type === 'lightning-bolt' || anim.type === 'static' || anim.type === 'zap' || anim.type === 'yawn-bolt' || anim.type === 'static-aura' || anim.type === 'zap-aura') && <div className="fs-flash" />}
      {(anim.type === 'blinding-flash' || anim.type === 'flash-blind') && <div className="fs-flash fs-flash-bright" />}
      {(anim.type === 'fireball-3' || anim.type === 'fireball-5' || anim.type === 'detonate' || anim.type === 'nuke' || anim.type === 'ember-aura' || anim.type === 'burn-body' || anim.type === 'wall-flame' || anim.type === 'red-hot-metal' || anim.type === 'heat-metal') && <div className="fs-heat-haze" />}
      {(anim.type === 'sound-wave' || anim.type === 'drum' || anim.type === 'thump' || anim.type === 'howl' || anim.type === 'note-rain' || anim.type === 'celestial' || anim.type === 'purr' || anim.type === 'repeat' || anim.type === 'warble' || anim.type === 'bubbles') && (
        <>
          <div className="fs-sound-ring" />
          <div className="fs-sound-ring" style={{ animationDelay: '0.6s' }} />
          <div className="fs-sound-ring" style={{ animationDelay: '1.2s' }} />
        </>
      )}
      {(anim.type === 'color-shift' || anim.type === 'chameleon' || anim.type === 'shift' || anim.type === 'hue-spin') && <div className="fs-hue-wheel" />}
      {(anim.type === 'levitate' || anim.type === 'gravity-flip' || anim.type === 'fall-up' || anim.type === 'gravity-reverse' || anim.type === 'float' || anim.type === 'float-up' || anim.type === 'upend') && (
        <>
          <div className="fs-orbit-ring" />
          <div className="fs-orbit-ring" style={{ animationDelay: '0.4s', animationDirection: 'reverse' }} />
        </>
      )}
      {(anim.type === 'fireball-3' || anim.type === 'fireball-5' || anim.type === 'detonate' || anim.type === 'nuke' || anim.type === 'arcane-detonation') && <div className="fs-nova-ring" />}
      {(anim.type === 'earthquake' || anim.type === 'quake' || anim.type === 'pit' || anim.type === 'collapse') && <div className="fs-crack" />}
      {(anim.type === 'petrify' || anim.type === 'stone') && <div className="fs-crack" />}
    </div>
  );
}

// ================================================================
// Player view — no cards, no icons, just text over full-screen fx
// ================================================================

const SEVERITY_THEME = {
  harmless:   { glow: '#4ade80',  textColor: '#a7f3d0' },
  moderate:   { glow: '#fbbf24',  textColor: '#fde047' },
  dramatic:   { glow: '#fb923c',  textColor: '#fdba74' },
  catastrophic: { glow: '#f87171', textColor: '#fca5a5' },
};

export default function PlayerView() {
  const { entries, manualOverrideId, addToHistory, activeVersion } = useSurgeStore();
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [stageOpen, setStageOpen] = useState(false);
  const [rollCount, setRollCount] = useState(0);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  const filteredEntries = entries.filter((e) => {
    if (activeVersion === 'all') return true;
    if (activeVersion === 'd100') return e.source === 'saga20';
    if (activeVersion === 'phb2024') return e.source === 'phb2024';
    if (activeVersion === 'homebrew') return e.source === 'magitrix' || e.source === 'custom';
    return true;
  });

  const handleRoll = async () => {
    if (filteredEntries.length === 0 || rolling) return; // ignore re-clicks while a roll is in flight
    setRolling(true);
    setStageOpen(false);
    setResult(null);
    setShowSparkles(false);

    // Dramatic roll buildup — 1.5 seconds of energy building
    await new Promise(r => setTimeout(r, 1500));
    if (!alive.current) return; // view unmounted during the build-up
    const entry = rollSurge(filteredEntries, manualOverrideId);
    if (entry) {
      setRollCount((n) => n + 1);
      setStageOpen(true);
      setResult(entry);
      addToHistory(entry);
      setShowSparkles(true);
    }
    setRolling(false);
  };

  const theme = result ? SEVERITY_THEME[result.severity] : SEVERITY_THEME.harmless;
  const anim = result ? getEntryAnimation(result.id) : getEntryAnimation(1);

  return (
    <div className="player-view">
      {/* Background magic particles (always on) */}
      <div className="magic-bg">
        {STARS.map((star, i) => (
          <div key={i} className="magic-star" style={{
            left: star.left,
            top: star.top,
            animationDelay: star.delay,
            animationDuration: star.duration,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }} />
        ))}
        <div className="magic-glow" />
      </div>

      {/* Full-screen effect overlay (appears with result — no card) */}
      {result && stageOpen && (
        <SurgeStage
          key={rollCount}
          entry={result}
          onClose={() => setStageOpen(false)}
          fallback={<FullScreenEffect entryId={result.id} />}
        />
      )}

      <div className="player-canvas">
        <h1 className="title">
          <span className="title-glow">Wild Magic</span> <span className="title-accent">Surge</span>
        </h1>

        <button
          className={`roll-btn ${rolling ? 'rolling' : ''}`}
          onClick={handleRoll}
          disabled={rolling || filteredEntries.length === 0}
        >
          {rolling ? (
            <>
              <span className="btn-icon">✦</span>
              CASTING…
            </>
          ) : (
            <>
              <span className="btn-icon">✦</span>
              ROLL MAGIC SURGE <span className="entry-count">({filteredEntries.length})</span>
            </>
          )}
        </button>

        {/* Roll vortex — more intense */}
        {rolling && (
          <div className="vortex">
            <div className="vortex-ring" />
            <div className="vortex-ring" style={{ animationDelay: '0.2s' }} />
            <div className="vortex-ring" style={{ animationDelay: '0.4s' }} />
            <div className="vortex-ring" style={{ animationDelay: '0.6s' }} />
            <div className="vortex-core" />
            <div className="vortex-text">ENERGY BUILDING…</div>
          </div>
        )}

        {/* Sparkle burst */}
        {showSparkles && (
          <div className="sparkle-burst">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="sparkle" style={{
                left: '50%',
                top: '50%',
                animationDelay: SPARKLES[i].delay,
                '--tx': SPARKLES[i].tx,
                '--ty': SPARKLES[i].ty,
              }} />
            ))}
          </div>
        )}

        {/* Result text — appears over full-screen animation, no card */}
        <div
          className={`result-text-wrapper ${result ? 'revealed' : ''} ${result?.severity || ''} fs-text-${anim.textFx}`}
          style={{
            '--glow': theme.glow,
            '--text-color': theme.textColor,
            '--fx-color': anim.color,
          }}
        >
          {result ? (
            <>
              <div className="result-text">{result.effect}</div>
              <div className="result-meta">
                <span className="meta-severity">{result.severity}</span>
                <span className="meta-dot">·</span>
                <span className="meta-source">{result.source}</span>
              </div>
            </>
          ) : (
            <div className="empty-state">No entries loaded.</div>
          )}
        </div>
      </div>
    </div>
  );
}
