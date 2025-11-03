import { Component,inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder,Validators,ReactiveFormsModule} from '@angular/forms';
import { ProfileService } from '../../Services/profile.service';
import { Profile } from '../../Interfaces/profilein';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private formBuilder = inject(FormBuilder);

  form = this.formBuilder.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  })
  

  constructor(
    private profileService: ProfileService,
    private router: Router
  ) { }

  onLogin() {
    if (this.form.invalid) return;

    const user = this.form.getRawValue() as Profile;

    this.profileService.login(user).subscribe({
      next: (loggedin) => {
        if (loggedin) {
          this.router.navigate(['/']);
        } 
      }
    })
  }


}