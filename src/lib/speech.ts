/**
 * Lightweight text-to-speech using the browser's built-in Web Speech API.
 * No dependencies, no network. Used to give the demo AI voices real audio
 * when a user plays a sample or tests a voice.
 *
 * In production these previews would stream from a real TTS provider
 * (see src/services/ai) — this keeps the prototype audible offline.
 */

import { clamp } from "@/lib/utils";

export interface SpeakOptions {
  gender?: string; // "female" | "male" | "neutral"
  accent?: string; // "US" | "UK" | "AU" | "Neutral" | "ES"
  langName?: string; // "English", "Spanish", ...
  rate?: number; // ~0.5..2 (speech speed multiplier)
  pitch01?: number; // 0..1 UI pitch -> mapped to SpeechSynthesis 0..2
  emotion?: number; // 0..1 adds a little pitch lift
  onStart?: () => void;
  onEnd?: () => void;
}

const LANG_TO_CODE: Record<string, string> = {
  English: "en",
  Spanish: "es",
  French: "fr",
  Arabic: "ar",
  Mandarin: "zh",
  Hindi: "hi",
  Portuguese: "pt",
  German: "de",
  Yoruba: "yo",
  Swahili: "sw",
  Italian: "it",
  Igbo: "ig",
  Hausa: "ha",
  Pidgin: "en",
};

const ACCENT_BCP: Record<string, string> = {
  US: "en-US",
  UK: "en-GB",
  AU: "en-AU",
  Neutral: "en-US",
  ES: "es-ES",
};

const FEMALE_RE =
  /(female|samantha|victoria|karen|moira|tessa|fiona|serena|allison|ava|susan|zira|nicky|amelie|anna|kyoko|ting|monica|paulina|women|google uk english female|google us english)/i;
const MALE_RE =
  /(\bmale\b|daniel|alex|fred|aaron|rishi|thomas|oliver|yannick|jorge|diego|google uk english male|men|guy|reed|arthur)/i;

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Resolve the voice list, which can load asynchronously on first use. */
function ensureVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!speechSupported()) return resolve([]);
    const synth = window.speechSynthesis;
    const existing = synth.getVoices();
    if (existing.length) return resolve(existing);
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve(synth.getVoices());
    };
    synth.onvoiceschanged = done;
    // Fallback in case the event never fires.
    window.setTimeout(done, 500);
  });
}

function matchesGender(name: string, gender?: string) {
  if (gender === "male") return MALE_RE.test(name);
  if (gender === "female") return FEMALE_RE.test(name);
  return true;
}

function pickVoice(
  voices: SpeechSynthesisVoice[],
  gender?: string,
  langName?: string,
  accent?: string
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const langCode = LANG_TO_CODE[langName ?? "English"] ?? "en";
  const target =
    langCode === "en" ? ACCENT_BCP[accent ?? "US"] ?? "en-US" : langCode;

  const exact = voices.filter(
    (v) => v.lang.toLowerCase() === target.toLowerCase()
  );
  const byPrefix = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(langCode)
  );
  const pool = exact.length ? exact : byPrefix.length ? byPrefix : voices;
  const gendered = pool.filter((v) => matchesGender(v.name, gender));
  return (gendered.length ? gendered : pool)[0] ?? null;
}

/** Speak `text` aloud. Returns false if speech isn't supported. */
export async function speak(text: string, opts: SpeakOptions = {}) {
  if (!speechSupported()) {
    opts.onEnd?.();
    return false;
  }
  const synth = window.speechSynthesis;
  const voices = await ensureVoices();
  synth.cancel(); // stop anything already playing

  const utter = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(voices, opts.gender, opts.langName, opts.accent);
  if (voice) {
    utter.voice = voice;
    utter.lang = voice.lang;
  } else {
    const langCode = LANG_TO_CODE[opts.langName ?? "English"] ?? "en";
    utter.lang = langCode === "en" ? ACCENT_BCP[opts.accent ?? "US"] : langCode;
  }

  utter.rate = clamp(opts.rate ?? 1, 0.5, 2);
  utter.pitch = clamp(
    0.7 + (opts.pitch01 ?? 0.5) * 0.9 + (opts.emotion ?? 0) * 0.25,
    0,
    2
  );
  utter.volume = 1;

  if (opts.onStart) utter.onstart = opts.onStart;
  const end = opts.onEnd;
  if (end) {
    utter.onend = end;
    utter.onerror = end;
  }

  // Some browsers need a tick after cancel() before speaking.
  window.setTimeout(() => synth.speak(utter), 60);
  return true;
}

/** Stop any in-progress speech. */
export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
}
