import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import  router from './routes/index.js';

var app = express();

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

router(app);

export default app;
