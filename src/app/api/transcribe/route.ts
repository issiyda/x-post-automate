import fs from "fs";
import ytdl from "ytdl-core";
import OpenAI from "openai";
import { waitFor } from "../../utils/waitFor";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: Request | NextRequest) {
  const { videoUrl } = await req.json();

  try {
    // 1. YouTube動画の情報を取得
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json({ error: "Invalid video URL" });
    }

    const audio = ytdl(videoUrl, { quality: "highestaudio" });

    const audioFilePath = `${videoId}.mp3`;
    const writeStream = fs.createWriteStream(audioFilePath);

    // 非同期処理をPromiseでラップして完了を待つ
    await new Promise((resolve, reject) => {
      audio.pipe(writeStream);

      audio.on("error", (err) => {
        console.error(err);
        reject(err);
      });
      let starttime: number;
      starttime = Date.now();
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
        process.stdout.write(
          `running for: ${downloadedMinutes.toFixed(2)}minutes`
        );
        process.stdout.write(
          `, estimated time left: ${estimatedDownloadTime.toFixed(2)}minutes `
        );
      });

      audio.on("end", resolve);
      audio.on("finish", resolve);
    });

    console.log(`YouTube file (${videoId}.mp3) downloaded.`);

    // Whisperの処理
    const whisper = new WhisperApplicationService();
    console.log("targetFileName", audioFilePath);

    const translatedScript = await whisper.translate(audioFilePath);
    console.log("translatedScript", translatedScript);

    try {
      fs.unlinkSync(audioFilePath);
    } catch (error) {
      console.log(`${audioFilePath}を削除できませんでした`);
    }

    return NextResponse.json({ transcription: translatedScript });
  } catch (error) {
    console.error("Error during transcription process:", error);
    return NextResponse.json({
      transcription: "Error occurred",
      error: error.message,
    });
  }
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
