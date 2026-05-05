(function () {
  "use strict";

  var APP = window.APP;

  /* ========================================================================
     CẤU HÌNH — Sửa các giá trị sau cho buổi trình bày của bạn
     ======================================================================== */
  APP.CONFIG = {
    /**
     * Font toàn trang (thiệp, form, Wall…) — trùng với dòng lễ #card-invite-message (inviteCeremonyTpl).
     * Đổi font: sửa chuỗi này + link Google Fonts tương ứng trong index.html (nếu dùng webfont).
     */
    fontStack: '"EB Garamond", Garamond, "Times New Roman", Times, Georgia, "Liberation Serif", serif',
    /* Tên SV: dùng cho lời mời / ảnh… Không lặp trong khối #card-sub (chỉ giờ + địa điểm). */
    studentName: "Nguyễn Huy Hà",
    /** Dòng dưới khung camera (xuống dòng được, cần CSS pre-line) */
    cameraCongratsLine: "Cảm ơn bạn đã tới chung vui cùng mình.",
    /** Một dòng trên thiệp (CSS nowrap). {student} = studentName. Ghi đè: inviteCeremonyLine. */
    inviteCeremonyTpl: "Đến tham dự lễ tốt nghiệp của {student}",
    /* Xuống dòng trong chuỗi: hiển thị với .classic-card__detail-v { white-space: pre-line } */
    eventTime: "7h15 – 11h30 \nThứ Bảy ngày 09/05/2026",
    eventPlace: "Hội trường C2 \nĐại học Bách khoa Hà Nội",
    /* Lời cảm ơn cuối thiệp (#card-thanks) — {name} = tên khách khi đã xác thực */
    thanksAnonymous: "Cảm ơn vì sự có mặt của bạn.",
    thanksNamed: "{name} ơi, cảm ơn vì đã là một phần rất đẹp trong ngày này.",
    mealLine: "Sau buổi lễ có bữa cơm thân mật",
    sponsorLine: "Nhà tài trợ chính: Bố & Mẹ.",
    invitePS:
      "P/S: Hãy mặc thật đẹp và cười thật tươi để lưu lại ảnh nhé!",
    /* Khi tên không khớp danh sách mời (GUEST_DB) — không còn chọn mối quan hệ trên form */
    defaultGuestRole: "{name} — cảm ơn bạn đã đến chung vui cùng mình.",
    /* Ô gợi ý dưới input (#guest-live) — HTML để trống, script.js boot gọi setGuestLiveFromInput() */
    guestLiveEmptyHint:
      "Nhập tên để tạo thiệp nha,\nMình luôn mong sự có mặt của bạn.",
    guestLiveStrangerLine: "{name} ơi, nhớ đến tham dự lễ nhé",
    guestImportantFallbackRole: "Khách mời quan trọng",
    guestConfirmTitle: "Xác nhận giúp mình nhé",
    guestConfirmSub: "Chọn đúng người để xem lời mời riêng.",
    guestConfirmDecline: "Tạo thiệp khách mời",
    guestConfirmFooterHint:
      "Nếu đúng là người mình đang nhắc tới, chọn nút vàng bên trái để mở lời mời riêng.\n" +
      "Nếu không phải thì bấm «Tạo thiệp khách mời» bên phải để nhận thiệp nhé, mình rất mong được gặp bạn trong buổi lễ.",
    loverGreetingDelayMs: 1600,
    splashDelayMs: 2600,
    loadingMs: 2800,
    revealGapMs: 2200,
    nameHoldMs: 2200,
  };

  /* ========================================================================
     Firebase config — BẮT BUỘC thay bằng config của bạn để bật Wall.
     (Firebase Web App config, lấy trong Firebase Console)
     ======================================================================== */
  APP.FIREBASE_CONFIG = {
    apiKey: "AIzaSyCOObXppV40yoGhf67idGECaBPOap6SsjY",
    authDomain: "gleaming-ocean-433116-q4.firebaseapp.com",
    projectId: "gleaming-ocean-433116-q4",
    storageBucket: "gleaming-ocean-433116-q4.firebasestorage.app",
    appId: "1:749181955691:web:359afc32d01bd3862dcb2e",
  };

  // Bỏ mã mời: mở gửi công khai
  APP.PASSCODE_HASH = "";

  /* ========================================================================
     Cloudinary (upload ảnh) — dùng unsigned upload để không cần billing Firebase Storage.
     Bạn cần tạo 1 Upload preset (Unsigned) trong Cloudinary console.
     ======================================================================== */
  APP.CLOUDINARY = {
    cloudName: "dfgpbojdl",
    uploadPreset: "letotnghiep_huyha",
    folder: "letotnghiep_huyha",
  };

  (function applyFontStackFromConfig() {
    var stack = APP.CONFIG.fontStack && String(APP.CONFIG.fontStack).trim();
    if (!stack) return;
    try {
      document.documentElement.style.setProperty("--font", stack);
    } catch (e) {}
  })();
})();
export {};
