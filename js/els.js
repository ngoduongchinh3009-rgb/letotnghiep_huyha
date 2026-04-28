(function () {
  "use strict";

  var APP = window.APP;

  APP.els = {
    splash: document.getElementById("screen-splash"),
    formScreen: document.getElementById("screen-form"),
    loadingScreen: document.getElementById("screen-loading"),
    revealScreen: document.getElementById("screen-reveal"),
    inviteScreen: document.getElementById("screen-invite"),

    form: document.getElementById("verify-form"),
    inputName: document.getElementById("guest-name"),
    selectRelation: document.getElementById("relation"),
    btnDemo: document.getElementById("btn-demo"),
    guestLive: document.getElementById("guest-live"),

    reveal1: document.getElementById("reveal-1"),
    reveal2: document.getElementById("reveal-2"),
    reveal3: document.getElementById("reveal-3"),
    revealName: document.getElementById("reveal-name"),
    btnToInvite: document.getElementById("btn-to-invite"),

    cardSub: document.getElementById("card-sub"),
    cardFrame: document.getElementById("card-frame"),
    cardPhoto: document.getElementById("card-photo"),
    cardPlaceholder: document.getElementById("card-placeholder"),
    cardThanks: document.getElementById("card-thanks"),

    camWrap: document.getElementById("camera-wrap"),
    video: document.getElementById("cam-video"),
    camOverlay: document.getElementById("cam-overlay"),
    btnStartCam: document.getElementById("btn-start-cam"),
    btnCapture: document.getElementById("btn-capture"),
    camError: document.getElementById("cam-error"),
    snapCanvas: document.getElementById("snap-canvas"),
    cardCanvas: document.getElementById("card-canvas"),
    camStickers: document.getElementById("cam-stickers"),
    filterSelect: document.getElementById("filter-select"),
    stickerSelect: document.getElementById("sticker-select"),

    photoPreview: document.getElementById("photo-preview"),
    previewImg: document.getElementById("preview-img"),
    btnRetake: document.getElementById("btn-retake"),
    btnDownloadAgain: document.getElementById("btn-download-again"),
    btnSharePhoto: document.getElementById("btn-share-photo"),

    wishPanel: document.getElementById("wish-panel"),
    wishForm: document.getElementById("wish-form"),
    wishFrom: document.getElementById("wish-from"),
    wishMessage: document.getElementById("wish-message"),
    wishUseLast: document.getElementById("wish-use-last"),
    wishPhoto: document.getElementById("wish-photo"),
    wishSubmit: document.getElementById("wish-submit"),
    wishStatus: document.getElementById("wish-status"),
    btnOpenWall: document.getElementById("btn-open-wall"),

    wallPanel: document.getElementById("wall-panel"),
    wallEl: document.getElementById("wall"),
    wallSearch: document.getElementById("wall-search"),
    wallHint: document.getElementById("wall-hint"),

    photoModal: document.getElementById("photo-modal"),
    modalImg: document.getElementById("modal-img"),
    modalClose: document.getElementById("modal-close"),
    modalTitle: document.getElementById("modal-title"),
    btnCopyWallLink: document.getElementById("btn-copy-wall-link"),
    wallLinkHint: document.getElementById("wall-link-hint"),
  };

  APP.state = {
    guestFullName: "",
    guestRoleLine: "",

    classicBgImg: null,
    classicBgReady: false,

    stream: null,
    lastPhotoBlob: null,
    lastPhotoUrl: "",

    firebaseApp: null,
    db: null,
    wallUnsub: null,
    lastWishAt: 0,
    lastWishPhotoBlob: null,
    lastWishPreviewUrl: "",

    // MediaPipe face landmarks
    faceLandmarks: null,
    faceLandmarksAt: 0,
    faceMesh: null,
    faceMeshRunning: false,

    // Smoothing for face-stickers (live + capture)
    faceStickerSmooth: {
      cx: null,
      cy: null,
      a: null,
      cheekX: null,
      cheekY: null,
    },
  };

  // Preload texture (dùng cho canvas thiệp)
  APP.state.classicBgImg = new Image();
  APP.state.classicBgImg.onload = function () {
    APP.state.classicBgReady = true;
  };
  APP.state.classicBgImg.src = "assets/texture.png";
})();
