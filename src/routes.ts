import { Router } from 'express';
import { cityController, companyController, countryController } from './context/controllers';

export const router = Router();

router.get('/countries', countryController.getAll.bind(countryController));
router.get('/countries/:id/cities', cityController.getAllByCountryId.bind(cityController));

router.get    ('/companies', companyController.getAll.bind(companyController));
router.get    ('/companies/:id', companyController.getById.bind(companyController));
router.post   ('/companies', companyController.create.bind(companyController));
router.put    ('/companies/:id', companyController.update.bind(companyController));
router.delete ('/companies/:id', companyController.delete.bind(companyController));
