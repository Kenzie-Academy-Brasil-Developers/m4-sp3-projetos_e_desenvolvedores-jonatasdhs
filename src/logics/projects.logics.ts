import { query, Request, Response } from "express"
import { QueryConfig, QueryResult } from "pg"
import format from "pg-format"

import { client } from '../database/config'
import { IProjectsRequest, ProjectsResult, RequiredTechnologies } from "../interfaces/projects.interfaces"

export const createProject = async (req: Request, res: Response): Promise<Response> => {
    const projectData: IProjectsRequest = req.body

    const queryString = format(`
        INSERT INTO
            projects (%I)
        VALUES
            (%L)
        RETURNING *;
    `,
    Object.keys(projectData),
    Object.values(projectData))

    const queryResult: ProjectsResult = await client.query(queryString)
    return res.status(201).json(queryResult.rows[0])
}

export const readAllProjects = async (req: Request, res: Response): Promise<Response> => {
    const queryString: string = `
        SELECT 
            pr.id "projectID",
            pr.name "projectName",
            pr.description "projectDescription",
            pr."estimatedTime" "projectEstimatedTime",
            pr.repository "projectRepository",
            pr."startDate" "projectStartDate",
            pr."endDate" "projectEndDate",
            pr."developerId" "projectDeveloperId",
            te.id "technologyID",
            te.name "technologyName"
        FROM
            projects pr
        LEFT JOIN projects_technologies pt ON pr.id = pt."projectId"
        LEFT JOIN technologies te ON pt."technologyId" = te.id;
    `

    const queryResult: ProjectsResult = await client.query(queryString)
    return res.status(200).json(queryResult.rows)
}

export const readProject = async (req: Request, res: Response): Promise<Response> => {
    const id: number = parseInt(req.params.id)
    const queryString: string = `
        SELECT 
            pr.id "projectID",
            pr.name "projectName",
            pr.description "projectDescription",
            pr."estimatedTime" "projectEstimatedTime",
            pr.repository "projectRepository",
            pr."startDate" "projectStartDate",
            pr."endDate" "projectEndDate",
            pr."developerId" "projectDeveloperId",
            te.id "technologyID",
            te.name "technologyName"
        FROM
            projects pr
        LEFT JOIN projects_technologies pt ON pr.id = pt."projectId"
        LEFT JOIN technologies te ON pt."technologyId" = te.id
        WHERE
            pr.id = $1;
    `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }

    const queryResult: ProjectsResult = await client.query(queryConfig)
    return res.status(200).json(queryResult.rows[0])
}

export const updateProject = async (req: Request, res: Response): Promise<Response> => {
    const id: number = parseInt(req.params.id)
    const updateData: any = req.body

    const queryString: string = format(`
        UPDATE
            projects
        SET
            (%I) = ROW(%L)
        WHERE 
            id = $1
        RETURNING *;   
    `,
    Object.keys(updateData), 
    Object.values(updateData))
    
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }
    try {
        const queryResult: ProjectsResult = await client.query(queryConfig)
        return res.status(200).json(queryResult.rows[0])
    } catch(error: any) {
        return res.status(400).json({message: error.message})
    }
}

export const createTechnologies = async (req: Request, res: Response): Promise<Response> => {
    const id: number = parseInt(req.params.id)
    const technologiesData = req.body

    let queryString = `
        SELECT *
        FROM technologies
        WHERE 
            name = $1
    `
    let queryConfig: QueryConfig = {
        text: queryString,
        values: [technologiesData.name]
    }

    const queryResultTechnology = await client.query(queryConfig)

    if(queryResultTechnology.rowCount === 0){
        return res.status(404).json({message: 'Technology not supported.'})
    }
    const date = new Date()
    queryString = `
        INSERT INTO
            projects_technologies ("addedIn", "projectId", "technologyId")
        VALUES
            ($1, $2, $3)
        RETURNING *;
    `
    queryConfig = {
        text: queryString,
        values: [date, id, queryResultTechnology.rows[0].id]
    }

    const queryResultProjectTechnology = await client.query(queryConfig)

    return res.status(201).json(queryResultProjectTechnology.rows[0])
}

export const deleteProjectTechnology = async (req: Request, res: Response): Promise<Response> => {
    const id: number = parseInt(req.params.id)
    const name: string = req.params.name
    const requiredTechnologies: Array<RequiredTechnologies> = ['JavaScript', 'CSS', 'Django', 'Express.js', 'HTML', 'MongoDB', 'PostgreSQL', 'Python', 'React']

    let queryString: string = `
        SELECT 
            *
        FROM 
            technologies
        WHERE
            name = $1;
    `

    let queryConfig: QueryConfig = {
        text: queryString,
        values: [name]
    }
    
    const queryResultTechnology = await client.query(queryConfig)
    
    if(queryResultTechnology.rowCount === 0) {
        return res.status(404).json({message: 'Technology not supported.', options: [requiredTechnologies]})
    }   

    queryString = `
        DELETE FROM
            projects_technologies
        WHERE
            "projectId" = $1
        OR
            "technologyId" = $2;
    `

    queryConfig = {
        text:queryString,
        values: [id, queryResultTechnology.rows[0].id]
    }
    
    
    const resultDelete = await client.query(queryConfig)
    if(resultDelete.rowCount === 0) {
        return res.status(404).json({message: `Technology '${name}' not found on this Project.`})
    }
    
    return res.status(204).send()
}