// Entry point (wires UI). Các phần logic nằm trong `js/*.js`.
(function () {
  "use strict";

  var APP = window.APP;
  var els = APP.els;

  function buildRoleFromSelect() {
    var r = els.selectRelation.value;
    if (r) return "Mời đến với tư cách: " + r + ".";
    return "Khách mời thân quý.";
  }

  function bindModal() {
    if (els.modalClose) els.modalClose.addEventListener("click", APP.closeModal);
    if (els.photoModal) {
      els.photoModal.addEventListener("click", function (e) {
        if (e.target === els.photoModal) APP.closeModal();
      });
    }
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") APP.closeModal();
    });
  }

  function bindWallUi() {
    if (els.wallSearch) {
      els.wallSearch.addEventListener("input", function () {
        if (els.wallEl && els.wallEl.__items) APP.renderWall(els.wallEl.__items);
      });
    }
    if (els.btnOpenWall) {
      els.btnOpenWall.addEventListener("click", function () {
        if (els.wallPanel) els.wallPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    if (els.btnCopyWallLink) {
      els.btnCopyWallLink.addEventListener("click", function () {
        var link = APP.buildWallViewLink();
        function done(ok) {
          if (els.wallLinkHint) {
            els.wallLinkHint.textContent = ok ? "Đã copy!" : "Không copy được. Link: " + link;
          }
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(link).then(
            function () {
              done(true);
            },
            function () {
              done(false);
            }
          );
        } else {
          done(false);
        }
      });
    }
  }

  function bindCameraUi() {
    if (els.optStickers && els.camStickers) {
      els.optStickers.addEventListener("change", function () {
        els.camStickers.style.display = els.optStickers.checked ? "" : "none";
      });
    }
    if (els.filterSelect) els.filterSelect.addEventListener("change", APP.refreshCameraPreviewEffects);
    if (els.stickerSelect) els.stickerSelect.addEventListener("change", APP.refreshCameraPreviewEffects);
    if (els.optStickers) els.optStickers.addEventListener("change", APP.refreshCameraPreviewEffects);
    if (els.optAR) els.optAR.addEventListener("change", function () {
      // bật/tắt loop MediaPipe theo toggle
      if (els.optAR.checked) {
        if (APP.startFaceMeshLoop) APP.startFaceMeshLoop();
      } else {
        if (APP.stopFaceMeshLoop) APP.stopFaceMeshLoop();
      }
    });

    if (els.btnStartCam) els.btnStartCam.addEventListener("click", APP.startCamera);
    if (els.btnCapture) els.btnCapture.addEventListener("click", APP.capturePhoto);
    if (els.btnRetake) els.btnRetake.addEventListener("click", APP.retake);
    if (els.btnDownloadAgain) els.btnDownloadAgain.addEventListener("click", APP.downloadAgain);
    if (els.btnSharePhoto) els.btnSharePhoto.addEventListener("click", APP.sharePhoto);

    window.addEventListener("beforeunload", APP.stopCamera);
    window.addEventListener("beforeunload", function () {
      if (APP.state.lastPhotoUrl) URL.revokeObjectURL(APP.state.lastPhotoUrl);
    });
  }

  function bindVerifyFlow() {
    els.form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (els.inputName.value || "").trim();
      if (!name) {
        els.inputName.focus();
        return;
      }
      if (!els.selectRelation.value) {
        els.selectRelation.focus();
        return;
      }
      var hit = APP.lookupGuest(name);
      var displayName = hit ? hit.display : name;
      var roleLine = hit ? hit.role : buildRoleFromSelect();
      APP.state.guestFullName = displayName;
      APP.fillInviteCard(displayName, roleLine);
      APP.setRevealLinesForGuest(hit, displayName);
      APP.runRevealSequence(displayName);
    });

    els.inputName.addEventListener("input", APP.setGuestLiveFromInput);
    els.inputName.addEventListener("paste", function () {
      setTimeout(APP.setGuestLiveFromInput, 0);
    });

    els.btnDemo.addEventListener("click", function () {
      els.inputName.value = "BapDunChin";
      APP.setGuestLiveFromInput();
    });

    els.btnToInvite.addEventListener("click", function () {
      APP.showScreen(els.inviteScreen);
      window.scrollTo(0, 0);
    });
  }

  function bindWishFlow() {
    if (els.wishForm) els.wishForm.addEventListener("submit", APP.handleWishSubmit);
  }

  function boot() {
    bindModal();
    bindWallUi();
    bindCameraUi();
    bindVerifyFlow();
    bindWishFlow();

    APP.fillInviteCard("", "");
    APP.refreshSecureBanner();
    APP.initFirebaseMaybe();
    if (APP.hasFirebaseConfig()) APP.attachWallListener();

    var view = APP.getQuery("view");
    if (view === "wall") {
      APP.showScreen(els.inviteScreen);
      if (els.wishPanel) els.wishPanel.hidden = true;
      if (els.camWrap && els.camWrap.parentElement) els.camWrap.parentElement.hidden = true;
      if (els.photoPreview) els.photoPreview.hidden = true;
      if (els.wallPanel) els.wallPanel.scrollIntoView({ behavior: "instant", block: "start" });
    } else {
      APP.startSplash();
    }
  }

  boot();
})();
