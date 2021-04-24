import { WorldInfo } from "./world";

export interface CurrentUser{
    id: string;
    username: string;
    url: string;
}

export interface User extends CurrentUser{    
    membership: boolean;
    membership_type?: string;
    avatar?: UserAvatar;
}

export interface UserAvatar{
    id: number;
    url: string;
}

export interface UserWorlds{
    id: string;
    username: string;
    worlds: WorldInfo[];
}