import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Graph } from '@global/graph';
import { GraphConfigModel, Preset } from '@global/graph.config';

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

  public getPresets(worldId):Observable<Preset[]>{
    return this.http.get<Array<Preset>>("/api/world/" + worldId + "/presets");
  }

  public getPreset(id):Observable<Preset>{
    return this.http.get<Preset>("/api/preset/" + id);
  }

  public savePreset(preset:Preset){
    delete preset.id;
    delete preset.config.id;
    return this.http.post("/api/preset", preset);    
  }

  public updatePreset(preset:Preset){
    preset.id = preset.config.id;
    return this.http.put(`/api/preset/${preset.id}`, preset); 
  }
}
