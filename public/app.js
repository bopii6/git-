const sourceText = document.getElementById("sourceText");
const rewriteBtn = document.getElementById("rewriteBtn");
const copyBtn = document.getElementById("copyBtn");
const result = document.getElementById("result");
const statusEl = document.getElementById("status");
const charCount = document.getElementById("charCount");

// 更新字数统计
sourceText.addEventListener("input", () => {
  charCount.textContent = sourceText.value.length;
});

// 点击提示标签填充示例
document.querySelectorAll(".tip-tag").forEach((tag) => {
  tag.addEventListener("click", () => {
    const examples = {
      "产品种草": "这款面霜真的很好用，保湿效果很棒，用了一个月皮肤明显变好了，价格也很实惠，强烈推荐给大家。",
      "生活分享": "今天去了一家新开的咖啡店，环境很不错，拍照也很出片，咖啡味道一般但是甜品很好吃，周末可以来坐坐。",
      "干货教程": "分享一个提高效率的方法：早起后先做最难的任务，这样一天都会很有成就感，而且不会拖延。"
    };
    const tipText = tag.dataset.tip;
    if (examples[tipText]) {
      sourceText.value = examples[tipText];
      charCount.textContent = sourceText.value.length;
      sourceText.focus();
    }
  });
});

const setStatus = (message, busy = false) => {
  statusEl.textContent = message;
  rewriteBtn.disabled = busy;
  
  if (busy) {
    rewriteBtn.innerHTML = '<span class="loading-dots"><span></span><span></span><span></span></span> 改写中';
  } else {
    rewriteBtn.innerHTML = '✨ 一键改写';
  }
};

rewriteBtn.addEventListener("click", async () => {
  const text = sourceText.value.trim();
  if (!text) {
    setStatus("请输入要改写的文案哦~", false);
    return;
  }

  setStatus("正在改写中...", true);
  result.textContent = "";
  result.classList.add("empty");
  result.innerHTML = '<span class="loading-dots"><span></span><span></span><span></span></span>';

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

    result.innerHTML = "";
    result.textContent = data.output;
    result.classList.remove("empty");
    setStatus("改写完成 ✅ 快去复制吧~", false);
  } catch (error) {
    result.innerHTML = "";
    result.textContent = "改写失败了，请稍后再试~";
    result.classList.remove("empty");
    setStatus("改写失败，请重试", false);
  }
});

copyBtn.addEventListener("click", async () => {
  const text = result.textContent.trim();
  if (!text || text === "等待你的输入~" || text.includes("改写失败")) {
    setStatus("还没有可复制的内容~", false);
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    
    // 复制成功动画
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "已复制 ✓";
    copyBtn.style.background = "var(--xhs-red)";
    copyBtn.style.color = "#fff";
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = "";
      copyBtn.style.color = "";
    }, 1500);
    
    setStatus("已复制到剪贴板 📋", false);
  } catch {
    setStatus("复制失败，请手动复制", false);
  }
});
