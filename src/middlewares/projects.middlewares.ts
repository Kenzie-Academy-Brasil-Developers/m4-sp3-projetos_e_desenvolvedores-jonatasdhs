import { Request, Response, NextFunction, query } from "express";
import {client} from '../database/config'
import { QueryConfig } from "pg";
import { IProjectsRequest, ProjectsResult, RequiredProjectKeys } from "../interfaces/projects.interfaces";
import { string } from "pg-format";

export const ensureDevExists = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const id: number = req.body.developerId

    const queryString: string = `
        SELECT
            *
        FROM
            developers
        WHERE
            id = $1;
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }

    const queryResult = await client.query(queryConfig)
    if(Number(queryResult.rows.length) <= 0) {
        return res.status(400).json({message: 'Developer not found.'})
    }

    next()
}

export const verifyProjectsData = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const projectData: any = req.body
    const requiredKeys: Array<RequiredProjectKeys> = ['name', "description", 'estimatedTime', 'repository','startDate', 'developerId']
    const keys: Array<string> = [...requiredKeys, 'endDate']

    let containsRequiredKeys: boolean = requiredKeys.every((key: string) => Object.keys(projectData).includes(key))
    
    if(req.method === "PATCH") {
        containsRequiredKeys = true
        let validKeys: boolean = false
        Object.keys(projectData).forEach((key: any) => {            
            if(requiredKeys.includes(key)) validKeys = true
        })

        if(!validKeys) return res.status(400).json({
            message: 'At least one of those keys must be send.',
            keys: requiredKeys
        })
    }

    if(!containsRequiredKeys) return res.status(400).json({message: `Missing required keys: ${requiredKeys}`})
    
    Object.keys(projectData).forEach((key: any) => {
        if(!keys.includes(key)){
            delete projectData[key]
        }
    })
    
    next()
}

export const ensureProjectExists = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const id: number = parseInt(req.params.id)

    const queryString: string = `
        SELECT 
            *
        FROM 
            projects
        WHERE
            id = $1
        ;
    `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }

    const queryResult = await client.query(queryConfig)
    if(queryResult.rows.length <= 0) return res.status(404).json({message: 'Project not found.'})

    next()
}

export const deleteProject = async (req: Request, res: Response): Promise<Response> => {
    const id: number = parseInt(req.params.id)

    const queryString = `
        DELETE
            projects
        WHERE
            id = $1;
    `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }

    await client.query(queryConfig)
    return res.status(204).send()
}