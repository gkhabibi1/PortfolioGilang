/**
 * DUCK RUSH - Karakter Bebek 3D Unik & Kompleks
 * Koleksi 10 Karakter Bebek Unik dengan Aksesoris 3D Three.js
 */

(function () {
  const DUCK_CHARACTERS = [
    {
      id: 1,
      name: 'Bebek Klasik Berdasi',
      title: 'Gentleman Duck',
      desc: 'Bebek bangsawan parlente bertopi bowler hitam elegan dan dasi kupu-kupu merah.',
      color: '#FACC15',
      border: '#CA8A04',
      emoji: '🎩',
      tag: 'Klasik Elegan',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      accentColor: 0xfacc15,
      beakColor: 0xf97316
    },
    {
      id: 2,
      name: 'Bebek Sultan Emas',
      title: 'Royal Crown King',
      desc: 'Penguasa sungai emas murni 24K dengan mahkota emas megah bertahtakan batu rubi merah.',
      color: '#EAB308',
      border: '#A16207',
      emoji: '👑',
      tag: 'Sultan Mewah',
      badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      accentColor: 0xffd700,
      beakColor: 0xf59e0b
    },
    {
      id: 3,
      name: 'Bebek Zombie Biohazard',
      title: 'Toxic Zombie',
      desc: 'Bebek mutasi rawa beracun berkulit hijau zombi pucat, jahitan tengkorak & mata merah menyala.',
      color: '#4ADE80',
      border: '#15803D',
      emoji: '🧟',
      tag: 'Horor Mutasi',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      accentColor: 0x4d7c0f,
      beakColor: 0x65a30d
    },
    {
      id: 4,
      name: 'Bebek Ninja Bayangan',
      title: 'Shadow Shinobi',
      desc: 'Pendekar bayangan berkostum siluman hitam legam, ikat kepala merah menyala & shuriken di punggung.',
      color: '#475569',
      border: '#0F172A',
      emoji: '🥷',
      tag: 'Siluman Rahasia',
      badgeClass: 'bg-slate-700/30 text-slate-300 border-slate-600',
      accentColor: 0x1e293b,
      beakColor: 0x334155
    },
    {
      id: 5,
      name: 'Bebek Cyborg 2077',
      title: 'Mecha Cyberpunk',
      desc: 'Bebek sibernetik berpelat baja titanium chrome dengan cyber-visor cyan neon & antena futuristik.',
      color: '#38BDF8',
      border: '#0284C7',
      emoji: '🤖',
      tag: 'Futuristik Mecha',
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      accentColor: 0x94a3b8,
      beakColor: 0x0284c7
    },
    {
      id: 6,
      name: 'Bebek Bajak Laut',
      title: 'Pirate Captain',
      desc: 'Kapten penguasa samudra bertopi bajak laut lambang tengkorak, penutup mata (eyepatch) & anting emas.',
      color: '#EA580C',
      border: '#9A3412',
      emoji: '🏴‍☠️',
      tag: 'Kapten Laut',
      badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      accentColor: 0xc2410c,
      beakColor: 0xea580c
    },
    {
      id: 7,
      name: 'Bebek Penyihir Astral',
      title: 'Astral Archmage',
      desc: 'Penyihir kosmik berjubah ungu misterius dengan topi kerucut bintang dan bola kristal gaib.',
      color: '#A855F7',
      border: '#6B21A8',
      emoji: '🧙‍♂️',
      tag: 'Sihir Mistis',
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      accentColor: 0x7c3aed,
      beakColor: 0xd946ef
    },
    {
      id: 8,
      name: 'Bebek Astronaut Apollo',
      title: 'Cosmic Astro-Duck',
      desc: 'Penjelajah luar angkasa berhelm kubah astronot kaca futuristik dan tabung jetpack oksigen ganda.',
      color: '#E2E8F0',
      border: '#38BDF8',
      emoji: '🚀',
      tag: 'Penjelajah Antariksa',
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      accentColor: 0xf8fafc,
      beakColor: 0x38bdf8
    },
    {
      id: 9,
      name: 'Bebek Gamer Retro RGB',
      title: 'Pro Streamer RGB',
      desc: 'Gamer e-sports berpenampilan neon vaporwave dengan headset gaming over-ear RGB dan kacamata shades.',
      color: '#F43F5E',
      border: '#BE123C',
      emoji: '🎧',
      tag: 'Esports Pro',
      badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      accentColor: 0xec4899,
      beakColor: 0xf43f5e
    },
    {
      id: 10,
      name: 'Bebek Naga Magma Api',
      title: 'Inferno Dragon Duck',
      desc: 'Bebek mistis lahar berapi dengan sepasang tanduk naga obsidian hitam dan deretan duri magma membara.',
      color: '#DC2626',
      border: '#7F1D1D',
      emoji: '🔥',
      tag: 'Dewa Lahar Api',
      badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40',
      accentColor: 0x27272a,
      beakColor: 0xb91c1c
    }
  ];

  /**
   * Membuat Mesh Bebek 3D Three.js yang kaya dan mendalam untuk karakter bebek yang dipilih
   * @param {Object|number} duckIdOrMeta - ID (1-10) atau metadata bebek
   * @param {Object} THREE - Library Three.js
   * @param {Object} options - Opsi tambahan (misal: shadow, detailLevel)
   * @returns {Object} { group, duckMat, beakMat, accessories: [] }
   */
  function createDuck3DMesh(duckIdOrMeta, THREE, options = {}) {
    const meta = typeof duckIdOrMeta === 'object' && duckIdOrMeta !== null
      ? duckIdOrMeta
      : (DUCK_CHARACTERS.find(d => d.id === duckIdOrMeta) || DUCK_CHARACTERS[0]);

    const id = meta.id || 1;
    const group = new THREE.Group();
    const castShadow = options.castShadow !== undefined ? options.castShadow : true;

    // 1. Material Badan Spesifik untuk Masing-masing Karakter
    let duckMat;
    let beakMat;
    const eyeMatDark = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    switch (id) {
      case 2: // Sultan Emas
        duckMat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          roughness: 0.22,
          metalness: 0.85,
        });
        beakMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          roughness: 0.3,
          metalness: 0.5,
        });
        break;

      case 3: // Zombie Biohazard
        duckMat = new THREE.MeshStandardMaterial({
          color: 0x557a2b,
          roughness: 0.85,
          metalness: 0.05,
        });
        beakMat = new THREE.MeshStandardMaterial({
          color: 0x65a30d,
          roughness: 0.7,
        });
        break;

      case 4: // Ninja Bayangan
        duckMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.55,
          metalness: 0.15,
        });
        beakMat = new THREE.MeshStandardMaterial({
          color: 0x334155,
          roughness: 0.4,
        });
        break;

      case 5: // Cyborg 2077
        duckMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.18,
          metalness: 0.92,
        });
        beakMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.25,
          metalness: 0.8,
        });
        break;

      case 7: // Penyihir Astral
        duckMat = new THREE.MeshStandardMaterial({
          color: 0x7c3aed,
          roughness: 0.35,
          metalness: 0.2,
        });
        beakMat = new THREE.MeshStandardMaterial({
          color: 0xd946ef,
          roughness: 0.35,
        });
        break;

      case 8: // Astronaut Apollo
        duckMat = new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          roughness: 0.25,
          metalness: 0.1,
        });
        beakMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.3,
        });
        break;

      case 9: // Gamer Retro RGB
        duckMat = new THREE.MeshStandardMaterial({
          color: 0xec4899,
          roughness: 0.3,
          metalness: 0.15,
        });
        beakMat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          roughness: 0.35,
        });
        break;

      case 10: // Naga Magma Api
        duckMat = new THREE.MeshStandardMaterial({
          color: 0x1c1917,
          emissive: 0x7f1d1d,
          emissiveIntensity: 0.5,
          roughness: 0.7,
          metalness: 0.2,
        });
        beakMat = new THREE.MeshStandardMaterial({
          color: 0xb91c1c,
          emissive: 0x991b1b,
          emissiveIntensity: 0.4,
          roughness: 0.4,
        });
        break;

      case 6: // Bajak Laut
        duckMat = new THREE.MeshStandardMaterial({
          color: 0xc2410c,
          roughness: 0.45,
          metalness: 0.1,
        });
        beakMat = new THREE.MeshStandardMaterial({
          color: 0xea580c,
          roughness: 0.4,
        });
        break;

      case 1: // Klasik Berdasi
      default:
        duckMat = new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          roughness: 0.35,
          metalness: 0.08,
        });
        beakMat = new THREE.MeshStandardMaterial({
          color: 0xf97316,
          roughness: 0.4,
        });
        break;
    }

    // 2. Anatomi Dasar Bebek
    // Badan Bebek
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.0, 18, 18), duckMat);
    body.scale.set(1.3, 0.85, 0.95);
    body.castShadow = castShadow;
    body.receiveShadow = castShadow;
    group.add(body);

    // Sayap Bebek (Kiri & Kanan)
    const wingGeo = new THREE.SphereGeometry(0.55, 12, 12);
    [-0.92, 0.92].forEach((zPos) => {
      const wing = new THREE.Mesh(wingGeo, duckMat);
      wing.scale.set(1.3, 0.45, 0.18);
      wing.position.set(0.05, 0.15, zPos);
      wing.rotation.z = -0.15;
      wing.rotation.y = zPos > 0 ? 0.08 : -0.08;
      wing.castShadow = castShadow;
      group.add(wing);
    });

    // Kepala Bebek
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), duckMat);
    head.position.set(0.75, 0.75, 0);
    head.castShadow = castShadow;
    group.add(head);

    // Paruh Bebek
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.55, 12), beakMat);
    beak.rotation.z = -Math.PI / 2;
    beak.position.set(1.3, 0.72, 0);
    beak.castShadow = castShadow;
    group.add(beak);

    // Ekor Bebek
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.55, 10), duckMat);
    tail.rotation.z = Math.PI / 3;
    tail.position.set(-1.0, 0.45, 0);
    tail.castShadow = castShadow;
    group.add(tail);

    // Mata Bebek Standar (Kecuali karakter yang matanya dimodifikasi)
    if (id !== 3 && id !== 4 && id !== 5 && id !== 6 && id !== 10) {
      [-0.24, 0.24].forEach((ez) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), eyeMatDark);
        eye.position.set(0.9, 0.86, ez);
        group.add(eye);

        // Titik putih pantulan mata
        const eyeGlance = new THREE.Mesh(
          new THREE.SphereGeometry(0.03, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        eyeGlance.position.set(0.95, 0.89, ez + (ez > 0 ? 0.03 : -0.03));
        group.add(eyeGlance);
      });
    }

    // 3. Modifikasi Karakter Bebek & Aksesoris 3D Khusus
    switch (id) {
      case 1: { // BEBEK KLASIK BERDASI (GENTLEMAN)
        // Topi Bowler / Fedora Hitam
        const hatMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
        const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 });

        // Pinggiran topi (Brim)
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 20), hatMat);
        brim.position.set(0.75, 1.25, 0);
        brim.rotation.z = -0.1;
        group.add(brim);

        // Kubah topi
        const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.32, 18), hatMat);
        dome.position.set(0.73, 1.41, 0);
        dome.rotation.z = -0.1;
        group.add(dome);

        // Pita merah di topi
        const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.385, 0.385, 0.08, 18), ribbonMat);
        ribbon.position.set(0.74, 1.31, 0);
        ribbon.rotation.z = -0.1;
        group.add(ribbon);

        // Dasi Kupu-Kupu Merah di Dada
        const bowtieMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
        const knot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), bowtieMat);
        knot.position.set(0.96, 0.46, 0);
        group.add(knot);

        [-0.14, 0.14].forEach((bz) => {
          const wingTie = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 6), bowtieMat);
          wingTie.rotation.x = bz > 0 ? Math.PI / 2 : -Math.PI / 2;
          wingTie.position.set(0.95, 0.46, bz);
          group.add(wingTie);
        });
        break;
      }

      case 2: { // BEBEK SULTAN EMAS (ROYAL CROWN KING)
        const crownGoldMat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          metalness: 0.9,
          roughness: 0.15,
        });
        const rubyMat = new THREE.MeshStandardMaterial({
          color: 0xff0033,
          emissive: 0xcc0022,
          emissiveIntensity: 0.6,
          roughness: 0.1,
        });

        // Cincin dasar mahkota
        const crownBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.36, 0.36, 0.12, 16, 1, true),
          crownGoldMat
        );
        crownBase.position.set(0.75, 1.28, 0);
        group.add(crownBase);

        // 5 Puncak mahkota berujung batu rubi
        const spikeCount = 5;
        for (let i = 0; i < spikeCount; i++) {
          const angle = (i / spikeCount) * Math.PI * 2;
          const sx = 0.75 + Math.cos(angle) * 0.32;
          const sz = Math.sin(angle) * 0.32;

          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.22, 6), crownGoldMat);
          spike.position.set(sx, 1.42, sz);
          group.add(spike);

          const gem = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), rubyMat);
          gem.position.set(sx, 1.54, sz);
          group.add(gem);
        }

        // Kerah Jubah Beludru Ungu Kerajaan di Leher
        const royalCollarMat = new THREE.MeshStandardMaterial({
          color: 0x581c87,
          roughness: 0.4,
        });
        const collar = new THREE.Mesh(
          new THREE.TorusGeometry(0.48, 0.12, 10, 20),
          royalCollarMat
        );
        collar.rotation.x = Math.PI / 2;
        collar.position.set(0.65, 0.45, 0);
        group.add(collar);
        break;
      }

      case 3: { // BEBEK ZOMBIE BIOHAZARD
        // Mata Kiri Pucat Berlumut / Buta
        const blindEye = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xd1d5db })
        );
        blindEye.position.set(0.9, 0.86, -0.24);
        group.add(blindEye);

        // Mata Kanan Merah Darah Menyala
        const redEye = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xef4444 })
        );
        redEye.position.set(0.9, 0.86, 0.24);
        group.add(redEye);

        // Jahitan Luka Kepala Zombi
        const stitchMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
        for (let i = 0; i < 4; i++) {
          const stitch = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.03), stitchMat);
          stitch.position.set(0.68 + i * 0.07, 1.25, 0.1 - i * 0.05);
          stitch.rotation.y = 0.4;
          group.add(stitch);
        }

        // Tetesan Lendir Neon Toxic dari Paruh
        const slimeMat = new THREE.MeshStandardMaterial({
          color: 0x22c55e,
          emissive: 0x16a34a,
          emissiveIntensity: 0.6,
          roughness: 0.2,
        });
        const slimeDrop1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), slimeMat);
        slimeDrop1.scale.set(0.8, 1.4, 0.8);
        slimeDrop1.position.set(1.22, 0.52, 0.16);
        group.add(slimeDrop1);

        const slimeDrop2 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), slimeMat);
        slimeDrop2.position.set(1.22, 0.36, 0.16);
        group.add(slimeDrop2);

        // Bercak infeksi di badan
        const patchMat = new THREE.MeshStandardMaterial({ color: 0x365314, roughness: 0.9 });
        const patch = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), patchMat);
        patch.scale.set(1.1, 0.4, 0.8);
        patch.position.set(-0.2, 0.65, 0.45);
        group.add(patch);
        break;
      }

      case 4: { // BEBEK NINJA BAYANGAN (SHADOW SHINOBI)
        // Ikat Kepala Ninja Merah
        const headbandMat = new THREE.MeshStandardMaterial({
          color: 0xdc2626,
          roughness: 0.3,
        });
        const headband = new THREE.Mesh(
          new THREE.CylinderGeometry(0.56, 0.56, 0.12, 18, 1, true),
          headbandMat
        );
        headband.position.set(0.75, 0.95, 0);
        group.add(headband);

        // Pelat Logam Perak di Dahi
        const plateMat = new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          metalness: 0.9,
          roughness: 0.2,
        });
        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.24), plateMat);
        plate.position.set(1.28, 0.95, 0);
        group.add(plate);

        // Pita Kain Melayang di Belakang Kepala
        [-0.07, 0.07].forEach((py, i) => {
          const ribbonTail = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.02), headbandMat);
          ribbonTail.position.set(0.05, 0.95 + py, -0.15 - i * 0.08);
          ribbonTail.rotation.y = 0.35;
          ribbonTail.rotation.z = -0.2;
          group.add(ribbonTail);
        });

        // Masker Ninja Penutup Wajah Bawah
        const maskMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
        const mask = new THREE.Mesh(new THREE.SphereGeometry(0.57, 16, 16), maskMat);
        mask.scale.set(0.8, 0.5, 0.9);
        mask.position.set(0.8, 0.62, 0);
        group.add(mask);

        // Mata Glow Putih Bersinar Tajam
        [-0.22, 0.22].forEach((ez) => {
          const eyeNinja = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 6, 6),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          eyeNinja.scale.set(1.4, 0.6, 1.0);
          eyeNinja.position.set(0.94, 0.88, ez);
          group.add(eyeNinja);
        });

        // Mini Shuriken Logam di Punggung
        const shurikenMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          metalness: 0.9,
          roughness: 0.2,
        });
        const shurikenGroup = new THREE.Group();
        const blade1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.02), shurikenMat);
        const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.02), shurikenMat);
        shurikenGroup.add(blade1);
        shurikenGroup.add(blade2);
        shurikenGroup.rotation.y = Math.PI / 2;
        shurikenGroup.rotation.x = 0.4;
        shurikenGroup.position.set(-0.35, 0.75, 0);
        group.add(shurikenGroup);
        break;
      }

      case 5: { // BEBEK CYBORG 2077 (MECHA CYBERPUNK)
        // Cyber-Visor Kacamata Neon Cyan Menyala
        const visorMat = new THREE.MeshStandardMaterial({
          color: 0x00ffff,
          emissive: 0x00e5ff,
          emissiveIntensity: 0.9,
          roughness: 0.1,
          metalness: 0.8,
        });
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.58), visorMat);
        visor.position.set(0.96, 0.86, 0);
        group.add(visor);

        // Frame Visor Samping Hitam
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
        const visorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.62), frameMat);
        visorFrame.position.set(0.94, 0.95, 0);
        group.add(visorFrame);

        // Antena Sci-Fi di Samping Kepala
        const antennaMat = new THREE.MeshStandardMaterial({
          color: 0x475569,
          metalness: 0.8,
          roughness: 0.2,
        });
        const antennaStem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.03, 0.45, 8),
          antennaMat
        );
        antennaStem.position.set(0.68, 1.3, 0.36);
        antennaStem.rotation.z = -0.3;
        antennaStem.rotation.x = 0.2;
        group.add(antennaStem);

        // Ujung Antena LED Oranye
        const antennaTip = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xf97316 })
        );
        antennaTip.position.set(0.62, 1.52, 0.41);
        group.add(antennaTip);

        // Lampu Sirkuit Neon di Badan
        const circuitMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const circuitStripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.02), circuitMat);
        circuitStripe1.position.set(0, 0.3, 0.96);
        group.add(circuitStripe1);

        const circuitStripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.02), circuitMat);
        circuitStripe2.position.set(0, 0.3, -0.96);
        group.add(circuitStripe2);
        break;
      }

      case 6: { // BEBEK BAJAK LAUT (PIRATE CAPTAIN)
        const hatMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          metalness: 0.85,
          roughness: 0.2,
        });

        // Topi Kapten Bajak Laut (Tricorn)
        const tricornBase = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.5, 0.3, 16), hatMat);
        tricornBase.position.set(0.72, 1.32, 0);
        group.add(tricornBase);

        // Lipatan tepi topi depan & belakang
        const frontFlap = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.36, 0.7), hatMat);
        frontFlap.position.set(1.02, 1.38, 0);
        frontFlap.rotation.z = 0.2;
        group.add(frontFlap);

        // Lambang Tengkorak Putih di Topi Depan
        const skullBadge = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        skullBadge.position.set(1.12, 1.38, 0);
        group.add(skullBadge);

        // Penutup Mata (Eyepatch) di Mata Kiri
        const patchMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
        const eyePatch = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), patchMat);
        eyePatch.scale.set(0.6, 1.1, 1.1);
        eyePatch.position.set(0.92, 0.86, -0.24);
        group.add(eyePatch);

        // Tali Eyepatch
        const strapMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
        const strap = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.02, 6, 20), strapMat);
        strap.rotation.y = 0.4;
        strap.position.set(0.75, 0.82, 0);
        group.add(strap);

        // Mata Kanan Sebelahnya (Mata Normal Bajak Laut)
        const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), eyeMatDark);
        rightEye.position.set(0.9, 0.86, 0.24);
        group.add(rightEye);

        // Anting Emas Melingkar di Telinga Kanan
        const earring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 8, 16), goldMat);
        earring.position.set(0.68, 0.75, 0.55);
        earring.rotation.y = Math.PI / 2;
        group.add(earring);
        break;
      }

      case 7: { // BEBEK PENYIHIR ASTRAL (ASTRAL ARCHMAGE)
        const hatMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.4 });
        const goldBandMat = new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          metalness: 0.7,
          roughness: 0.2,
        });

        // Pinggiran Topi Bundar Lebar
        const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.04, 20), hatMat);
        hatBrim.position.set(0.75, 1.24, 0);
        group.add(hatBrim);

        // Kerucut Topi Penyihir Tinggi Menekuk
        const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.95, 16), hatMat);
        hatCone.position.set(0.68, 1.68, 0);
        hatCone.rotation.z = -0.15;
        group.add(hatCone);

        // Pita Emas di Pangkal Topi
        const hatBand = new THREE.Mesh(
          new THREE.CylinderGeometry(0.44, 0.44, 0.08, 16, 1, true),
          goldBandMat
        );
        hatBand.position.set(0.74, 1.3, 0);
        group.add(hatBand);

        // Bintang Emas Berkilau di Puncak Topi
        const starMat = new THREE.MeshStandardMaterial({
          color: 0xfde047,
          emissive: 0xeab308,
          emissiveIntensity: 0.8,
        });
        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), starMat);
        star.position.set(0.55, 2.2, 0);
        group.add(star);

        // Bola Kristal Gaib Mengambang di Dekat Sayap
        const orbMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.8,
          roughness: 0.1,
        });
        const magicOrb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), orbMat);
        magicOrb.position.set(0.4, 0.65, 1.1);
        group.add(magicOrb);

        const orbRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.24, 0.02, 6, 16),
          goldBandMat
        );
        orbRing.rotation.x = 0.5;
        orbRing.position.set(0.4, 0.65, 1.1);
        group.add(orbRing);
        break;
      }

      case 8: { // BEBEK ASTRONAUT APOLLO
        // Cincin Leher Perak Kedap Udara
        const collarMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          metalness: 0.9,
          roughness: 0.2,
        });
        const neckRing = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.08, 8, 20), collarMat);
        neckRing.rotation.x = Math.PI / 2;
        neckRing.position.set(0.72, 0.48, 0);
        group.add(neckRing);

        // Helm Kubah Astronot Kaca Transparan
        const glassMat = new THREE.MeshStandardMaterial({
          color: 0x67e8f9,
          transparent: true,
          opacity: 0.42,
          roughness: 0.1,
          metalness: 0.2,
        });
        const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.72, 20, 20), glassMat);
        helmet.position.set(0.78, 0.78, 0);
        group.add(helmet);

        // Tabung Tangki Oksigen Ganda di Punggung
        const tankMat = new THREE.MeshStandardMaterial({
          color: 0xf1f5f9,
          metalness: 0.3,
          roughness: 0.3,
        });
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });

        [-0.26, 0.26].forEach((tz) => {
          const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.75, 12), tankMat);
          tank.rotation.z = -Math.PI / 3;
          tank.position.set(-0.45, 0.65, tz);
          group.add(tank);

          const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.1, 12), stripeMat);
          stripe.rotation.z = -Math.PI / 3;
          stripe.position.set(-0.45, 0.65, tz);
          group.add(stripe);
        });
        break;
      }

      case 9: { // BEBEK GAMER RETRO RGB
        const headsetMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
        const rgbRingMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

        // Bando Headset di Atas Kepala
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.05, 8, 20, Math.PI), headsetMat);
        band.rotation.y = Math.PI / 2;
        band.position.set(0.75, 0.75, 0);
        group.add(band);

        // Dua Earcup Bulat Tebal di Telinga Kiri & Kanan
        [-0.54, 0.54].forEach((ez) => {
          const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 16), headsetMat);
          cup.rotation.x = Math.PI / 2;
          cup.position.set(0.75, 0.75, ez);
          group.add(cup);

          const rgbRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 6, 16), rgbRingMat);
          rgbRing.position.set(0.75, 0.75, ez + (ez > 0 ? 0.08 : -0.08));
          group.add(rgbRing);
        });

        // Mikrofon Boom Gaming ke Samping Paruh
        const micStem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6),
          headsetMat
        );
        micStem.position.set(1.02, 0.66, 0.35);
        micStem.rotation.z = -Math.PI / 3;
        group.add(micStem);

        const micTip = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0x22c55e })
        );
        micTip.position.set(1.18, 0.58, 0.28);
        group.add(micTip);

        // Kacamata Hitam Retro Shades
        const shadesMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
        const shades = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.58), shadesMat);
        shades.position.set(0.95, 0.86, 0);
        group.add(shades);
        break;
      }

      case 10: { // BEBEK NAGA MAGMA API
        // Sepasang Tanduk Naga Obsidian Tajam Melengkung
        const hornMat = new THREE.MeshStandardMaterial({
          color: 0x09090b,
          roughness: 0.3,
          metalness: 0.5,
        });

        [-0.26, 0.26].forEach((hz) => {
          const horn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.55, 8), hornMat);
          horn.rotation.z = -0.65;
          horn.rotation.x = hz > 0 ? 0.3 : -0.3;
          horn.position.set(0.55, 1.35, hz);
          group.add(horn);
        });

        // Duri Punggung Naga Magma (Spines) Membara
        const spineMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xdc2626,
          emissiveIntensity: 0.7,
        });

        const spinePositions = [
          { x: 0.45, y: 1.15, h: 0.22 },
          { x: 0.2, y: 0.95, h: 0.28 },
          { x: -0.15, y: 0.92, h: 0.32 },
          { x: -0.5, y: 0.82, h: 0.28 },
          { x: -0.8, y: 0.65, h: 0.22 },
        ];

        spinePositions.forEach((sp) => {
          const spine = new THREE.Mesh(new THREE.ConeGeometry(0.07, sp.h, 6), spineMat);
          spine.position.set(sp.x, sp.y, 0);
          spine.rotation.z = -0.2;
          group.add(spine);
        });

        // Mata Api Oranye Terbakar
        [-0.24, 0.24].forEach((ez) => {
          const fireEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.09, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xff5500 })
          );
          fireEye.position.set(0.9, 0.86, ez);
          group.add(fireEye);
        });
        break;
      }
    }

    return {
      group,
      duckMat,
      beakMat,
      meta,
      id
    };
  }

  // BANK SOAL DUCK RUSH (50 Soal Beragam: Matematika, Coding, Kampus, Umum)
  const DUCK_QUESTION_BANK = [
    // Matematika & Logika Cepat
    { q: '2 + 5 x 2 = ?', options: ['14', '12', '10', '16'], correct: 1 },
    { q: '5 + 5 x 0 + 5 = ?', options: ['5', '10', '0', '15'], correct: 1 },
    { q: 'Berapa jumlah sudut pada sebuah lingkaran?', options: ['0 sudut', '1 sudut', '360 sudut', 'Tak terhingga'], correct: 0 },
    { q: 'Ada 10 bebek di kali, ditembak 1 sisa berapa?', options: ['9 ekor', '0 (kabur semua)', '1 ekor', '10 ekor'], correct: 1 },
    { q: 'Setengah dari 2 + 2 adalah?', options: ['2', '3', '1', '4'], correct: 1 },
    { q: '1 jam + 90 menit = berapa jam?', options: ['2.5 jam', '2 jam', '3 jam', '1.9 jam'], correct: 0 },
    { q: 'Berapa hasil dari 3 pangkat 3?', options: ['27', '9', '18', '81'], correct: 0 },
    { q: 'Jika kemarin hari Rabu, besok lusa hari apa?', options: ['Sabtu', 'Kamis', 'Jumat', 'Minggu'], correct: 0 },
    { q: 'Sebuah segitiga memiliki berapa jumlah total sudut dalam?', options: ['180°', '90°', '360°', '270°'], correct: 0 },
    { q: 'Jika 3 kucing tangkap 3 tikus dalam 3 menit, 1 kucing butuh berapa menit untuk 1 tikus?', options: ['3 menit', '1 menit', '9 menit', 'Tak terhingga'], correct: 0 },
    { q: 'Berapa huruf dalam kata "BEBEK"?', options: ['5 huruf', '4 huruf', '6 huruf', '3 huruf'], correct: 0 },
    { q: 'Berapa jumlah kaki pada seekor laba-laba?', options: ['8 kaki', '6 kaki', '4 kaki', '10 kaki'], correct: 0 },

    // Teknologi, Coding & AI
    { q: 'Apakah HTML termasuk Bahasa Pemrograman?', options: ['Bukan (Markup)', 'Iya Programming', 'Tergantung Dosen', 'Bahasa Alien'], correct: 0 },
    { q: 'Tombol keyboard untuk Paste di Windows?', options: ['Ctrl + V', 'Ctrl + C', 'Ctrl + P', 'Ctrl + Z'], correct: 0 },
    { q: '1 Byte terdiri dari berapa Bit?', options: ['8 Bit', '4 Bit', '16 Bit', '32 Bit'], correct: 0 },
    { q: 'Singkatan dari AI adalah?', options: ['Artificial Intelligence', 'Auto Internet', 'Apple Intelligence', 'Action Info'], correct: 0 },
    { q: 'RAM merupakan singkatan dari?', options: ['Random Access Memory', 'Read All Memory', 'Run Action Mode', 'Real App Module'], correct: 0 },
    { q: 'HTTP status code untuk "Not Found" adalah?', options: ['404', '200', '403', '500'], correct: 0 },
    { q: '1 Kilobyte (KB) tepatnya setara dengan berapa Bytes?', options: ['1024 Bytes', '1000 Bytes', '512 Bytes', '2048 Bytes'], correct: 0 },
    { q: 'Bug pertama di komputer tahun 1947 berasal dari?', options: ['Serangga (Ngengat)', 'Kecoa', 'Virus Komputer', 'Salah Solder'], correct: 0 },
    { q: 'Siapakah pencipta kernel sistem operasi Linux?', options: ['Linus Torvalds', 'Bill Gates', 'Steve Jobs', 'Mark Zuckerberg'], correct: 0 },
    { q: 'Protokol aman untuk browsing website adalah?', options: ['HTTPS', 'HTTP', 'FTP', 'SMTP'], correct: 0 },
    { q: 'Bahasa pemrograman dengan maskot ular bernama?', options: ['Python', 'Java', 'C++', 'Ruby'], correct: 0 },
    { q: 'Perangkat penunjuk cursor laptop selain mouse?', options: ['Touchpad', 'Keyboard', 'Webcam', 'Speaker'], correct: 0 },
    { q: 'Ekstensi file untuk stylesheet tampilan website?', options: ['.css', '.html', '.js', '.png'], correct: 0 },
    { q: 'Kombinasi shortcut Ctrl + Z di komputer berfungsi untuk?', options: ['Undo (Batalkan)', 'Redo (Ulangi)', 'Save (Simpan)', 'Delete (Hapus)'], correct: 0 },
    { q: 'Singkatan dari URL pada alamat website adalah?', options: ['Uniform Resource Locator', 'Universal Route Link', 'United Record List', 'User Read Logic'], correct: 0 },

    // Kehidupan Kampus & Mahasiswa
    { q: 'Kepanjangan dari KRS saat awal semester?', options: ['Kartu Rencana Studi', 'Kartu Registrasi Siswa', 'Kartu Rapor Semester', 'Kelompok Riset Sains'], correct: 0 },
    { q: 'Tugas akhir mahasiswa tingkat S1 dinamakan?', options: ['Skripsi', 'Tesis', 'Disertasi', 'Laporan Magang'], correct: 0 },
    { q: 'Musuh terbesar mahasiswa saat malam sebelum deadline?', options: ['Semua Benar', 'Revisi Dadakan', 'Rasa Kantuk', 'WiFi Lemot'], correct: 0 },
    { q: 'Berapa batas waktu revisi umum setelah sidang?', options: ['1 - 2 Minggu', '1 Hari', '1 Semester', 'Tidak ada batas'], correct: 0 },
    { q: 'Singkatan dari IPK adalah?', options: ['Indeks Prestasi Kumulatif', 'Ikatan Pelajar Kreatif', 'Izin Praktik Kerja', 'Indeks Penilaian Kuliah'], correct: 0 },
    { q: 'Dosen yang bertugas membimbing skripsi disebut?', options: ['Dosen Pembimbing', 'Dosen Penguji', 'Dosen Wali', 'Dekan'], correct: 0 },
    { q: 'Istilah kuliah online interaktif disebut?', options: ['Daring', 'Luring', 'Hybrid', 'Overclock'], correct: 0 },
    { q: 'Saat dosen penguji bertanya di sidang, respon terbaik?', options: ['Jawab Tenang & Lugas', 'Pura-pura Pingsan', 'Kabur Keluar Ruangan', 'Menangis Bersama'], correct: 0 },
    { q: 'Gelar akademik sarjana bidang ilmu komputer di Indonesia?', options: ['S.Kom', 'S.T', 'S.Pd', 'S.Si'], correct: 0 },

    // Pengetahuan Umum & Populer
    { q: 'Ibukota negara Indonesia yang baru bernama?', options: ['IKN (Nusantara)', 'Jakarta', 'Surabaya', 'Bandung'], correct: 0 },
    { q: 'Gunung tertinggi di Indonesia adalah?', options: ['Puncak Jaya (Carstensz)', 'Gunung Rinjani', 'Gunung Semeru', 'Gunung Kerinci'], correct: 0 },
    { q: 'Berapa jumlah provinsi di Indonesia saat ini?', options: ['38 Provinsi', '34 Provinsi', '37 Provinsi', '40 Provinsi'], correct: 0 },
    { q: 'Hewan darat tercepat di dunia saat ini?', options: ['Cheetah', 'Singa', 'Kuda Liar', 'Kijang'], correct: 0 },
    { q: 'Bahan utama pembuatan cokelat murni adalah?', options: ['Biji Kakao', 'Biji Kopi', 'Vanili', 'Tepung Jagung'], correct: 0 },
    { q: 'Planet terdekat dari Matahari dalam tata surya?', options: ['Merkurius', 'Venus', 'Mars', 'Bumi'], correct: 0 },
    { q: 'Lagu kebangsaan Republik Indonesia adalah?', options: ['Indonesia Raya', 'Tanah Airku', 'Garuda Pancasila', 'Halo-Halo Bandung'], correct: 0 },
    { q: 'Warna primer dalam seni rupa dasar adalah?', options: ['Merah, Kuning, Biru', 'Merah, Hijau, Biru', 'Hitam, Putih, Abu', 'Kuning, Hijau, Ungu'], correct: 0 },
    { q: 'Target audience utama bisnis model B2B adalah?', options: ['Perusahaan / Bisnis', 'Konsumen Akhir', 'Anak-anak', 'Komunitas Hobi'], correct: 0 },
    { q: 'Berapa sisi yang dimiliki bangun datar Heksagon?', options: ['6 Sisi', '5 Sisi', '7 Sisi', '8 Sisi'], correct: 0 },
    { q: 'Mata uang resmi negara Jepang adalah?', options: ['Yen', 'Won', 'Dollar', 'Rupee'], correct: 0 },
    { q: 'Candi Borobudur secara administratif terletak di provinsi?', options: ['Jawa Tengah', 'D.I. Yogyakarta', 'Jawa Timur', 'Jawa Barat'], correct: 0 },
    { q: 'Gas dengan persentase terbanyak di atmosfer Bumi adalah?', options: ['Nitrogen (~78%)', 'Oksigen (~21%)', 'Karbon Dioksida', 'Helium'], correct: 0 },
    { q: 'Apa rasa alami air laut di samudera?', options: ['Asin', 'Tawar', 'Pahit', 'Manis'], correct: 0 }
  ];

  // Helper generator dek soal acak per pemain (pertanyaan dan opsi jawaban teracak unik)
  function generatePlayerQuestionDeck() {
    const deck = [...DUCK_QUESTION_BANK];
    // Fisher-Yates shuffle array soal
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck.map((item) => {
      const originalCorrectText = item.options[item.correct];
      const randomizedOptions = [...item.options];
      for (let i = randomizedOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomizedOptions[i], randomizedOptions[j]] = [randomizedOptions[j], randomizedOptions[i]];
      }
      const newCorrectIdx = randomizedOptions.indexOf(originalCorrectText);
      return {
        q: item.q,
        options: randomizedOptions,
        correct: newCorrectIdx,
      };
    });
  }

  // Daftarkan ke Global window
  window.DUCK_CHARACTERS = DUCK_CHARACTERS;
  window.createDuck3DMesh = createDuck3DMesh;
  window.QUESTION_BANK = DUCK_QUESTION_BANK;
  window.generatePlayerQuestionDeck = generatePlayerQuestionDeck;
})();
