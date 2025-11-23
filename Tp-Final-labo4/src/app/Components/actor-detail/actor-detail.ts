import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TmdbService } from '../../Services/tmdb.service';

@Component({
  selector: 'app-actor-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './actor-detail.html',
  styleUrl: './actor-detail.css',
})
export class ActorDetail implements OnInit {

  private route = inject(ActivatedRoute);
  private tmdb = inject(TmdbService);

  actorId!: number;
  actor: any;
  movies: any[] = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) return;

      this.actorId = id;
      this.loadActor();
      this.loadMovies();
    });
  }

  loadActor() {
    this.tmdb.getActorDetails(this.actorId).subscribe(actor => {
      this.actor = actor;
    });
  }

  loadMovies() {
    this.tmdb.getMoviesByActor(this.actorId).subscribe((res: any) => {
      this.movies = res?.cast ?? [];   // 👈 acá usamos cast
    });
  }
}
