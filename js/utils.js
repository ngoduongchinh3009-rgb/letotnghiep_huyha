(function () {
  "use strict";

  var APP = window.APP;
  var els = APP.els;

  APP.downloadBlob = function downloadBlob(blob, filename) {
    if (!blob) return;
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 2500);
  };

  APP.setStatus = function setStatus(el, kind, text) {
    if (!el) return;
    el.classList.remove("ok", "bad", "muted");
    el.classList.add(kind);
    el.textContent = text;
  };

  APP.bytesToHex = function bytesToHex(bytes) {
    var hex = "";
    var i;
    for (i = 0; i < bytes.length; i++) {
      var h = bytes[i].toString(16);
      if (h.length === 1) h = "0" + h;
      hex += h;
    }
    return hex;
  };

  APP.sha256Hex = async function sha256Hex(text) {
    var enc = new TextEncoder();
    var data = enc.encode(text);
    var hash = await crypto.subtle.digest("SHA-256", data);
    return APP.bytesToHex(new Uint8Array(hash));
  };

  APP.nowIso = function nowIso() {
    return new Date().toISOString();
  };

  APP.formatCreatedAt = function formatCreatedAt(ts) {
    try {
      if (!ts) return "";
      var d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleString("vi-VN", { hour12: false });
    } catch (e) {
      return "";
    }
  };

  APP.openModal = function openModal(url, title) {
    if (!els.photoModal || !els.modalImg) return;
    els.modalImg.src = url;
    if (els.modalTitle) els.modalTitle.textContent = title || "Ảnh kỷ niệm";
    els.photoModal.classList.add("is-open");
    els.photoModal.setAttribute("aria-hidden", "false");
  };

  APP.closeModal = function closeModal() {
    if (!els.photoModal) return;
    els.photoModal.classList.remove("is-open");
    els.photoModal.setAttribute("aria-hidden", "true");
    if (els.modalImg) els.modalImg.src = "";
  };
})();
