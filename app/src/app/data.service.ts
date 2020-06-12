import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private auth:AuthService, private http:HttpClient) { }

  public getWorlds(){
    return this.http.get("/api/user");
  }

  public getGraph(worldId){
    console.log(worldId);
    return this.http.get("/api/world/" + worldId);
  }
}
