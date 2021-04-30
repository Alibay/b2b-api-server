import Knex from 'knex';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<IUser> {

  public constructor(protected readonly db: Knex) {
    super(db, 'users');
  }

  public getByEmail(email: string) {
    return this.getBy({ email });
  }
}

export interface IUser {
  id: number;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
  registeredAt: Date;
  lastLognAt: Date;
  active: boolean;
}
