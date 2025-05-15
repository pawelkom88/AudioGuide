"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { SpeechVoice } from "@/types/speech"
import { useLanguage } from "@/contexts/language-context"
import { translate } from "@/utils/translations"

interface SettingsProps {
  isEnabled: boolean
  onToggleEnabled: (enabled: boolean) => void
  voices: SpeechVoice[]
  selectedVoice: string
  onVoiceChange: (voice: string) => void
  speechRate: number
  onSpeechRateChange: (rate: number) => void
  narrationLanguage: "en" | "pl" | "de"
}

export function Settings({
  isEnabled,
  onToggleEnabled,
  voices,
  selectedVoice,
  onVoiceChange,
  speechRate,
  onSpeechRateChange,
  narrationLanguage,
}: SettingsProps) {
  const [userLanguage, setUserLanguage] = useState<string>("en-US")
  const { language, setLanguage } = useLanguage()

  const t = (key: string, params?: Record<string, string>) => translate(language, key, params)

  useEffect(() => {
    // Detect browser language
    const browserLang = navigator.language || "en-US"
    setUserLanguage(browserLang)
  }, [])

  // Filter voices to only show English, Polish, and German
  const filteredVoices = voices.filter((voice) => {
    const lang = voice.lang.split("-")[0].toLowerCase()
    return lang === "en" || lang === "pl" || lang === "de"
  })

  // Group voices by language for display purposes only
  const englishVoices = filteredVoices.filter((voice) => voice.lang.startsWith("en"))
  const polishVoices = filteredVoices.filter((voice) => voice.lang.startsWith("pl"))
  const germanVoices = filteredVoices.filter((voice) => voice.lang.startsWith("de"))

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-semibold">{t("settings.title")}</h2>

      <div className="flex items-center justify-between">
        <Label htmlFor="narration-toggle" className="flex flex-col space-y-1">
          <span>{t("settings.narration.enable")}</span>
          <span className="font-normal text-sm text-muted-foreground">{t("settings.narration.description")}</span>
        </Label>
        <Switch id="narration-toggle" checked={isEnabled} onCheckedChange={onToggleEnabled} />
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="voice-select">{t("settings.voice.title")}</Label>
          <Badge variant="outline" className="ml-2">
            {narrationLanguage === "en" ? "English" : narrationLanguage === "pl" ? "Polski" : "Deutsch"}
          </Badge>
        </div>

        <Select value={selectedVoice} onValueChange={onVoiceChange} disabled={filteredVoices.length === 0}>
          <SelectTrigger id="voice-select">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            {englishVoices.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-sm font-semibold bg-muted">English</div>
                {englishVoices.map((voice) => (
                  <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name}
                  </SelectItem>
                ))}
              </>
            )}

            {polishVoices.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-sm font-semibold bg-muted mt-2">Polski</div>
                {polishVoices.map((voice) => (
                  <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name}
                  </SelectItem>
                ))}
              </>
            )}

            {germanVoices.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-sm font-semibold bg-muted mt-2">Deutsch</div>
                {germanVoices.map((voice) => (
                  <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name}
                  </SelectItem>
                ))}
              </>
            )}

            {filteredVoices.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No voices available</div>
            )}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {t("settings.voice.detected")}: {userLanguage}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="speech-rate">{t("settings.speechRate.title")}</Label>
          <span className="text-sm font-medium">{speechRate.toFixed(1)}x</span>
        </div>
        <Slider
          id="speech-rate"
          min={0.5}
          max={2}
          step={0.1}
          value={[speechRate]}
          onValueChange={(value) => onSpeechRateChange(value[0])}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("settings.speechRate.slower")}</span>
          <span>{t("settings.speechRate.normal")}</span>
          <span>{t("settings.speechRate.faster")}</span>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="language-select">{t("settings.language.title")}</Label>
        <Select value={language} onValueChange={(value) => setLanguage(value as "en" | "pl" | "de")}>
          <SelectTrigger id="language-select">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t("settings.language.en")}</SelectItem>
            <SelectItem value="pl">{t("settings.language.pl")}</SelectItem>
            <SelectItem value="de">{t("settings.language.de")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
