import Knex from 'knex';
import { BaseRepository } from './base.repository';

export class CompanyRepository extends BaseRepository<ICompany> {

  public constructor(protected readonly db: Knex) {
    super(db, 'companies');
  }
}

export interface ICompany {
  id: number;
  name: string;
  createdAt: Date;
  countryId: number;
  cityId: number;
}
