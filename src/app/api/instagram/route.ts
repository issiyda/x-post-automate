import { TwitterApi } from "twitter-api-v2";
import { NextRequest, NextResponse } from "next/server";

// APIキーとアクセストークンを設定
const apiKey = process.env.API_KEY || "";
const apiKeySecret = process.env.API_KEY_SECRET || "";
const accessToken = process.env.ACCESS_TOKEN || "";
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "";

// Twitter APIクライアントを作成
const client = new TwitterApi({
  appKey: apiKey,
  appSecret: apiKeySecret,
  accessToken: accessToken,
  accessSecret: accessTokenSecret,
});
const rwClient = client.readWrite; // 書き込み可能なクライアントを取得

export const maxDuration = 60 * 5; // This function can run for a maximum of 5 seconds

export async function POST(req: Request | NextRequest) {
  try {
    const { imgPath, tweetText } = await req.json();

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
