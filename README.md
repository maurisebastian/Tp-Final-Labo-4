🎬 MovieHub – Plataforma Social de Películas, Reseñas y Moderación

MovieHub es una aplicación web desarrollada en Angular 20+ que combina:

🎞 Exploración de películas (desde TMDB y películas locales creadas por Admin)

⭐ Reseñas, puntuaciones, likes y comentarios

🧑‍🤝‍🧑 Seguimiento entre usuarios (followers / following)

🧾 Listas de “vistas” y “por ver”

🛡 Moderación completa de reseñas, reportes y usuarios

🎭 Sistema de recomendaciones por géneros favoritos y por actores favoritos

Cada usuario cuenta con un perfil público o privado, que muestra:

Reseñas que escribió

Actividad de películas (vistas / por ver)

Seguidores y seguidos

Géneros y actores favoritos

La plataforma también cuenta con un panel de administración desde donde un admin puede:

Moderar reseñas y reportes

Editar o eliminar usuarios

Crear administradores

Crear, editar, ocultar o mostrar películas locales

Revisar actividad del sistema

MovieHub combina una experiencia social real con moderación sólida, uso completo de TMDB y una UI moderna con carruseles dinámicos y datos persistidos vía JSON Server.

🧰 Tecnologías utilizadas

Angular 20+

Standalone Components

Formularios reactivos

Guards de autenticación y roles

TypeScript

JSON Server como backend REST local

TMDB API

CSS puro + HTML (sin frameworks externos)

LocalStorage para persistencia de sesión

🗂 Estructura real del proyecto
TP-FINAL-LABO4/
└── Tp-Final-labo4/
    ├── db/
    │   └── profiles.json              # Base de datos JSON Server
    │
    ├── src/
    │   ├── app/
    │   │   ├── app.config.ts
    │   │   ├── app.routes.ts
    │   │   ├── app.html
    │   │   ├── app.css
    │   │
    │   │   ├── auth/
    │   │   │   ├── auth-service.ts
    │   │   │   ├── auth-guard-user.ts
    │   │   │   ├── auth-guard-admin.ts
    │   │   │   └── (otros relacionados)
    │   │
    │   │   ├── Components/
    │   │   │   ├── actor-detail/
    │   │   │   ├── actor-search/
    │   │   │   ├── admin-create-admin/
    │   │   │   ├── admin-home/
    │   │   │   ├── admin-local-movie/
    │   │   │   ├── admin-movies/
    │   │   │   ├── admin-panel/
    │   │   │   ├── admin-reports/
    │   │   │   ├── admin-reviews/
    │   │   │   ├── admin-user-edit/
    │   │   │   ├── carrusel/
    │   │   │   ├── follow-component/
    │   │   │   ├── genres/
    │   │   │   ├── home/
    │   │   │   ├── login/
    │   │   │   ├── movie-review/
    │   │   │   ├── movie-search/
    │   │   │   ├── profile-detail/
    │   │   │   ├── profile-public/
    │   │   │   ├── profiles-list/
    │   │   │   ├── review-list/
    │   │   │   ├── signup/
    │   │   │   ├── top-bar/
    │   │   │   └── user-activity/
    │   │
    │   │   ├── Interfaces/
    │   │   │   ├── moviein.ts
    │   │   │   ├── profilein.ts
    │   │   │   ├── admin-movies.ts
    │   │   │   ├── follow.ts
    │   │   │   └── reaction.ts
    │   │
    │   │   ├── Services/
    │   │   │   ├── tmdb.service.ts
    │   │   │   ├── profile.service.ts
    │   │   │   ├── review.service.ts
    │   │   │   ├── review-like.service.ts
    │   │   │   ├── comment.service.ts
    │   │   │   ├── review-report.service.ts
    │   │   │   ├── movie-activity.ts
    │   │   │   ├── movies.service.ts
    │   │   │   ├── follows.service.ts
    │   │   │   └── hidden-movies.service.ts
    │   │
    │   └── assets/
    │       └── placeholders y recursos

✅ Funcionalidades implementadas
🔐 1. Autenticación y manejo de sesión

Login y registro con validaciones completas

Edad mínima automática según la fecha ingresada

Persistencia de sesión con localStorage

Roles:

user

admin

superadmin

Guards:

userGuard

adminGuard

Prevención de volver a sesiones viejas usando el botón “atrás”

👤 2. Perfiles

Edición de perfil completa (form reactivo)

Perfiles públicos o privados (isPublic)

Vista pública con:

datos del usuario

reseñas

seguidores / seguidos

actividad de películas

Perfil actual editable desde el menú

⭐ 3. Sistema de reseñas

Cada reseña incluye:

idMovie

idProfile

puntuación (score)

texto descriptivo

Funcionalidades:

Un usuario solo puede dejar una reseña por película

Modo edición de reseña

Likes de reseñas

Comentarios a reseñas

Reportes con estados: pending, resolved, dismissed

🧑‍🤝‍🧑 4. Seguidores / Seguidos

Endpoint /follows

Seguir y dejar de seguir usuarios

Listados completos en el perfil:

Seguidores

Seguidos

Links directos al perfil de cada usuario

🎬 5. TMDB: películas y actores

Búsqueda por título

Detalle de película

Créditos, géneros, sinopsis y cartel principal

Búsqueda de actores (actor-search)

Detalle del actor con:

foto

biografía

películas donde actúa

🎯 6. Recomendaciones (GÉNEROS + ACTORES)

MovieHub genera recomendaciones basadas en:

A) Géneros favoritos

Obtenidos a partir de la selección inicial en /genres.

Se muestran en el carrusel:

“Recomendadas para vos”

B) Actores favoritos

Detectados desde las películas elegidas en /genres.

Carrusel:

“Descubrí por tus actores favoritos”

C) Top general

Usa TMDB Top Rated
(oculta películas que el admin marcó como hidden)

Todos los carruseles:

tienen navegación con flechas

algunos tienen auto-slide

filtran películas ocultas

🎞 7. Películas locales (Admin)

Los administradores pueden:

Crear películas locales

Editarlas

Eliminarlas

Ocultarlas / mostrarlas (isHidden)

Ver y gestionar toda la colección local

Estas películas conviven con las de TMDB en:

Detalles de película

Reseñas

Actividad del usuario

🏛 8. Panel de administración

Incluye:

👥 Usuarios

Listado completo

Filtrado por nombre, email o ID

Edición

Eliminación

Creación de administradores

✍️ Reseñas

Listado general

Agrupación por película

Eliminación

🚨 Reportes

Listado de todos los reportes

Cambios de estado

Motivo y usuario que reportó

🎬 Películas locales

Creación, edición, borrado

Ocultar / mostrar

🎯 9. Actividad del usuario

Endpoint /movieActivity:

Guardado como watched o towatch

Fecha automática cuando corresponde

Listas en el perfil:

Películas vistas

Películas por ver

🎨 10. UI y experiencia

Top Bar dinámica

Carruseles modernos

Formularios con mensajes claros de error

Diseño consistente para reseñas, actividad y perfiles

Componentes standalone reutilizables

🔧 JSON Server – Base de datos local

Archivo principal:

db/profiles.json


Colecciones incluidas:

profiles

comments (reseñas)

reviewComments

reviewLikes

reviewReports

movieActivity

follows

adminMovies

🚀 Instalación y ejecución
1) Clonar el repositorio
git clone https://github.com/maurisebastian/Tp-Final-Labo-4.git
cd Tp-Final-Labo-4/Tp-Final-labo4

2) Instalar dependencias
npm install

3) Iniciar JSON Server
json-server --watch db/profiles.json --port 3000


Endpoints disponibles:

http://localhost:3000/profiles

http://localhost:3000/comments

http://localhost:3000/reviewLikes

http://localhost:3000/reviewReports

etc.

4) Iniciar Angular
ng serve -o


URL:
👉 http://localhost:4200

👤 Usuarios de prueba

Superadmin

usuario: admin
password: fakepass


Usuarios normales

usuario: sofia
password: fakepass

usuario: fernandamoya
password: fakepass

🎉 Gracias por leer

MovieHub es una plataforma social de cine con:

✅ experiencia moderna
✅ recomendaciones personalizadas
✅ moderación completa
✅ componentes Angular standalone
✅ integración TMDB + base local
