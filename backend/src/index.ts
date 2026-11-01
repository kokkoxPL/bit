import { json, urlencoded } from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { initDatabase } from './database';
import { createUser, requireAuth } from './helper';
import meetingRoutes from './routes/meeting';
import userRoutes from './routes/user';

initDatabase();
createUser('test@test.com', 'test');
createUser('test2@test.com', 'test');
createUser('test3@test.com', 'test');

const app = express();

app.use(urlencoded({ extended: false }));
app.use(json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(cookieParser());

app.get('/', (req, res) => res.sendStatus(200));

app.use('/api/user', userRoutes);
app.use('/api/meeting', requireAuth, meetingRoutes);

app.listen(3000, () => console.log('Started'));
