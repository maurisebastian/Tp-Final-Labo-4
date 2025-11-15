import { Routes } from '@angular/router';
import { Login } from './Components/login/login';
import { Carrusel } from './Components/carrusel/carrusel';
import { Signup } from './Components/signup/signup';
import { MovieReview } from './Components/movie-review/movie-review';
import { ProfileDetail } from './Components/profile-detail/profile-detail';
import { MovieSearch } from './Components/movie-search/movie-search';

export const routes: Routes = [
    {path: '', component: Carrusel},
    {path:'movie-review/:id',component: MovieReview},
    {path: 'login', component: Login },
    {path: 'signup', component: Signup},
    {path: 'profile-detail',component : ProfileDetail },
    {path: 'search/:query',component : MovieSearch},
    {path: '**',redirectTo: '', pathMatch: 'full'}

];
