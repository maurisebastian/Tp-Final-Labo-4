# 🎬 MovieHub – Plataforma Social de Películas, Reseñas y Moderación

MovieHub es una aplicación web desarrollada en *Angular* que combina:

- 🎞 Exploración de películas (TMDB + películas locales)
- ⭐ Reseñas, puntuaciones, likes y comentarios
- 🧑‍🤝‍🧑 Seguimiento entre usuarios (followers / following)
- 🧾 Listas de “vistas” y “por ver”
- 🎯 Preferencias inteligentes: géneros y actores favoritos con estadísticas que se actualizan con el uso
- 💬 Chat entre usuarios para conversar y mantenerse conectados dentro de la comunidad
-🛡 Moderación y control administrativo (reportes, contenido, usuarios y catálogo)

Cada usuario tiene un *perfil propio*, que puede ser público o privado, con:

- Reseñas que escribió
- Actividad sobre películas (vistas / por ver)
- Información básica del perfil
- Seguidores y seguidos

Además, cuenta con un *panel de administración* desde donde se pueden:

- Moderar reseñas y reportes enviados por los usuarios
- Administrar usuarios y roles
- Gestionar películas creadas manualmente en la plataforma
- Ocultar/mostrar títulos del catálogo
- Revisar la actividad y el contenido generado por la comunidad

El foco principal de MovieHub es ofrecer una *experiencia social + moderación sólida*, con una UI moderna, carruseles dinámicos y persistencia de datos con JSON Server.

---

## 🧰 Tecnologías utilizadas

- *Angular 20+* con:
  - Componentes standalone
  - Formularios reactivos
- *TypeScript*
- *JSON Server* como “backend” local (REST fake API)
- *TMDB API* para la información de películas y actores
- *HTML + CSS* (custom, sin frameworks de UI externos)

---

## 🗂 Estructura del proyecto

```bash
Tp-Final-Labo-4/
└── Tp-Final-labo4/
    ├── src/
    │   ├── app/
    │   │   ├── app.config.ts
    │   │   ├── app.routes.ts
    │   │   ├── app.html
    │   │   ├── app.css
    │   │   │
    │   │   ├── auth/
    │   │   │   ├── auth-service.ts
    │   │   │   ├── auth-guard-user.ts
    │   │   │   ├── auth-guard-admin.ts
    │   │   │   └── (interceptor opcional)
    │   │   │
    │   │   ├── Components/
    │   │   │   ├── home/
    │   │   │   ├── carrusel/
    │   │   │   ├── movie-review/
    │   │   │   ├── review-list/
    │   │   │   ├── movie-search/
    │   │   │   ├── genres/
    │   │   │   ├── actor-search/
    │   │   │   ├── actor-detail/
    │   │   │   ├── profile-detail/
    │   │   │   ├── profiles-list/
    │   │   │   ├── user-activity/
    │   │   │   ├── login/
    │   │   │   ├── signup/
    │   │   │   ├── admin-home/
    │   │   │   ├── admin-panel/
    │   │   │   ├── admin-reviews/
    │   │   │   ├── admin-reports/
    │   │   │   ├── admin-movies/
    │   │   │   ├── admin-user-edit/
    │   │   │   └── admin-create-admin/
    │   │   │
    │   │   ├── Interfaces/
    │   │   │   ├── moviein.ts
    │   │   │   ├── profilein.ts
    │   │   │   ├── admin-movies.ts
    │   │   │   └── reaction.ts
    │   │   │
    │   │   ├── Services/
    │   │   │   ├── tmdb.service.ts
    │   │   │   ├── profile.service.ts
    │   │   │   ├── review.service.ts
    │   │   │   ├── review-like.service.ts
    │   │   │   ├── comment.service.ts
    │   │   │   ├── review-report.service.ts
    │   │   │   ├── movie-activity.ts
    │   │   │   ├── movies.service.ts       # Películas locales (adminMovies)
    │   │   │   └── hidden-movies.service.ts
    │   │   │
    │   │   ├── Shared/
    │   │   │   ├── top-bar/
    │   │   │   ├── footer/
    │   │   │   └── componentes comunes
    │   │   │
    │   │   └── styles.css
    │   │
    │   └── assets/
    │
    └── db/
        └── profiles.json   # Base de datos JSON Server (usuarios, reseñas, likes, etc.)
```

---


✅ Funcionalidades implementadas
1. Autenticación y manejo de sesión
Registro y login con:

Validaciones de usuario, email, contraseña, celular y fecha de nacimiento.

Edad mínima configurada (validación custom de fecha).

Persistencia del usuario activo vía localStorage.

Roles implementados:

user

admin

superadmin

Guards de rutas:

userGuard: protege vistas que requieren usuario logueado.

adminGuard: protege vistas de administración.

Manejo de sesión al navegar con botón “atrás” del navegador:

Se revalida el usuario activo para evitar “volver” a sesiones viejas.

---

2. Gestión de perfiles
Creación de perfil al registrarse.

Edición de perfil con formularios reactivos.

Validación de email único (no se permiten duplicados).

Campo isPublic para manejar perfiles públicos / privados.

Vista de detalle de perfil con:

Datos de usuario

Reseñas realizadas

Actividad de películas (vistas / por ver)

Seguidores y seguidos (followers / following)

Seguimiento entre usuarios:

Endpoint follows en JSON.

Listas de “Seguidores” y “Seguidos” con link a perfil.

---

3. Sistema de reseñas
Reseñas asociadas a:

Usuario (idProfile)

Película (idMovie)

Un usuario solo puede dejar una reseña por película:

La UI muestra mensaje si ya reseñó esa película.

Edición de reseña:

Se permite editar la reseña ya existente.

Se reutiliza el formulario en modo edición.

Likes en reseñas:

Endpoint reviewLikes.

Conteo de likes por reseña.

Comentarios sobre reseñas:

Endpoint reviewComments.

Múltiples comentarios por reseña, con referencia a idProfile.

---

4. Reportes y moderación de reseñas
Los usuarios pueden reportar reseñas que consideren inapropiadas.

Endpoint reviewReports con:

reason, reporterId, status (pending, resolved, dismissed), idMovie, etc.

Panel de administración para:

Ver el listado de reportes.

Filtrar por estado o película.

Marcar reportes como resueltos / descartados.

---

5. Actividad del usuario sobre películas
Endpoint movieActivity con:

status: watched | towatch

watchedDate cuando corresponde.

Desde la UI se puede:

Marcar una película como vista.

Agregar películas a “para ver”.

En el perfil se muestran:

Lista de películas vistas.

Lista de películas “por ver”.

---

6. Integración con TMDB
Búsqueda de películas por título.

Vista de detalle de película con:

Póster

Sinopsis

Géneros

Puntuación de TMDB

Búsqueda de actores:

actor-search: buscador de personas en TMDB.

actor-detail: muestra datos del actor y películas donde participa.

Uso combinado de:

Películas de TMDB

Películas locales agregadas por admin (adminMovies)

---

7. Sistema de recomendaciones
A) Recomendadas por géneros
Paso de selección de gustos (Genres):

El usuario elige un conjunto de películas random.

A partir de esas películas, se calculan los géneros favoritos.

Se guarda favoriteGenres en el perfil.

En el carrusel principal:

Se muestra una sección “Recomendadas para vos” basada en favoriteGenres.

Se evita repetir películas del Top 10 o películas ocultas.

B) Descubrir por actores favoritos
A partir de las películas elegidas en Genres:

Se consulta TMDB por los créditos de cada película.

Se extraen actores frecuentes.

Se guarda favoriteActors en el perfil.

El carrusel incluye:

Sección “Descubrí por tus actores favoritos” con películas basadas en esos actores.

Películas generadas a partir de varios actores y mezcladas al azar.

C) Top más puntuadas
Carrusel con el Top 10 de películas (TMDB “top rated”), filtrando películas ocultas.

Autodesplazamiento con pausa al pasar el mouse.

---

8. Películas locales administradas por el panel
Endpoint adminMovies:

Películas creadas por admin con:

id propio

tmdbId opcional

title

overview

posterPath

isHidden

Desde el panel de administración se puede:

Crear nuevas películas locales.

Editarlas / eliminarlas.

Marcarlas como ocultas (isHidden = true).

El sistema de carouseles respeta las películas ocultas:

No se muestran en carouseles ni en ciertas vistas.

---

9. Panel de administración
Vista general (admin-home / admin-panel) con acceso a:

Gestión de usuarios

Gestión de reseñas

Gestión de reportes

Gestión de películas locales

---

Usuarios:

Lista de usuarios.

Búsqueda por nombre, email o ID.

Link a perfil público.

Eliminación de usuarios.

Creación de nuevos administradores.

---

Reseñas:

Listado de reseñas agrupadas por película.

Posibilidad de filtrar por usuario o por película.

Eliminación de reseñas problemáticas.

---

Reportes:

Listado de reportes de reseñas.

Cambio de estado: pendiente / resuelto / descartado.

---

Películas:

ABM de películas locales (adminMovies).

Botón para ocultar / mostrar en catálogo.

---

10. Interfaz y UX
Top bar con navegación a:

Home

Búsqueda de películas

Búsqueda de actores

Perfil

Panel admin (según rol)

---


Formularios con mensajes de error claros y validaciones visuales.

Carruseles con flechas, auto-slide y diseño responsive básico.

Perfiles de usuario con diseño de tarjetas para:

Reseñas

Actividad

Seguidores / seguidos

🔧 JSON Server – Base de datos local
Se utiliza un único archivo profiles.json dentro de db/ como “base de datos” para JSON Server.

Colecciones principales:

profiles

comments (reseñas de películas)

reviewComments

reviewLikes

movieActivity

reviewReports

follows

adminMovies

---

🚀 Instalación y ejecución
1. Clonar el repositorio
bash
Copiar código
git clone https://github.com/maurisebastian/Tp-Final-Labo-4.git
cd Tp-Final-Labo-4/Tp-Final-labo4

---

2. Instalar dependencias
bash
Copiar código
npm install

---

3. Iniciar JSON Server
Desde la carpeta Tp-Final-labo4:

bash
Copiar código
json-server --watch db/profiles.json --port 3000
Esto expone endpoints como:

http://localhost:3000/profiles

http://localhost:3000/comments

http://localhost:3000/reviewLikes

http://localhost:3000/reviewReports

etc.

---

4. Iniciar la aplicación Angular
En otra terminal, también desde Tp-Final-labo4:

bash
Copiar código
ng serve -o
La app queda disponible en:

http://localhost:4200

👤 Usuarios de prueba
Podés crear tu propio usuario desde la pantalla de Signup
o usar la cuenta de administrador preconfigurada:

Usuario:  admin

Password: fakepass

---

¡Gracias por leer! 🎥🍿
MovieHub busca simular una plataforma social de cine con foco en la experiencia del usuario y en la moderación responsable del contenido.
