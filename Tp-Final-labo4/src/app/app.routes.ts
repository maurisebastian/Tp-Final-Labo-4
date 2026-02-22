import { Routes } from '@angular/router';
import { Login } from './Components/login/login';
import { HomeComponent } from './Components/home/home';
import { Signup } from './Components/signup/signup';
import { MovieReview } from './Components/movie-review/movie-review';
import { ProfileDetail } from './Components/profile-detail/profile-detail';
import { MovieSearch } from './Components/movie-search/movie-search';
import { userGuard } from './auth/auth-guard-user';
import { adminGuard } from './auth/auth-guard-admin';
import { AdminMoviesComponent } from './Components/admin-movies/admin-movies';
import { AdminHomeComponent } from './Components/admin-home/admin-home';
import { AdminPanel } from './Components/admin-panel/admin-panel';            // SOLO usuarios
import { AdminUserEdit } from './Components/admin-user-edit/admin-user-edit';
import { AdminCreateAdminComponent } from './Components/admin-create-admin/admin-create-admin'; // NUEVO
import { AdminReviewsComponent } from './Components/admin-reviews/admin-reviews';               // NUEVO
import { ProfilesList } from './Components/profiles-list/profiles-list';
import { ProfilePublic } from './Components/profile-public/profile-public';
import { ActorSearch } from './Components/actor-search/actor-search';
import { ActorDetail } from './Components/actor-detail/actor-detail'; 
import { AdminLocalMovieComponent } from './Components/admin-local-movie/admin-local-movie';
import { Notification } from './Components/notification/notification';
import { MyActivityPage } from './Components/my-activity-page/my-activity-page';
import { ChatPage } from './Components/chat-page/chat-page';



export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Home page' },
  { path: 'movie-review/:id', component: MovieReview, title: 'movie review' },
  { path: 'login', component: Login, title: 'login' },
  { path: 'profile/edit', component: Signup, data: { mode: 'edit' }, title: 'Profile edit' },
  { path: 'signup', component: Signup, title: 'sign up' },
  { path: 'profile-detail', component: ProfileDetail, canActivate: [userGuard], title: 'profile detail' },
  { path: 'search/:query', component: MovieSearch },
  {path: 'activity',component: MyActivityPage, canActivate:[userGuard],title: 'my actividad' },
  {path: 'chat',component:ChatPage, canActivate: [userGuard], title : 'mensajes'},
 
  {
  path: 'profiles/:id',
  component: ProfilePublic,
  canActivate: [userGuard],
  title: 'Perfil público'
  },
  {
   path: 'profiles',
  component: ProfilesList,
  canActivate: [userGuard],
  title: 'Perfiles'
  },
  {
      path: 'notifications',
      component : Notification,
      canActivate : [userGuard],
      title : 'notificaciones'
  },


  // HOME ADMIN
  { path: 'admin', component: AdminHomeComponent, canActivate: [adminGuard], title: 'Admin - Inicio' },

  // SOLO USUARIOS
  { path: 'admin/users', component: AdminPanel, canActivate: [adminGuard], title: 'Admin - Usuarios' },

  // SOLO FORM NUEVO ADMIN
  { path: 'admin/new-admin', component: AdminCreateAdminComponent, canActivate: [adminGuard], title: 'Admin - Crear Admin' },

  // SOLO RESEÑAS
  { path: 'admin/reviews', component: AdminReviewsComponent, canActivate: [adminGuard], title: 'Admin - Reseñas' },

  // Edición de usuario
  { path: 'admin/user/:id', component: AdminUserEdit, canActivate: [adminGuard], title: 'admin edit' },
  //peliculas administradas por el admin
    {
    path: 'admin/movies',
    component: AdminMoviesComponent,
  },

 {
  path: 'admin/reports',
  canActivate: [adminGuard],
  title: 'Admin - Reportes',
  loadComponent: () =>
    import('./Components/admin-reports/admin-reports')
      .then(m => m.AdminReports),
},


  {
    path: 'select-genres',
    loadComponent: () =>
      import('./Components/genres/genres').then((m) => m.Genres),
  },
  // 🔍 Búsqueda de actores
{
  path: 'actors',
  component: ActorSearch,
  title: 'Buscar actores'
},

//  Detalle de actor + películas en las que aparece
{
  path: 'actor/:id',
  loadComponent: () =>
    import('./Components/actor-detail/actor-detail')
      .then(m => m.ActorDetail),
  title: 'Detalle de actor'
},
{
  path: 'admin/local-movie/:id',
  component: AdminLocalMovieComponent,
  canActivate: [adminGuard],
  title: 'Admin - Película local'
},

  { path: '**', redirectTo: '', pathMatch: 'full' },
];
