import { CurrentUser, User, UserWorlds } from '@global/worldanvil/user';
import { Article} from '@global/worldanvil/article';
import Bottleneck from 'bottleneck';
import fetch from 'node-fetch';
import { World, WorldArticles } from '@global/worldanvil/world';

export class WorldAnvil{

    private static BASE_URL = "https://www.worldanvil.com/api/aragorn/";

    private _appToken: string;
    private _limiter: Bottleneck;
    
    constructor(appToken:string, limiter:Bottleneck){
        this._appToken = appToken;
        this._limiter = limiter;
    }

    private async request(url: string, userToken: string){
        let headers = {
            'x-application-key': this._appToken,
            'x-auth-token': userToken,
            'Content-Type': "application/json"
        }
        
        let response = await this._limiter.schedule(() => {
            console.debug("Request: " + WorldAnvil.BASE_URL + url);
            return fetch(WorldAnvil.BASE_URL + url, {headers})
        });
        if(response.ok){
            return response.json();
        }else{
            return null;
        }
    }

    public async getCurrentUser(userToken):Promise<CurrentUser>{
        return this.request("user", userToken);
    }

    public async getUser(userToken:string, id: string):Promise<User>{
        return this.request(`user/${id}`, userToken);
    }

    public async getArticle(userToken:string, id:string):Promise<Article>{
        return this.request(`article/${id}`, userToken);
    }

    public async getUserWorlds(userToken:string, id:string):Promise<UserWorlds>{
        return this.request(`user/${id}/worlds`, userToken);
    }

    public async getWorldArticles(userToken, worldId, offset=0):Promise<WorldArticles>{
        return this.request(`world/${worldId}/articles?offset=${offset}`, userToken);
    }

    public async getAllWorldArticles(userToken, worldId, offset=0):Promise<Article[]>{
        let worldArticles = await this.getWorldArticles(userToken, worldId, offset);
        if(!worldArticles.articles || worldArticles.articles.length < parseInt(worldArticles.limit)){
            return worldArticles.articles || [];
        }else{
            return worldArticles.articles.concat((await this.getAllWorldArticles(userToken, worldId,offset + parseInt(worldArticles.limit))));
        }
    }

    public async getWorld(userToken, worldId):Promise<World>{
        return this.request(`world/${worldId}`, userToken);
    }
}


export class WorldAnvilError extends Error{
    private statusCode:number;
    private exception: Error;
    constructor(message, statusCode, exception?) {
        super(message);
       // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
       // This clips the constructor invocation from the stack trace.
       // It's not absolutely essential, but it does make the stack trace a little nicer.
       //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
        this.statusCode = statusCode;
        this.exception = exception;
      }
}