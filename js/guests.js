(function () {
  "use strict";

  var APP = window.APP;

  /**
   * Danh sách khách mời: khớp theo tên gõ (không phân biệt hoa thường, bỏ dấu).
   * display: tên hiển thị chuẩn trên thiệp | role: dòng thân thiết | relation: giá trị <select> tương ứng
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
    },
    {
      match: ["nguyen huy ha", "nguyễn huy hà", "huy ha", "huy hà"],
      display: "Nguyễn Huy Hà",
      role: "Siuuuuu cấp deptroai — nhân vật chính của buổi lễ.",
      relation: "Người tốt nghiệp",
    },
    {
      match: ["bo", "bố", "cha"],
      display: "Bố",
      role: "Bố — nhà tài trợ chính & chỗ dựa vững chắc.",
      relation: "Bố",
    },
    {
      match: ["me", "mẹ", "ma"],
      display: "Mẹ",
      role: "Mẹ — nhà tài trợ chính & người mẹ hiền từ.",
      relation: "Mẹ",
    },
    {
      match: ["nam"],
      display: "Anh trai",
      role: "Anh trai — ba chấm... anh trai.",
      relation: "Anh trai",
    },
    {
      match: ["duong", "dương"],
      display: "Thùy Dương",
      role: 'Người yêu của anh trai — thành viên "gia đình mở rộng".',
      relation: "Người yêu (anh trai)",
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

  /** Tìm khách theo chuỗi đang gõ (ưu tiên khớp chính xác với một trong các alias) */
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
    for (i = 0; i < APP.GUEST_DB.length; i++) {
      var g2 = APP.GUEST_DB[i];
      if (q.length >= 3 && APP.foldAccents(g2.display).indexOf(q) !== -1) return g2;
      for (j = 0; j < g2.match.length; j++) {
        if (q.length >= 3 && APP.normName(g2.match[j]).indexOf(q) !== -1) return g2;
      }
    }
    return null;
  };
})();
