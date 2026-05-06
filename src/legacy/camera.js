(function () {
  "use strict";

  var APP = window.APP;
  var DEFAULT_BEAUTY_MODE = "soft";

  APP.setPreview = function setPreview(url, blob) {
    if (APP.state.lastPhotoUrl) URL.revokeObjectURL(APP.state.lastPhotoUrl);
    APP.state.lastPhotoBlob = blob || null;
    APP.state.lastPhotoUrl = url || "";
    if (APP.els.polaroidImage) APP.els.polaroidImage.src = APP.state.lastPhotoUrl;
    if (APP.preparePolaroidFromCapture) APP.preparePolaroidFromCapture();
  };

  APP.setCaptureUiVisible = function setCaptureUiVisible(visible) {
    if (APP.els.camShootPanel) APP.els.camShootPanel.hidden = !visible;
  };

  APP.setCamError = function setCamError(msg) {
    APP.els.camError.textContent = msg;
    APP.els.camError.hidden = !msg;
  };

  APP.stopCamera = function stopCamera() {
    APP.state.cameraOpening = false;
    if (APP.stopFaceMeshLoop) APP.stopFaceMeshLoop();
    if (APP.state.stream) {
      var tracks = APP.state.stream.getTracks();
      var t;
      for (t = 0; t < tracks.length; t++) tracks[t].stop();
      APP.state.stream = null;
    }
    if (APP.els.video) APP.els.video.srcObject = null;
    if (APP.els.camOverlay && APP.els.camOverlay.width) {
      var oc = APP.els.camOverlay.getContext("2d");
      if (oc) oc.clearRect(0, 0, APP.els.camOverlay.width, APP.els.camOverlay.height);
    }
    if (APP.els.btnCapture) {
      APP.els.btnCapture.hidden = false;
      APP.els.btnCapture.disabled = false;
      APP.els.btnCapture.textContent = "Chụp ảnh";
    }
  };

  /** Một nút: lần 1 mở camera tại chỗ, lần 2 chụp → Polaroid. */
  APP.handleCaptureMainClick = function handleCaptureMainClick() {
    if (APP.state.stream && APP.els.video && APP.els.video.videoWidth) {
      APP.capturePhoto();
      return;
    }
    APP.startCamera();
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
    if (APP.state.stream && APP.els.video && APP.els.video.videoWidth) {
      if (APP.els.btnCapture) {
        APP.els.btnCapture.disabled = false;
        APP.els.btnCapture.textContent = "Chụp ngay";
      }
      return;
    }
    if (APP.state.cameraOpening) return;
    APP.state.cameraOpening = true;
    if (APP.els.btnCapture) {
      APP.els.btnCapture.disabled = true;
      APP.els.btnCapture.textContent = "Đang bật camera...";
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
        APP.state.cameraOpening = false;
        if (APP.els.btnCapture) {
          APP.els.btnCapture.disabled = false;
          APP.els.btnCapture.hidden = false;
          APP.els.btnCapture.textContent = "Chụp ngay";
        }
        APP.refreshCameraPreviewEffects();
        if (APP.startFaceMeshLoop) APP.startFaceMeshLoop();
      })
      .catch(function (err) {
        APP.state.cameraOpening = false;
        var msg = err && err.message ? err.message : "lỗi không xác định";
        APP.setCamError(
          "Không mở được camera: " +
            msg +
            " — Nếu đang dùng điện thoại: thử HTTPS (ngrok), bật quyền camera trong Cài đặt trình duyệt."
        );
        if (APP.els.btnCapture) {
          APP.els.btnCapture.disabled = false;
          APP.els.btnCapture.textContent = "Chụp ảnh";
        }
      });
  };

  APP.capturePhoto = function capturePhoto() {
    if (!APP.els.video.videoWidth) {
      APP.setCamError("Chưa có hình từ camera.");
      return;
    }
    var vw = APP.els.video.videoWidth;
    var vh = APP.els.video.videoHeight;
    var sx = 0;
    var sy = 0;
    var sw = vw;
    var sh = vh;
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
      var hasLandmarks =
        APP.state &&
        APP.state.faceLandmarks &&
        APP.state.faceLandmarks.length &&
        APP.hasFreshFaceLandmarks &&
        APP.hasFreshFaceLandmarks(1800);
      if (APP.applySkinSmoothing) APP.applySkinSmoothing(ctx, cw, ch, hasLandmarks ? 0.86 : 0.46);
      if (APP.applyUnderEyeBrighten) APP.applyUnderEyeBrighten(ctx, cw, ch, hasLandmarks ? 0.66 : 0.32);
      if (!hasLandmarks && APP.applyGlobalSoftBeauty) APP.applyGlobalSoftBeauty(ctx, cw, ch, 0.52);
      APP.applyPortraitEnhance(ctx, cw, ch);
      if (APP.applyLipstickFilter) APP.applyLipstickFilter(ctx, cw, ch, APP.getLipOpacity());
    }

    var didFaceSticker = false;
    if (APP.hasFreshFaceLandmarks && APP.hasFreshFaceLandmarks(1400) && APP.drawFaceStickers) {
      didFaceSticker = APP.drawFaceStickers(ctx, cw, ch);
    }

    APP.els.snapCanvas.toBlob(
      function (blob) {
        if (!blob) return;
        var previewUrl = URL.createObjectURL(blob);
        APP.setPreview(previewUrl, blob);
        APP.stopCamera();
        APP.setCaptureUiVisible(false);
        if (APP.els.polaroidPanel) APP.els.polaroidPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        if (APP.els.wishUseLast) APP.els.wishUseLast.checked = true;
      },
      "image/png"
    );
  };

  APP.retake = function retake() {
    APP.stopCamera();
    APP.setCaptureUiVisible(true);
    if (APP.els.polaroidImage) APP.els.polaroidImage.src = "";
    if (APP.state.lastPhotoUrl) {
      URL.revokeObjectURL(APP.state.lastPhotoUrl);
      APP.state.lastPhotoUrl = "";
    }
    APP.state.lastPhotoBlob = null;
    if (APP.setPolaroidVisible) APP.setPolaroidVisible(false);
  };

})();
export {};
