import { QueryResult } from "pg"

export interface IProjectsRequest {
    name: string,
    description: string,
    estimatedTime: string,
    repository: string,
    startDate: Date,
    developerId: number,
}

export interface IProjects extends IProjectsRequest {
    id: number
}

export type ProjectsResult = QueryResult<IProjects>
export type RequiredProjectKeys = 'name' | 'description' | 'estimatedTime' | 'repository' | 'startDate' | 'endDate' | 'developerId'
export type RequiredTechKeys = 'name'
export type RequiredTechnologies = 'JavaScript' | 'Python' | 'React' | 'Express.js' | 'HTML' | 'CSS' | 'Django' | 'PostgreSQL' | 'MongoDB'