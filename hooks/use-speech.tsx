"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { SpeechVoice } from "@/types/speech"
import { debounce } from "@/utils/debounce"

interface SpeechOptions {
  onEnd?: () => void
  voice?: SpeechSynthesisVoice
  rate?: number
  pitch?: number
  volume?: number
}

interface SpeechSettings {
  voiceURI: string
  rate: number
}

// TODO:
// - add more HQ voices - male and female
// - make sure that when a voice is selected is restart narration with new voice

export function useSpeech() {
  const [voices, setVoices] = useState<SpeechVoice[]>([])
  const [isAvailable, setIsAvailable] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [narrationLanguage, setNarrationLanguage] = useState<"en" | "pl" | "de">("en")
  const [speechRate, setSpeechRate] = useState<number>(1.0)
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const initializedRef = useRef(false)
  const voicesLoadedRef = useRef(false)

  // Initialize speech synthesis and get available voices
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsAvailable(false)
      return
    }

    setIsAvailable(true)

    // Load saved settings from localStorage - only once
    if (!initializedRef.current) {
      try {
        const savedSettings = localStorage.getItem("speechSettings")
        if (savedSettings) {
          const settings: SpeechSettings = JSON.parse(savedSettings)
          setSelectedVoice(settings.voiceURI)
          setSpeechRate(settings.rate)
        }
      } catch (error) {
        console.error("Error loading speech settings:", error)
      }
      initializedRef.current = true
    }

    // const loadVoices = () => {
    //   const availableVoices = window.speechSynthesis.getVoices()
    //   console.log("Available voices:", availableVoices)
    //   if (availableVoices.length > 0) {
    //     const mappedVoices = availableVoices.map((voice) => ({
    //       voiceURI: voice.voiceURI,
    //       name: voice.name,
    //       lang: voice.lang,
    //       isDefault: voice.default,
    //       isLocalService: voice.localService,
    //     }))
    //     setVoices(mappedVoices)
    //     voicesLoadedRef.current = true
    //
    //     // Set default voice if none is selected
    //     if (!selectedVoice && mappedVoices.length > 0) {
    //       const userLang = navigator.language || "en-US"
    //       const langCode = userLang.split("-")[0]
    //       const matchingVoice = mappedVoices.find((v) => v.lang.startsWith(langCode)) || mappedVoices[0]
    //       setSelectedVoice(matchingVoice.voiceURI)
    //
    //       // Set initial narration language based on the voice
    //       if (matchingVoice) {
    //         const voiceLang = matchingVoice.lang.split("-")[0].toLowerCase()
    //         if (voiceLang === "pl" || voiceLang === "de") {
    //           setNarrationLanguage(voiceLang as "pl" | "de")
    //         } else {
    //           setNarrationLanguage("en")
    //         }
    //       }
    //     }
    //   }
    // }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      console.log("Available voices:", availableVoices);

      // Group voices by language
      const voicesByLang: { [lang: string]: SpeechSynthesisVoice[] } = {};
      availableVoices.forEach((voice) => {
        const lang = voice.lang.split('-')[0]; // e.g., 'en-US' -> 'en'
        if (!voicesByLang[lang]) voicesByLang[lang] = [];
        voicesByLang[lang].push(voice);
      });

      // Pick one "best" voice per language
      const primaryVoices = Object.values(voicesByLang).map((voices) => {
        // Prefer Google voices
        const googleVoice = voices.find(v => v.name.toLowerCase().includes("google"));
        return googleVoice || voices[0];
      });

      const mappedVoices = primaryVoices.map((voice) => ({
        voiceURI: voice.voiceURI,
        name: voice.name,
        lang: voice.lang,
        localService: voice.localService,
        default: voice.default,
      }));

      setVoices(mappedVoices);
    };

    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    // Try to load voices immediately (works in Firefox)
    loadVoices()

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, []) // Remove selectedVoice from dependencies

  // Update narration language when voice changes
  useEffect(() => {
    if (selectedVoice && voices.length > 0) {
      const selectedVoiceObj = voices.find((v) => v.voiceURI === selectedVoice)
      if (selectedVoiceObj) {
        const voiceLang = selectedVoiceObj.lang.split("-")[0].toLowerCase()
        if (voiceLang === "pl") {
          setNarrationLanguage("pl")
        } else if (voiceLang === "de") {
          setNarrationLanguage("de")
        } else {
          setNarrationLanguage("en")
        }
      }
    }
  }, [selectedVoice, voices])

  // Save settings when they change
  useEffect(() => {
    if (selectedVoice && initializedRef.current) {
      const settings: SpeechSettings = {
        voiceURI: selectedVoice,
        rate: speechRate,
      }
      localStorage.setItem("speechSettings", JSON.stringify(settings))
    }
  }, [selectedVoice, speechRate])

  // Get the selected voice object
  const getSelectedVoiceObject = useCallback(() => {
    if (!window.speechSynthesis || !selectedVoice) return null

    return window.speechSynthesis.getVoices().find((v) => v.voiceURI === selectedVoice) || null
  }, [selectedVoice])

  // Handle voice change
  const handleVoiceChange = useCallback((voiceURI: string) => {
    console.log("Voice changed to:", voiceURI)
    setSelectedVoice(voiceURI)
  }, [])

  // Handle speech rate change
  const handleSpeechRateChange = useCallback((rate: number) => {
    setSpeechRate(rate)
  }, [])

  // Speak text with the given options
  const speak = useCallback(
    (text: string, options: SpeechOptions = {}) => {
      if (!window.speechSynthesis || !isAvailable) return

      // Stop any current speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Set voice and other options
      const voiceObject = options.voice || getSelectedVoiceObject()
      if (voiceObject) {
        utterance.voice = voiceObject
      }

      utterance.rate = options.rate || speechRate
      utterance.pitch = options.pitch || 1
      utterance.volume = options.volume || 1

      // Set event handlers
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        if (options.onEnd) options.onEnd()
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
        if (options.onEnd) options.onEnd()
      }

      // Store the current utterance
      currentUtteranceRef.current = utterance

      // Speak
      window.speechSynthesis.speak(utterance)
    },
    [isAvailable, getSelectedVoiceObject, speechRate],
  )

  // Stop speaking
  const stop = useCallback(() => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  // Pause speaking
  const pause = useCallback(() => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.pause()
  }, [])

  // Resume speaking
  const resume = useCallback(() => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.resume()
  }, [])

  return {
    speak: debounce(speak, 300),
    stop,
    pause,
    resume,
    voices,
    isSpeaking,
    isAvailable,
    selectedVoice,
    onVoiceChange: handleVoiceChange,
    speechRate,
    onSpeechRateChange: handleSpeechRateChange,
    narrationLanguage,
  }
}
