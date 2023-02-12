import { QueryResult } from "pg"

export interface IDeveloperRequest {
    name: string,
    email: string,
    developerInfoId: number | null
}

export interface IDevelopers extends IDeveloperRequest {
    id: number
}

export interface IDevInfoRequest {
    developerSince: string,
    preferredOS: string,
}

export type DevelopersResult = QueryResult<IDevelopers>
export type ListDeveloperRequiredKeys = 'name' | 'email'
export type ListInfosRequiredKeys = 'developerSince' | 'preferredOS'
export type ListRequiredOS = 'Windows' | 'MacOS' | 'Linux'