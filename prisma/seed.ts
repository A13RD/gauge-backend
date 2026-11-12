import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import process from 'node:process';

const prisma = new PrismaClient();

async function main() {
  console.log('[Prisma Seed] Iniciando siembra y enriquecimiento de datos de prueba para DEVELOPMENT...');

  const passwordSalt = 10;
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', passwordSalt);
  const userPasswordHash = await bcrypt.hash('UserPass123!', passwordSalt);
  const devPasswordHash = await bcrypt.hash('DevTest2026!', passwordSalt);

  // -------------------------------------------------------------
  // 1. Usuarios Base Existentes (Conservados intactos)
  // -------------------------------------------------------------
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gauge.com' },
    update: {
      name: 'Admin GAUGE',
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      name: 'Admin GAUGE',
      email: 'admin@gauge.com',
      password: adminPasswordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@gauge.com' },
    update: {
      name: 'Leon Kennedy',
      role: Role.USER,
      isActive: true,
    },
    create: {
      name: 'Leon Kennedy',
      email: 'user@gauge.com',
      password: userPasswordHash,
      role: Role.USER,
      isActive: true,
    },
  });

  console.log(`[INFO] Usuarios base verificados: ${admin.email} (ADMIN), ${user.email} (USER)`);

  // -------------------------------------------------------------
  // 2. Verificación de Cuenta 'yocomolego@gmail.com'
  // Si existe -> ASIGNAR ADMIN sin alterar sus demás campos.
  // Si no existe -> Informar y NO crearla sin autorización.
  // -------------------------------------------------------------
  const yocomolegoUser = await prisma.user.findUnique({
    where: { email: 'yocomolego@gmail.com' },
  });

  if (yocomolegoUser) {
    const updatedYocomolego = await prisma.user.update({
      where: { id: yocomolegoUser.id },
      data: { role: Role.ADMIN },
    });
    console.log(`[INFO] Cuenta existente '${updatedYocomolego.email}' actualizada exitosamente a rol ADMIN.`);
  } else {
    console.log("[AVISO] La cuenta 'yocomolego@gmail.com' no fue encontrada en la base de datos Neon. No se modificó ni creó ninguna cuenta con dicho correo.");
  }

  // -------------------------------------------------------------
  // 3. Creación de los 3 Nuevos Usuarios de Prueba
  // -------------------------------------------------------------
  // Perfil A: Jugador Competitivo (Shooters, Acción, Rendimiento)
  const competitiveUser = await prisma.user.upsert({
    where: { email: 'dev.competitive@gauge.local' },
    update: {
      name: 'Alex "Viper" Stone (Pro Gamer)',
      role: Role.USER,
      isActive: true,
    },
    create: {
      name: 'Alex "Viper" Stone (Pro Gamer)',
      email: 'dev.competitive@gauge.local',
      password: devPasswordHash,
      role: Role.USER,
      isActive: true,
    },
  });

  // Perfil B: Amante de Historias (RPGs, Aventura, Narrativa profunda)
  const narrativeUser = await prisma.user.upsert({
    where: { email: 'dev.narrative@gauge.local' },
    update: {
      name: 'Elena Rostova (Lore Seeker)',
      role: Role.USER,
      isActive: true,
    },
    create: {
      name: 'Elena Rostova (Lore Seeker)',
      email: 'dev.narrative@gauge.local',
      password: devPasswordHash,
      role: Role.USER,
      isActive: true,
    },
  });

  // Perfil C: Jugador Casual (Indie, Plataformas, Accesibilidad y diversión)
  const casualUser = await prisma.user.upsert({
    where: { email: 'dev.casual@gauge.local' },
    update: {
      name: 'Mateo Chill (Casual Explorer)',
      role: Role.USER,
      isActive: true,
    },
    create: {
      name: 'Mateo Chill (Casual Explorer)',
      email: 'dev.casual@gauge.local',
      password: devPasswordHash,
      role: Role.USER,
      isActive: true,
    },
  });

  console.log(`[INFO] 3 Nuevos perfiles de prueba sembrados:`);
  console.log(`- Perfil A (Competitivo): ${competitiveUser.email}`);
  console.log(`- Perfil B (Narrativo): ${narrativeUser.email}`);
  console.log(`- Perfil C (Casual): ${casualUser.email}`);

  // -------------------------------------------------------------
  // 4. Catálogo de Géneros (11 Categorías Coherentes)
  // -------------------------------------------------------------
  const genresData = [
    { name: 'Survival Horror', slug: 'survival-horror' },
    { name: 'Action', slug: 'action' },
    { name: 'RPG', slug: 'rpg' },
    { name: 'Metroidvania', slug: 'metroidvania' },
    { name: 'Adventure', slug: 'adventure' },
    { name: 'Shooter', slug: 'shooter' },
    { name: 'Strategy', slug: 'strategy' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Simulation', slug: 'simulation' },
    { name: 'Platformer', slug: 'platformer' },
    { name: 'Indie', slug: 'indie' },
  ];

  const genres: Record<string, { id: string; name: string; slug: string }> = {};

  for (const g of genresData) {
    const genre = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: { name: g.name },
      create: { name: g.name, slug: g.slug },
    });
    genres[g.slug] = genre;
  }

  console.log(`[INFO] Géneros disponibles en Neon: ${Object.keys(genres).length} géneros`);

  // -------------------------------------------------------------
  // 5. Catálogo de Videojuegos (6 existentes + 20 nuevos = 26 títulos)
  // -------------------------------------------------------------
  const gamesData = [
    // --- 6 Existentes ---
    {
      title: 'Silent Hill 2 Remake',
      description:
        'Una obra maestra del survival horror psicológico. Habiendo recibido una carta de su difunta esposa, James se dirige al lugar donde compartieron tantos recuerdos con la esperanza de verla una vez más: Silent Hill.',
      coverUrl:
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2024-10-08T00:00:00.000Z'),
      genreId: genres['survival-horror'].id,
    },
    {
      title: 'Valorant',
      description:
        'Shooter táctico en primera persona 5v5 impulsado por personajes con habilidades únicas y tiroteo de precisión milimétrica.',
      coverUrl:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2020-06-02T00:00:00.000Z'),
      genreId: genres['action'].id,
    },
    {
      title: 'Elden Ring',
      description:
        'Álzate, Sinluz, y déjate guiar por la gracia para esgrimir el poder del Círculo de Elden y convertirte en el Señor de Elden en las Tierras Intermedias.',
      coverUrl:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2022-02-25T00:00:00.000Z'),
      genreId: genres['rpg'].id,
    },
    {
      title: 'Hollow Knight',
      description:
        'Forja tu propio camino en Hollow Knight. Una aventura de acción clásica en 2D a través de un vasto mundo interconectado de insectos y héroes.',
      coverUrl:
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2017-02-24T00:00:00.000Z'),
      genreId: genres['metroidvania'].id,
    },
    {
      title: 'Resident Evil 4 Remake',
      description:
        'La supervivencia es solo el principio. Seis años después de la catástrofe biológica en Raccoon City, Leon S. Kennedy es enviado a una misión para rescatar a la hija del presidente.',
      coverUrl:
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2023-03-24T00:00:00.000Z'),
      genreId: genres['survival-horror'].id,
    },
    {
      title: 'Cyberpunk 2077',
      description:
        'Un RPG de acción y aventura en mundo abierto ambientado en la megalópolis de Night City, obsesionada con el poder, el glamur y la modificación corporal.',
      coverUrl:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2020-12-10T00:00:00.000Z'),
      genreId: genres['rpg'].id,
    },

    // --- 20 Nuevos Títulos Reales y Variados ---
    {
      title: 'DOOM Eternal',
      description:
        'Los ejércitos del infierno han invadido la Tierra. Ponte en la piel del Slayer en una épica campaña monojugador para vencer a los demonios y detener la destrucción definitiva de la humanidad.',
      coverUrl:
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2020-03-20T00:00:00.000Z'),
      genreId: genres['shooter'].id,
    },
    {
      title: 'Counter-Strike 2',
      description:
        'El mayor salto técnico en la historia de la saga Counter-Strike. Con nuevo motor Source 2, humo volumétrico dinámico y servidores sub-tick para el shooter táctico competitivo por excelencia.',
      coverUrl:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2023-09-27T00:00:00.000Z'),
      genreId: genres['shooter'].id,
    },
    {
      title: 'Apex Legends',
      description:
        'Conquista con carácter en Apex Legends, un shooter battle royale gratuito donde personajes legendarios con poderosas habilidades forman equipos para luchar por la gloria en las Tierras Salvajes.',
      coverUrl:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2019-02-04T00:00:00.000Z'),
      genreId: genres['shooter'].id,
    },
    {
      title: 'God of War Ragnarök',
      description:
        'Kratos y Atreus deben viajar a cada uno de los Nueve Reinos en busca de respuestas mientras las fuerzas asgardianas se preparan para la batalla profetizada que acabará con el mundo.',
      coverUrl:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2022-11-09T00:00:00.000Z'),
      genreId: genres['action'].id,
    },
    {
      title: 'Devil May Cry 5',
      description:
        'El cazador de demonios definitivo vuelve por todo lo alto en el juego de acción con más estilo de la historia. Domina el combate con Nero, Dante y el misterioso V.',
      coverUrl:
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2019-03-08T00:00:00.000Z'),
      genreId: genres['action'].id,
    },
    {
      title: 'Baldur’s Gate 3',
      description:
        'Reúne a tu grupo y regresa a los Reinos Olvidados en una historia de compañerismo, traición, sacrificio y supervivencia, y la atracción de un poder absoluto. RPG narrativo de nueva generación.',
      coverUrl:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2023-08-03T00:00:00.000Z'),
      genreId: genres['rpg'].id,
    },
    {
      title: 'The Witcher 3: Wild Hunt',
      description:
        'Geralt de Rivia, cazador de monstruos a sueldo, viaja por un mundo desgarrado por la guerra en busca de la Niña de la Profecía, un arma viviente capaz de alterar el equilibrio del mundo.',
      coverUrl:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2015-05-19T00:00:00.000Z'),
      genreId: genres['rpg'].id,
    },
    {
      title: 'The Legend of Zelda: Tears of the Kingdom',
      description:
        'Una épica aventura por la superficie y los vastos cielos de Hyrule. Desarrolla tus propias creaciones con la ultramano y desentraña el misterio del Cataclismo en esta obra maestra.',
      coverUrl:
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2023-05-12T00:00:00.000Z'),
      genreId: genres['adventure'].id,
    },
    {
      title: 'Red Dead Redemption 2',
      description:
        'América, 1899. El ocaso del salvaje oeste ha comenzado. Arthur Morgan y la banda de Van der Linde son forajidos en fuga. Deberán abrirse paso a tiros por el agreste corazón de Estados Unidos para sobrevivir.',
      coverUrl:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2018-10-26T00:00:00.000Z'),
      genreId: genres['adventure'].id,
    },
    {
      title: 'Uncharted 4: A Thief’s End',
      description:
        'Tres años después de los eventos de Uncharted 3, Nathan Drake ha dejado atrás la búsqueda de tesoros. Sin embargo, el destino toca a su puerta cuando su hermano Sam reaparece pidiéndole ayuda.',
      coverUrl:
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2016-05-10T00:00:00.000Z'),
      genreId: genres['adventure'].id,
    },
    {
      title: 'Dead Space Remake',
      description:
        'El clásico del terror de supervivencia de ciencia ficción regresa completamente reconstruido desde cero para ofrecer una experiencia más profunda y envolvente a bordo de la USG Ishimura.',
      coverUrl:
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2023-01-27T00:00:00.000Z'),
      genreId: genres['survival-horror'].id,
    },
    {
      title: 'Alan Wake 2',
      description:
        'Una serie de asesinatos rituales amenaza Bright Falls. Saga Anderson, una brillante agente del FBI, llega para investigar, entrelazando su destino con el del escritor Alan Wake atrapado en el Lugar Oscuro.',
      coverUrl:
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2023-10-27T00:00:00.000Z'),
      genreId: genres['survival-horror'].id,
    },
    {
      title: 'Celeste',
      description:
        'Ayuda a Madeline a sobrevivir a sus demonios internos en su viaje a la cima de la montaña Celeste, en este juego de plataformas súper preciso y conmovedor de los creadores de TowerFall.',
      coverUrl:
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2018-01-25T00:00:00.000Z'),
      genreId: genres['platformer'].id,
    },
    {
      title: 'Super Mario Odyssey',
      description:
        'Embárcate en una aventura en 3D por todo el mundo con Mario y su nuevo aliado Cappy para rescatar a la princesa Peach de los planes de boda de Bowser.',
      coverUrl:
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2017-10-27T00:00:00.000Z'),
      genreId: genres['platformer'].id,
    },
    {
      title: 'Hades',
      description:
        'Desafía al dios de los muertos mientras hackeas y cortas tu camino fuera del Inframundo en este roguelike de acción vertiginosa aclamado por la crítica mundial.',
      coverUrl:
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2020-09-17T00:00:00.000Z'),
      genreId: genres['indie'].id,
    },
    {
      title: 'Sea of Stars',
      description:
        'RPG por turnos inspirado en los grandes clásicos de los 90. Cuenta la historia de dos Hijos del Solsticio que combinan los poderes del sol y la luna para realizar magia de eclipse.',
      coverUrl:
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2023-08-29T00:00:00.000Z'),
      genreId: genres['indie'].id,
    },
    {
      title: 'Sid Meier’s Civilization VI',
      description:
        'Construye un imperio que resista el paso del tiempo. Explora nuevos territorios, investiga tecnologías, conquista a tus enemigos y enfréntate a los líderes históricos más renombrados.',
      coverUrl:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2016-10-21T00:00:00.000Z'),
      genreId: genres['strategy'].id,
    },
    {
      title: 'Age of Empires IV',
      description:
        'Uno de los juegos de estrategia en tiempo real más queridos vuelve a la gloria con Age of Empires IV, situándote en el centro de batallas históricas que dieron forma al mundo moderno.',
      coverUrl:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2021-10-28T00:00:00.000Z'),
      genreId: genres['strategy'].id,
    },
    {
      title: 'EA SPORTS FC 24',
      description:
        'Una nueva era para el juego de todos. La experiencia de fútbol más auténtica de la historia con más de 19,000 futbolistas, 700 equipos y 30 ligas con tecnología HyperMotionV.',
      coverUrl:
        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2023-09-29T00:00:00.000Z'),
      genreId: genres['sports'].id,
    },
    {
      title: 'Microsoft Flight Simulator',
      description:
        'Desde aviones ligeros hasta reactores de fuselaje ancho, pilota aeronaves sumamente detalladas y precisas en una nueva generación de simulación atmosférica hiperrealista.',
      coverUrl:
        'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2020-08-18T00:00:00.000Z'),
      genreId: genres['simulation'].id,
    },
  ];

  const games: Record<string, { id: string; title: string }> = {};

  for (const gameData of gamesData) {
    const existingGame = await prisma.game.findFirst({
      where: { title: gameData.title },
    });

    if (existingGame) {
      const updated = await prisma.game.update({
        where: { id: existingGame.id },
        data: {
          description: gameData.description,
          coverUrl: gameData.coverUrl,
          bannerUrl: gameData.bannerUrl,
          releaseDate: gameData.releaseDate,
          genreId: gameData.genreId,
          isDeleted: false,
        },
      });
      games[gameData.title] = updated;
    } else {
      const created = await prisma.game.create({
        data: gameData,
      });
      games[gameData.title] = created;
    }
  }

  console.log(`[INFO] Videojuegos sembrados en Neon: ${Object.keys(games).length} títulos registrados`);

  // -------------------------------------------------------------
  // 6. Reseñas Comunitarias Realistas y Coherentes con los Perfiles
  // -------------------------------------------------------------
  const reviewsData = [
    // --- Reseñas Base de los usuarios anteriores ---
    {
      userEmail: 'user@gauge.com',
      gameTitle: 'Silent Hill 2 Remake',
      rating: 10,
      content:
        'Una recreación perfecta de la atmósfera opresiva del clásico original. El diseño sonoro te mantiene al borde del asiento en todo momento.',
      hoursPlayed: 35,
    },
    {
      userEmail: 'user@gauge.com',
      gameTitle: 'Resident Evil 4 Remake',
      rating: 9,
      content:
        'El ritmo de acción y combate es impecable. Los cambios en el castillo y la aldea elevan la experiencia al estándar moderno.',
      hoursPlayed: 50,
    },
    {
      userEmail: 'user@gauge.com',
      gameTitle: 'Elden Ring',
      rating: 10,
      content:
        'La sensación de descubrimiento en las Tierras Intermedias es incomparable. Cada rincón del mapa esconde secretos y desafíos desafiantes.',
      hoursPlayed: 120,
    },
    {
      userEmail: 'admin@gauge.com',
      gameTitle: 'Hollow Knight',
      rating: 9,
      content:
        'Diseño de niveles magistral con una banda sonora inolvidable y combate preciso. De los mejores metroidvanias de la historia.',
      hoursPlayed: 45,
    },

    // --- Perfil A: Jugador Competitivo (Shooter, Rendimiento, Horas Altas) ---
    {
      userEmail: 'dev.competitive@gauge.local',
      gameTitle: 'Counter-Strike 2',
      rating: 9,
      content:
        'El gunplay y el registro de disparos con el sistema sub-tick se sienten muy limpios tras las últimas actualizaciones. Las granadas de humo volumétricas cambian por completo la toma de sitios. Vital jugar con equipo coordinado para subir en Premier.',
      hoursPlayed: 480,
    },
    {
      userEmail: 'dev.competitive@gauge.local',
      gameTitle: 'DOOM Eternal',
      rating: 10,
      content:
        'Puro ajedrez de combate a velocidad supersónica. La gestión del ciclo de recursos (motosierra, lanzallamas, remates) te obliga a jugar de manera agresiva y técnica. Cero caídas de frames en ultra nightmare.',
      hoursPlayed: 95,
    },
    {
      userEmail: 'dev.competitive@gauge.local',
      gameTitle: 'Apex Legends',
      rating: 7,
      content:
        'La movilidad basada en deslizarse, wall-bounces y tirolinas sigue siendo la cúspide del battle royale. Sin embargo, el emparejamiento por MMR y los servidores de 20 tick lastran la experiencia competitiva en rangos de Diamante hacia arriba.',
      hoursPlayed: 310,
    },
    {
      userEmail: 'dev.competitive@gauge.local',
      gameTitle: 'Hades',
      rating: 9,
      content:
        'Mecánicas impecables de i-frames en el dash y buildcrafting profundo con las bendiciones divinas. El pacto de castigo ofrece un techo de habilidad brutal para los que buscamos speedruns.',
      hoursPlayed: 85,
    },
    {
      userEmail: 'dev.competitive@gauge.local',
      gameTitle: 'Baldur’s Gate 3',
      rating: 8,
      content:
        'El combate táctico por turnos basado en D&D 5e recompensa enormemente el posicionamiento vertical y el aprovechamiento elemental del entorno, aunque a nivel de interfaz la gestión de inventario puede ser algo engorrosa en combates masivos.',
      hoursPlayed: 45,
    },

    // --- Perfil B: Amante de Historias (RPGs, Aventura, Lore, Horas Altas) ---
    {
      userEmail: 'dev.narrative@gauge.local',
      gameTitle: 'Baldur’s Gate 3',
      rating: 10,
      content:
        'Una cumbre histórica para el género del rol occidental. La libertad de decisión real, la reactividad del mundo y la escritura de compañeros como Astarion y Shadowheart logran que cada partida sea genuinamente irrepetible.',
      hoursPlayed: 160,
    },
    {
      userEmail: 'dev.narrative@gauge.local',
      gameTitle: 'The Witcher 3: Wild Hunt',
      rating: 10,
      content:
        'Un estándar de oro para el diseño de misiones secundarias. La trama del Barón Sanguinario y las decisiones con consecuencias morales ambiguas hacen que el viaje de Geralt siga siendo insuperable casi una década después.',
      hoursPlayed: 175,
    },
    {
      userEmail: 'dev.narrative@gauge.local',
      gameTitle: 'Red Dead Redemption 2',
      rating: 10,
      content:
        'El arco de redención de Arthur Morgan es una de las mayores hazañas narrativas en la historia del entretenimiento. La atención meticulosa a cada detalle ambiental crea una inmersión cinematográfica inigualable.',
      hoursPlayed: 130,
    },
    {
      userEmail: 'dev.narrative@gauge.local',
      gameTitle: 'The Legend of Zelda: Tears of the Kingdom',
      rating: 9,
      content:
        'La melancolía que impregna el lore de los Dragones y la historia de los Sabios eleva la experiencia. Explorar las islas del cielo y las profundidades del subsuelo despierta un asombro genuino en cada rincón.',
      hoursPlayed: 90,
    },
    {
      userEmail: 'dev.narrative@gauge.local',
      gameTitle: 'Alan Wake 2',
      rating: 9,
      content:
        'Narrativa de autor experimental fascinante. Remedy fusiona metanarrativa, live-action y terror psicológico en una espiral detectivesca brillante que desafía las convenciones del medio.',
      hoursPlayed: 30,
    },
    {
      userEmail: 'dev.narrative@gauge.local',
      gameTitle: 'Civilization VI',
      rating: 8,
      content:
        'Evolucionar tu civilización desde la Edad de Piedra hasta la era espacial produce una satisfacción narrativa única. Cada partida cuenta una historia geopolítica diferente.',
      hoursPlayed: 65,
    },

    // --- Perfil C: Jugador Casual (Indie, Plataformas, Experiencias Breves y Frescas) ---
    {
      userEmail: 'dev.casual@gauge.local',
      gameTitle: 'Celeste',
      rating: 9,
      content:
        'Un plataformero precioso con controles súper responsivos. Morir cientos de veces nunca se siente frustrante porque reapareces de inmediato. El mensaje sobre superar la ansiedad y aceptarse a uno mismo es hermoso.',
      hoursPlayed: 22,
    },
    {
      userEmail: 'dev.casual@gauge.local',
      gameTitle: 'Super Mario Odyssey',
      rating: 10,
      content:
        'Pura diversión y creatividad de principio a fin. El movimiento con Cappy es intuitivo y la variedad temática de los mundos es una explosión de alegría tanto para sesiones cortas como largas.',
      hoursPlayed: 35,
    },
    {
      userEmail: 'dev.casual@gauge.local',
      gameTitle: 'Sea of Stars',
      rating: 8,
      content:
        'Pixel art deslumbrante y una banda sonora nostálgica que te abraza. Ideal para relajarse por las tardes sin complicarse con árboles de habilidades complejos.',
      hoursPlayed: 28,
    },
    {
      userEmail: 'dev.casual@gauge.local',
      gameTitle: 'Hades',
      rating: 9,
      content:
        'El juego perfecto para jugar partidas de 20 a 30 minutos. El estilo de cómic, el doblaje y cómo avanza la historia con cada intento de escape te atrapa por completo.',
      hoursPlayed: 25,
    },
    {
      userEmail: 'dev.casual@gauge.local',
      gameTitle: 'Counter-Strike 2',
      rating: 6,
      content:
        'Gráficamente se ve mucho mejor que el anterior, pero para alguien casual que solo quiere jugar unas partidas rápidas en el fin de semana, la curva de entrada es empinada y hay demasiada toxicidad.',
      hoursPlayed: 18,
    },
  ];

  // Mapa de usuarios para enlazar reseñas
  const usersMap: Record<string, { id: string }> = {
    'admin@gauge.com': admin,
    'user@gauge.com': user,
    'dev.competitive@gauge.local': competitiveUser,
    'dev.narrative@gauge.local': narrativeUser,
    'dev.casual@gauge.local': casualUser,
  };

  let reviewsCount = 0;

  for (const rev of reviewsData) {
    const targetUser = usersMap[rev.userEmail];
    const targetGame = games[rev.gameTitle];

    if (targetUser && targetGame) {
      const existingReview = await prisma.review.findFirst({
        where: {
          userId: targetUser.id,
          gameId: targetGame.id,
        },
      });

      if (existingReview) {
        await prisma.review.update({
          where: { id: existingReview.id },
          data: {
            rating: rev.rating,
            content: rev.content,
            hoursPlayed: rev.hoursPlayed,
            isDeleted: false,
          },
        });
      } else {
        await prisma.review.create({
          data: {
            userId: targetUser.id,
            gameId: targetGame.id,
            rating: rev.rating,
            content: rev.content,
            hoursPlayed: rev.hoursPlayed,
            isDeleted: false,
          },
        });
      }
      reviewsCount++;
    }
  }

  console.log(`[INFO] Reseñas procesadas e idempotentes: ${reviewsCount} reseñas registradas`);
  console.log('[Prisma Seed] Siembra de datos completada exitosamente.');
}

main()
  .catch((e) => {
    console.error('[ERROR] Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
