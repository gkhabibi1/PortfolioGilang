// Data Portofolio Gilang Habib Azky Pratama

const portfolioItems = [
    // --- WEBSITE DEVELOPMENT ---
    {
        id: "vietnam-destination-web",
        title: "Vietnam Destination Travel Portal",
        category: "website",
        categoryName: "Website Development",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Dekstop%20Vietnam_11zon.jpg",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Dekstop%20Vietnam_11zon.jpg",
        shortDesc: "Interactive destination portal with rich visual experiences and smooth responsive layout.",
        fullDesc: "Website portal destinasi wisata Vietnam yang mengkombinasikan estetika visual immersive dengan navigasi intuitif. Dibuat dengan optimasi performa tinggi, animasi smooth, serta integrasi pemesanan paket tur wisata secara real-time.",
        client: "Vietnam Tourism Board / Private Project",
        year: "2024",
        tools: ["HTML5", "CSS3", "JavaScript", "Tailwind CSS", "AOS Library"],
        liveUrl: "https://gilang-portofolio.vercel.app/Promo-Website-UMKM.html",
        featured: true
    },
    {
        id: "company-profile-platform",
        title: "Modern Company Profile & Platform",
        category: "website",
        categoryName: "Website Development",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Screenshot_12.png",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Screenshot_12.png",
        shortDesc: "Corporate platform designed for high conversion, professional branding, and speed.",
        fullDesc: "Pengembangan website profil perusahaan modern yang berfokus pada corporate branding, tata letak yang bersih, loading super cepat, serta integrasi Meta Pixel & Analytics untuk memaksimalkan konversi bisnis.",
        client: "Corporate Agency",
        year: "2024",
        tools: ["Tailwind CSS", "JavaScript", "Meta CAPI Integration"],
        liveUrl: "#",
        featured: true
    },
    {
        id: "creative-web-dashboard",
        title: "Creative Web & Analytics Dashboard",
        category: "website",
        categoryName: "Website Development",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Screenshot_13.png",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Screenshot_13.png",
        shortDesc: "Interactive web interface featuring sleek dark mode aesthetics and data visuals.",
        fullDesc: "Antarmuka aplikasi web dinamis berkonsep dark aesthetic yang dikembangkan untuk penyajian data statistik, kontrol user, serta navigasi yang responsif di seluruh perangkat mobile & desktop.",
        client: "Creative Digital Studio",
        year: "2024",
        tools: ["HTML5", "JavaScript", "Chart.js", "Vanilla CSS"],
        liveUrl: "#",
        featured: false
    },
    {
        id: "modern-web-portal",
        title: "SaaS & Modern Web Portal",
        category: "website",
        categoryName: "Website Development",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Screenshot_9.png",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Screenshot_9.png",
        shortDesc: "High-performance SaaS landing page engineered for fast user onboarding.",
        fullDesc: "Landing page modern khusus SaaS yang dirancang untuk mempercepat akuisisi pengguna. Dilengkapi section fitur interaktif, simulasi kalkulator, dan form registrasi cepat.",
        client: "SaaS Startup",
        year: "2023",
        tools: ["Tailwind CSS", "JavaScript", "Swiper.js"],
        liveUrl: "#",
        featured: false
    },
    {
        id: "ecommerce-service-web",
        title: "E-Commerce & Service Web",
        category: "website",
        categoryName: "Website Development",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Screenshot_11.png",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Screenshot_11.png",
        shortDesc: "Conversion-focused landing page for UMKM service package promotions.",
        fullDesc: "Halaman penawaran khusus UMKM dengan sistem checkout langsung via WhatsApp, tabel perbandingan paket harga, testimoni interaktif, dan integrasi iklan digital.",
        client: "UMKM Promotion Project",
        year: "2024",
        tools: ["HTML5", "Tailwind CSS", "JavaScript"],
        liveUrl: "Promo-Website-UMKM.html",
        featured: true
    },

    // --- UI/UX DESIGN ---
    {
        id: "modern-web-application-ui",
        title: "Modern Web Application UI",
        category: "uiux",
        categoryName: "UI/UX Design",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Screenshot_12.png",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Screenshot_12.png",
        shortDesc: "User-centric layout focusing on typography, whitespace, and visual accessibility.",
        fullDesc: "Perancangan UI/UX aplikasi web modern dengan riset pengalaman pengguna secara mendalam. Menyoroti hierarki visual yang jelas, komponen UI reusable, serta standar aksesibilitas kontras warna.",
        client: "Fintech App Concept",
        year: "2024",
        tools: ["Figma", "Design System", "Prototyping"],
        liveUrl: "#",
        featured: true
    },
    {
        id: "landing-page-layouts",
        title: "Landing Page Layouts Design",
        category: "uiux",
        categoryName: "UI/UX Design",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Dekstop%20Vietnam_11zon.jpg",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Dekstop%20Vietnam_11zon.jpg",
        shortDesc: "High-converting landing page prototype crafted with Figma.",
        fullDesc: "Desain wireframe hingga high-fidelity prototype landing page promo destinasi & layanan digital. Dirancang dengan prinsip AIDA (Attention, Interest, Desire, Action) untuk efektivitas pemasaran.",
        client: "Global Agency",
        year: "2024",
        tools: ["Figma", "Auto Layout", "Design Tokens"],
        liveUrl: "#",
        featured: false
    },

    // --- VIDEO CLIPPING & SHORT FORM ---
    {
        id: "viral-affiliate-clips",
        title: "Viral Affiliate Short Clips",
        category: "clipping",
        categoryName: "Video Clipping",
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
        videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        mediaUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
        shortDesc: "High-retention hooks and fast-paced clipping to maximize TikTok & Reels conversions.",
        fullDesc: "Editing konten pendek berdurasi 15-60 detik yang difokuskan pada 3 detik pertama (hook), caption dinamis beranimasi, efek suara emosional, serta teknik pemotongan presisi tinggi untuk mendorong viralitas di TikTok & Reels.",
        client: "Affiliate Brand Partner",
        year: "2024",
        tools: ["CapCut Pro", "Premiere Pro", "Subtitles Animation"],
        liveUrl: "#",
        featured: true
    },
    {
        id: "podcast-highlights",
        title: "Podcast Shorts & Reels Highlights",
        category: "clipping",
        categoryName: "Video Clipping",
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1000&auto=format&fit=crop",
        videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        mediaUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1000&auto=format&fit=crop",
        shortDesc: "Extracting the most engaging 60 seconds from long-form podcast conversations.",
        fullDesc: "Mengekstrak momen paling bernilai dan emosional dari podcast durasi panjang menjadi video pendek vertikal berdaya tarik tinggi lengkap dengan auto-caption berwarna dan grafik pendukung.",
        client: "Creator Channel",
        year: "2024",
        tools: ["Premiere Pro", "After Effects", "Descript"],
        liveUrl: "#",
        featured: false
    },
    {
        id: "product-teasers",
        title: "Product Teasers & Trend Cuts",
        category: "clipping",
        categoryName: "Video Clipping",
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1000&auto=format&fit=crop",
        videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        mediaUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1000&auto=format&fit=crop",
        shortDesc: "Snappy cuts with trending audio for brand awareness campaigns.",
        fullDesc: "Pembuatan teaser produk berenergi tinggi yang memanfaatkan tren audio terkini, transisi cepat, serta sound design modern untuk kampanye brand awareness di Instagram Reels & Shorts.",
        client: "E-Commerce Brand",
        year: "2024",
        tools: ["CapCut", "After Effects"],
        liveUrl: "#",
        featured: false
    },

    // --- VIDEO EDITING ---
    {
        id: "stie-surakarta-events",
        title: "STIE Surakarta Event Highlights",
        category: "video",
        categoryName: "Video Editing",
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000&auto=format&fit=crop",
        videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        mediaUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000&auto=format&fit=crop",
        shortDesc: "Full-scale editing involving multi-cam sync, color grading, and cinematic music.",
        fullDesc: "Dokumentasi & rekap acara kampus STIE Surakarta dengan teknik pengeditan cinematic, penyesuaian warna (color grading), sinkronisasi multi-kamera, serta desain tata suara yang megah.",
        client: "STIE Surakarta",
        year: "2023",
        tools: ["Adobe Premiere Pro", "DaVinci Resolve", "After Effects"],
        liveUrl: "#",
        featured: true
    },
    {
        id: "youtube-vlogs-tech",
        title: "YouTube Vlogs & Tech Commercials",
        category: "video",
        categoryName: "Video Editing",
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1000&auto=format&fit=crop",
        videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        mediaUrl: "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1000&auto=format&fit=crop",
        shortDesc: "Engaging long-form pacing, lower thirds, and motion B-roll integration.",
        fullDesc: "Editing video YouTube berdurasi 10-20 menit yang menjaga audience retention tetap tinggi melalui lower thirds kustom, sound effect yang tepat, penyesuaian ritme cerita, dan efek transisi seamless.",
        client: "Tech Creator",
        year: "2024",
        tools: ["Premiere Pro", "After Effects", "Audition"],
        liveUrl: "#",
        featured: false
    },

    // --- GRAPHIC DESIGN ---
    {
        id: "social-media-carousels",
        title: "Social Media Carousels & Content Design",
        category: "graphic",
        categoryName: "Graphic Design",
        type: "image",
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
        mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
        shortDesc: "High-engagement educational posts for Instagram & LinkedIn.",
        fullDesc: "Desain konten micro-blog carousel berestetika tinggi untuk edukasi audiens di Instagram & LinkedIn. Dirancang dengan layout konsisten, ilustrasi vektor kustom, serta pengarahan visual brand.",
        client: "Digital Education Platform",
        year: "2024",
        tools: ["Figma", "Canva Pro", "Photoshop"],
        liveUrl: "#",
        featured: true
    },
    {
        id: "event-posters-acfion",
        title: "ACFION Event Posters & Flyers",
        category: "graphic",
        categoryName: "Graphic Design",
        type: "image",
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop",
        mediaUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop",
        shortDesc: "Print and digital flyers designed for maximum click-through rates.",
        fullDesc: "Perancangan poster promosi acara ACFION baik untuk kebutuhan cetak (flyer/banner) maupun publikasi digital media sosial dengan dampak visual yang tebal dan mudah dipahami.",
        client: "ACFION Event Committee",
        year: "2023",
        tools: ["Photoshop", "Illustrator", "Canva"],
        liveUrl: "#",
        featured: false
    }
];

// Helper functions for portfolio query
function getPortfolioById(id) {
    return portfolioItems.find(item => item.id === id) || portfolioItems[0];
}

function getPortfolioByCategory(cat) {
    if (!cat || cat === 'all') return portfolioItems;
    return portfolioItems.filter(item => item.category === cat);
}
