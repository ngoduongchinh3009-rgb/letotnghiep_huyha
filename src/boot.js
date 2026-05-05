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
      if (e.key !== "Escape") return;
      if (els.guestConfirmModal && !els.guestConfirmModal.hidden) {
        APP.closeGuestConfirmModal();
        e.preventDefault();
        return;
      }
      APP.closeModal();
    });
  }

  function bindWallUi() {
    if (els.wallSearch) {
      els.wallSearch.addEventListener("input", function () {
        if (els.wallEl && els.wallEl.__items) APP.renderWall(els.wallEl.__items);
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
    function proceedReveal(hit, displayName, typedRaw) {
      var roleLine;
      if (hit) {
        roleLine = hit.role;
      } else {
        roleLine =
          APP.CONFIG.guestImportantFallbackRole ||
          APP.CONFIG.defaultGuestRole ||
          "Khách mời quan trọng";
        if (roleLine.indexOf("{name}") !== -1) {
          roleLine = roleLine.replace(/\{name\}/g, displayName || typedRaw || "");
        }
      }
      if (els.loadingText) els.loadingText.textContent = "Đang tạo thiệp nha...";
      APP.state.guestFullName = displayName;
      APP.fillInviteCard(displayName, roleLine);
      APP.setRevealLinesForGuest(hit, displayName);
      APP.runRevealSequence(displayName);
    }

    function proceedRevealFromChoice(chosen, typed) {
      if (
        chosen &&
        APP.guestRequiresSubmitConfirm(chosen) &&
        typeof APP.openGuestPreCreateModal === "function"
      ) {
        APP.openGuestPreCreateModal(
          chosen,
          function () {
            proceedReveal(chosen, chosen.display, typed);
          },
          function () {}
        );
        return;
      }
      proceedReveal(chosen, chosen ? chosen.display : typed, typed);
    }

    els.form.addEventListener("submit", function (e) {
      e.preventDefault();
      var typed = (els.inputName.value || "").trim();
      if (!typed) {
        els.inputName.focus();
        return;
      }
      var res = APP.resolveGuestLookupResult(typed);
      if (
        res.matches &&
        res.matches.length === 1 &&
        res.matches[0] &&
        res.matches[0].relation === "Người tốt nghiệp" &&
        typeof APP.openGuestInfoModal === "function"
      ) {
        APP.openGuestInfoModal(res.matches[0]);
        return;
      }
      if (res.type === "exact" && res.matches.length === 1 && res.matches[0]) {
        var g0 = res.matches[0];
        if (APP.guestRequiresSubmitConfirm(g0)) {
          APP.openGuestConfirmModal(
            res.matches,
            function (chosen) {
              proceedRevealFromChoice(chosen, typed);
            },
            function () {
              proceedReveal(null, typed, typed);
            },
            typed
          );
          return;
        }
        proceedReveal(g0, g0.display, typed);
        return;
      }
      if (res.type === "ambiguous" && res.matches.length) {
        APP.openGuestConfirmModal(
          res.matches,
          function (chosen) {
            proceedRevealFromChoice(chosen, typed);
          },
          function () {
            proceedReveal(null, typed, typed);
          },
          typed
        );
        return;
      }
      proceedReveal(null, typed, typed);
    });

    els.inputName.addEventListener("input", function () {
      APP.setGuestLiveFromInput();
    });
    els.inputName.addEventListener("paste", function () {
      setTimeout(function () {
        APP.setGuestLiveFromInput();
      }, 0);
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
  if (typeof APP.bindGuestConfirmDom === "function") APP.bindGuestConfirmDom();

  APP.fillInviteCard("", "");
  APP.setGuestLiveFromInput();
  APP.refreshSecureBanner();
  APP.initFirebaseMaybe();
  if (APP.hasFirebaseConfig() && els.wallEl) APP.attachWallListener();

  var view = APP.getQuery("view");
  if (view === "wall") {
    APP.showScreen(els.inviteScreen);
    if (els.inviteScreen) els.inviteScreen.classList.add("is-wall-only");
    if (els.wallPanel) els.wallPanel.scrollIntoView({ behavior: "instant", block: "start" });
  } else {
    if (els.inviteScreen) els.inviteScreen.classList.remove("is-wall-only");
    APP.startSplash();
  }
}
