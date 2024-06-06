import { NextRequest, NextResponse } from "next/server";
import { rwClient } from "./client";

export const maxDuration = 60 * 5; // This function can run for a maximum of 5 seconds

export async function POST(req: Request | NextRequest) {
  try {
    const { imgPath, tweetText } = await req.json();
    if (!imgPath) {
      const { data: createdTweet } = await rwClient.v2.tweet(tweetText);
      return NextResponse.json({ createdTweet });
    }

    // 画像をバッファとして読み込む
    const imageResponse = await fetch(imgPath);

    const imageBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // 画像をアップロードしてメディアIDを取得
    const mediaUploadResponse = await rwClient.v1.uploadMedia(buffer, {
      mimeType: "image/jpeg",
    });

    // ツイートを投稿
    const { data: createdTweet } = await rwClient.v2.tweet(tweetText, {
      media: {
        media_ids: [mediaUploadResponse],
      },
    });
    return NextResponse.json({ createdTweet });
  } catch (error) {
    console.error("Error posting tweet:", error);
    return NextResponse.json({
      transcription: "Error occurred",
      error,
    });
  }
}
