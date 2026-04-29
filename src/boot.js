/** Hành vi wiring UI (trước đây là script.js). Cần window.APP.els đã bind sau khi Vue mount. */
export function boot() {
  var APP = window.APP;
  var els = APP.els;

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
    if (els.filterSelect) els.filterSelect.addEventListener("change", APP.refreshCameraPreviewEffects);
    if (els.stickerSelect) els.stickerSelect.addEventListener("change", APP.refreshCameraPreviewEffects);

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
      var hit = APP.lookupGuest(name);
      var displayName = hit ? hit.display : name;
      var roleLine = hit ? hit.role : APP.CONFIG.defaultGuestRole || "Khách mời thân mến.";
      APP.state.guestFullName = displayName;
      APP.fillInviteCard(displayName, roleLine);
      APP.setRevealLinesForGuest(hit, displayName);
      APP.runRevealSequence(displayName);
    });

    els.inputName.addEventListener("input", APP.setGuestLiveFromInput);
    els.inputName.addEventListener("paste", function () {
      setTimeout(APP.setGuestLiveFromInput, 0);
    });

    if (els.btnToInvite) {
      els.btnToInvite.addEventListener("click", function () {
        APP.showScreen(els.inviteScreen);
        window.scrollTo(0, 0);
      });
    }
  }

  function bindWishFlow() {
    if (els.wishForm) els.wishForm.addEventListener("submit", APP.handleWishSubmit);
  }

  bindModal();
  bindWallUi();
  bindCameraUi();
  bindVerifyFlow();
  bindWishFlow();

  APP.fillInviteCard("", "");
  APP.setGuestLiveFromInput();
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
