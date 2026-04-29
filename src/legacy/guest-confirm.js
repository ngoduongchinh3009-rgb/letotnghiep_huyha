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
  }

  APP.closeGuestConfirmModal = closeModal;

  APP.openGuestConfirmModal = function openGuestConfirmModal(matches, onPick, onDecline) {
    var els = APP.els;
    if (!els || !els.guestConfirmModal || !els.guestConfirmTitle || !els.guestConfirmActions) return;
    APP._guestConfirmOnPick = onPick;
    APP._guestConfirmOnDecline = onDecline;

    els.guestConfirmTitle.textContent =
      APP.CONFIG.guestConfirmTitle || "Có phải bạn đang tìm người này không?";
    if (els.guestConfirmSub) {
      els.guestConfirmSub.textContent =
        APP.CONFIG.guestConfirmSub ||
        "Chọn đúng người để xem lời mời riêng. Nếu không phải ai bên dưới, bạn vẫn là khách mời quan trọng.";
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

  APP.bindGuestConfirmDom = function bindGuestConfirmDom() {
    var els = APP.els;
    if (!els || !els.guestConfirmModal) return;
    if (APP._guestConfirmDomBound) return;
    APP._guestConfirmDomBound = true;
    if (els.guestConfirmDecline) {
      els.guestConfirmDecline.textContent =
        APP.CONFIG.guestConfirmDecline || "Không phải → Khách mời quan trọng";
      els.guestConfirmDecline.addEventListener("click", function () {
        var d = APP._guestConfirmOnDecline;
        closeModal();
        if (d) d();
      });
    }
    if (els.guestConfirmBackdrop) {
      els.guestConfirmBackdrop.addEventListener("click", function () {
        var d = APP._guestConfirmOnDecline;
        closeModal();
        if (d) d();
      });
    }
  };
})();
export {};
