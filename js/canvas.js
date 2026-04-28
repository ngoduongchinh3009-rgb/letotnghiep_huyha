(function () {
  "use strict";

  var APP = window.APP;
  var els = APP.els;

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
      sx.drawImage(els.snapCanvas, 0, 0, w, h);
      ctx.save();
      ctx.globalAlpha = 0.14;
      ctx.globalCompositeOperation = "normal";
      ctx.drawImage(soft, 0, 0);
      ctx.restore();
    } catch (e) {
      // ignore
    }
  };

  APP.drawCuteStickersOnCanvas = function drawCuteStickersOnCanvas(ctx, w, h) {
    ctx.save();
    ctx.font =
      "900 " +
      Math.max(28, Math.min(w, h) * 0.06) +
      "px system-ui, Apple Color Emoji, Segoe UI Emoji";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 10;
    ctx.globalAlpha = 0.95;
    ctx.fillText("💗", w * 0.13, h * 0.16);
    ctx.fillText("✨", w * 0.87, h * 0.16);
    ctx.fillText("🌸", w * 0.13, h * 0.84);
    ctx.fillText("🎓", w * 0.87, h * 0.84);
    ctx.restore();
  };

  APP.getSelectedFilter = function getSelectedFilter() {
    return els.filterSelect ? String(els.filterSelect.value || "none") : "none";
  };

  APP.getSelectedStickerPack = function getSelectedStickerPack() {
    return els.stickerSelect ? String(els.stickerSelect.value || "cute") : "cute";
  };

  APP.filterToCanvasString = function filterToCanvasString(kind) {
    if (kind === "warm")
      return "brightness(1.06) contrast(1.02) saturate(1.18) sepia(0.12)";
    if (kind === "cool")
      return "brightness(1.02) contrast(1.05) saturate(1.05) hue-rotate(185deg)";
    if (kind === "bw") return "grayscale(1) contrast(1.08) brightness(1.03)";
    return "none";
  };

  APP.filterToCssString = function filterToCssString(kind) {
    if (kind === "warm") return "brightness(1.04) contrast(1.02) saturate(1.12)";
    if (kind === "cool")
      return "brightness(1.02) contrast(1.04) saturate(1.03) hue-rotate(190deg)";
    if (kind === "bw") return "grayscale(1) contrast(1.06)";
    return "none";
  };

  APP.setStickerPack = function setStickerPack(pack) {
    if (!els.camStickers) return;
    var nodes = els.camStickers.querySelectorAll(".sticker");
    if (!nodes || nodes.length < 4) return;
    if (pack === "none") {
      els.camStickers.style.display = "none";
      return;
    }
    els.camStickers.style.display = "";
    if (pack === "grad") {
      nodes[0].textContent = "🎓";
      nodes[1].textContent = "📜";
      nodes[2].textContent = "🌼";
      nodes[3].textContent = "✨";
      return;
    }
    nodes[0].textContent = "💗";
    nodes[1].textContent = "✨";
    nodes[2].textContent = "🌸";
    nodes[3].textContent = "🎓";
  };

  APP.drawStickerPackOnCanvas = function drawStickerPackOnCanvas(ctx, w, h, pack) {
    if (pack === "none") return;
    if (pack === "grad") {
      ctx.save();
      ctx.font =
        "900 " +
        Math.max(28, Math.min(w, h) * 0.06) +
        "px system-ui, Apple Color Emoji, Segoe UI Emoji";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 10;
      ctx.globalAlpha = 0.95;
      ctx.fillText("🎓", w * 0.13, h * 0.16);
      ctx.fillText("📜", w * 0.87, h * 0.16);
      ctx.fillText("🌼", w * 0.13, h * 0.84);
      ctx.fillText("✨", w * 0.87, h * 0.84);
      ctx.restore();
      return;
    }
    APP.drawCuteStickersOnCanvas(ctx, w, h);
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
