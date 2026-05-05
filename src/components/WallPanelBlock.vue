<template>
  <section class="wish-panel wall-page" id="wall-panel" aria-labelledby="wall-title">
    <header class="wall-page__header">
      <h3 class="section-title wall-page__title" id="wall-title">Wall lời chúc</h3>
      <p class="hintline wall-page__lede" id="wall-hint">Nhập mật khẩu để xem wall.</p>
    </header>

    <div class="wall-lock" id="wall-lock" hidden>
      <form id="wall-pass-form" class="wall-lock__card" novalidate>
        <p class="wall-lock__title">Nhập mật khẩu để xem lời chúc</p>
        <input
          id="wall-pass-input"
          class="wall-lock__input"
          type="password"
          placeholder="Mật khẩu"
          autocomplete="current-password"
        />
        <button type="submit" id="wall-pass-submit" class="btn-primary wall-lock__btn">Mở wall</button>
        <p id="wall-pass-error" class="status bad wall-lock__error" hidden></p>
      </form>
    </div>

    <div class="wall-page__content" id="wall-content">
      <div class="wall-toolbar" role="toolbar" aria-label="Wall">
        <input
          id="wall-search"
          class="wall-toolbar__search"
          type="search"
          name="wall-search"
          placeholder="Tìm theo tên hoặc nội dung..."
          autocomplete="off"
        />
      </div>

      <div class="wall" id="wall"></div>
    </div>
  </section>
</template>

<script setup></script>
