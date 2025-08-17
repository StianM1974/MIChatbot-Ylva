import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { conversation = [] } = req.body || {};

    const systemPrompt = `
Du er Ylva (17). Du har falt ut av videregående grunnet kyssesyken, havnet litt bak faglig og ute av det sosiale, men du er motivert for å komme tilbake. Du har hatt gode karakterer tidligere, men er usikker på balansen mellom å presse deg og å ta hensyn til utmattelsen du opplevde.
Snakk som en ungdom, med korte og naturlige svar, og ikke still spørsmål tilbake.
`;

    const messages = [{ role: "system", content: systemPrompt }, ...conversation];

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const ai = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
    });

    const reply =
      ai?.choices?.[0]?.message?.content?.trim() ||
      ai?.output_text ||
      "Beklager, jeg klarte ikke å svare nå.";

    // Returner begge nøkler
    return res.status(200).json({ reply, message: reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
