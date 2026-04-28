(function () {
  "use strict";

  var APP = window.APP;

  /* ========================================================================
     CẤU HÌNH — Sửa các giá trị sau cho buổi trình bày của bạn
     ======================================================================== */
  APP.CONFIG = {
    studentName: "Nguyễn Huy Hà",
    eventTime: "10h",
    eventPlace: "Đại học Bách Khoa Hà Nội",
    mealLine:
      "Sau buổi lễ, gia đình trân trọng kính mời dùng bữa cơm thân mật chung vui cùng gia đình.",
    sponsorLine: "Nhà tài trợ chính: Bố & Mẹ.",
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
