const http = require('http');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Cargar variables de entorno del backend de manera portable
require(path.resolve(__dirname, '../dist/infrastructure/config/env.js'));

const usersDb = new Map();
const genresDb = new Map();
const gamesDb = new Map();
const reviewsDb = new Map();

// Semillas iniciales de prueba
const passwordHashUser = bcrypt.hashSync('UserPass123!', 10);
const passwordHashAdmin = bcrypt.hashSync('AdminPass123!', 10);

const testUser = {
  id: 'usr-1111-2222',
  name: 'Standard Player',
  email: 'user@gauge.com',
  password: passwordHashUser,
  role: 'USER',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
usersDb.set(testUser.email, testUser);

const otherUser = {
  id: 'usr-9999-8888',
  name: 'Other Player',
  email: 'other@gauge.com',
  password: passwordHashUser,
  role: 'USER',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
usersDb.set(otherUser.email, otherUser);

const testAdmin = {
  id: 'adm-3333-4444',
  name: 'Admin Master',
  email: 'admin@gauge.com',
  password: passwordHashAdmin,
  role: 'ADMIN',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
usersDb.set(testAdmin.email, testAdmin);

const testGenre = {
  id: 'gen-1111-2222',
  name: 'Action RPG',
  slug: 'action-rpg',
  createdAt: new Date(),
  updatedAt: new Date(),
};
genresDb.set(testGenre.id, testGenre);

const testGame = {
  id: 'gam-1111-2222',
  title: 'Elden Ring',
  description: 'Un RPG de acción y fantasía oscura desarrollado por FromSoftware.',
  coverUrl: 'https://bcgwvstwvhdmqknycmof.supabase.co/storage/v1/object/public/game-covers/covers/elden.jpg',
  bannerUrl: null,
  releaseDate: new Date('2022-02-25'),
  genreId: testGenre.id,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};
gamesDb.set(testGame.id, testGame);

const testReview = {
  id: 'rev-1111-2222',
  userId: testUser.id,
  gameId: testGame.id,
  rating: 10,
  content: 'Obra maestra absoluta en diseño de mundo y combate.',
  hoursPlayed: 120,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};
reviewsDb.set(testReview.id, testReview);

// Implementación de mock en memoria compatible con PrismaClient
const mockPrisma = {
  user: {
    findUnique: async ({ where }) => {
      if (where.email) return usersDb.get(where.email.toLowerCase().trim()) || null;
      if (where.id) {
        for (const u of usersDb.values()) {
          if (u.id === where.id) return u;
        }
      }
      return null;
    },
    create: async ({ data }) => {
      const newUser = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'USER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      usersDb.set(data.email, newUser);
      return newUser;
    },
  },
  genre: {
    findMany: async () => Array.from(genresDb.values()),
    findUnique: async ({ where }) => {
      if (where.id) return genresDb.get(where.id) || null;
      if (where.slug) {
        for (const g of genresDb.values()) {
          if (g.slug === where.slug) return g;
        }
      }
      if (where.name) {
        for (const g of genresDb.values()) {
          if (g.name === where.name) return g;
        }
      }
      return null;
    },
    create: async ({ data }) => {
      const newGenre = {
        id: `gen-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        name: data.name,
        slug: data.slug,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      genresDb.set(newGenre.id, newGenre);
      return newGenre;
    },
    update: async ({ where, data }) => {
      const g = genresDb.get(where.id);
      if (!g) throw new Error('Not found');
      if (data.name) g.name = data.name;
      if (data.slug) g.slug = data.slug;
      g.updatedAt = new Date();
      return g;
    },
    delete: async ({ where }) => {
      genresDb.delete(where.id);
      return { id: where.id };
    },
  },
  game: {
    count: async ({ where }) => {
      let count = 0;
      for (const g of gamesDb.values()) {
        if (where?.isDeleted !== undefined && g.isDeleted !== where.isDeleted) continue;
        if (where?.genreId && g.genreId !== where.genreId) continue;
        count++;
      }
      return count;
    },
    findMany: async ({ where, skip = 0, take = 10 }) => {
      const result = [];
      for (const g of gamesDb.values()) {
        if (where?.isDeleted !== undefined && g.isDeleted !== where.isDeleted) continue;
        if (where?.genreId && g.genreId !== where.genreId) continue;
        if (where?.title?.contains && !g.title.toLowerCase().includes(where.title.contains.toLowerCase())) continue;
        result.push({
          ...g,
          genre: genresDb.get(g.genreId),
          reviews: Array.from(reviewsDb.values())
            .filter((r) => r.gameId === g.id && !r.isDeleted)
            .map((r) => ({
              ...r,
              user: usersDb.get(r.userId) || { id: r.userId, name: 'Jugador' },
            })),
        });
      }
      return result.slice(skip, skip + take);
    },
    findFirst: async ({ where }) => {
      for (const g of gamesDb.values()) {
        if (where?.id && g.id !== where.id) continue;
        if (where?.isDeleted !== undefined && g.isDeleted !== where.isDeleted) continue;
        return {
          ...g,
          genre: genresDb.get(g.genreId),
          reviews: Array.from(reviewsDb.values())
            .filter((r) => r.gameId === g.id && !r.isDeleted)
            .map((r) => ({
              ...r,
              user: usersDb.get(r.userId) || { id: r.userId, name: 'Jugador' },
            })),
        };
      }
      return null;
    },
    create: async ({ data }) => {
      const newGame = {
        id: `gam-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        title: data.title,
        description: data.description,
        coverUrl: data.coverUrl,
        bannerUrl: data.bannerUrl || null,
        releaseDate: data.releaseDate,
        genreId: data.genreId,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      gamesDb.set(newGame.id, newGame);
      return {
        ...newGame,
        genre: genresDb.get(newGame.genreId),
        reviews: [],
      };
    },
    update: async ({ where, data }) => {
      const g = gamesDb.get(where.id);
      if (!g) throw new Error('Game not found');
      if (data.title) g.title = data.title;
      if (data.description) g.description = data.description;
      if (data.coverUrl) g.coverUrl = data.coverUrl;
      if (data.bannerUrl !== undefined) g.bannerUrl = data.bannerUrl;
      if (data.releaseDate) g.releaseDate = data.releaseDate;
      if (data.genre?.connect?.id) g.genreId = data.genre.connect.id;
      if (data.isDeleted !== undefined) g.isDeleted = data.isDeleted;
      g.updatedAt = new Date();
      return {
        ...g,
        genre: genresDb.get(g.genreId),
        reviews: [],
      };
    },
  },
  review: {
    findMany: async ({ where }) => {
      const result = [];
      for (const r of reviewsDb.values()) {
        if (where?.userId && r.userId !== where.userId) continue;
        if (where?.isDeleted !== undefined && r.isDeleted !== where.isDeleted) continue;
        const game = gamesDb.get(r.gameId);
        result.push({
          ...r,
          user: usersDb.get(r.userId) || { id: r.userId, name: 'Jugador' },
          game: game ? { ...game, genre: genresDb.get(game.genreId) } : undefined,
        });
      }
      return result;
    },
    findFirst: async ({ where }) => {
      for (const r of reviewsDb.values()) {
        if (where?.id && r.id !== where.id) continue;
        if (where?.isDeleted !== undefined && r.isDeleted !== where.isDeleted) continue;
        const game = gamesDb.get(r.gameId);
        return {
          ...r,
          user: usersDb.get(r.userId) || { id: r.userId, name: 'Jugador' },
          game: game ? { ...game, genre: genresDb.get(game.genreId) } : undefined,
        };
      }
      return null;
    },
    create: async ({ data }) => {
      const newRev = {
        id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        userId: data.userId,
        gameId: data.gameId,
        rating: data.rating,
        content: data.content,
        hoursPlayed: data.hoursPlayed,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      reviewsDb.set(newRev.id, newRev);
      const game = gamesDb.get(newRev.gameId);
      return {
        ...newRev,
        user: usersDb.get(newRev.userId) || { id: newRev.userId, name: 'Jugador' },
        game: game ? { ...game, genre: genresDb.get(game.genreId) } : undefined,
      };
    },
    update: async ({ where, data }) => {
      const r = reviewsDb.get(where.id);
      if (!r) throw new Error('Review not found');
      if (data.rating !== undefined) r.rating = data.rating;
      if (data.content !== undefined) r.content = data.content;
      if (data.hoursPlayed !== undefined) r.hoursPlayed = data.hoursPlayed;
      if (data.isDeleted !== undefined) r.isDeleted = data.isDeleted;
      r.updatedAt = new Date();
      const game = gamesDb.get(r.gameId);
      return {
        ...r,
        user: usersDb.get(r.userId) || { id: r.userId, name: 'Jugador' },
        game: game ? { ...game, genre: genresDb.get(game.genreId) } : undefined,
      };
    },
  },
  $disconnect: async () => { },
};

// Asignar globalThis.prisma antes de requerir la app de express
globalThis.prisma = mockPrisma;

const { app } = require(path.resolve(__dirname, '../dist/app.js'));

async function runTestSuite() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  console.log(`[GAUGE BACKEND INTEGRATION TEST SUITE] Servidor en puerto ${port}`);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. HEALTH
    console.log('\n--- 1. HEALTH ENDPOINTS ---');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'GET /api/health -> 200 OK');

    // 2. AUTHENTICATION & TOKENS
    console.log('\n--- 2. AUTHENTICATION & TOKENS ---');
    const uniqueEmail = `test_${Date.now()}@gauge.com`;
    const regSuccessRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Nuevo Jugador', email: uniqueEmail, password: 'Password123!' }),
    });
    const regSuccessData = await regSuccessRes.json();
    assert(regSuccessRes.status === 201, 'Registro exitoso retorna HTTP 201 Created');
    assert(!!regSuccessData.token, 'Registro exitoso retorna token JWT');
    assert(regSuccessData.user?.role === 'USER', 'Usuario registrado tiene rol USER por defecto');

    const regDupRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Otro Nombre', email: uniqueEmail, password: 'Password123!' }),
    });
    assert(regDupRes.status === 409, 'Registro con correo duplicado retorna HTTP 409 Conflict');

    const regShortNameRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'A', email: `valid_${Date.now()}@gauge.com`, password: 'Password123!' }),
    });
    assert(regShortNameRes.status === 400, 'Registro con nombre menor a 2 caracteres retorna HTTP 400 Bad Request');

    const regBadEmailRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Usuario Valido', email: 'correo-sin-arroba', password: 'Password123!' }),
    });
    assert(regBadEmailRes.status === 400, 'Registro con correo inválido retorna HTTP 400 Bad Request');

    const regShortPassRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Usuario Valido', email: `valid_${Date.now()}@gauge.com`, password: '123' }),
    });
    assert(regShortPassRes.status === 400, 'Registro con contraseña < 6 caracteres retorna HTTP 400 Bad Request');

    const loginUserRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@gauge.com', password: 'UserPass123!' }),
    });
    const loginUserData = await loginUserRes.json();
    assert(loginUserRes.status === 200, 'Login credenciales correctas retorna HTTP 200 OK');
    assert(loginUserData.user?.role === 'USER', 'JWT y respuesta preservan rol USER');
    const userToken = loginUserData.token;

    const loginAdminRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gauge.com', password: 'AdminPass123!' }),
    });
    const loginAdminData = await loginAdminRes.json();
    assert(loginAdminRes.status === 200, 'Login ADMIN retorna HTTP 200 OK');
    assert(loginAdminData.user?.role === 'ADMIN', 'JWT y respuesta preservan rol ADMIN');
    const adminToken = loginAdminData.token;

    const loginOtherRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'other@gauge.com', password: 'UserPass123!' }),
    });
    const loginOtherData = await loginOtherRes.json();
    const otherToken = loginOtherData.token;

    const loginBadPassRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@gauge.com', password: 'WrongPassword999!' }),
    });
    assert(loginBadPassRes.status === 401, 'Login credenciales incorrectas retorna HTTP 401 Unauthorized');

    const meValidRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const meValidData = await meValidRes.json();
    assert(meValidRes.status === 200, 'GET /api/auth/me con token válido retorna HTTP 200');
    assert(meValidData.user?.email === 'user@gauge.com', 'GET /api/auth/me retorna perfil correcto');

    const meNoTokenRes = await fetch(`${baseUrl}/auth/me`);
    assert(meNoTokenRes.status === 401, 'GET /api/auth/me sin token retorna HTTP 401 Unauthorized');

    const meBadTokenRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: 'Bearer token_invalido_xyz123' },
    });
    assert(meBadTokenRes.status === 401, 'GET /api/auth/me con token inválido retorna HTTP 401 Unauthorized');

    const expiredToken = jwt.sign(
      { id: testUser.id, role: testUser.role, exp: Math.floor(Date.now() / 1000) - 3600 },
      process.env.JWT_SECRET
    );
    const meExpiredRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert(meExpiredRes.status === 401, 'GET /api/auth/me con token vencido retorna HTTP 401 Unauthorized');

    const adminRbacUserRes = await fetch(`${baseUrl}/auth/admin-only`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(adminRbacUserRes.status === 403, 'Acceso a ruta admin por USER retorna HTTP 403 Forbidden');

    const adminRbacAdminRes = await fetch(`${baseUrl}/auth/admin-only`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminRbacAdminRes.status === 200, 'Acceso a ruta admin por ADMIN retorna HTTP 200 OK');

    // 3. GENRES
    console.log('\n--- 3. GENRES ENDPOINTS ---');
    const listGenresRes = await fetch(`${baseUrl}/genres`);
    assert(listGenresRes.status === 200, 'GET /api/genres retorna HTTP 200');

    const createGenUserRes = await fetch(`${baseUrl}/genres`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ name: 'Survival Horror' }),
    });
    assert(createGenUserRes.status === 403, 'Creación de género por USER retorna HTTP 403');

    const createGenAdminRes = await fetch(`${baseUrl}/genres`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: 'Survival Horror', slug: 'survival-horror' }),
    });
    const createdGenData = await createGenAdminRes.json();
    assert(createGenAdminRes.status === 201, 'Creación de género por ADMIN retorna HTTP 201');
    const newGenId = createdGenData.id;

    const createDupGenRes = await fetch(`${baseUrl}/genres`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: 'Survival Horror' }),
    });
    assert(createDupGenRes.status === 409, 'Creación con nombre duplicado retorna HTTP 409 Conflict');

    const updateGenRes = await fetch(`${baseUrl}/genres/${newGenId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: 'Terror y Supervivencia' }),
    });
    assert(updateGenRes.status === 200, 'Actualización de género por ADMIN retorna HTTP 200');

    const delLinkedGenRes = await fetch(`${baseUrl}/genres/${testGenre.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(delLinkedGenRes.status === 409, 'Eliminar género con juegos asociados retorna HTTP 409 Conflict');

    const delGenRes = await fetch(`${baseUrl}/genres/${newGenId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(delGenRes.status === 200, 'Eliminar género sin dependencias retorna HTTP 200 OK');

    // 4. GAMES
    console.log('\n--- 4. GAMES ENDPOINTS ---');
    const createGameUserRes = await fetch(`${baseUrl}/games`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(createGameUserRes.status === 403, 'Creación de juego por USER retorna HTTP 403 Forbidden');

    const formNoFile = new FormData();
    formNoFile.append('title', 'Zelda Tears of the Kingdom');
    formNoFile.append('description', 'Aventura de mundo abierto sobre el reino de Hyrule.');
    formNoFile.append('releaseDate', '2023-05-12');
    formNoFile.append('genreId', testGenre.id);

    const createNoFileRes = await fetch(`${baseUrl}/games`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formNoFile,
    });
    assert(createNoFileRes.status === 400, 'Creación sin archivo de carátula retorna HTTP 400 Bad Request');

    const formBadGenre = new FormData();
    formBadGenre.append('title', 'Zelda Tears of the Kingdom');
    formBadGenre.append('description', 'Aventura de mundo abierto sobre el reino de Hyrule.');
    formBadGenre.append('releaseDate', '2023-05-12');
    formBadGenre.append('genreId', 'gen-inexistente-999');
    formBadGenre.append('image', new Blob([Buffer.from('pixel')], { type: 'image/png' }), 'zelda.png');

    const createBadGenreRes = await fetch(`${baseUrl}/games`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formBadGenre,
    });
    assert(createBadGenreRes.status === 404, 'Creación con género inexistente retorna HTTP 404 Not Found');

    const formShortTitle = new FormData();
    formShortTitle.append('title', 'Z');
    formShortTitle.append('description', 'Aventura de mundo abierto sobre el reino de Hyrule.');
    formShortTitle.append('releaseDate', '2023-05-12');
    formShortTitle.append('genreId', testGenre.id);
    formShortTitle.append('image', new Blob([Buffer.from('pixel')], { type: 'image/png' }), 'zelda.png');

    const createShortTitleRes = await fetch(`${baseUrl}/games`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formShortTitle,
    });
    assert(createShortTitleRes.status === 400, 'Creación con título < 2 caracteres retorna HTTP 400 Bad Request');

    const formShortDesc = new FormData();
    formShortDesc.append('title', 'Zelda TOTK');
    formShortDesc.append('description', 'Corta');
    formShortDesc.append('releaseDate', '2023-05-12');
    formShortDesc.append('genreId', testGenre.id);
    formShortDesc.append('image', new Blob([Buffer.from('pixel')], { type: 'image/png' }), 'zelda.png');

    const createShortDescRes = await fetch(`${baseUrl}/games`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formShortDesc,
    });
    assert(createShortDescRes.status === 400, 'Creación con descripción < 10 caracteres retorna HTTP 400 Bad Request');

    const formBadDate = new FormData();
    formBadDate.append('title', 'Zelda TOTK');
    formBadDate.append('description', 'Aventura épica de exploración y combate en Hyrule.');
    formBadDate.append('releaseDate', 'fecha-no-valida');
    formBadDate.append('genreId', testGenre.id);
    formBadDate.append('image', new Blob([Buffer.from('pixel')], { type: 'image/png' }), 'zelda.png');

    const createBadDateRes = await fetch(`${baseUrl}/games`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formBadDate,
    });
    assert(createBadDateRes.status === 400, 'Creación con formato de fecha inválido retorna HTTP 400 Bad Request');

    const formValid = new FormData();
    formValid.append('title', 'Zelda Tears of the Kingdom');
    formValid.append('description', 'Aventura épica de exploración y combate en Hyrule.');
    formValid.append('releaseDate', '2023-05-12');
    formValid.append('genreId', testGenre.id);
    formValid.append('image', new Blob([Buffer.from('pixel-valido')], { type: 'image/png' }), 'zelda.png');

    const createSuccessRes = await fetch(`${baseUrl}/games`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formValid,
    });
    const createdGameData = await createSuccessRes.json();
    assert(createSuccessRes.status === 201, 'Creación exitosa como ADMIN retorna HTTP 201 Created');
    assert(!!createdGameData.coverUrl, 'Juego creado contiene coverUrl generada');
    const createdGameId = createdGameData.id;
    const initialCoverUrl = createdGameData.coverUrl;

    const updateGameUserRes = await fetch(`${baseUrl}/games/${createdGameId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ title: 'Hack Title' }),
    });
    assert(updateGameUserRes.status === 403, 'Actualización de juego por USER retorna HTTP 403 Forbidden');

    const updateNoImageRes = await fetch(`${baseUrl}/games/${createdGameId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ title: 'Zelda TOTK (Edición Coleccionista)' }),
    });
    const updatedNoImageData = await updateNoImageRes.json();
    assert(updateNoImageRes.status === 200, 'Actualización sin imagen retorna HTTP 200 OK');
    assert(updatedNoImageData.title === 'Zelda TOTK (Edición Coleccionista)', 'Título actualizado correctamente');
    assert(updatedNoImageData.coverUrl === initialCoverUrl, 'Conserva la carátula anterior intacta al no enviar imagen');

    const formUpdateCover = new FormData();
    formUpdateCover.append('title', 'Zelda TOTK (Remastered)');
    formUpdateCover.append('image', new Blob([Buffer.from('pixel-nuevo')], { type: 'image/jpeg' }), 'zelda_new.jpg');

    const updateWithImageRes = await fetch(`${baseUrl}/games/${createdGameId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formUpdateCover,
    });
    const updatedWithImageData = await updateWithImageRes.json();
    assert(updateWithImageRes.status === 200, 'Actualización con nueva imagen retorna HTTP 200 OK');
    assert(updatedWithImageData.coverUrl !== initialCoverUrl, 'Reemplaza correctamente la carátula anterior');

    const deleteGameRes = await fetch(`${baseUrl}/games/${createdGameId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteGameRes.status === 200, 'Eliminación lógica de juego retorna HTTP 200 OK');

    const getDeletedGameRes = await fetch(`${baseUrl}/games/${createdGameId}`);
    assert(getDeletedGameRes.status === 404, 'Consulta de juego eliminado lógicamente retorna HTTP 404 Not Found');

    // 5. REVIEWS
    console.log('\n--- 5. REVIEWS ENDPOINTS ---');
    const createRevRes = await fetch(`${baseUrl}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ gameId: testGame.id, rating: 9, content: 'Gran experiencia técnica.', hoursPlayed: 60 }),
    });
    const createRevData = await createRevRes.json();
    assert(createRevRes.status === 201, 'Publicación de reseña por USER retorna HTTP 201 Created');
    const newRevId = createRevData.id;

    const badRatingRes = await fetch(`${baseUrl}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ gameId: testGame.id, rating: 15, content: 'Texto valido', hoursPlayed: 10 }),
    });
    assert(badRatingRes.status === 400, 'Publicación con rating > 10 retorna HTTP 400 Bad Request');

    const badHoursRes = await fetch(`${baseUrl}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ gameId: testGame.id, rating: 8, content: 'Texto valido', hoursPlayed: -5 }),
    });
    assert(badHoursRes.status === 400, 'Publicación con horas negativas retorna HTTP 400 Bad Request');

    const updateOtherUserRes = await fetch(`${baseUrl}/reviews/${newRevId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${otherToken}` },
      body: JSON.stringify({ rating: 1 }),
    });
    assert(updateOtherUserRes.status === 403, 'Modificación de reseña por otro usuario retorna HTTP 403 Forbidden');

    const updateAuthorRes = await fetch(`${baseUrl}/reviews/${newRevId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ rating: 10, content: 'Comentario actualizado por el autor.' }),
    });
    assert(updateAuthorRes.status === 200, 'Modificación de reseña por su autor retorna HTTP 200 OK');

    const updateAdminRes = await fetch(`${baseUrl}/reviews/${newRevId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ content: 'Moderado por administración.' }),
    });
    assert(updateAdminRes.status === 200, 'Modificación de reseña por ADMIN retorna HTTP 200 OK');

    const deleteRevRes = await fetch(`${baseUrl}/reviews/${newRevId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(deleteRevRes.status === 200, 'Eliminación de reseña por su autor retorna HTTP 200 OK');

    const getDeletedRevRes = await fetch(`${baseUrl}/reviews/${newRevId}`);
    assert(getDeletedRevRes.status === 404, 'Consulta de reseña eliminada lógicamente retorna HTTP 404 Not Found');

    // 6. STATS
    console.log('\n--- 6. STATS ENDPOINTS ---');
    const statsRes = await fetch(`${baseUrl}/users/stats`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const statsData = await statsRes.json();
    assert(statsRes.status === 200, 'GET /api/users/stats retorna HTTP 200 OK');
    assert(typeof statsData.totalHours === 'number', 'Stats retorna totalHours');
    assert(typeof statsData.totalReviews === 'number', 'Stats retorna totalReviews');
    assert(Array.isArray(statsData.hoursByGenre), 'Stats retorna hoursByGenre');

    console.log('\n==================================================================');
    console.log(`[TEST SUMMARY] Total Passed: ${passed}, Total Failed: ${failed}`);
    console.log('==================================================================\n');
  } catch (err) {
    console.error('Fatal error in test suite:', err);
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTestSuite();
