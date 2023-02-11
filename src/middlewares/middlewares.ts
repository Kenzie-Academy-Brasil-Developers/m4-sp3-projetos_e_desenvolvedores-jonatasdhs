import { NextFunction, Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";

import { client } from "../database/config";
import { ListDeveloperRequiredKeys, ListInfosRequiredKeys } from "../interfaces/developers.interfaces";

export const ensureDeveloperExists = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const developerId: number = parseInt(req.params.id)

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
        values: [developerId]
    }

    const queryResult: QueryResult = await client.query(queryConfig)
    if(Number(queryResult.rows.length <= 0)) {
        return res.status(404).json({message: 'Developer not found.'})
    }

    next()
}

export const verifyDeveloperData = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const keys: Array<string> = Object.keys(req.body)
    const requiredKeys: Array<ListDeveloperRequiredKeys> = ['name', 'email']

    if(!keys.includes(requiredKeys[0] || keys.includes(requiredKeys[1]))) {
        return res.status(400).json({message: 'At least one of those keys must be send.', keys: requiredKeys})
    }

    keys.forEach((key: any) => {
        if(!requiredKeys.includes(key)) {
            delete req.body[key]
        }
    })

    next()
}

export const verifyInfosData = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const keys: Array<string> = Object.keys(req.body)
    const requiredKeys: Array<ListInfosRequiredKeys> = ['developerSince', 'preferredOS']

    if(!keys.includes(requiredKeys[0]) || keys.includes(requiredKeys[1])) {
        return res.status(400).json({message: 'At least one of those keys must be send.', keys: requiredKeys})
    }

    keys.forEach((key: any) => {
        if(!requiredKeys.includes(key)) {
            delete req.body[key]
        }
    })

    next()
}