import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate{

  public get authToken(): string{
    return localStorage.getItem("apikey");
  }
  public set authToken(value:string){
    localStorage.setItem("apikey", value);
  }

  constructor() { }

  public getAuthToken():string{
    return this.authToken;
  }

  public isAuthenticated():boolean{
    return this.authToken != null;
  }

  public authenticate(authToken:string){
    this.authToken = authToken;
  }

  canActivate(){
    return this.isAuthenticated();
  }

}
