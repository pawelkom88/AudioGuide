"use client"

import {useState, useEffect, useCallback, useRef} from "react"
import type {SpeechVoice} from "@/types/speech"
import {debounce} from "@/utils/debounce"
import {useToast} from "@/hooks/use-toast";
import {Language, supportedLanguagesConfig} from "@/providers/providers";

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

const localStorageKeys = {
    speechSettings: "speechSettings",
}

// TODO:
// - add more HQ voices - male and female
// - make sure that when a voice is selected is restart narration with new voice


const getLanguageFromVoice = (voiceLang: SpeechVoice["lang"]): Language => {
    const lang = voiceLang.split("-")[0].toLowerCase();
    if (lang === supportedLanguagesConfig.pl.value) {
        return supportedLanguagesConfig.pl.value;
    } else if (lang === supportedLanguagesConfig.de.value) {
        return supportedLanguagesConfig.de.value;
    }
    return supportedLanguagesConfig.en.value;
}

const setNarrationLanguageFromVoice = (voice: SpeechVoice, setNarrationLanguage: (lang: Language) => void) => {
    if (!voice) {
        return;
    }

    const voiceLang = voice.lang.split("-")[0].toLowerCase();

    switch (voiceLang) {
        case supportedLanguagesConfig.pl.value:
        case supportedLanguagesConfig.de.value:
            setNarrationLanguage(voiceLang as "pl" | "de");
            break;
        default:
            setNarrationLanguage(supportedLanguagesConfig.en.value);
    }
};


const mapVoices = (availableVoices: SpeechSynthesisVoice[]) => {
    return availableVoices.map((voice) => ({
        voiceURI: voice.voiceURI,
        name: voice.name,
        lang: voice.lang,
        isDefault: voice.default,
        isLocalService: voice.localService,
    }))
}

export function useSpeech() {
    const {toast} = useToast()
    const [voices, setVoices] = useState<SpeechVoice[]>([])
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [selectedVoice, setSelectedVoice] = useState<string>("")
    const [narrationLanguage, setNarrationLanguage] = useState<Language>(supportedLanguagesConfig.en.value)
    const [speechRate, setSpeechRate] = useState<number>(1.0)
    const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
    const initializedRef = useRef(false)
    const voicesLoadedRef = useRef(false)

    const isAvailable = typeof window !== "undefined" && !!window.speechSynthesis

    // Initialize speech synthesis and get available voices
    useEffect(() => {
        // Load saved settings from localStorage - only once
        if (!initializedRef.current) {
            try {
                const savedSettings = localStorage.getItem(localStorageKeys.speechSettings)
                if (savedSettings) {
                    const settings: SpeechSettings = JSON.parse(savedSettings)
                    setSelectedVoice(settings.voiceURI)
                    setSpeechRate(settings.rate)
                }
            } catch (error) {
                toast({
                    title: "Error loading speech settings",
                    description: "Please reload the page",
                    variant: "destructive",
                })
            }
            initializedRef.current = true
        }

        // const loadVoices = () => {
        //     const availableVoices = window.speechSynthesis.getVoices()
        //
        //     if (availableVoices.length > 0) {
        //         const mappedVoices = mapVoices(availableVoices)
        //         setVoices(mappedVoices)
        //         voicesLoadedRef.current = true
        //
        //         // Set default voice if none is selected
        //         if (!selectedVoice && mappedVoices.length > 0) {
        //             const userLang = navigator.language || "en-UK"
        //             const langCode = userLang.split("-")[0]
        //             const matchingVoice = mappedVoices.find((v) => v.lang.startsWith(langCode)) || mappedVoices[0]
        //             setSelectedVoice(matchingVoice.voiceURI)
        //             // Set initial narration language based on the voice
        //             if (matchingVoice) {
        //                 const voiceLang = matchingVoice.lang.split("-")[0].toLowerCase()
        //                 if (voiceLang === supportedLanguagesConfig.pl.value || voiceLang === supportedLanguagesConfig.de.value) {
        //                     setNarrationLanguage(voiceLang as "pl" | "de")
        //                 } else {
        //                     setNarrationLanguage(supportedLanguagesConfig.en.value)
        //                 }
        //             }
        //         }
        //     }
        // }

        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();

            if (availableVoices.length === 0) {
                return; // Early return if no voices are available
            }

            const mappedVoices = mapVoices(availableVoices);
            setVoices(mappedVoices);
            voicesLoadedRef.current = true;

            // If a voice is already selected or no voices are available, we're done
            if (selectedVoice || mappedVoices.length === 0) {
                return;
            }

            // Select default voice based on user's language
            const userLang = navigator.language || "en-UK";
            const langCode = userLang.split("-")[0];
            const matchingVoice = mappedVoices.find((v) => v.lang.startsWith(langCode)) || mappedVoices[0];

            // Set the selected voice
            setSelectedVoice(matchingVoice.voiceURI);

            // Set initial narration language based on the voice
            setNarrationLanguageFromVoice(matchingVoice, setNarrationLanguage);
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

    // const selectedVoiceObj: SpeechVoice | undefined = voices.find((v) => v.voiceURI === selectedVoice)

    const getSelectedVoiceObject = useCallback(() => {
        if (!window.speechSynthesis || !selectedVoice) return null
        return window.speechSynthesis.getVoices().find((v) => v.voiceURI === selectedVoice) || null
    }, [selectedVoice])

    const saveSettings = useCallback((voiceURI: string, rate: number) => {
        const settings: SpeechSettings = {
            voiceURI,
            rate,
        };
        localStorage.setItem(localStorageKeys.speechSettings, JSON.stringify(settings));
    }, []);

    const handleVoiceChange = useCallback((voiceURI: string) => {
        // Stop any ongoing narration when voice changes
        if (window.speechSynthesis && isSpeaking) {
            window.speechSynthesis.cancel()
            setIsSpeaking(false)
        }

        setSelectedVoice(voiceURI)
        saveSettings(voiceURI, speechRate)

        const newVoice = voices.find(v => v.voiceURI === voiceURI)
        if (newVoice) {
            const language = getLanguageFromVoice(newVoice.lang)
            setNarrationLanguage(language)
        }
    }, [voices, speechRate, saveSettings, isSpeaking])

    const handleSpeechRateChange = useCallback((rate: number) => {
        setSpeechRate(rate)
    }, [speechRate])

    // bug - when stop and then resume narration voice changes to english

    const startNarration = useCallback(
        (text: string, options: SpeechOptions = {}) => {
            if (!isAvailable) return

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

    const stopNarration = useCallback(() => {
        if (!window.speechSynthesis) return
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
    }, [])

    const pauseNarration = useCallback(() => {
        if (!window.speechSynthesis) return
        window.speechSynthesis.pause()
    }, [])

    const resumeNarration = useCallback(() => {
        if (!window.speechSynthesis) return
        window.speechSynthesis.resume()
    }, [])

    return {
        startNarration: debounce(startNarration, 300),
        stopNarration,
        pauseNarration,
        resumeNarration,
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
