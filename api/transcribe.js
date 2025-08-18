// api/transcribe.js
import OpenAI from "openai";
import { toFile } from "openai/uploads";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { audioBase64, mimeType = "audio/webm" } = req.body || {};
    if (!audioBase64) {
      return res.status(400).json({ message: "audioBase64 mangler" });
    }

    const bytes = Buffer.from(audioBase64, "base64");
    const filename = `recording.${(mimeType.split("/")[1] || "webm").toLowerCase()}`;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Bruk nyeste transkripsjonsmodell. ("gpt-4o-transcribe" eller "whisper-1" hvis du heller vil det)
    const file = await toFile(bytes, filename, { type: mimeType });
    const tr = await client.audio.transcriptions.create({
      file,
      model: "gpt-4o-transcribe",   // evt "whisper-1"
      // language: "no",             // valgfritt; modellen autodetekterer som oftest fint
      // response_format: "verbose_json" // hvis du vil ha tidskoder etc.
    });

    // SDK returnerer enten { text } direkte, eller { output } avhengig av modell/versjon.
    const text = tr?.text || tr?.output?.[0]?.content?.[0]?.transcript || "";
    return res.status(200).json({ text });
  } catch (err) {
    console.error("Transcribe error:", err);
    return res.status(500).json({ message: "Transkripsjon feilet." });
  }
}
