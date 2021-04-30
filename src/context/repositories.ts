import { CityRepository } from '../repository/city.repository';
import { CompanyRepository } from '../repository/company.repository';
import { CountryRepository } from '../repository/country.repository';
import { UserRepository } from '../repository/user.repository';
import { db } from './db';

export const countryRepository = new CountryRepository(db);
export const cityRepository = new CityRepository(db);
export const userRepository = new UserRepository(db);
export const companyRepository = new CompanyRepository(db);
