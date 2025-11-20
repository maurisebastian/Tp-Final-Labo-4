import { Routes } from '@angular/router';
import { Login } from './Components/login/login';
import { Carrusel } from './Components/carrusel/carrusel';
import { Signup } from './Components/signup/signup';
import { MovieReview } from './Components/movie-review/movie-review';
import { ProfileDetail } from './Components/profile-detail/profile-detail';
import { MovieSearch } from './Components/movie-search/movie-search';
import { AdminPanel } from './Components/admin-panel/admin-panel'; 
import {  userGuard } from './auth/auth-guard-user';
import { adminGuard } from './auth/auth-guard-admin';
import { AdminUserEdit } from './Components/admin-user-edit/admin-user-edit';


export const routes: Routes = [
  { path: '', component: Carrusel },
  { path: 'movie-review/:id', component: MovieReview },
  { path: 'login', component: Login },
  { path: 'profile/edit', component: Signup, data: { mode: 'edit' } },
  { path: 'signup', component: Signup },
  { path: 'profile-detail', component: ProfileDetail, canActivate: [userGuard] },
  { path: 'search/:query', component: MovieSearch },
  { path: 'admin', component: AdminPanel, canActivate: [adminGuard] },
  { path: 'admin/user/:id', component: AdminUserEdit, canActivate: [adminGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

