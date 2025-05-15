import enMessages from "@/messages/en.json"
import plMessages from "@/messages/pl.json"
import deMessages from "@/messages/de.json"

type Language = "en" | "pl" | "de"

const messages = {
  en: enMessages,
  pl: plMessages,
  de: deMessages,
}

export function getTranslations(language: Language) {
  return messages[language] || messages.en
}

export function translate(language: Language, key: string, params?: Record<string, string>) {
  const keys = key.split(".")
  let value: any = getTranslations(language)

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k]
    } else {
      return key // Return the key if translation not found
    }
  }

  if (typeof value === "string" && params) {
    // Replace parameters in the string
    return Object.entries(params).reduce((str, [param, val]) => {
      return str.replace(new RegExp(`{${param}}`, "g"), val)
    }, value)
  }

  return value || key
}
