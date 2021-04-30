import { NextFunction, Request, Response } from 'express';
import { ProductRepository } from '../repository/product.repository';
import { NotFoundError } from './error/not-found.error';

export class ProductController {

  public constructor(private readonly productRepository: ProductRepository) {
  }

  public async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const companies = await this.productRepository.getAll();

      res.json(companies);
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;
      const company = await this.productRepository.get(id);
      if (!company) {
        throw new NotFoundError('Product not found');
      }

      res.json(company);
    } catch (err) {
      next(err);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;
      const company = await this.productRepository.get(id);
      if (!company) {
        throw new NotFoundError('Product not found');
      }

      res.json(company);
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;
      const company = await this.productRepository.get(id);
      if (!company) {
        throw new NotFoundError('Product not found');
      }

      res.json(company);
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;
      const company = await this.productRepository.get(id);
      if (!company) {
        throw new NotFoundError('Product not found');
      }

      res.json(company);
    } catch (err) {
      next(err);
    }
  }
}
