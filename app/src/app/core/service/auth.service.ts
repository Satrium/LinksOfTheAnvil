import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { DataService } from '@data/service/data.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of, ReplaySubject } from 'rxjs';
import { User } from '@data/schema/user';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService{

  private _token:string;

  public get authToken(): string{
    try{
      return localStorage.getItem("apikey");
    }catch{
      return this._token;
    }    
  }
  public set authToken(value:string){
    try{
      localStorage.setItem("apikey", value);
    }catch{
      this._token = value;
    }    
  }

  private hasUserLoadingTriggered = false;
  private _user$ = new ReplaySubject(1);

  constructor(private http:HttpClient) { }

  public get user$(){
    if(!this.hasUserLoadingTriggered){
      this.hasUserLoadingTriggered = true;
      this.loadUser().subscribe();
    }
    return this._user$;
  }

  public getAuthToken():string{
    return this.authToken;
  }

  public get isAuthenticated():boolean{
    return this.authToken != null;
  }

  public authenticate(authToken:string): Observable<User>{
    this.authToken = authToken;  
    return this.loadUser();  
  }

  private loadUser(): Observable<User>{
    return this.http.get<User>("/api/auth").pipe(
      tap(x => this._user$.next(x))
    );
  }
}
