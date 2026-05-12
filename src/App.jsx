import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import URL_FOTOS from "../image.png";

const topPlayers = [
  { rank: 1, name: "Urim", score: 842 },
  { rank: 2, name: "Ardit", score: 791 },
  { rank: 3, name: "Leon", score: 650 },
];

const features = [
  {
    icon: "⚡",
    title: "Fast Reflex Gameplay",
    description:
      "Dodge neon hazards in a rapid-fire survival loop tuned for instant reactions.",
  },
  {
    icon: "🛡",
    title: "Shield Power-Ups",
    description:
      "Grab cyan shields at the perfect moment and blast through chaos like a pro.",
  },
  {
    icon: "🏆",
    title: "Competitive Leaderboards",
    description:
      "Chase the top score, flex your rank, and keep the arena rivalry alive.",
  },
];

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
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,245,255,0.16),transparent_30%),radial-gradient(circle_at_80%_15%,rgba(177,80,255,0.16),transparent_25%),radial-gradient(circle_at_50%_90%,rgba(0,245,255,0.08),transparent_35%)]" />
      <div className="absolute inset-0 cyber-grid" />
      {stars.map((star) => (
        <span
          className="star-particle"
          key={star.id}
          style={star}
        />
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
            <img src={URL_FOTOS} alt="" className="h-8 w-8 rounded-full object-cover" />
          </span>
          <span className="font-orbitron text-sm font-black uppercase tracking-[0.25em] text-white group-hover:text-cyan-200">
            UCR
          </span>
        </button>
        <div className="hidden items-center gap-8 md:flex">
          {[
            ["Home", "home"],
            ["Features", "features"],
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
          <button className="neon-button neon-button-sm" onClick={onPlay} type="button">
            Play
          </button>
        </div>
      </nav>
    </header>
  );
}

function HeroSection({ onPlay }) {
  return (
    <section id="home" className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 pb-20 pt-32 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
      <div className="section-reveal relative z-10">
        <div className="mb-6 inline-flex rounded-full border border-cyan-300/25 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-200 shadow-[0_0_35px_rgba(0,245,255,.12)] backdrop-blur-xl">
          Anniversary Launch Arena
        </div>
        <h1 className="font-orbitron text-5xl font-black uppercase leading-none tracking-tight text-white sm:text-7xl lg:text-8xl">
          <span className="neon-title block">Unity</span>
          <span className="neon-title-purple block">Code Rush</span>
        </h1>
        <p className="mt-6 max-w-2xl text-xl font-semibold text-cyan-50/80 sm:text-2xl">
          Survive the chaos. Beat the leaderboard.
        </p>
        <p className="mt-5 max-w-xl text-base leading-8 text-slate-300/75">
          A high-speed neon survival challenge built for reflexes, rivalry, and pure esports energy.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button className="neon-button" onClick={onPlay} type="button">
            PLAY NOW
          </button>
          <button className="neon-button neon-button-purple" onClick={() => scrollToId("leaderboard")} type="button">
            VIEW LEADERBOARD
          </button>
        </div>
      </div>
      <div className="section-reveal relative z-10 flex justify-center lg:justify-end">
        <div className="hero-orb-wrap">
          <div className="hero-orb-ring" />
          <div className="hero-orb">
            <img src={URL_FOTOS} alt="Unity Code Rush logo" className="h-full w-full rounded-full object-cover" />
          </div>
          <div className="floating-chip chip-one">LIVE SCORE</div>
          <div className="floating-chip chip-two">SHIELD READY</div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <div className="section-heading">
        <p className="eyebrow">Combat Systems</p>
        <h2>Designed for speed, power, and bragging rights.</h2>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {features.map((feature, index) => (
          <article className="glass-card section-reveal" key={feature.title} style={{ animationDelay: `${index * 120}ms` }}>
            <div className="neon-icon">{feature.icon}</div>
            <h3 className="mt-6 font-orbitron text-xl font-black text-white">{feature.title}</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300/75">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function GamePreview({ onPlay }) {
  return (
    <section id="preview" className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
        <div className="section-reveal">
          <p className="eyebrow">Gameplay Preview</p>
          <h2 className="mt-3 font-orbitron text-4xl font-black uppercase text-white sm:text-5xl">
            The arena never slows down.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300/75">
            Slip through falling blocks, charge your shield, and keep your cursor locked in the neon storm.
          </p>
          <button className="neon-button mt-8" onClick={onPlay} type="button">
            Watch Gameplay
          </button>
        </div>
        <div className="preview-frame section-reveal">
          <div className="preview-screen">
            <div className="preview-hud">
              <span>UCR / ARENA-01</span>
              <span>842</span>
            </div>
            <div className="preview-player"><img src={URL_FOTOS} alt="Player avatar" /></div>
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

function LeaderboardSection() {
  return (
    <section id="leaderboard" className="relative mx-auto max-w-5xl px-5 py-24 lg:px-8">
      <div className="section-heading">
        <p className="eyebrow">Live Leaderboard</p>
        <h2>Top pilots in the neon rush.</h2>
      </div>
      <div className="glass-card mt-12 overflow-hidden p-0">
        <table className="w-full border-separate border-spacing-y-3 p-4 text-left">
          <thead className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {topPlayers.map((player) => (
              <tr className="leaderboard-row" key={player.name}>
                <td className="rounded-l-2xl px-4 py-4">
                  <span className="rank-badge">#{player.rank}</span>
                </td>
                <td className="px-4 py-4 font-orbitron text-lg font-bold text-white">{player.name}</td>
                <td className="rounded-r-2xl px-4 py-4 text-right text-2xl font-black text-cyan-100">{player.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="relative mx-auto max-w-5xl px-5 py-24 text-center lg:px-8">
      <div className="glass-card section-reveal">
        <p className="eyebrow">Unity Tech Hub</p>
        <h2 className="mt-3 font-orbitron text-4xl font-black uppercase text-white sm:text-5xl">
          Built for Unity Tech Hub Anniversary
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300/75">
          Unity Code Rush celebrates the energy of the community with a futuristic mini-game made for quick matches, live-event competition, and unforgettable anniversary moments.
        </p>
      </div>
    </section>
  );
}

function FinalCta({ onPlay }) {
  return (
    <section className="relative px-5 py-28">
      <div className="cta-panel mx-auto max-w-6xl text-center">
        <p className="eyebrow">Final Gate</p>
        <h2 className="mt-3 font-orbitron text-4xl font-black uppercase text-white sm:text-6xl">
          Ready to enter the arena?
        </h2>
        <button className="neon-button mt-10" onClick={onPlay} type="button">
          START PLAYING
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-cyan-300/10 px-5 py-10 text-center text-sm text-slate-400">
      <div className="mb-4 flex justify-center gap-4 text-xl">
        <span className="social-icon">◉</span>
        <span className="social-icon">◇</span>
        <span className="social-icon">✦</span>
      </div>
      <p>© 2026 Unity Code Rush. Built for Unity Tech Hub Anniversary.</p>
    </footer>
  );
}

function LandingPage({ onPlay }) {
  return (
    <main className="landing-shell">
      <Stars />
      <Navbar onPlay={onPlay} />
      <HeroSection onPlay={onPlay} />
      <FeaturesSection />
      <GamePreview onPlay={onPlay} />
      <LeaderboardSection />
      <AboutSection />
      <FinalCta onPlay={onPlay} />
      <Footer />
    </main>
  );
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
    for (let i = 0; i < 15; i++) {
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
      color: ["#ff6b81", "#ffd32a", "#a55eea", "#ff4757"][Math.floor(Math.random() * 4)],
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
      frameCountRef.current++;
      scoreRef.current += 0.2;
      if (frameCountRef.current % 5 === 0) setCurrentScore(Math.floor(scoreRef.current));
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
        ctx.drawImage(logoRef.current, p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
        ctx.restore();
      }
    }

    for (let i = powerUpsRef.current.length - 1; i >= 0; i--) {
      const pw = powerUpsRef.current[i];
      pw.y += pw.speedY;
      ctx.fillStyle = "#00d2ff";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00d2ff";
      ctx.beginPath();
      ctx.arc(pw.x, pw.y, pw.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (!isDeadRef.current && Math.hypot(p.x - pw.x, p.y - pw.y) < p.radius + pw.size / 2) {
        p.hasShield = true;
        powerUpsRef.current.splice(i, 1);
      }
      if (pw.y > H + 50) powerUpsRef.current.splice(i, 1);
    }

    for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
      const o = obstaclesRef.current[i];
      if (!isDeadRef.current) {
        o.y += o.speedY;
        o.x += o.speedX;
      }

      ctx.fillStyle = o.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = o.color;
      ctx.beginPath();
      ctx.roundRect(o.x - o.size / 2, o.y - o.size / 2, o.size, o.size, 6);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (!isDeadRef.current && Math.hypot(p.x - o.x, p.y - o.y) < p.radius + o.size * 0.45) {
        if (p.hasShield) {
          p.hasShield = false;
          createExplosion(o.x, o.y, "#00d2ff");
          obstaclesRef.current.splice(i, 1);
        } else {
          isDeadRef.current = true;
          createExplosion(p.x, p.y, "#ff4757");
          setTimeout(() => onGameEnd(Math.floor(scoreRef.current)), 1200);
        }
      }
      if (o.y > H + 50) obstaclesRef.current.splice(i, 1);
    }

    if (!isDeadRef.current || particlesRef.current.length > 0) requestRef.current = requestAnimationFrame(update);
  }, [onGameEnd, spawnObstacle]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  const handleInput = (e) => {
    if (isDeadRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches?.[0];
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;
    playerRef.current.x = (clientX - rect.left) * (W / rect.width);
    playerRef.current.y = (clientY - rect.top) * (H / rect.height);
  };

  return (
    <div className="game-engine-wrap">
      <div className="urimi-banner">
        <img src={URL_FOTOS} alt="Logo" />
        <div>
          <b>Unity Tech Hub - 1 Vjetori</b>
          <br />
          <small>Mblidh mburojat blu për të mbijetuar</small>
        </div>
      </div>
      <div className="game-canvas-shell">
        <div className="game-score">{currentScore}</div>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onMouseMove={handleInput}
          onTouchMove={(e) => {
            e.preventDefault();
            handleInput(e);
          }}
        />
      </div>
    </div>
  );
}

function GamePortal() {
  const [view, setView] = useState("intro");
  const [username, setUsername] = useState("");
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const savedLeaderboard = JSON.parse(localStorage.getItem("neonLeaderboard")) || [];
    setLeaderboard(savedLeaderboard);
    const savedUser = localStorage.getItem("neonCurrentUser");
    if (savedUser) setUsername(savedUser);
  }, []);

  const handleGameOver = (finalScore) => {
    setScore(finalScore);
    const board = JSON.parse(localStorage.getItem("neonLeaderboard")) || [];
    const existingPlayerIndex = board.findIndex((p) => p.username === username);
    if (existingPlayerIndex >= 0) {
      if (finalScore > board[existingPlayerIndex].score) board[existingPlayerIndex].score = finalScore;
    } else {
      board.push({ username, score: finalScore });
    }
    board.sort((a, b) => b.score - a.score);
    localStorage.setItem("neonLeaderboard", JSON.stringify(board));
    setLeaderboard(board);
    setView("gameover");
  };

  const deleteUser = (e, nameToDelete) => {
    e.stopPropagation();
    const updatedBoard = leaderboard.filter((p) => p.username !== nameToDelete);
    setLeaderboard(updatedBoard);
    localStorage.setItem("neonLeaderboard", JSON.stringify(updatedBoard));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim().length > 0) {
      localStorage.setItem("neonCurrentUser", username);
      setView("dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("neonCurrentUser");
    setUsername("");
    setView("intro");
  };

  return (
    <div className="game-portal">
      {view === "intro" && (
        <form onSubmit={handleLogin} className="glass-panel game-screen">
          <button className="back-link" onClick={() => window.location.reload()} type="button">
            ← Landing
          </button>
          <img src={URL_FOTOS} alt="" className="game-logo" />
          <h1 className="game-title">
            Unity <span>Code Rush</span>
          </h1>
          <input
            className="game-input"
            placeholder="Shkruaj emrin tënd..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button type="submit" className="neon-btn btn-cyan game-button">
            HYR NË TECH HUB
          </button>
        </form>
      )}

      {view === "dashboard" && (
        <div className="glass-panel game-screen">
          <img src={URL_FOTOS} alt="" className="game-logo" />
          <h2 className="game-greeting">
            Përshëndetje, <span>{username}</span>
          </h2>
          <div className="game-leaderboard-container">
            <h3>RENDITJA AKTUALE</h3>
            <table className="game-table">
              <tbody>
                {leaderboard.length > 0 ? (
                  leaderboard.map((p, i) => (
                    <tr key={`${p.username}-${i}`}>
                      <td>#{i + 1} {p.username}</td>
                      <td>{p.score}</td>
                      <td className="text-right">
                        <button className="delete-btn" onClick={(e) => deleteUser(e, p.username)} type="button">
                          Fshije
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">
                      Nuk ka rekorde ende...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button onClick={() => setView("playing")} className="neon-btn btn-cyan game-button" type="button">
            FILLO LOJËN
          </button>
          <button onClick={handleLogout} className="game-button-outlined" type="button">
            NDRYSHO EMRIN
          </button>
        </div>
      )}

      {view === "playing" && <GameEngine onGameEnd={handleGameOver} />}

      {view === "gameover" && (
        <div className="glass-panel game-screen">
          <h1 className="game-over-title">LOJA PËRFUNDOI</h1>
          <p className="game-muted">Pikët e tua:</p>
          <p className="game-final-score">{score}</p>
          <button onClick={() => setView("playing")} className="neon-btn btn-cyan game-button" type="button">
            PROVO PËRSËRI
          </button>
          <button onClick={() => setView("dashboard")} className="game-button-outlined" type="button">
            REKORDET
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("landing");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1350);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && <LoadingScreen />}
      {mode === "landing" ? <LandingPage onPlay={() => setMode("game")} /> : <GamePortal />}
    </>
  );
}
