import { useSurgeStore } from '../../store/useSurgeStore';
import { rollSurge } from '../../utils/rollEngine';
import { useState } from 'react';
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

// ================================================================
// Per-entry animation map — every one of the 118 entries gets
// a custom full-screen animation configuration.
// ================================================================

const ENTRY_ANIMATIONS = {
  // 1-20: saga20 harmless — whimsical, light effects
  1:   { type: 'color-shift',   color: '#f472b6', particle: 'spark',  tint: '#be185d', textFx: 'hue-spin',   shake: false },
  2:   { type: 'sound-wave',    color: '#c084fc', particle: 'note',   tint: '#6b21a8', textFx: 'vibrate',    shake: false },
  3:   { type: 'butterfly',     color: '#a3e635', particle: 'leaf',   tint: '#65a30d', textFx: 'flutter',    shake: false },
  4:   { type: 'frost',         color: '#22d3ee', particle: 'dot',    tint: '#0c4a6e', textFx: 'chill',      shake: false },
  5:   { type: 'scent',         color: '#fbbf24', particle: 'dot',    tint: '#b45309', textFx: 'waft',       shake: false },
  6:   { type: 'rumble',        color: '#fbbf24', particle: 'spark',  tint: '#b45309', textFx: 'drop',       shake: true },
  7:   { type: 'bloom',         color: '#4ade80', particle: 'leaf',   tint: '#15803d', textFx: 'sprout',     shake: false },
  8:   { type: 'puff',          color: '#f472b6', particle: 'blob',   tint: '#be185d', textFx: 'pop',        shake: false },
  9:   { type: 'ember',         color: '#fbbf24', particle: 'ember',  tint: '#b45309', textFx: 'glow',       shake: false },
  10:  { type: 'purr',          color: '#fbbf24', particle: 'spark',  tint: '#b45309', textFx: 'purr',       shake: false },
  11:  { type: 'music-note',    color: '#c084fc', particle: 'note',   tint: '#6b21a8', textFx: 'note-rain',  shake: false },
  12:  { type: 'coin',          color: '#fbbf24', particle: 'ring',   tint: '#b45309', textFx: 'clink',      shake: false },
  13:  { type: 'shadow-dance',  color: '#475569', particle: 'dot',    tint: '#1e293b', textFx: 'sway',       shake: false },
  14:  { type: 'firework',      color: '#f472b6', particle: 'spark',  tint: '#be185d', textFx: 'burst',      shake: true },
  15:  { type: 'gold',          color: '#fbbf24', particle: 'ring',   tint: '#b45309', textFx: 'shimmer',    shake: false },
  16:  { type: 'gem',           color: '#22d3ee', particle: 'dot',    tint: '#0c4a6e', textFx: 'sparkle',    shake: false },
  17:  { type: 'echo',          color: '#c084fc', particle: 'note',   tint: '#6b21a8', textFx: 'repeat',     shake: false },
  18:  { type: 'starlight',     color: '#818cf8', particle: 'star',   tint: '#3730a3', textFx: 'twinkle',    shake: false },
  19:  { type: 'chameleon',     color: '#4ade80', particle: 'spark',  tint: '#15803d', textFx: 'shift',      shake: false },
  20:  { type: 'breeze',        color: '#22d3ee', particle: 'dot',    tint: '#0c4a6e', textFx: 'swirl',      shake: false },

  // 21-40: saga20 moderate — visible magical effects
  21:  { type: 'mimic',         color: '#c084fc', particle: 'note',   tint: '#6b21a8', textFx: 'warble',     shake: false },
  22:  { type: 'rune',          color: '#818cf8', particle: 'spark',  tint: '#3730a3', textFx: 'glow-rune',  shake: false },
  23:  { type: 'yawn-bolt',     color: '#fbbf24', particle: 'ember',  tint: '#b45309', textFx: 'zap',        shake: true },
  24:  { type: 'drum',          color: '#fbbf24', particle: 'spark',  tint: '#b45309', textFx: 'thump',      shake: true },
  25:  { type: 'copper',        color: '#fbbf24', particle: 'ring',   tint: '#b45309', textFx: 'tinge',      shake: false },
  26:  { type: 'blink',         color: '#818cf8', particle: 'spark',  tint: '#3730a3', textFx: 'blink',      shake: true },
  27:  { type: 'fire-resist',   color: '#f97316', particle: 'ember',  tint: '#9a3412', textFx: 'ember-aura', shake: false },
  28:  { type: 'fog',           color: '#e2e8f0', particle: 'blob',   tint: '#334155', textFx: 'mist',       shake: false },
  29:  { type: 'heal-green',    color: '#4ade80', particle: 'leaf',   tint: '#15803d', textFx: 'pulse-green',shake: false },
  30:  { type: 'grow',          color: '#22d3ee', particle: 'ring',   tint: '#0c4a6e', textFx: 'stretch',    shake: false },
  31:  { type: 'disadvantage',  color: '#fb923c', particle: 'spark',  tint: '#c2410c', textFx: 'weaken',     shake: false },
  32:  { type: 'see-invis',     color: '#818cf8', particle: 'star',   tint: '#3730a3', textFx: 'reveal',     shake: false },
  33:  { type: 'shield',        color: '#22d3ee', particle: 'ring',   tint: '#0c4a6e', textFx: 'barrier',    shake: false },
  34:  { type: 'levitate',      color: '#c084fc', particle: 'dot',    tint: '#6b21a8', textFx: 'float',      shake: false },
  35:  { type: 'thunder',       color: '#fbbf24', particle: 'spark',  tint: '#b45309', textFx: 'crack',      shake: true },
  36:  { type: 'darkvision',    color: '#475569', particle: 'dot',    tint: '#1e293b', textFx: 'night-sight',shake: false },
  37:  { type: 'double',        color: '#818cf8', particle: 'spark',  tint: '#3730a3', textFx: 'mirror',     shake: false },
  38:  { type: 'fearless',      color: '#4ade80', particle: 'leaf',   tint: '#15803d', textFx: 'steady',     shake: false },
  39:  { type: 'speed',         color: '#22d3ee', particle: 'dot',    tint: '#0c4a6e', textFx: 'rush',       shake: false },
  40:  { type: 'door-slam',     color: '#fb923c', particle: 'spark',  tint: '#c2410c', textFx: 'slam',       shake: true },

  // 41-60: saga20 moderate — continued
  41:  { type: 'detect-magic',  color: '#818cf8', particle: 'spark',  tint: '#3730a3', textFx: 'aura-scan',   shake: false },
  42:  { type: 'heal-other',    color: '#4ade80', particle: 'leaf',   tint: '#15803d', textFx: 'share-heal',  shake: false },
  43:  { type: 'proficiency',   color: '#fbbf24', particle: 'ring',   tint: '#b45309', textFx: 'master',      shake: false },
  44:  { type: 'gravity-flip',  color: '#c084fc', particle: 'dot',    tint: '#6b21a8', textFx: 'upend',       shake: true },
  45:  { type: 'force-strike',  color: '#818cf8', particle: 'spark',  tint: '#3730a3', textFx: 'strike',      shake: true },
  46:  { type: 'extinguish',    color: '#22d3ee', particle: 'dot',    tint: '#0c4a6e', textFx: 'snuff',       shake: false },
  47:  { type: 'antlers',       color: '#4ade80', particle: 'leaf',   tint: '#15803d', textFx: 'crown',       shake: false },
  48:  { type: 'temp-hp',       color: '#4ade80', particle: 'spark',  tint: '#15803d', textFx: 'bolster',     shake: false },
  49:  { type: 'frost-ground',  color: '#22d3ee', particle: 'dot',    tint: '#0c4a6e', textFx: 'ice-spread',  shake: false },
  50:  { type: 'thoughts',      color: '#c084fc', particle: 'note',   tint: '#6b21a8', textFx: 'mind-read',   shake: false },
  51:  { type: 'weapon-glow',   color: '#fbbf24', particle: 'ember',  tint: '#b45309', textFx: 'ignite',      shake: false },
  52:  { type: 'spectral-hand', color: '#94a3b8', particle: 'dot',    tint: '#475569', textFx: 'reach',       shake: false },
  53:  { type: 'cold-resist',   color: '#22d3ee', particle: 'dot',    tint: '#0c4a6e', textFx: 'frost-aura',  shake: false },
  54:  { type: 'shrink',        color: '#22d3ee', particle: 'ring',   tint: '#0c4a6e', textFx: 'diminish',    shake: false },
  55:  { type: 'silence-voice', color: '#475569', particle: 'dot',    tint: '#1e293b', textFx: 'mute',        shake: false },
  56:  { type: 'heal-push',     color: '#4ade80', particle: 'leaf',   tint: '#15803d', textFx: 'surge-heal',  shake: true },
  57:  { type: 'translucent',   color: '#94a3b8', particle: 'dot',    tint: '#475569', textFx: 'fade',        shake: false },
  58:  { type: 'static',        color: '#22d3ee', particle: 'spark',  tint: '#0c4a6e', textFx: 'zap-aura',    shake: false },
  59:  { type: 'read-all',      color: '#c084fc', particle: 'note',   tint: '#6b21a8', textFx: 'comprehend',  shake: false },
  60:  { type: 'phantom-wind',  color: '#22d3ee', particle: 'dot',    tint: '#0c4a6e', textFx: 'howl',        shake: true },

  // 61-85: saga20 dramatic — intense effects
  61:  { type: 'fireball-3',    color: '#f97316', particle: 'ember',  tint: '#9a3412', textFx: 'explode',     shake: true },
  62:  { type: 'sheep',         color: '#f472b6', particle: 'spark',  tint: '#be185d', textFx: 'morph-sheep',  shake: true },
  63:  { type: 'teleport-60',   color: '#818cf8', particle: 'spark',  tint: '#3730a3', textFx: 'warp',         shake: true },
  64:  { type: 'spectral-beast',color: '#fb923c', particle: 'spark',  tint: '#c2410c', textFx: 'summon-beast', shake: true },
  65:  { type: 'invisibility',  color: '#94a3b8', particle: 'dot',    tint: '#475569', textFx: 'vanish',       shake: false },
  66:  { type: 'age',           color: '#fbbf24', particle: 'dot',    tint: '#b45309', textFx: 'wrinkle',      shake: false },
  67:  { type: 'gravity-reverse',color: '#c084fc', particle: 'dot',   tint: '#6b21a8', textFx: 'fall-up',      shake: true },
  68:  { type: 'blinding-flash',color: '#fde047', particle: 'star',   tint: '#b45309', textFx: 'flash-blind',  shake: true },
  69:  { type: 'slot-drain',    color: '#475569', particle: 'dot',    tint: '#1e293b', textFx: 'drain',        shake: false },
  70:  { type: 'pit',           color: '#475569', particle: 'dot',    tint: '#1e293b', textFx: 'collapse',     shake: true },
  71:  { type: 'confusion',     color: '#f472b6', particle: 'spark',  tint: '#be185d', textFx: 'scramble',     shake: true },
  72:  { type: 'max-hp-drain',  color: '#f87171', particle: 'dot',    tint: '#991b1b', textFx: 'weaken-hp',    shake: false },
  73:  { type: 'sorcery-return',color: '#4ade80', particle: 'leaf',   tint: '#15803d', textFx: 'replenish',    shake: false },
  74:  { type: 'vines',         color: '#4ade80', particle: 'leaf',   tint: '#15803d', textFx: 'entangle',     shake: true },
  75:  { type: 'lightning-bolt',color: '#22d3ee', particle: 'spark',  tint: '#0c4a6e', textFx: 'strike-bolt',  shake: true },
  76:  { type: 'ethereal',      color: '#818cf8', particle: 'dot',    tint: '#3730a3', textFx: 'phase',        shake: false },
  77:  { type: 'heal-wave',     color: '#4ade80', particle: 'leaf',   tint: '#15803d', textFx: 'wave-heal',    shake: false },
  78:  { type: 'launch-up',     color: '#22d3ee', particle: 'dot',    tint: '#0c4a6e', textFx: 'launch',       shake: true },
  79:  { type: 'living-flame',  color: '#f97316', particle: 'ember',  tint: '#9a3412', textFx: 'burn-body',    shake: true },
  80:  { type: 'silence-zone',  color: '#475569', particle: 'dot',    tint: '#1e293b', textFx: 'hush',         shake: false },
  81:  { type: 'empower-spell', color: '#818cf8', particle: 'spark',  tint: '#3730a3', textFx: 'empower',      shake: false },
  82:  { type: 'red-hot-metal', color: '#f97316', particle: 'ember',  tint: '#9a3412', textFx: 'heat-metal',   shake: true },
  83:  { type: 'tidal-wave',    color: '#22d3ee', particle: 'blob',   tint: '#0c4a6e', textFx: 'tsunami',      shake: true },
  84:  { type: 'static-crackle',color: '#22d3ee', particle: 'spark',  tint: '#0c4a6e', textFx: 'static-aura',  shake: false },
  85:  { type: 'swap-positions',color: '#818cf8', particle: 'spark',  tint: '#3730a3', textFx: 'swap',         shake: true },

  // 86-100: saga20 catastrophic — world-shaking
  86:  { type: 'fireball-5',    color: '#f87171', particle: 'ember',  tint: '#991b1b', textFx: 'detonate',     shake: true },
  87:  { type: 'petrify',       color: '#94a3b8', particle: 'dot',    tint: '#475569', textFx: 'stone',        shake: true },
  88:  { type: 'antimagic',     color: '#475569', particle: 'dot',    tint: '#1e293b', textFx: 'null-magic',   shake: true },
  89:  { type: 'plane-shift',   color: '#c084fc', particle: 'spark',  tint: '#6b21a8', textFx: 'rift',         shake: true },
  90:  { type: 'force-damage',  color: '#818cf8', particle: 'spark',  tint: '#3730a3', textFx: 'crush',        shake: true },
  91:  { type: 'lose-spells',   color: '#f87171', particle: 'dot',    tint: '#991b1b', textFx: 'sever',        shake: true },
  92:  { type: 'elemental',     color: '#f97316', particle: 'ember',  tint: '#9a3412', textFx: 'summon-elem',  shake: true },
  93:  { type: 'contagious',    color: '#f472b6', particle: 'spark',  tint: '#be185d', textFx: 'infect',       shake: true },
  94:  { type: 'de-age',        color: '#fbbf24', particle: 'dot',    tint: '#b45309', textFx: 'regress',      shake: false },
  95:  { type: 'gear-scatter',  color: '#fbbf24', particle: 'ring',   tint: '#b45309', textFx: 'scatter',      shake: true },
  96:  { type: 'earthquake',    color: '#7f1d1d', particle: 'dot',    tint: '#450a0a', textFx: 'quake',        shake: true },
  97:  { type: 'wall-of-fire',  color: '#f97316', particle: 'ember',  tint: '#9a3412', textFx: 'wall-flame',   shake: true },
  98:  { type: 'banish',        color: '#c084fc', particle: 'spark',  tint: '#6b21a8', textFx: 'exile',        shake: true },
  99:  { type: 'double-surge',  color: '#f87171', particle: 'spark',  tint: '#991b1b', textFx: 'chain',        shake: true },
  100: { type: 'arcane-detonation',color: '#f87171', particle: 'ember', tint: '#991b1b', textFx: 'nuke',       shake: true },

  // 101-118: phb2024 — mixed
  101: { type: 'third-eye',     color: '#c084fc', particle: 'dot',    tint: '#6b21a8', textFx: 'eye-open',     shake: false },
  102: { type: 'quick-cast',    color: '#818cf8', particle: 'spark',  tint: '#3730a3', textFx: 'haste',        shake: false },
  103: { type: 'astral',        color: '#818cf8', particle: 'spark',  tint: '#3730a3', textFx: 'astral-drift', shake: true },
  104: { type: 'potted-plant',  color: '#4ade80', particle: 'leaf',   tint: '#15803d', textFx: 'pot-plant',    shake: true },
  105: { type: 'bonus-teleport',color: '#818cf8', particle: 'spark',  tint: '#3730a3', textFx: 'blink-step',   shake: false },
  106: { type: 'levitate',      color: '#c084fc', particle: 'dot',    tint: '#6b21a8', textFx: 'float-up',     shake: false },
  107: { type: 'unicorn',       color: '#f472b6', particle: 'spark',  tint: '#be185d', textFx: 'unicorn',      shake: false },
  108: { type: 'pink-bubbles',  color: '#f472b6', particle: 'blob',   tint: '#be185d', textFx: 'bubbles',      shake: false },
  109: { type: 'sorcery-return',color: '#4ade80', particle: 'leaf',   tint: '#15803d', textFx: 'replenish',    shake: false },
  110: { type: 'enlarge',       color: '#fbbf24', particle: 'ring',   tint: '#b45309', textFx: 'grow-large',   shake: true },
  111: { type: 'polymorph',     color: '#f472b6', particle: 'spark',  tint: '#be185d', textFx: 'morph-sheep',  shake: true },
  112: { type: 'spectral-shield',color: '#22d3ee', particle: 'ring',  tint: '#0c4a6e', textFx: 'ward',         shake: false },
  113: { type: 'sober',         color: '#22d3ee', particle: 'dot',    tint: '#0c4a6e', textFx: 'clear-head',   shake: false },
  114: { type: 'see-invis',     color: '#818cf8', particle: 'star',   tint: '#3730a3', textFx: 'true-sight',   shake: false },
  115: { type: 'sorcery-return2',color: '#4ade80', particle: 'leaf',  tint: '#15803d', textFx: 'replenish2',   shake: false },
  116: { type: 'reincarnate',   color: '#f472b6', particle: 'spark',  tint: '#be185d', textFx: 'rebirth',      shake: true },
  117: { type: 'piercing-vuln', color: '#f87171', particle: 'dot',    tint: '#991b1b', textFx: 'fragile',      shake: false },
  118: { type: 'ethereal-music',color: '#c084fc', particle: 'note',   tint: '#6b21a8', textFx: 'celestial',    shake: false },
};

function getEntryAnimation(entryId) {
  return ENTRY_ANIMATIONS[entryId] || {
    type: 'magic', color: '#c8b6ff', particle: 'spark', tint: '#5b21b6', textFx: 'glow', shake: false,
  };
}

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
      {anim.type === 'teleport-60' || anim.type === 'blink' || anim.type === 'warp' || anim.type === 'bonus-teleport' || (
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

  const filteredEntries = entries.filter((e) => {
    if (activeVersion === 'all') return true;
    if (activeVersion === 'd100') return e.source === 'saga20';
    if (activeVersion === 'phb2024') return e.source === 'phb2024';
    if (activeVersion === 'homebrew') return e.source === 'magitrix' || e.source === 'custom';
    return true;
  });

  const handleRoll = async () => {
    if (filteredEntries.length === 0) return;
    setRolling(true);
    setResult(null);
    setShowSparkles(false);

    // Dramatic roll buildup — 1.5 seconds of energy building
    await new Promise(r => setTimeout(r, 1500));
    const entry = rollSurge(filteredEntries, manualOverrideId);
    if (entry) {
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
      {result && <FullScreenEffect entryId={result.id} />}

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
