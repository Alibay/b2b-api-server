import Knex from 'knex';
import { BaseRepository } from './base.repository';

export class CountryRepository extends BaseRepository<ICountry> {

  public constructor(protected readonly db: Knex) {
    super(db, 'countries');
  }
}

export interface ICountry {
  id: number;
  name: string;
}
