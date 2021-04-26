import { Article } from "./article";

export interface World{
    id: string;
    name: string;
    locale: string
}

export interface WorldInfo{
    id: string;
    title: string;
    slug?: string;
    url: string;   
}

export interface WorldArticles{
    world: WorldInfo;
    term?:string;
    offset: string;
    limit: string;
    orderBy: string;
    trajectory?: string;
    articles: Article[];
}