"use client"

import {useState, useCallback} from "react"
import type {POI} from "@/types/poi"
import type {Coordinates} from "@/types/coordinates"
import {translate} from "@/utils/translations"
import {GoogleMap, Marker, useJsApiLoader} from '@react-google-maps/api'
import {useQuery, useSuspenseQuery} from "@tanstack/react-query";
import LatLngLiteral = google.maps.LatLngLiteral;
import {useLanguage} from "@/providers/providers";

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

// Define the type for the data we expect from Overpass API
interface OverpassElement {
    type: 'node' | 'way' | 'relation';
    id: number;
    lat?: number; // For nodes
    lon?: number; // For nodes
    geometry?: { latitude: number; longitude: number }[]; // For ways and relations
    center?: { latitude: number; longitude: number }; // For ways and relations
    tags?: {
        name?: string;
        [key: string]: string; // Allow other tags
    };
}

interface OverpassResponse {
    elements: OverpassElement[];
}

// Function to fetch nearby attractions from Overpass API
const fetchNearbyAttractions = async ({ lat, lng }: LatLngLiteral): Promise<OverpassElement[]> => {
    const query = `
      [out:json][timeout:30];
      (
        node[~"tourism"~"attraction|museum|artwork|historic|viewpoint"](around:500,${lat},${lng});
        way[~"tourism"~"attraction|museum|artwork|historic|viewpoint"](around:500,${lat},${lng});
        relation[~"tourism"~"attraction|museum|artwork|historic|viewpoint"](around:500,${lat},${lng});
        node["historic"](around:500,${lat},${lng});
        way["historic"](around:500,${lat},${lng});
        relation["historic"](around:500,${lat},${lng});
      );
      out center;
    `;
    const endpoint = 'https://overpass-api.de/api/interpreter';

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status} - ${await response.text()}`);
    }

    const data: OverpassResponse = await response.json();
    return data.elements.filter(element => element.tags?.wikidata); // Filter for elements with wikidata tag
};

// interface WikidataLabelResponse {
//     entities: {
//         [key: string]: {  //  The key is the Wikidata ID (e.g., "Q1035742")
//             labels: {
//                 en?: {  //  Label in English (optional, but good to have)
//                     value: string;
//                 };
//                 [lang: string]: { value: string } | undefined; // Allow other languages
//             };
//             sitelinks: { // links to wikipedia
//                 enwiki?: {
//                     title: string;
//                 }
//                 [site: string]: any;
//             }
//         };
//     };
// }

interface Attraction {
    id: number;
    position: LatLngLiteral | undefined;
    name: string;
    wikidataId?: string; // Store the Wikidata ID
}

const transformOverpassData = (elements: OverpassElement[]): Attraction[] => {
    return elements.map(element => {
        let position: { latitude: number; longitude: number } | undefined;
        if (element.lat && element.lon) {
            position = { latitude: element.lat, longitude: element.lon };
        } else if (element.center) {
            position = { latitude: element.center.latitude, longitude: element.center.longitude };
        } else if (element.geometry && element.geometry.length > 0) {
            position = { latitude: element.geometry[0].latitude, longitude: element.geometry[0].longitude };
        }

        return {
            id: element.id,
            position,
            name: element.tags?.name || 'Attraction',
            wikidataId: element.tags?.wikidata, // Extract wikidata id
            opening_hours: element.tags?.opening_hours,
            website: element.tags?.website,
            isFree: element.tags?.fee === 'no',
            description: element.tags?.note,
        };
    });
};

// const fetchWikidataLabels = async (ids: string[]): Promise<WikidataLabelResponse> => {
//     if (ids.length === 0) {
//         return {entities: {}}; // Return empty if no ids
//     }
//     const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids.join('|')}&props=labels|sitelinks&languages=en&format=json`;
//     const response = await fetch(url);
//     if (!response.ok) {
//         throw new Error(`Wikidata API error: ${response.status} - ${await response.text()}`);
//     }
//     return await response.json();
// };

export function MapPlaceholder({userLocation, pois, activePoi, onRecenter, onSelectPoi}: MapPlaceholderProps) {
    const {data: attractions, error} = useQuery({
        queryKey: ['nearbyAttractions', userLocation?.lat, userLocation?.lng],
        queryFn: async () => {
            if (!userLocation) {
                throw new Error("User location is not available."); //Should never happen with enabled.
            }
            const overpassData = await fetchNearbyAttractions(userLocation);
            return transformOverpassData(overpassData);
        },
        enabled: !!userLocation, // Only run the query if userLocation is available
    });

    // const wikidataQuery = useQuery({
    //     queryKey: ['wikidataLabels', attractions?.map(a => a.wikidataId).filter((id): id is string => id != null)], // Filter out null/undefined ids
    //     queryFn: () => {
    //         const ids = attractions?.map(a => a.wikidataId).filter((id): id is string => id != null);
    //         return fetchWikidataLabels(ids);
    //     },
    //     enabled: !!attractions && attractions.some(a => a.wikidataId != null), // Only fetch if we have wikidata ids
    //     staleTime: Infinity, //  Don't refetch
    // });
    // const { data: wikidataLabels, error: wikidataError } = wikidataQuery;

    console.log(attractions, "attractions")
    // console.log(wikidataLabels, "wikidataLabels")


    const {isLoaded} = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    })
    console.log(userLocation, "userLocation")
    // const {language} = useLanguage()

    // const t = (key: string, params?: Record<string, string>) => translate(language, key, params)

    const [_, setMap] = useState<google.maps.Map | null>(null)

    const onLoad = useCallback(function callback(map: google.maps.Map) {
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
            center={userLocation || center}
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
            {/*// different type of mrke to add icon ?*/}
            <Marker
                position={userLocation || center}
                icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#4285F4",
                    fillOpacity: 1,
                    strokeColor: "#FFFFFF",
                    strokeWeight: 2,
                }}
            />
            <></>
        </GoogleMap>
    ) : (
        <></>
    )
}
