import { DatabaseSync } from 'node:sqlite';
import { Meeting, User } from './interfaces';
const database = new DatabaseSync(process.env.DB_FILE!);

export const initDatabase = () => {
	database.exec(`PRAGMA foreign_keys = ON`);

	database.exec(`
        CREATE TABLE IF NOT EXISTS users(
            id TEXT PRIMARY KEY UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        ) STRICT
    `);

	database.exec(`
        CREATE TABLE IF NOT EXISTS meetings(
            id TEXT PRIMARY KEY UNIQUE,
						ownerId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            timeStart TEXT NOT NULL,
            timeEnd TEXT NOT NULL
        ) STRICT
    `);

	database.exec(`
        CREATE TABLE IF NOT EXISTS participants(
            meetingId TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
            userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            PRIMARY KEY (meetingId, userId)
        ) STRICT
    `);

	database.exec(`
        CREATE TABLE IF NOT EXISTS availability(
            meetingId TEXT NOT NULL,
            userId TEXT NOT NULL,
            slotStart TEXT NOT NULL,
            PRIMARY KEY (meetingId, userId, slotStart),
            FOREIGN KEY (meetingId, userId)
                REFERENCES participants(meetingId, userId) ON DELETE CASCADE
        ) STRICT
    `);
};

export const createUserDB = (user: User) => {
	const { id, email, password } = user;
	try {
		database.prepare('INSERT INTO users (id, email, password) VALUES (?, ?, ?)').run(id, email, password);
		return true;
	} catch (err) {
		console.error('error (createUser): ', err);
		return false;
	}
};

export const getUserEmailDB = (email: string) => {
	return database.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
};

export const getUserByIdDB = (id: string) => {
	return database.prepare('SELECT id, email FROM users WHERE id = ?').get(id) as { id: string; email: string };
};

export const createMeetingDB = (meeting: Meeting, userIds: string[] = []) => {
	const { id, ownerId, title, timeStart, timeEnd } = meeting;

	database.exec('BEGIN');
	try {
		database
			.prepare('INSERT INTO meetings (id, ownerId, title, timeStart, timeEnd) VALUES (?, ?, ?, ?, ?)')
			.run(id, ownerId, title, timeStart, timeEnd);

		database.prepare(`INSERT INTO participants (meetingId, userId) VALUES (?, ?)`).run(id, ownerId);

		const invite = database.prepare('INSERT OR IGNORE INTO participants (meetingId, userId) VALUES (?, ?)');
		for (const userId of userIds) invite.run(id, userId);

		database.exec('COMMIT');
		return true;
	} catch (err) {
		console.error('error (createUser): ', err);
		database.exec('ROLLBACK');
		return false;
	}
};

export const getMeetingByIdDB = (id: string) => {
	return database.prepare('SELECT * FROM meetings WHERE id = ?').get(id) as Meeting | undefined;
};

export const getMeetingsByParticipantDB = (userId: string) => {
	return database
		.prepare(
			`SELECT m.*
			 FROM meetings m
			 JOIN participants p ON p.meetingId = m.id
			 WHERE p.userId = ?
			 ORDER BY m.timeStart`,
		)
		.all(userId) as Meeting[];
};

export const updateMeetingDB = (id: string, title: string, timeStart: string, timeEnd: string) => {
	return database
		.prepare('UPDATE meetings SET title = ?, timeStart = ?, timeEnd = ? WHERE id = ?')
		.run(title, timeStart, timeEnd, id);
};

export const deleteMeetingDB = (id: string) => {
	return database.prepare('DELETE FROM meetings WHERE id = ?').run(id);
};

export const hasOverlapDB = (userId: string, timeStart: string, timeEnd: string, ignoreId = '') => {
	return (
		undefined !==
		database
			.prepare(
				`SELECT 1
			 FROM meetings m
			 JOIN participants p ON p.meetingId = m.id
			 WHERE p.userId = ? AND m.id != ? AND m.timeStart < ? AND m.timeEnd > ?
			 LIMIT 1`,
			)
			.get(userId, ignoreId, timeEnd, timeStart)
	);
};

export const addParticipantDB = (meetingId: string, userId: string) => {
	return database
		.prepare('INSERT OR IGNORE INTO participants (meetingId, userId) VALUES (?, ?)')
		.run(meetingId, userId);
};

export const removeParticipantDB = (meetingId: string, userId: string) => {
	return database.prepare('DELETE FROM participants WHERE meetingId = ? AND userId = ?').run(meetingId, userId);
};

export const getParticipantsDB = (meetingId: string) => {
	return database
		.prepare(
			`SELECT u.id, u.email
			 FROM participants p
			 JOIN users u ON u.id = p.userId
			 WHERE p.meetingId = ?
			 ORDER BY u.email`,
		)
		.all(meetingId) as { id: string; email: string }[];
};

export const getParticipantIdsDB = (meetingId: string) => {
	const rows = database.prepare('SELECT userId FROM participants WHERE meetingId = ?').all(meetingId) as {
		userId: string;
	}[];
	return rows.map((row) => row.userId);
};

export const getBusyByUserDB = (userId: string, day: string) => {
	return database
		.prepare(
			`SELECT m.timeStart, m.timeEnd
			 FROM meetings m
			 JOIN participants p ON p.meetingId = m.id
			 WHERE p.userId = ? AND substr(m.timeStart, 1, 10) = ?
			 ORDER BY m.timeStart`,
		)
		.all(userId, day) as { timeStart: string; timeEnd: string }[];
};
