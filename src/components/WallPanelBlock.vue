<template>
  <section class="wish-panel" id="wall-panel" aria-labelledby="wall-title">
    <div class="inline-row" style="justify-content: space-between">
      <h3 class="section-title" id="wall-title" style="margin: 0">Wall lời chúc</h3>
      <input id="wall-search" type="text" placeholder="Tìm theo tên..." style="max-width: 220px" />
    </div>
    <p class="hintline" id="wall-hint">Các lời chúc sẽ hiện ở đây sau khi kết nối Firebase.</p>
    <div class="inline-row" style="justify-content: flex-start; margin-top: 0.25rem">
      <button type="button" class="btn-secondary" id="btn-copy-wall-link">Copy link xem (HuyHa)</button>
      <span class="hintline" id="wall-link-hint" style="margin: 0">Link này chỉ để xem Wall.</span>
    </div>
    <details class="access-help" style="margin: 0.6rem 0 0; width: 100%; max-width: none">
      <summary>Hướng dẫn vận hành (HuyHa) / GitHub Pages</summary>
      <div class="access-help__body">
        <p><strong>Link Wall:</strong> dùng chính link GitHub Pages hiện tại. Kéo xuống “Wall lời chúc”.</p>
        <p>
          <strong>Chụp &amp; gửi:</strong> người dùng chụp ảnh → preview → tick “Dùng ảnh vừa chụp” → nhập lời chúc
          + mã mời → Gửi.
        </p>
        <p><strong>Xem ảnh lớn:</strong> bấm vào thumbnail trong Wall.</p>
        <p>
          <strong>Mobile vẫn thấy bản cũ:</strong> Safari/Chrome hay cache. Thử refresh mạnh hoặc mở tab ẩn
          danh.
        </p>
      </div>
    </details>
    <div class="wall" id="wall"></div>
  </section>
</template>

<script setup></script>
