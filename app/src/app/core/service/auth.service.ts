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

  public get authToken(): string{
    return localStorage.getItem("apikey");
  }
  public set authToken(value:string){
    localStorage.setItem("apikey", value);
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
