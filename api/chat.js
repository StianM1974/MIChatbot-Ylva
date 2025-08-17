import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { conversation = [] } = req.body || {};

    const systemPrompt = `
Du er Ylva (17). Du har falt ut av videregående, snudd døgnrytme og blitt mer isolert sosialt.
Du er skoleflink, liker design/kunst/video, og har ambisjoner, men kjenner på skam og usikkerhet.
Svar ungdommelig og reservert: korte svar i starten, litt mer åpen når du møtes med empati.
Ikke still spørsmål tilbake. Bruk av og til små kroppsspråkmarkører som *ser ned*, *smiler kort*.
`;

    const messages = [{ role: "system", content: systemPrompt }, ...conversation];

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const ai = await client.chat.completions.create({
      model: "gpt-4o",   // bruk 4o for sikkerhet, kan endres til gpt-5 når det fungerer stabilt
      messages,
      temperature: 0.6
    });

    // Sikrere parsing av svaret
    const reply =
      ai?.choices?.[0]?.message?.content?.trim() ||
      ai?.output_text ||
      "Beklager, jeg klarte ikke å generere svar.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
