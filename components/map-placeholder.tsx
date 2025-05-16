"use client"

import React, {useState} from "react"
import type {POI} from "@/types/poi"
import type {Coordinates} from "@/types/coordinates"
import LatLngLiteral = google.maps.LatLngLiteral;
import {AdvancedMarker, APIProvider, Map} from '@vis.gl/react-google-maps';
import {Landmark, Castle, LibraryIcon as Museum, ParkingSquare, ImageIcon, Pin} from "lucide-react"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";

const containerStyle = {
    width: '100%',
    height: '100%',
}

const center = {
    lat: -3.745,
    lng: -38.523,
}

const getPoiIcon = (name: string): React.ReactNode => {

    const includes = (name: string) => name.toLowerCase().includes;

    if (includes("museum")) return <Museum className="w-8 h-8"/>
    if (includes("landmark")) return <Landmark className="w-8 h-8"/>
    if (includes("park")) return <ParkingSquare className="w-8 h-8"/>
    if (includes("gallery")) return <ImageIcon className="w-8 h-8"/>
    if (includes("castle")) return <Castle className="w-8 h-8"/>
    return <Pin className="w-8 h-8"/>
}

interface MapPlaceholderProps {
    userLocation: Coordinates | null
    selectedPoi: POI | null
    onSelectPoi: (poi: POI) => void
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
// const fetchNearbyAttractions = async ({ lat, lng }: LatLngLiteral): Promise<OverpassElement[]> => {
//     const query = `
//       [out:json][timeout:30];
//       (
//         node[~"tourism"~"attraction|museum|artwork|historic|viewpoint"](around:500,${lat},${lng});
//         way[~"tourism"~"attraction|museum|artwork|historic|viewpoint"](around:500,${lat},${lng});
//         relation[~"tourism"~"attraction|museum|artwork|historic|viewpoint"](around:500,${lat},${lng});
//         node["historic"](around:500,${lat},${lng});
//         way["historic"](around:500,${lat},${lng});
//         relation["historic"](around:500,${lat},${lng});
//       );
//       out center;
//     `;
//     const endpoint = 'https://overpass-api.de/api/interpreter';
//
//     const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: `data=${encodeURIComponent(query)}`,
//     });
//
//     if (!response.ok) {
//         throw new Error(`Overpass API error: ${response.status} - ${await response.text()}`);
//     }
//
//     const data: OverpassResponse = await response.json();
//     return data.elements.filter(element => element.tags?.wikidata); // Filter for elements with wikidata tag
// };

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
    opening_hours?: string;
    website?: string;
    isFree?: boolean;
    description?: string;
}

// const transformOverpassData = (elements: OverpassElement[]): Attraction[] => {
//     return elements.map(element => {
//         let position: { latitude: number; longitude: number } | undefined;
//         if (element.lat && element.lon) {
//             position = { latitude: element.lat, longitude: element.lon };
//         } else if (element.center) {
//             position = { latitude: element.center.latitude, longitude: element.center.longitude };
//         } else if (element.geometry && element.geometry.length > 0) {
//             position = { latitude: element.geometry[0].latitude, longitude: element.geometry[0].longitude };
//         }
//
//         return {
//             id: element.id,
//             position,
//             name: element.tags?.name || 'Attraction',
//             wikidataId: element.tags?.wikidata, // Extract wikidata id
//             opening_hours: element.tags?.opening_hours,
//             website: element.tags?.website,
//             isFree: element.tags?.fee === 'no',
//             description: element.tags?.note,
//         };
//     });
// };

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

const attractions = [
    {
        id: 1050445085,
        position: {
            latitude: 51.4816219,
            longitude: -3.178546
        },
        name: "Aneurin Bevan",
        wikidataId: "Q110379202",
        isFree: false
    }
]

export function MapPlaceholder({userLocation, selectedPoi, onSelectPoi}: MapPlaceholderProps) {
    // const {data: attractions, error} = useQuery({
    //     queryKey: ['nearbyAttractions', userLocation?.lat, userLocation?.lng],
    //     queryFn: async () => {
    //         if (!userLocation) {
    //             throw new Error("User location is not available."); //Should never happen with enabled.
    //         }
    //         const overpassData = await fetchNearbyAttractions(userLocation);
    //         return transformOverpassData(overpassData);
    //     },
    //     enabled: !!userLocation, // Only run the query if userLocation is available
    // });

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

    // const {language} = useLanguage()

    // const t = (key: string, params?: Record<string, string>) => translate(language, key, params)

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
            <Map
                mapId="google-map"
                style={{width: '100%', height: '100%'}}
                defaultCenter={userLocation || center}
                defaultZoom={18}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
            />
            {attractions && attractions.map(poi => (
                <AdvancedMarker onClick={() => onSelectPoi(poi)} title={poi.name} key={poi.id} position={{
                    lat: poi.position?.latitude,
                    lng: poi.position?.longitude
                }}>
                    <div
                        className={`w-12 h-12 ${poi.isFree ? "bg-green-500" : "bg-orange-500"} flex items-center justify-center text-white rounded-md`}
                    >
                        {getPoiIcon(poi.name)}
                    </div>
                </AdvancedMarker>
            ))}
        </APIProvider>
    )
}
