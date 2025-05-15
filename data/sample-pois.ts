import type { POI } from "@/types/poi"

export const samplePOIs: POI[] = [
  {
    id: "1",
    title: "Royal Castle",
    description:
      "The Royal Castle was originally built in the 13th century and served as the residence of Polish monarchs for centuries. It was completely destroyed during World War II and meticulously reconstructed between 1971-1984.",
    translations: {
      pl: {
        title: "Zamek Królewski",
        description:
          "Zamek Królewski został pierwotnie zbudowany w XIII wieku i służył jako rezydencja polskich monarchów przez stulecia. Został całkowicie zniszczony podczas II wojny światowej i pieczołowicie odbudowany w latach 1971-1984.",
      },
      de: {
        title: "Königsschloss",
        description:
          "Das Königsschloss wurde ursprünglich im 13. Jahrhundert erbaut und diente jahrhundertelang als Residenz der polnischen Monarchen. Es wurde während des Zweiten Weltkriegs vollständig zerstört und zwischen 1971 und 1984 akribisch rekonstruiert.",
      },
    },
    latitude: 52.2478,
    longitude: 21.0155,
    iconUrl: "/icons/castle.png",
  },
  {
    id: "2",
    title: "Old Town Square",
    description:
      "The historic Old Town Square dates back to the 13th century and is one of the most picturesque urban spaces in Europe. It features colorful townhouses, outdoor cafes, and the famous mermaid statue, a symbol of the city.",
    translations: {
      pl: {
        title: "Rynek Starego Miasta",
        description:
          "Zabytkowy Rynek Starego Miasta pochodzi z XIII wieku i jest jedną z najbardziej malowniczych przestrzeni miejskich w Europie. Znajdują się tu kolorowe kamienice, kawiarnie na świeżym powietrzu i słynny posąg syrenki, symbol miasta.",
      },
      de: {
        title: "Altstädter Marktplatz",
        description:
          "Der historische Altstädter Marktplatz stammt aus dem 13. Jahrhundert und ist einer der malerischsten städtischen Räume Europas. Er zeichnet sich durch bunte Bürgerhäuser, Straßencafés und die berühmte Meerjungfrauenstatue aus, ein Symbol der Stadt.",
      },
    },
    latitude: 52.2495,
    longitude: 21.0122,
    iconUrl: "/icons/landmark.png",
  },
  {
    id: "3",
    title: "National Museum",
    description:
      "The National Museum houses an extensive collection of art spanning from ancient times to the present day. It includes famous works by Polish and international artists, as well as archaeological artifacts from around the world.",
    translations: {
      pl: {
        title: "Muzeum Narodowe",
        description:
          "Muzeum Narodowe posiada obszerną kolekcję sztuki od czasów starożytnych do współczesności. Obejmuje słynne dzieła polskich i międzynarodowych artystów, a także artefakty archeologiczne z całego świata.",
      },
      de: {
        title: "Nationalmuseum",
        description:
          "Das Nationalmuseum beherbergt eine umfangreiche Kunstsammlung von der Antike bis zur Gegenwart. Es umfasst berühmte Werke polnischer und internationaler Künstler sowie archäologische Artefakte aus der ganzen Welt.",
      },
    },
    latitude: 52.2322,
    longitude: 21.0258,
    iconUrl: "/icons/museum.png",
  },
  {
    id: "4",
    title: "Modern Art Gallery",
    description:
      "This contemporary art space showcases cutting-edge works by both established and emerging artists. The building itself is an architectural marvel, designed to maximize natural light and create unique exhibition spaces.",
    translations: {
      pl: {
        title: "Galeria Sztuki Nowoczesnej",
        description:
          "Ta współczesna przestrzeń artystyczna prezentuje nowatorskie prace zarówno uznanych, jak i wschodzących artystów. Sam budynek jest architektonicznym cudem, zaprojektowanym tak, aby maksymalnie wykorzystać naturalne światło i stworzyć unikalne przestrzenie wystawowe.",
      },
      de: {
        title: "Galerie für Moderne Kunst",
        description:
          "Dieser zeitgenössische Kunstraum präsentiert bahnbrechende Werke sowohl etablierter als auch aufstrebender Künstler. Das Gebäude selbst ist ein architektonisches Wunderwerk, das so konzipiert ist, dass es natürliches Licht maximiert und einzigartige Ausstellungsräume schafft.",
      },
    },
    latitude: 52.2401,
    longitude: 21.0299,
    iconUrl: "/icons/art.png",
  },
  {
    id: "5",
    title: "City Park",
    description:
      "This expansive urban park was established in the 19th century and features beautiful landscaped gardens, walking paths, and a central lake. It serves as a green oasis in the heart of the city and hosts various cultural events throughout the year.",
    translations: {
      pl: {
        title: "Park Miejski",
        description:
          "Ten rozległy park miejski został założony w XIX wieku i charakteryzuje się pięknymi ogrodami krajobrazowymi, ścieżkami spacerowymi i centralnym jeziorem. Służy jako zielona oaza w sercu miasta i jest gospodarzem różnych wydarzeń kulturalnych przez cały rok.",
      },
      de: {
        title: "Stadtpark",
        description:
          "Dieser weitläufige Stadtpark wurde im 19. Jahrhundert angelegt und verfügt über wunderschön angelegte Gärten, Spazierwege und einen zentralen See. Er dient als grüne Oase im Herzen der Stadt und ist das ganze Jahr über Gastgeber verschiedener kultureller Veranstaltungen.",
      },
    },
    latitude: 52.2368,
    longitude: 21.0187,
    iconUrl: "/icons/park.png",
  },
]
