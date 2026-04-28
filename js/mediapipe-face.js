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
