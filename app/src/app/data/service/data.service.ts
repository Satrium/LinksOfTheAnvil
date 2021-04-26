import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Graph } from '@global/graph';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http:HttpClient) { }

  public getWorlds(){
    return this.http.get("/api/user/worlds");
  }

  public getGraph(worldId):Observable<Graph>{
    console.log(worldId);
    return this.http.get<Graph>("/api/world/" + worldId);
  }

  public getGlobalPresets():Observable<Array<any>>{
    return this.http.get<Array<any>>("/api/preset");
  }

  public getPresets(worldId){
    return this.http.get("/api/world/" + worldId + "/presets");
  }

  public getPreset(id){
    return this.http.get("/api/preset/" + id);
  }
}
