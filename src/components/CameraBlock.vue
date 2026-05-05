<template>
  <div id="invite-camera-block" class="camera-block">
    <div id="secure-banner" class="secure-banner" hidden></div>

    <div id="cam-shoot-panel" class="camera-shoot-panel">
      <div class="camera-booth">
        <div class="camera-booth__scrim" aria-hidden="true"></div>
        <div class="camera-booth__panel">
          <div class="camera-booth__head">
            <p class="camera-booth__eyebrow">Lễ tốt nghiệp</p>
            <h2 class="camera-booth__title">Chụp ảnh kỉ niệm</h2>
          </div>

          <div class="camera-wrap" id="camera-wrap">
            <video id="cam-video" playsinline webkit-playsinline autoplay muted></video>
            <canvas id="cam-overlay" class="cam-overlay" aria-hidden="true"></canvas>
          </div>
          <div class="cam-actions">
            <button type="button" class="btn-capture camera-booth__btn" id="btn-start-cam">Mở camera</button>
            <button type="button" class="btn-primary camera-booth__btn" id="btn-capture" disabled hidden>
              Chụp ảnh
            </button>
          </div>
        </div>
      </div>
    </div>

    <p class="cam-error" id="cam-error" hidden></p>

    <section class="polaroid-panel" id="polaroid-panel" hidden aria-labelledby="polaroid-title">
      <h3 class="polaroid-panel__title" id="polaroid-title">Chụp ảnh &amp; Gửi lời chúc</h3>
      <div class="polaroid-wrapper">
        <div class="polaroid-photo">
          <img id="polaroid-image" class="polaroid-card__photo" alt="Ảnh vừa chụp để gửi lời chúc" />
        </div>
        <img
          class="polaroid-frame-image"
          src="/assets/polaroid-stickers-reference.png"
          alt=""
          aria-hidden="true"
        />
        <textarea
          id="polaroid-message"
          class="polaroid-note-input"
          placeholder="Viết lời chúc tại đây..."
          rows="2"
        ></textarea>
      </div>
      <button type="button" class="btn-primary polaroid-panel__submit" id="polaroid-submit">
        Gửi lời chúc
      </button>
      <div class="polaroid-panel__actions">
        <button type="button" class="btn-secondary" id="btn-retake">Chụp lại</button>
        <input id="polaroid-upload-input" type="file" accept="image/*" hidden />
        <button type="button" class="btn-primary" id="btn-polaroid-upload">Tải ảnh lên</button>
      </div>
      <p class="status muted polaroid-panel__status" id="polaroid-status"></p>
    </section>
  </div>
</template>

