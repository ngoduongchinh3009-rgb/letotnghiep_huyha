(function () {
  "use strict";

  var APP = window.APP;
  var DEFAULT_BEAUTY_MODE = "soft";

  APP.setPreview = function setPreview(url, blob) {
    if (!APP.els.photoPreview || !APP.els.previewImg) return;
    if (APP.state.lastPhotoUrl) URL.revokeObjectURL(APP.state.lastPhotoUrl);
    APP.state.lastPhotoBlob = blob || null;
    APP.state.lastPhotoUrl = url || "";
    APP.els.previewImg.src = APP.state.lastPhotoUrl;
    APP.els.photoPreview.hidden = !APP.state.lastPhotoUrl;
  };

  APP.setCaptureUiVisible = function setCaptureUiVisible(visible) {
    if (APP.els.camShootPanel) APP.els.camShootPanel.hidden = !visible;
  };

  APP.setCamError = function setCamError(msg) {
    APP.els.camError.textContent = msg;
    APP.els.camError.hidden = !msg;
  };

  APP.stopCamera = function stopCamera() {
    if (APP.stopFaceMeshLoop) APP.stopFaceMeshLoop();
    if (APP.state.stream) {
      var tracks = APP.state.stream.getTracks();
      var t;
      for (t = 0; t < tracks.length; t++) tracks[t].stop();
      APP.state.stream = null;
    }
    if (APP.els.video) APP.els.video.srcObject = null;
    if (APP.els.btnCapture) {
      APP.els.btnCapture.disabled = true;
      APP.els.btnCapture.hidden = true;
    }
    if (APP.els.btnStartCam) {
      APP.els.btnStartCam.hidden = false;
      APP.els.btnStartCam.disabled = false;
      APP.els.btnStartCam.textContent = "Mở camera";
    }
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
    if (!APP.els.video) return;
    var mode = APP.els.camBeautyMode && APP.els.camBeautyMode.value ? APP.els.camBeautyMode.value : DEFAULT_BEAUTY_MODE;
    if (mode === "off") {
      APP.els.video.style.filter = "none";
    } else {
      APP.els.video.style.filter =
        "brightness(1.08) contrast(1.05) saturate(1.18) sepia(0.05)";
    }
    if (APP.els.camOverlay) APP.els.camOverlay.style.display = "";
  };

  APP.startCamera = function startCamera() {
    APP.setCaptureUiVisible(true);
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
        APP.els.video.srcObject = APP.state.stream;
        return APP.els.video.play();
      })
      .then(function () {
        if (APP.els.btnCapture) {
          APP.els.btnCapture.disabled = false;
          APP.els.btnCapture.hidden = false;
        }
        if (APP.els.btnStartCam) {
          APP.els.btnStartCam.hidden = true;
          APP.els.btnStartCam.textContent = "Camera đã bật";
          APP.els.btnStartCam.disabled = true;
        }
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
    if (!APP.els.video.videoWidth) {
      APP.setCamError("Chưa có hình từ camera.");
      return;
    }
    var vw = APP.els.video.videoWidth;
    var vh = APP.els.video.videoHeight;
    var targetAR = 4 / 3; // match preview container aspect-ratio + object-fit: cover
    var sourceAR = vw / vh;
    var sx = 0;
    var sy = 0;
    var sw = vw;
    var sh = vh;
    if (sourceAR > targetAR) {
      sw = vh * targetAR;
      sx = (vw - sw) / 2;
    } else if (sourceAR < targetAR) {
      sh = vw / targetAR;
      sy = (vh - sh) / 2;
    }
    APP.els.snapCanvas.width = Math.round(sw);
    APP.els.snapCanvas.height = Math.round(sh);
    var ctx = APP.els.snapCanvas.getContext("2d");
    var cw = APP.els.snapCanvas.width;
    var ch = APP.els.snapCanvas.height;
    ctx.save();
    ctx.translate(cw, 0);
    ctx.scale(-1, 1);
    var beautyMode = APP.els.camBeautyMode && APP.els.camBeautyMode.value ? APP.els.camBeautyMode.value : DEFAULT_BEAUTY_MODE;
    ctx.filter =
      beautyMode === "off"
        ? "none"
        : "brightness(1.08) contrast(1.01) saturate(1.14)";
    ctx.drawImage(APP.els.video, sx, sy, sw, sh, 0, 0, cw, ch);
    ctx.filter = "none";
    ctx.restore();

    if (beautyMode !== "off") {
      if (APP.applySkinSmoothing) APP.applySkinSmoothing(ctx, cw, ch, 0.76);
      if (APP.applyUnderEyeBrighten) APP.applyUnderEyeBrighten(ctx, cw, ch, 0.56);
      APP.applyPortraitEnhance(ctx, cw, ch);
      if (APP.applyLipstickFilter) APP.applyLipstickFilter(ctx, cw, ch, APP.getLipOpacity());
    }

    var didFaceSticker = false;
    if (APP.hasFreshFaceLandmarks && APP.hasFreshFaceLandmarks(1400) && APP.drawFaceStickers) {
      didFaceSticker = APP.drawFaceStickers(ctx, cw, ch);
    }

    var outW = 1080;
    var outH = 1920;
    if (APP.els.cardCanvas) {
      APP.els.cardCanvas.width = outW;
      APP.els.cardCanvas.height = outH;
      var out = APP.els.cardCanvas.getContext("2d");
      APP.drawGraduationMemorialToCanvas(out, outW, outH, APP.els.snapCanvas);
    }

    (APP.els.cardCanvas || APP.els.snapCanvas).toBlob(
      function (blob) {
        if (!blob) return;
        var previewUrl = URL.createObjectURL(blob);
        APP.setPreview(previewUrl, blob);
        APP.stopCamera();
        APP.setCaptureUiVisible(false);
        APP.downloadBlob(blob, "ky-niem-tot-nghiep.png");
        if (APP.els.photoPreview) APP.els.photoPreview.scrollIntoView({ behavior: "smooth", block: "nearest" });
        if (APP.els.wishUseLast) APP.els.wishUseLast.checked = true;
      },
      "image/png"
    );
  };

  APP.retake = function retake() {
    APP.stopCamera();
    APP.setCaptureUiVisible(true);
    if (APP.els.photoPreview) APP.els.photoPreview.hidden = true;
    if (APP.els.previewImg) APP.els.previewImg.src = "";
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
export {};
