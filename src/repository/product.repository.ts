import Knex from 'knex';
import { BaseRepository } from './base.repository';

export class ProductRepository extends BaseRepository<IProduct> {

  public constructor(protected readonly db: Knex) {
    super(db, 'products');
  }
}

export interface IProduct {
  id: number;
  name: string;
  createdAt: Date;
  available: boolean;
}
