export interface BlogContent {
    id: string
    title: string
    subtitle: string
    location: string
    heroImage: string
    thumbnails: string[]
    sections: Array<{
        type: "text" | "image"
        content: string
    }>
}

export const blogData: BlogContent[] = [
    {
        id: "travel-tulga",
        title: "Tulga Travels",
        subtitle: "Mountains, friends, and slow mornings",
        location: "Tulga, Himachal Pradesh, India",
        heroImage: "/travel/t1.JPG",
        thumbnails: [
            "/travel/t1.JPG",
            "/travel/t2.JPG",
            "/travel/t3.JPG",
            "/travel/t4.JPG",
        ],
        sections: [
            {
                type: "text",
                content:
                    "Tulga was one of those trips that didn’t need a plan. I went there with my friends, carrying backpacks, playlists, and the shared intention of slowing down. The village welcomed us with quiet paths, wooden houses, and mountain air that felt lighter than everything we left behind.",
            },
            {
                type: "image",
                content: "/travel/t2.JPG",
            },
            {
                type: "text",
                content:
                    "We stayed at Zevibes Cafe & Homestay, and honestly, it felt like home away from home. Warm hosts, comforting food, and views that made mornings unreasonably beautiful. Evenings were spent talking, laughing, and doing absolutely nothing — which somehow felt perfect.",
            },
            {
                type: "image",
                content: "/travel/t3.JPG",
            },
            {
                type: "text",
                content:
                    "One of the highlights of the trip was visiting the waterfall near Pulga. The walk itself was an experience — muddy shoes, cold water splashes, and jokes that got funnier with every step. Standing near the waterfall, soaked and smiling, felt like a moment frozen in time.",
            },
            {
                type: "image",
                content: "/travel/t4.JPG",
            },
            {
                type: "text",
                content:
                    "Tulga reminded me that good trips aren’t about ticking places off a list. They’re about friends, shared silence, loud laughter, and places that don’t rush you. It was simple, peaceful, and exactly what we needed.",
            },
        ],
    },
    {
        id: "travel-dharamshala",
        title: "Dharamshala Diaries",
        subtitle: "Trek trails, cricket nights, and mountain streets",
        location: "Dharamshala, Himachal Pradesh, India",
        heroImage: "/travel/df1.JPG",
        thumbnails: [
            "/travel/df1.JPG",
            "/travel/df2.JPG",
            "/travel/df3.JPG",
            "/travel/df4.JPG",
        ],
        sections: [
            {
                type: "text",
                content:
                    "Dharamshala felt alive in a very different way. I visited with my friends, and the city instantly balanced calm mountain energy with an undercurrent of excitement. Cafes buzzing, streets full of travelers, and the mountains quietly watching over everything.",
            },
            {
                type: "image",
                content: "/travel/df2.JPG",
            },
            {
                type: "text",
                content:
                    "One of the most unforgettable parts of the trip was the Triund trek. The climb tested us — tired legs, frequent breaks, and constant motivation from each other. Reaching the top made every step worth it. The view felt unreal, like the clouds were closer than the ground.",
            },
            {
                type: "image",
                content: "/travel/df3.JPG",
            },
            {
                type: "text",
                content:
                    "Back in the city, we watched the India vs New Zealand final together. The atmosphere was electric — cheers, nervous silences, and that collective excitement you only get during big matches. It felt special sharing that moment in the mountains.",
            },
            {
                type: "image",
                content: "/travel/df4.JPG",
            },
            {
                type: "text",
                content:
                    "We ended our days wandering around Mall Road — street food, small shops, late-night walks, and endless conversations. Dharamshala was a mix of adventure and comfort, loud moments and quiet pauses, making it a trip that stayed with us long after we left.",
            },
        ],
    },
]