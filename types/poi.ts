export interface POI {
  id: string
  title: string
  description: string
  translations: {
    pl: {
      title: string
      description: string
    }
    de: {
      title: string
      description: string
    }
  }
  latitude: number
  longitude: number
  iconUrl?: string
}
