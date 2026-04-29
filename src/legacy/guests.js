(function () {
  "use strict";

  var APP = window.APP;

  /**
   * fullNames: chỉ khớp CHÍNH XÁC (đã norm) mới auto — không bao giờ auto từ tên ngắn.
   * match: biệt danh / từ tắt → chỉ gây ambiguous (cần popup hoặc chọn nhanh điền đủ họ tên).
   * display: tên trên thiệp | legalLine: dòng [Vai — Họ tên] trong popup.
   */
  APP.GUEST_DB = [
    {
      match: [
        "bapdunchin",
        "bap dun chin",
        "bapdun chin",
        "ngoduongchinh",
        "ngo duong chinh",
        "ngo duong chin",
        "duongchinh",
        "duong chinh",
        "chinh",
      ],
      display: "BapDunChin",
      legalLine: "Người yêu — Ngô Dương Chinh",
      fullNames: ["Ngô Dương Chinh", "Ngo Duong Chinh"],
      role: "Em người yêu xinhdep hiểu chuyện — người đồng hành đáng tin cậy.",
      relation: "Người yêu",
      quickPickLabel: "Người yêu — Ngô Dương Chinh (gấu nhà tui)",
    },
    {
      match: ["bo", "bố", "cha", "ba", "dung"],
      display: "Bố",
      legalLine: "Bố — Nguyễn Huy Dũng",
      fullNames: ["Nguyễn Huy Dũng", "Nguyen Huy Dung"],
      role: "Bố — nhà tài trợ chính & chỗ dựa vững chắc.",
      relation: "Bố",
      quickPickLabel: "Bố — Nguyễn Huy Dũng",
    },
    {
      match: ["me", "mẹ", "ma", "tinh"],
      display: "Mẹ",
      legalLine: "Mẹ — Nghiêm Thị Tỉnh",
      fullNames: ["Nghiêm Thị Tỉnh", "Nghiem Thi Tinh"],
      role: "Mẹ — nhà tài trợ chính & người mẹ hiền từ.",
      relation: "Mẹ",
      quickPickLabel: "Mẹ — Nghiêm Thị Tỉnh",
    },
    {
      match: ["nam", "hoang"],
      display: "Anh trai",
      legalLine: "Anh trai — Nguyễn Huy Hoàng (Nam)",
      fullNames: ["Nguyễn Huy Hoàng", "Nguyen Huy Hoang"],
      role: "Anh trai — ba chấm... anh trai.",
      relation: "Anh trai",
      quickPickLabel: "Anh trai — Nguyễn Huy Hoàng (Nam)",
    },
    {
      match: ["duong", "dương", "thuy duong"],
      display: "Thùy Dương",
      legalLine: "Thùy Dương — Nguyễn Thùy Dương",
      fullNames: ["Nguyễn Thùy Dương", "Nguyen Thuy Duong"],
      role: 'Người yêu của anh trai — thành viên "gia đình mở rộng".',
      relation: "Người yêu (anh trai)",
      quickPickLabel: "Thùy Dương — Nguyễn Thùy Dương",
    },
    {
      match: ["nguyen huy ha", "nguyễn huy hà", "huy ha", "huy hà", "huyha"],
      display: "Nguyễn Huy Hà",
      legalLine: "Nhân vật chính — Nguyễn Huy Hà",
      fullNames: ["Nguyễn Huy Hà", "Nguyen Huy Ha"],
      role: "Siuuuuu cấp deptroai — nhân vật chính của buổi lễ.",
      relation: "Người tốt nghiệp",
      quickPickLabel: "Huy Hà — nhân vật chính lễ tốt nghiệp",
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
      if (q.length >= 2 && F !== q && F.indexOf(q) !== -1) return true;
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
    var q = APP.normName(raw);
    if (!q) return { type: "none", matches: [] };

    if (APP.state.quickPickGuestIndex != null) {
      var gPin = APP.GUEST_DB[APP.state.quickPickGuestIndex];
      if (gPin) {
        var qQ = q.replace(/\s+/g, "");
        var pinOk =
          isExactForGuest(q, qQ, gPin) ||
          q === APP.normName(gPin.display) ||
          qQ === APP.normName(gPin.display).replace(/\s+/g, "");
        if (pinOk) return { type: "exact", matches: [gPin] };
      }
      APP.state.quickPickGuestIndex = null;
    }

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
