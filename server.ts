import express from 'express';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import * as authController from './src/controllers/authController';
import errorMiddleware from './src/middlewares/errorMiddleware';

config();

const PORT = process.env.PORT || 3500;
const app = express();

mongoose.connect(`${process.env.DATABASE_URI}`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/register', authController.register);
app.post('/login', authController.logIn);

app.use(errorMiddleware);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

export default app;
