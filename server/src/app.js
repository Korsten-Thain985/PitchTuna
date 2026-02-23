import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import debug from 'debug';

import testRoute from './api/routes/testRoutes.js';
import userRoute    from './api/routes/userRoutes.js';
import attemptRoute from './api/routes/attemptRoutes.js';

dotenv.config();
debug.enable(process.env.DEBUG); // enable DEBUG from .env

const startup = debug('startup');
const dirname = path.resolve();

const app = express();

app.use(morgan('dev'));
app.use(cors());

app.use(express.static(path.join(dirname, '/public')));
app.use(express.json());

app.use('/', testRoute);
app.use('/', userRoute);
app.use('/', attemptRoute);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => startup(`Server is running on port ${PORT}`));

export default app;
