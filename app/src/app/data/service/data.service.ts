import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Graph } from '@global/graph';
import { GraphConfigModel, Preset } from '@global/graph.config';
import { World } from '@global/worldanvil/world';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http:HttpClient) { }

  public getWorlds():Observable<World[]>{
    return this.http.get<World[]>("/api/user/worlds");
  }

  public getGraph(worldId):Observable<Graph>{
    console.log(worldId);
    return this.http.get<Graph>("/api/world/" + worldId);
  }

  public getPresets():Observable<Array<Preset>>{
    return this.http.get<Array<any>>("/api/preset");
  }

  public getPreset(id):Observable<Preset>{
    return this.http.get<Preset>("/api/preset/" + id);
  }

  public savePreset(preset:Preset):Observable<Preset>{
    delete preset.id;
    delete preset.config.id;
    return this.http.post<Preset>("/api/preset", preset);    
  }

  public updatePreset(preset:Preset):Observable<Preset>{
    return this.http.put<Preset>(`/api/preset/${preset.id}`, preset); 
  }

  public deletePreset(id:string){
    return this.http.delete(`/api/preset/${id}`);
  }
}
