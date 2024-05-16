import fs from "fs";
import ytdl from "ytdl-core";

import OpenAI from "openai";
import { waitFor } from "../../utils/waitFor";
import { NextApiResponse } from "next";
import { NextRequest } from "next/server";

export async function POST(req: Request | NextRequest) {
  const { videoUrl } = await req.json();

  // 1. YouTube動画の情報を取得
  const videoId = extractVideoId(videoUrl);
  const audio = ytdl(videoUrl, { quality: "highestaudio" });

  audio.on("error", (err) => {
    console.error(err);
    return;
  });

  const audioFilePath = `${videoId}.mp3`;
  audio.pipe(fs.createWriteStream(audioFilePath));
  var starttime: number;
  audio.once("response", () => {
    starttime = Date.now();
  });

  audio.on("progress", (chunkLength, downloaded, total) => {
    const percent = downloaded / total;
    const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
    const estimatedDownloadTime =
      downloadedMinutes / percent - downloadedMinutes;
    process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
    process.stdout.write(
      `(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(
        total /
        1024 /
        1024
      ).toFixed(2)}MB)\n`
    );
    process.stdout.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`);
    process.stdout.write(
      `, estimated time left: ${estimatedDownloadTime.toFixed(2)}minutes `
    );
  });

  console.log(`youtube file (${videoId}.mp3) downloaded.`);
  //   mp3の場合はwav -> mp3変換してから返す
  const targetFileName = `${videoId}.mp3`;

  audio.on("end", async () => {
    console.log(`youtube file (${videoId}.mp3) downloaded.`);

    // whisperの処理
    const whisper = new WhisperApplicationService();
    console.log("targetFileName", targetFileName);

    const translatedScript = await whisper.translate(targetFileName);
    console.log("translatedScript", translatedScript);

    try {
      fs.unlinkSync(videoId + `.mp3`);
    } catch (error) {
      console.log(videoId + `.mp3` + "を削除できませんでした");
    }
    return translatedScript;
  });
}

// YouTube動画のURLから動画IDを抽出する関数
function extractVideoId(url: string) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|shorts\/)([^&?/]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

class WhisperApplicationService {
  async translate(audioFileName: string) {
    const audioFilePath = `${audioFileName}`;
    console.log("audioFilePath", audioFilePath);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const file = fs.createReadStream(audioFilePath);

    // 10秒間待つ
    await waitFor(10);
    console.log("10 seconds wait is over");

    // Whisperモデルを使用してテキスト変換リクエストを送信
    const response = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file,
      language: "ja",
      response_format: "json",
    });

    // 変換されたテキストを出力
    console.log(response);
    return response.text;
  }
}
