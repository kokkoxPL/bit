import { json, urlencoded } from 'body-parser';
import 'dotenv/config';
import express from 'express';

import { addMeeting, addUser, getAll, initDatabase } from './database';
import routes from './routes';

const app = express();

app.use(urlencoded({ extended: false }));
app.use(json());

app.get('/', (req, res) => res.sendStatus(200));

app.use('/api', routes);

initDatabase();
addUser('test1', 'zero');
addMeeting({
	id: '2sda',
	datatimeStart: 'dsa',
	datatimeEnd: 'ds',
	title: 'a',
	users: ['ds', 'fas', 'ds'],
});
getAll();

app.listen(3000, () => console.log('Started'));
