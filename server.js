import express from "express";

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.DASHSCOPE_API_KEY;

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

app.post("/api/rewrite", async (req, res) => {
  if (!apiKey) {
    return res.status(500).json({ error: "Missing DASHSCOPE_API_KEY" });
  }

  const input = (req.body?.text || "").trim();
  if (!input) {
    return res.status(400).json({ error: "Input text is required" });
  }

  const systemPrompt =
    "你是小红书爆款写手。把给定内容改写成真实自然的小红书风格，语气真诚，不夸张，不要大量表情包，只在必要时用1-2个表情，口语化，结构清晰，可读性强。";

  const payload = {
    model: "qwen-plus",
    input: {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input }
      ]
    },
    parameters: {
      temperature: 0.8,
      top_p: 0.8,
      result_format: "message"
    }
  };

  try {
    const response = await fetch(
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res
        .status(500)
        .json({ error: "Upstream error", detail: text });
    }

    const data = await response.json();
    const output =
      data?.output?.choices?.[0]?.message?.content ||
      data?.output?.text ||
      "";

    if (!output) {
      return res.status(500).json({ error: "Empty response from model" });
    }

    return res.json({ output });
  } catch (err) {
    return res.status(500).json({ error: "Request failed" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
