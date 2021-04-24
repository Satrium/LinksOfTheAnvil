import { WorldAnvilDate } from "./general";
import { User } from "./user";
import { WorldInfo } from "./world";

export interface Article{
    id: string;
    title: string;
    template: string;
    is_wip: boolean;
    is_draft: boolean;
    passcode?: string;
    state?: string;
    wordcount: number;
    creation_date: WorldAnvilDate;
    update_date: WorldAnvilDate;
    last_update?: WorldAnvilDate;
    publication_date: WorldAnvilDate;
    notification_date?: WorldAnvilDate;
    tags: string;
    url: string;

    category?: ArticleCategory;
    world: WorldInfo;
    author: User;

    portrait?: ArticleImage;
    content: string;
    content_parsed: string;
    sections: {[key:string]:ArticleSection}
    relations:{[key:string]:ArticleRelation | ArticleRelationItem}
    full_render: string;
}

export interface ArticleCategory{
    id: string;
    title: string;
    slug: string;
    url: string;
}

export interface ArticleImage{
    id: number;
    url: string;
}

export interface ArticleSection{
    title: string;
    position: string;
    content: string;
    content_parsed: string;
}

export interface ArticleRelation{
    title: string;
    position: string;
    type: string;
    items: ArticleRelationItem | ArticleRelationItem[]
}

export interface ArticleRelationItem{
    id?:string;
    title: string;
    position: string;
    type: string;
    is_article?: boolean;
    state: string;
}