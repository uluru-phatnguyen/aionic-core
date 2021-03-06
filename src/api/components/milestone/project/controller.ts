import { bind } from 'decko';
import { NextFunction, Request, Response } from 'express';

import { Project } from './model';
import { ProjectService } from './service';
import { FindConditions, OrderByCondition } from 'typeorm';

export class ProjectController {
	private readonly service: ProjectService = new ProjectService();

	/**
	 * Read projects
	 *
	 * @param req Express request
	 * @param res Express response
	 * @param next Express next
	 * @returns Returns HTTP response
	 */
	@bind
	public async readProjects(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { completed, orderby, orderdir, limit } = req.query;

			let where: FindConditions<Project> = {};
			let order: OrderByCondition = { completed: 'ASC' };
			let take: number = 0;

			if (completed !== undefined && completed.length) {
				where = { ...where, completed: !!+completed };
			}

			if (orderby || orderdir) {
				order = { [orderby || 'completed']: orderdir || 'ASC' };
			}

			if (limit) {
				take = limit;
			}

			const projects: Project[] = await this.service.readAll({
				where,
				order,
				take,
				relations: ['author', 'tasks', 'tasks.status']
			});

			return res.json({ status: res.statusCode, data: projects });
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * Read project
	 *
	 * @param req Express request
	 * @param res Express response
	 * @param next Express next
	 * @returns Returns HTTP response
	 */
	@bind
	public async readProject(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { projectID } = req.params;

			if (!projectID) {
				return res.status(400).json({ status: 400, error: 'Invalid request' });
			}

			const project: Project | undefined = await this.service.read({
				relations: ['author', 'tasks', 'tasks.priority', 'tasks.assignee', 'tasks.author', 'tasks.status'],
				where: {
					id: projectID
				}
			});

			return res.json({ status: res.statusCode, data: project });
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * Create project
	 *
	 * @param req Express request
	 * @param res Express response
	 * @param next Express next
	 * @returns Returns HTTP response
	 */
	@bind
	public async createProject(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			if (!req.body.project) {
				return res.status(400).json({ status: 400, error: 'Invalid request' });
			}

			const newProject: Project = await this.service.save(req.body.project);

			return res.json({ status: res.statusCode, data: newProject });
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * Update project
	 *
	 * @param req Express request
	 * @param res Express response
	 * @param next Express next
	 * @returns Returns HTTP response
	 */
	@bind
	public async updateProject(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { projectID } = req.params;

			if (!projectID || !req.body.project) {
				return res.status(400).json({ status: 400, error: 'Invalid request' });
			}

			const project: Project | undefined = await this.service.read({
				where: {
					id: projectID
				}
			});

			if (!project) {
				return res.status(404).json({ status: 404, error: 'project not found' });
			}

			const updatedProject: Project = await this.service.save(req.body.project);

			return res.json({ status: res.statusCode, data: updatedProject });
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * Delete project
	 *
	 * @param req Express request
	 * @param res Express response
	 * @param next Express next
	 * @returns Returns HTTP response
	 */
	@bind
	public async deleteProject(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { projectID } = req.params;

			if (!projectID) {
				return res.status(400).json({ status: 400, error: 'Invalid request' });
			}

			const project: Project | undefined = await this.service.read({
				where: {
					id: projectID
				}
			});

			if (!project) {
				return res.status(404).json({ status: 404, error: 'Project not found' });
			}

			await this.service.delete(project);

			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}
}
