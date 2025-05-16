"use client"

import {useState, useEffect, useRef} from "react"
import {MapPlaceholder} from "@/components/map-placeholder"
import {NarrationPanel} from "@/components/narration-panel"
import {POINotification} from "@/components/poi-notification"
import {useGeolocation} from "@/hooks/use-geolocation"
import {useProximity} from "@/hooks/use-proximity"
import {useSpeech} from "@/hooks/use-speech"
import {useToast} from "@/hooks/use-toast"
import {useMobile} from "@/hooks/use-mobile"
import {Settings} from "@/components/settings"
import {Button} from "@/components/ui/button"
import {Menu, Locate} from "lucide-react"
import type {POI} from "@/types/poi"
import {samplePOIs} from "@/data/sample-pois"
import {translate} from "@/utils/translations"
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {useLanguage} from "@/providers/providers";
import {POIDetailsDrawer} from "@/components/poi-details-drawer";
// For demo purposes, let's add a function to simulate location changes
// const simulateLocationChange = (currentLocation: { latitude: number; longitude: number } | null, poiIndex: number) => {
//     if (!currentLocation) return null
//
//     // Move closer to the POI with the given index
//     const targetPoi = samplePOIs[poiIndex]
//
//     // Calculate a position 40m away from the POI (within the 50m trigger radius)
//     const direction = Math.random() * Math.PI * 2 // Random direction
//     const distance = 0.00036 // Roughly 40 meters in degrees
//
//     return {
//         latitude: targetPoi.latitude + Math.sin(direction) * distance,
//         longitude: targetPoi.longitude + Math.cos(direction) * distance,
//         accuracy: 10,
//     }
// }


// Get the POI description in the correct language
const getLocalizedDescription = (narrationLanguage: "en" | "pl" | "de", poi: POI) => {
    if (narrationLanguage === "pl" && poi.translations.pl) {
        return poi.translations.pl.description
    } else if (narrationLanguage === "de" && poi.translations.de) {
        return poi.translations.de.description
    }
    return poi.description
}

export function AudioGuide() {
    const {toast} = useToast()
    const isMobile = useMobile()
    const [pois, setPois] = useState<POI[]>(samplePOIs)
    const [activePoi, setActivePoi] = useState<POI | null>(samplePOIs[0]) // Default to first POI for demo
    const [pendingPoi, setPendingPoi] = useState<POI | null>(null)
    const [isNarrating, setIsNarrating] = useState(false)
    const [status, setStatus] = useState<"idle" | "listening" | "narrating" | "paused">("listening")
    const [isEnabled, setIsEnabled] = useState(true)
    const lastNarratedPoiRef = useRef<string | null>(null)
    const {language} = useLanguage()

    const t = (key: string, params?: Record<string, string>) => translate(language, key, params)

    // Use either the real location or the simulated one
    const {location, error: locationError} = useGeolocation()

    const {
        startNarration,
        stopNarration,
        voices,
        isAvailable,
        selectedVoice,
        onVoiceChange,
        speechRate,
        onSpeechRateChange,
        narrationLanguage,
    } = useSpeech()
    const [selectedPoi, setSelectedPoi] = useState(null)

    const {nearbyPoi} = useProximity(location, pois, 50)


    // Handle location errors
    useEffect(() => {
        if (locationError) {
            toast({
                title: t("errors.location"),
                description: locationError.message,
                variant: "destructive",
            })
        }
    }, [locationError, toast, language])

    // Handle speech availability
    useEffect(() => {
        if (!isAvailable) {
            toast({
                title: t("errors.speech"),
                description: t("errors.speechDesc"),
                variant: "destructive",
            })
        }
    }, [isAvailable, toast, language])

    // Handle POI proximity and notification
    useEffect(() => {
        if (!isEnabled || !nearbyPoi || !isAvailable) {
            return
        }

        // If we're already narrating this POI, do nothing
        if (nearbyPoi.id === lastNarratedPoiRef.current && status !== "paused") {
            return
        }

        // If we're already showing this POI, do nothing
        if (activePoi && nearbyPoi.id === activePoi.id) {
            return
        }

        // If we're narrating something else, show notification for the new POI
        if (isNarrating || activePoi) {
            setPendingPoi(nearbyPoi)
            return
        }

        // Otherwise, automatically set the active POI and start narration
        setActivePoi(nearbyPoi)
        setStatus("narrating")
        setIsNarrating(true)

        const localizedDescription = getLocalizedDescription(narrationLanguage, nearbyPoi)

        startNarration(localizedDescription, {
            onEnd: () => {
                setIsNarrating(false)
                setStatus("listening")
            },
            rate: speechRate,
        })

        lastNarratedPoiRef.current = nearbyPoi.id
    }, [nearbyPoi, isEnabled, isAvailable, startNarration, status, activePoi, isNarrating, speechRate, narrationLanguage])

    const handleToggleNarration = () => {
        if (isNarrating) {
            stopNarration()
            setIsNarrating(false)
            setStatus("paused")
        } else if (activePoi) {
            // Use the localized description for narration
            const localizedDescription = getLocalizedDescription(narrationLanguage, activePoi)

            startNarration(localizedDescription, {
                onEnd: () => {
                    setIsNarrating(false)
                    setStatus("listening")
                },
                rate: speechRate,
            })
            setIsNarrating(true)
            setStatus("narrating")
        }
    }

    const handleReplayNarration = () => {
        if (activePoi) {
            stopNarration()

            // Use the localized description for narration
            const localizedDescription = getLocalizedDescription(narrationLanguage, activePoi)

            startNarration(localizedDescription, {
                onEnd: () => {
                    setIsNarrating(false)
                    setStatus("listening")
                },
                rate: speechRate,
            })
            setIsNarrating(true)
            setStatus("narrating")
        }
    }

    const handleToggleEnabled = (enabled: boolean) => {
        setIsEnabled(enabled)
        if (!enabled) {
            stopNarration()
            setStatus("idle")
        } else {
            setStatus("listening")
        }
    }
    console.log("selectedPoi", selectedPoi)
    return (
        <div className="relative flex flex-col h-screen w-full overflow-hidden">
            <Drawer>
                <DrawerTrigger
                    className="h-10 w-10 rounded-full absolute bottom-[9.8rem] right-4 z-10 bg-primary text-white flex items-center justify-center">
                    <Menu className="h-5 w-5"/>
                    <span className="sr-only">Open Setting Menu</span>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerTitle className="sr-only"></DrawerTitle>
                    <Settings
                        isEnabled={isEnabled}
                        onToggleEnabled={handleToggleEnabled}
                        voices={voices}
                        selectedVoice={selectedVoice}
                        onVoiceChange={onVoiceChange}
                        speechRate={speechRate}
                        onSpeechRateChange={onSpeechRateChange}
                        narrationLanguage={narrationLanguage}
                    />
                    <DrawerFooter>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
            {/*    }*/}
            {/*/>*/}

            <div className="flex-1 relative">
                <MapPlaceholder
                    userLocation={{
                        lat: 51.481583,
                        lng: -3.179090
                    }}
                    // userLocation={location}
                    selectedPoi={selectedPoi}
                    // activePoi={activePoi}
                    // onRecenter={() => {
                    //     toast({
                    //         title: t("map.centered"),
                    //         description: t("map.centeredDesc"),
                    //     })
                    // }}
                    onSelectPoi={setSelectedPoi}
                />

                <Button
                    className="absolute bottom-5 left-4 rounded-full shadow-lg z-10"
                    onClick={() => {
                        toast({
                            title: t("map.centered"),
                            description: t("map.centeredDesc"),
                        })
                    }}
                    size="icon"
                    aria-label={t("map.centered")}
                >
                    <Locate className="h-5 w-5"/>
                    <span className="sr-only">{t("map.centered")}</span>
                </Button>
            </div>

            {/* POI Notification for new nearby POIs */}
            {/*<POINotification*/}
            {/*    poi={pendingPoi}*/}
            {/*    onPlay={handlePlayPendingPoi}*/}
            {/*    onDismiss={handleDismissPendingPoi}*/}
            {/*    narrationLanguage={narrationLanguage}*/}
            {/*/>*/}

            <POIDetailsDrawer poi={selectedPoi} onPlay={setActivePoi} onClose={() => setSelectedPoi(null)}
                              narrationLanguage={narrationLanguage}/>

            {/* Always show the narration panel with the active POI or the first POI as fallback */}
            {activePoi && (
                <NarrationPanel
                    poi={activePoi}
                    isNarrating={isNarrating}
                    onToggleNarration={handleToggleNarration}
                    onReplayNarration={handleReplayNarration}
                    narrationLanguage={narrationLanguage}
                />
            )}
        </div>
    )
}
