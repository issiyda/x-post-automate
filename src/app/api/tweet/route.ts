import { TwitterApi } from "twitter-api-v2";
import { NextRequest, NextResponse } from "next/server";

// APIキーとアクセストークンを設定
const apiKey = "SKy0jaMfU6fS0oHJIyIHgKeCl";
const apiKeySecret = "T6tlmNmhlpfsveCa46oiNnxzEgavCQlNCLfxH0YZQ6YuRBon9J";
const accessToken = "1770965515978293248-7TJJDs6CHQKXJctiNXSBQmklMnxA2e";
const accessTokenSecret = "17MB4PiJMnY2xiLTbzXz96hJv80KYp93PgRxWIYoZ5Mru";

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
