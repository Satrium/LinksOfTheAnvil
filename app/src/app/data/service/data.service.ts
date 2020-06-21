import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http:HttpClient) { }

  public getWorlds(){
    return this.http.get("/api/user/worlds");
  }

  public getGraph(worldId){
    console.log(worldId);
    return this.http.get("/api/world/" + worldId);
  }

  public getPresets(){
    return this.http.get("/assets/presets.json");
  }
}