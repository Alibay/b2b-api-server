import { NextFunction, Request, Response } from 'express';
import { CompanyRepository } from '../repository/company.repository';
import { NotFoundError } from './error/not-found.error';

export class CompanyController {

  public constructor(private readonly companyRepository: CompanyRepository) {
  }

  public async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const companies = await this.companyRepository.getAll();

      res.json(companies);
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;
      const company = await this.companyRepository.get(id);
      if (!company) {
        throw new NotFoundError('Company not found');
      }

      res.json(company);
    } catch (err) {
      next(err);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;
      const company = await this.companyRepository.get(id);
      if (!company) {
        throw new NotFoundError('Company not found');
      }

      res.json(company);
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;
      const company = await this.companyRepository.get(id);
      if (!company) {
        throw new NotFoundError('Company not found');
      }

      res.json(company);
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;
      const company = await this.companyRepository.get(id);
      if (!company) {
        throw new NotFoundError('Company not found');
      }

      res.json(company);
    } catch (err) {
      next(err);
    }
  }
}
