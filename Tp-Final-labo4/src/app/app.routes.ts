import { Routes } from '@angular/router';
import { Login } from './Components/login/login';
import { Carrusel } from './Components/carrusel/carrusel';
import { Signup } from './Components/signup/signup';
import { MovieReview } from './Components/movie-review/movie-review';

export const routes: Routes = [
    {path: '', component: Carrusel},
    {path:'movie-review/:id',component: MovieReview},
    {path: 'login', component: Login },
    {path: 'signup', component: Signup},
    {path: '**',redirectTo: '', pathMatch: 'full'}

];
