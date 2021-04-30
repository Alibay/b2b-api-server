import { NextFunction, Request, Response } from 'express';
import { CountryRepository } from '../repository/country.repository';

export class CountryController {

  public constructor(private readonly countryRepository: CountryRepository) {
  }

  public async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const countries = await this.countryRepository.getAll();

      res.json(countries);
    } catch (err) {
      next(err);
    }
  }
}
