import { query, Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import format from 'pg-format';

import { client } from "../database/config";
import { DevelopersResult, IDeveloperRequest, IDevelopers, IDevInfoRequest, ListRequiredOS } from "../interfaces/developers.interfaces";

export const createDeveloperInfo = async (req: Request, res: Response): Promise<Response> => {
    const {developerSince, preferredOS}: IDevInfoRequest = req.body 
    const id: number = parseInt(req.params.id)
    const requiredOS: Array<ListRequiredOS> = ["Linux", "MacOS", "Windows"]

    let queryString: string = `
        INSERT INTO
            developer_infos ("developerSince", "preferredOS")
        VALUES
            ($1, $2)
        RETURNING 
            *;
    `

    let queryConfig: QueryConfig = {
        text: queryString,
        values: [developerSince, preferredOS]
    }
    try {
        const queryResultInfos = await client.query(queryConfig)
    
        queryString = `
            UPDATE 
                developers
            SET
                "developerInfoId" = $1
            WHERE
                id = $2
        `
    
        queryConfig = {
            text: queryString,
            values: [queryResultInfos.rows[0].id, id]
        }
    
        await client.query(queryConfig)
    
        return res.status(201).json(queryResultInfos.rows[0])
    } catch(error: any) {
        return res.status(400).json({message: `Preferred OS not supported`, options: requiredOS})
    }
}

export const updateDeveloperInfo = async (req: Request, res: Response): Promise<Response> => {
    const id: number = parseInt(req.params.id)
    const request: any = req.body

    const queryString: string = format(`
        UPDATE
            developer_infos
        SET
            (%I) = ROW(%L)
        WHERE 
            id = $1
        RETURNING *;
    `,Object.keys(request),
    Object.values(request))

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }

    const queryResult = await client.query(queryConfig)
    return res.status(200).json(queryResult.rows[0])
}