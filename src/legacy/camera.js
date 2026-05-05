(function () {
  "use strict";

  var APP = window.APP;

  APP.setPreview = function setPreview(url, blob) {
    if (!APP.els.photoPreview || !APP.els.previewImg) return;
    if (APP.state.lastPhotoUrl) URL.revokeObjectURL(APP.state.lastPhotoUrl);
    APP.state.lastPhotoBlob = blob || null;
    APP.state.lastPhotoUrl = url || "";
    APP.els.previewImg.src = APP.state.lastPhotoUrl;
    APP.els.photoPreview.hidden = !APP.state.lastPhotoUrl;
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
    APP.els.video.style.filter = "brightness(1.04) contrast(1.03) saturate(1.10)";
    if (APP.els.camOverlay) APP.els.camOverlay.style.display = "";
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
    APP.els.snapCanvas.width = vw;
    APP.els.snapCanvas.height = vh;
    var ctx = APP.els.snapCanvas.getContext("2d");
    ctx.save();
    ctx.translate(vw, 0);
    ctx.scale(-1, 1);
    ctx.filter = "brightness(1.05) contrast(0.98) saturate(1.08)";
    ctx.drawImage(APP.els.video, 0, 0, vw, vh);
    ctx.filter = "none";
    ctx.restore();

    APP.applyPortraitEnhance(ctx, vw, vh);
    if (APP.applyFaceMakeup) APP.applyFaceMakeup(ctx, vw, vh, 0.7);

    var didFaceSticker = false;
    if (APP.hasFreshFaceLandmarks && APP.hasFreshFaceLandmarks(1400) && APP.drawFaceStickers) {
      didFaceSticker = APP.drawFaceStickers(ctx, vw, vh);
    }

    var outW = 1080;
    var outH = 1920;
    if (APP.els.cardCanvas) {
      APP.els.cardCanvas.width = outW;
      APP.els.cardCanvas.height = outH;
      var out = APP.els.cardCanvas.getContext("2d");
      APP.drawClassicCardToCanvas(out, outW, outH, APP.els.snapCanvas);
    }

    (APP.els.cardCanvas || APP.els.snapCanvas).toBlob(
      function (blob) {
        if (!blob) return;
        var previewUrl = URL.createObjectURL(blob);
        APP.setPreview(previewUrl, blob);
        APP.downloadBlob(blob, "ky-niem-tot-nghiep.png");
        if (APP.els.inviteWrapPhoto) APP.els.inviteWrapPhoto.hidden = false;
        if (APP.els.cardSub2) {
          APP.els.cardSub2.textContent = APP.buildInviteEventDetailText();
        }
        if (APP.els.cardPhoto2) APP.els.cardPhoto2.src = previewUrl;
        if (APP.els.inviteWrapPhoto) APP.els.inviteWrapPhoto.scrollIntoView({ behavior: "smooth", block: "start" });
        if (APP.els.wishUseLast) APP.els.wishUseLast.checked = true;
      },
      "image/png"
    );
  };

  APP.retake = function retake() {
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
