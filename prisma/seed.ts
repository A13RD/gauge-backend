import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import process from 'node:process';

const prisma = new PrismaClient();

async function main() {
  console.log('[Prisma Seed] Iniciando siembra de datos de prueba...');

  const passwordSalt = 10;
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', passwordSalt);
  const userPasswordHash = await bcrypt.hash('UserPass123!', passwordSalt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gauge.com' },
    update: {
      name: 'Admin GAUGE',
      password: adminPasswordHash,
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
      password: userPasswordHash,
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

  console.log(`[INFO] Usuarios sembrados: ${admin.email} (ADMIN), ${user.email} (USER)`);

  // Generos 
  const genresData = [
    { name: 'Survival Horror', slug: 'survival-horror' },
    { name: 'Action', slug: 'action' },
    { name: 'RPG', slug: 'rpg' },
    { name: 'Metroidvania', slug: 'metroidvania' },
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

  console.log(`[INFO] Géneros sembrados: ${Object.keys(genres).join(', ')}`);

  // Videojuegos
  const gamesData = [
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
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2020-06-02T00:00:00.000Z'),
      genreId: genres['action'].id,
    },
    {
      title: 'Elden Ring',
      description:
        'Álzate, Sinluz, y déjate guiar por la gracia para esgrimir el poder del Círculo de Elden y convertirte en el Señor de Elden en las Tierras Intermedias.',
      coverUrl:
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2022-02-25T00:00:00.000Z'),
      genreId: genres['rpg'].id,
    },
    {
      title: 'Hollow Knight',
      description:
        'Forja tu propio camino en Hollow Knight. Una aventura de acción clásica en 2D a través de un vasto mundo interconectado de insectos y héroes.',
      coverUrl:
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
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
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
      releaseDate: new Date('2020-12-10T00:00:00.000Z'),
      genreId: genres['rpg'].id,
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

  console.log(`[INFO] Videojuegos sembrados: ${Object.keys(games).length} títulos`);

  // Reseñas
  const reviewsData = [
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
  ];

  for (const rev of reviewsData) {
    const targetUser = rev.userEmail === 'admin@gauge.com' ? admin : user;
    const targetGame = games[rev.gameTitle];

    if (targetGame) {
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
    }
  }

  console.log(`[INFO] Reseñas sembradas: ${reviewsData.length} reseñas registradas`);
  console.log('[Prisma Seed] Siembra completada exitosamente.');
}

main()
  .catch((e) => {
    console.error('[ERROR] Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
