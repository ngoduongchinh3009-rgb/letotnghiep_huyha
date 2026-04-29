(function () {
  "use strict";

  var APP = window.APP;

  /**
   * Danh sách khách mời: khớp theo tên gõ (không phân biệt hoa thường, bỏ dấu).
   * display: tên hiển thị chuẩn trên thiệp | role: dòng thân thiết | relation: nhánh câu reveal (logic)
   *
   * Không dùng khớp “chuỗi con” (substring) trong display/alias: kẻo một người tên Chinh
   * lại khớp nhầm vào alias “… chinh” của người khác. Chỉ: khớp đủ alias, hoặc tiền tố
   * của alias; nếu nhiều alias cùng tiền tố thì ưu alias ngắn nhất (ví dụ “duong” → Thùy Dương).
   *
   * quickPickLabel: dòng trong dropdown “Chọn nhanh” để phân biệt hai người trùng tên / dễ nhận.
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
      ],
      display: "BapDunChin",
      role: "Em người yêu xinhdep hiểu chuyện — người đồng hành đáng tin cậy.",
      relation: "Người yêu",
      quickPickLabel: "Gái nhà tui — cũng tên Chinh ý, có đúng là em không đó",
    },
    {
      match: ["chinh ban", "chinhban", "ban chinh", "chinh ban than"],
      display: "Chinh (bạn thân)",
      role: "Bạn thân — cảm ơn đã tới chung vui cùng mình.",
      relation: "Khách mời",
      quickPickLabel: "Cũng tên Chinh nhưng là bạn thân / bạn lớp (không phải gấu nhà tui)",
    },
    {
      match: ["nguyen huy ha", "nguyễn huy hà", "huy ha", "huy hà"],
      display: "Nguyễn Huy Hà",
      role: "Siuuuuu cấp deptroai — nhân vật chính của buổi lễ.",
      relation: "Người tốt nghiệp",
      quickPickLabel: "Huy Hà — nhân vật chính lễ tốt nghiệp",
    },
    {
      match: ["bo", "bố", "cha"],
      display: "Bố",
      role: "Bố — nhà tài trợ chính & chỗ dựa vững chắc.",
      relation: "Bố",
      quickPickLabel: "Bố — nhà tài trợ & chỗ dựa",
    },
    {
      match: ["me", "mẹ", "ma"],
      display: "Mẹ",
      role: "Mẹ — nhà tài trợ chính & người mẹ hiền từ.",
      relation: "Mẹ",
      quickPickLabel: "Mẹ — nhà tài trợ & hiền từ",
    },
    {
      match: ["nam"],
      display: "Anh trai",
      role: "Anh trai — ba chấm... anh trai.",
      relation: "Anh trai",
      quickPickLabel: "Anh trai (Nam)",
    },
    {
      match: ["duong", "dương"],
      display: "Thùy Dương",
      role: 'Người yêu của anh trai — thành viên "gia đình mở rộng".',
      relation: "Người yêu (anh trai)",
      quickPickLabel: "Thùy Dương — người yêu của anh trai",
    },
  ];

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

  /**
   * Khách đang nhập: nếu vừa chọn từ dropdown và ô tên vẫn khớp display của mục đó → giữ đúng người;
   * không thì lookup theo tên.
   */
  APP.resolveGuestHit = function resolveGuestHit(raw) {
    var q = APP.normName(raw);
    if (!q) return null;
    if (APP.state.quickPickGuestIndex != null) {
      var gPin = APP.GUEST_DB[APP.state.quickPickGuestIndex];
      if (gPin && q === APP.normName(gPin.display)) return gPin;
      APP.state.quickPickGuestIndex = null;
    }
    return APP.lookupGuest(raw);
  };

  /** Tìm khách: khớp đủ alias trước; sau đó tiền tố alias (không substring giữa chuỗi). */
  APP.lookupGuest = function lookupGuest(raw) {
    var q = APP.normName(raw);
    if (!q) return null;
    var i;
    var j;
    for (i = 0; i < APP.GUEST_DB.length; i++) {
      var g = APP.GUEST_DB[i];
      for (j = 0; j < g.match.length; j++) {
        var m = APP.normName(g.match[j]).replace(/\s+/g, "");
        var qq = q.replace(/\s+/g, "");
        if (q === APP.normName(g.match[j]) || qq === m) return g;
      }
    }
    if (q.length < 2) return null;
    var qQ = q.replace(/\s+/g, "");
    var best = null;
    var bestLen = Infinity;
    for (i = 0; i < APP.GUEST_DB.length; i++) {
      var g2 = APP.GUEST_DB[i];
      for (j = 0; j < g2.match.length; j++) {
        var alias = APP.normName(g2.match[j]);
        var aQ = alias.replace(/\s+/g, "");
        var hit = alias.startsWith(q) || (qQ.length >= 2 && aQ.startsWith(qQ));
        if (!hit) continue;
        var len = alias.length;
        if (len < bestLen) {
          bestLen = len;
          best = g2;
        }
      }
    }
    return best;
  };
})();
export {};
