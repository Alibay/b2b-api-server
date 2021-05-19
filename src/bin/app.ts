import express from 'express';
import cors from 'cors';
import { router } from './../routes';
import config from 'config';
import authMiddleware from '../middleware/auth.middleware';
import { getLogger } from '../context';
import errorHandlerMiddleware from '../middleware/error-handler.middleware';

const port = config.get<number>('port');

const logger = getLogger('app');

export const app = express()
  .use(cors())
  .use(authMiddleware)
  .use('/api/v1', router)
  .use(errorHandlerMiddleware);

app.listen(port, () => logger.info(`Server started at localhost:${port}`));
