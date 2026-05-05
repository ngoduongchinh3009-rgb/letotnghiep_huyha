<template>
  <section class="wish-panel wall-page" id="wall-panel" aria-labelledby="wall-title">
    <header class="wall-page__header">
      <h3 class="section-title wall-page__title" id="wall-title">Wall lời chúc</h3>
      <p class="hintline wall-page__lede" id="wall-hint">
        Các lời chúc sẽ hiện ở đây sau khi kết nối Firebase.
      </p>
    </header>

    <div class="wall-toolbar" role="toolbar" aria-label="Wall">
      <input
        id="wall-search"
        class="wall-toolbar__search"
        type="search"
        name="wall-search"
        placeholder="Tìm theo tên hoặc nội dung…"
        autocomplete="off"
      />
      <button type="button" class="btn-secondary wall-toolbar__copy" id="btn-copy-wall-link">
        Copy link xem (HuyHa)
      </button>
    </div>
    <p class="hintline wall-link-hint" id="wall-link-hint">Link này chỉ để xem Wall.</p>

    <details class="access-help wall-page__help">
      <summary>Hướng dẫn vận hành (HuyHa) / GitHub Pages</summary>
      <div class="access-help__body">
        <p><strong>Link Wall:</strong> dùng chính link GitHub Pages hiện tại. Kéo xuống “Wall lời chúc”.</p>
        <p>
          <strong>Chụp &amp; gửi:</strong> người dùng chụp ảnh → preview → tick “Dùng ảnh vừa chụp” → nhập lời chúc
          + ảnh → Gửi.
        </p>
        <p><strong>Xem ảnh lớn:</strong> bấm thumbnail — ảnh mở tab mới.</p>
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
