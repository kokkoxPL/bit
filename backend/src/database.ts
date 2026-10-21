import crypto from 'crypto';
import { DatabaseSync } from 'node:sqlite';
const database = new DatabaseSync(':memory:');

export const initDatabase = () => {
	database.exec(`
        CREATE TABLE users(
            id TEXT PRIMARY KEY UNIQUE,
            login TEXT UNIQUE,
            password TEXT
        ) STRICT
    `);

	database.exec(`
        CREATE TABLE meetings(
            id TEXT PRIMARY KEY UNIQUE,
            datatime_start TEXT,
            datatime_end TEXT,
            title TEXT,
            users TEXT CHECK (json_valid(users) AND json_type(users) = 'array')
        ) STRICT
    `);
};

const PASSWORD_PARAMS = {
	parallelism: 4,
	tagLength: 64,
	memory: 65536,
	passes: 3,
};

export const addUser = (login: string, password: string) => {
	const nonce = crypto.randomBytes(16);

	const parameters = {
		message: password,
		nonce,
		...PASSWORD_PARAMS,
	};

	const derivedKey = crypto.argon2Sync('argon2id', parameters);
	const storedPassword = `${nonce.toString('hex')}:${derivedKey.toString('hex')}`;

	database
		.prepare('INSERT INTO users (id, login, password) VALUES (?, ?, ?)')
		.run(crypto.randomUUID(), login, storedPassword);
};

export const verifyPassword = (login: string, password: string) => {
	const row = database.prepare(`SELECT password FROM users WHERE login = ?`).get(login) as
		| { password: string }
		| undefined;

	if (!row) return false;

	const [nonce, hash] = row.password.split(':');

	const expected = Buffer.from(hash, 'hex');

	const actual = crypto.argon2Sync('argon2id', {
		message: password,
		nonce: Buffer.from(nonce, 'hex'),
		...PASSWORD_PARAMS,
	});

	return crypto.timingSafeEqual(actual, expected);
};

interface MeetingData {
	id: string;
	datatimeStart: string;
	datatimeEnd: string;
	title: string;
	users: string[];
}

export const addMeeting = (meetingData: MeetingData) => {
	database
		.prepare(
			'INSERT INTO meetings (id, datatime_start, datatime_end, title, users) VALUES (?, ?, ?, ?, ?)',
		)
		.run(
			meetingData.id,
			meetingData.datatimeStart,
			meetingData.datatimeEnd,
			meetingData.title,
			JSON.stringify(meetingData.users),
		);
};

export const getAll = () => {
	console.log(database.prepare('SELECT * FROM users').all());
	console.log(database.prepare('SELECT * FROM meetings').all());
};
