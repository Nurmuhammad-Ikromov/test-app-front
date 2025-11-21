import domtoimage from "dom-to-image";

// 🔹 To‘liq screenshot olish
export const handleScreenshot = (keepLast = 3) => {
  const wrapper = document.getElementById("grades-table");
  if (!wrapper) return;

  // 1) original headerdan ustunlar sonini va keep indekslarini aniqlaymiz
  const originalThs = Array.from(wrapper.querySelectorAll("thead th"));
  const totalCols = originalThs.length;

  // 🔹 Har doim T/R (0) va O‘quvchi (1) ustunlarini saqlaymiz
  const keepIndices = [0, 1];

  // 🔹 Parametr orqali kiritilgan oxirgi N ta ustunni saqlaymiz
  if (totalCols > 2 && keepLast > 0) {
    const start = Math.max(2, totalCols - keepLast - 1);
    for (let i = start; i < totalCols - 1; i++) {
      keepIndices.push(i);
    }
  }

  // 2) clone qilib, offscreen joyga qo‘yish
  const clone = wrapper.cloneNode(true);
  clone.style.overflow = "visible";
  clone.style.maxHeight = "none";
  clone.style.height = "auto";
  clone.style.position = "absolute";
  clone.style.zIndex = "-199";
  clone.style.left = "0";
  clone.style.top = "0";

  // sticky sinflarni olib tashlaymiz
  clone
    .querySelectorAll(".sticky")
    .forEach((el) => el.classList.remove("sticky"));

  // 3) clone ichidan kerakmas ustunlarni o‘chiramiz
  const cloneThs = Array.from(clone.querySelectorAll("thead th"));
  cloneThs.forEach((th, idx) => {
    if (!keepIndices.includes(idx)) th.remove();
  });

  // har bir satrdan kerakmas ustunlarni olib tashlaymiz
  const cloneRows = Array.from(clone.querySelectorAll("tbody tr"));
  cloneRows.forEach((tr) => {
    const tds = Array.from(tr.children);
    tds.forEach((td, idx) => {
      if (!keepIndices.includes(idx)) td.remove();
    });
  });

  // --- Eng uzun ismni topamiz
  const names = Array.from(
    wrapper.querySelectorAll("tbody tr td:nth-child(2)")
  ).map((td) => td.textContent.trim());
  let longestName = "";
  names.forEach((name) => {
    if (name.length > longestName.length) longestName = name;
  });

  // Canvas orqali o‘lchaymiz
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = "16px Arial";
  const textWidth = context.measureText(longestName).width;
  const nameColWidth = Math.ceil(textWidth + 24);

  // Clone ichidagi O‘quvchi ustuniga width qo‘yish
  Array.from(
    clone.querySelectorAll("thead th:nth-child(2), tbody td:nth-child(2)")
  ).forEach((cell) => {
    cell.style.minWidth = nameColWidth + "px";
    cell.style.maxWidth = nameColWidth + "px";
    cell.style.width = nameColWidth + "px";
    cell.style.whiteSpace = "nowrap";
  });

  // 4) select va inputlarni span ga almashtiramiz
  const cloneInputs = Array.from(clone.querySelectorAll("select, input"));
  cloneInputs.forEach((el) => {
    const td = el.closest("td");
    const tr = el.closest("tr");
    const rowIndex = Array.from(tr.parentNode.children).indexOf(tr);
    const cloneColIndex = Array.from(td.parentNode.children).indexOf(td);
    const originalRow = wrapper.querySelectorAll("tbody tr")[rowIndex];
    let val = "";

    if (originalRow) {
      const originalTd = originalRow.children[keepIndices[cloneColIndex]];
      if (originalTd) {
        const originalSelect = originalTd.querySelector("select");
        const originalInput = originalTd.querySelector("input");
        if (originalSelect) {
          const opt = originalSelect.options[originalSelect.selectedIndex];
          val = opt?.value || opt?.textContent || "";
        } else if (originalInput) {
          val = originalInput.value || "";
        }
      }
    }

    const span = document.createElement("span");
    span.textContent = val || "-";
    span.style.display = "inline-block";
    span.style.padding = "6px 8px";
    span.style.minWidth = "28px";
    span.style.textAlign = "center";
    span.style.borderRadius = "6px";
    span.style.fontWeight = "600";
    span.style.fontSize = "16px";
    span.style.boxSizing = "border-box";
    span.style.width = "100px";

    switch (val) {
      case "5":
        span.style.background = "#22c55e";
        break;
      case "4":
        span.style.background = "#fb923c";
        break;
      case "3":
        span.style.background = "#facc15";
        break;
      case "2":
        span.style.background = "#fca5a5";
        break;
      case "1":
        span.style.background = "#f87171";
        break;
      case "0":
        span.style.background = "#ef4444";
        span.style.color = "#fff";
        break;
      default:
        span.style.background = "#ffffff";
        break;
    }

    el.parentNode.replaceChild(span, el);
  });

  // 5) Screenshot olish
  document.body.appendChild(clone);

  setTimeout(() => {
    domtoimage
      .toPng(clone, { bgcolor: "#ffffff" })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "grades.png";
        link.click();
      })
      .catch((err) => {
        console.error("dom-to-image xatosi:", err);
      })
      .finally(() => {
        if (clone.parentNode) clone.parentNode.removeChild(clone);
      });
  }, 150);
};
