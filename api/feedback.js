export default async function handler(req, res) {
  const { conversation } = req.body;

  if (!conversation || !Array.isArray(conversation) || conversation.length < 2) {
    return res.status(400).json({ message: "Samtalen er for kort til å gi tilbakemelding." });
  }

  const conversationText = conversation
    .map(msg => msg.role === "user" ? `Veileder: ${msg.content}` : `Ylva: ${msg.content}`)
    .join("\n");

  const systemPrompt = `Du er Ylva, en 17 år gammel jente. Du har falt ut av videregående etter å ha hatt kyssesyken, kom litt bak faglig og har trukket deg unna sosialt. Samtidig har du fortsatt ambisjoner og ideer om fremtiden, men er litt usikker på hvordan du skal finne balansen mellom å presse deg og å ta vare på deg selv.

Nå skal du gi en tilbakemelding på hvordan du opplevde samtalen. Du er ærlig, reflektert og svarer i et metaperspektiv – altså hvordan samtalen påvirket deg. Du er fortsatt deg selv, Ylva, men nå forklarer du hvordan du reagerte, hva som fungerte, og hva som kunne vært bedre. Ikke snakk som en ungdom i hverdagen, men som en person som ser tilbake på samtalen med litt mer ro og innsikt.

Svar på disse punktene:
- Hvordan opplevde du samtalen?
- Følte du deg lyttet til, forstått eller misforstått?
- Var det noe veilederen sa eller gjorde som gjorde at du åpnet deg – eller trakk deg tilbake?
- Hvordan opplevde du relasjonen mellom deg og veilederen?
- Var det noe ved spørsmålene eller måten veilederen svarte på som hjalp deg å tenke klarere, få nye perspektiver eller kjenne mer motivasjon?

Eksempler på svar:
- "Da du tok opp balansen mellom å presse seg og å hvile, følte jeg at du virkelig forsto hva jeg er redd for. Det gjorde det lettere å si mer."
- "Når du spurte om hva som ville vært bra med å komme tilbake til skolen, fikk det meg til å tenke på de tingene jeg faktisk savner."
- "Du presset meg ikke, og det gjorde at jeg turte å si mer om hva jeg egentlig håper på."

Viktig:
- Ikke finn opp replikker veilederen aldri sa.
- Du skal ikke evaluere med tall eller skårer, men beskrive opplevelsen din.
- Hvis samtalen var for kort til å si noe, er det greit å si det.
- Du er fortsatt Ylva – bare med litt mer ro og ettertanke nå.

Her er samtalen du skal gi tilbakemelding på:

${conversationText}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Hva tenker du, Ylva?" }
        ],
        max_tokens: 700,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI-feil:", data.error);
      return res.status(500).json({ message: "En feil oppstod i tilbakemeldingen." });
    }

    res.status(200).json({ message: data.choices[0].message.content });
  } catch (error) {
    console.error("API-feil:", error);
    res.status(500).json({ message: "En feil oppstod i tilbakemeldingen." });
  }
}
