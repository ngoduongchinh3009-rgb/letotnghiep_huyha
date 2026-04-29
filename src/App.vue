<template>
  <section id="screen-splash" class="screen is-active" aria-live="polite">
    <p class="splash-text">Chúc mừng lễ tốt nghiệp của Huy Hà.</p>
  </section>

  <section id="screen-form" class="screen" aria-labelledby="form-title">
    <div class="panel">
      <h2 id="form-title">Thiệp mời Huy Hà gửi tới bạn</h2>
      <form id="verify-form" novalidate>
        <input
          id="guest-name"
          type="text"
          name="guestName"
          autocomplete="name"
          required
          placeholder="Giúp mình nhập tên bạn nha"
        />

        <label for="guest-phone-gate" class="verify-phone-label">
          Số điện thoại
          <span class="verify-phone-note">(bắt buộc nếu mình có khóa 4 số cuối cho bạn trong danh sách mời)</span>
        </label>
        <input
          id="guest-phone-gate"
          type="tel"
          name="guestPhone"
          inputmode="tel"
          autocomplete="tel"
          maxlength="20"
        />

        <p id="guest-live" class="guest-live is-empty" aria-live="polite"></p>

        <div class="btn-row">
          <button type="submit" class="btn-primary">Xác thực</button>
        </div>
      </form>
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
