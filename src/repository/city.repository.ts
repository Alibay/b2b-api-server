import Knex from 'knex';
import { BaseRepository } from './base.repository';

export class CityRepository extends BaseRepository<ICity> {

  public constructor(protected readonly db: Knex) {
    super(db, 'cities');
  }

  public getAllByCountryId(countryId: number): Promise<ICity[]> {
    return this.getAll({ countryId });
  }
}

export interface ICity {
  id: number;
  name: string;
  countryId: number;
}
