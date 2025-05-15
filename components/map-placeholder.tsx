"use client"

import { useState, useEffect } from "react"
import type { POI } from "@/types/poi"
import type { Coordinates } from "@/types/coordinates"
import { useLanguage } from "@/contexts/language-context"
import { translate } from "@/utils/translations"

interface MapPlaceholderProps {
  userLocation: Coordinates | null
  pois: POI[]
  activePoi: POI | null
  onRecenter: () => void
  onSelectPoi?: (poi: POI) => void
}

export function MapPlaceholder({ userLocation, pois, activePoi, onRecenter, onSelectPoi }: MapPlaceholderProps) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const { language } = useLanguage()

  const t = (key: string, params?: Record<string, string>) => translate(language, key, params)

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (!mapLoaded) {
    return <div className="flex items-center justify-center h-full">{t("map.loading")}</div>
  }

  return (
    <div className="relative w-full h-full bg-[#f2efe4] overflow-hidden">
      {/* Grid lines to simulate a map */}
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-12">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`col-${i}`} className="border-r border-gray-300 h-full" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`row-${i}`} className="border-b border-gray-300 w-full" />
        ))}
      </div>

      {/* User location */}
      {userLocation && (
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Blue dot with pulse effect */}
          <div className="relative">
            <div className="absolute w-24 h-24 bg-blue-500/10 rounded-full animate-pulse" />
            <div className="absolute w-16 h-16 bg-blue-500/20 rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      )}

      {/* POI markers */}
      {pois.map((poi) => {
        // Calculate random position for demo purposes
        const left = `${30 + Math.random() * 40}%`
        const top = `${30 + Math.random() * 40}%`
        const isActive = activePoi?.id === poi.id

        return (
          <div
            key={poi.id}
            className={`absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 ${
              isActive ? "animate-bounce" : ""
            } cursor-pointer`}
            style={{ left, top }}
            onClick={() => onSelectPoi?.(poi)}
          >
            {/* Castle icon for POI */}
            <div className="w-8 h-8 bg-orange-500 flex items-center justify-center text-white">
              {poi.id === "1" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                  <path d="M18 22h2a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2" />
                  <path d="M10 6h4" />
                  <path d="M10 10h4" />
                  <path d="M10 14h4" />
                  <path d="M10 18h4" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
