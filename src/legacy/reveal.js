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
    if (!APP.els || !APP.els.guestLive || !APP.els.inputName) return;
    var raw = (APP.els.inputName.value || "").trim();
    if (!raw) {
      APP.els.guestLive.classList.add("is-empty");
      APP.els.guestLive.textContent =
        APP.CONFIG.guestLiveEmptyHint ||
        "Nhập tên để tạo thiệp nha,\nMình luôn mong sự có mặt của bạn.";
      return;
    }
    var res = APP.resolveGuestLookupResult(raw);

    if (res.type === "ambiguous") {
      APP.els.guestLive.classList.add("is-empty");
      APP.els.guestLive.textContent = APP.CONFIG.guestAmbiguousLiveHint || "";
      return;
    }

    APP.els.guestLive.classList.remove("is-empty");
    if (res.type === "exact" && res.matches[0]) {
      var hit = res.matches[0];
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

  APP.fillInviteCard = function fillInviteCard(name, roleLine) {
    APP.state.guestRoleLine = roleLine || "";
    if (APP.els.cardSub) {
      var timeLine = String(APP.CONFIG.eventTime || "").trim();
      var placeLine = String(APP.CONFIG.eventPlace || "").trim();
      APP.els.cardSub.innerHTML =
        '<span class="classic-card__detail-k">Thời gian</span>' +
        '<span class="classic-card__detail-v">' +
        escapeHtml(timeLine) +
        "</span>" +
        '<span class="classic-card__detail-k">Địa điểm</span>' +
        '<span class="classic-card__detail-v">' +
        escapeHtml(placeLine) +
        "</span>";
    }
    if (APP.els.cardSub2) {
      APP.els.cardSub2.textContent = APP.buildInviteEventDetailText();
    }
    if (APP.els.cardInviteGuest) {
      APP.els.cardInviteGuest.textContent = name || "Bạn và gia đình";
    }
    if (APP.els.cardInviteMessage) {
      var lineOverride =
        APP.CONFIG.inviteCeremonyLine && String(APP.CONFIG.inviteCeremonyLine).trim();
      var tpl =
        (APP.CONFIG.inviteCeremonyTpl && String(APP.CONFIG.inviteCeremonyTpl).trim()) ||
        "Đến tham dự lễ tốt nghiệp của {student}";
      var sn = APP.CONFIG.studentName || "";
      var ceremony =
        lineOverride ||
        (tpl.indexOf("{student}") !== -1 ? tpl.replace(/\{student\}/g, sn) : tpl);
      APP.els.cardInviteMessage.textContent = ceremony;
    }
    if (APP.els.cardThanks) {
      var anonThanks = APP.CONFIG.thanksAnonymous || "Cảm ơn vì sự có mặt của bạn.";
      var namedTpl =
        APP.CONFIG.thanksNamed ||
        "{name} ơi, cảm ơn vì đã là một phần rất đẹp trong ngày này của mình.";
      APP.els.cardThanks.textContent = name
        ? namedTpl.replace(/\{name\}/g, name)
        : anonThanks;
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
        if (APP.els.revealLetter) {
          APP.els.revealLetter.hidden = true;
          APP.els.revealLetter.classList.remove("is-visible");
        }
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
        var t3 = APP.els.reveal3 && String(APP.els.reveal3.textContent || "").trim();
        if (t3) {
          APP.els.reveal3.classList.add("is-visible");
          return APP.wait(APP.CONFIG.revealGapMs);
        }
        return APP.wait(320);
      })
      .then(function () {
        if (APP.els.revealLetter) {
          APP.els.revealLetter.hidden = false;
          void APP.els.revealLetter.offsetWidth;
          APP.els.revealLetter.classList.add("is-visible");
        }
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
    /* Ba nhịp, mỗi dòng một ý — tránh một khối dài bị ngắt xấu */
    var l1 = "\u201CMỗi chương khép lại không phải là kết thúc,";
    var l2 = "mà là hành trình học hỏi để mở ra một khởi đầu mới,";
    var l3 = "trưởng thành và vững vàng hơn.\u201D";

    if (APP.els.reveal1) APP.els.reveal1.textContent = l1;
    if (APP.els.reveal2) APP.els.reveal2.textContent = l2;
    if (APP.els.reveal3) APP.els.reveal3.textContent = l3;
    if (APP.els.revealName) APP.els.revealName.setAttribute("aria-label", "Tên người được mời: " + displayName);
  };
})();
export {};
