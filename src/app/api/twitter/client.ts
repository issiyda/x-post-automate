import { TwitterApi } from "twitter-api-v2";

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
export const rwClient = client.readWrite; // 書き込み可能なクライアントを取得
