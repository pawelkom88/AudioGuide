"use client"

import { useState, useEffect } from "react"
import type { Coordinates } from "@/types/coordinates"

interface GeolocationState {
  location: Coordinates | null
  error: GeolocationPositionError | null
  isWatching: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isWatching: false,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: {
          code: 0,
          message: "Geolocation is not supported by your browser",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        },
      }))
      return
    }

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState((prev) => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        }))
      },
      (error) => {
        setState((prev) => ({ ...prev, error }))
      },
      { enableHighAccuracy: true },
    )

    // Watch position
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState((prev) => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          isWatching: true,
          error: null,
        }))
      },
      (error) => {
        setState((prev) => ({ ...prev, error }))
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      },
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  return state
}
