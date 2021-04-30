import { NextFunction, Request, Response } from 'express';
import { CategoryRepository } from '../repository/category.repository';

export class CategoryController {

  public constructor(private readonly categoryRepository: CategoryRepository) {
  }

  public async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await this.categoryRepository.getAll();

      res.json(categories);
    } catch (err) {
      next(err);
    }
  }
}
