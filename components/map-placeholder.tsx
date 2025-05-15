"use client"

import {useState, useEffect, useCallback} from "react"
import type {POI} from "@/types/poi"
import type {Coordinates} from "@/types/coordinates"
import {useLanguage} from "@/contexts/language-context"
import {translate} from "@/utils/translations"
import {GoogleMap, useJsApiLoader} from '@react-google-maps/api'

const containerStyle = {
    width: '100%',
    height: '100%',
}

const center = {
    lat: -3.745,
    lng: -38.523,
}

interface MapPlaceholderProps {
    userLocation: Coordinates | null
    pois: POI[]
    activePoi: POI | null
    onRecenter: () => void
    onSelectPoi?: (poi: POI) => void
}

export function MapPlaceholder({userLocation, pois, activePoi, onRecenter, onSelectPoi}: MapPlaceholderProps) {

    const {isLoaded} = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    })

    const position = [51.5913, -2.9984];
    const {language} = useLanguage()

    const t = (key: string, params?: Record<string, string>) => translate(language, key, params)

    const [map, setMap] = useState(null)

    const onLoad = useCallback(function callback(map) {
        // This is just an example of getting and using the map instance!!! don't just blindly copy!
        const bounds = new window.google.maps.LatLngBounds(center)
        map.fitBounds(bounds)

        setMap(map)
    }, [])

    const onUnmount = useCallback(function callback() {
        setMap(null)
    }, [])

    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={18}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                disableDefaultUI: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                gestureHandling: "greedy",
            }}
        >
            {/* Child components, such as markers, info windows, etc. */}
            <></>
        </GoogleMap>
    ) : (
        <></>
    )
}
