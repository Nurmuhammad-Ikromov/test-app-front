import domtoimage from "dom-to-image";

const handleDailyStatsScreenshot = () => {
  const wrapper = document.getElementById("daily-stats-table");
  if (!wrapper) return;

  // CLONE
  const clone = wrapper.cloneNode(true);

  // Offscreen joyga ko‘chiramiz
  clone.style.position = "absolute";
  clone.style.top = "0";
  clone.style.left = "0";
    clone.style.zIndex = "-199";

  // FULL rendering
  clone.style.maxHeight = "none";
  clone.style.height = "auto";
  clone.style.width = wrapper.scrollWidth + "px";
  clone.style.background = "#ffffff";
  clone.style.overflow = "visible";

  // sticky remove
  clone.querySelectorAll(".sticky").forEach((el) => {
    el.classList.remove("sticky");
    el.style.position = "static";
  });

  // White background everywhere
  clone.querySelectorAll("table, th, td, tr").forEach((el) => {
    el.style.background = "#ffffff";
    el.style.color = "#000";
  });

  document.body.appendChild(clone);

  // SUPER RESOLUTION
  const scale = 3;
  const width = clone.scrollWidth;
  const height = clone.scrollHeight;

  setTimeout(() => {
    domtoimage
      .toPng(clone, {
        bgcolor: "#ffffff",
        quality: 1,
        width: width * scale,
        height: height * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        },
      })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "daily_stats.png";
        link.click();
      })
      .catch((err) => console.log("Screenshot error:", err))
      .finally(() => clone.remove());
  }, 150);
};
