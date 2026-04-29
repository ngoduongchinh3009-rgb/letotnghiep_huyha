<template>
  <div class="classic-card" :id="rootId" aria-live="polite">
    <div class="classic-card__bg" aria-hidden="true"></div>
    <div class="classic-card__shade" aria-hidden="true"></div>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  rootId: { type: String, required: true },
});
</script>
