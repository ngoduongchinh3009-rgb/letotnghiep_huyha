import textureUrl from "../../assets/texture.png?url";
import graduationBackdropUrl from "../../assets/graduation-camera-backdrop.png?url";

/* DOM refs — gọi bindAppDom() sau khi Vue đã mount (cùng id/class như trước). */
(function () {
  "use strict";
  window.APP = window.APP || {};
  var APP = window.APP;

  if (!APP.state) {
    APP.state = {
      guestFullName: "",
      guestRoleLine: "",
      classicBgImg: null,
      classicBgReady: false,
      graduationBackdropImg: null,
      graduationBackdropReady: false,
      stream: null,
      lastPhotoBlob: null,
      lastPhotoUrl: "",
      firebaseApp: null,
      db: null,
      wallUnsub: null,
      lastWishAt: 0,
      lastWishPhotoBlob: null,
      lastWishPreviewUrl: "",
      faceLandmarks: null,
      faceLandmarksAt: 0,
      faceMesh: null,
      faceMeshRunning: false,
      faceStickerSmooth: {
        cx: null,
        cy: null,
        a: null,
        cheekX: null,
        cheekY: null,
      },
    };
    APP.state.classicBgImg = new Image();
    APP.state.classicBgImg.onload = function () {
      APP.state.classicBgReady = true;
    };
    APP.state.classicBgImg.src = textureUrl;
    APP.state.graduationBackdropImg = new Image();
    APP.state.graduationBackdropImg.onload = function () {
      APP.state.graduationBackdropReady = true;
    };
    APP.state.graduationBackdropImg.onerror = function () {
      APP.state.graduationBackdropReady = false;
    };
    APP.state.graduationBackdropImg.src = graduationBackdropUrl;
  }

  function $(root, id) {
    return root.getElementById(id);
  }

  APP.bindAppDom = function bindAppDom(root) {
    root = root || document;
    APP.els = {
      splash: $(root, "screen-splash"),
      formScreen: $(root, "screen-form"),
      loadingScreen: $(root, "screen-loading"),
      loadingText: $(root, "screen-loading") ? $(root, "screen-loading").querySelector(".loading-text") : null,
      loadingSubtext: $(root, "loading-subtext"),
      loadingPremium: $(root, "loading-premium"),
      loadingProgressFill: $(root, "loading-progress-fill"),
      revealScreen: $(root, "screen-reveal"),
      inviteScreen: $(root, "screen-invite"),

      form: $(root, "verify-form"),
      inputName: $(root, "guest-name"),
      guestLive: $(root, "guest-live"),

      guestConfirmModal: $(root, "guest-confirm-modal"),
      guestConfirmBackdrop: $(root, "guest-confirm-backdrop"),
      guestConfirmTitle: $(root, "guest-confirm-title"),
      guestConfirmSub: $(root, "guest-confirm-sub"),
      guestConfirmActions: $(root, "guest-confirm-actions"),
      guestConfirmDecline: $(root, "guest-confirm-decline"),
      guestConfirmFooterHint: $(root, "guest-confirm-footer-hint"),

      reveal1: $(root, "reveal-1"),
      reveal2: $(root, "reveal-2"),
      reveal3: $(root, "reveal-3"),
      revealLetter: $(root, "reveal-letter"),
      revealName: $(root, "reveal-name"),
      btnToInvite: $(root, "btn-to-invite"),

      cardSub: $(root, "card-sub"),
      cardFrame: $(root, "card-frame"),
      cardEmpty: $(root, "card-empty"),
      cardInviteGuest: $(root, "card-invite-guest"),
      cardInviteMessage: $(root, "card-invite-message"),
      cardMeal: $(root, "card-meal"),
      cardSponsor: $(root, "card-sponsor"),
      cardPS: $(root, "card-ps"),
      cardPhoto: $(root, "card-photo"),
      cardPlaceholder: $(root, "card-placeholder"),
      cardThanks: $(root, "card-thanks"),

      camWrap: $(root, "camera-wrap"),
      camShootPanel: $(root, "cam-shoot-panel"),
      video: $(root, "cam-video"),
      camOverlay: $(root, "cam-overlay"),
      btnStartCam: $(root, "btn-start-cam"),
      btnCapture: $(root, "btn-capture"),
      camError: $(root, "cam-error"),
      snapCanvas: $(root, "snap-canvas"),
      cardCanvas: $(root, "card-canvas"),

      btnRetake: $(root, "btn-retake"),
      btnPolaroidUpload: $(root, "btn-polaroid-upload"),
      polaroidUploadInput: $(root, "polaroid-upload-input"),
      polaroidPanel: $(root, "polaroid-panel"),
      polaroidImage: $(root, "polaroid-image"),
      polaroidMessage: $(root, "polaroid-message"),
      polaroidSubmit: $(root, "polaroid-submit"),
      polaroidStatus: $(root, "polaroid-status"),

      wishPanel: $(root, "wish-panel"),
      wishForm: $(root, "wish-form"),
      wishFrom: $(root, "wish-from"),
      wishMessage: $(root, "wish-message"),
      wishUseLast: $(root, "wish-use-last"),
      wishPhoto: $(root, "wish-photo"),
      wishSubmit: $(root, "wish-submit"),
      wishStatus: $(root, "wish-status"),

      wallPanel: $(root, "wall-panel"),
      wallEl: $(root, "wall"),
      wallSearch: $(root, "wall-search"),
      wallHint: $(root, "wall-hint"),
      wallContent: $(root, "wall-content"),
      wallLock: $(root, "wall-lock"),
      wallPassForm: $(root, "wall-pass-form"),
      wallPassInput: $(root, "wall-pass-input"),
      wallPassSubmit: $(root, "wall-pass-submit"),
      wallPassError: $(root, "wall-pass-error"),

      photoModal: $(root, "photo-modal"),
      modalImg: $(root, "modal-img"),
      modalClose: $(root, "modal-close"),
      modalTitle: $(root, "modal-title"),
      btnCopyWallLink: $(root, "btn-copy-wall-link"),
      wallLinkHint: $(root, "wall-link-hint"),

    };
  };
})();

export {};
