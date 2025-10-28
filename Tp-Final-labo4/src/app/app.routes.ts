import { Routes } from '@angular/router';
import { Login } from './Components/login/login';
import { Carrusel } from './Components/carrusel/carrusel';
import { Signup } from './Components/signup/signup';

export const routes: Routes = [
    {path: '', component: Carrusel},
    {path: 'login', component: Login },
    {path: 'signup', component: Signup},
    {path: '**',redirectTo: '', pathMatch: 'full'}

];
