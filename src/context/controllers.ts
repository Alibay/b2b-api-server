import { CityController } from '../controller/city.controller';
import { CompanyController } from '../controller/company.controller';
import { CountryController } from './../controller/country.controller';
import { cityRepository, companyRepository, countryRepository } from './repositories';

export const countryController = new CountryController(countryRepository);
export const cityController = new CityController(cityRepository);
export const companyController = new CompanyController(companyRepository);
