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

  APP.buildInviteEventDetailText = function buildInviteEventDetailText() {
    var c = APP.CONFIG;
    return ["Thời gian: " + c.eventTime, "Địa điểm: " + c.eventPlace].join("\n");
  };

  APP.setGuestLiveFromInput = function setGuestLiveFromInput() {
    var raw = (APP.els.inputName.value || "").trim();
    if (!raw) {
      APP.els.guestLive.classList.add("is-empty");
      APP.els.guestLive.textContent =
        APP.CONFIG.guestLiveEmptyHint ||
        "Nhập tên để tạo thiệp nha — mình luôn mong sự có mặt của bạn.";
      return;
    }
    var hit = APP.lookupGuest(raw);
    APP.els.guestLive.classList.remove("is-empty");
    if (hit) {
      APP.els.guestLive.innerHTML =
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
        APP.els.guestLive.innerHTML =
          "<strong>" +
          escapeHtml(raw) +
          "</strong><br><span>" +
          escapeHtml(t) +
          "</span>";
      } else {
        var parts = t.split("{name}");
        APP.els.guestLive.innerHTML =
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
    if (APP.els.cardSub) {
      APP.els.cardSub.textContent = APP.buildInviteEventDetailText();
    }
    if (APP.els.cardSub2) {
      APP.els.cardSub2.textContent = APP.buildInviteEventDetailText();
    }
    if (APP.els.cardInviteGuest) {
      APP.els.cardInviteGuest.textContent = displayName || "Bạn và gia đình";
    }
    if (APP.els.cardInviteMessage) {
      APP.els.cardInviteMessage.textContent =
        "Đến tham dự lễ tốt nghiệp của " + APP.CONFIG.studentName;
    }
    if (APP.els.cardThanks) {
      var anonThanks = APP.CONFIG.thanksAnonymous || "Cảm ơn vì sự có mặt của bạn.";
      var namedTpl =
        APP.CONFIG.thanksNamed ||
        "{name} ơi, cảm ơn vì đã là một phần rất đẹp trong ngày này của mình.";
      APP.els.cardThanks.textContent = displayName
        ? namedTpl.replace(/\{name\}/g, displayName)
        : anonThanks;
    }
    if (APP.els.cardFlavor) {
      APP.els.cardFlavor.textContent = APP.CONFIG.inviteFlavor || "";
      APP.els.cardFlavor.hidden = !APP.CONFIG.inviteFlavor;
    }
    if (APP.els.cardFlavorAside) {
      APP.els.cardFlavorAside.textContent = APP.CONFIG.inviteFlavorAside || "";
      APP.els.cardFlavorAside.hidden = !APP.CONFIG.inviteFlavorAside;
    }
    if (APP.els.cardPS) {
      APP.els.cardPS.textContent = APP.CONFIG.invitePS || "";
      APP.els.cardPS.hidden = !APP.CONFIG.invitePS;
    }
    if (APP.els.cardMeal) {
      APP.els.cardMeal.textContent = APP.CONFIG.mealLine || "";
      APP.els.cardMeal.hidden = !APP.CONFIG.mealLine;
    }
    if (APP.els.cardSponsor) {
      APP.els.cardSponsor.textContent = APP.CONFIG.sponsorLine || "";
      APP.els.cardSponsor.hidden = !APP.CONFIG.sponsorLine;
    }
    if (APP.els.cardFrame) APP.els.cardFrame.hidden = true;
    if (APP.els.cardEmpty) APP.els.cardEmpty.hidden = false;
    if (APP.els.cardPhoto) APP.els.cardPhoto.hidden = true;
    if (APP.els.cardPlaceholder) APP.els.cardPlaceholder.hidden = false;
  };

  APP.startSplash = function startSplash() {
    APP.wait(APP.CONFIG.splashDelayMs).then(function () {
      APP.showScreen(APP.els.formScreen);
      APP.els.inputName.focus();
    });
  };

  APP.runRevealSequence = function runRevealSequence(displayName) {
    APP.showScreen(APP.els.loadingScreen);
    return APP.wait(APP.CONFIG.loadingMs)
      .then(function () {
        APP.showScreen(APP.els.revealScreen);
        APP.els.reveal1.classList.remove("is-visible");
        APP.els.reveal2.classList.remove("is-visible");
        if (APP.els.reveal3) APP.els.reveal3.classList.remove("is-visible");
        APP.els.revealName.classList.remove("is-visible");
        APP.els.revealName.textContent = "";
        if (APP.els.btnToInvite) APP.els.btnToInvite.hidden = true;
        return APP.wait(400);
      })
      .then(function () {
        APP.els.reveal1.classList.add("is-visible");
        return APP.wait(APP.CONFIG.revealGapMs);
      })
      .then(function () {
        APP.els.reveal2.classList.add("is-visible");
        return APP.wait(APP.CONFIG.revealGapMs);
      })
      .then(function () {
        if (APP.els.reveal3) APP.els.reveal3.classList.add("is-visible");
        return APP.wait(APP.CONFIG.revealGapMs);
      })
      .then(function () {
        APP.els.revealName.textContent = displayName;
        void APP.els.revealName.offsetWidth;
        APP.els.revealName.classList.add("is-visible");
        return APP.wait(APP.CONFIG.nameHoldMs);
      })
      .then(function () {
        if (APP.els.btnToInvite) APP.els.btnToInvite.hidden = false;
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

    if (APP.els.reveal1) APP.els.reveal1.textContent = l1;
    if (APP.els.reveal2) APP.els.reveal2.textContent = l2;
    if (APP.els.reveal3) APP.els.reveal3.textContent = l3;
    if (APP.els.revealName) APP.els.revealName.setAttribute("aria-label", "Tên người được mời: " + displayName);
  };
})();
export {};
