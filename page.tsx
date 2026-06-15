import { NextResponse } from "next/server";
import { buildPosterPrompt } from "../../../lib/prompt";

export async function POST(request: Request) {
  const { names } = (await request.json().catch(() => ({ names: [] }))) as { names?: string[] };
  const cleanNames = Array.isArray(names)
    ? names.map((name) => String(name || "").trim()).filter(Boolean).slice(0, 4)
    : [];

  const prompt = buildPosterPrompt(cleanNames);

  try {
    if (process.env.GEMINI_API_KEY) {
      return await generateWithGemini(prompt);
    }

    if (process.env.HUGGINGFACE_API_KEY) {
      return await generateWithHuggingFace(prompt);
    }

    return NextResponse.json(
      {
        error: "Missing image API key. Add GEMINI_API_KEY or HUGGINGFACE_API_KEY to .env.local.",
      },
      { status: 500 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown image generation error";
    return NextResponse.json({ error: message, prompt }, { status: 500 });
  }
}

async function generateWithGemini(prompt: string) {
  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    },
  );

  const payload = (await response.json()) as {
    error?: { message?: string };
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: { data?: string; mimeType?: string };
        }>;
      };
    }>;
  };

  if (!response.ok) {
    throw new Error(payload.error?.message || `Gemini request failed with ${response.status}`);
  }

  const imagePart = payload.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data);
  const imageData = imagePart?.inlineData?.data;
  if (!imageData) {
    throw new Error("Gemini did not return an image. Try a Gemini image model or adjust GEMINI_IMAGE_MODEL.");
  }

  const mimeType = imagePart?.inlineData?.mimeType || "image/png";
  return NextResponse.json({ imageUrl: `data:${mimeType};base64,${imageData}`, prompt, provider: "gemini" });
}

async function generateWithHuggingFace(prompt: string) {
  const model = process.env.HUGGINGFACE_IMAGE_MODEL || "stabilityai/stable-diffusion-xl-base-1.0";
  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "image/png",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        negative_prompt:
          "text, letters, words, logo, watermark, signature, realistic, scary, aggressive, dark, neon, blurry, extra limbs",
      },
    }),
  });

  if (!response.ok) {
    const failureText = await response.text();
    throw new Error(failureText || `Hugging Face request failed with ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "image/png";
  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error || "Hugging Face returned JSON instead of an image.");
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return NextResponse.json({ imageUrl: `data:${contentType};base64,${base64}`, prompt, provider: "huggingface" });
}
