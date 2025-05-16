"use client"

import {Globe, Clock, Phone, MapPin, X, Play, DollarSign, Menu} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Separator} from "@/components/ui/separator"
import type {POI} from "@/types/poi"
import {translate} from "@/utils/translations"
import {useLanguage} from "@/providers/providers";
import {Drawer, DrawerContent, DrawerFooter, DrawerTitle, DrawerTrigger} from "@/components/ui/drawer";

interface POIDetailsDrawerProps {
    poi: POI | null
    onPlay: (poi: POI) => void
    onClose: () => void
    narrationLanguage: "en" | "pl" | "de"
    poiDetailsMap: Record<string, POI>
}

export function POIDetailsDrawer({poi, onPlay, onClose, narrationLanguage, poiDetailsMap}: POIDetailsDrawerProps) {
    // const { language } = useLanguage()
    // const [isVisible, setIsVisible] = useState(false)
    // const [details, setDetails] = useState< null>(null)

    // const t = (key: string, params?: Record<string, string>) => translate(language, key, params)

    return (
        <Drawer>
            <DrawerTrigger
                className="h-10 w-10 rounded-full absolute bottom-[9.8rem] right-4 z-10 bg-primary text-white flex items-center justify-center">
                <Menu className="h-5 w-5"/>
                <span className="sr-only">????</span>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerTitle className="sr-only">title</DrawerTitle>
                hello
                <DrawerFooter>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
