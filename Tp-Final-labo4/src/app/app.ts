import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./Shared/navbar/navbar";
import { Footer } from './Shared/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar,Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Tp-Final-labo4');
}
