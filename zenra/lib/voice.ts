// ElevenLabs text-to-speech. Returns audio/mpeg bytes.
const API_KEY = process.env.ELEVENLABS_API_KEY;
// "Sarah" — a mature, reassuring, warm premade voice that suits Zenra
// (premade voices work on the free tier; library voices require a paid plan).
const DEFAULT_VOICE = "EXAVITQu4vr4xnSDxMaL";

export function voiceAvailable() {
  return Boolean(API_KEY);
}

export async function synthesize(text: string, voiceId = DEFAULT_VOICE): Promise<ArrayBuffer> {
  if (!API_KEY) throw new Error("ELEVENLABS_API_KEY not set");
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: { stability: 0.4, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true },
      }),
    }
  );
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`ElevenLabs error ${res.status}: ${msg}`);
  }
  return res.arrayBuffer();
}
