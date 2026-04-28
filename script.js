(function () {
  var canvas = document.getElementById("c");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var W = 640;
  var H = 360;
  var GROUND_Y = 300;
  var GRAV = 1500;
  var JUMP = -420;
  var MOVE = 260;
  var FRICTION = 0.82;

  var player = { x: 80, y: 200, w: 28, h: 36, vx: 0, vy: 0, onGround: false };
  var keys = {};
  var paused = false;
  var won = false;
  var t = 0;
  var particles = [];

  var platforms = [
    { x: 0, y: GROUND_Y, w: W, h: H - GROUND_Y },
    { x: 120, y: 240, w: 100, h: 14 },
    { x: 280, y: 200, w: 110, h: 14 },
    { x: 450, y: 230, w: 100, h: 14 },
    { x: 520, y: 160, w: 90, h: 14 },
  ];

  var stars = [
    { x: 155, y: 210, r: 10, got: false },
    { x: 320, y: 170, r: 10, got: false },
    { x: 485, y: 200, r: 10, got: false },
    { x: 555, y: 130, r: 10, got: false },
    { x: 580, y: 270, r: 10, got: false },
  ];

  var scoreEl = document.getElementById("score");
  var totalEl = document.getElementById("total");
  var overlay = document.getElementById("overlay");
  var msgEl = document.getElementById("msg");
  var btnAgain = document.getElementById("again");
  var tl = document.getElementById("tl");
  var tj = document.getElementById("tj");
  var tr = document.getElementById("tr");

  totalEl.textContent = String(stars.length);

  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function resolvePlatforms() {
    player.onGround = false;
    var i;
    for (i = 0; i < platforms.length; i++) {
      var p = platforms[i];
      if (!rectsOverlap(player.x, player.y, player.w, player.h, p.x, p.y, p.w, p.h)) continue;
      var overlapX = Math.min(player.x + player.w - p.x, p.x + p.w - player.x);
      var overlapY = Math.min(player.y + player.h - p.y, p.y + p.h - player.y);
      if (overlapX < overlapY) {
        if (player.x + player.w / 2 < p.x + p.w / 2) player.x = p.x - player.w;
        else player.x = p.x + p.w;
        player.vx = 0;
      } else {
        if (player.vy >= 0 && player.y < p.y + p.h / 2) {
          player.y = p.y - player.h;
          player.vy = 0;
          player.onGround = true;
        } else {
          player.y = p.y + p.h;
          player.vy = 0;
        }
      }
    }
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > W) player.x = W - player.w;
    if (player.y > H + 40) {
      player.x = 80;
      player.y = 200;
      player.vx = 0;
      player.vy = 0;
    }
  }

  function spawnBurst(x, y) {
    var i;
    for (i = 0; i < 12; i++) {
      var a = (Math.PI * 2 * i) / 12;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(a) * (90 + Math.random() * 120),
        vy: Math.sin(a) * (90 + Math.random() * 120) - 40,
        life: 0.55 + Math.random() * 0.25,
      });
    }
  }

  function collectStars() {
    var n = 0;
    var i;
    for (i = 0; i < stars.length; i++) {
      var s = stars[i];
      if (s.got) {
        n += 1;
        continue;
      }
      var cx = player.x + player.w / 2;
      var cy = player.y + player.h / 2;
      var dx = cx - s.x;
      var dy = cy - s.y;
      if (dx * dx + dy * dy < (s.r + 12) * (s.r + 12)) {
        s.got = true;
        spawnBurst(s.x, s.y);
        n += 1;
      }
    }
    scoreEl.textContent = String(n);
    if (n >= stars.length && !won) {
      won = true;
      msgEl.textContent = "Đỉnh! Bạn đã thu hết coin!";
      overlay.hidden = false;
    }
  }

  function jump() {
    if (paused || won) return;
    if (player.onGround) player.vy = JUMP;
  }

  function update(dt) {
    t += dt;
    if (paused || won) return;
    var ax = 0;
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) ax -= 1;
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) ax += 1;
    player.vx += ax * MOVE * dt;
    player.vx *= FRICTION;
    if (Math.abs(player.vx) < 8 && ax === 0) player.vx = 0;
    if (player.vx > 220) player.vx = 220;
    if (player.vx < -220) player.vx = -220;
    player.x += player.vx * dt;
    player.vy += GRAV * dt;
    player.y += player.vy * dt;
    resolvePlatforms();
    collectStars();

    var i;
    for (i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt;
      p.vx *= 0.98;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawSky() {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#67b2ff");
    g.addColorStop(0.55, "#4d8fde");
    g.addColorStop(1, "#21446f");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    var drift = (t * 18) % (W + 140);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.ellipse(-40 + drift, 70, 46, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(20 + drift, 65, 34, 15, 0, 0, Math.PI * 2);
    ctx.ellipse(255 + ((t * 12) % (W + 220)), 95, 52, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPlatforms() {
    var i;
    for (i = 0; i < platforms.length; i++) {
      var p = platforms[i];
      var pg = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
      pg.addColorStop(0, "#4f8e47");
      pg.addColorStop(1, "#315f2e");
      ctx.fillStyle = pg;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#7ecb74";
      ctx.fillRect(p.x, p.y, p.w, 4);
    }
  }

  function drawCoin(cx, cy, r) {
    var g = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, r + 2);
    g.addColorStop(0, "#fff8b3");
    g.addColorStop(0.55, "#ffd84f");
    g.addColorStop(1, "#f0a90b");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(146, 91, 0, 0.45)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.beginPath();
    ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStars() {
    var i;
    for (i = 0; i < stars.length; i++) {
      var s = stars[i];
      if (s.got) continue;
      var bob = Math.sin(t * 4 + i) * 1.5;
      drawCoin(s.x, s.y + bob, s.r);
    }
  }

  function drawParticles() {
    var i;
    for (i = 0; i < particles.length; i++) {
      var p = particles[i];
      var a = Math.max(0, Math.min(1, p.life * 1.7));
      ctx.fillStyle = "rgba(255, 217, 85, " + a.toFixed(3) + ")";
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
  }

  function drawPlayer() {
    ctx.fillStyle = "#0d233f55";
    ctx.fillRect(player.x + 3, player.y + player.h + 1, player.w - 6, 5);

    var pg = ctx.createLinearGradient(player.x, player.y, player.x, player.y + player.h);
    pg.addColorStop(0, "#58d2ff");
    pg.addColorStop(1, "#1f87d5");
    ctx.fillStyle = pg;
    roundRect(player.x, player.y, player.w, player.h, 8);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(player.x + 6, player.y + 10, 5, 5);
    ctx.fillRect(player.x + 17, player.y + 10, 5, 5);
    ctx.fillStyle = "#0f2744";
    ctx.fillRect(player.x + 8, player.y + 12, 2, 2);
    ctx.fillRect(player.x + 19, player.y + 12, 2, 2);
    ctx.fillStyle = "#07213f";
    ctx.fillRect(player.x + 10, player.y + 23, 8, 2);
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function draw() {
    drawSky();
    drawPlatforms();
    drawStars();
    drawParticles();
    drawPlayer();
    if (paused) {
      ctx.fillStyle = "rgba(9, 17, 33, 0.5)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#f3f8ff";
      ctx.font = "bold 22px system-ui,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Tạm dừng", W / 2, H / 2);
    }
  }

  var last = performance.now();
  function loop(now) {
    var dt = Math.min(0.032, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function resetGame() {
    player.x = 80;
    player.y = 200;
    player.vx = 0;
    player.vy = 0;
    won = false;
    paused = false;
    var i;
    for (i = 0; i < stars.length; i++) stars[i].got = false;
    particles.length = 0;
    scoreEl.textContent = "0";
    overlay.hidden = true;
  }

  window.addEventListener("keydown", function (e) {
    if (e.code === "Space") e.preventDefault();
    if (e.code === "KeyP") {
      paused = !paused;
      return;
    }
    keys[e.code] = true;
    if (e.code === "Space" || e.code === "KeyW") jump();
  });

  window.addEventListener("keyup", function (e) {
    keys[e.code] = false;
  });

  function bindHold(btn, code) {
    if (!btn) return;
    btn.addEventListener(
      "pointerdown",
      function (e) {
        e.preventDefault();
        keys[code] = true;
      },
      { passive: false }
    );
    btn.addEventListener("pointerup", function () {
      keys[code] = false;
    });
    btn.addEventListener("pointerleave", function () {
      keys[code] = false;
    });
    btn.addEventListener("pointercancel", function () {
      keys[code] = false;
    });
  }
  bindHold(tl, "ArrowLeft");
  bindHold(tr, "ArrowRight");
  if (tj) {
    tj.addEventListener(
      "pointerdown",
      function (e) {
        e.preventDefault();
        jump();
      },
      { passive: false }
    );
  }

  btnAgain.addEventListener("click", resetGame);

  requestAnimationFrame(loop);
})();
