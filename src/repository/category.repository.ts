import Knex from 'knex';
import { BaseRepository } from './base.repository';

export class CategoryRepository extends BaseRepository<ICategory> {

  public constructor(protected readonly db: Knex) {
    super(db, 'categories');
  }
}

export interface ICategory {
  id: number;
  name: string;
  parentId: number | null;
}
