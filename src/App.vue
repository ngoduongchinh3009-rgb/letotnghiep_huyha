<template>
  <section id="screen-splash" class="screen is-active" aria-live="polite">
    <div class="splash-stage" role="presentation" aria-hidden="true"></div>
    <div class="splash-copy">
      <p class="splash-text">Chúc mừng lễ tốt nghiệp của Huy Hà.</p>
    </div>
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
    <div class="loading-premium" id="loading-premium">
      <div class="loading-cap" role="presentation" aria-hidden="true">🎓</div>
      <div class="loading-confetti" aria-hidden="true">
        <span class="confetti c1"></span>
        <span class="confetti c2"></span>
        <span class="confetti c3"></span>
        <span class="confetti c4"></span>
        <span class="confetti c5"></span>
        <span class="confetti c6"></span>
        <span class="confetti c7"></span>
        <span class="confetti c8"></span>
      </div>
      <p class="loading-text">Đang chuẩn bị thiệp mời dành riêng cho bạn</p>
      <div class="loading-progress" role="presentation" aria-hidden="true">
        <span class="loading-progress__fill" id="loading-progress-fill"></span>
      </div>
    </div>
  </section>

  <section id="screen-reveal" class="screen" aria-live="polite">
    <div class="reveal-stack">
      <div class="reveal-quote-block">
        <p id="reveal-1" class="reveal-line">Hôm nay là ngày đặc biệt...</p>
        <p id="reveal-2" class="reveal-line">Mình muốn mời bạn đến tham dự lễ tốt nghiệp của mình.</p>
        <p id="reveal-3" class="reveal-line reveal-line--optional"></p>
      </div>
      <article id="reveal-letter" class="reveal-letter" hidden>
        <div class="reveal-letter__envelope">
          <p class="reveal-letter__lead">Thiệp mời dành riêng cho</p>
          <p id="reveal-name" class="reveal-name reveal-letter__name" aria-label="Tên người được mời"></p>
          <button id="btn-to-invite" type="button" class="btn-primary reveal-letter__cta" hidden>
            Xem thiệp mời
          </button>
        </div>
      </article>
    </div>
  </section>

  <section id="screen-invite" class="screen" aria-labelledby="invite-heading">
    <h2 id="invite-heading" class="sr-only">Thiệp mời &amp; chụp ảnh</h2>
    <InviteMainCard />
    <CameraBlock />
    <canvas id="snap-canvas"></canvas>
    <canvas id="card-canvas"></canvas>
    <WallPanelBlock />
    <PhotoModalBlock />
  </section>
</template>

<script setup>
import InviteMainCard from "./components/InviteMainCard.vue";
import CameraBlock from "./components/CameraBlock.vue";
import WallPanelBlock from "./components/WallPanelBlock.vue";
import PhotoModalBlock from "./components/PhotoModalBlock.vue";
</script>
