import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY as string;

// timeout時間を延長
export const config = {
  maxDuration: 60 * 5,
};

export async function POST(req: Request | NextRequest) {
  try {
    const openai = new OpenAI({
      apiKey, // OpenAI APIキーをセット
    });

    const { prompt } = await req.json();

    const requestBody = {
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024" as
        | "1024x1024"
        | "256x256"
        | "512x512"
        | "1792x1024"
        | "1024x1792"
        | null
        | undefined,
    };

    const response = await openai.images.generate(requestBody);

    const imageUrl = response.data[0].url;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error posting tweet:", error);
    return NextResponse.json({
      transcription: "Error occurred",
      error,
    });
  }
}
