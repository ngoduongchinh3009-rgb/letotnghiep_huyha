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
    // `color` cho tông son tự nhiên hơn `soft-light` (đỡ bệt/loang trên da)
    ctx.globalCompositeOperation = "color";
    ctx.globalAlpha = 0.12 * alpha;
    ctx.fillStyle = "rgba(220, 65, 98, 1)";
    // Vẽ 1 path gồm outer + inner, rồi fill evenodd để "đục lỗ" phần trong môi.
    ctx.beginPath();
    pathFromIndices(ctx, pts, OUTER_LIP, w, h);
    pathFromIndices(ctx, pts, INNER_LIP, w, h);
    ctx.fill("evenodd");
    ctx.restore();

    // Má hồng nhẹ (2 điểm má)
    var l = lmXY(pts[234], w, h);
    var r = lmXY(pts[454], w, h);
    var rad = Math.min(w, h) * 0.08;

    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = 0.12 * alpha;
    var gl = ctx.createRadialGradient(l.x, l.y, 1, l.x, l.y, rad);
    gl.addColorStop(0, "rgba(245, 120, 140, 0.55)");
    gl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.arc(l.x, l.y, rad, 0, Math.PI * 2);
    ctx.fill();

    var gr = ctx.createRadialGradient(r.x, r.y, 1, r.x, r.y, rad);
    gr.addColorStop(0, "rgba(245, 120, 140, 0.55)");
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
    if (pack === "none") return false;

    // 1) Mirror landmarks correctly is already handled by lmXY().
    // 2) Compute head rotation using eye landmarks (33 & 263).
    var eyeL = lmXY(pts[33], w, h);
    var eyeR = lmXY(pts[263], w, h);
    var dx = eyeR.x - eyeL.x;
    var dy = eyeR.y - eyeL.y;
    var angle = Math.atan2(dy, dx);

    // 3) Compute scale from eye distance.
    var eyeDist = Math.sqrt(dx * dx + dy * dy);
    var size = eyeDist * 2.2;

    // 4) Compute center position.
    var centerX = (eyeL.x + eyeR.x) * 0.5;
    var centerY = (eyeL.y + eyeR.y) * 0.5;

    // 6) Add smoothing to reduce jitter (x/y/angle).
    var sm = APP.state.faceStickerSmooth || (APP.state.faceStickerSmooth = {});
    var kOld = 0.7;
    var kNew = 0.3;

    function smoothVal(oldV, curV) {
      return oldV == null ? curV : oldV * kOld + curV * kNew;
    }

    function smoothAngle(oldA, curA) {
      if (oldA == null) return curA;
      var s = Math.sin(oldA) * kOld + Math.sin(curA) * kNew;
      var c = Math.cos(oldA) * kOld + Math.cos(curA) * kNew;
      return Math.atan2(s, c);
    }

    sm.cx = smoothVal(sm.cx, centerX);
    sm.cy = smoothVal(sm.cy, centerY);
    sm.a = smoothAngle(sm.a, angle);

    // Optional: cheek anchor for flower (smoothed too, still mirrored by lmXY).
    var cheek = lmXY(pts[234], w, h);
    sm.cheekX = smoothVal(sm.cheekX, cheek.x);
    sm.cheekY = smoothVal(sm.cheekY, cheek.y);

    // Cache sticker images as small canvases (fast, works with ctx.drawImage).
    var cache = APP.__stickerCache || (APP.__stickerCache = {});
    function getStickerCanvas(key, emoji) {
      if (cache[key]) return cache[key];
      var c = document.createElement("canvas");
      c.width = 256;
      c.height = 256;
      var cx = c.getContext("2d");
      cx.clearRect(0, 0, 256, 256);
      cx.font = "900 200px system-ui, Apple Color Emoji, Segoe UI Emoji";
      cx.textAlign = "center";
      cx.textBaseline = "middle";
      cx.shadowColor = "rgba(0,0,0,0.35)";
      cx.shadowBlur = 16;
      cx.fillText(emoji, 128, 138);
      cache[key] = c;
      return c;
    }

    var capEmoji = pack === "grad" ? "🎓" : "🎓";
    var glassEmoji = "👓";
    var flowerEmoji = pack === "grad" ? "🌼" : "🌸";
    var capImg = getStickerCanvas("cap_" + capEmoji, capEmoji);
    var glassImg = getStickerCanvas("glass_" + glassEmoji, glassEmoji);
    var flowerImg = getStickerCanvas("flower_" + flowerEmoji, flowerEmoji);

    // 5) Draw sticker with proper transform (translate/rotate/drawImage).
    // Cap: above head, follows rotation, scales with size.
    ctx.save();
    ctx.translate(sm.cx, sm.cy - size * 0.6);
    ctx.rotate(sm.a);
    ctx.globalAlpha = 0.95;
    ctx.drawImage(capImg, -size / 2, -size / 2, size, size);
    ctx.restore();

    // Glasses: centered on eyes, rotate with head. Slightly smaller than cap.
    var gSize = size * 0.92;
    ctx.save();
    ctx.translate(sm.cx, sm.cy);
    ctx.rotate(sm.a);
    ctx.globalAlpha = 0.9;
    ctx.drawImage(glassImg, -gSize / 2, -gSize / 2, gSize, gSize);
    ctx.restore();

    // Flower: anchored near cheek; tiny rotate so it doesn't look rigid.
    var fSize = size * 0.45;
    ctx.save();
    ctx.translate(sm.cheekX, sm.cheekY + fSize * 0.1);
    ctx.rotate(sm.a * 0.2);
    ctx.globalAlpha = 0.95;
    ctx.drawImage(flowerImg, -fSize / 2, -fSize / 2, fSize, fSize);
    ctx.restore();

    // Spark for grad pack (rotate lightly too).
    if (pack === "grad") {
      var sparkImg = getStickerCanvas("spark_✨", "✨");
      var sSize = size * 0.4;
      ctx.save();
      ctx.translate(sm.cx + size * 0.55, sm.cy - size * 0.25);
      ctx.rotate(sm.a * 0.15);
      ctx.globalAlpha = 0.85;
      ctx.drawImage(sparkImg, -sSize / 2, -sSize / 2, sSize, sSize);
      ctx.restore();
    }

    return true;
  };

  APP.renderLiveFaceOverlay = function renderLiveFaceOverlay() {
    if (!els.camOverlay) return;
    if (!els.video || !els.video.videoWidth) return;
    if (!els.optAR || !els.optAR.checked) return;
    if (!els.optStickers || !els.optStickers.checked) return;
    if (!APP.hasFreshFaceLandmarks || !APP.hasFreshFaceLandmarks(1400)) return;

    // Match overlay canvas to displayed video size (CSS pixels).
    var rect = els.video.getBoundingClientRect();
    var cw = Math.max(1, Math.round(rect.width));
    var ch = Math.max(1, Math.round(rect.height));
    if (els.camOverlay.width !== cw) els.camOverlay.width = cw;
    if (els.camOverlay.height !== ch) els.camOverlay.height = ch;

    var c = els.camOverlay.getContext("2d");
    c.clearRect(0, 0, cw, ch);
    APP.drawFaceStickers(c, cw, ch, APP.getSelectedStickerPack());
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
          // Live preview overlay render (lightweight)
          if (APP.renderLiveFaceOverlay) APP.renderLiveFaceOverlay();
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
