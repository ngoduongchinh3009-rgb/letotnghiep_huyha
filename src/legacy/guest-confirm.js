(function () {
  "use strict";

  var APP = window.APP;

  function closeModal() {
    var els = APP.els;
    if (!els || !els.guestConfirmModal) return;
    els.guestConfirmModal.hidden = true;
    els.guestConfirmModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (els.guestConfirmActions) els.guestConfirmActions.innerHTML = "";
    APP._guestConfirmOnPick = null;
    APP._guestConfirmOnDecline = null;
    APP._guestConfirmOnCreate = null;
  }

  APP.closeGuestConfirmModal = closeModal;

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
        "Chọn đúng người để xem lời mời riêng. Nếu không phải ai bên dưới, bạn vẫn là khách mời quan trọng.";
    }
    setConfirmHeadline(subMsg, /<[^>]+>/.test(subMsg));
    if (els.guestConfirmDecline) {
      els.guestConfirmDecline.textContent =
        APP.CONFIG.guestConfirmDecline || "Không phải → Khách mời quan trọng";
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
    setConfirmHeadline("Chào " + greetName + (role ? "\n" + role : ""), false);

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
    if (els.guestConfirmDecline) {
      els.guestConfirmDecline.textContent =
        APP.CONFIG.guestConfirmDecline || "Không phải -> Tạo thiệp khách mời quan trọng";
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
