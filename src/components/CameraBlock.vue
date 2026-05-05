<template>
  <div id="invite-camera-block" class="camera-block">
    <p style="margin: 0 0 0.5rem; font-size: clamp(1rem, 2.5vw, 1.15rem)">Chụp ảnh kỷ niệm</p>
    <p class="cam-frame-note">
      Mở camera là đã làm đẹp nhẹ (trắng da, mịn da, má hồng, đánh son). Khi chụp xong sẽ tạo thêm một thiệp
      kèm ảnh ở phía dưới.
    </p>
    <div id="secure-banner" class="secure-banner" hidden></div>
    <div class="camera-wrap" id="camera-wrap">
      <video id="cam-video" playsinline webkit-playsinline autoplay muted></video>
      <canvas id="cam-overlay" class="cam-overlay" aria-hidden="true"></canvas>
    </div>
    <div class="cam-actions">
      <button type="button" class="btn-capture" id="btn-start-cam">Mở camera</button>
      <button type="button" class="btn-primary" id="btn-capture" disabled hidden>Chụp ảnh kỷ niệm</button>
    </div>
    <p class="camera-block__congrats" id="camera-congrats-line"></p>
    <p class="cam-hint">
      Ảnh tải về PNG. Camera trên điện thoại: cần trang <strong>HTTPS</strong> (hoặc localhost). Mở mục “Điện
      thoại truy cập &amp; mở camera” ở màn form để xem cách dùng ngrok.
    </p>
    <p class="cam-error" id="cam-error" hidden></p>
    <section class="photo-preview" id="photo-preview" hidden>
      <h4>Ảnh vừa chụp</h4>
      <img id="preview-img" alt="Ảnh kỷ niệm vừa chụp" />
      <div class="preview-actions">
        <button type="button" class="btn-secondary" id="btn-retake">Chụp lại</button>
        <button type="button" class="btn-primary" id="btn-download-again">Tải lại PNG</button>
        <button type="button" class="btn-secondary" id="btn-share-photo">Chia sẻ</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

onMounted(() => {
  var cfg = window.APP && window.APP.CONFIG;
  var el = document.getElementById("camera-congrats-line");
  if (!el || !cfg || !cfg.studentName) return;
  var tail = (cfg.cameraCongratsLine && String(cfg.cameraCongratsLine).trim()) || "";
  el.textContent = tail ? cfg.studentName + "\n" + tail : cfg.studentName;
});
</script>
