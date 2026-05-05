<template>
  <div id="invite-main-card" class="invite-wrap" lang="vi">
    <ClassicCardFrame root-id="invite-card-main">
      <div class="classic-card__empty" id="card-empty" aria-live="polite">
        <div class="classic-card__paper">
          <p class="classic-card__paper-main">
            <span class="classic-card__paper-orn">Trân trọng kính mời</span>
            <span class="classic-card__paper-flavor" id="card-flavor"></span>
            <span
              class="classic-card__paper-flavor classic-card__paper-flavor--aside"
              id="card-flavor-aside"
            ></span>
            <span class="classic-card__paper-guest" id="card-invite-guest"></span>
            <span class="classic-card__paper-role" id="card-role"></span>
            <span class="classic-card__paper-msg" id="card-invite-message"></span>
            <span class="classic-card__paper-sub" id="card-sub"></span>
            <span class="classic-card__paper-meal" id="card-meal"></span>
            <span class="classic-card__paper-sponsor" id="card-sponsor"></span>
            <span class="classic-card__paper-ps" id="card-ps"></span>
            <span class="classic-card__paper-thanks" id="card-thanks"></span>
          </p>
        </div>
      </div>
      <div
        class="classic-card__frame"
        id="card-frame"
        aria-label="Khung ảnh kỷ niệm"
        hidden
      >
        <img class="classic-card__photo" id="card-photo" alt="Ảnh kỷ niệm" hidden />
        <div class="classic-card__placeholder" id="card-placeholder">Chụp ảnh để in vào thiệp</div>
      </div>
    </ClassicCardFrame>
  </div>
</template>

<script setup>
import ClassicCardFrame from "./ClassicCardFrame.vue";
</script>
