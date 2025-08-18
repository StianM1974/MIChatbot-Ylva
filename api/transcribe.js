import OpenAI from "openai";
import { toFile } from "openai/uploads";

export const config = {
  api: { bodyParser: { sizeLimit: "20mb" } }, // enough for short recordings
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { audioBase64, mimeType = "audio/webm", language = "no" } = req.body || {};
    if (!audioBase64) {
      return res.status(400).json({ error: "Missing audioBase64" });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Decode base64 -> Buffer -> toFile (in-memory)
    const buffer = Buffer.from(audioBase64, "base64");
    const file = await toFile(buffer, "recording.webm", { type: mimeType });

    const resp = await client.audio.transcriptions.create({
      file,
      model: "whisper-1",      // Whisper
      language,                // "no" for Norwegian
      response_format: "json",
      temperature: 0,
    });

    return res.status(200).json({ text: resp.text || "" });
  } catch (err) {
    console.error("Transcribe error:", err);
    return res.status(500).json({ error: "Transcription failed" });
  }
}
