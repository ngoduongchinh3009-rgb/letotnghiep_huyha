(function () {
  "use strict";

  var APP = window.APP;

  /* ========================================================================
     CẤU HÌNH — Sửa các giá trị sau cho buổi trình bày của bạn
     ======================================================================== */
  APP.CONFIG = {
    /* Tên SV: dùng cho lời mời / ảnh… Không lặp trong khối #card-sub (chỉ giờ + địa điểm). */
    studentName: "Nguyễn Huy Hà",
    eventTime: "10h",
    eventPlace: "Đại học Bách Khoa Hà Nội",
    /* Lời cảm ơn cuối thiệp (#card-thanks) — {name} = tên khách khi đã xác thực */
    thanksAnonymous: "Cảm ơn vì sự có mặt của bạn.",
    thanksNamed: "{name} ơi, cảm ơn vì đã là một phần rất đẹp trong ngày này của mình.",
    mealLine:
      "Sau buổi lễ, trân trọng kính mời dùng bữa cơm thân mật chung vui cùng gia đình.",
    sponsorLine: "Nhà tài trợ chính: Bố & Mẹ.",
    /* Nội dung thiệp (một nguồn duy nhất — index.html để span rỗng, fillInviteCard đổ vào) */
    inviteFlavor:
      "Không phải họp Zoom — đây là lời mời có thật: có mặt là có niềm vui.",
    inviteFlavorAside:
      "Hãy mặc thật đẹp, cười thật tươi để lưu lại ảnh nhé!",
    invitePS:
      "P/S: Cười to một chút khi lên hình nhé… vì kỷ niệm này mình muốn giữ mãi, không chỉ trong slide.",
    /* Khi tên không khớp danh sách mời (GUEST_DB) — không còn chọn mối quan hệ trên form */
    defaultGuestRole: "{name} — cảm ơn bạn đã đến chung vui cùng mình.",
    /* Ô gợi ý dưới input (#guest-live) — HTML để trống, script.js boot gọi setGuestLiveFromInput() */
    guestLiveEmptyHint:
      "Nhập tên để tạo thiệp nha — mình luôn mong sự có mặt của bạn.",
    guestLiveStrangerLine: "{name} ơi, nhớ đến tham dự lễ nhé",
    guestQuickPickPlaceholder: "— Chọn nhanh (gợi ý riêng) —",
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
})();
export {};
