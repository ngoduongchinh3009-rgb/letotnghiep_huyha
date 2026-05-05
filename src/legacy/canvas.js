(function () {
  "use strict";

  var APP = window.APP;

  APP.pathRoundRect = function pathRoundRect(ctx, x, y, rw, rh, r) {
    var rr = Math.min(r, rw / 2, rh / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + rw - rr, y);
    ctx.quadraticCurveTo(x + rw, y, x + rw, y + rr);
    ctx.lineTo(x + rw, y + rh - rr);
    ctx.quadraticCurveTo(x + rw, y + rh, x + rw - rr, y + rh);
    ctx.lineTo(x + rr, y + rh);
    ctx.quadraticCurveTo(x, y + rh, x, y + rh - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  };

  APP.applyPortraitEnhance = function applyPortraitEnhance(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = "rgba(255, 238, 232, 0.085)";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    var lip = ctx.createRadialGradient(
      w * 0.5,
      h * 0.57,
      1,
      w * 0.5,
      h * 0.57,
      Math.min(w, h) * 0.14
    );
    lip.addColorStop(0, "rgba(230, 95, 118, 0.14)");
    lip.addColorStop(0.4, "rgba(248, 180, 188, 0.06)");
    lip.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = lip;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.57, w * 0.11, h * 0.048, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    var b1 = ctx.createRadialGradient(
      w * 0.36,
      h * 0.53,
      1,
      w * 0.36,
      h * 0.53,
      Math.min(w, h) * 0.1
    );
    b1.addColorStop(0, "rgba(245, 120, 140, 0.09)");
    b1.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = b1;
    ctx.beginPath();
    ctx.arc(w * 0.36, h * 0.53, Math.min(w, h) * 0.1, 0, Math.PI * 2);
    ctx.fill();
    var b2 = ctx.createRadialGradient(
      w * 0.64,
      h * 0.53,
      1,
      w * 0.64,
      h * 0.53,
      Math.min(w, h) * 0.1
    );
    b2.addColorStop(0, "rgba(245, 120, 140, 0.09)");
    b2.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = b2;
    ctx.beginPath();
    ctx.arc(w * 0.64, h * 0.53, Math.min(w, h) * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    try {
      var soft = document.createElement("canvas");
      soft.width = w;
      soft.height = h;
      var sx = soft.getContext("2d");
      sx.filter = "blur(0.9px)";
      sx.drawImage(APP.els.snapCanvas, 0, 0, w, h);
      ctx.save();
      ctx.globalAlpha = 0.14;
      ctx.globalCompositeOperation = "normal";
      ctx.drawImage(soft, 0, 0);
      ctx.restore();
    } catch (e) {
      // ignore
    }
  };

  APP.applyGlobalSoftBeauty = function applyGlobalSoftBeauty(ctx, w, h, strength) {
    var s = Math.max(0, Math.min(1, typeof strength === "number" ? strength : 0.42));
    if (s <= 0) return;
    try {
      var c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      var cx = c.getContext("2d");
      cx.filter = "blur(" + (1.15 + s * 1.55).toFixed(2) + "px)";
      cx.drawImage(ctx.canvas, 0, 0, w, h);
      cx.filter = "none";
      ctx.save();
      ctx.globalAlpha = 0.12 + s * 0.24;
      ctx.drawImage(c, 0, 0, w, h);
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "soft-light";
      ctx.fillStyle = "rgba(255, 235, 224, " + (0.06 + s * 0.07).toFixed(3) + ")";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    } catch (e) {
      // ignore
    }
  };

  

  APP.drawGraduationMemorialToCanvas = function drawGraduationMemorialToCanvas(out, ow, oh, photoSource) {
    out.clearRect(0, 0, ow, oh);
    var g0 = out.createLinearGradient(0, 0, 0, oh);
    g0.addColorStop(0, "#2d0f14");
    g0.addColorStop(0.5, "#17080c");
    g0.addColorStop(1, "#12070a");
    out.fillStyle = g0;
    out.fillRect(0, 0, ow, oh);

    var fx = ow * 0.075;
    var fy = oh * 0.095;
    var fw = ow * 0.85;
    var fh = oh * 0.67;
    var rad = Math.min(34, Math.min(fw, fh) * 0.065);

    out.save();
    out.shadowColor = "rgba(0,0,0,0.48)";
    out.shadowBlur = 24;
    out.shadowOffsetY = 10;
    out.fillStyle = "rgba(255,255,255,0.08)";
    APP.pathRoundRect(out, fx, fy, fw, fh, rad);
    out.fill();
    out.restore();

    out.save();
    APP.pathRoundRect(out, fx, fy, fw, fh, rad);
    out.clip();
    if (photoSource) {
      var sw = photoSource.width || photoSource.videoWidth || ow;
      var sh = photoSource.height || photoSource.videoHeight || oh;
      var targetAR = fw / fh;
      var srcAR = sw / sh;
      var sx = 0,
        sy = 0,
        sww = sw,
        shh = sh;
      if (srcAR > targetAR) {
        sww = sh * targetAR;
        sx = (sw - sww) / 2;
      } else {
        shh = sw / targetAR;
        sy = (sh - shh) / 2;
      }
      out.drawImage(photoSource, sx, sy, sww, shh, fx, fy, fw, fh);
    }
    out.restore();

    out.strokeStyle = "rgba(243, 205, 118, 0.96)";
    out.lineWidth = Math.max(4, Math.min(ow, oh) * 0.0055);
    APP.pathRoundRect(out, fx, fy, fw, fh, rad);
    out.stroke();

    out.save();
    out.strokeStyle = "rgba(255, 246, 214, 0.56)";
    out.lineWidth = Math.max(1.4, Math.min(ow, oh) * 0.002);
    APP.pathRoundRect(out, fx + ow * 0.008, fy + ow * 0.008, fw - ow * 0.016, fh - ow * 0.016, rad * 0.82);
    out.stroke();
    out.restore();

    var bandY = oh * 0.79;
    var bandH = oh - bandY - oh * 0.05;
    out.save();
    var gb = out.createLinearGradient(0, bandY, 0, oh);
    gb.addColorStop(0, "rgba(76, 24, 34, 0.95)");
    gb.addColorStop(1, "rgba(24, 9, 13, 0.985)");
    out.fillStyle = gb;
    APP.pathRoundRect(out, ow * 0.08, bandY, ow * 0.84, bandH, Math.max(16, ow * 0.02));
    out.fill();
    out.strokeStyle = "rgba(244, 212, 136, 0.55)";
    out.lineWidth = Math.max(2, ow * 0.0028);
    out.stroke();
    out.restore();

    var line =
      (APP.CONFIG &&
        APP.CONFIG.cameraMemorialLine &&
        String(APP.CONFIG.cameraMemorialLine).trim()) ||
      "Chúc mừng tốt nghiệp!";
    var lines = line.split(/\n+/);
    out.save();
    out.textAlign = "center";
    out.fillStyle = "#fff6de";
    out.shadowColor = "rgba(0,0,0,0.45)";
    out.shadowBlur = 8;
    var fs = Math.max(26, Math.min(ow, oh) * 0.0315);
    out.font = "700 " + fs + "px Be Vietnam Pro, system-ui, Segoe UI, sans-serif";
    var lh = fs * 1.34;
    var totalH = lines.length * lh;
    var startY = bandY + (bandH - totalH) / 2 + lh * 0.75;
    var i;
    for (i = 0; i < lines.length; i++) {
      out.fillText(lines[i].trim(), ow / 2, startY + i * lh);
    }
    out.restore();
  };

  APP.drawClassicCardToCanvas = function drawClassicCardToCanvas(out, ow, oh, photoSource) {
    out.clearRect(0, 0, ow, oh);
    out.fillStyle = "#2c1810";
    out.fillRect(0, 0, ow, oh);

    if (APP.state.classicBgReady && APP.state.classicBgImg && APP.state.classicBgImg.complete) {
      out.drawImage(APP.state.classicBgImg, 0, 0, ow, oh);
    } else {
      var g = out.createLinearGradient(0, 0, 0, oh);
      g.addColorStop(0, "#3b1f15");
      g.addColorStop(1, "#1c0d08");
      out.fillStyle = g;
      out.fillRect(0, 0, ow, oh);
    }

    var fx = ow * 0.305;
    var fy = oh * 0.265;
    var fw = ow * 0.39;
    var fh = oh * 0.33;

    out.save();
    out.shadowColor = "rgba(0,0,0,0.45)";
    out.shadowBlur = 18;
    out.shadowOffsetY = 8;
    out.fillStyle = "rgba(255,255,255,0.1)";
    APP.pathRoundRect(out, fx, fy, fw, fh, 14);
    out.fill();
    out.restore();

    out.save();
    APP.pathRoundRect(out, fx, fy, fw, fh, 14);
    out.clip();
    if (photoSource) {
      var sw = photoSource.width || photoSource.videoWidth || ow;
      var sh = photoSource.height || photoSource.videoHeight || oh;
      var targetAR = fw / fh;
      var srcAR = sw / sh;
      var sx = 0,
        sy = 0,
        sww = sw,
        shh = sh;
      if (srcAR > targetAR) {
        sww = sh * targetAR;
        sx = (sw - sww) / 2;
      } else {
        shh = sw / targetAR;
        sy = (sh - shh) / 2;
      }
      out.drawImage(photoSource, sx, sy, sww, shh, fx, fy, fw, fh);
    } else {
      out.fillStyle = "rgba(0,0,0,0.08)";
      out.fillRect(fx, fy, fw, fh);
    }
    out.restore();

    out.strokeStyle = "rgba(255, 248, 231, 0.9)";
    out.lineWidth = Math.max(3, Math.min(ow, oh) * 0.006);
    APP.pathRoundRect(out, fx, fy, fw, fh, 14);
    out.stroke();

    out.save();
    out.textAlign = "center";
    out.fillStyle = "rgba(255, 248, 231, 0.97)";
    out.shadowColor = "rgba(0,0,0,0.55)";
    out.shadowBlur = 10;
    out.font =
      "800 " +
      Math.max(30, Math.min(ow, oh) * 0.05) +
      "px Palatino Linotype, Georgia, serif";
    out.fillText("MỜI DỰ LỄ TỐT NGHIỆP", ow / 2, oh * 0.115);
    out.font =
      "700 " + Math.max(18, Math.min(ow, oh) * 0.032) + "px system-ui, sans-serif";
    out.fillText(
      APP.CONFIG.studentName + " · " + APP.CONFIG.eventTime + " · " + APP.CONFIG.eventPlace,
      ow / 2,
      oh * 0.155
    );
    out.restore();

    out.save();
    out.textAlign = "center";
    out.fillStyle = "rgba(255, 248, 231, 0.97)";
    out.shadowColor = "rgba(0,0,0,0.55)";
    out.shadowBlur = 10;
    out.font =
      "800 " +
      Math.max(26, Math.min(ow, oh) * 0.045) +
      "px Palatino Linotype, Georgia, serif";
    out.fillText("TRÂN TRỌNG KÍNH MỜI", ow / 2, oh * 0.84);
    out.font =
      "650 " + Math.max(18, Math.min(ow, oh) * 0.032) + "px system-ui, sans-serif";
    out.fillText("Cảm ơn vì sự có mặt của bạn.", ow / 2, oh * 0.885);
    out.restore();
  };
})();
export {};
