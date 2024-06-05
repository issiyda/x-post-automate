"use client";
import { FormEvent, useState } from "react";
import axios from "axios";

export default function Tweet() {
  const [prompt, setprompt] = useState("");
  const [transcription, setTranscription] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await axios.post("/api/dalle", { prompt });
    setTranscription(response.data.transcription);
  };

  return (
    <div>
      <h1>Dalle</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setprompt(e.target.value)}
          placeholder="tweet text"
          required
        />
        <button type="submit">generateImage</button>
      </form>
      {transcription && (
        <div>
          <h2>generateImagePath</h2>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
}
