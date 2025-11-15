import express from 'express';
import bodyParser from 'body-parser';
import { PORT } from './config.js';
import authRouter from './routes/auth.js';
import modelsRouter from './routes/models.js';
import manageRouter from './routes/components.js';
import homeRouter from './routes/home.js';

const app = express();

app.use(express.static('wwwroot'))
app.use(bodyParser.json());

// Route middlewares
app.use(authRouter);
app.use(modelsRouter);
app.use(manageRouter);
app.use(homeRouter);

// Views setup
app.set('views', './views');

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});