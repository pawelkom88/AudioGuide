"use client"

import { useState, useEffect } from "react"
import type { Coordinates } from "@/types/coordinates"
import type { POI } from "@/types/poi"
import { calculateDistance } from "@/utils/distance"

export function useProximity(userLocation: Coordinates | null, pois: POI[], proximityRadius = 50) {
  const [nearbyPoi, setNearbyPoi] = useState<POI | null>(null)

  useEffect(() => {
    if (!userLocation) {
      setNearbyPoi(null)
      return
    }

    // Find the closest POI within the radius
    let closestPoi: POI | null = null
    let closestDistance = Number.POSITIVE_INFINITY

    for (const poi of pois) {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, poi.latitude, poi.longitude)

      if (distance < proximityRadius && distance < closestDistance) {
        closestDistance = distance
        closestPoi = poi
      }
    }

    setNearbyPoi(closestPoi)
  }, [userLocation, pois, proximityRadius])

  return { nearbyPoi }
}
