(function () {
  "use strict";

  var APP = window.APP;
  var DEFAULT_WISH_MESSAGE = "Chúc mừng HuyHa tốt nghiệp cử nhân. Tiếp tục cố gắng nhé";

  APP.hasFirebaseConfig = function hasFirebaseConfig() {
    return (
      APP.FIREBASE_CONFIG &&
      APP.FIREBASE_CONFIG.apiKey &&
      APP.FIREBASE_CONFIG.projectId &&
      APP.FIREBASE_CONFIG.storageBucket &&
      APP.FIREBASE_CONFIG.appId
    );
  };

  APP.initFirebaseMaybe = function initFirebaseMaybe() {
    if (!APP.hasFirebaseConfig()) {
      APP.setStatus(
        APP.els.wishStatus,
        "bad",
        "Chưa cấu hình Firebase. Điền FIREBASE_CONFIG để bật gửi lời chúc."
      );
      if (APP.els.wallHint) {
        APP.setStatus(APP.els.wallHint, "muted", "Chưa cấu hình Firebase nên chưa tải được Wall.");
      }
      return false;
    }
    if (typeof firebase === "undefined") {
      APP.setStatus(
        APP.els.wishStatus,
        "bad",
        "Không tải được Firebase SDK (cần internet/HTTPS). Thử reload trang."
      );
      return false;
    }
    try {
      APP.state.firebaseApp = firebase.initializeApp(APP.FIREBASE_CONFIG);
      APP.state.db = firebase.firestore();
      APP.setStatus(APP.els.wishStatus, "muted", "");
      return true;
    } catch (e) {
      APP.setStatus(
        APP.els.wishStatus,
        "bad",
        "Lỗi khởi tạo Firebase: " + (e && e.message ? e.message : String(e))
      );
      return false;
    }
  };

  APP.renderWall = function renderWall(items) {
    if (!APP.els.wallEl) return;
    var list = items || [];
    var q = (APP.els.wallSearch && APP.els.wallSearch.value ? APP.els.wallSearch.value : "")
      .trim()
      .toLowerCase();
    APP.els.wallEl.innerHTML = "";
    if (!list.length) {
      if (APP.els.wallHint) APP.setStatus(APP.els.wallHint, "muted", "Chưa có lời chúc nào.");
      return;
    }
    if (APP.els.wallHint) APP.setStatus(APP.els.wallHint, "muted", "Tổng: " + list.length + " lời chúc.");
    var unifiedName = APP.getGuestNameFromInvite();
    var i;
    for (i = 0; i < list.length; i++) {
      var w = list[i];
      if (q) {
        var searchName = unifiedName || w.fromName || w.name || w.guestName || w.displayName || "";
        var s = (searchName + " " + (w.message || "")).toLowerCase();
        if (s.indexOf(q) === -1) continue;
      }
      var card = document.createElement("div");
      card.className = "wish-card wish-card--polaroid";

      var frame = document.createElement("div");
      frame.className = "wish-card__frame";
      var thumb = document.createElement("div");
      thumb.className = "wish-card__thumb";
      var img = document.createElement("img");
      img.src = w.photoUrl || w.imageUrl || "";
      img.alt = "Ảnh kỷ niệm";
      thumb.appendChild(img);
      thumb.addEventListener(
        "click",
        (function (url) {
          return function () {
            if (url) window.open(url, "_blank", "noopener,noreferrer");
          };
        })(w.photoUrl || w.imageUrl)
      );

      var msg = document.createElement("div");
      msg.className = "wish-card__note";
      var noteText = (w.message || "").trim() || DEFAULT_WISH_MESSAGE;
      var compactText = noteText.replace(/\s+/g, " ").trim();
      var textLen = compactText.length;
      if (textLen > 72) msg.classList.add("is-long");
      if (textLen > 120) msg.classList.add("is-xlong");
      msg.textContent = noteText;
      frame.appendChild(thumb);
      frame.appendChild(msg);

      var footer = document.createElement("div");
      footer.className = "wish-card__footer";
      var from = document.createElement("div");
      from.className = "wish-card__from";
      from.textContent = unifiedName || w.fromName || w.name || w.guestName || w.displayName || "Khách mời";
      var meta = document.createElement("div");
      meta.className = "wish-card__meta";
      meta.textContent = APP.formatCreatedAt(w.createdAt);
      footer.appendChild(from);
      footer.appendChild(meta);
      card.appendChild(frame);
      card.appendChild(footer);
      APP.els.wallEl.appendChild(card);
    }
  };

  APP.attachWallListener = function attachWallListener() {
    if (!APP.state.db || !APP.els.wallEl) return;
    if (APP.state.wallUnsub) APP.state.wallUnsub();
    if (APP.els.wallHint) APP.setStatus(APP.els.wallHint, "muted", "Đang tải Wall...");
    APP.state.wallUnsub = APP.state.db
      .collection("wishes")
      .orderBy("createdAt", "desc")
      .limit(60)
      .onSnapshot(
        function (snap) {
          var items = [];
          snap.forEach(function (doc) {
            var d = doc.data() || {};
            d.id = doc.id;
            items.push(d);
          });
          APP.renderWall(items);
          APP.els.wallEl.__items = items;
        },
        function (err) {
          if (APP.els.wallHint) {
            APP.setStatus(
              APP.els.wallHint,
              "bad",
              "Không tải được Wall: " + (err && err.message ? err.message : String(err))
            );
          }
        }
      );
  };

  APP.hasCloudinaryConfig = function hasCloudinaryConfig() {
    return APP.CLOUDINARY && APP.CLOUDINARY.cloudName && APP.CLOUDINARY.uploadPreset;
  };

  APP.uploadWishPhotoToCloudinary = async function uploadWishPhotoToCloudinary(fileOrBlob) {
    if (!APP.hasCloudinaryConfig()) {
      throw new Error("Chưa cấu hình Cloudinary (cloudName/uploadPreset).");
    }
    var endpoint =
      "https://api.cloudinary.com/v1_1/" + APP.CLOUDINARY.cloudName + "/image/upload";
    var fd = new FormData();
    fd.append("file", fileOrBlob);
    fd.append("upload_preset", APP.CLOUDINARY.uploadPreset);
    if (APP.CLOUDINARY.folder) fd.append("folder", APP.CLOUDINARY.folder);
    fd.append("tags", "letotnghiep_huyha");

    var res = await fetch(endpoint, { method: "POST", body: fd });
    if (!res.ok) {
      var txt = await res.text().catch(function () {
        return "";
      });
      throw new Error("Cloudinary upload lỗi: " + res.status + " " + txt);
    }
    var json = await res.json();
    return json.secure_url || json.url;
  };

  APP.isImageFile = function isImageFile(f) {
    return !!(f && f.type && f.type.indexOf("image/") === 0);
  };

  APP.compressImageIfNeeded = async function compressImageIfNeeded(fileOrBlob, maxBytes) {
    if (fileOrBlob && fileOrBlob.size && fileOrBlob.size <= maxBytes) return fileOrBlob;
    try {
      var blob = fileOrBlob;
      var url = URL.createObjectURL(blob);
      var img = new Image();
      img.decoding = "async";
      img.src = url;
      await new Promise(function (resolve, reject) {
        img.onload = resolve;
        img.onerror = reject;
      });
      URL.revokeObjectURL(url);

      var maxW = 1080;
      var scale = Math.min(1, maxW / img.naturalWidth);
      var w = Math.max(1, Math.round(img.naturalWidth * scale));
      var h = Math.max(1, Math.round(img.naturalHeight * scale));
      var c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      var cx = c.getContext("2d");
      cx.drawImage(img, 0, 0, w, h);

      var q = 0.82;
      var outBlob = await new Promise(function (resolve) {
        c.toBlob(
          function (b) {
            resolve(b);
          },
          "image/jpeg",
          q
        );
      });
      while (outBlob && outBlob.size > maxBytes && q > 0.55) {
        q -= 0.08;
        outBlob = await new Promise(function (resolve) {
          c.toBlob(
            function (b) {
              resolve(b);
            },
            "image/jpeg",
            q
          );
        });
      }
      return outBlob || fileOrBlob;
    } catch (e) {
      return fileOrBlob;
    }
  };

  APP.createWishDoc = function createWishDoc(data) {
    if (!APP.state.db) throw new Error("Firestore chưa sẵn sàng");
    return APP.state.db.collection("wishes").add(data);
  };

  APP.buildCloudinarySquareUrl = function buildCloudinarySquareUrl(url) {
    if (!url) return "";
    var marker = "/upload/";
    var idx = String(url).indexOf(marker);
    if (idx === -1) return String(url);
    var before = String(url).slice(0, idx + marker.length);
    var after = String(url).slice(idx + marker.length);
    if (!after) return String(url);
    // Keep the full uploaded image and pad with black if needed (no crop).
    return before + "c_pad,w_1280,h_720,b_black,f_auto,q_auto:good,dpr_auto/" + after;
  };

  APP.showWishThanksPopup = function showWishThanksPopup() {
    var existing = document.getElementById("wish-thanks-popup");
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    var popup = document.createElement("div");
    popup.id = "wish-thanks-popup";
    popup.className = "wish-thanks-popup";
    popup.innerHTML =
      '<div class="wish-thanks-popup__card" role="dialog" aria-modal="true" aria-labelledby="wish-thanks-title">' +
      '<div class="wish-thanks-popup__icon" aria-hidden="true">🎓</div>' +
      '<h3 class="wish-thanks-popup__title" id="wish-thanks-title">Đã nhận lời chúc nha</h3>' +
      '<p class="wish-thanks-popup__text">Thứ Bảy nhớ ghé nhé!</p>' +
      '<button type="button" class="wish-thanks-popup__btn">Đóng</button>' +
      "</div>";

    function closePopup() {
      if (!popup) return;
      popup.classList.remove("is-open");
      setTimeout(function () {
        if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
      }, 180);
    }

    popup.addEventListener("click", function (e) {
      if (e.target === popup) closePopup();
    });
    var closeBtn = popup.querySelector(".wish-thanks-popup__btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", closePopup);
      closeBtn.focus();
    }
    document.body.appendChild(popup);
    requestAnimationFrame(function () {
      popup.classList.add("is-open");
    });
  };

  APP.getGuestNameFromInvite = function getGuestNameFromInvite() {
    var n = APP.state && APP.state.guestFullName ? String(APP.state.guestFullName).trim() : "";
    if (!n && APP.els && APP.els.inputName && APP.els.inputName.value) {
      n = String(APP.els.inputName.value).trim();
    }
    if (!n) {
      try {
        n = String(sessionStorage.getItem("inviteGuestName") || "").trim();
      } catch (e) {}
    }
    return n;
  };

  APP.openWallAfterSubmit = function openWallAfterSubmit() {
    if (typeof APP.enterWallViewFromAnywhere === "function") {
      APP.enterWallViewFromAnywhere();
    }
    if (APP.hasFirebaseConfig() && APP.els.wallEl) APP.attachWallListener();
    if (APP.els.wallPanel) {
      APP.els.wallPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  APP.setPolaroidVisible = function setPolaroidVisible(visible) {
    if (!APP.els.polaroidPanel) return;
    APP.els.polaroidPanel.hidden = !visible;
  };

  APP.preparePolaroidFromCapture = function preparePolaroidFromCapture() {
    if (!APP.els.polaroidPanel || !APP.els.polaroidImage) return;
    if (!APP.state.lastPhotoBlob || !APP.state.lastPhotoUrl) {
      APP.setPolaroidVisible(false);
      return;
    }
    APP.els.polaroidImage.src = APP.state.lastPhotoUrl;
    if (APP.els.polaroidMessage) APP.els.polaroidMessage.value = "";
    if (APP.els.polaroidStatus) APP.setStatus(APP.els.polaroidStatus, "muted", "");
    if (APP.els.polaroidSubmit) {
      APP.els.polaroidSubmit.disabled = false;
      APP.els.polaroidSubmit.textContent = "Gửi lời chúc";
    }
    APP.setPolaroidVisible(true);
  };

  APP.handlePolaroidUploadSelect = async function handlePolaroidUploadSelect(e) {
    var file =
      e &&
      e.target &&
      e.target.files &&
      e.target.files[0]
        ? e.target.files[0]
        : null;
    if (!file) return;
    if (!APP.isImageFile(file)) {
      APP.setStatus(APP.els.polaroidStatus, "bad", "Vui lòng chọn file ảnh (PNG/JPG/WebP).");
      if (APP.els.polaroidUploadInput) APP.els.polaroidUploadInput.value = "";
      return;
    }
    var blob = await APP.compressImageIfNeeded(file, 1200 * 1024);
    if (APP.state.lastPhotoUrl) URL.revokeObjectURL(APP.state.lastPhotoUrl);
    APP.state.lastPhotoBlob = blob || file;
    APP.state.lastPhotoUrl = URL.createObjectURL(APP.state.lastPhotoBlob);
    if (APP.els.polaroidImage) APP.els.polaroidImage.src = APP.state.lastPhotoUrl;
    APP.setPolaroidVisible(true);
    APP.setStatus(APP.els.polaroidStatus, "muted", "Đã dùng ảnh từ máy.");
    if (APP.els.polaroidUploadInput) APP.els.polaroidUploadInput.value = "";
  };

  APP.handlePolaroidSubmit = async function handlePolaroidSubmit() {
    if (!APP.initFirebaseMaybe()) return;
    if (!APP.hasCloudinaryConfig()) {
      APP.setStatus(
        APP.els.polaroidStatus,
        "bad",
        "Chưa cấu hình Cloudinary (cloudName/uploadPreset)."
      );
      return;
    }
    if (!APP.state.lastPhotoBlob) {
      APP.setStatus(APP.els.polaroidStatus, "bad", "Bạn chưa có ảnh vừa chụp để gửi.");
      return;
    }
    var message =
      APP.els.polaroidMessage && APP.els.polaroidMessage.value
        ? APP.els.polaroidMessage.value.trim()
        : "";
    if (!message) message = DEFAULT_WISH_MESSAGE;
    var fromName = APP.getGuestNameFromInvite();
    if (!fromName) {
      APP.setStatus(APP.els.polaroidStatus, "bad", "Thiếu tên từ thiệp. Vui lòng quay lại nhập tên.");
      return;
    }

    if (APP.els.polaroidSubmit) {
      APP.els.polaroidSubmit.disabled = true;
      APP.els.polaroidSubmit.textContent = "Đang gửi...";
    }
    APP.setStatus(APP.els.polaroidStatus, "muted", "Đang gửi... (upload ảnh)");

    try {
      var uploadBlob = await APP.compressImageIfNeeded(APP.state.lastPhotoBlob, 850 * 1024);
      var uploadedUrl = await APP.uploadWishPhotoToCloudinary(uploadBlob);
      var optimizedUrl = APP.buildCloudinarySquareUrl(uploadedUrl);
      var now = Date.now();
      await APP.createWishDoc({
        imageUrl: optimizedUrl,
        photoUrl: optimizedUrl,
        message: message,
        timestamp: now,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        clientAt: APP.nowIso(),
        fromName: fromName,
        name: fromName,
        guestName: fromName,
        displayName: fromName,
      });

      if (APP.els.polaroidMessage) APP.els.polaroidMessage.value = "";
      APP.setPolaroidVisible(false);
      APP.setStatus(APP.els.polaroidStatus, "ok", "Đã gửi lời chúc thành công!");
      APP.setStatus(APP.els.wishStatus, "ok", "Đã gửi lời chúc thành công!");
      APP.showWishThanksPopup();
    } catch (err) {
      APP.setStatus(
        APP.els.polaroidStatus,
        "bad",
        "Gửi thất bại: " + (err && err.message ? err.message : String(err))
      );
    } finally {
      if (APP.els.polaroidSubmit) {
        APP.els.polaroidSubmit.disabled = false;
        APP.els.polaroidSubmit.textContent = "Gửi lời chúc";
      }
    }
  };

  APP.handleWishSubmit = async function handleWishSubmit(e) {
    e.preventDefault();
    if (!APP.initFirebaseMaybe()) return;
    if (!APP.hasCloudinaryConfig()) {
      APP.setStatus(
        APP.els.wishStatus,
        "bad",
        "Chưa cấu hình Cloudinary. Điền CLOUDINARY.cloudName + CLOUDINARY.uploadPreset."
      );
      return;
    }
    var msg = (APP.els.wishMessage && APP.els.wishMessage.value ? APP.els.wishMessage.value : "").trim();
    if (!msg) msg = DEFAULT_WISH_MESSAGE;

    var now = Date.now();
    if (now - APP.state.lastWishAt < 45000) {
      APP.setStatus(APP.els.wishStatus, "bad", "Bạn gửi hơi nhanh. Đợi ~45 giây rồi thử lại nhé.");
      return;
    }

    var fromName = APP.getGuestNameFromInvite();
    if (!fromName) {
      APP.setStatus(APP.els.wishStatus, "bad", "Thiếu tên từ thiệp. Vui lòng quay lại nhập tên.");
      return;
    }
    var blob = null;
    if (APP.els.wishUseLast && APP.els.wishUseLast.checked) blob = APP.state.lastPhotoBlob;
    if (!blob && APP.els.wishPhoto && APP.els.wishPhoto.files && APP.els.wishPhoto.files[0]) {
      blob = APP.els.wishPhoto.files[0];
    }
    if (!blob) {
      APP.setStatus(APP.els.wishStatus, "bad", "Bạn chưa chọn ảnh (hoặc chưa chụp ảnh).");
      return;
    }
    var MAX_BYTES = 1024 * 1024; // 1MB để giảm chi phí/băng thông
    if (blob.size && blob.size > MAX_BYTES * 3) {
      APP.setStatus(APP.els.wishStatus, "bad", "Ảnh quá lớn. Hãy chọn ảnh nhỏ hơn (khuyến nghị <= 6MB).");
      return;
    }
    if (blob instanceof File && !APP.isImageFile(blob)) {
      APP.setStatus(APP.els.wishStatus, "bad", "File không phải ảnh. Hãy chọn PNG/JPG/WebP.");
      return;
    }
    blob = await APP.compressImageIfNeeded(blob, MAX_BYTES);
    if (blob.size && blob.size > MAX_BYTES) {
      APP.setStatus(APP.els.wishStatus, "bad", "Ảnh vẫn hơi lớn sau khi nén. Hãy chọn ảnh khác.");
      return;
    }

    APP.els.wishSubmit.disabled = true;
    APP.setStatus(APP.els.wishStatus, "muted", "Đang gửi... (upload ảnh)");
    try {
      var docRef = await APP.createWishDoc({
        fromName: fromName || "",
        name: fromName || "",
        guestName: fromName || "",
        displayName: fromName || "",
        message: msg,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        photoUrl: "",
        clientAt: APP.nowIso(),
      });
      var url = await APP.uploadWishPhotoToCloudinary(blob);
      var optimizedUrl = APP.buildCloudinarySquareUrl(url);
      await docRef.update({ photoUrl: optimizedUrl, imageUrl: optimizedUrl, timestamp: Date.now() });
      APP.state.lastWishAt = Date.now();
      if (APP.els.wishMessage) APP.els.wishMessage.value = "";
      if (APP.els.wishPhoto) APP.els.wishPhoto.value = "";
      if (APP.els.wishUseLast) APP.els.wishUseLast.checked = false;

      if (APP.state.lastWishPreviewUrl) URL.revokeObjectURL(APP.state.lastWishPreviewUrl);
      try {
        APP.state.lastWishPhotoBlob = blob;
        APP.state.lastWishPreviewUrl = URL.createObjectURL(blob);
      } catch (e2) {}

      APP.setStatus(APP.els.wishStatus, "ok", "Đã gửi lời chúc thành công!");
      APP.showWishThanksPopup();
    } catch (err) {
      APP.setStatus(
        APP.els.wishStatus,
        "bad",
        "Gửi thất bại: " + (err && err.message ? err.message : String(err))
      );
    } finally {
      APP.els.wishSubmit.disabled = false;
    }
  };
})();
export {};
