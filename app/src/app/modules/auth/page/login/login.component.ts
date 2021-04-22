import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/service/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {

  bigimage = false;

  constructor(public authService:AuthService, private router:Router, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    
  }

  authenticate(){
    this.authService.authenticate(this.authService.authToken).subscribe(x => this.router.navigate(['dashboard']), error => this.openSnackBar("An error occured"));
  }

  openSnackBar(message: string, action: string=null) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

}
