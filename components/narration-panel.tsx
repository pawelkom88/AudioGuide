"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pause, Play } from "lucide-react"
import type { POI } from "@/types/poi"
import { translate } from "@/utils/translations"
import {useLanguage} from "@/providers/providers";

interface NarrationPanelProps {
  poi: POI
  isNarrating: boolean
  onToggleNarration: () => void
  onReplayNarration: () => void
  narrationLanguage: "en" | "pl" | "de"
}

export function NarrationPanel({
  poi,
  isNarrating,
  onToggleNarration,
  onReplayNarration,
  narrationLanguage,
}: NarrationPanelProps) {
  const { language } = useLanguage()

  const t = (key: string, params?: Record<string, string>) => translate(language, key, params)

  // Get the POI title and description in the correct language
  const getLocalizedTitle = () => {
    if (narrationLanguage === "pl" && poi.translations.pl) {
      return poi.translations.pl.title
    } else if (narrationLanguage === "de" && poi.translations.de) {
      return poi.translations.de.title
    }
    return poi.title
  }

  const getLocalizedDescription = () => {
    if (narrationLanguage === "pl" && poi.translations.pl) {
      return poi.translations.pl.description
    } else if (narrationLanguage === "de" && poi.translations.de) {
      return poi.translations.de.description
    }
    return poi.description
  }
// todo: make sheet so it hided but still plays ? reveal a little bit so it can be slide up ?
  return (
      <Card >
        <CardContent className="p-0">
          <div className="p-4 pb-2">
             {/*truncate long names*/}
            <h2 className="text-3xl font-bold">{getLocalizedTitle()}</h2>
            {/*<p className="text-muted-foreground line-clamp-2 mt-1 text-base">{getLocalizedDescription()}</p>*/}
          </div>

          <div className="flex items-center justify-between p-4 pt-2">
            <div className="w-16 flex justify-center">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12 border-2"
                onClick={onReplayNarration}
                aria-label={t("narration.replay")}
              >
                <div className="h-3 w-3 bg-black rounded-full" />
                <span className="sr-only">{t("narration.replay")}</span>
              </Button>
            </div>

            <Button
              className="flex-1 rounded-full h-12  text-white"
              variant="default"
              onClick={onToggleNarration}
            >
              {isNarrating ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  {t("narration.pause")}
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  {t("narration.play")}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
  )
}
