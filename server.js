import express from 'express';
import { PORT } from './config.js';
import authRouter from './routes/auth.js';
import modelsRouter from './routes/models.js';

const app = express();

app.use(express.static('wwwroot'))
app.use(authRouter);
app.use(modelsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});