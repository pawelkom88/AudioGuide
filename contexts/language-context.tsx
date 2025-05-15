"use client"

import {createContext, useContext, useState, useEffect, type ReactNode} from "react"

export const supportedLanguagesConfig = {
    en: {value: "en", label: "English"},
    pl: {value: "pl", label: "Polski"},
    de: {value: "de", label: "Deutsch"},
} as const

export type Language = typeof supportedLanguagesConfig[keyof typeof supportedLanguagesConfig]["value"]

interface LanguageContextType {
    language: Language
    setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({children}: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>(supportedLanguagesConfig.en.value)
    const supportedLanguages = Object.keys(supportedLanguagesConfig) as Language[]

    useEffect(() => {
        const detectLanguage = (): Language => {
            const browserLang = navigator.language.split("-")[0]

            if (supportedLanguages.includes(browserLang as Language)) {
                return browserLang as Language
            }
            return supportedLanguagesConfig.en.value
        }

        // hook
        const savedLanguage = localStorage.getItem("appLanguage") as Language
        if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
            setLanguage(savedLanguage)
        } else {
            setLanguage(detectLanguage())
        }
    }, [])

    // Save language preference to localStorage
    useEffect(() => {
        // hook
        localStorage.setItem("appLanguage", language)
        document.documentElement.lang = language
    }, [language])

    return <LanguageContext.Provider value={{language, setLanguage}}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
