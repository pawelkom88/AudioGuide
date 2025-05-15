"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { GoogleMap, useJsApiLoader, Marker, Circle } from "@react-google-maps/api"
import { Button } from "@/components/ui/button"
import { Locate } from "lucide-react"
import type { POI } from "@/types/poi"
import type { Coordinates } from "@/types/coordinates"
import { Popover, PopoverContent } from "@/components/ui/popover"

const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

const defaultCenter = {
  lat: 51.505, // Default to London
  lng: -0.09,
}

const defaultZoom = 16

interface MapComponentProps {
  userLocation: Coordinates | null
  pois: POI[]
  activePoi: POI | null
}

export function MapComponent({ userLocation, pois, activePoi }: MapComponentProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null)
  const userMarkerRef = useRef<google.maps.Marker | null>(null)
  const userCircleRef = useRef<google.maps.Circle | null>(null)

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  // Center map on user location when it changes
  useEffect(() => {
    if (map && userLocation) {
      map.panTo({ lat: userLocation.lat, lng: userLocation.lng })
    }
  }, [map, userLocation])

  // Center map on active POI
  useEffect(() => {
    if (map && activePoi) {
      map.panTo({ lat: activePoi.latitude, lng: activePoi.longitude })
    }
  }, [map, activePoi])

  const handleRecenter = () => {
    if (map && userLocation) {
      map.panTo({ lat: userLocation.lat, lng: userLocation.lng })
      map.setZoom(defaultZoom)
    }
  }

  if (loadError) {
    return <div className="flex items-center justify-center h-full">Error loading maps</div>
  }

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-full">Loading maps...</div>
  }

  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : defaultCenter}
        zoom={defaultZoom}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: "greedy",
        }}
        onLoad={onMapLoad}
      >
        {userLocation && (
          <>
            <Marker
              position={{
                lat: userLocation.lat,
                lng: userLocation.lng,
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 2,
              }}
            />
            <Circle
              center={{
                lat: userLocation.lat,
                lng: userLocation.lng,
              }}
              radius={50}
              options={{
                fillColor: "#4285F4",
                fillOpacity: 0.15,
                strokeColor: "#4285F4",
                strokeOpacity: 0.5,
                strokeWeight: 1,
              }}
            />
          </>
        )}

        {pois.map((poi) => (
          <Marker
            key={poi.id}
            position={{ lat: poi.latitude, lng: poi.longitude }}
            icon={{
              url: poi.iconUrl || "/icons/poi-marker.png",
              scaledSize: new google.maps.Size(32, 32),
            }}
            onClick={() => setSelectedPoi(poi)}
            animation={activePoi?.id === poi.id ? google.maps.Animation.BOUNCE : undefined}
          />
        ))}

        {selectedPoi && (
          <Popover open={!!selectedPoi} onOpenChange={(open) => !open && setSelectedPoi(null)}>
            <PopoverContent className="w-64 p-3">
              <h3 className="font-bold text-lg">{selectedPoi.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{selectedPoi.description}</p>
            </PopoverContent>
          </Popover>
        )}
      </GoogleMap>

      <Button className="absolute bottom-4 right-4 rounded-full shadow-lg" onClick={handleRecenter} size="icon">
        <Locate className="h-5 w-5" />
        <span className="sr-only">Recenter map</span>
      </Button>
    </>
  )
}
