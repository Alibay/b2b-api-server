import { Router } from 'express';
import { countryController } from './context';

export const router = Router();

router.get('/countries', countryController.getAllCountries.bind(countryController));
