import { TwitterApi } from "twitter-api-v2";
import { NextRequest, NextResponse } from "next/server";

// APIキーとアクセストークンを設定
const apiKey = "SKy0jaMfU6fS0oHJIyIHgKeCl";
const apiKeySecret = "T6tlmNmhlpfsveCa46oiNnxzEgavCQlNCLfxH0YZQ6YuRBon9J";
const accessToken = "1770965515978293248-uJFsGbFqebP1A3aYYB154Btt7LxcvF";
const accessTokenSecret = "kgxs2wU5Oz4Jk7fPJETFML6tkMz8FnLxjdAcTtGemKCXF";

// Twitter APIクライアントを作成
const client = new TwitterApi({
  appKey: apiKey,
  appSecret: apiKeySecret,
  accessToken: accessToken,
  accessSecret: accessTokenSecret,
});

export async function POST(req: Request | NextRequest) {
  try {
    const { imagePath, tweetText } = await req.json();
    // 画像をバッファとして読み込む
    // const imageBuffer = fs.readFileSync(imagePath);

    // 画像をアップロードしてメディアIDを取得
    // const mediaId = await client.v1.uploadMedia(imageBuffer, {
    //   mimeType: "image/jpeg",
    // });

    // ツイートを投稿
    const res = await client.v1.tweet(tweetText, {});
    console.log("res", res);

    return NextResponse.json({ transcription: res });
  } catch (error) {
    console.error("Error posting tweet:", error);
    return NextResponse.json({
      transcription: "Error occurred",
      error,
    });
  }
}

// 投稿する画像のファイルパスとツイートのテキストを設定
const imagePath = "path_to_your_image.jpg";
const tweetText = "This is a sample tweet with an image";

// 関数を呼び出してツイートを投稿
