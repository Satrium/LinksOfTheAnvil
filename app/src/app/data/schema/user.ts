import { Image } from './image';

export interface User{
    id:string;
    locale:string;
    username:string;
    membership:boolean;
    membership_type:MempershipType;
    avatar?:Image;
}

export enum MempershipType{
    GRANDMASTER = "grandmaster"
}