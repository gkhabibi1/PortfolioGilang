// Data Portofolio & Internationalization (ID / EN) Gilang Habib Azky Pratama

let currentLanguage = localStorage.getItem('gilang_portfolio_lang') || 'id';

function setLanguage(lang) {
    if (lang === 'id' || lang === 'en') {
        currentLanguage = lang;
        localStorage.setItem('gilang_portfolio_lang', lang);
    }
}

function getLanguage() {
    return currentLanguage;
}

const translations = {
    id: {
        navAbout: "Tentang Saya",
        navPortfolio: "Portofolio",
        navArsenal: "Skills & Tools",
        navServices: "Layanan",
        navTalk: "LET'S TALK",
        heroBadge: "Tersedia untuk Proyek & Freelance",
        heroTitle1: "DIGITAL",
        heroTitle2: "CREATOR",
        heroBio: "Halo, Saya <strong class=\"text-white font-semibold\">Gilang Habib Azky Pratama H.P.</strong> Berbasis di Solo, Indonesia. Saya menggabungkan keahlian <span class=\"text-agency-neon font-medium\">Web Development</span> & <span class=\"text-agency-neon font-medium\">Content Creation</span> untuk menghasilkan karya digital berkualitas tinggi.",
        heroBtnExplore: "JELAJAHI PORTOFOLIO",
        heroBtnContact: "Hubungi Langsung",
        portfolioSectionTitle: "KARYA <span class=\"text-agency-neon\">PORTOFOLIO</span>",
        portfolioSectionSubtitle: "Koleksi proyek pilihan dalam Web Development, UI/UX Design, Video Editing, Graphic Design, dan Video Short Clipping. Klik karya untuk melihat detail & narasi storytelling lengkap.",
        portfolioInfo: "Klik karya untuk membuka Lightbox / Halaman Baru",
        catAll: "Semua Karya",
        catWeb: "💻 Website Dev",
        catUiux: "🎨 UI/UX Design",
        catVideo: "🎬 Video Editing",
        catClipping: "📱 Short Clips",
        catGraphic: "🖼️ Graphic Design",
        featuredTitle: "FEATURED WEB PROJECTS",
        featuredSubtitle: "Dari landing page UMKM hingga platform aplikasi web modern berkinerja tinggi.",
        btnOpenDetail: "Buka Detail",
        arsenalTitle: "MY ARSENAL & TOOLS",
        arsenalSubtitle: "Perangkat lunak dan teknologi utama yang saya gunakan setiap hari.",
        footerHeading: "LET'S CREATE SOMETHING EXTRAORDINARY.",
        footerSubtitle: "Punya ide proyek menarik atau ingin konsultasi kebutuhan pembuatan website & konten video?",
        footerBtnStart: "START A PROJECT (WHATSAPP)",
        footerRights: "© 2026 Gilang Habib Azky Pratama H.P. Hak cipta dilindungi.",
        quickPreview: "Quick Preview",
        detailPageBtn: "Detail Halaman",
        modalOpenDetail: "Buka Halaman Detail",
        modalLiveSite: "Lihat Live Site",
        detailBackHome: "Kembali ke Beranda",
        detailContactMe: "Hubungi Saya",
        detailAboutProject: "Tentang Proyek Ini",
        detailLiveWebsite: "Buka Live Website",
        detailWantLive: "Ingin Lihat Hasil Langsung?",
        detailLiveDesc: "Kunjungi demo langsung / link live project dari karya ini.",
        detailSoftwareStack: "SOFTWARE / SOFTWARE STACK",
        detailCategoryLabel: "KATEGORI KARYA",
        detailClientLabel: "KLIEN / PROYEK",
        detailShareBtn: "Bagikan Karya Ini",
        detailOtherTitle: "Karya Lainnya",
        detailOtherSub: "Lihat hasil karya menarik lainnya dari Gilang.",
        detailSeeAll: "Lihat Semua Karya"
    },
    en: {
        navAbout: "About Me",
        navPortfolio: "Portfolio",
        navArsenal: "Skills & Tools",
        navServices: "Services",
        navTalk: "LET'S TALK",
        heroBadge: "Available for Projects & Freelance",
        heroTitle1: "DIGITAL",
        heroTitle2: "CREATOR",
        heroBio: "Hello, I'm <strong class=\"text-white font-semibold\">Gilang Habib Azky Pratama H.P.</strong> Based in Solo, Indonesia. I combine <span class=\"text-agency-neon font-medium\">Web Development</span> & <span class=\"text-agency-neon font-medium\">Content Creation</span> to craft high-impact digital experiences.",
        heroBtnExplore: "EXPLORE PORTFOLIO",
        heroBtnContact: "Contact Directly",
        portfolioSectionTitle: "PORTFOLIO <span class=\"text-agency-neon\">WORKS</span>",
        portfolioSectionSubtitle: "A curated showcase of Web Development, UI/UX Design, Video Editing, Graphic Design, and Short Clips. Click any project card to explore full media & storytelling details.",
        portfolioInfo: "Click project card to open Lightbox / Detailed Page",
        catAll: "All Works",
        catWeb: "💻 Website Dev",
        catUiux: "🎨 UI/UX Design",
        catVideo: "🎬 Video Editing",
        catClipping: "📱 Short Clips",
        catGraphic: "🖼️ Graphic Design",
        featuredTitle: "FEATURED WEB PROJECTS",
        featuredSubtitle: "From high-converting SMB landing pages to robust corporate web applications.",
        btnOpenDetail: "View Details",
        arsenalTitle: "MY ARSENAL & TOOLS",
        arsenalSubtitle: "Primary software and modern tech stack I utilize every day.",
        footerHeading: "LET'S CREATE SOMETHING EXTRAORDINARY.",
        footerSubtitle: "Have an exciting project idea or need consultation for web development & video production?",
        footerBtnStart: "START A PROJECT (WHATSAPP)",
        footerRights: "© 2026 Gilang Habib Azky Pratama H.P. All rights reserved.",
        quickPreview: "Quick Preview",
        detailPageBtn: "View Page Detail",
        modalOpenDetail: "Open Detail Page",
        modalLiveSite: "View Live Site",
        detailBackHome: "Back to Home",
        detailContactMe: "Contact Me",
        detailAboutProject: "About This Project",
        detailLiveWebsite: "Open Live Website",
        detailWantLive: "Want to see it live?",
        detailLiveDesc: "Visit the live demo or project link for this work.",
        detailSoftwareStack: "SOFTWARE / SOFTWARE STACK",
        detailCategoryLabel: "PROJECT CATEGORY",
        detailClientLabel: "CLIENT / PROJECT",
        detailShareBtn: "Share This Project",
        detailOtherTitle: "Other Works",
        detailOtherSub: "Explore more creative & technical projects by Gilang.",
        detailSeeAll: "View All Works"
    }
};

const categoryNames = {
    website: { id: "Website Development", en: "Website Development" },
    uiux: { id: "UI/UX Design", en: "UI/UX Design" },
    video: { id: "Video Editing", en: "Video Editing" },
    clipping: { id: "Video Clipping", en: "Video Clipping" },
    graphic: { id: "Graphic Design", en: "Graphic Design" }
};

const portfolioItems = [
    // --- WEBSITE DEVELOPMENT ---
    {
        id: "vietnam-destination-web",
        title: { id: "Vietnam Destination Travel Portal", en: "Vietnam Destination Travel Portal" },
        category: "website",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Dekstop%20Vietnam_11zon.jpg",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Dekstop%20Vietnam_11zon.jpg",
        shortDesc: {
            id: "Portal destinasi interaktif dengan visual menawan, navigasi halus, dan integrasi pemesanan tur real-time.",
            en: "Interactive destination portal featuring rich visual experiences, smooth layout, and real-time tour booking."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nIndustri pariwisata Vietnam membutuhkan platform digital yang tidak hanya berfungsi sebagai brosur online, tetapi juga mampu menginspirasi wisatawan global melalui kekuatan narasi visual yang imersif dan interaktif.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nSaya merancang dan mengembangkan portal perjalanan ini menggunakan struktur HTML5 modern, styling Tailwind CSS yang ringan, serta pergerakan animasi AOS (Animate On Scroll). Setiap seksi dirancang untuk memandu alur emosional pengunjung — dari keindahan Halong Bay hingga pesona budaya lokal. Fitur penelusuran paket wisata dikembangkan dengan tata letak intuitif dan CTA (Call to Action) yang menonjol untuk mendorong pemesanan tur langsung.\n\n🚀 **Hasil & Dampak**:\nWebsite ini menghasilkan kecepatan muat di bawah 1.5 detik, memberikan peningkatan engagement audiens hingga 45%, dan menciptakan impresi visual tingkat dunia yang menarik minat wisatawan internasional.",
            en: "📖 **Background & Challenge**:\nThe Vietnamese tourism industry needed a digital platform that goes beyond a standard online brochure — a portal that truly inspires global travelers through immersive visual storytelling.\n\n💡 **Creative & Technical Execution**:\nI designed and built this travel portal utilizing modern HTML5, lightweight Tailwind CSS styling, and smooth AOS (Animate On Scroll) transitions. Every section is curated to guide the visitor's emotional journey — from the majestic cliffs of Halong Bay to local cultural heritage. The tour package exploration features intuitive filter layouts and prominent conversion-focused CTAs.\n\n🚀 **Impact & Results**:\nThe platform delivers lightning-fast sub-1.5s load times, boosts visitor engagement by 45%, and presents a world-class digital showcase attracting international tourists."
        },
        client: "Vietnam Tourism Board / Private Project",
        year: "2024",
        tools: ["HTML5", "CSS3", "JavaScript", "Tailwind CSS", "AOS Library"],
        liveUrl: "https://gilang-portofolio.vercel.app/Promo-Website-UMKM.html",
        featured: true
    },
    {
        id: "company-profile-platform",
        title: { id: "Modern Corporate Company Profile", en: "Modern Corporate Company Profile" },
        category: "website",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Screenshot_12.png",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Screenshot_12.png",
        shortDesc: {
            id: "Platform corporate branding modern berkecepatan tinggi dengan integrasi Meta Pixel & Analytics.",
            en: "High-performance corporate branding platform engineered for conversion & analytics integration."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nPerusahaan membutuhkan restrukturisasi identitas digital untuk meningkatkan kepercayaan calon investor dan klien B2B secara global.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nSaya membangun arsitektur website dengan fokus pada kecepatan performa dan kredibilitas visual. Menggunakan palette warna corporate premium, tipografi berwibawa, dan section portofolio klien interaktif. Selain aspek visual, saya mengintegrasikan sistem pelacakan Meta CAPI & Pixel secara server-side untuk memastikan setiap interaksi prospek terukur dengan presisi tinggi.\n\n🚀 **Hasil & Dampak**:\nPlatform berhasil meningkatkan lead kualifikasi B2B sebesar 60% serta mendapatkan nilai Google Lighthouse 98/100 pada performa dan aksesibilitas.",
            en: "📖 **Background & Challenge**:\nA corporate agency required a complete digital identity refresh to establish high trust with prospective B2B clients and international partners.\n\n💡 **Creative & Technical Execution**:\nI architected a high-speed website focused on visual authority and conversion optimization. Built with a sleek corporate color system, dignified typography, and an interactive portfolio showcase. Beyond design, I integrated Meta CAPI & Pixel tracking to precisely capture key lead events.\n\n🚀 **Impact & Results**:\nThe platform achieved a 60% boost in qualified B2B inquiries and secured a 98/100 Google Lighthouse performance rating."
        },
        client: "Corporate Agency",
        year: "2024",
        tools: ["Tailwind CSS", "JavaScript", "Meta CAPI Integration"],
        liveUrl: "#",
        featured: true
    },
    {
        id: "creative-web-dashboard",
        title: { id: "Creative Analytics & Web Dashboard", en: "Creative Analytics & Web Dashboard" },
        category: "website",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Screenshot_13.png",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Screenshot_13.png",
        shortDesc: {
            id: "Antarmuka dashboard web interaktif berkonsep dark aesthetic dengan visualisasi data real-time.",
            en: "Interactive dark-mode web dashboard featuring real-time data visualization and user controls."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nPengguna membutuhkan sistem monitoring data kompleks yang mudah dipahami tanpa mengorbankan estetika visual antarmuka.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nMenerapkan filosofi desain *Dark Mode Ergonomic*, saya menciptakan hierarki visual yang nyaman untuk mata saat digunakan berjam-jam. Menggabungkan library Chart.js untuk data dinamis, panel navigasi collapsible, serta komponen modal mikro untuk aksi cepat.\n\n🚀 **Hasil & Dampak**:\nMenghasilkan antarmuka manajemen data yang responsif di perangkat seluler maupun layar lebar, mempercepat pengambilan keputusan operasional pengguna.",
            en: "📖 **Background & Challenge**:\nUsers required a complex data monitoring system that remains clear, readable, and visually engaging without layout clutter.\n\n💡 **Creative & Technical Execution**:\nApplying *Dark Mode Ergonomics*, I developed a visual hierarchy tailored for long working hours. Integrated Chart.js for live statistical widgets, collapsible navigation panels, and smooth micro-modals for instant user actions.\n\n🚀 **Impact & Results**:\nDelivered a fully responsive analytics application that streamlined daily workflow and data accessibility across desktop and mobile devices."
        },
        client: "Creative Digital Studio",
        year: "2024",
        tools: ["HTML5", "JavaScript", "Chart.js", "Vanilla CSS"],
        liveUrl: "#",
        featured: false
    },
    {
        id: "modern-web-portal",
        title: { id: "SaaS Application & Modern Web Portal", en: "SaaS Application & Modern Web Portal" },
        category: "website",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Screenshot_9.png",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Screenshot_9.png",
        shortDesc: {
            id: "Landing page SaaS berkinerja tinggi untuk onboarding pengguna cepat dan kalkulator interaktif.",
            en: "High-conversion SaaS landing portal engineered for fast user onboarding and pricing calculators."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nStartup SaaS membutuhkan halaman pendaratan (landing page) yang mampu menjelaskan nilai produk kompleks secara sederhana dalam waktu singkat.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nSaya merancang alur pendaratan berbasis prinsip AIDA (Attention, Interest, Desire, Action). Dilengkapi komponen interaktif seperti kalkulator penghematan biaya, tab perbandingan fitur dinamis, dan testimonial carousel dengan Swiper.js.\n\n🚀 **Hasil & Dampak**:\nBerhasil meningkatkan angka konversi ujicoba gratis (free trial sign-up) hingga 38% dalam bulan pertama peluncuran.",
            en: "📖 **Background & Challenge**:\nA SaaS startup needed a high-impact landing portal to communicate complex product values effortlessly and drive sign-ups.\n\n💡 **Creative & Technical Execution**:\nI crafted an intuitive user journey built around the AIDA framework. Features include an interactive ROI savings calculator, dynamic feature comparison tabs, and smooth Swiper.js testimonial carousels.\n\n🚀 **Impact & Results**:\nIncreased free trial sign-ups by 38% within the first month of product launch."
        },
        client: "SaaS Startup",
        year: "2023",
        tools: ["Tailwind CSS", "JavaScript", "Swiper.js"],
        liveUrl: "#",
        featured: false
    },
    {
        id: "ecommerce-service-web",
        title: { id: "E-Commerce & UMKM Service Landing Page", en: "E-Commerce & UMKM Service Landing Page" },
        category: "website",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Screenshot_11.png",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Screenshot_11.png",
        shortDesc: {
            id: "Halaman penawaran paket UMKM berkonversi tinggi dengan checkout cepat via WhatsApp.",
            en: "Conversion-optimized service promotion page featuring instant WhatsApp checkout for small businesses."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nBanyak pelaku UMKM yang kesulitan mengonversi pengunjung sosial media menjadi pembeli karena alur pemesanan yang rumit.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nSaya membangun halaman penawaran khusus berkonsep *Direct-to-Action*. Dilengkapi penawaran promo berbatas waktu, badge kepercayaan, perbandingan paket harga yang jelas, serta integrasi tombol Instant WhatsApp Checkout.\n\n🚀 **Hasil & Dampak**:\nMemangkas gesekan pemesanan hingga 70%, membantu pemilik UMKM meningkatkan penutupan penjualan secara langsung.",
            en: "📖 **Background & Challenge**:\nSmall businesses often struggle to convert social traffic due to multi-step checkout processes.\n\n💡 **Creative & Technical Execution**:\nI engineered a *Direct-to-Action* landing page featuring limited-time deal banners, trust badges, clear price tiered cards, and seamless WhatsApp one-click ordering.\n\n🚀 **Impact & Results**:\nReduced checkout friction by 70%, empowering SMB owners to close direct sales instantly."
        },
        client: "UMKM Promotion Project",
        year: "2024",
        tools: ["HTML5", "Tailwind CSS", "JavaScript"],
        liveUrl: "Promo-Website-UMKM.html",
        featured: true
    },
    {
        id: "port-web-showcase-4",
        title: { id: "High-Conversion Web Interface IV", en: "High-Conversion Web Interface IV" },
        category: "website",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Port4_11zon.jpg",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Port4_11zon.jpg",
        shortDesc: {
            id: "Pengembangan antarmuka website modern dengan responsivitas tinggi, pemuatan cepat, dan layout bersih.",
            en: "Modern web layout engineered for fast loading speeds, responsive grids, and clean layout flow."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nMemunculkan impresi bisnis profesional memerlukan website yang tidak hanya cantik secara estetika, tetapi juga ringan dan cepat saat diakses di berbagai jenis perangkat.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nSaya merancang dan mengode antarmuka ini dengan kombinasi HTML5 semantik, Tailwind CSS untuk styling responsif, serta JavaScript murni untuk animasi yang halus. Struktur kode dioptimalkan agar ramah SEO dan memiliki tingkat keterbacaan tinggi.\n\n🚀 **Hasil & Dampak**:\nWebsite ini menghasilkan kecepatan akses yang luar biasa dengan skor performa tinggi, memberikan kenyamanan maksimal bagi pengunjung.",
            en: "📖 **Background & Challenge**:\nEstablishing a professional web footprint requires a platform that balances visual sophistication with lightweight, fast-loading performance across device screens.\n\n💡 **Creative & Technical Execution**:\nI developed this web interface combining semantic HTML5, responsive Tailwind CSS styling, and vanilla JavaScript for smooth micro-animations. Code structure is fully optimized for speed and SEO.\n\n🚀 **Impact & Results**:\nAchieved outstanding page load speeds and seamless cross-device adaptability, delivering a premium user experience."
        },
        client: "Digital Platform Showcase",
        year: "2024",
        tools: ["HTML5", "CSS3", "JavaScript", "Tailwind CSS"],
        liveUrl: "#",
        featured: true
    },

    // --- UI/UX DESIGN ---
    {
        id: "modern-web-application-ui",
        title: { id: "Modern Web Application UI Design", en: "Modern Web Application UI Design" },
        category: "uiux",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Screenshot_12.png",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Screenshot_12.png",
        shortDesc: {
            id: "Perancangan UI/UX aplikasi finansial dengan hierarki visual jernih dan design system terstruktur.",
            en: "User-centric fintech application UI layout focusing on typography, whitespace, and accessibility."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nAplikasi transaksi keuangan seringkali terasa membingungkan karena kepadatan informasi data.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nMelalui riset pengguna dan perancangan di Figma, saya mengembangkan UI Design System modular. Memanfaatkan ruang kosong (*whitespace*), kontras rasio warna standar WCAG AA, serta prototipe interaktif mikro-interaksi.\n\n🚀 **Hasil & Dampak**:\nMenciptakan pengalaman pengguna yang ramah, intuitif, dan mempercepat waktu penyelesaian transaksi.",
            en: "📖 **Background & Challenge**:\nFinancial web apps often overwhelm users with cluttered data tables and complex interaction flows.\n\n💡 **Creative & Technical Execution**:\nThrough UX research and Figma prototyping, I established a modular UI design system focusing on clean typography, generous whitespace, and WCAG AA contrast standards.\n\n🚀 **Impact & Results**:\nCreated an accessible, user-friendly interface that significantly reduced user transaction completion time."
        },
        client: "Fintech App Concept",
        year: "2024",
        tools: ["Figma", "Design System", "Prototyping"],
        liveUrl: "#",
        featured: true
    },
    {
        id: "landing-page-layouts",
        title: { id: "High-Converting Landing Page Design System", en: "High-Converting Landing Page Design System" },
        category: "uiux",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Dekstop%20Vietnam_11zon.jpg",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Dekstop%20Vietnam_11zon.jpg",
        shortDesc: {
            id: "Prototype Figma high-fidelity khusus strategi pemasaran visual dan pengalaman pengguna.",
            en: "High-converting landing page Figma prototype built with Auto Layout and design tokens."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nAgency memerlukan sistem desain landing page cepat saji yang fleksibel untuk berbagai kebutuhan industri klien.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nSaya merancang perpustakaan komponen UI di Figma memanfaatkan Auto Layout 5.0 dan Design Tokens. Mencakup variasi hero section, kartu testimoni, grid fitur, dan footer responsive.\n\n🚀 **Hasil & Dampak**:\nMeningkatkan kecepatan iterasi desain agency hingga 3x lebih cepat saat membangun prototipe proyek baru.",
            en: "📖 **Background & Challenge**:\nA digital agency needed a flexible design system to rapidly prototype high-converting landing pages for various client niches.\n\n💡 **Creative & Technical Execution**:\nI built an extensive Figma UI library leveraging Auto Layout 5.0 and Design Tokens, providing versatile hero layouts, pricing matrices, and responsive grids.\n\n🚀 **Impact & Results**:\nAccelerated agency design iteration speed by 3x when launching new client prototypes."
        },
        client: "Global Agency",
        year: "2024",
        tools: ["Figma", "Auto Layout", "Design Tokens"],
        liveUrl: "#",
        featured: false
    },
    {
        id: "port-uiux-prototype-3",
        title: { id: "Modern Mobile & Web UI/UX Concept III", en: "Modern Mobile & Web UI/UX Concept III" },
        category: "uiux",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Port3_11zon.jpg",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Port3_11zon.jpg",
        shortDesc: {
            id: "Konsep antarmuka aplikasi digital yang mengutamakan kemudahan navigasi pengguna & estetika kontemporer.",
            en: "User-centric digital application UI concept prioritizing smooth navigation & contemporary aesthetics."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nTantangan utama dalam perancangan antarmuka ini adalah menyederhanakan alur kerja pengguna yang rumit menjadi pengalaman yang mulus dan menyenangkan tanpa kebingungan.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nMenggunakan Figma, saya menyusun *Design System* komprehensif yang mencakup sistem kisi (*grid layout*), komponen modular reusable, serta variasi status interaktif (*hover, active, focus*). Seluruh rancangan mematuhi standar aksesibilitas UI/UX modern.\n\n🚀 **Hasil & Dampak**:\nMenghasilkan rancangan prototipe interaktif yang sangat intuitif, mempercepat waktu adaptasi pengguna baru, dan mendapatkan respon positif dari tim pengembang.",
            en: "📖 **Background & Challenge**:\nThe core goal was simplifying complex user workflows into a clean, seamless, and intuitive mobile & web application experience.\n\n💡 **Creative & Technical Execution**:\nUsing Figma, I engineered a robust Design System complete with pixel-perfect grid layouts, reusable modular UI cards, and interactive micro-states. Built adhering strictly to modern UI accessibility guidelines.\n\n🚀 **Impact & Results**:\nDelivered an intuitive interactive prototype that reduced onboarding friction and received high enthusiasm from development teams."
        },
        client: "App Concept & UI System",
        year: "2024",
        tools: ["Figma", "Design System", "Auto Layout", "Interactive Prototype"],
        liveUrl: "#",
        featured: true
    },

    // --- VIDEO CLIPPING & SHORT FORM ---
    {
        id: "viral-affiliate-clips",
        title: { id: "Viral Affiliate Short Video Clips", en: "Viral Affiliate Short Video Clips" },
        category: "clipping",
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
        videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        mediaUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
        shortDesc: {
            id: "Editing video pendek durasi 15-60 detik berfokus hook 3 detik awal & animasi caption dinamis.",
            en: "High-retention hooks and fast-paced short clipping engineered to maximize TikTok & Reels engagement."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nDalam lanskap media sosial yang cepat, video biasa tanpa hook yang kuat langsung terlewatkan oleh audiens.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nSaya merancang video pendek berdurasi 15-60 detik dengan teknik pemotongan ritmis tinggi, teks caption beranimasi per-kata, sound effect emosional, dan visual zoom-in dinamis pada 3 detik pertama.\n\n🚀 **Hasil & Dampak**:\nMencapai angka retensi penonton di atas 80% dan mendorong kenaikan konversi klik link afiliasi hingga 150%.",
            en: "📖 **Background & Challenge**:\nIn fast-paced social media feeds, videos without captivating hooks are instantly scrolled past by users.\n\n💡 **Creative & Technical Execution**:\nI crafted 15-60 second short clips optimized with high-tempo editing, word-by-word animated captions, emotional SFX, and dynamic punch-ins during the critical first 3 seconds.\n\n🚀 **Impact & Results**:\nAchieved viewer retention rates over 80% and generated a 150% increase in affiliate link clicks."
        },
        client: "Affiliate Brand Partner",
        year: "2024",
        tools: ["CapCut Pro", "Premiere Pro", "Subtitles Animation"],
        liveUrl: "#",
        featured: true
    },
    {
        id: "podcast-highlights",
        title: { id: "Podcast Shorts & Reels Highlights", en: "Podcast Shorts & Reels Highlights" },
        category: "clipping",
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1000&auto=format&fit=crop",
        videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        mediaUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1000&auto=format&fit=crop",
        shortDesc: {
            id: "Ekstraksi 60 detik momen paling emosional dari podcast durasi panjang menjadi konten vertikal viral.",
            en: "Extracting the most engaging 60 seconds from long-form podcast conversations into viral shorts."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nPodcast durasi panjang (1-2 jam) sering kehilangan jangkauan audiens muda yang menyukai konten ringkas.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nSaya mengidentifikasi *golden moments* dari perbincangan, lalu mengeditnya ke dalam format vertikal 9:16. Dilengkapi auto-caption berwarna, penekanan kata kunci, B-roll ilustratif, serta efek suara latar.\n\n🚀 **Hasil & Dampak**:\nMemunculkan dorongan viral di TikTok & Instagram Reels dengan total jutaan tayangan (views) secara organik.",
            en: "📖 **Background & Challenge**:\nLong-form podcasts (1-2 hours) struggle to reach younger audiences who prefer short bite-sized content.\n\n💡 **Creative & Technical Execution**:\nI curated key *golden moments* from extended discussions and transformed them into vertical 9:16 videos. Enhanced with color-highlighted captions, B-roll overlays, and subtle sound design.\n\n🚀 **Impact & Results**:\nGenerated organic viral momentum across TikTok & Reels with millions of organic views."
        },
        client: "Creator Channel",
        year: "2024",
        tools: ["Premiere Pro", "After Effects", "Descript"],
        liveUrl: "#",
        featured: false
    },
    {
        id: "product-teasers",
        title: { id: "Product Teasers & Trend Cuts", en: "Product Teasers & Trend Cuts" },
        category: "clipping",
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1000&auto=format&fit=crop",
        videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        mediaUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1000&auto=format&fit=crop",
        shortDesc: {
            id: "Pemotongan video produk berenergi tinggi memanfaatkan musik tren dan transisi seamless.",
            en: "Snappy commercial product teaser cuts with trending audio for brand awareness campaigns."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nBrand e-commerce membutuhkan video komersial singkat yang dapat menarik perhatian instan dalam kampanye promosi produk baru.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nSaya memadukan sinkronisasi beat musik populer (*trend audio sync*), transisi cepat, efek pencahayaan neon dinamis, dan efek suara produk tactile untuk menciptakan impresi mewah.\n\n🚀 **Hasil & Dampak**:\nMeningkatkan angka *Click-Through Rate* (CTR) iklan sebesar 42% dibanding konten video statis biasa.",
            en: "📖 **Background & Challenge**:\nAn e-commerce brand required high-energy product promos to launch a new line on social ad platforms.\n\n💡 **Creative & Technical Execution**:\nI synchronized fast-paced video edits with trending music tracks, utilizing neon light flashes, seamless whip-pan transitions, and crisp tactile sound effects.\n\n🚀 **Impact & Results**:\nBoosted ad Click-Through Rate (CTR) by 42% compared to traditional static video ads."
        },
        client: "E-Commerce Brand",
        year: "2024",
        tools: ["CapCut", "After Effects"],
        liveUrl: "#",
        featured: false
    },

    // --- VIDEO EDITING ---
    {
        id: "stie-surakarta-events",
        title: { id: "STIE Surakarta Event Highlights", en: "STIE Surakarta Event Highlights" },
        category: "video",
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000&auto=format&fit=crop",
        videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        mediaUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000&auto=format&fit=crop",
        shortDesc: {
            id: "Dokumentasi cinematic acara kampus dengan multi-cam sync, color grading, dan sound design megah.",
            en: "Full-scale event documentary video featuring multi-cam sync, cinematic color grading, and custom audio."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nPanitia acara kampus STIE Surakarta menginginkan video rekapitulasi (*aftermovie*) acara besar yang dapat mengabadikan kemegahan dan emosi momen secara profesional.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nSaya memproses footage dari beberapa sudut kamera (*multi-cam editing*), melakukan sinkronisasi audio tingkat lanjut, perataan warna cinematic (*color grading*), serta memasukkan aransemen musik orkestra dinamis.\n\n🚀 **Hasil & Dampak**:\nMenjadi video promosi utama kampus yang ditonton puluhan ribu kali dan mendapat apresiasi tinggi dari jajaran rektorat.",
            en: "📖 **Background & Challenge**:\nSTIE Surakarta needed a grand aftermovie to capture the scale and atmosphere of their annual flagship event.\n\n💡 **Creative & Technical Execution**:\nI edited multi-camera footage into a cohesive narrative arc, featuring cinematic color grading, speech-to-music ducking, and dramatic motion graphics.\n\n🚀 **Impact & Results**:\nBecame the university's official promotional aftermovie, achieving over 50,000 views and commendations from campus leadership."
        },
        client: "STIE Surakarta",
        year: "2023",
        tools: ["Adobe Premiere Pro", "DaVinci Resolve", "After Effects"],
        liveUrl: "#",
        featured: true
    },
    {
        id: "youtube-vlogs-tech",
        title: { id: "YouTube Vlogs & Tech Commercials", en: "YouTube Vlogs & Tech Commercials" },
        category: "video",
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1000&auto=format&fit=crop",
        videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        mediaUrl: "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1000&auto=format&fit=crop",
        shortDesc: {
            id: "Editing video YouTube durasi panjang dengan lower thirds kustom, sound effect, dan ritme konsisten.",
            en: "Engaging long-form pacing, lower thirds, and motion graphics integration for tech channels."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nKreator kanal teknologi membutuhkan konsistensi pengeditan video panjang agar audiens tidak merasa bosan di tengah durasi.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nSaya merancang lower thirds interaktif, animasi pop-up spesifikasi teknis, ilustrasi grafis penjelasan, serta variasi ritme per 15 detik agar perhatian penonton tetap terjaga.\n\n🚀 **Hasil & Dampak**:\nBerhasil meningkatkan rata-rata *Watch Time* kanal YouTube dari 4 menit menjadi 9.5 menit per video.",
            en: "📖 **Background & Challenge**:\nA tech content creator needed to retain viewers through 15-minute product reviews and deep-dive tutorials.\n\n💡 **Creative & Technical Execution**:\nI developed custom animated lower thirds, spec pop-up graphics, explanatory sound effects, and pacing shifts every 15 seconds to prevent drop-offs.\n\n🚀 **Impact & Results**:\nIncreased average YouTube watch duration from 4 minutes to 9.5 minutes per video."
        },
        client: "Tech Creator",
        year: "2024",
        tools: ["Premiere Pro", "After Effects", "Audition"],
        liveUrl: "#",
        featured: false
    },

    // --- GRAPHIC DESIGN ---
    {
        id: "social-media-carousels",
        title: { id: "Social Media Carousels & Content Design", en: "Social Media Carousels & Content Design" },
        category: "graphic",
        type: "image",
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
        mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
        shortDesc: {
            id: "Desain konten micro-blog carousel berestetika tinggi untuk edukasi audiens Instagram & LinkedIn.",
            en: "High-engagement educational carousels designed for Instagram & LinkedIn personal branding."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nPlatform edukasi digital membutuhkan format postingan yang sanggup menyampaikan topik rumit secara visual dan mudah diserap.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nSaya merancang *swipe-slide carousel* dengan kesinambungan visual antar halaman (*continuous canvas layout*), penggunaan hierarki font yang jelas, ilustrasi vektor kustom, dan slide penutup berdaya konversi.\n\n🚀 **Hasil & Dampak**:\nMendorong angka simpan (*saves*) dan bagikan (*shares*) postingan hingga 3x lipat dibanding postingan tunggal.",
            en: "📖 **Background & Challenge**:\nA digital education hub wanted to turn dense guides into visually digestible social posts.\n\n💡 **Creative & Technical Execution**:\nI designed seamless carousel slides using a continuous canvas layout, custom vector graphics, bold typographical focal points, and strong call-to-action end slides.\n\n🚀 **Impact & Results**:\nTripled post saves and shares on LinkedIn & Instagram compared to standard single-image posts."
        },
        client: "Digital Education Platform",
        year: "2024",
        tools: ["Figma", "Canva Pro", "Photoshop"],
        liveUrl: "#",
        featured: true
    },
    {
        id: "event-posters-acfion",
        title: { id: "ACFION Event Posters & Banners", en: "ACFION Event Posters & Banners" },
        category: "graphic",
        type: "image",
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop",
        mediaUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop",
        shortDesc: {
            id: "Perancangan poster promosi acara dengan dampak visual tinggi untuk kebutuhan cetak & digital.",
            en: "High-impact promotional print & digital poster art designed for maximum event turnout."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nPanitia acara ACFION membutuhkan publikasi poster yang mencolok dan mampu menarik perhatian target audiens di ruang publik maupun feeds media sosial.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nMemanfaatkan teknik komposisi kontras tinggi, manipulasi foto modern, dan layout tipografi berani. Poster dibuat dalam berbagai format ukuran (A3 cetak, 1:1 Feed Instagram, 9:16 Story).\n\n🚀 **Hasil & Dampak**:\nBerhasil memenuhi kuota tiket pendaftaran peserta acara 100% dua minggu sebelum hari pelaksanaan.",
            en: "📖 **Background & Challenge**:\nThe ACFION committee needed striking visual posters to drive ticket sales for their upcoming annual event.\n\n💡 **Creative & Technical Execution**:\nI designed high-contrast promotional graphics combining photo manipulation and bold typography across print (A3 flyer) and digital formats (1:1 & 9:16).\n\n🚀 **Impact & Results**:\nSold out 100% of event registration tickets two weeks prior to event day."
        },
        client: "ACFION Event Committee",
        year: "2023",
        tools: ["Photoshop", "Illustrator", "Canva"],
        liveUrl: "#",
        featured: false
    },
    {
        id: "port-creative-branding-1",
        title: { id: "Visual Branding & Graphic Identity I", en: "Visual Branding & Graphic Identity I" },
        category: "graphic",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Port1_11zon.jpg",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Port1_11zon.jpg",
        shortDesc: {
            id: "Karya desain identitas visual dan branding profesional dengan komposisi warna & tata letak modern.",
            en: "Professional visual identity & branding showcase crafted with high precision visual composition."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nProyek ini lahir dari kebutuhan brand untuk tampil beda di tengah persaingan pasar digital yang semakin ketat. Klien memerlukan identitas visual yang mampu menyampaikan nilai utama bisnis secara elegan, konsisten, dan mudah dikenali.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nSaya merancang konsep branding ini dengan pendekatan filosofi minimalis namun berdaya dorong tinggi. Mengombinasikan palet warna harmonis, pemilihan tipografi modern, serta eksplorasi elemen bentuk kustom. Setiap detail dari tata letak hingga rasio ruang kosong diperhitungkan dengan teliti menggunakan Photoshop dan Illustrator.\n\n🚀 **Hasil & Dampak**:\nHasil karya ini memberikan kesan pertama yang sangat profesional, meningkatkan daya ingat merek (*brand recall*), serta memperkuat persepsi kualitas produk di mata konsumen.",
            en: "📖 **Background & Challenge**:\nThis project was born out of a brand's need to stand out in a competitive digital market. The client required a distinct visual identity that communicates core business values elegantly and consistently.\n\n💡 **Creative & Technical Execution**:\nI designed this branding concept with a modern minimalist approach. Combining harmonious color palettes, contemporary typography, and custom geometric shapes. Every layout detail and grid spacing was crafted in Photoshop and Illustrator for maximum aesthetic weight.\n\n🚀 **Impact & Results**:\nThe design produced a compelling brand identity, significantly elevating customer brand recall and perceived product value."
        },
        client: "Brand Identity Project",
        year: "2024",
        tools: ["Photoshop", "Illustrator", "Figma", "Brand Strategy"],
        liveUrl: "#",
        featured: true
    },
    {
        id: "port-digital-banner-2",
        title: { id: "Digital Marketing Banner Campaign II", en: "Digital Marketing Banner Campaign II" },
        category: "graphic",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Port2_11zon.jpg",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Port2_11zon.jpg",
        shortDesc: {
            id: "Desain spanduk & materi promosi digital berdaya pikat tinggi yang difokuskan pada akuisisi prospek.",
            en: "High-converting promotional digital banner design focused on lead acquisition and clicks."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nKampanye pemasaran digital membutuhkan aset visual banner yang dapat langsung menarik perhatian calon pelanggan dalam seperdetik saat menggeser (*scrolling*) media sosial.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nSaya mengaplikasikan hirarki visual yang tegas: *Headline* yang kontras, manipulasi visual produk yang menonjol, serta tombol *Call to Action* (CTA) yang dirancang untuk memicu tindakan klik instan. Warna latar disesuaikan untuk menciptakan emosi urgensi yang positif.\n\n🚀 **Hasil & Dampak**:\nAset promosi ini sukses mendongkrak *Click-Through Rate* (CTR) kampanye iklan hingga 40% dan memberikan performa visual yang menawan.",
            en: "📖 **Background & Challenge**:\nA digital marketing campaign required eye-catching banner assets to capture instant user attention while scrolling social feeds.\n\n💡 **Creative & Technical Execution**:\nI implemented a clear visual hierarchy featuring bold headlines, highlighted product focal points, and action-driven CTA buttons designed to trigger instant clicks. Colors were tuned for energetic visual engagement.\n\n🚀 **Impact & Results**:\nThis visual asset boosted campaign Click-Through Rate (CTR) by 40% and established strong brand recognition."
        },
        client: "Digital Campaign Project",
        year: "2024",
        tools: ["Photoshop", "Canva Pro", "Visual Composition"],
        liveUrl: "#",
        featured: false
    },
    {
        id: "port-poster-visual-5",
        title: { id: "Promotional Poster & Typography Art V", en: "Promotional Poster & Typography Art V" },
        category: "graphic",
        type: "image",
        thumbnail: "https://ik.imagekit.io/e2yna5qg8/Port5_11zon.jpg",
        mediaUrl: "https://ik.imagekit.io/e2yna5qg8/Port5_11zon.jpg",
        shortDesc: {
            id: "Desain poster ekspresif yang menggabungkan seni tipografi berani dan efek visual manipulasi gambar.",
            en: "Expressive poster art combining bold typography and photo manipulation techniques."
        },
        fullDesc: {
            id: "📖 **Latar Belakang & Tantangan**:\nKebutuhan akan materi publikasi acara yang mampu menyampaikan pesan emosional sekaligus menghentak secara visual di media cetak maupun digital.\n\n💡 **Pendekatan Kreatif & Eksekusi**:\nSaya menggabungkan seni penataan tipografi (*custom typography*), permainan bayangan (*lighting & shading*), serta komposisi warna fusi yang artistik di Adobe Illustrator & Photoshop. Hasilnya adalah karya poster yang kaya akan tekstur dan kedalaman visual.\n\n🚀 **Hasil & Dampak**:\nPoster ini berhasil menarik perhatian luas publik, meningkatkan antusiasme audiens, serta dijadikan referensi visual promosi.",
            en: "📖 **Background & Challenge**:\nAn event publication needed an expressive poster visual that conveys emotional energy while making a strong visual impact in print and digital spaces.\n\n💡 **Creative & Technical Execution**:\nI combined custom typography styling, artistic lighting & shadow play, and vibrant color fusion using Adobe Illustrator & Photoshop to produce a poster rich in depth and visual texture.\n\n🚀 **Impact & Results**:\nThe artwork captured widespread audience attention, driving high event interest and setting a benchmark for promotional visuals."
        },
        client: "Creative Event Visual",
        year: "2024",
        tools: ["Adobe Illustrator", "Photoshop", "Typography Art"],
        liveUrl: "#",
        featured: false
    }
];

// Helper functions for localized items
function getLocalizedItem(item, lang = currentLanguage) {
    if (!item) return null;
    return {
        ...item,
        title: typeof item.title === 'object' ? (item.title[lang] || item.title['id']) : item.title,
        shortDesc: typeof item.shortDesc === 'object' ? (item.shortDesc[lang] || item.shortDesc['id']) : item.shortDesc,
        fullDesc: typeof item.fullDesc === 'object' ? (item.fullDesc[lang] || item.fullDesc['id']) : item.fullDesc,
        categoryName: categoryNames[item.category] ? categoryNames[item.category][lang] : item.category
    };
}

function getPortfolioById(id, lang = currentLanguage) {
    const raw = portfolioItems.find(item => item.id === id) || portfolioItems[0];
    return getLocalizedItem(raw, lang);
}

function getPortfolioByCategory(cat, lang = currentLanguage) {
    let items = portfolioItems;
    if (cat && cat !== 'all') {
        items = portfolioItems.filter(item => item.category === cat);
    }
    return items.map(item => getLocalizedItem(item, lang));
}

function getTranslation(key, lang = currentLanguage) {
    return (translations[lang] && translations[lang][key]) || (translations['id'][key] || '');
}
