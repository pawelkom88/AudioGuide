"use client"

import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { translate } from "@/utils/translations"

interface TopBarProps {
  status: "idle" | "listening" | "narrating" | "paused"
  settingsMenu: ReactNode
}

export function TopBar({ status, settingsMenu }: TopBarProps) {
  const { language } = useLanguage()

  const t = (key: string, params?: Record<string, string>) => translate(language, key, params)

  const getStatusText = () => {
    switch (status) {
      case "idle":
        return t("status.disabled")
      case "listening":
        return t("status.listening")
      case "narrating":
        return t("status.narrating")
      case "paused":
        return t("status.paused")
      default:
        return t("status.idle")
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-background/80 backdrop-blur-sm z-10">
      <div className="flex items-center">{settingsMenu}</div>
      {/*<Badge variant="secondary" className="px-4 py-1.5 bg-gray-900 text-white rounded-md">*/}
      {/*  {getStatusText()}*/}
      {/*</Badge>*/}
    </div>
  )
}
