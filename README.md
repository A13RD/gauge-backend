
# GAUGE — Backend API
> **Gaming Assessment & User Gameplay Evaluation**  

API REST robusta, escalable y segura desarrollada con **Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Supabase)** y almacenamiento de carátulas en **Supabase Storage (S3)**, estructurada bajo **Arquitectura en Cuatro Capas**

---

## Enlaces de Despliegue y Repositorios


* **API Backend en Producción:** `https://project-gauge-api.vercel.app/`
* **Frontend Web en Producción:** `https://gauge-gaming.vercel.app/`
* **Repositorio Frontend (GitHub):** `https://github.com/A13RD/gauge-frontend`

---

## Características Principales

* **Arquitectura en 4 Capas:** Separación entre Dominio (`domain`), Casos de Uso (`application`), Infraestructura (`infrastructure`) y Presentación HTTP (`interface`). Reglas de negocio desacopladas de frameworks y librerías externas.
* **Autenticación y Seguridad JWT:** Emisión y validación centralizada de tokens JWT con expiración configurable, contraseñas protegidas mediante `bcryptjs`, exclusión total de hashes en respuestas y mensajes genéricos de autenticación contra ataques de enumeración.
* **Control de Acceso Basado en Roles (RBAC):** Middlewares desacoplados a nivel de router (`authMiddleware`, `roleMiddleware`) restringiendo operaciones administrativas a usuarios con rol `ADMIN`.
* **Catálogo Paginado y Filtros:** Paginación estandarizada `{ data: [...], pagination: { total, currentPage, limit, totalPages } }`, filtros por género (slug o id), búsqueda de texto insensible a mayúsculas/minúsculas y ordenamiento por popularidad o fecha de lanzamiento.
* **Subida Binaria a Supabase Storage (S3):** Procesamiento de imágenes en memoria con Multer (máximo 5 MB, formatos PNG, JPEG y WebP), subida directa al bucket `game-covers` mediante la nueva API Key secreta `SUPABASE_SECRET_KEY` y persistencia de URLs públicas permanentes.
* **Borrado Lógico Obligatorio:** Operaciones `DELETE` en videojuegos y reseñas implementan borrado lógico (`isDeleted: true`), garantizando la preservación del historial y excluyendo registros eliminados de catálogos y métricas.
* **Métricas en Tiempo Real:** Endpoint `/api/users/stats` que calcula dinámicamente horas jugadas totales, cantidad de reseñas y horas dedicadas agrupadas por género a partir de datos reales en PostgreSQL.
* **Tipado Estricto:** TypeScript al 100% con `strict: true` y `noImplicitAny: true`, cero uso de `any` y formateo uniforme verificado con Prettier.

---

## Stack Tecnológico
| :---: | :--- |
| Componente | Tecnología |
| **Entorno de Ejecución** | Node.js  |
| **Lenguaje** | TypeScript 5+  |
| **Framework HTTP** | Express 5 |
| **ORM & Modelado** | Prisma ORM v6.19.3 |
| **Base de Datos** | PostgreSQL (Alojada en Supabase) |
| **Almacenamiento de Archivos** | Supabase Storage (Compatible S3) |
| **Autenticación** | JSON Web Tokens (`jsonwebtoken`) & Hashing con `bcryptjs` |
| **Carga de Archivos** | Multer (`memoryStorage`) & `@supabase/supabase-js` |
| **Calidad de Código** | Prettier |

---

## Credenciales Académicas de Prueba (Seed)

La base de datos se encuentra precargada mediante el script de semillas idempotente `prisma/seed.ts` con las siguientes credenciales para evaluación y sustentación:

| Rol | Correo Electrónico | Contraseña | Permisos / Alcance |
| :---: | :--- | :--- | :--- |
| **ADMIN** | `admin@gauge.com` | `AdminPass123!` | Acceso completo: crear/editar/eliminar videojuegos con subida de carátulas a S3, administración de géneros, moderación global de reseñas. |
| **USER** | `user@gauge.com` | `UserPass123!` | Publicar y editar reseñas propias, consultar "Mis Reseñas", visualizar estadísticas en tiempo real y explorar el catálogo. |

---

## Variables de Entorno (`.env.example`)

Cree un archivo `.env` en la raíz del repositorio basándose en la siguiente plantilla:

```env
# Puerto del servidor backend
PORT=4000

# Cadena de conexión directa a PostgreSQL (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?sslmode=require"

# Secreto para firma criptográfica de tokens JWT
JWT_SECRET="clave_secreta_alta_entropia_gauge_2026"

# Tiempo de vida del token JWT
JWT_EXPIRES_IN="24h"

# URL base del proyecto Supabase
SUPABASE_URL="https://[REF].supabase.co"

# Nueva API Key secreta administrativa de Supabase (formato: sb_secret_...)
SUPABASE_SECRET_KEY="sb_secret_..."

# Nombre del bucket de almacenamiento para carátulas
SUPABASE_BUCKET="game-covers"

# Origen permitido para CORS (URL del frontend en local o producción)
FRONTEND_URL="http://localhost:3000"
```

> [!CAUTION]
> El archivo `.env` real **jamás** debe versionarse en Git ni compartirse públicamente. Mantenga únicamente `.env.example` en el repositorio.

---

## Instalación y Ejecución Local

### 1. Requisitos Previos
* Node.js v20.x o superior instalado (`node -v`).
* Gestor de paquetes npm v10.x o superior (`npm -v`).
* Proyecto activo en Supabase con PostgreSQL y bucket `game-covers` creado en Supabase Storage (público).

### 2. Clonación e Instalación
```bash
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO_BACKEND>
cd gauge-backend

# Instalar dependencias
npm install
```

### 3. Configuración del Entorno
```bash
# Copiar plantilla de variables
cp .env.example .env

# Editar .env con sus credenciales reales de Supabase y PostgreSQL
```

### 4. Base de Datos y Semillas (Prisma)
```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Aplicar migraciones en PostgreSQL
npm run prisma:migrate

# Ejecutar el seed con datos de prueba (idempotente)
npm run prisma:seed
```

### 5. Ejecución del Servidor
```bash
# Modo desarrollo
npm run dev

# Modo producción (Compilación y arranque)
npm run build
npm start
```
El servidor iniciará por defecto en `http://localhost:4000` exponiendo los endpoints bajo `/api`.

### 6. Calidad de Código y Formateo
```bash
# Verificar formateo de código con Prettier
npm run format:check

# Corregir formateo automáticamente
npm run format
```

---

## Resumen de Endpoints de la API REST

Prefijo unificado obligatorio: **`/api`**

### Autenticación (`/api/auth`)
* `POST /api/auth/register` — Registro público de usuario estándar (`201 Created`).
* `POST /api/auth/login` — Inicio de sesión; emite JWT (`200 OK`).
* `GET /api/auth/me` — Datos del usuario autenticado en sesión (`200 OK`).

### Videojuegos (`/api/games`)
* `GET /api/games` — Listado paginado con filtros de búsqueda, género y orden (`200 OK`).
* `GET /api/games/:id` — Detalle del videojuego con reseñas y calificación media (`200 OK`).
* `POST /api/games` — **[ADMIN]** Creación con subida binaria de carátula a S3 en `multipart/form-data` (`201 Created`).
* `PUT /api/games/:id` — **[ADMIN]** Edición de datos y actualización opcional de carátula (`200 OK`).
* `DELETE /api/games/:id` — **[ADMIN]** Borrado lógico (`isDeleted: true`) (`200 OK`).

### Géneros (`/api/genres`)
* `GET /api/genres` — Listado de todos los géneros (`200 OK`).
* `GET /api/genres/:id` — Detalle de género (`200 OK`).
* `POST /api/genres` — **[ADMIN]** Creación de género (`201 Created`).
* `PUT /api/genres/:id` — **[ADMIN]** Modificación de nombre o slug (`200 OK`).
* `DELETE /api/genres/:id` — **[ADMIN]** Eliminación con protección de integridad referencial (`200 OK`).

### Reseñas (`/api/reviews`)
* `POST /api/reviews` — **[Autenticado]** Publicar reseña (`userId` extraído del JWT) (`201 Created`).
* `GET /api/reviews/mias` — **[Autenticado]** Reseñas activas del usuario en sesión (`200 OK`).
* `GET /api/reviews` — **[ADMIN]** Listado global de reseñas para moderación (`200 OK`).
* `GET /api/reviews/:id` — Detalle individual de reseña (`200 OK`).
* `PUT /api/reviews/:id` — **[ADMIN]** Edición de calificación, horas y contenido (`200 OK`).
* `DELETE /api/reviews/:id` — **[ADMIN]** Borrado lógico de reseña (`200 OK`).

### Estadísticas (`/api/users/stats`)
* `GET /api/users/stats` — **[Autenticado]** Estadísticas consolidadas en vivo (`totalHours`, `totalReviews`, `hoursByGenre`) (`200 OK`).

### Salud
* `GET /api/health` — Comprobación de estado operativo del servidor (`200 OK`).

---

## Reparto del Trabajo y Matriz de Responsabilidades

| Integrante / Desarrollador | Módulos y Responsabilidades Asignadas | Aportes Principales |
| :--- | :--- | :--- |
| **`Miguel Martinez Tamayo`** | **Backend & Arquitectura** | Diseño de arquitectura limpia en 4 capas, esquema Prisma relacional, configuración de TypeScript estricto, endpoints REST, integración de Supabase Storage (S3) y script de seed. |
| **`Miguel Martinez Tamayo`** | **Autenticación & Seguridad** | Hashing con bcrypt (costo 10), servicios de JWT con expiración, middlewares centralizados de autenticación y roles (`authMiddleware`, `roleMiddleware`), manejo global de excepciones. |
| **`Alejandro Ruiz Diaz`** | **Frontend & UI/UX** | Desarrollo de vistas en Next.js (App Router), componentes glassmorphism tipo consola/PS5, hooks de consumo de datos y conexión con la API REST. |
| **`Alejandro Ruiz Diaz`** | **Integración, Pruebas & Despliegue** | Pruebas de integración cruzada, despliegue en la nube (Vercel / Render / Supabase), configuración de CORS y documentación técnica. |

---
