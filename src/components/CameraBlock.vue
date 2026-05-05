<template>
  <div id="invite-camera-block" class="camera-block">
    <div id="secure-banner" class="secure-banner" hidden></div>

    <div class="camera-booth" :style="boothBgStyle">
      <div class="camera-booth__scrim" aria-hidden="true"></div>
      <div class="camera-booth__panel">
        <div class="camera-booth__head">
          <p class="camera-booth__eyebrow">Lễ tốt nghiệp</p>
          <h2 class="camera-booth__title">Chụp ảnh kỉ niệm</h2>
        </div>
        <div class="camera-wrap" id="camera-wrap">
          <video id="cam-video" playsinline webkit-playsinline autoplay muted></video>
          <canvas id="cam-overlay" class="cam-overlay" aria-hidden="true"></canvas>
        </div>
        <div class="cam-actions">
          <button type="button" class="btn-capture camera-booth__btn" id="btn-start-cam">Mở camera</button>
          <button type="button" class="btn-primary camera-booth__btn" id="btn-capture" disabled hidden>
            Chụp ảnh
          </button>
        </div>
      </div>
    </div>

    <p class="cam-error" id="cam-error" hidden></p>

    <section class="photo-preview photo-preview--grad" id="photo-preview" hidden>
      <div class="photo-preview__grad-inner">
        <img id="preview-img" alt="Ảnh kỷ niệm vừa chụp" />
        <p id="photo-preview-caption" class="photo-preview__caption"></p>
      </div>
      <div class="preview-actions">
        <button type="button" class="btn-secondary" id="btn-retake">Chụp lại</button>
        <button type="button" class="btn-primary" id="btn-download-again">Tải lại PNG</button>
        <button type="button" class="btn-secondary" id="btn-share-photo">Chia sẻ</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import gradBackdrop from "../../assets/graduation-camera-backdrop.png";

const boothBgStyle = computed(function () {
  return {
    backgroundImage: "url(" + String(gradBackdrop) + ")",
  };
});

onMounted(function () {
  var cfg = window.APP && window.APP.CONFIG;
  var cap = document.getElementById("photo-preview-caption");
  if (!cap || !cfg) return;
  var line = (cfg.cameraMemorialLine && String(cfg.cameraMemorialLine).trim()) || "";
  cap.textContent = line;
});
</script>

