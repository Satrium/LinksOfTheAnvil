import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.sass']
})
export class StartComponent implements OnInit {

  public get apikey(): string{
    return localStorage.getItem("apikey");
  }
  public set apikey(value:string){
    localStorage.setItem("apikey", value);
  }
  user;

  constructor(private data:DataService, public auth:AuthService, private router:Router, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  loadWorlds(){
    this.auth.authenticate(this.apikey);
    this.data.getWorlds().subscribe(x => this.user = x, error => this.openSnackBar("An Error occured"));
  }

  loadWorld(id){
    this.router.navigate([id]);
  }

  openSnackBar(message: string, action: string=null) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

}
