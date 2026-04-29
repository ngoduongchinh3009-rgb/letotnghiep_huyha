(function () {
  "use strict";

  var APP = window.APP;
  var els = APP.els;

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
        els.wishStatus,
        "bad",
        "Chưa cấu hình Firebase. Điền FIREBASE_CONFIG để bật gửi lời chúc."
      );
      APP.setStatus(els.wallHint, "muted", "Chưa cấu hình Firebase nên chưa tải được Wall.");
      return false;
    }
    if (typeof firebase === "undefined") {
      APP.setStatus(
        els.wishStatus,
        "bad",
        "Không tải được Firebase SDK (cần internet/HTTPS). Thử reload trang."
      );
      return false;
    }
    try {
      APP.state.firebaseApp = firebase.initializeApp(APP.FIREBASE_CONFIG);
      APP.state.db = firebase.firestore();
      APP.setStatus(els.wishStatus, "muted", "Sẵn sàng. Hãy viết lời chúc và gửi.");
      return true;
    } catch (e) {
      APP.setStatus(
        els.wishStatus,
        "bad",
        "Lỗi khởi tạo Firebase: " + (e && e.message ? e.message : String(e))
      );
      return false;
    }
  };

  APP.renderWall = function renderWall(items) {
    if (!els.wallEl) return;
    var q = (els.wallSearch && els.wallSearch.value ? els.wallSearch.value : "")
      .trim()
      .toLowerCase();
    els.wallEl.innerHTML = "";
    if (!items.length) {
      APP.setStatus(els.wallHint, "muted", "Chưa có lời chúc nào.");
      return;
    }
    APP.setStatus(els.wallHint, "muted", "Tổng: " + items.length + " lời chúc.");
    var i;
    for (i = 0; i < items.length; i++) {
      var w = items[i];
      if (q) {
        var s = ((w.fromName || "") + " " + (w.message || "")).toLowerCase();
        if (s.indexOf(q) === -1) continue;
      }
      var card = document.createElement("div");
      card.className = "wish-card";

      var thumb = document.createElement("div");
      thumb.className = "wish-card__thumb";
      var img = document.createElement("img");
      img.src = w.photoUrl || "";
      img.alt = "Ảnh kỷ niệm";
      thumb.appendChild(img);
      thumb.addEventListener(
        "click",
        (function (url, title) {
          return function () {
            APP.openModal(url, title);
          };
        })(
          w.photoUrl,
          (w.fromName ? w.fromName : "Một người bạn") + " · " + APP.formatCreatedAt(w.createdAt)
        )
      );

      var body = document.createElement("div");
      body.className = "wish-card__body";
      var from = document.createElement("div");
      from.className = "wish-card__from";
      from.textContent = w.fromName ? w.fromName : "Ẩn danh";
      var msg = document.createElement("div");
      msg.className = "wish-card__msg";
      msg.textContent = w.message || "";
      var meta = document.createElement("div");
      meta.className = "wish-card__meta";
      meta.textContent = APP.formatCreatedAt(w.createdAt);

      body.appendChild(from);
      body.appendChild(msg);
      body.appendChild(meta);

      card.appendChild(thumb);
      card.appendChild(body);
      els.wallEl.appendChild(card);
    }
  };

  APP.attachWallListener = function attachWallListener() {
    if (!APP.state.db) return;
    if (APP.state.wallUnsub) APP.state.wallUnsub();
    APP.setStatus(els.wallHint, "muted", "Đang tải Wall...");
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
          els.wallEl.__items = items;
        },
        function (err) {
          APP.setStatus(
            els.wallHint,
            "bad",
            "Không tải được Wall: " + (err && err.message ? err.message : String(err))
          );
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

  APP.handleWishSubmit = async function handleWishSubmit(e) {
    e.preventDefault();
    if (!APP.initFirebaseMaybe()) return;
    if (!APP.hasCloudinaryConfig()) {
      APP.setStatus(
        els.wishStatus,
        "bad",
        "Chưa cấu hình Cloudinary. Điền CLOUDINARY.cloudName + CLOUDINARY.uploadPreset."
      );
      return;
    }
    var msg = (els.wishMessage && els.wishMessage.value ? els.wishMessage.value : "").trim();
    if (!msg) {
      APP.setStatus(els.wishStatus, "bad", "Bạn chưa nhập lời chúc.");
      if (els.wishMessage) els.wishMessage.focus();
      return;
    }

    var now = Date.now();
    if (now - APP.state.lastWishAt < 45000) {
      APP.setStatus(els.wishStatus, "bad", "Bạn gửi hơi nhanh. Đợi ~45 giây rồi thử lại nhé.");
      return;
    }

    var fromName = (els.wishFrom && els.wishFrom.value ? els.wishFrom.value : "").trim();
    var blob = null;
    if (els.wishUseLast && els.wishUseLast.checked) blob = APP.state.lastPhotoBlob;
    if (!blob && els.wishPhoto && els.wishPhoto.files && els.wishPhoto.files[0]) {
      blob = els.wishPhoto.files[0];
    }
    if (!blob) {
      APP.setStatus(els.wishStatus, "bad", "Bạn chưa chọn ảnh (hoặc chưa chụp ảnh).");
      return;
    }
    var MAX_BYTES = 1024 * 1024; // 1MB để giảm chi phí/băng thông
    if (blob.size && blob.size > MAX_BYTES * 3) {
      APP.setStatus(els.wishStatus, "bad", "Ảnh quá lớn. Hãy chọn ảnh nhỏ hơn (khuyến nghị <= 6MB).");
      return;
    }
    if (blob instanceof File && !APP.isImageFile(blob)) {
      APP.setStatus(els.wishStatus, "bad", "File không phải ảnh. Hãy chọn PNG/JPG/WebP.");
      return;
    }
    blob = await APP.compressImageIfNeeded(blob, MAX_BYTES);
    if (blob.size && blob.size > MAX_BYTES) {
      APP.setStatus(els.wishStatus, "bad", "Ảnh vẫn hơi lớn sau khi nén. Hãy chọn ảnh khác.");
      return;
    }

    els.wishSubmit.disabled = true;
    APP.setStatus(els.wishStatus, "muted", "Đang gửi... (upload ảnh)");
    try {
      var docRef = await APP.createWishDoc({
        fromName: fromName || "",
        message: msg,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        photoUrl: "",
        clientAt: APP.nowIso(),
      });
      var url = await APP.uploadWishPhotoToCloudinary(blob);
      await docRef.update({ photoUrl: url });
      APP.state.lastWishAt = Date.now();
      APP.setStatus(els.wishStatus, "ok", "Đã gửi! Cảm ơn bạn.");

      if (APP.state.lastWishPreviewUrl) URL.revokeObjectURL(APP.state.lastWishPreviewUrl);
      try {
        APP.state.lastWishPhotoBlob = blob;
        APP.state.lastWishPreviewUrl = URL.createObjectURL(blob);
      } catch (e2) {}

      APP.attachWallListener();
    } catch (err) {
      APP.setStatus(
        els.wishStatus,
        "bad",
        "Gửi thất bại: " + (err && err.message ? err.message : String(err))
      );
    } finally {
      els.wishSubmit.disabled = false;
    }
  };
})();
export {};
