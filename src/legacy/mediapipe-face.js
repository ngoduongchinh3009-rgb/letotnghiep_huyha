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

  // Lip contours in canonical MediaPipe order (avoids crossing when mouth opens).
  var OUTER_LIP = [61,146,91,181,84,17,314,405,321,375,291,409,270,269,267,0,37,39,40,185];
  var INNER_LIP = [78,95,88,178,87,14,317,402,318,324,308,415,310,311,312,13,82,81,80,191];
  var FACE_OVAL = [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109];
  var LEFT_EYE = [33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7];
  var RIGHT_EYE = [263,466,388,387,386,385,384,398,362,382,381,380,374,373,390,249];
  var LEFT_BROW = [70,63,105,66,107,55,65,52,53,46];
  var RIGHT_BROW = [336,296,334,293,300,285,295,282,283,276];

  function pathIndices(ctx, pts, idxs, w, h) {
    var i;
    for (i = 0; i < idxs.length; i++) {
      var p = lmXY(pts[idxs[i]], w, h);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
  }

  function drawFeatureCutouts(ctx, pts, w, h) {
    ctx.beginPath();
    pathIndices(ctx, pts, LEFT_EYE, w, h);
    pathIndices(ctx, pts, RIGHT_EYE, w, h);
    pathIndices(ctx, pts, LEFT_BROW, w, h);
    pathIndices(ctx, pts, RIGHT_BROW, w, h);
    pathIndices(ctx, pts, OUTER_LIP, w, h);
    pathIndices(ctx, pts, INNER_LIP, w, h);
    ctx.fill("nonzero");
  }

  APP.applySkinSmoothing = function applySkinSmoothing(ctx, w, h, strength) {
    var pts = APP.state.faceLandmarks;
    if (!pts || !pts.length) return;

    var s = Math.max(0, Math.min(1, typeof strength === "number" ? strength : 0.5));
    if (s <= 0) return;

    var cache = APP.__skinSmoothCache || (APP.__skinSmoothCache = {});
    function ensureCanvas(key) {
      var c = cache[key];
      if (!c) {
        c = document.createElement("canvas");
        cache[key] = c;
      }
      if (c.width !== w) c.width = w;
      if (c.height !== h) c.height = h;
      return c;
    }

    var srcC = ensureCanvas("src");
    var blurC = ensureCanvas("blur");
    var maskC = ensureCanvas("mask");
    var skinC = ensureCanvas("skin");

    var src = srcC.getContext("2d");
    var blur = blurC.getContext("2d");
    var mask = maskC.getContext("2d");
    var skin = skinC.getContext("2d");

    src.clearRect(0, 0, w, h);
    src.drawImage(ctx.canvas, 0, 0, w, h);

    blur.clearRect(0, 0, w, h);
    blur.filter = "blur(" + (2.2 + s * 2.8).toFixed(2) + "px)";
    blur.drawImage(srcC, 0, 0, w, h);
    blur.filter = "none";

    mask.clearRect(0, 0, w, h);
    mask.fillStyle = "#fff";
    mask.beginPath();
    pathIndices(mask, pts, FACE_OVAL, w, h);
    mask.fill();
    mask.globalCompositeOperation = "destination-out";
    drawFeatureCutouts(mask, pts, w, h);
    mask.globalCompositeOperation = "source-over";

    skin.clearRect(0, 0, w, h);
    skin.drawImage(blurC, 0, 0, w, h);
    skin.globalCompositeOperation = "destination-in";
    skin.drawImage(maskC, 0, 0, w, h);
    skin.globalCompositeOperation = "source-over";

    ctx.save();
    ctx.globalAlpha = 0.3 + s * 0.32;
    ctx.drawImage(skinC, 0, 0, w, h);
    ctx.restore();
  };

  APP.getLipOpacity = function getLipOpacity() {
    if (!APP.els || !APP.els.camLipOpacity) return 0.68;
    var raw = Number(APP.els.camLipOpacity.value);
    if (!isFinite(raw)) return 0.68;
    return Math.max(0, Math.min(1, raw / 100));
  };

  APP.applyLipstickFilter = function applyLipstickFilter(ctx, w, h, strength) {
    var pts = APP.state.faceLandmarks;
    if (!pts || !pts.length) return;

    var alpha = typeof strength === "number" ? strength : APP.getLipOpacity();
    if (alpha <= 0) return;

    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(235, 18, 78, 0.66)";
    ctx.beginPath();
    pathFromIndices(ctx, pts, OUTER_LIP, w, h);
    pathFromIndices(ctx, pts, INNER_LIP, w, h);
    ctx.fill("evenodd");
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = Math.min(1, alpha * 0.55);
    ctx.fillStyle = "rgba(255, 126, 156, 0.44)";
    ctx.beginPath();
    pathFromIndices(ctx, pts, OUTER_LIP, w, h);
    pathFromIndices(ctx, pts, INNER_LIP, w, h);
    ctx.fill("evenodd");
    ctx.restore();
  };

  APP.applyUnderEyeBrighten = function applyUnderEyeBrighten(ctx, w, h, strength) {
    var pts = APP.state.faceLandmarks;
    if (!pts || !pts.length) return;
    var s = Math.max(0, Math.min(1, typeof strength === "number" ? strength : 0.45));
    if (s <= 0) return;
    function p(i) {
      return lmXY(pts[i], w, h);
    }
    var leftOuter = p(33);
    var leftInner = p(133);
    var rightOuter = p(263);
    var rightInner = p(362);
    var leftCenter = { x: (leftOuter.x + leftInner.x) * 0.5, y: (leftOuter.y + leftInner.y) * 0.5 };
    var rightCenter = { x: (rightOuter.x + rightInner.x) * 0.5, y: (rightOuter.y + rightInner.y) * 0.5 };
    var eyeSpan = Math.max(8, dist(leftOuter, leftInner));
    var eyeSpanR = Math.max(8, dist(rightOuter, rightInner));

    function drawSpot(c, span) {
      var gy = span * 0.48;
      var gx = span * 1.18;
      var grad = ctx.createRadialGradient(c.x, c.y + gy * 0.45, 1, c.x, c.y + gy * 0.45, gx);
      grad.addColorStop(0, "rgba(255, 244, 228, " + (0.25 + s * 0.24).toFixed(3) + ")");
      grad.addColorStop(0.55, "rgba(255, 236, 216, " + (0.11 + s * 0.1).toFixed(3) + ")");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y + gy, gx, gy, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    drawSpot(leftCenter, eyeSpan);
    drawSpot(rightCenter, eyeSpanR);
    ctx.restore();
  };

  // Backward compatible alias used by existing flow.
  APP.applyFaceMakeup = function applyFaceMakeup(ctx, w, h, strength) {
    APP.applyLipstickFilter(ctx, w, h, strength);
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
    var beautyMode = APP.els.camBeautyMode && APP.els.camBeautyMode.value ? APP.els.camBeautyMode.value : "soft";
    if (beautyMode !== "off" && APP.els.video && APP.els.video.videoWidth) {
      // Draw mirrored video frame, then blend skin-only blur on top.
      c.save();
      c.translate(cw, 0);
      c.scale(-1, 1);
      c.drawImage(APP.els.video, 0, 0, cw, ch);
      c.restore();
      var hasLandmarks =
        APP.state &&
        APP.state.faceLandmarks &&
        APP.state.faceLandmarks.length &&
        APP.hasFreshFaceLandmarks &&
        APP.hasFreshFaceLandmarks(1800);
      APP.applySkinSmoothing(c, cw, ch, hasLandmarks ? 0.8 : 0.44);
      APP.applyUnderEyeBrighten(c, cw, ch, hasLandmarks ? 0.56 : 0.28);
      if (!hasLandmarks && APP.applyGlobalSoftBeauty) APP.applyGlobalSoftBeauty(c, cw, ch, 0.5);
      APP.applyLipstickFilter(c, cw, ch, APP.getLipOpacity());
    }
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
