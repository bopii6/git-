const sourceText = document.getElementById("sourceText");
const rewriteBtn = document.getElementById("rewriteBtn");
const copyBtn = document.getElementById("copyBtn");
const result = document.getElementById("result");
const statusEl = document.getElementById("status");

const setStatus = (message, busy = false) => {
  statusEl.textContent = message;
  rewriteBtn.disabled = busy;
};

rewriteBtn.addEventListener("click", async () => {
  const text = sourceText.value.trim();
  if (!text) {
    setStatus("请输入要改写的文字", false);
    return;
  }

  setStatus("改写中…", true);
  result.textContent = "正在生成，请稍候…";

  try {
    const response = await fetch("/api/rewrite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "请求失败");
    }

    result.textContent = data.output;
    setStatus("完成", false);
  } catch (error) {
    result.textContent = "生成失败，请检查 API Key 或稍后再试。";
    setStatus("生成失败", false);
  }
});

copyBtn.addEventListener("click", async () => {
  const text = result.textContent.trim();
  if (!text || text === "等待你的输入…") {
    setStatus("没有可复制的内容", false);
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus("已复制到剪贴板", false);
  } catch {
    setStatus("复制失败，请手动复制", false);
  }
});
