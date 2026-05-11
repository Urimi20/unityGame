import React, { useState, useEffect, useRef, useCallback } from "react";

// Ky është imazhi që përdoret për lojtarin dhe logon
import URL_FOTOS from "../image.png";

const GlobalStyles = () => (
  <style>{`
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .glass-panel {
      background: rgba(20, 24, 35, 0.6);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
      animation: fadeInDown 0.5s ease-out forwards;
    }
    .neon-btn {
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      letter-spacing: 1px;
    }
    .neon-btn:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 0 20px currentColor;
    }
    .btn-cyan { color: #0fb9b1; border: 1px solid #0fb9b1; background: rgba(15, 185, 177, 0.1); }
    .btn-cyan:hover { background: #0fb9b1; color: white; }

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
    // Ngarkimi i logos
    const img = new Image();
    img.src = URL_FOTOS;
    img.onload = () => {
      logoRef.current = img;
    };

    // Ngarkimi i listës së rekordeve
    const savedLeaderboard =
      JSON.parse(localStorage.getItem("neonLeaderboard")) || [];
    setLeaderboard(savedLeaderboard);

    // Këtu kemi hequr kushtin që të dërgonte direkt te "dashboard"
    // nëse ekzistonte një përdorues i ruajtur.
    const savedUser = localStorage.getItem("neonCurrentUser");
    if (savedUser) {
      setUsername(savedUser); // Plotëson emrin automatikisht në input
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
        color: ["#ff6b81", "#ffd32a", "#a55eea", "#ff4757"][
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
        frameCountRef.current++;
        scoreRef.current += 0.2;
        if (frameCountRef.current % 5 === 0)
          setCurrentScore(Math.floor(scoreRef.current));
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

      for (let i = powerUpsRef.current.length - 1; i >= 0; i--) {
        let pw = powerUpsRef.current[i];
        pw.y += pw.speedY;
        ctx.fillStyle = "#00d2ff";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00d2ff";
        ctx.beginPath();
        ctx.arc(pw.x, pw.y, pw.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (
          !isDeadRef.current &&
          Math.hypot(p.x - pw.x, p.y - pw.y) < p.radius + pw.size / 2
        ) {
          p.hasShield = true;
          powerUpsRef.current.splice(i, 1);
        }
        if (pw.y > H + 50) powerUpsRef.current.splice(i, 1);
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
        ctx.roundRect(o.x - o.size / 2, o.y - o.size / 2, o.size, o.size, 6);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (
          !isDeadRef.current &&
          Math.hypot(p.x - o.x, p.y - o.y) < p.radius + o.size * 0.45
        ) {
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

      if (!isDeadRef.current || particlesRef.current.length > 0)
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
          <div style={{ color: "white", fontSize: "13px" }}>
            <b>Unity Tech Hub - 1 Vjetori</b>
            <br />
            <small>Mblidh mburojat blu për të mbijetuar</small>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            aspectRatio: "2/3",
            borderRadius: "15px",
            overflow: "hidden",
            border: "2px solid #1a1b3c",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 20,
              width: "100%",
              textAlign: "center",
              color: "#fff",
              fontSize: "40px",
              fontWeight: "900",
              textShadow: "0 0 15px #00d2ff",
              zIndex: 10,
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

      {/* FAQJA E PARË QË SHFAQET: INTRO */}
      {view === "intro" && (
        <form
          onSubmit={handleLogin}
          className="glass-panel"
          style={styles.screen}
        >
          <img
            src={URL_FOTOS}
            alt=""
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #0fb9b1",
            }}
          />
          <h1 style={styles.title}>
            Unity <span style={{ color: "#fff" }}>Code Rush</span>
          </h1>
          <input
            style={styles.input}
            placeholder="Shkruaj emrin tënd..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button
            type="submit"
            className="neon-btn btn-cyan"
            style={styles.button}
          >
            HYR NË TECH HUB
          </button>
        </form>
      )}

      {view === "dashboard" && (
        <div className="glass-panel" style={styles.screen}>
          <img
            src={URL_FOTOS}
            alt=""
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #0fb9b1",
              marginBottom: "10px",
            }}
          />
          <h2
            style={{
              color: "white",
              margin: "0 0 20px 0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            Përshëndetje, <span style={{ color: "#0fb9b1" }}>{username}</span>
          </h2>
          <div style={styles.leaderboardContainer}>
            <h3
              style={{
                fontSize: "12px",
                color: "#a4b0be",
                textAlign: "center",
                marginBottom: "10px",
              }}
            >
              RENDITJA AKTUALE
            </h3>
            <table style={styles.table}>
              <tbody>
                {leaderboard.length > 0 ? (
                  leaderboard.map((p, i) => (
                    <tr key={i}>
                      <td style={styles.td}>
                        #{i + 1} {p.username}
                      </td>
                      <td style={styles.td}>{p.score}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <button
                          className="delete-btn"
                          onClick={(e) => deleteUser(e, p.username)}
                        >
                          Fshije
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      style={{ ...styles.td, textAlign: "center" }}
                    >
                      Nuk ka rekorde ende...
                    </td>
                  </tr>
                )}
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
          <h1
            style={{
              color: "#ff4757",
              textShadow: "0 0 15px #ff4757",
              marginBottom: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            LOJA PËRFUNDOI
          </h1>
          <p style={{ color: "#a4b0be", marginBottom: "10px" }}>Pikët e tua:</p>
          <p
            style={{
              fontSize: "48px",
              fontWeight: "900",
              margin: "0 0 20px 0",
              color: "#fff",
            }}
          >
            {score}
          </p>
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
            REKORDET
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
      "radial-gradient(circle at center, #111428 0%, #050810 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    fontFamily: "'Segoe UI', sans-serif",
  },
  screen: {
    padding: "40px",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    alignItems: "center",
    width: "90%",
    maxWidth: "400px",
  },
  title: {
    color: "#0fb9b1",
    fontSize: "32px",
    fontWeight: "900",
    marginBottom: "30px",
    letterSpacing: "3px",
  },
  input: {
    width: "100%",
    padding: "15px",
    marginBottom: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(15, 185, 177, 0.3)",
    background: "rgba(0,0,0,0.3)",
    color: "#fff",
    textAlign: "center",
    outline: "none",
  },
  button: {
    padding: "15px 30px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
    border: "none",
  },
  buttonOutlined: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#a4b0be",
    padding: "12px",
    borderRadius: "12px",
    cursor: "pointer",
    marginTop: "15px",
    width: "100%",
  },
  leaderboardContainer: {
    width: "100%",
    maxHeight: "180px",
    overflowY: "auto",
    margin: "10px 0 25px 0",
    background: "rgba(0,0,0,0.2)",
    borderRadius: "12px",
    padding: "10px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  td: {
    padding: "12px 5px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    fontSize: "14px",
  },
};
