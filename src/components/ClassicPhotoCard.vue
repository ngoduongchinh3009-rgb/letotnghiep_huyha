<template>
  <section class="invite-wrap" id="invite-wrap-photo" hidden>
    <ClassicCardFrame root-id="invite-card-photo">
      <div class="classic-card__text-top">
        Thiệp kỷ niệm
        <span class="classic-card__text-sub" id="card-sub-2">
          Nguyễn Huy Hà · 10h · Đại học Bách Khoa Hà Nội
        </span>
      </div>
      <div class="classic-card__frame" id="card-frame-2" aria-label="Khung ảnh kỷ niệm">
        <img class="classic-card__photo" id="card-photo-2" alt="Ảnh kỷ niệm" />
      </div>
      <div class="classic-card__text-bottom">
        Trân trọng kính mời
        <span class="classic-card__thanks">Cảm ơn vì sự có mặt của bạn.</span>
      </div>
    </ClassicCardFrame>
  </section>
</template>

<script setup>
import ClassicCardFrame from "./ClassicCardFrame.vue";
</script>
