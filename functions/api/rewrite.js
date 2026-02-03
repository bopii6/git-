export async function onRequestPost(context) {
  const apiKey = context.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing DASHSCOPE_API_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  let body = null;
  try {
    body = await context.request.json();
  } catch {
    body = null;
  }

  const input = (body?.text || "").trim();
  if (!input) {
    return new Response(JSON.stringify({ error: "Input text is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
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
      return new Response(
        JSON.stringify({ error: "Upstream error", detail: text }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const data = await response.json();
    const output =
      data?.output?.choices?.[0]?.message?.content || data?.output?.text || "";

    if (!output) {
      return new Response(
        JSON.stringify({ error: "Empty response from model" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(JSON.stringify({ output }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return new Response(JSON.stringify({ error: "Request failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
