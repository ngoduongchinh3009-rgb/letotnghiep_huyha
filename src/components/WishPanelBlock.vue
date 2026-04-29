<template>
  <section class="wish-panel" id="wish-panel" aria-labelledby="wish-title">
    <h3 class="section-title" id="wish-title">Gửi lời chúc cho HuyHa</h3>
    <p class="hintline">
      Mỗi người gửi một lời chúc + ảnh kỷ niệm. HuyHa sẽ xem được tất cả trong “Wall” phía dưới.
    </p>

    <form id="wish-form" novalidate>
      <label for="wish-from">Tên bạn (tuỳ chọn)</label>
      <input id="wish-from" type="text" placeholder="Ví dụ: Lan, Nam, ..." />

      <label for="wish-message">Lời chúc (bắt buộc)</label>
      <textarea id="wish-message" placeholder="Viết vài dòng gửi HuyHa..."></textarea>

      <div class="inline-row">
        <label class="pill"><input type="checkbox" id="wish-use-last" /> Dùng ảnh vừa chụp</label>
        <span class="hintline" style="margin: 0">(hoặc chọn ảnh khác)</span>
      </div>

      <label for="wish-photo">Chọn ảnh (PNG/JPG)</label>
      <input id="wish-photo" type="file" accept="image/*" />

      <div class="btn-row" style="justify-content: flex-start">
        <button type="submit" class="btn-primary" id="wish-submit">Gửi lời chúc + ảnh</button>
        <button type="button" class="btn-secondary" id="btn-open-wall">Xem Wall</button>
      </div>
      <p class="status muted" id="wish-status">
        Chưa kết nối lưu trữ. Hãy cấu hình Firebase để bật tính năng này.
      </p>
    </form>
  </section>
</template>

<script setup></script>
