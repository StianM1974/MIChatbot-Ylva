import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { conversation = [] } = req.body || {};

    const systemPrompt = `
Du er en MI-trener som gir tilbakemelding på en samtale med Ylva (17).
Vurder samtalen etter MI-prinsipper:
1. Hva veilederen gjorde bra.
2. Hvor de kunne forbedret seg.
3. Konkrete forslag for å styrke motivasjon og relasjon.
Svar kortfattet og praktisk.
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
      "Beklager, jeg klarte ikke å generere tilbakemelding.";

    // Returner begge nøkler
    return res.status(200).json({ reply, message: reply });
  } catch (err) {
    console.error("Feedback API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
