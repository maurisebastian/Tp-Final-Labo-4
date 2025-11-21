import { Routes } from '@angular/router';
import { Login } from './Components/login/login';
import { Carrusel } from './Components/carrusel/carrusel';
import { Signup } from './Components/signup/signup';
import { MovieReview } from './Components/movie-review/movie-review';
import { ProfileDetail } from './Components/profile-detail/profile-detail';
import { MovieSearch } from './Components/movie-search/movie-search';
import { AdminPanel } from './Components/admin-panel/admin-panel';
import { userGuard } from './auth/auth-guard-user';
import { adminGuard } from './auth/auth-guard-admin';
import { AdminUserEdit } from './Components/admin-user-edit/admin-user-edit';


export const routes: Routes = [
  { path: '', component: Carrusel, title: 'Home page' },
  { path: 'movie-review/:id', component: MovieReview, title: 'movie review' },
  { path: 'login', component: Login, title: 'login' },
  { path: 'profile/edit', component: Signup, data: { mode: 'edit' }, title: 'Profile edit' },
  { path: 'signup', component: Signup, title: 'sign up' },
  { path: 'profile-detail', component: ProfileDetail, canActivate: [userGuard], title: 'profile detail' },
  { path: 'search/:query', component: MovieSearch },
  { path: 'admin', component: AdminPanel, canActivate: [adminGuard], title: 'Home admin' },
  { path: 'admin/user/:id', component: AdminUserEdit, canActivate: [adminGuard], title: 'admin edit' },

  {
    path: 'select-genres',
    loadComponent: () =>
      import('./Components/genres/genres').then((m) => m.Genres),
  },

  { path: '**', redirectTo: '', pathMatch: 'full' },
];

