<template>
  <section class="wish-panel wish-page" id="wish-panel" aria-labelledby="wish-title">
    <h3 class="section-title" id="wish-title">Gửi lời chúc cho HuyHa</h3>
    <p class="hintline">
      Mỗi người gửi một lời chúc + ảnh kỷ niệm. HuyHa sẽ xem được tất cả trong Wall phía dưới.
    </p>

    <form id="wish-form" class="wish-form wish-form__stack" novalidate>
      <div class="wish-field wish-field--muted">
        <label for="wish-from">Tên bạn (tuỳ chọn)</label>
        <input id="wish-from" type="text" placeholder="Ví dụ: Lan, Nam, ..." />
      </div>

      <div class="wish-field">
        <label for="wish-message">Lời chúc (bắt buộc)</label>
        <textarea id="wish-message" placeholder="Viết vài dòng gửi HuyHa..."></textarea>
      </div>

      <div class="wish-field wish-field--row">
        <label class="pill"><input type="checkbox" id="wish-use-last" /> Dùng ảnh vừa chụp</label>
        <span class="hintline wish-field__hint">(hoặc chọn ảnh khác)</span>
      </div>

      <div class="wish-field wish-file">
        <label for="wish-photo">Chọn ảnh (PNG/JPG)</label>
        <input id="wish-photo" type="file" accept="image/*" />
      </div>

      <div class="wish-form__footer btn-row">
        <button type="submit" class="btn-primary" id="wish-submit">Gửi lời chúc + ảnh</button>
        <a
          class="btn-secondary wish-page__wall-link"
          :href="wallHref"
          target="_blank"
          rel="noopener noreferrer"
        >
          Xem những lời chúc
        </a>
      </div>
      <p class="status muted" id="wish-status">
        Chưa kết nối lưu trữ. Hãy cấu hình Firebase để bật tính năng này.
      </p>
    </form>
  </section>
</template>

<script setup>
import { computed } from "vue";

const wallHref = computed(function () {
  if (typeof window !== "undefined" && window.APP && typeof window.APP.buildWallViewLink === "function") {
    return window.APP.buildWallViewLink();
  }
  return "?view=wall#wall";
});
</script>
