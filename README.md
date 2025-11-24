🎬 MovieHub – Plataforma Social de Películas, Reseñas y Moderación

MovieHub es una aplicación web desarrollada con Angular que permite a los usuarios explorar películas, dejar reseñas, reaccionar a comentarios, seguir a otros usuarios y gestionar sus propios perfiles.
Cada usuario cuenta con un perfil público o privado, pudiendo optar por compartir con otros su actividad, reseñas y listas personalizadas de películas vistas o por ver.

Además del sistema social, MovieHub integra un panel de administración completo, desde donde los administradores pueden:

Moderar reseñas y reportes enviados por usuarios

Administrar perfiles y roles

Gestionar películas creadas manualmente dentro de la plataforma

Ocultar o mostrar títulos del catálogo

Revisar actividad y contenido generado por la comunidad

El enfoque principal de MovieHub es combinar una experiencia social con herramientas sólidas de moderación, creando un ecosistema seguro y organizado alrededor del mundo del cine.

Combinando una UI moderna, navegación fluida y persistencia de datos, MovieHub ofrece una experiencia dinámica tanto para usuarios como para administradores.
---

Estructura del Proyecto.
```
Tp-Final-Labo-4/
└── src/
├── app/
│ ├── app.config.ts
│ ├── app.routes.ts
│ ├── app.html
│ ├── app.css
│
│ ├── auth/
│ │ ├── auth.service.ts
│ │ ├── auth-guard.ts
│ │ └── auth-interceptor.ts
│
│ ├── Components/
│ │ ├── home/
│ │ ├── movie-review/
│ │ ├── carrusel/
│ │ ├── genres/
│ │ ├── movie-search/
│ │ ├── profile-detail/
│ │ ├── user-activity/
│ │ ├── login/
│ │ ├── signup/
│ │ ├── admin-home/
│ │ ├── admin-reviews/
│ │ ├── admin-reports/
│ │ ├── admin-movies/
│ │ └── admin-user-edit/
│
│ ├── Interfaces/
│ │ ├── admin-movies.ts
│ │ ├── movieIn.ts
│ │ ├── profileIn.ts
│ │ └── reaction.ts
│
│ ├── Services/
│ │ ├── movies-service.ts
│ │ ├── review.service.ts
│ │ ├── review-like-service.ts
│ │ ├── review-report-service.ts
│ │ ├── coment-service.ts
│ │ ├── movie-activity.ts
│ │ ├── profile-service.ts
│ │ └── tmdb.service.ts
│
│ ├── Shared/
│ │ ├── footer/
│ │ └── navbar/
│
├── assets/
└── styles.css
```
---
MovieHub — Estado actual y mejoras implementadas

Este documento resume las funcionalidades implementadas y las que se encuentran pendientes, según lo solicitado por la cátedra.
---

1. Autenticación y manejo de sesión

Implementado:

Registro y login con validación de campos (email, contraseña, usuario, celular y fecha con edad mínima).

Persistencia mediante localStorage.

Revalidación del usuario activo al retroceder en el navegador.

Roles definidos: usuario, administrador, superadministrador.

Bases preparadas para finalizar guards de rutas según roles.
---

2. Gestión de perfiles

Implementado:

Edición de perfil con formularios reactivos.

Validación para evitar correos duplicados.

Validación personalizada de edad mínima.

Pendiente:

Sección de reportes generados por el usuario.

Sección de listas del usuario (películas para ver, películas gustadas).
---

3. Sistema de reseñas

Implementado:

Reseñas vinculadas correctamente a películas.

Administración de reseñas desde el panel del administrador.

Pendiente:

Limitar a una reseña por película por usuario.

Funcionalidad de editar reseña y mostrar "(Editado)".
---

4. JSON Server como base de datos local

Implementado:

Endpoints: /profiles, /review, /reviewComments, /movieActivity, /reviewLikes, /reviewReports.

Generación de IDs únicos.

Persistencia funcional para usuarios y reseñas.
---

5. Integración con TMDB

Implementado:

Búsqueda por título.

Obtención de detalles básicos: sinopsis, géneros y poster.

Pendiente:

Mostrar actores de cada película.

Utilizar actores en búsquedas o recomendaciones.

Ampliar metadata disponible.
---

6. Sistema de favoritos

Pendiente:

Marcar películas como favoritas.

Mostrar favoritos en el perfil.

Integrar favoritos en recomendaciones personalizadas.
---

7. Página principal y carruseles

Implementado:

Carrusel “Top 10 general”.

Pendiente:

Carrusel “Recomendadas para vos”.

Integración con géneros favoritos, puntuaciones y favoritos.
---

8. Sistema de recomendación personalizada

Implementado parcialmente:

Estructura base preparada.

Pendiente:

Considerar géneros favoritos.

Considerar puntuaciones del usuario.

Considerar películas favoritas.

Considerar películas vistas.

Mostrar recomendaciones personalizadas por usuario.
---

9. Películas agregadas manualmente por el administrador

Implementado:

Crear películas locales con:

título

poster opcional

descripción

ID propio

Pendiente:

Cargar y mostrar actores para películas locales.

Integrar estas películas en recomendaciones.

Integración completa con reseñas como en películas TMDB.
---

10. Panel de administración

Implementado:

Ver usuarios.

Eliminar usuarios.

Crear administradores.

Ver todas las reseñas.

Pendiente:

Mejorar diseño a formato “cards”.

Vista ampliada al hacer clic en cada card.

Mostrar reportes de reseñas para moderación.
---

11. Interfaz y experiencia de usuario

Implementado:

Variables globales de colores.

Barra superior reorganizada.

Formularios unificados.

Pendiente:

Rediseño general de la aplicación (rama css-completo).

Mejorar coherencia visual entre pantallas.
---

12. Refactorización técnica

Implementado:

Migración a componentes standalone.

Servicios centralizados (TMDB, perfiles, reseñas).

Código reorganizado y simplificado.

Pendiente:

Unificar vistas similares (detalle y edición de perfil).
---

13. Integración entre vistas

Implementado parcialmente:

Navegación general entre módulos.

Pendiente:

Unificar vista de detalle y edición de perfil.

Integrar correctamente películas locales y TMDB en la vista de detalle.

Integrar favoritos, actores y listas en el flujo del usuario.
---

14. Lógica de negocio general

Implementado:

CRUD de usuarios, reseñas y películas locales.

Roles y permisos diferenciados.

Integración TMDB + base interna.

Formularios avanzados con validaciones complejas.

Persistencia y manejo de sesión.
---
Instalación y ejecución del proyecto
1. Clonar el repositorio
git clone https://github.com/maurisebastian/Tp-Final-Labo-4.git
cd Tp-Final-Labo-4
---
2. Instalar dependencias del proyecto:

npm install

---

3. Iniciar JSON Server (solo si tu entorno lo requiere)

Instalar JSON Server globalmente:

npm install -g json-server

Ejecutar JSON Server en el puerto 3000:

json-server --watch database/db.json --port 3000

---

4. Iniciar la aplicación Angular
ng serve -o

Entrá a http://localhost:4200

---

Creá una cuenta de usuario

O utilizá la cuenta de administrador:

User name: admin

Password: fakepass

¡Disfrutá del proyecto!


