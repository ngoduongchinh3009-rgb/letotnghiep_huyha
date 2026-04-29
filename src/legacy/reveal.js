(function () {
  "use strict";

  var APP = window.APP;
  var els = APP.els;

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  APP.buildInviteEventDetailText = function buildInviteEventDetailText() {
    var c = APP.CONFIG;
    return ["Thời gian: " + c.eventTime, "Địa điểm: " + c.eventPlace].join("\n");
  };

  APP.setGuestLiveFromInput = function setGuestLiveFromInput() {
    var raw = (els.inputName.value || "").trim();
    if (!raw) {
      els.guestLive.classList.add("is-empty");
      els.guestLive.textContent =
        APP.CONFIG.guestLiveEmptyHint ||
        "Nhập tên để tạo thiệp nha — mình luôn mong sự có mặt của bạn.";
      return;
    }
    var hit = APP.lookupGuest(raw);
    els.guestLive.classList.remove("is-empty");
    if (hit) {
      els.guestLive.innerHTML =
        "<strong>" +
        escapeHtml(hit.display) +
        "</strong><br><span>" +
        escapeHtml(hit.role) +
        "</span>";
    } else {
      var tpl =
        APP.CONFIG.guestLiveStrangerLine ||
        "{name} — mình luôn mong bạn tới tham dự";
      var t = String(tpl);
      if (t.indexOf("{name}") === -1) {
        els.guestLive.innerHTML =
          "<strong>" +
          escapeHtml(raw) +
          "</strong><br><span>" +
          escapeHtml(t) +
          "</span>";
      } else {
        var parts = t.split("{name}");
        els.guestLive.innerHTML =
          escapeHtml(parts[0]) +
          "<strong>" +
          escapeHtml(raw) +
          "</strong>" +
          escapeHtml(parts.slice(1).join("{name}"));
      }
    }
  };

  APP.fillInviteCard = function fillInviteCard(displayName, roleLine) {
    APP.state.guestRoleLine = roleLine || "";
    if (els.cardSub) {
      els.cardSub.textContent = APP.buildInviteEventDetailText();
    }
    if (els.cardSub2) {
      els.cardSub2.textContent = APP.buildInviteEventDetailText();
    }
    if (els.cardInviteGuest) {
      els.cardInviteGuest.textContent = displayName || "Bạn và gia đình";
    }
    if (els.cardInviteMessage) {
      els.cardInviteMessage.textContent =
        "Đến tham dự lễ tốt nghiệp của " + APP.CONFIG.studentName;
    }
    if (els.cardThanks) {
      var anonThanks = APP.CONFIG.thanksAnonymous || "Cảm ơn vì sự có mặt của bạn.";
      var namedTpl =
        APP.CONFIG.thanksNamed ||
        "{name} ơi, cảm ơn vì đã là một phần rất đẹp trong ngày này của mình.";
      els.cardThanks.textContent = displayName
        ? namedTpl.replace(/\{name\}/g, displayName)
        : anonThanks;
    }
    if (els.cardFlavor) {
      els.cardFlavor.textContent = APP.CONFIG.inviteFlavor || "";
      els.cardFlavor.hidden = !APP.CONFIG.inviteFlavor;
    }
    if (els.cardFlavorAside) {
      els.cardFlavorAside.textContent = APP.CONFIG.inviteFlavorAside || "";
      els.cardFlavorAside.hidden = !APP.CONFIG.inviteFlavorAside;
    }
    if (els.cardPS) {
      els.cardPS.textContent = APP.CONFIG.invitePS || "";
      els.cardPS.hidden = !APP.CONFIG.invitePS;
    }
    if (els.cardMeal) {
      els.cardMeal.textContent = APP.CONFIG.mealLine || "";
      els.cardMeal.hidden = !APP.CONFIG.mealLine;
    }
    if (els.cardSponsor) {
      els.cardSponsor.textContent = APP.CONFIG.sponsorLine || "";
      els.cardSponsor.hidden = !APP.CONFIG.sponsorLine;
    }
    if (els.cardFrame) els.cardFrame.hidden = true;
    if (els.cardEmpty) els.cardEmpty.hidden = false;
    if (els.cardPhoto) els.cardPhoto.hidden = true;
    if (els.cardPlaceholder) els.cardPlaceholder.hidden = false;
  };

  APP.startSplash = function startSplash() {
    APP.wait(APP.CONFIG.splashDelayMs).then(function () {
      APP.showScreen(els.formScreen);
      els.inputName.focus();
    });
  };

  APP.runRevealSequence = function runRevealSequence(displayName) {
    APP.showScreen(els.loadingScreen);
    return APP.wait(APP.CONFIG.loadingMs)
      .then(function () {
        APP.showScreen(els.revealScreen);
        els.reveal1.classList.remove("is-visible");
        els.reveal2.classList.remove("is-visible");
        if (els.reveal3) els.reveal3.classList.remove("is-visible");
        els.revealName.classList.remove("is-visible");
        els.revealName.textContent = "";
        if (els.btnToInvite) els.btnToInvite.hidden = true;
        return APP.wait(400);
      })
      .then(function () {
        els.reveal1.classList.add("is-visible");
        return APP.wait(APP.CONFIG.revealGapMs);
      })
      .then(function () {
        els.reveal2.classList.add("is-visible");
        return APP.wait(APP.CONFIG.revealGapMs);
      })
      .then(function () {
        if (els.reveal3) els.reveal3.classList.add("is-visible");
        return APP.wait(APP.CONFIG.revealGapMs);
      })
      .then(function () {
        els.revealName.textContent = displayName;
        void els.revealName.offsetWidth;
        els.revealName.classList.add("is-visible");
        return APP.wait(APP.CONFIG.nameHoldMs);
      })
      .then(function () {
        if (els.btnToInvite) els.btnToInvite.hidden = false;
      });
  };

  APP.setRevealLinesForGuest = function setRevealLinesForGuest(hit, displayName) {
    var l1 = "Sau 4 năm...";
    var l2 = "Có rất nhiều người quan trọng...";
    var l3 = "Nhưng người mình muốn mời nhất là...";

    if (hit && hit.relation) {
      if (hit.relation === "Bố" || hit.relation === "Mẹ") {
        l2 = "Con vẫn luôn có một bệ đỡ phía sau...";
        l3 = "Con muốn mời nhất chính là...";
      } else if (hit.relation === "Người yêu") {
        l2 = "Có những người làm mình thấy bình yên...";
      } else if (hit.relation === "Anh trai") {
        l2 = "Có một người luôn ở đó kiểu... anh trai.";
      } else if (hit.relation === "Người yêu (anh trai)") {
        l2 = "Gia đình mở rộng cũng là điều đáng quý...";
      } else if (hit.relation === "Người tốt nghiệp") {
        l2 = "Hôm nay là ngày mình tự hào nhất...";
        l3 = "Nhân vật chính của buổi lễ là...";
      }
    }

    if (els.reveal1) els.reveal1.textContent = l1;
    if (els.reveal2) els.reveal2.textContent = l2;
    if (els.reveal3) els.reveal3.textContent = l3;
    if (els.revealName) els.revealName.setAttribute("aria-label", "Tên người được mời: " + displayName);
  };
})();
export {};
