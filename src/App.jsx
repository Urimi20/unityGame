import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import URL_FOTOS from "../image.png";
import {
  AGE_GROUPS,
  MAX_WORD_ATTEMPTS,
  MEMORY_DIFFICULTIES,
  WORD_GUESS_LEVELS,
} from "./data/gameData";
import {
  fetchUsers,
  getOrCreateUser,
  saveUser,
  sortUsersByScore,
} from "./services/userApi";
import {
  calculateMemoryFinalScore,
  calculateWordPoints,
  createMemoryDeck,
  evaluateWordGuess,
  formatTime,
  getAttemptsRemaining,
  filterUsersByAgeGroup,
  getUnlockedWordLevel,
  getWordLevel,
  normalizeCompletedLevels,
  sanitizeUsername,
  sortLevels,
} from "./utils/gameUtils";

const features = [
  {
    icon: "RX",
    title: "Fast Reflex Gameplay",
    description:
      "Dodge neon hazards in a rapid-fire survival loop tuned for instant reactions.",
  },
  {
    icon: "WG",
    title: "Word Guess Levels",
    description:
      "Solve ten extendable Wordle-style stages and unlock each next word automatically.",
  },
  {
    icon: "MM",
    title: "Memory Match",
    description:
      "Flip cards, chain matches, and chase a sharper best score across three difficulties.",
  },
];

const landingGameModes = [
  {
    code: "RUN",
    title: "Code Rush",
    description:
      "The original survival arena with shields, hazards, and score chasing.",
  },
  {
    code: "WORD",
    title: "Word Guess",
    description:
      "A ten-level hidden-word challenge with Wordle-style feedback.",
  },
  {
    code: "MATCH",
    title: "Memory Match",
    description:
      "A card matching game with score, moves, timer, and difficulty tiers.",
  },
];

const playSteps = [
  "Enter a username to create or load an API-backed profile.",
  "Choose Code Rush, Word Guess, or Memory Match from the game hub.",
  "Finish levels and matches to save progress, score, and last played time.",
];

const gameViewByAgeGroup = {
  "6-11": "playing",
  "12-15": "word",
  "16+": "memory",
};

const getAgeGroup = (ageGroup) =>
  AGE_GROUPS.find((group) => group.key === ageGroup) ?? AGE_GROUPS[0];

const scrollToId = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#050810]">
      <div className="relative flex flex-col items-center gap-6">
        <div className="loader-orbit">
          <span />
          <span />
          <span />
        </div>
        <div className="text-center">
          <p className="font-orbitron text-sm uppercase tracking-[0.45em] text-cyan-200">
            Initializing Arena
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/45">
            Unity Code Rush
          </p>
        </div>
      </div>
    </div>
  );
}

function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        id: i,
        "--left": `${Math.random() * 100}%`,
        "--top": `${Math.random() * 100}%`,
        "--delay": `${Math.random() * 4}s`,
        "--duration": `${2 + Math.random() * 4}s`,
        "--size": `${1 + Math.random() * 2.5}px`,
      })),
    [],
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,245,255,0.16),transparent_30%),radial-gradient(circle_at_80%_15%,rgba(255,178,77,0.12),transparent_25%),radial-gradient(circle_at_50%_90%,rgba(82,255,168,0.08),transparent_35%)]" />
      <div className="absolute inset-0 cyber-grid" />
      {stars.map((star) => (
        <span className="star-particle" key={star.id} style={star} />
      ))}
    </div>
  );
}

function Navbar({ onPlay }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-cyan-300/10 bg-[#050810]/45 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <button
          className="group flex items-center gap-3"
          onClick={() => scrollToId("home")}
          type="button"
          aria-label="Unity Code Rush home"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full border border-cyan-300/50 bg-cyan-300/10 shadow-[0_0_25px_rgba(0,245,255,.35)]">
            <img
              src={URL_FOTOS}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          </span>
          <span className="font-orbitron text-sm font-black uppercase tracking-[0.25em] text-white group-hover:text-cyan-200">
            UCR
          </span>
        </button>
        <div className="hidden items-center gap-8 md:flex">
          {[
            ["Home", "home"],
            ["Games", "games"],
            ["How to Play", "instructions"],
            ["Leaderboard", "leaderboard"],
          ].map(([label, id]) => (
            <button
              className="nav-link"
              key={id}
              onClick={() => scrollToId(id)}
              type="button"
            >
              {label}
            </button>
          ))}
          <button
            className="neon-button neon-button-sm"
            onClick={onPlay}
            type="button"
          >
            Play
          </button>
        </div>
      </nav>
    </header>
  );
}

function HeroSection({ onPlay }) {
  return (
    <section
      id="home"
      className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 pb-20 pt-32 lg:grid-cols-[1.05fr_.95fr] lg:px-8"
    >
      <div className="section-reveal relative z-10">
        <div className="mb-6 inline-flex rounded-full border border-cyan-300/25 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-200 shadow-[0_0_35px_rgba(0,245,255,.12)] backdrop-blur-xl">
          Anniversary Launch Arena
        </div>
        <h1 className="font-orbitron text-5xl font-black uppercase leading-none tracking-tight text-white sm:text-7xl lg:text-8xl">
          <span className="neon-title block">Unity</span>
          <span className="neon-title-purple block">Code Rush</span>
        </h1>
        <p className="mt-6 max-w-2xl text-xl font-semibold text-cyan-50/80 sm:text-2xl">
          Three game modes. One live API leaderboard.
        </p>
        <p className="mt-5 max-w-xl text-base leading-8 text-slate-300/75">
          Enter the neon hub, play reflex, word, and memory challenges, and keep
          every score synced to your profile.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button className="neon-button" onClick={onPlay} type="button">
            Open Game Hub
          </button>
          <button
            className="neon-button neon-button-purple"
            onClick={() => scrollToId("leaderboard")}
            type="button"
          >
            View Leaderboard
          </button>
        </div>
      </div>
      <div className="section-reveal relative z-10 flex justify-center lg:justify-end">
        <div className="hero-orb-wrap">
          <div className="hero-orb-ring" />
          <div className="hero-orb">
            <img
              src={URL_FOTOS}
              alt="Unity Code Rush logo"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <div className="floating-chip chip-one">API SYNC</div>
          <div className="floating-chip chip-two">3 MODES</div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8"
    >
      <div className="section-heading">
        <p className="eyebrow">Combat Systems</p>
        <h2>Designed for speed, logic, memory, and bragging rights.</h2>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {features.map((feature, index) => (
          <article
            className="glass-card section-reveal"
            key={feature.title}
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <div className="neon-icon">{feature.icon}</div>
            <h3 className="mt-6 font-orbitron text-xl font-black text-white">
              {feature.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-300/75">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function GameModesSection({ onPlay }) {
  return (
    <section
      id="games"
      className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8"
    >
      <div className="section-heading">
        <p className="eyebrow">Game Hub</p>
        <h2>Pick a mode and build your profile score.</h2>
      </div>
      <div className="mode-preview-grid mt-12">
        {landingGameModes.map((mode) => (
          <article className="mode-preview" key={mode.title}>
            <span>{mode.code}</span>
            <h3>{mode.title}</h3>
            <p>{mode.description}</p>
          </article>
        ))}
      </div>
      <div className="mt-10 text-center">
        <button className="neon-button" onClick={onPlay} type="button">
          Start Playing
        </button>
      </div>
    </section>
  );
}

function HowToPlaySection() {
  return (
    <section
      id="instructions"
      className="relative mx-auto max-w-6xl px-5 py-20 lg:px-8"
    >
      <div className="section-heading">
        <p className="eyebrow">Join and Play</p>
        <h2>Fast entry, persistent progress.</h2>
      </div>
      <ol className="play-steps mt-12">
        {playSteps.map((step, index) => (
          <li key={step}>
            <span>{index + 1}</span>
            <p>{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function GamePreview({ onPlay }) {
  return (
    <section
      id="preview"
      className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
        <div className="section-reveal">
          <p className="eyebrow">Gameplay Preview</p>
          <h2 className="mt-3 font-orbitron text-4xl font-black uppercase text-white sm:text-5xl">
            The arena never slows down.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300/75">
            Slip through falling blocks, charge your shield, and keep your
            cursor locked in the neon storm.
          </p>
          <button className="neon-button mt-8" onClick={onPlay} type="button">
            Enter Hub
          </button>
        </div>
        <div className="preview-frame section-reveal">
          <div className="preview-screen">
            <div className="preview-hud">
              <span>UCR / ARENA-01</span>
              <span>842</span>
            </div>
            <div className="preview-player">
              <img src={URL_FOTOS} alt="Player avatar" />
            </div>
            <span className="preview-block block-a" />
            <span className="preview-block block-b" />
            <span className="preview-block block-c" />
            <span className="preview-shield" />
            <div className="preview-scanline" />
          </div>
        </div>
      </div>
    </section>
  );
}

function LeaderboardTable({ users, loading, error, maxRows = 10 }) {
  const rows = users.slice(0, maxRows);

  if (loading) {
    return <div className="leaderboard-empty">Syncing leaderboard...</div>;
  }

  if (error) {
    return <div className="leaderboard-empty error">{error}</div>;
  }

  if (rows.length === 0) {
    return <div className="leaderboard-empty">No scores saved yet.</div>;
  }

  return (
    <table className="live-leaderboard-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Nickname</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((player, index) => {
          const displayName = player.nickname || player.username || "Player";
          return (
            <tr className="leaderboard-row" key={player.id || displayName}>
              <td>
                <span className="rank-badge">#{index + 1}</span>
              </td>
              <td className="player-name">{displayName}</td>
              <td className="player-score">{player.score}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function AgeGroupLeaderboard({
  leaderboard,
  loading,
  error,
  maxRows = 10,
  defaultAgeGroup = AGE_GROUPS[0].key,
  onRefreshLeaderboard,
}) {
  const [activeAgeGroup, setActiveAgeGroup] = useState(defaultAgeGroup);

  useEffect(() => {
    setActiveAgeGroup(defaultAgeGroup);
  }, [defaultAgeGroup]);

  const activeGroup = getAgeGroup(activeAgeGroup);
  const filteredLeaderboard = useMemo(
    () => filterUsersByAgeGroup(leaderboard, activeGroup.key),
    [leaderboard, activeGroup.key],
  );

  return (
    <>
      <div className="leaderboard-toolbar">
        <span>
          {activeGroup.tabLabel} / {activeGroup.game}
        </span>
        <button
          className="mini-action"
          onClick={onRefreshLeaderboard}
          type="button"
        >
          Refresh
        </button>
      </div>
      <div className="difficulty-tabs leaderboard-age-tabs">
        {AGE_GROUPS.map((group) => (
          <button
            className={group.key === activeGroup.key ? "active" : ""}
            key={group.key}
            onClick={() => setActiveAgeGroup(group.key)}
            type="button"
          >
            {group.tabLabel}
          </button>
        ))}
      </div>
      <LeaderboardTable
        users={filteredLeaderboard}
        loading={loading}
        error={error}
        maxRows={maxRows}
      />
    </>
  );
}

function LeaderboardSection({
  leaderboard,
  loading,
  error,
  onRefreshLeaderboard,
}) {
  return (
    <section
      id="leaderboard"
      className="relative mx-auto max-w-5xl px-5 py-20 lg:px-8"
    >
      <div className="section-heading">
        <p className="eyebrow">Live Leaderboard</p>
        <h2>Top pilots in the neon rush.</h2>
      </div>
      <div className="leaderboard-shell mt-12">
        <AgeGroupLeaderboard
          leaderboard={leaderboard}
          loading={loading}
          error={error}
          onRefreshLeaderboard={onRefreshLeaderboard}
        />
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="relative mx-auto max-w-5xl px-5 py-20 text-center lg:px-8">
      <div className="glass-card section-reveal">
        <p className="eyebrow">Unity Tech Hub</p>
        <h2 className="mt-3 font-orbitron text-4xl font-black uppercase text-white sm:text-5xl">
          Built for Unity Tech Hub Anniversary
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300/75">
          Unity Code Rush celebrates the energy of the community with a
          futuristic mini-game hub made for quick matches, live-event
          competition, and persistent player progress.
        </p>
      </div>
    </section>
  );
}

function FinalCta({ onPlay }) {
  return (
    <section className="relative px-5 py-24">
      <div className="cta-panel mx-auto max-w-6xl text-center">
        <p className="eyebrow">Final Gate</p>
        <h2 className="mt-3 font-orbitron text-4xl font-black uppercase text-white sm:text-6xl">
          Ready to enter the hub?
        </h2>
        <button className="neon-button mt-10" onClick={onPlay} type="button">
          Start Playing
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-cyan-300/10 px-5 py-10 text-center text-sm text-slate-400">
      <p>2026 Unity Code Rush. Built for Unity Tech Hub Anniversary.</p>
    </footer>
  );
}

function LandingPage({
  onPlay,
  leaderboard,
  leaderboardLoading,
  leaderboardError,
  onRefreshLeaderboard,
}) {
  return (
    <main className="landing-shell">
      <Stars />
      <Navbar onPlay={onPlay} />
      <HeroSection onPlay={onPlay} />
      <FeaturesSection />
      <GameModesSection onPlay={onPlay} />
      <HowToPlaySection />
      <GamePreview onPlay={onPlay} />
      <LeaderboardSection
        leaderboard={leaderboard}
        loading={leaderboardLoading}
        error={leaderboardError}
        onRefreshLeaderboard={onRefreshLeaderboard}
      />
      <AboutSection />
      <FinalCta onPlay={onPlay} />
      <Footer />
    </main>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="stat-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ActionError({ message }) {
  if (!message) return null;
  return <div className="action-error">{message}</div>;
}

function GameEngine({ onGameEnd }) {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const logoRef = useRef(null);
  const playerRef = useRef({ x: 200, y: 500, radius: 22, hasShield: false });
  const obstaclesRef = useRef([]);
  const powerUpsRef = useRef([]);
  const particlesRef = useRef([]);
  const starsRef = useRef(
    Array.from({ length: 50 }, () => ({
      x: Math.random() * 400,
      y: Math.random() * 600,
      size: Math.random() * 2,
      speed: 2 + Math.random() * 3,
    })),
  );
  const frameCountRef = useRef(0);
  const difficultyRef = useRef(1.6);
  const scoreRef = useRef(0);
  const isDeadRef = useRef(false);
  const [currentScore, setCurrentScore] = useState(0);

  const W = 400;
  const H = 600;

  useEffect(() => {
    const img = new Image();
    img.src = URL_FOTOS;
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  const createExplosion = (x, y, color) => {
    for (let i = 0; i < 15; i += 1) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        radius: Math.random() * 3,
        life: 1.0,
        color,
      });
    }
  };

  const spawnObstacle = useCallback(() => {
    const size = 25 + Math.random() * 25;
    obstaclesRef.current.push({
      x: Math.random() * (W - size) + size / 2,
      y: -size,
      size,
      speedY: (4.5 + Math.random() * 3) * difficultyRef.current,
      speedX: (Math.random() - 0.5) * 2,
      color: ["#ff6b81", "#ffd32a", "#52ffa8", "#ff4757"][
        Math.floor(Math.random() * 4)
      ],
    });

    if (Math.random() < 0.04) {
      powerUpsRef.current.push({
        x: Math.random() * (W - 40) + 20,
        y: -40,
        size: 20,
        speedY: 3,
      });
    }
  }, []);

  const update = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#050810";
    ctx.fillRect(0, 0, W, H);

    starsRef.current.forEach((star) => {
      ctx.fillStyle = "#fff";
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      if (!isDeadRef.current) star.y += star.speed;
      if (star.y > H) star.y = 0;
    });
    ctx.globalAlpha = 1;

    particlesRef.current.forEach((part, i) => {
      part.x += part.vx;
      part.y += part.vy;
      part.life -= 0.025;
      ctx.globalAlpha = part.life;
      ctx.fillStyle = part.color;
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.radius, 0, Math.PI * 2);
      ctx.fill();
      if (part.life <= 0) particlesRef.current.splice(i, 1);
    });
    ctx.globalAlpha = 1;

    const p = playerRef.current;

    if (!isDeadRef.current) {
      frameCountRef.current += 1;
      scoreRef.current += 0.2;
      if (frameCountRef.current % 5 === 0) {
        setCurrentScore(Math.floor(scoreRef.current));
      }
      if (frameCountRef.current % 180 === 0) difficultyRef.current += 0.2;
      if (frameCountRef.current % 25 === 0) spawnObstacle();

      if (logoRef.current) {
        ctx.save();
        if (p.hasShield) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = "#00d2ff";
          ctx.strokeStyle = "#00d2ff";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius + 4, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          logoRef.current,
          p.x - p.radius,
          p.y - p.radius,
          p.radius * 2,
          p.radius * 2,
        );
        ctx.restore();
      }
    }

    for (let i = powerUpsRef.current.length - 1; i >= 0; i -= 1) {
      const powerUp = powerUpsRef.current[i];
      powerUp.y += powerUp.speedY;
      ctx.fillStyle = "#00d2ff";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00d2ff";
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, powerUp.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (
        !isDeadRef.current &&
        Math.hypot(p.x - powerUp.x, p.y - powerUp.y) <
          p.radius + powerUp.size / 2
      ) {
        p.hasShield = true;
        powerUpsRef.current.splice(i, 1);
      }
      if (powerUp.y > H + 50) powerUpsRef.current.splice(i, 1);
    }

    for (let i = obstaclesRef.current.length - 1; i >= 0; i -= 1) {
      const obstacle = obstaclesRef.current[i];
      if (!isDeadRef.current) {
        obstacle.y += obstacle.speedY;
        obstacle.x += obstacle.speedX;
      }

      ctx.fillStyle = obstacle.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = obstacle.color;
      ctx.beginPath();
      ctx.roundRect(
        obstacle.x - obstacle.size / 2,
        obstacle.y - obstacle.size / 2,
        obstacle.size,
        obstacle.size,
        6,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      if (
        !isDeadRef.current &&
        Math.hypot(p.x - obstacle.x, p.y - obstacle.y) <
          p.radius + obstacle.size * 0.45
      ) {
        if (p.hasShield) {
          p.hasShield = false;
          createExplosion(obstacle.x, obstacle.y, "#00d2ff");
          obstaclesRef.current.splice(i, 1);
        } else {
          isDeadRef.current = true;
          createExplosion(p.x, p.y, "#ff4757");
          setTimeout(() => onGameEnd(Math.floor(scoreRef.current)), 1200);
        }
      }
      if (obstacle.y > H + 50) obstaclesRef.current.splice(i, 1);
    }

    if (!isDeadRef.current || particlesRef.current.length > 0) {
      requestRef.current = requestAnimationFrame(update);
    }
  }, [onGameEnd, spawnObstacle]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  const handleInput = (event) => {
    if (isDeadRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = event.touches?.[0];
    const clientX = touch ? touch.clientX : event.clientX;
    const clientY = touch ? touch.clientY : event.clientY;
    playerRef.current.x = (clientX - rect.left) * (W / rect.width);
    playerRef.current.y = (clientY - rect.top) * (H / rect.height);
  };

  return (
    <div className="game-engine-wrap">
      <div className="urimi-banner">
        <img src={URL_FOTOS} alt="Logo" />
        <div>
          <b>Unity Tech Hub - Anniversary</b>
          <br />
          <small>Collect blue shields to survive</small>
        </div>
      </div>
      <div className="game-canvas-shell">
        <div className="game-score">{currentScore}</div>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onMouseMove={handleInput}
          onTouchMove={(event) => {
            event.preventDefault();
            handleInput(event);
          }}
        />
      </div>
    </div>
  );
}

function IntroScreen({
  username,
  onUsernameChange,
  onLogin,
  onLanding,
  loading,
  error,
}) {
  return (
    <form onSubmit={onLogin} className="glass-panel game-screen">
      <button className="back-link" onClick={onLanding} type="button">
        Back to Landing
      </button>
      <img src={URL_FOTOS} alt="" className="game-logo" />
      <h1 className="game-title">
        Unity <span>Code Rush</span>
      </h1>
      <p className="portal-copy">
        Your username loads a profile from the game API or creates one.
      </p>
      <input
        className="game-input"
        placeholder="Enter username..."
        value={username}
        onChange={(event) => onUsernameChange(event.target.value)}
        disabled={loading}
        required
      />
      <button
        type="submit"
        className="neon-btn btn-cyan game-button"
        disabled={loading}
      >
        {loading ? "Loading profile..." : "Enter Game Hub"}
      </button>
      <ActionError message={error} />
    </form>
  );
}

function AgeGroupSelection({ onSelectAgeGroup, selectingAgeGroup }) {
  return (
    <section aria-labelledby="age-group-title">
      <div className="dashboard-age-heading">
        <p className="eyebrow" id="age-group-title">
          Zgjidh Grupmoshën
        </p>
      </div>
      <div className="mode-grid">
        {AGE_GROUPS.map((group) => {
          const cardClass =
            group.key === "12-15"
              ? "mode-card word"
              : group.key === "16+"
                ? "mode-card memory"
                : "mode-card";
          return (
            <button
              className={cardClass}
              disabled={Boolean(selectingAgeGroup)}
              key={group.key}
              onClick={() => onSelectAgeGroup(group.key)}
              type="button"
            >
              <span>{group.tabLabel}</span>
              <strong>{group.game}</strong>
              <small>
                {selectingAgeGroup === group.key
                  ? "Loading game..."
                  : group.gameTagline}
              </small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Dashboard({
  user,
  leaderboard,
  leaderboardLoading,
  leaderboardError,
  onSelectAgeGroup,
  selectingAgeGroup,
  onOpenLeaderboard,
  onLogout,
  onLanding,
  onRefreshLeaderboard,
}) {
  const completedLevels = normalizeCompletedLevels(user.completedWordleLevels);
  const unlockedLevel = getUnlockedWordLevel(completedLevels);

  return (
    <div className="glass-panel portal-layout">
      <div className="portal-topbar">
        <button className="small-ghost" onClick={onLanding} type="button">
          Landing
        </button>
        <div>
          <p className="eyebrow">Game Hub</p>
          <h2 className="game-greeting">
            Hello, <span>{user.username}</span>
          </h2>
        </div>
        <button className="small-ghost danger" onClick={onLogout} type="button">
          Change Player
        </button>
      </div>

      <div className="stat-grid">
        <StatPill label="Score" value={user.score} />
        <StatPill
          label="Word Levels"
          value={`${completedLevels.length}/${WORD_GUESS_LEVELS.length}`}
        />
        <StatPill label="Next Word Level" value={unlockedLevel} />
        <StatPill label="Memory Best" value={user.memoryGameBestScore} />
      </div>

      <AgeGroupSelection
        onSelectAgeGroup={onSelectAgeGroup}
        selectingAgeGroup={selectingAgeGroup}
      />

      <section className="portal-section">
        <AgeGroupLeaderboard
          leaderboard={leaderboard}
          loading={leaderboardLoading}
          error={leaderboardError}
          maxRows={5}
          defaultAgeGroup={user.ageGroup}
          onRefreshLeaderboard={onRefreshLeaderboard}
        />
        <button
          className="game-button-outlined"
          onClick={onOpenLeaderboard}
          type="button"
        >
          Open Full Leaderboard
        </button>
      </section>
    </div>
  );
}

function FullLeaderboardPage({
  leaderboard,
  leaderboardLoading,
  leaderboardError,
  onBack,
  onRefreshLeaderboard,
  defaultAgeGroup,
}) {
  return (
    <div className="glass-panel portal-layout">
      <div className="portal-topbar">
        <button className="small-ghost" onClick={onBack} type="button">
          Back
        </button>
        <div>
          <p className="eyebrow">Live Rankings</p>
          <h2 className="game-greeting">Leaderboard</h2>
        </div>
        <button
          className="small-ghost"
          onClick={onRefreshLeaderboard}
          type="button"
        >
          Refresh
        </button>
      </div>
      <AgeGroupLeaderboard
        leaderboard={leaderboard}
        loading={leaderboardLoading}
        error={leaderboardError}
        maxRows={20}
        defaultAgeGroup={defaultAgeGroup}
        onRefreshLeaderboard={onRefreshLeaderboard}
      />
    </div>
  );
}

function WordGuessGame({
  user,
  onBack,
  onCompleteLevel,
  onOpenLeaderboard,
  isSaving,
}) {
  const completedLevels = useMemo(
    () => normalizeCompletedLevels(user.completedWordleLevels),
    [user.completedWordleLevels],
  );
  const unlockedLevel = getUnlockedWordLevel(completedLevels);
  const [activeLevel, setActiveLevel] = useState(unlockedLevel);
  const [history, setHistory] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState("playing");
  const [message, setMessage] = useState(
    "Use five letters to reveal the code.",
  );

  const level = getWordLevel(activeLevel);
  const attemptsRemaining = getAttemptsRemaining(history.length);
  const nextLevelNumber = Math.min(level.level + 1, WORD_GUESS_LEVELS.length);
  const hasNextLevel = level.level < WORD_GUESS_LEVELS.length;
  const canContinue =
    status === "won" && hasNextLevel && nextLevelNumber <= unlockedLevel;
  const progressPercent =
    (completedLevels.length / WORD_GUESS_LEVELS.length) * 100;

  const resetRound = useCallback(
    (nextLevel = activeLevel) => {
      setActiveLevel(nextLevel);
      setHistory([]);
      setCurrentGuess("");
      setStatus("playing");
      setMessage("Use five letters to reveal the code.");
    },
    [activeLevel],
  );

  const handleLevelSelect = (levelNumber) => {
    if (levelNumber > unlockedLevel) return;
    resetRound(levelNumber);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status !== "playing" || isSaving) return;

    const guess = currentGuess.toUpperCase();
    if (guess.length !== level.word.length) {
      setMessage(`Enter exactly ${level.word.length} letters.`);
      return;
    }

    const evaluation = evaluateWordGuess(guess, level.word);
    const nextHistory = [...history, { guess, evaluation }];
    const nextAttemptsRemaining = getAttemptsRemaining(nextHistory.length);
    setHistory(nextHistory);
    setCurrentGuess("");

    if (guess === level.word) {
      const points = calculateWordPoints(level, nextAttemptsRemaining);
      setStatus("won");
      setMessage("Solved. Saving level progress...");

      try {
        await onCompleteLevel(level.level, points);
        setMessage(
          completedLevels.includes(level.level)
            ? "Solved again. This level was already saved."
            : `Solved. +${points} score saved.`,
        );
      } catch (error) {
        setMessage(error.message || "Solved, but progress could not be saved.");
      }
      return;
    }

    if (nextAttemptsRemaining === 0) {
      setStatus("lost");
      setMessage(`No attempts left. The word was ${level.word}.`);
      return;
    }

    setMessage("Not quite. Use the colors and try again.");
  };

  const rows = [
    ...history,
    ...Array.from({ length: MAX_WORD_ATTEMPTS - history.length }, () => null),
  ];

  return (
    <div className="glass-panel game-board-screen word-screen">
      <div className="portal-topbar">
        <button className="small-ghost" onClick={onBack} type="button">
          Hub
        </button>
        <div>
          <p className="eyebrow">Word Guess</p>
          <h2 className="game-greeting">
            Level {level.level} <span>{level.name}</span>
          </h2>
        </div>
        <button
          className="small-ghost"
          onClick={onOpenLeaderboard}
          type="button"
        >
          Ranks
        </button>
      </div>

      <div className="word-progress">
        <span>
          Progress {completedLevels.length}/{WORD_GUESS_LEVELS.length}
        </span>
        <div>
          <i style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="level-strip" aria-label="Word Guess levels">
        {WORD_GUESS_LEVELS.map((wordLevel) => {
          const isCompleted = completedLevels.includes(wordLevel.level);
          const isLocked = wordLevel.level > unlockedLevel;
          return (
            <button
              className={[
                "level-chip",
                wordLevel.level === level.level ? "active" : "",
                isCompleted ? "completed" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={isLocked}
              key={wordLevel.level}
              onClick={() => handleLevelSelect(wordLevel.level)}
              type="button"
            >
              {wordLevel.level}
            </button>
          );
        })}
      </div>

      <div className={`word-board ${status === "won" ? "is-won" : ""}`}>
        {status === "won" && <div className="word-success-burst" />}
        {rows.map((row, rowIndex) => (
          <div className="word-row" key={`row-${rowIndex}`}>
            {Array.from({ length: level.word.length }, (_, letterIndex) => {
              const entry = row?.evaluation[letterIndex];
              return (
                <span
                  className={`letter-tile ${entry?.status || ""}`}
                  key={`${rowIndex}-${letterIndex}`}
                >
                  {entry?.letter || ""}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <div className="word-meta">
        <StatPill label="Attempts Left" value={attemptsRemaining} />
        <StatPill label="Level" value={`${level.level}/10`} />
      </div>

      <form onSubmit={handleSubmit} className="word-form">
        <input
          className="game-input"
          disabled={status !== "playing" || isSaving}
          maxLength={level.word.length}
          placeholder="Guess word"
          value={currentGuess}
          onChange={(event) =>
            setCurrentGuess(
              event.target.value
                .replace(/[^a-z]/gi, "")
                .slice(0, level.word.length)
                .toUpperCase(),
            )
          }
        />
        <button
          className="neon-btn btn-cyan game-button"
          disabled={status !== "playing" || isSaving}
          type="submit"
        >
          {isSaving ? "Saving..." : "Submit Guess"}
        </button>
      </form>

      <p className="game-muted word-message">{message}</p>

      {status === "lost" && (
        <button
          className="game-button-outlined"
          onClick={() => resetRound(level.level)}
          type="button"
        >
          Try Level Again
        </button>
      )}

      {status === "won" && hasNextLevel && (
        <button
          className="neon-btn btn-cyan game-button"
          disabled={!canContinue || isSaving}
          onClick={() => resetRound(nextLevelNumber)}
          type="button"
        >
          Continue to Level {nextLevelNumber}
        </button>
      )}

      {status === "won" && !hasNextLevel && (
        <button
          className="game-button-outlined"
          onClick={onOpenLeaderboard}
          type="button"
        >
          View Leaderboard
        </button>
      )}
    </div>
  );
}

function MemoryMatchGame({
  user,
  onBack,
  onCompleteMemory,
  onOpenLeaderboard,
  isSaving,
}) {
  const [difficultyKey, setDifficultyKey] = useState("easy");
  const [cards, setCards] = useState(() => createMemoryDeck("easy"));
  const [flippedIds, setFlippedIds] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [status, setStatus] = useState("ready");
  const [locked, setLocked] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const difficulty =
    MEMORY_DIFFICULTIES.find((option) => option.key === difficultyKey) ??
    MEMORY_DIFFICULTIES[0];
  const memoryColumns =
    difficulty.pairs <= 3 ? 3 : difficulty.pairs <= 6 ? 4 : 5;
  const matchPoints = Math.max(
    10,
    Math.round(difficulty.points / difficulty.pairs),
  );

  const resetGame = useCallback(
    (key = difficultyKey) => {
      setCards(createMemoryDeck(key));
      setFlippedIds([]);
      setMatchedIds([]);
      setMoves(0);
      setScore(0);
      setElapsedSeconds(0);
      setStatus("ready");
      setLocked(false);
      setSaveMessage("");
    },
    [difficultyKey],
  );

  useEffect(() => {
    resetGame(difficultyKey);
  }, [difficultyKey, resetGame]);

  useEffect(() => {
    if (status !== "playing") return undefined;
    const timer = setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const completeGame = async (nextMoves) => {
    const finalScore = calculateMemoryFinalScore(
      difficultyKey,
      nextMoves,
      elapsedSeconds,
    );
    setScore(finalScore);
    setStatus("complete");
    setSaveMessage("Saving memory score...");

    try {
      await onCompleteMemory(finalScore);
      setSaveMessage(`Complete. Final score ${finalScore} saved.`);
    } catch (error) {
      setSaveMessage(
        error.message || "Complete, but score could not be saved.",
      );
    }
  };

  const handleCardClick = (card) => {
    if (
      locked ||
      status === "complete" ||
      matchedIds.includes(card.id) ||
      flippedIds.includes(card.id)
    ) {
      return;
    }

    if (status === "ready") setStatus("playing");

    if (flippedIds.length === 0) {
      setFlippedIds([card.id]);
      return;
    }

    const firstCard = cards.find((item) => item.id === flippedIds[0]);
    if (!firstCard) return;

    const nextMoves = moves + 1;
    setMoves(nextMoves);
    setFlippedIds([firstCard.id, card.id]);

    if (firstCard.pairId === card.pairId) {
      const nextMatchedIds = [...matchedIds, firstCard.id, card.id];
      const nextScore = score + matchPoints;
      setMatchedIds(nextMatchedIds);
      setScore(nextScore);
      setFlippedIds([]);

      if (nextMatchedIds.length === cards.length) {
        completeGame(nextMoves);
      }
      return;
    }

    setLocked(true);
    setTimeout(() => {
      setFlippedIds([]);
      setLocked(false);
    }, 750);
  };

  return (
    <div className="glass-panel game-board-screen memory-screen">
      <div className="portal-topbar">
        <button className="small-ghost" onClick={onBack} type="button">
          Hub
        </button>
        <div>
          <p className="eyebrow">Memory Match</p>
          <h2 className="game-greeting">
            Difficulty <span>{difficulty.name}</span>
          </h2>
        </div>
        <button
          className="small-ghost"
          onClick={onOpenLeaderboard}
          type="button"
        >
          Ranks
        </button>
      </div>

      <div className="difficulty-tabs">
        {Object.values(MEMORY_DIFFICULTIES).map((option) => (
          <button
            className={option.key === difficultyKey ? "active" : ""}
            disabled={isSaving}
            key={option.key}
            onClick={() => setDifficultyKey(option.key)}
            type="button"
          >
            {option.name}
          </button>
        ))}
      </div>

      <div className="word-meta">
        <StatPill label="Score" value={score} />
        <StatPill label="Moves" value={moves} />
        <StatPill label="Time" value={formatTime(elapsedSeconds)} />
        <StatPill label="Best" value={user.memoryGameBestScore} />
      </div>

      <div
        className="memory-grid"
        style={{ "--memory-columns": memoryColumns }}
      >
        {cards.map((card) => {
          const isVisible =
            flippedIds.includes(card.id) || matchedIds.includes(card.id);
          const isMatched = matchedIds.includes(card.id);
          return (
            <button
              className={[
                "memory-card",
                isVisible ? "revealed" : "",
                isMatched ? "matched" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={locked || isSaving}
              key={card.id}
              onClick={() => handleCardClick(card)}
              type="button"
            >
              <span className="memory-card-back">?</span>
              <span className="memory-card-front">{card.label}</span>
            </button>
          );
        })}
      </div>

      {status === "complete" && (
        <div className="completion-panel">
          <p className="eyebrow">All Pairs Found</p>
          <h3>{score}</h3>
          <p>{saveMessage || "Memory board complete."}</p>
          <div className="completion-actions">
            <button
              className="neon-btn btn-cyan game-button"
              disabled={isSaving}
              onClick={() => resetGame(difficultyKey)}
              type="button"
            >
              Play Again
            </button>
            <button
              className="game-button-outlined"
              onClick={onOpenLeaderboard}
              type="button"
            >
              Leaderboard
            </button>
          </div>
        </div>
      )}

      {status !== "complete" && (
        <div className="completion-actions">
          <button
            className="game-button-outlined"
            onClick={() => resetGame(difficultyKey)}
            type="button"
          >
            Reset Board
          </button>
        </div>
      )}
    </div>
  );
}

function GameOverScreen({ score, isSaving, onReplay, onDashboard }) {
  return (
    <div className="glass-panel game-screen">
      <h1 className="game-over-title">Game Over</h1>
      <p className="game-muted">Your run score:</p>
      <p className="game-final-score">{score}</p>
      {isSaving && <p className="game-muted">Saving score...</p>}
      <button
        onClick={onReplay}
        className="neon-btn btn-cyan game-button"
        disabled={isSaving}
        type="button"
      >
        Try Again
      </button>
      <button
        onClick={onDashboard}
        className="game-button-outlined"
        type="button"
      >
        Game Hub
      </button>
    </div>
  );
}

function GamePortal({
  onLanding,
  leaderboard,
  leaderboardLoading,
  leaderboardError,
  onScoresChanged,
}) {
  const [view, setView] = useState("intro");
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [score, setScore] = useState(0);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectingAgeGroup, setSelectingAgeGroup] = useState("");
  const [actionError, setActionError] = useState("");

  const refreshLeaderboard = useCallback(async () => {
    await onScoresChanged();
  }, [onScoresChanged]);

  const saveProgress = useCallback(
    async (updater) => {
      if (!currentUser) throw new Error("No active user profile.");

      setIsSaving(true);
      setActionError("");
      try {
        const nextUser = updater(currentUser);
        const savedUser = await saveUser(nextUser);
        setCurrentUser(savedUser);
        setUsername(savedUser.username || savedUser.nickname);
        await onScoresChanged();
        return savedUser;
      } catch (error) {
        const message =
          error.message || "Could not save progress. Please try again.";
        setActionError(message);
        throw new Error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [currentUser, onScoresChanged],
  );

  const handleLogin = async (event) => {
    event.preventDefault();
    const cleanName = sanitizeUsername(username);
    if (!cleanName) return;

    setIsLoadingUser(true);
    setActionError("");
    try {
      const user = await getOrCreateUser(cleanName, AGE_GROUPS[0].key);
      setCurrentUser(user);
      setUsername(user.username || user.nickname);
      setView("dashboard");
      await onScoresChanged();
    } catch (error) {
      setActionError(error.message || "Could not load this user from the API.");
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsername("");
    setActionError("");
    setView("intro");
  };

  const handleAgeGroupSelect = async (ageGroup) => {
    const selectedView = gameViewByAgeGroup[ageGroup];
    if (!selectedView) return;

    const cleanName = sanitizeUsername(
      username || currentUser?.nickname || currentUser?.username || "",
    );
    if (!cleanName) {
      setView("intro");
      return;
    }

    setSelectingAgeGroup(ageGroup);
    setActionError("");
    try {
      const user = await getOrCreateUser(cleanName, ageGroup);
      setCurrentUser(user);
      setUsername(user.username || user.nickname);
      setView(selectedView);
      await onScoresChanged();
    } catch (error) {
      setActionError(error.message || "Could not load this game profile.");
    } finally {
      setSelectingAgeGroup("");
    }
  };

  const handleArenaEnd = async (finalScore) => {
    setScore(finalScore);
    try {
      await saveProgress((user) => ({
        ...user,
        score: Math.max(user.score, finalScore),
      }));
    } catch {
      // The game over screen still appears so the run is not lost visually.
    }
    setView("gameover");
  };

  const handleWordLevelComplete = async (levelNumber, points) => {
    return saveProgress((user) => {
      const completedLevels = normalizeCompletedLevels(
        user.completedWordleLevels,
      );
      const alreadyCompleted = completedLevels.includes(levelNumber);
      return {
        ...user,
        score: alreadyCompleted ? user.score : user.score + points,
        completedWordleLevels: sortLevels([...completedLevels, levelNumber]),
      };
    });
  };

  const handleMemoryComplete = async (finalScore) => {
    return saveProgress((user) => {
      const previousBest = Number(user.memoryGameBestScore) || 0;
      const improvement = Math.max(0, finalScore - previousBest);
      return {
        ...user,
        score: user.score + improvement,
        memoryGameBestScore: Math.max(previousBest, finalScore),
      };
    });
  };

  return (
    <div className="game-portal">
      {view === "intro" && (
        <IntroScreen
          username={username}
          onUsernameChange={setUsername}
          onLogin={handleLogin}
          onLanding={onLanding}
          loading={isLoadingUser}
          error={actionError}
        />
      )}

      {view !== "intro" && currentUser && (
        <>
          {view === "dashboard" && (
            <Dashboard
              user={currentUser}
              leaderboard={leaderboard}
              leaderboardLoading={leaderboardLoading}
              leaderboardError={leaderboardError}
              onSelectAgeGroup={handleAgeGroupSelect}
              selectingAgeGroup={selectingAgeGroup}
              onOpenLeaderboard={() => setView("leaderboard")}
              onLogout={handleLogout}
              onLanding={onLanding}
              onRefreshLeaderboard={refreshLeaderboard}
            />
          )}

          {view === "leaderboard" && (
            <FullLeaderboardPage
              leaderboard={leaderboard}
              leaderboardLoading={leaderboardLoading}
              leaderboardError={leaderboardError}
              onBack={() => setView("dashboard")}
              onRefreshLeaderboard={refreshLeaderboard}
              defaultAgeGroup={currentUser.ageGroup}
            />
          )}

          {view === "playing" && <GameEngine onGameEnd={handleArenaEnd} />}

          {view === "gameover" && (
            <GameOverScreen
              score={score}
              isSaving={isSaving}
              onReplay={() => setView("playing")}
              onDashboard={() => setView("dashboard")}
            />
          )}

          {view === "word" && (
            <>
              <WordGuessGame
                user={currentUser}
                onBack={() => setView("dashboard")}
                onCompleteLevel={handleWordLevelComplete}
                onOpenLeaderboard={() => setView("leaderboard")}
                isSaving={isSaving}
              />
              <ActionError message={actionError} />
            </>
          )}

          {view === "memory" && (
            <>
              <MemoryMatchGame
                user={currentUser}
                onBack={() => setView("dashboard")}
                onCompleteMemory={handleMemoryComplete}
                onOpenLeaderboard={() => setView("leaderboard")}
                isSaving={isSaving}
              />
              <ActionError message={actionError} />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("landing");
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState("");

  const refreshLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const users = await fetchUsers();
      setLeaderboard(sortUsersByScore(users));
      setLeaderboardError("");
    } catch (error) {
      setLeaderboardError(
        error.message || "Could not load leaderboard from the API.",
      );
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    refreshLeaderboard();
    const interval = setInterval(refreshLeaderboard, 15000);
    return () => clearInterval(interval);
  }, [refreshLeaderboard]);

  return (
    <>
      {loading && <LoadingScreen />}
      {mode === "landing" ? (
        <LandingPage
          onPlay={() => setMode("game")}
          leaderboard={leaderboard}
          leaderboardLoading={leaderboardLoading}
          leaderboardError={leaderboardError}
          onRefreshLeaderboard={refreshLeaderboard}
        />
      ) : (
        <GamePortal
          onLanding={() => setMode("landing")}
          leaderboard={leaderboard}
          leaderboardLoading={leaderboardLoading}
          leaderboardError={leaderboardError}
          onScoresChanged={refreshLeaderboard}
        />
      )}
    </>
  );
}
