import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

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

  constructor(private data:DataService, public auth:AuthService, private router:Router) { }

  ngOnInit(): void {
  }

  loadWorlds(){
    this.auth.authenticate(this.apikey);
    this.data.getWorlds().subscribe(x => this.user = x);
  }

  loadWorld(id){
    this.router.navigate([id]);
  }

}
