import { NextFunction, Request, Response } from 'express';

export class CountryController {

  public getAllCountries(_req: Request, res: Response, next: NextFunction) {
    try {
      const countries = [
        { id: 1, name: 'Ukraine' },
        { id: 2, name: 'Poland' },
        { id: 3, name: 'USA' },
      ];

      res.json(countries);
    } catch (err) {
      next(err);
    }
  }
}
