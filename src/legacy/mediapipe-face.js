(function () {
  "use strict";

  var APP = window.APP;

  APP.isMediaPipeReady = function isMediaPipeReady() {
    return typeof window.FaceMesh !== "undefined";
  };

  function lmXY(lm, w, h) {
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

  var OUTER_LIP = [61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146];
  var INNER_LIP = [78,95,88,178,87,14,317,402,318,324,308,415,310,311,312,13,82,81,80,191];

  APP.applyFaceMakeup = function applyFaceMakeup(ctx, w, h, strength) {
    var pts = APP.state.faceLandmarks;
    if (!pts || !pts.length) return;

    var alpha = typeof strength === "number" ? strength : 1;

    ctx.save();
    ctx.globalCompositeOperation = "color";
    ctx.globalAlpha = 0.12 * alpha;
    ctx.fillStyle = "rgba(220, 65, 98, 1)";
    ctx.beginPath();
    pathFromIndices(ctx, pts, OUTER_LIP, w, h);
    pathFromIndices(ctx, pts, INNER_LIP, w, h);
    ctx.fill("evenodd");
    ctx.restore();

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

  APP.drawFaceStickers = function drawFaceStickers(ctx, w, h) {
    var pts = APP.state.faceLandmarks;
    if (!pts || !pts.length) return false;

    var eyeL = lmXY(pts[33], w, h);
    var eyeR = lmXY(pts[263], w, h);
    var dx = eyeR.x - eyeL.x;
    var dy = eyeR.y - eyeL.y;
    var angle = Math.atan2(dy, dx);

    var eyeDist = Math.sqrt(dx * dx + dy * dy);
    var size = eyeDist * 2.2;

    var centerX = (eyeL.x + eyeR.x) * 0.5;
    var centerY = (eyeL.y + eyeR.y) * 0.5;

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

    var cheek = lmXY(pts[234], w, h);
    sm.cheekX = smoothVal(sm.cheekX, cheek.x);
    sm.cheekY = smoothVal(sm.cheekY, cheek.y);

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

    var capImg = getStickerCanvas("cap_🎓", "🎓");

    ctx.save();
    ctx.translate(sm.cx, sm.cy - size * 0.6);
    ctx.rotate(sm.a);
    ctx.globalAlpha = 0.95;
    ctx.drawImage(capImg, -size / 2, -size / 2, size, size);
    ctx.restore();

    return true;
  };

  APP.renderLiveFaceOverlay = function renderLiveFaceOverlay() {
    if (!APP.els.camOverlay) return;
    if (!APP.els.video || !APP.els.video.videoWidth) return;

    var rect = APP.els.video.getBoundingClientRect();
    var cw = Math.max(1, Math.round(rect.width));
    var ch = Math.max(1, Math.round(rect.height));
    if (APP.els.camOverlay.width !== cw) APP.els.camOverlay.width = cw;
    if (APP.els.camOverlay.height !== ch) APP.els.camOverlay.height = ch;

    var c = APP.els.camOverlay.getContext("2d");
    c.clearRect(0, 0, cw, ch);
    var canTrack = APP.hasFreshFaceLandmarks && APP.hasFreshFaceLandmarks(1400);
    if (canTrack) {
      APP.drawFaceStickers(c, cw, ch);
    } else {
      c.save();
      c.globalAlpha = 0.55;
      c.font = "900 " + Math.round(Math.min(cw, ch) * 0.16) + "px system-ui, Apple Color Emoji, Segoe UI Emoji";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.shadowColor = "rgba(0,0,0,0.35)";
      c.shadowBlur = 12;
      c.fillText("🎓", cw * 0.5, ch * 0.18);
      c.restore();
    }
  };

  APP.initFaceMeshMaybe = function initFaceMeshMaybe() {
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
    if (!APP.initFaceMeshMaybe()) return;
    if (APP.state.faceMeshRunning) return;

    APP.state.faceMeshRunning = true;
    (function tick() {
      if (!APP.state.faceMeshRunning) return;
      if (!APP.els.video || !APP.els.video.videoWidth) {
        requestAnimationFrame(tick);
        return;
      }
      APP.state.faceMesh
        .send({ image: APP.els.video })
        .then(function () {
          if (APP.renderLiveFaceOverlay) APP.renderLiveFaceOverlay();
          requestAnimationFrame(tick);
        })
        .catch(function () {
          requestAnimationFrame(tick);
        });
    })();
  };

  APP.stopFaceMeshLoop = function stopFaceMeshLoop() {
    APP.state.faceMeshRunning = false;
  };
})();
export {};
