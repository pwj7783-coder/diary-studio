export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST 요청만 사용할 수 있어요." });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "서버에 GEMINI_API_KEY 환경변수를 설정해 주세요." });
  try {
    const { image, mimeType } = req.body || {};
    if (!image || !["image/jpeg", "image/png", "image/webp"].includes(mimeType)) return res.status(400).json({ error: "JPG, PNG 또는 WEBP 사진을 올려 주세요." });
    if (typeof image !== "string" || image.length > 16_800_000) return res.status(413).json({ error: "사진이 너무 커요. 12MB 이하의 이미지를 사용해 주세요." });
    const prompt = `Transform the uploaded image into a simple hand-drawn diary doodle illustration. Keep the subject recognizable and preserve its defining shape, colors, features, and important details. Apply confident bold black fineliner outlines with slightly wobbly imperfect hand-drawn lines; simplify shapes and retain only meaningful details; use flat pale watercolor washes in 3 to 4 soft muted colors, with imperfect fills that may not exactly meet the outlines; leave generous white paper; add subtle paper grain and watercolor texture. Charming, slightly clumsy, ugly-cute, like a small illustration cut from a personal diary. This same style applies to any subject: person, animal, food, object, plant, building, landscape, or scenery. If a person, simplify the face to dot eyes, a small smile, and a tiny hint of blush while preserving hairstyle, hair color, face shape, accessories, and outfit colors. If food or an object, do not anthropomorphize it. Only the main subject, centered and isolated; no captions, text, watermark, unrelated background elements, cast shadow, or glow. Avoid photorealism, polished vector art, glossy 3D, excess detail, strong gradients, or dramatic shadows. Use a plain white paper-like background if transparency is not available.`;
    const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST", headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gemini-nano-banana-2.1", input: [{ type: "image", mime_type: mimeType, data: image }, { type: "text", text: prompt }], response_format: { type: "image", mime_type: "image/jpeg", image_size: "1K" } })
    });
    const data = await upstream.json();
    if (!upstream.ok) { console.error("Gemini API error", upstream.status, data?.error?.message || ""); return res.status(502).json({ error: "Gemini 이미지 생성 요청이 실패했어요. API 키와 사용량 설정을 확인해 주세요." }); }
    const generated = data.output_image?.data || data.steps?.flatMap(s => s.content || []).find(c => c.type === "image")?.data;
    if (!generated) return res.status(502).json({ error: "Gemini가 이미지 결과를 반환하지 않았어요. 다시 시도해 주세요." });
    return res.status(200).json({ image: generated, mimeType: data.output_image?.mime_type || "image/jpeg" });
  } catch (error) { console.error("Image generation error", error); return res.status(500).json({ error: "처리 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요." }); }
}