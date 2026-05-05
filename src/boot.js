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

  function setWallPassError(msg) {
    if (!els.wallPassError) return;
    els.wallPassError.hidden = !msg;
    els.wallPassError.textContent = msg || "";
  }

  function setWallLocked(locked) {
    if (els.wallLock) els.wallLock.hidden = !locked;
    if (els.wallContent) els.wallContent.hidden = !!locked;
    if (!locked) setWallPassError("");
  }

  function bindCameraUi() {
    if (els.btnStartCam) els.btnStartCam.addEventListener("click", APP.startCamera);
    if (els.btnCapture) els.btnCapture.addEventListener("click", APP.capturePhoto);
    if (els.btnRetake) els.btnRetake.addEventListener("click", APP.retake);
    if (els.btnPolaroidUpload && els.polaroidUploadInput) {
      els.btnPolaroidUpload.addEventListener("click", function () {
        els.polaroidUploadInput.click();
      });
      els.polaroidUploadInput.addEventListener("change", APP.handlePolaroidUploadSelect);
    }
    if (els.polaroidSubmit) els.polaroidSubmit.addEventListener("click", APP.handlePolaroidSubmit);

    window.addEventListener("beforeunload", APP.stopCamera);
    window.addEventListener("beforeunload", function () {
      if (APP.state.lastPhotoUrl) URL.revokeObjectURL(APP.state.lastPhotoUrl);
    });
  }

  function bindVerifyFlow() {
    function refreshLoadingUi(displayName) {
      var safeName = (displayName || "").trim();
      if (els.loadingText) {
        els.loadingText.textContent = safeName
          ? "Đang chuẩn bị thiệp mời dành riêng cho " + safeName
          : "Đang chuẩn bị thiệp mời dành riêng cho bạn";
      }
      if (els.loadingPremium) {
        els.loadingPremium.classList.remove("is-animating");
        void els.loadingPremium.offsetWidth;
        els.loadingPremium.classList.add("is-animating");
      }
      if (els.loadingProgressFill) {
        els.loadingProgressFill.style.animationDuration = Math.max(800, APP.CONFIG.loadingMs || 2800) + "ms";
      }
    }

    function proceedReveal(hit, displayName, typedRaw) {
      var roleLine;
      if (hit) {
        roleLine = hit.role;
      } else {
        roleLine =
          APP.CONFIG.guestImportantFallbackRole ||
          APP.CONFIG.defaultGuestRole ||
          "Khách mời của mình";
        if (roleLine.indexOf("{name}") !== -1) {
          roleLine = roleLine.replace(/\{name\}/g, displayName || typedRaw || "");
        }
      }
      refreshLoadingUi(displayName || typedRaw || "");
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

  function enterWallView() {
    APP.showScreen(els.inviteScreen);
    if (els.inviteScreen) els.inviteScreen.classList.add("is-wall-only");
    setWallLocked(false);
    if (els.wallPanel) els.wallPanel.scrollIntoView({ behavior: "instant", block: "start" });
  }

  APP.enterWallViewFromAnywhere = function enterWallViewFromAnywhere() {
    enterWallView();
  };

  function enterLockedWallView() {
    APP.showScreen(els.inviteScreen);
    if (els.inviteScreen) els.inviteScreen.classList.add("is-wall-only");
    setWallLocked(true);
    if (els.wallPanel) els.wallPanel.scrollIntoView({ behavior: "instant", block: "start" });
    if (els.wallPassInput) els.wallPassInput.focus();
  }

  function leaveWallView() {
    try {
      var u = new URL(window.location.href);
      u.searchParams.delete("view");
      u.hash = "";
      window.history.replaceState({}, "", u.toString());
    } catch (e) {}
    if (els.inviteScreen) els.inviteScreen.classList.remove("is-wall-only");
    APP.startSplash();
  }

  var view = APP.getQuery("view");
  if (view === "wall") {
    var passHash = APP.PASSCODE_HASH ? String(APP.PASSCODE_HASH).trim().toLowerCase() : "";
    var plainPass = APP.WALL_PASSCODE ? String(APP.WALL_PASSCODE).trim() : "";
    var passKeySeed = passHash ? "hash:" + passHash.slice(0, 12) : "plain:" + plainPass;
    var sessionKey = "inviteWallUnlocked:" + passKeySeed;

    if (els.wallPassForm && !els.wallPassForm.__bound) {
      els.wallPassForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var raw = els.wallPassInput && els.wallPassInput.value ? els.wallPassInput.value : "";
        var pass = raw.trim();
        if (!pass) {
          setWallPassError("Vui lòng nhập mật khẩu.");
          if (els.wallPassInput) els.wallPassInput.focus();
          return;
        }
        if (els.wallPassSubmit) els.wallPassSubmit.disabled = true;
        setWallPassError("");
        if (passHash) {
          APP.sha256Hex(pass)
            .then(function (digest) {
              if (String(digest).toLowerCase() !== passHash) {
                setWallPassError("Mật khẩu chưa đúng.");
                return;
              }
              sessionStorage.setItem(sessionKey, "1");
              if (els.wallPassInput) els.wallPassInput.value = "";
              enterWallView();
              if (APP.hasFirebaseConfig() && els.wallEl) APP.attachWallListener();
            })
            .catch(function () {
              setWallPassError("Không thể xác minh mật khẩu. Thử lại nhé.");
            })
            .finally(function () {
              if (els.wallPassSubmit) els.wallPassSubmit.disabled = false;
            });
          return;
        }

        if (!plainPass || pass !== plainPass) {
          setWallPassError("Mật khẩu chưa đúng.");
          if (els.wallPassSubmit) els.wallPassSubmit.disabled = false;
          return;
        }

        sessionStorage.setItem(sessionKey, "1");
        if (els.wallPassInput) els.wallPassInput.value = "";
        enterWallView();
        if (APP.hasFirebaseConfig() && els.wallEl) APP.attachWallListener();
        if (els.wallPassSubmit) els.wallPassSubmit.disabled = false;
      });
      els.wallPassForm.__bound = true;
    }

    if (!passHash && !plainPass) {
      enterWallView();
      if (APP.hasFirebaseConfig() && els.wallEl) APP.attachWallListener();
      return;
    }

    if (sessionStorage.getItem(sessionKey) === "1") {
      enterWallView();
      if (APP.hasFirebaseConfig() && els.wallEl) APP.attachWallListener();
      return;
    }
    enterLockedWallView();
  } else {
    if (els.inviteScreen) els.inviteScreen.classList.remove("is-wall-only");
    setWallLocked(false);
    APP.startSplash();
  }
}
