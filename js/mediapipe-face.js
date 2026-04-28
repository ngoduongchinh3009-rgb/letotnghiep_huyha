(function () {
  "use strict";

  var APP = window.APP;
  var els = APP.els;

  APP.isMediaPipeReady = function isMediaPipeReady() {
    return typeof window.FaceMesh !== "undefined";
  };

  function lmXY(lm, w, h) {
    // Vì lúc chụp mình lật gương, landmark cần mirror X để khớp canvas đã mirror.
    return { x: (1 - lm.x) * w, y: lm.y * h };
  }

  function pathFromIndices(ctx, pts, idxs, w, h) {
    var i;
    for (i = 0; i < idxs.length; i++) {
      var p = lmXY(pts[idxs[i]], w, h);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
  }

  // Indices theo MediaPipe FaceMesh (468 landmarks)
  var OUTER_LIP = [61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146];
  var INNER_LIP = [78,95,88,178,87,14,317,402,318,324,308,415,310,311,312,13,82,81,80,191];

  APP.applyFaceMakeup = function applyFaceMakeup(ctx, w, h, strength) {
    var pts = APP.state.faceLandmarks;
    if (!pts || !pts.length) return;

    var alpha = typeof strength === "number" ? strength : 1;

    // Son nhẹ theo hình môi
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = 0.28 * alpha;
    ctx.fillStyle = "rgba(220, 65, 98, 1)";
    ctx.beginPath();
    pathFromIndices(ctx, pts, OUTER_LIP, w, h);
    // khoét phần trong môi cho tự nhiên
    ctx.moveTo(0, 0);
    ctx.beginPath();
    pathFromIndices(ctx, pts, INNER_LIP, w, h);
    ctx.fill("evenodd");
    ctx.restore();

    // Má hồng nhẹ (2 điểm má)
    var l = lmXY(pts[234], w, h);
    var r = lmXY(pts[454], w, h);
    var rad = Math.min(w, h) * 0.08;

    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = 0.22 * alpha;
    var gl = ctx.createRadialGradient(l.x, l.y, 1, l.x, l.y, rad);
    gl.addColorStop(0, "rgba(245, 120, 140, 0.75)");
    gl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.arc(l.x, l.y, rad, 0, Math.PI * 2);
    ctx.fill();

    var gr = ctx.createRadialGradient(r.x, r.y, 1, r.x, r.y, rad);
    gr.addColorStop(0, "rgba(245, 120, 140, 0.75)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(r.x, r.y, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  function dist(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function rot(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  function drawEmoji(ctx, emoji, cx, cy, size, angleRad, alpha) {
    ctx.save();
    ctx.translate(cx, cy);
    if (angleRad) ctx.rotate(angleRad);
    ctx.globalAlpha = typeof alpha === "number" ? alpha : 1;
    ctx.font = "900 " + Math.round(size) + "px system-ui, Apple Color Emoji, Segoe UI Emoji";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = Math.max(6, size * 0.18);
    ctx.fillText(emoji, 0, 0);
    ctx.restore();
  }

  APP.hasFreshFaceLandmarks = function hasFreshFaceLandmarks(maxAgeMs) {
    var pts = APP.state.faceLandmarks;
    if (!pts || !pts.length) return false;
    var age = Date.now() - (APP.state.faceLandmarksAt || 0);
    return age <= (typeof maxAgeMs === "number" ? maxAgeMs : 1200);
  };

  APP.drawFaceStickers = function drawFaceStickers(ctx, w, h, pack) {
    var pts = APP.state.faceLandmarks;
    if (!pts || !pts.length) return false;

    // Kích thước theo bề ngang mặt (2 má)
    var cheekL = lmXY(pts[234], w, h);
    var cheekR = lmXY(pts[454], w, h);
    var faceW = dist(cheekL, cheekR);
    faceW = clamp(faceW, Math.min(w, h) * 0.2, Math.min(w, h) * 0.7);

    // Góc nghiêng mặt dùng đường nối 2 mắt (outer corners)
    var eyeL = lmXY(pts[33], w, h);
    var eyeR = lmXY(pts[263], w, h);
    var ang = rot(eyeL, eyeR);

    // Điểm trán (10) và giữa mắt (168) để đặt mũ
    var forehead = lmXY(pts[10], w, h);
    var midEyes = lmXY(pts[168], w, h);

    // Điểm má để đặt hoa
    var flowerOn = lmXY(pts[234], w, h); // má trái (theo ảnh đã mirror)

    // Center để đặt kính
    var glassCx = (eyeL.x + eyeR.x) * 0.5;
    var glassCy = (eyeL.y + eyeR.y) * 0.5;

    var isNone = pack === "none";
    if (isNone) return false;

    // Pack mapping
    var capEmoji = pack === "grad" ? "🎓" : "🎓";
    var glassEmoji = pack === "grad" ? "👓" : "👓";
    var flowerEmoji = pack === "grad" ? "🌼" : "🌸";

    // Mũ cử nhân: đặt hơi phía trên trán, theo góc mặt
    var capSize = faceW * 0.42;
    var capX = forehead.x;
    var capY = forehead.y - faceW * 0.18;
    drawEmoji(ctx, capEmoji, capX, capY, capSize, ang * 0.25, 0.98);

    // Kính: đặt tại giữa mắt
    var glassSize = faceW * 0.38;
    drawEmoji(ctx, glassEmoji, glassCx, glassCy, glassSize, ang, 0.92);

    // Hoa: đặt má
    var flowerSize = faceW * 0.22;
    drawEmoji(ctx, flowerEmoji, flowerOn.x - faceW * 0.02, flowerOn.y + faceW * 0.02, flowerSize, 0, 0.96);

    // Spark nhẹ gần thái dương
    if (pack === "grad") {
      var temple = lmXY(pts[356], w, h);
      drawEmoji(ctx, "✨", temple.x + faceW * 0.12, temple.y - faceW * 0.06, faceW * 0.18, 0, 0.9);
    }
    return true;
  };

  APP.initFaceMeshMaybe = function initFaceMeshMaybe() {
    if (!els.optAR || !els.optAR.checked) return false;
    if (!APP.isMediaPipeReady()) return false;
    if (APP.state.faceMesh) return true;

    try {
      var fm = new window.FaceMesh({
        locateFile: function (file) {
          return "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/" + file;
        },
      });
      fm.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      fm.onResults(function (res) {
        var arr = res && res.multiFaceLandmarks && res.multiFaceLandmarks[0];
        if (!arr) return;
        APP.state.faceLandmarks = arr;
        APP.state.faceLandmarksAt = Date.now();
      });
      APP.state.faceMesh = fm;
      return true;
    } catch (e) {
      return false;
    }
  };

  APP.startFaceMeshLoop = function startFaceMeshLoop() {
    if (!els.optAR || !els.optAR.checked) return;
    if (!APP.initFaceMeshMaybe()) return;
    if (APP.state.faceMeshRunning) return;

    APP.state.faceMeshRunning = true;
    (function tick() {
      if (!APP.state.faceMeshRunning) return;
      if (!els.video || !els.video.videoWidth) {
        requestAnimationFrame(tick);
        return;
      }
      APP.state.faceMesh
        .send({ image: els.video })
        .then(function () {
          requestAnimationFrame(tick);
        })
        .catch(function () {
          // nếu lỗi (thường do background tab), vẫn tiếp tục nhẹ nhàng
          requestAnimationFrame(tick);
        });
    })();
  };

  APP.stopFaceMeshLoop = function stopFaceMeshLoop() {
    APP.state.faceMeshRunning = false;
  };
})();
