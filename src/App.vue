<template>
  <section id="screen-splash" class="screen is-active" aria-live="polite">
    <p class="splash-text">Chúc mừng lễ tốt nghiệp của Huy Hà.</p>
  </section>

  <section id="screen-form" class="screen" aria-labelledby="form-title">
    <div class="panel panel--gate">
      <div class="panel__inner">
        <h2 id="form-title" class="panel__title">Thiệp mời Huy Hà gửi tới bạn</h2>
        <form id="verify-form" class="verify-form verify-form--gate" novalidate>
          <input
            id="guest-name"
            type="text"
            name="guestName"
            autocomplete="name"
            required
            placeholder="Giúp mình nhập tên bạn nha"
          />

          <p id="guest-live" class="guest-live is-empty" aria-live="polite">
            Nhập tên để tạo thiệp nha,<br />
            Mình luôn mong sự có mặt của bạn.
          </p>

          <div class="btn-row">
            <button type="submit" class="btn-primary btn-primary--gate">Xác thực</button>
          </div>
        </form>
      </div>

      <div
        id="guest-confirm-modal"
        class="guest-confirm-modal"
        hidden
        aria-modal="true"
        role="dialog"
        aria-labelledby="guest-confirm-title"
      >
        <div id="guest-confirm-backdrop" class="guest-confirm-backdrop" tabindex="-1"></div>
        <div class="guest-confirm-dialog">
          <h3 id="guest-confirm-title" class="guest-confirm-title"></h3>
          <p id="guest-confirm-sub" class="guest-confirm-sub"></p>
          <p id="guest-confirm-footer-hint" class="guest-confirm-footer-hint"></p>
          <div class="guest-confirm-footer">
            <div id="guest-confirm-actions" class="guest-confirm-actions"></div>
            <button type="button" id="guest-confirm-decline" class="btn-secondary guest-confirm-decline"></button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="screen-loading" class="screen" aria-live="assertive" aria-busy="true">
    <p class="loading-text">Đang tạo thiệp nha...</p>
    <div class="spinner" role="presentation"></div>
  </section>

  <section id="screen-reveal" class="screen" aria-live="polite">
    <p id="reveal-1" class="reveal-line">Hôm nay là ngày đặc biệt...</p>
    <p id="reveal-2" class="reveal-line">Mình muốn mời bạn đến tham dự lễ tốt nghiệp của mình.</p>
    <p id="reveal-3" class="reveal-line">Nhưng người mình muốn mời nhất là...</p>
    <p id="reveal-name" class="reveal-name" aria-label="Tên người được mời"></p>
    <button id="btn-to-invite" type="button" class="btn-primary btn-continue" hidden>Xem thiệp mời</button>
  </section>

  <section id="screen-invite" class="screen" aria-labelledby="invite-heading">
    <h2 id="invite-heading" class="sr-only">Thiệp mời &amp; chụp ảnh</h2>
    <InviteMainCard />
    <CameraBlock />
    <ClassicPhotoCard />
    <WishPanelBlock />
    <canvas id="snap-canvas"></canvas>
    <canvas id="card-canvas"></canvas>
    <WallPanelBlock />
    <PhotoModalBlock />
  </section>
</template>

<script setup>
import InviteMainCard from "./components/InviteMainCard.vue";
import CameraBlock from "./components/CameraBlock.vue";
import ClassicPhotoCard from "./components/ClassicPhotoCard.vue";
import WishPanelBlock from "./components/WishPanelBlock.vue";
import WallPanelBlock from "./components/WallPanelBlock.vue";
import PhotoModalBlock from "./components/PhotoModalBlock.vue";
</script>
