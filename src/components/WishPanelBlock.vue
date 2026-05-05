<template>
  <section class="wish-panel wish-page" id="wish-panel" aria-labelledby="wish-title">
    <h3 class="section-title" id="wish-title">Gửi lời chúc cho HuyHa</h3>

    <form id="wish-form" class="wish-form wish-form__stack" novalidate>
      <div class="wish-field wish-field--muted">
        <label for="wish-from">Tên bạn (tùy chọn)</label>
        <input id="wish-from" type="text" placeholder="Ví dụ: Lan, Nam..." />
      </div>

      <div class="wish-field">
        <label for="wish-message">Lời chúc</label>
        <textarea id="wish-message" placeholder="Viết vài dòng gửi HuyHa..."></textarea>
      </div>

      <div class="wish-field wish-field--row">
        <label class="pill"><input type="checkbox" id="wish-use-last" /> Dùng ảnh vừa chụp</label>
      </div>

      <div class="wish-field wish-file">
        <label for="wish-photo">Ảnh đính kèm</label>
        <input id="wish-photo" class="wish-file__input" type="file" accept="image/*" />
        <label for="wish-photo" class="wish-file__trigger" role="button" tabindex="0">Chọn ảnh</label>
      </div>

      <div class="wish-form__footer">
        <button type="submit" class="btn-primary wish-submit-center" id="wish-submit">Gửi lời chúc</button>
      </div>

      <p class="wish-page__wall-text">
        <a class="wish-page__wall-url" :href="wallHref" target="_blank" rel="noopener noreferrer">Xem lời chúc</a>
      </p>

      <p class="status muted" id="wish-status"></p>
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
