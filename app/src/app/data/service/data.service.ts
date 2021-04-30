import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Graph } from '@global/graph';
import { GraphConfigModel, Preset } from '@global/graph.config';
import { SharedGraph, SharedGraphInfo, SharedGraphInfoResponse } from '@global/share';
import { World } from '@global/worldanvil/world';
import { UserWorlds } from '@global/worldanvil/user';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http:HttpClient) { }

  public getWorlds():Observable<UserWorlds>{
    return this.http.get<UserWorlds>("/api/user/worlds");
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

  public getSharedGraphs():Observable<SharedGraphInfo[]>{
    return this.http.get<SharedGraphInfo[]>("/api/shared").pipe(
      map(x => {
        x.forEach(y => {y.creationDate = new Date(y.creationDate); y.modificationDate = new Date(y.modificationDate)});
        return x;
      })
    );
  }

  public postSharedGraph(graph:SharedGraphInfo):Observable<SharedGraphInfoResponse>{
    return this.http.post<SharedGraphInfoResponse>("/api/shared", graph).pipe(
      map(x => {
        x.graphInfo.creationDate = new Date(x.graphInfo.creationDate);
        x.graphInfo.modificationDate = new Date(x.graphInfo.modificationDate);
        return x;
      })
    );   
  }

  public getSharedGraph(id: string):Observable<SharedGraph>{
    console.log("Get shared graph")
    return this.http.get<SharedGraph>(`/api/shared/${id}`)
  }
}
