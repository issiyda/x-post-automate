"use client";
import { FormEvent, useState } from "react";
import axios from "axios";

export default function Tweet() {
  const [tweetText, setTweetText] = useState("");
  const [transcription, setTranscription] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await axios.post("/api/tweet", { tweetText });
    setTranscription(response.data.transcription);
  };

  return (
    <div>
      <h1>tweet Scriptor</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={tweetText}
          onChange={(e) => setTweetText(e.target.value)}
          placeholder="tweet text"
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
