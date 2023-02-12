import express, { Application } from "express";

import { startDatabase } from "./database/connection";
import { createDeveloperInfo, updateDeveloperInfo } from "./logics/infos.logics";
import {createDeveloper, deleteDeveloper, getAllDevelopers, getDeveloper, readAllDevProjects, updateDeveloper} from './logics/developers.logics'
import {createProject, createTechnologies, deleteProjectTechnology, readAllProjects, readProject, updateProject} from './logics/projects.logics'
import { ensureDeveloperExists, verifyDeveloperData, verifyInfosData } from "./middlewares/middlewares";
import {deleteProject, ensureDevExists, ensureProjectExists, verifyProjectsData} from './middlewares/projects.middlewares'

const app: Application = express();
app.use(express.json())

app.post('/developers', createDeveloper)
app.get('/developers', getAllDevelopers)
app.get('/developers/:id', ensureDeveloperExists, getDeveloper)
app.patch('/developers/:id', ensureDeveloperExists, verifyDeveloperData, updateDeveloper)
app.delete('/developers/:id', ensureDeveloperExists, deleteDeveloper)

app.post('/developers/:id/infos', ensureDeveloperExists, createDeveloperInfo)
app.patch('/developers/:id/infos', ensureDeveloperExists, verifyInfosData, updateDeveloperInfo)

app.get('/developers/:id/projects', ensureDeveloperExists, readAllDevProjects)

app.post('/projects', ensureDevExists, verifyProjectsData, createProject)
app.get('/projects', readAllProjects)
app.get('/projects/:id', readProject)
app.patch('/projects/:id', ensureProjectExists, verifyProjectsData, updateProject)
app.delete('projects/:id', ensureProjectExists, deleteProject)

app.post('/projects/:id/technologies', ensureProjectExists, createTechnologies)
app.delete('/projects/:id/technologies/:name', ensureProjectExists, deleteProjectTechnology)


const PORT: number = 3000
app.listen(PORT, async () => {
    await startDatabase()
    console.log(`Server is running on PORT: ${PORT}!`)
})
