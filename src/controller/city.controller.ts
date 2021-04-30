import { NextFunction, Request, Response } from 'express';
import { CityRepository } from '../repository/city.repository';

export class CityController {

  public constructor(private readonly cityRepository: CityRepository) {
  }

  public async getAllByCountryId(req: Request, res: Response, next: NextFunction) {
    try {
      const countryId = +req.params.id;
      const cities = await this.cityRepository.getAllByCountryId(countryId);

      res.json(cities);
    } catch (err) {
      next(err);
    }
  }
}
