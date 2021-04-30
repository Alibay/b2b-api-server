import express from 'express';
import { router } from './../routes';

const app = express()
  .use('/api/v1', router);

app.listen(3000, () => console.log('Server started'));
