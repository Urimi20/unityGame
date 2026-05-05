import React, { useState, useEffect, useRef, useCallback } from "react";

// VENDO LIKUN E FOTOS TËNDE KËTU
import URL_FOTOS from "../image.png";

const GlobalStyles = () => (
  <style>{`
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .glass-panel {
      background: rgba(20, 24, 35, 0.4);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
      animation: fadeInDown 0.5s ease-out forwards;
    }
    .neon-btn {
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .neon-btn:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 0 20px currentColor;
    }
    .btn-cyan { color: #0fb9b1; }
    .btn-cyan:hover { box-shadow: 0 0 20px #0fb9b1; }

    .delete-btn {
      background: rgba(255, 71, 87, 0.1);
      border: 1px solid rgba(255, 71, 87, 0.3);
      color: #ff4757;
      cursor: pointer;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 10px;
      transition: 0.2s;
    }
    .delete-btn:hover {
      background: #ff4757;
      color: white;
    }

    .urimi-banner {
      display: flex;
      align-items: center;
      background: rgba(15, 185, 177, 0.15);
      border: 1px solid rgba(15, 185, 177, 0.3);
      padding: 10px 15px;
      border-radius: 12px;
      margin-bottom: 15px;
      width: 100%;
      box-sizing: border-box;
      animation: fadeInDown 0.6s ease;
    }
  `}</style>
);

export default function App() {
  const [view, setView] = useState("intro");
  const [username, setUsername] = useState("");
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const logoRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = URL_FOTOS;
    img.onload = () => {
      logoRef.current = img;
    };

    const savedLeaderboard =
      JSON.parse(localStorage.getItem("neonLeaderboard")) || [];
    setLeaderboard(savedLeaderboard);
    const savedUser = localStorage.getItem("neonCurrentUser");
    if (savedUser) {
      setUsername(savedUser);
      setView("dashboard");
    }
  }, []);

  const handleGameOver = (finalScore) => {
    setScore(finalScore);
    let board = JSON.parse(localStorage.getItem("neonLeaderboard")) || [];
    const existingPlayerIndex = board.findIndex((p) => p.username === username);
    if (existingPlayerIndex >= 0) {
      if (finalScore > board[existingPlayerIndex].score)
        board[existingPlayerIndex].score = finalScore;
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

  const GameEngine = ({ onGameEnd }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const playerRef = useRef({ x: 200, y: 500, radius: 20, trail: [] });
    const obstaclesRef = useRef([]);
    const particlesRef = useRef([]);
    const starsRef = useRef(
      Array.from({ length: 50 }, () => ({
        x: Math.random() * 400,
        y: Math.random() * 600,
        size: Math.random() * 2,
        speed: 2 + Math.random() * 4,
      })),
    );

    const frameCountRef = useRef(0);
    const difficultyRef = useRef(1.6); // FILLIMI MË I SHPEJTË
    const scoreRef = useRef(0);
    const isDeadRef = useRef(false);
    const [currentScore, setCurrentScore] = useState(0);

    const W = 400;
    const H = 600;

    const spawnObstacle = useCallback(() => {
      const types = ["cube", "crystal", "asteroid"];
      const type = types[Math.floor(Math.random() * types.length)];
      const size = 25 + Math.random() * 25;
      const x = Math.random() * (W - size) + size / 2;
      const speedY = (4.5 + Math.random() * 3) * difficultyRef.current; // OBJEKTET BIEN MË SHPEJT
      const speedX = (Math.random() - 0.5) * 3 * difficultyRef.current;
      const color = ["#ff6b81", "#ffd32a", "#a55eea", "#ff4757"][
        Math.floor(Math.random() * 4)
      ];

      obstaclesRef.current.push({
        x,
        y: -size,
        size,
        type,
        speedY,
        speedX,
        color,
        angle: 0,
        rotationSpeed: 0.1,
      });
    }, []);

    const update = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "rgba(10, 14, 23, 1)";
      ctx.fillRect(0, 0, W, H);

      starsRef.current.forEach((star) => {
        ctx.fillStyle = "#fff";
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        if (!isDeadRef.current) star.y += star.speed * difficultyRef.current;
        if (star.y > H) star.y = 0;
      });
      ctx.globalAlpha = 1;

      const p = playerRef.current;
      if (!isDeadRef.current) {
        frameCountRef.current++;
        scoreRef.current += 0.2;
        if (frameCountRef.current % 5 === 0)
          setCurrentScore(Math.floor(scoreRef.current));

        // RRITJA E VËSHTIRËSISË MË AGRESIVE
        if (frameCountRef.current % 150 === 0) difficultyRef.current += 0.25;

        const spawnRate = Math.max(
          7,
          30 - Math.floor(difficultyRef.current * 6),
        );
        if (frameCountRef.current % spawnRate === 0) spawnObstacle();

        if (logoRef.current) {
          ctx.save();
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
          ctx.strokeStyle = "#00d2ff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        let o = obstaclesRef.current[i];
        if (!isDeadRef.current) {
          o.y += o.speedY;
          o.x += o.speedX;
        }
        ctx.fillStyle = o.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = o.color;
        ctx.beginPath();
        ctx.rect(o.x - o.size / 2, o.y - o.size / 2, o.size, o.size);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (
          !isDeadRef.current &&
          Math.sqrt((p.x - o.x) ** 2 + (p.y - o.y) ** 2) <
            p.radius + o.size * 0.4
        ) {
          isDeadRef.current = true;
          setTimeout(() => onGameEnd(Math.floor(scoreRef.current)), 1000);
        }
        if (o.y > H + 50) obstaclesRef.current.splice(i, 1);
      }

      if (!isDeadRef.current)
        requestRef.current = requestAnimationFrame(update);
    }, [onGameEnd, spawnObstacle]);

    useEffect(() => {
      requestRef.current = requestAnimationFrame(update);
      return () => cancelAnimationFrame(requestRef.current);
    }, [update]);

    const handleInput = (e) => {
      if (isDeadRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches.clientX : e.clientX;
      const clientY = e.touches ? e.touches.clientY : e.clientY;
      playerRef.current.x = (clientX - rect.left) * (W / rect.width);
      playerRef.current.y = (clientY - rect.top) * (H / rect.height);
    };

    return (
      <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
        <div className="urimi-banner">
          <img
            src={URL_FOTOS}
            alt="Logo"
            style={{
              width: 45,
              height: 45,
              borderRadius: "50%",
              border: "2px solid #0fb9b1",
              marginRight: 15,
            }}
          />
          <div style={{ color: "white", fontSize: "14px" }}>
            <b>Urime 1 vjetori!</b>
            <br />
            <small>Shpejtësi maksimale!</small>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            aspectRatio: "2/3",
            borderRadius: "15px",
            overflow: "hidden",
            border: "1px solid #00d2ff",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 20,
              width: "100%",
              textAlign: "center",
              color: "#fff",
              fontSize: "32px",
              fontWeight: "900",
              textShadow: "0 0 10px #00d2ff",
            }}
          >
            {currentScore}
          </div>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onMouseMove={handleInput}
            onTouchMove={(e) => {
              e.preventDefault();
              handleInput(e);
            }}
            style={{ width: "100%", height: "100%", cursor: "none" }}
          />
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <GlobalStyles />
      {view === "intro" && (
        <form
          onSubmit={handleLogin}
          className="glass-panel"
          style={styles.screen}
        >
          <h1 style={styles.title}>
            NEON <span style={{ color: "#fff" }}>DESCENT</span>
          </h1>
          <input
            style={styles.input}
            placeholder="Shkruaj emrin..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button
            type="submit"
            className="neon-btn btn-cyan"
            style={styles.button}
          >
            HYR NË LOJË
          </button>
        </form>
      )}

      {view === "dashboard" && (
        <div className="glass-panel" style={styles.screen}>
          <h2 style={{ color: "white" }}>
            Përshëndetje, <span style={{ color: "#0fb9b1" }}>{username}</span>
          </h2>
          <div style={styles.leaderboardContainer}>
            <h3
              style={{
                fontSize: "12px",
                color: "#a4b0be",
                textAlign: "center",
              }}
            >
              🏆 TOP REKORDET
            </h3>
            <table style={styles.table}>
              <tbody>
                {leaderboard.map((p, i) => (
                  <tr key={i}>
                    <td style={styles.td}>
                      #{i + 1} {p.username}
                    </td>
                    <td style={styles.td}>{p.score}</td>
                    <td style={styles.td}>
                      <button
                        className="delete-btn"
                        onClick={(e) => deleteUser(e, p.username)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setView("playing")}
            className="neon-btn btn-cyan"
            style={{ ...styles.button, width: "100%" }}
          >
            FILLO LOJËN
          </button>
          <button onClick={handleLogout} style={styles.buttonOutlined}>
            NDRYSHO EMRIN
          </button>
        </div>
      )}

      {view === "playing" && <GameEngine onGameEnd={handleGameOver} />}

      {view === "gameover" && (
        <div className="glass-panel" style={styles.screen}>
          <h1 style={{ color: "#ff4757", textShadow: "0 0 15px #ff4757" }}>
            GAME OVER
          </h1>
          <p style={{ fontSize: "28px", fontWeight: "900" }}>{score}</p>
          <button
            onClick={() => setView("playing")}
            className="neon-btn btn-cyan"
            style={styles.button}
          >
            PROVO PËRSËRI
          </button>
          <button
            onClick={() => setView("dashboard")}
            style={{ ...styles.buttonOutlined, marginTop: "15px" }}
          >
            KTHEHU TE REKORDET
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    backgroundColor: "#050810",
    backgroundImage:
      "radial-gradient(circle at center, #1a1b3c 0%, #050810 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    fontFamily: "sans-serif",
  },
  screen: {
    padding: "40px",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "90%",
    maxWidth: "400px",
  },
  title: {
    color: "#0fb9b1",
    fontSize: "32px",
    fontWeight: "900",
    marginBottom: "30px",
    letterSpacing: "2px",
  },
  input: {
    width: "100%",
    padding: "15px",
    marginBottom: "20px",
    borderRadius: "10px",
    border: "1px solid #0fb9b1",
    background: "rgba(0,0,0,0.5)",
    color: "#fff",
    textAlign: "center",
  },
  button: {
    padding: "15px 30px",
    background: "#0fb9b1",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  buttonOutlined: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#a4b0be",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    marginTop: "15px",
    width: "100%",
  },
  leaderboardContainer: {
    width: "100%",
    maxHeight: "200px",
    overflowY: "auto",
    margin: "20px 0",
    background: "rgba(0,0,0,0.2)",
    borderRadius: "10px",
    padding: "10px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  td: {
    padding: "10px 5px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    fontSize: "14px",
  },
};
