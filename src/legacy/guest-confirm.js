(function () {
  "use strict";

  var APP = window.APP;

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function closeModal() {
    var els = APP.els;
    if (!els || !els.guestConfirmModal) return;
    els.guestConfirmModal.hidden = true;
    els.guestConfirmModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setGuestConfirmFooterHintVisible(false);
    if (els.guestConfirmActions) els.guestConfirmActions.innerHTML = "";
    APP._guestConfirmOnPick = null;
    APP._guestConfirmOnDecline = null;
    APP._guestConfirmOnCreate = null;
  }

  APP.closeGuestConfirmModal = closeModal;

  /** Chỉ hiện khi cần chọn giữa nhiều người / nút decline có ý nghĩa tương phản. */
  function setGuestConfirmFooterHintVisible(show) {
    var els = APP.els;
    if (!els || !els.guestConfirmFooterHint) return;
    els.guestConfirmFooterHint.hidden = !show;
  }

  function setConfirmHeadline(message, allowHtml) {
    var els = APP.els;
    if (!els) return;
    if (els.guestConfirmTitle) {
      if (allowHtml) {
        els.guestConfirmTitle.innerHTML = message || "";
      } else {
        els.guestConfirmTitle.textContent = message || "";
      }
    }
    if (els.guestConfirmSub) {
      els.guestConfirmSub.textContent = "";
      els.guestConfirmSub.hidden = true;
    }
  }

  APP.openGuestConfirmModal = function openGuestConfirmModal(matches, onPick, onDecline, typedRaw) {
    var els = APP.els;
    if (!els || !els.guestConfirmModal || !els.guestConfirmTitle || !els.guestConfirmActions) return;
    APP._guestConfirmOnPick = onPick;
    APP._guestConfirmOnDecline = onDecline;

    var subMsg = "";
    if (typeof APP.buildGuestConfirmSub === "function") {
      subMsg = APP.buildGuestConfirmSub(typedRaw, matches);
    } else {
      subMsg =
        APP.CONFIG.guestConfirmSub ||
        "Chọn đúng tên được mời để xem thiệp riêng.";
    }
    setConfirmHeadline(subMsg, /<[^>]+>/.test(subMsg));
    if (els.guestConfirmDecline) {
      els.guestConfirmDecline.textContent =
        APP.CONFIG.guestConfirmDecline || "Tạo thiệp khách mời";
    }

    els.guestConfirmActions.innerHTML = "";
    var i;
    for (i = 0; i < matches.length; i++) {
      (function (g) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-primary guest-confirm-pick";
        var line = g.legalLine || g.display + " — " + (g.fullNames && g.fullNames[0] ? g.fullNames[0] : "");
        btn.textContent = line;
        btn.addEventListener("click", function () {
          var p = APP._guestConfirmOnPick;
          closeModal();
          if (p) p(g);
        });
        els.guestConfirmActions.appendChild(btn);
      })(matches[i]);
    }

    setGuestConfirmFooterHintVisible(true);
    els.guestConfirmModal.hidden = false;
    els.guestConfirmModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (els.guestConfirmDecline) els.guestConfirmDecline.focus();
  };

  APP.openGuestPreCreateModal = function openGuestPreCreateModal(guest, onCreate, onDecline) {
    var els = APP.els;
    if (!els || !els.guestConfirmModal || !els.guestConfirmTitle || !els.guestConfirmActions) return;
    APP._guestConfirmOnCreate = onCreate;
    APP._guestConfirmOnDecline = onDecline;
    APP._guestConfirmOnPick = null;

    var fullName = guest && guest.fullNames && guest.fullNames[0] ? guest.fullNames[0] : "";
    var greetName = fullName || (guest && guest.display ? guest.display : "bạn");
    if (guest && (guest.relation === "Bố" || guest.relation === "Mẹ")) {
      greetName = guest.relation;
    }
    var role = guest && guest.role ? guest.role : "";
    if (els.guestConfirmSub) {
      els.guestConfirmSub.textContent = "";
      els.guestConfirmSub.hidden = true;
    }
    if (els.guestConfirmTitle) {
      var greetLine = "Chào " + greetName;
      if (role) {
        els.guestConfirmTitle.innerHTML =
          '<span class="guest-confirm-greeting">' +
          escapeHtml(greetLine) +
          '</span><br /><span class="guest-confirm-role-line">' +
          escapeHtml(role) +
          "</span>";
      } else {
        els.guestConfirmTitle.innerHTML =
          '<span class="guest-confirm-greeting">' + escapeHtml(greetLine) + "</span>";
      }
    }

    els.guestConfirmActions.innerHTML = "";
    var createBtn = document.createElement("button");
    createBtn.type = "button";
    createBtn.className = "btn-primary guest-confirm-pick";
    createBtn.textContent = "Tạo thiệp";
    createBtn.addEventListener("click", function () {
      var c = APP._guestConfirmOnCreate;
      closeModal();
      if (c) c();
    });
    els.guestConfirmActions.appendChild(createBtn);

    if (els.guestConfirmDecline) {
      els.guestConfirmDecline.textContent = "Quay lại";
    }
    setGuestConfirmFooterHintVisible(false);
    els.guestConfirmModal.hidden = false;
    els.guestConfirmModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (els.guestConfirmDecline) els.guestConfirmDecline.focus();
  };

  APP.openGuestInfoModal = function openGuestInfoModal(guest) {
    var els = APP.els;
    if (!els || !els.guestConfirmModal || !els.guestConfirmTitle || !els.guestConfirmActions) return;
    APP._guestConfirmOnCreate = null;
    APP._guestConfirmOnPick = null;
    APP._guestConfirmOnDecline = function () {};

    setConfirmHeadline((guest && guest.role) || "", false);
    els.guestConfirmActions.innerHTML = "";

    var okBtn = document.createElement("button");
    okBtn.type = "button";
    okBtn.className = "btn-primary guest-confirm-pick";
    okBtn.textContent = "Đã rõ";
    okBtn.addEventListener("click", function () {
      closeModal();
    });
    els.guestConfirmActions.appendChild(okBtn);

    if (els.guestConfirmDecline) {
      els.guestConfirmDecline.textContent = "Đóng";
    }
    setGuestConfirmFooterHintVisible(false);
    els.guestConfirmModal.hidden = false;
    els.guestConfirmModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    okBtn.focus();
  };

  APP.bindGuestConfirmDom = function bindGuestConfirmDom() {
    var els = APP.els;
    if (!els || !els.guestConfirmModal) return;
    if (APP._guestConfirmDomBound) return;
    APP._guestConfirmDomBound = true;
    if (els.guestConfirmFooterHint) {
      els.guestConfirmFooterHint.textContent =
        APP.CONFIG.guestConfirmFooterHint ||
        "Nếu không đúng thì chọn Thiệp khách mời để xem thiệp mời riêng nha.";
    }
    if (els.guestConfirmDecline) {
      els.guestConfirmDecline.textContent =
        APP.CONFIG.guestConfirmDecline || "Tạo thiệp khách mời";
      els.guestConfirmDecline.addEventListener("click", function () {
        var d = APP._guestConfirmOnDecline;
        closeModal();
        if (d) d();
      });
    }
    if (els.guestConfirmBackdrop) {
      els.guestConfirmBackdrop.addEventListener("click", function () {
        closeModal();
      });
    }
  };
})();
export {};
