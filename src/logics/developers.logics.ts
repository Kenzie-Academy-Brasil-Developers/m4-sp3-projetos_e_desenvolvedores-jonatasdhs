import { query, Request, Response } from "express";
import { QueryConfig } from "pg";
import format from 'pg-format';

import { client } from "../database/config";
import { DevelopersResult, IDeveloperRequest } from "../interfaces/developers.interfaces";

export const createDeveloper = async (req: Request, res: Response): Promise<Response> => {
    const developerData: IDeveloperRequest = req.body
    
    const queryString = format(`
        INSERT INTO
            developers (%I)
        VALUES (%L)
        RETURNING *;   
    `,
    Object.keys(developerData),
    Object.values(developerData))
    try {
        const queryResult: DevelopersResult = await client.query(queryString)
        return res.status(201).json(queryResult.rows[0])
    } catch (error: any) {
        if(error.message.includes('null value')){          
            return res.status(400).json({message: `Missing required keys: ${error.column}.` })
        }
        if(error.message.includes('duplicate key value violates unique constraint')) {
            return res.status(409).json({message: 'Email already exists.'})
        }
        return res.status(500).json({message: error.message})
    }
}

export const getAllDevelopers = async (req: Request, res: Response): Promise<Response> => {
    const queryString = `
        SELECT 
            de.id "developerId",
            de.name "developerName",
            de.email "developerEmail",
            di.id "developerInfoID",
            di."developerSince" "developerInfoDeveloperSince",
            di."preferredOS" "developerInfoPreferredOS"
        FROM 
            developers de
        LEFT JOIN developer_infos di ON de."developerInfoId" = di."id";
    `
    const queryResult: DevelopersResult = await client.query(queryString)
    return res.status(200).json(queryResult.rows)
}

export const getDeveloper = async (req: Request, res: Response): Promise<Response> => {
    const id: number = parseInt(req.params.id)
    const queryString = `
        SELECT 
            de.id "developerId",
            de.name "developerName",
            de.email "developerEmail",
            di.id "developerInfoID",
            di."developerSince" "developerInfoDeveloperSince",
            di."preferredOS" "developerInfoPreferredOS"
        FROM 
            developers de
        JOIN 
            developer_infos di ON de."developerInfoId" = di."id"
        WHERE
            de.id = $1
        ;`

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }
    try {
        const queryResult: DevelopersResult = await client.query(queryConfig)
        return res.status(200).json(queryResult.rows[0])
    } catch(error: any) {
        return res.status(404).json({message: error.message})
    }
}


export const updateDeveloper = async (req: Request, res: Response): Promise<Response> => {
    const id: number = parseInt(req.params.id)
    const updateData: any = req.body

    const queryString: string = format(`
        UPDATE
            developers
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

    const queryResult = await client.query(queryConfig)
    return res.status(200).json(queryResult.rows[0])
}


export const deleteDeveloper = async (req: Request, res: Response): Promise<Response> => {
    const id: number = parseInt(req.params.id)
    
    const queryString: string = `
        DELETE FROM
            developers
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

export const readAllDevProjects = async (req: Request, res: Response): Promise<Response> => {
    const id: number = parseInt(req.params.id)

    const queryString: string = `
        SELECT 
            de.id "developerID",
            de.name "developerName",
            de.email "developerEmail",
            de."developerInfoId" "developerInfoID",
            di."developerSince" "developerInfoDeveloperSince",
            di."preferredOS" "developerInfoPreferredOS",
            pr.id "projectID",
            pr.name "projectName",
            pr.description "projectDescription",
            pr."estimatedTime" "projectEstimatedTime",
            pr.repository "projectRepository",
            pr."startDate" "projectStartDate",
            pr."endDate" "projectEndDate",
            te."id" "technologyId",
            te."name" "technologyName"
        FROM
            projects pr
        JOIN developers de ON pr."developerId" = de.id
        LEFT JOIN developer_infos di ON de."developerInfoId" = di.id
        LEFT JOIN projects_technologies pt ON pr."id" = pt."projectId"
        LEFT JOIN technologies te ON pt."technologyId" = te.id
        WHERE
            de.id = $1;
    `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }

    const queryResult = await client.query(queryConfig)
    return res.status(200).json(queryResult.rows)
}