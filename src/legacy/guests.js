(function () {
  "use strict";

  var APP = window.APP;

  /**
   * fullNames: chỉ khớp CHÍNH XÁC (đã norm) mới auto — không bao giờ auto từ tên ngắn.
   * match: biệt danh / từ tắt → chỉ gây ambiguous (cần popup; gõ đủ họ tên để khớp exact).
   * display: tên trên thiệp | legalLine: dòng [Vai — Họ tên] trong popup.
   * requiresSubmitConfirm: sau khi gửi form, luôn mở popup xác nhận (5 VIP — tránh nhận nhầm).
   */
  APP.GUEST_DB = [
    {
      requiresSubmitConfirm: true,
      match: [
        "bapdunchin",
        "bap dun chin",
        "bapdun chin",
        "ngoduongchinh",
        "ngo duong chinh",
        "ngo duong chin",
        "chinh",
      ],
      display: "BapDunChin",
      legalLine: "Người yêu xinh đẹp",
      fullNames: ["Ngô Dương Chinh", "Ngo Duong Chinh"],
      role: "Em người yêu xinh đẹp, hiểu chuyện — người đồng hành đáng tin cậy.",
      relation: "Người yêu",
    },
    {
      requiresSubmitConfirm: true,
      match: ["bo", "bố", "cha", "ba", "dung"],
      display: "Bố",
      legalLine: "Bố",
      fullNames: ["Nguyễn Huy Dũng", "Nguyen Huy Dung"],
      role: "Bố — nhà tài trợ chính & chỗ dựa vững chắc.",
      relation: "Bố",
    },
    {
      requiresSubmitConfirm: true,
      match: ["me", "mẹ", "ma", "tinh"],
      display: "Mẹ",
      legalLine: "Mẹ",
      fullNames: ["Nghiêm Thị Tỉnh", "Nghiem Thi Tinh"],
      role: "Mẹ — nhà tài trợ chính & người mẹ hiền từ.",
      relation: "Mẹ",
    },
    {
      requiresSubmitConfirm: true,
      match: ["nam", "hoang", "nguyen huy hoang", "hoang", "nguyenhuyhoang", "nghuyhoang"],
      display: "Anh trai",
      legalLine: "Anh trai",
      fullNames: ["Nguyễn Huy Hoàng", "Nguyen Huy Hoang"],
      role: "Anh trai — ba chấm... anh trai.",
      relation: "Anh trai",
    },
    {
      requiresSubmitConfirm: true,
      match: ["duong", "dương", "thuy duong", "nguyen thuy duong", "thuyduong"],
      display: "Thùy Dương",
      legalLine: "Nguyễn Thùy Dương",
      fullNames: ["Nguyễn Thùy Dương", "Nguyen Thuy Duong"],
      role: 'Người yêu của anh trai — thành viên "gia đình mở rộng".',
      relation: "Người yêu (anh trai)",
    },
    {
      match: ["nguyen huy ha", "nguyễn huy hà", "huy ha", "huy hà", "huyha","nguyenhuyha", "hya"],
      display: "Nguyễn Huy Hà",
      legalLine: "Nhân vật chính — Nguyễn Huy Hà",
      fullNames: ["Nguyễn Huy Hà", "Nguyen Huy Ha"],
      role: "Siuuuuu cấp deptroai — nhân vật chính của buổi lễ.",
      relation: "Người tốt nghiệp",
    },
  ];

  function buildGuestScratch(g) {
    g._exactNorms = [];
    (g.fullNames || []).forEach(function (fn) {
      var n = APP.normName(fn);
      if (!n) return;
      if (g._exactNorms.indexOf(n) === -1) g._exactNorms.push(n);
      var c = n.replace(/\s+/g, "");
      if (c && g._exactNorms.indexOf(c) === -1) g._exactNorms.push(c);
    });
    g._aliasNorms = [];
    (g.match || []).forEach(function (m) {
      var a = APP.normName(m);
      if (a && g._aliasNorms.indexOf(a) === -1) g._aliasNorms.push(a);
    });
  }

  APP.foldAccents = function foldAccents(s) {
    if (!s) return "";
    try {
      return s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    } catch (e) {
      return String(s).toLowerCase();
    }
  };

  APP.normName = function normName(s) {
    return APP.foldAccents(String(s).trim()).replace(/\s+/g, " ");
  };

  APP.GUEST_DB.forEach(buildGuestScratch);

  var FORCE_CONFIRM_FULL_NAMES = [
    "nguyen huy dung",
    "nghiem thi tinh",
    "nguyen huy hoang",
    "nguyen thuy duong",
    "ngo duong chinh",
  ];

  /** 5 VIP: sau submit luôn hỏi lại qua popup (không vào thiệp thẳng). */
  APP.guestRequiresSubmitConfirm = function guestRequiresSubmitConfirm(g) {
    if (!g) return false;
    if (g.requiresSubmitConfirm) return true;
    var i;
    for (i = 0; i < (g.fullNames || []).length; i++) {
      var n = APP.normName(g.fullNames[i]);
      if (FORCE_CONFIRM_FULL_NAMES.indexOf(n) !== -1) return true;
    }
    return false;
  };

  APP.buildGuestConfirmSub = function buildGuestConfirmSub(raw, matches) {
    var q = APP.normName(raw || "");
    var qQ = q.replace(/\s+/g, "");
    var textForGuest = function (g) {
      if (!g) return "";
      if (g.relation === "Người yêu") return "Gái nhà tôi cũng tên Chinh, phải khongggg???";
      if (g.relation === "Anh trai") return "Anh trai hay khách mời đó?";
      if (g.relation === "Bố") return "Bố hay khách mời khác trùng tên vậy ta?";
      if (g.relation === "Mẹ") return "Mẹ hay khách mời khác trùng tên vậy ta?";
      if (g.relation === "Người yêu (anh trai)") {
        return 'Dương này là <span class="guest-confirm-soft-italic">"Gia đình mở rộng"</span> hay khách mời khác vậy?';
      }
      return "";
    };
    var has = function (arr) {
      var i;
      for (i = 0; i < arr.length; i++) {
        var t = APP.normName(arr[i]);
        var tQ = t.replace(/\s+/g, "");
        if (q === t || qQ === tQ || q.indexOf(t) !== -1 || qQ.indexOf(tQ) !== -1) return true;
      }
      return false;
    };

    if (matches && matches.length === 1) {
      var byGuest = textForGuest(matches[0]);
      if (byGuest) return byGuest;
    }

    if (has(["chinh", "ngo duong chinh", "duong chinh"])) {
      return "Gái nhà tôi cũng tên Chinh, phải khongggg???";
    }
    if (has(["nam", "hoang", "nguyen huy hoang"])) {
      return "Anh trai hay khách mời đó?";
    }
    if (has(["bo", "bố", "cha", "ba", "dung", "nguyen huy dung"])) {
      return "Bố hay khách mời khác trùng tên vậy ta?";
    }
    if (has(["me", "mẹ", "ma", "tinh", "nghiem thi tinh"])) {
      return "Mẹ hay khách mời khác trùng tên vậy ta?";
    }
    if (has(["duong", "dương", "thuy duong", "nguyen thuy duong"])) {
      return 'Dương này là <span class="guest-confirm-soft-italic">"Gia đình mở rộng"</span> hay khách mời khác vậy?';
    }

    return APP.CONFIG.guestConfirmSub || "Chọn đúng tên được mời để xem thiệp riêng.";
  };

  function isExactForGuest(q, qQ, g) {
    var i;
    for (i = 0; i < g._exactNorms.length; i++) {
      var e = g._exactNorms[i];
      if (e === q || e.replace(/\s+/g, "") === qQ) return true;
    }
    return false;
  }

  function isAmbiguousForGuest(q, qQ, g, exactHits) {
    if (exactHits.indexOf(g) !== -1) return false;
    if (isExactForGuest(q, qQ, g)) return false;

    var i;
    var F;
    for (i = 0; i < g._exactNorms.length; i++) {
      F = g._exactNorms[i];
      if (q.length >= 2 && F !== q && F.startsWith(q)) return true;
    }
    var A;
    for (i = 0; i < g._aliasNorms.length; i++) {
      A = g._aliasNorms[i];
      if (A === q) return true;
      if (q.length >= 2 && A !== q && (A.startsWith(q) || q.startsWith(A))) return true;
    }
    return false;
  }

  function dedupeGuests(arr) {
    var out = [];
    var i;
    for (i = 0; i < arr.length; i++) {
      if (out.indexOf(arr[i]) === -1) out.push(arr[i]);
    }
    return out;
  }

  /**
   * @returns {{ type: "exact"|"ambiguous"|"none", matches: object[] }}
   */
  APP.lookupGuestResult = function lookupGuestResult(raw) {
    var q = APP.normName(raw);
    var qQ = q.replace(/\s+/g, "");
    if (!q) return { type: "none", matches: [] };

    var exactHits = [];
    var gi;
    for (gi = 0; gi < APP.GUEST_DB.length; gi++) {
      if (isExactForGuest(q, qQ, APP.GUEST_DB[gi])) exactHits.push(APP.GUEST_DB[gi]);
    }
    exactHits = dedupeGuests(exactHits);
    if (exactHits.length > 1) {
      return { type: "ambiguous", matches: exactHits };
    }
    if (exactHits.length === 1) {
      return { type: "exact", matches: exactHits };
    }

    var amb = [];
    for (gi = 0; gi < APP.GUEST_DB.length; gi++) {
      var g = APP.GUEST_DB[gi];
      if (isAmbiguousForGuest(q, qQ, g, exactHits)) amb.push(g);
    }
    amb = dedupeGuests(amb);
    if (amb.length) return { type: "ambiguous", matches: amb };

    return { type: "none", matches: [] };
  };

  APP.resolveGuestLookupResult = function resolveGuestLookupResult(raw) {
    return APP.lookupGuestResult(raw);
  };

  /** Một khách hoặc null (tương thích chỗ chỉ cần hit đơn). */
  APP.resolveGuestHit = function resolveGuestHit(raw) {
    var r = APP.resolveGuestLookupResult(raw);
    if (r.type === "exact" && r.matches.length === 1) return r.matches[0];
    return null;
  };

  /** @deprecated Dùng lookupGuestResult / resolveGuestLookupResult — chỉ trả khách khi exact 1 người. */
  APP.lookupGuest = function lookupGuest(raw) {
    return APP.resolveGuestHit(raw);
  };
})();
export {};
