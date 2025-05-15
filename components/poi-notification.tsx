"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { POI } from "@/types/poi"
import { translate } from "@/utils/translations"
import {useLanguage} from "@/providers/providers";

interface POINotificationProps {
  poi: POI | null
  onPlay: (poi: POI) => void
  onDismiss: () => void
  narrationLanguage: "en" | "pl" | "de"
}

// TODO:
// - make sure it is a drawer that slides up after clicking on a POI

export function POINotification({ poi, onPlay, onDismiss, narrationLanguage }: POINotificationProps) {
  const { language } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)

  const t = (key: string, params?: Record<string, string>) => translate(language, key, params)

  // Get the POI title in the correct language
  const getLocalizedTitle = (poi: POI) => {
    if (narrationLanguage === "pl" && poi.translations.pl) {
      return poi.translations.pl.title
    } else if (narrationLanguage === "de" && poi.translations.de) {
      return poi.translations.de.title
    }
    return poi.title
  }

  // Animate in when a new POI is detected
  useEffect(() => {
    if (poi) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [poi])

  if (!poi) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-20"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <Card className="rounded-t-xl rounded-b-none shadow-lg border-t">
            <div className="p-4 pb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">{t("notification.newPoi")}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={onDismiss}
                  aria-label={t("notification.dismiss")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <h3 className="text-2xl font-bold">{getLocalizedTitle(poi)}</h3>
              <p className="text-muted-foreground line-clamp-2 mt-1 text-sm">{t("notification.nearby")}</p>

              <div className="flex justify-end mt-4">
                <Button className="rounded-full px-6" onClick={() => onPlay(poi)} aria-label={t("notification.play")}>
                  <Play className="h-4 w-4 mr-2" />
                  {t("notification.play")}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
