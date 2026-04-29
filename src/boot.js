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
        var d = APP._guestConfirmOnDecline;
        APP.closeGuestConfirmModal();
        if (d) d();
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
      APP.state.guestFullName = displayName;
      APP.fillInviteCard(displayName, roleLine);
      APP.setRevealLinesForGuest(hit, displayName);
      APP.runRevealSequence(displayName);
    }

    els.form.addEventListener("submit", function (e) {
      e.preventDefault();
      var typed = (els.inputName.value || "").trim();
      if (!typed) {
        els.inputName.focus();
        return;
      }
      var res = APP.resolveGuestLookupResult(typed);
      if (res.type === "exact" && res.matches[0]) {
        var g0 = res.matches[0];
        proceedReveal(g0, g0.display, typed);
        return;
      }
      if (res.type === "ambiguous" && res.matches.length) {
        APP.openGuestConfirmModal(
          res.matches,
          function (chosen) {
            proceedReveal(chosen, chosen.display, typed);
          },
          function () {
            proceedReveal(null, typed, typed);
          }
        );
        return;
      }
      proceedReveal(null, typed, typed);
    });

    els.inputName.addEventListener("input", function () {
      if (APP.state.applyingQuickPick) return;
      APP.state.quickPickGuestIndex = null;
      if (els.selectQuickPick) els.selectQuickPick.value = "";
      APP.setGuestLiveFromInput();
    });
    els.inputName.addEventListener("paste", function () {
      setTimeout(function () {
        if (APP.state.applyingQuickPick) return;
        APP.state.quickPickGuestIndex = null;
        if (els.selectQuickPick) els.selectQuickPick.value = "";
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
  if (els.selectQuickPick && APP.GUEST_DB) {
    els.selectQuickPick.innerHTML = "";
    var opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = APP.CONFIG.guestQuickPickPlaceholder || "— Chọn nhanh —";
    els.selectQuickPick.appendChild(opt0);
    var gi;
    for (gi = 0; gi < APP.GUEST_DB.length; gi++) {
      var g = APP.GUEST_DB[gi];
      var lab =
        g.quickPickLabel ||
        g.display + " — " + (g.role.length > 52 ? g.role.slice(0, 49) + "…" : g.role);
      var o = document.createElement("option");
      o.value = String(gi);
      o.textContent = lab;
      els.selectQuickPick.appendChild(o);
    }
    els.selectQuickPick.addEventListener("change", function () {
      var v = els.selectQuickPick.value;
      if (v === "") {
        APP.state.quickPickGuestIndex = null;
        APP.setGuestLiveFromInput();
        return;
      }
      var ix = parseInt(v, 10);
      if (isNaN(ix) || !APP.GUEST_DB[ix]) return;
      APP.state.applyingQuickPick = true;
      APP.state.quickPickGuestIndex = ix;
      var gPick = APP.GUEST_DB[ix];
      els.inputName.value =
        gPick.fullNames && gPick.fullNames.length ? gPick.fullNames[0] : gPick.display;
      APP.state.applyingQuickPick = false;
      APP.setGuestLiveFromInput();
    });
  }
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
