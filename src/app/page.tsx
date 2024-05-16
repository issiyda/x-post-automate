"use client";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [transcription, setTranscription] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await axios.post("/api/transcribe", { videoUrl });
    setTranscription(response.data.transcription);
  };

  return (
    <div>
      <h1>YouTube Transcriber</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="YouTube Video URL"
          required
        />
        <button type="submit">Transcribe</button>
      </form>
      {transcription && (
        <div>
          <h2>Transcription</h2>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
}
