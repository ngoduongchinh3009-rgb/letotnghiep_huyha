(function () {
  "use strict";

  var APP = window.APP;
  var els = APP.els;

  APP.setGuestLiveFromInput = function setGuestLiveFromInput() {
    var raw = (els.inputName.value || "").trim();
    if (!raw) {
      els.guestLive.classList.add("is-empty");
      els.guestLive.innerHTML =
        "Gõ tên để hiện chức danh / lời nhắn thân thiết (theo danh sách mời).";
      return;
    }
    var hit = APP.lookupGuest(raw);
    els.guestLive.classList.remove("is-empty");
    if (hit) {
      els.guestLive.innerHTML =
        "<strong>" +
        hit.display +
        "</strong><br><span>" +
        hit.role +
        "</span>";
      var opt;
      for (opt = 0; opt < els.selectRelation.options.length; opt++) {
        if (els.selectRelation.options[opt].value === hit.relation) {
          els.selectRelation.selectedIndex = opt;
          break;
        }
      }
    } else {
      els.guestLive.innerHTML =
        "Chưa khớp danh sách mời — vẫn có thể chọn <strong>mối quan hệ</strong> và bấm Xác thực.";
    }
  };

  APP.fillInviteCard = function fillInviteCard(displayName, roleLine) {
    APP.state.guestRoleLine = roleLine || "";
    if (els.cardSub) {
      els.cardSub.textContent =
        APP.CONFIG.studentName + " · " + APP.CONFIG.eventTime + " · " + APP.CONFIG.eventPlace;
    }
    if (els.cardThanks) els.cardThanks.textContent = "Cảm ơn vì sự có mặt của bạn.";
    // Không hiện khung ảnh lơ lửng trước khi chụp
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
        els.reveal3.classList.remove("is-visible");
        els.revealName.classList.remove("is-visible");
        els.revealName.textContent = "";
        els.btnToInvite.hidden = true;
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
        els.reveal3.classList.add("is-visible");
        return APP.wait(APP.CONFIG.revealGapMs);
      })
      .then(function () {
        els.revealName.textContent = displayName;
        void els.revealName.offsetWidth; // reflow
        els.revealName.classList.add("is-visible");
        return APP.wait(APP.CONFIG.nameHoldMs);
      })
      .then(function () {
        els.btnToInvite.hidden = false;
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
