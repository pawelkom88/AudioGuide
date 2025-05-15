"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en" | "pl" | "de"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    // Detect browser language on initial load
    const detectLanguage = () => {
      const browserLang = navigator.language.split("-")[0]
      const supportedLanguages: Language[] = ["en", "pl", "de"]

      // Check if browser language is supported, otherwise default to English
      if (supportedLanguages.includes(browserLang as Language)) {
        return browserLang as Language
      }
      return "en"
    }

    // Try to get language from localStorage first
    const savedLanguage = localStorage.getItem("appLanguage") as Language
    if (savedLanguage && ["en", "pl", "de"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    } else {
      const detectedLanguage = detectLanguage()
      setLanguage(detectedLanguage)
    }
  }, [])

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem("appLanguage", language)

    // Update document language for accessibility
    document.documentElement.lang = language
  }, [language])

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
