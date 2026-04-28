(function () {
  "use strict";

  var APP = window.APP;
  var els = APP.els;

  APP.setPreview = function setPreview(url, blob) {
    if (!els.photoPreview || !els.previewImg) return;
    if (APP.state.lastPhotoUrl) URL.revokeObjectURL(APP.state.lastPhotoUrl);
    APP.state.lastPhotoBlob = blob || null;
    APP.state.lastPhotoUrl = url || "";
    els.previewImg.src = APP.state.lastPhotoUrl;
    els.photoPreview.hidden = !APP.state.lastPhotoUrl;
  };

  APP.setCamError = function setCamError(msg) {
    els.camError.textContent = msg;
    els.camError.hidden = !msg;
  };

  APP.stopCamera = function stopCamera() {
    if (APP.stopFaceMeshLoop) APP.stopFaceMeshLoop();
    if (APP.state.stream) {
      var tracks = APP.state.stream.getTracks();
      var t;
      for (t = 0; t < tracks.length; t++) tracks[t].stop();
      APP.state.stream = null;
    }
    els.video.srcObject = null;
  };

  APP.refreshSecureBanner = function refreshSecureBanner() {
    var el = document.getElementById("secure-banner");
    if (!el) return;
    if (window.isSecureContext) {
      el.hidden = true;
      el.textContent = "";
      return;
    }
    el.hidden = false;
    el.innerHTML =
      "<strong>Camera trên điện thoại:</strong> Trang này không chạy trong ngữ cảnh bảo mật (HTTPS / localhost). Safari và hầu hết trình duyệt mobile <em>sẽ chặn</em> camera. Hãy phục vụ trang qua <strong>HTTPS</strong> — cách nhanh nhất: <code>ngrok http 8080</code> rồi mở link <code>https://…</code> trên điện thoại.";
  };

  APP.refreshCameraPreviewEffects = function refreshCameraPreviewEffects() {
    if (!els.video) return;
    var f = APP.getSelectedFilter();
    var css = APP.filterToCssString(f);
    els.video.style.filter = css === "none" ? "" : css;
    if (els.optStickers && !els.optStickers.checked) {
      if (els.camStickers) els.camStickers.style.display = "none";
      return;
    }
    APP.setStickerPack(APP.getSelectedStickerPack());
  };

  APP.startCamera = function startCamera() {
    APP.setCamError("");
    APP.refreshSecureBanner();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      APP.setCamError(
        "Trình duyệt không hỗ trợ camera. Không mở file bằng file:// — hãy dùng máy chủ cục bộ hoặc HTTPS."
      );
      return;
    }
    if (!window.isSecureContext) {
      APP.setCamError(
        "Cần HTTPS (hoặc localhost) để bật camera — nhất là trên điện thoại. Dùng ngrok / GitHub Pages để có link https://."
      );
      return;
    }
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then(function (s) {
        APP.state.stream = s;
        els.video.srcObject = APP.state.stream;
        return els.video.play();
      })
      .then(function () {
        els.btnCapture.disabled = false;
        els.btnStartCam.textContent = "Camera đã bật";
        els.btnStartCam.disabled = true;
        APP.refreshCameraPreviewEffects();
        if (APP.startFaceMeshLoop) APP.startFaceMeshLoop();
      })
      .catch(function (err) {
        var msg = err && err.message ? err.message : "lỗi không xác định";
        APP.setCamError(
          "Không mở được camera: " +
            msg +
            " — Nếu đang dùng điện thoại: thử HTTPS (ngrok), bật quyền camera trong Cài đặt trình duyệt."
        );
      });
  };

  APP.capturePhoto = function capturePhoto() {
    if (!els.video.videoWidth) {
      APP.setCamError("Chưa có hình từ camera.");
      return;
    }
    var vw = els.video.videoWidth;
    var vh = els.video.videoHeight;
    els.snapCanvas.width = vw;
    els.snapCanvas.height = vh;
    var ctx = els.snapCanvas.getContext("2d");
    ctx.save();
    ctx.translate(vw, 0);
    ctx.scale(-1, 1);
    var base = "brightness(1.05) contrast(0.98) saturate(1.08)";
    var extra = APP.filterToCanvasString(APP.getSelectedFilter());
    ctx.filter = extra === "none" ? base : base + " " + extra;
    ctx.drawImage(els.video, 0, 0, vw, vh);
    ctx.filter = "none";
    ctx.restore();

    if (!els.optBeauty || els.optBeauty.checked) {
      APP.applyPortraitEnhance(ctx, vw, vh);
      // MediaPipe AR makeup (lip/blush) – nếu bật AR và có landmarks
      if (els.optAR && els.optAR.checked && APP.applyFaceMakeup) {
        APP.applyFaceMakeup(ctx, vw, vh, 1);
      }
    }

    // Sticker bám theo mặt (AR) — vẽ lên snapCanvas để thiệp render ra đúng
    var didFaceSticker = false;
    if (els.optStickers && els.optStickers.checked && els.optAR && els.optAR.checked) {
      if (APP.hasFreshFaceLandmarks && APP.hasFreshFaceLandmarks(1400) && APP.drawFaceStickers) {
        didFaceSticker = APP.drawFaceStickers(ctx, vw, vh, APP.getSelectedStickerPack());
      }
    }

    var outW = 1080;
    var outH = 1920;
    if (els.cardCanvas) {
      els.cardCanvas.width = outW;
      els.cardCanvas.height = outH;
      var out = els.cardCanvas.getContext("2d");
      APP.drawClassicCardToCanvas(out, outW, outH, els.snapCanvas);
      if (!els.optStickers || els.optStickers.checked) {
        // Nếu đã vẽ sticker bám mặt lên snapCanvas thì không cần sticker góc nữa (tránh rối)
        if (!didFaceSticker) APP.drawStickerPackOnCanvas(out, outW, outH, APP.getSelectedStickerPack());
      }
    }

    (els.cardCanvas || els.snapCanvas).toBlob(
      function (blob) {
        if (!blob) return;
        var previewUrl = URL.createObjectURL(blob);
        APP.setPreview(previewUrl, blob);
        APP.downloadBlob(blob, "ky-niem-tot-nghiep.png");
        if (els.cardPhoto) {
          els.cardPhoto.src = previewUrl;
          els.cardPhoto.hidden = false;
        }
        if (els.cardPlaceholder) els.cardPlaceholder.hidden = true;
        if (els.wishUseLast) els.wishUseLast.checked = true;
      },
      "image/png"
    );
  };

  APP.retake = function retake() {
    if (els.photoPreview) els.photoPreview.hidden = true;
    if (els.previewImg) els.previewImg.src = "";
    if (APP.state.lastPhotoUrl) {
      URL.revokeObjectURL(APP.state.lastPhotoUrl);
      APP.state.lastPhotoUrl = "";
    }
    APP.state.lastPhotoBlob = null;
  };

  APP.downloadAgain = function downloadAgain() {
    if (!APP.state.lastPhotoBlob) return;
    APP.downloadBlob(APP.state.lastPhotoBlob, "ky-niem-tot-nghiep.png");
  };

  APP.sharePhoto = function sharePhoto() {
    if (!APP.state.lastPhotoBlob) return;
    if (!navigator.share) {
      APP.setCamError("Trình duyệt chưa hỗ trợ chia sẻ trực tiếp. Dùng nút Tải lại PNG.");
      return;
    }
    var file = new File([APP.state.lastPhotoBlob], "ky-niem-tot-nghiep.png", { type: "image/png" });
    if (navigator.canShare && !navigator.canShare({ files: [file] })) {
      APP.setCamError("Thiết bị không hỗ trợ chia sẻ file ảnh trực tiếp.");
      return;
    }
    navigator.share({ title: "Ảnh kỷ niệm tốt nghiệp", text: "Ảnh kỷ niệm tốt nghiệp", files: [file] }).catch(function () {});
  };
})();
