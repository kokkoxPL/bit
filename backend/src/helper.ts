import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { createMeetingDB, createUserDB, getUserEmailDB } from './database';

const SECRET = process.env.JWT_SECRET!;

const PASSWORD_PARAMS = {
	parallelism: 4,
	tagLength: 64,
	memory: 65536,
	passes: 3,
};

export const cookieOptions = {
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: true,
};

export const signToken = (id: string) => jwt.sign({ sub: id }, SECRET, { algorithm: 'HS256', expiresIn: '15m' });

export const readToken = (token?: string) => {
	try {
		return jwt.verify(token ?? '', SECRET).sub as string;
	} catch {
		return null;
	}
};

export const requireAuth: RequestHandler = (req, res, next) => {
	const id = readToken(req.cookies.token);
	if (!id) return res.status(401).end();
	res.locals.userId = id;
	next();
};

const hash = (password: string, nonce: Buffer) =>
	crypto.argon2Sync('argon2id', { message: password, nonce, ...PASSWORD_PARAMS });

export const createUser = (email: string, password: string) => {
	const id = crypto.randomUUID();
	const nonce = crypto.randomBytes(16);
	const storedPassword = `${nonce.toString('hex')}:${hash(password, nonce).toString('hex')}`;

	if (!createUserDB({ id, email, password: storedPassword })) return null;
	const date = new Temporal.PlainDateTime(2026, 10, 26, 10);
	createMeetingDB({
		id: id,
		ownerId: id,
		title: 'test',
		timeStart: date.toString(),
		timeEnd: date.add({ hours: 1, minutes: 30 }).toString(),
	});
	return { id, email };
};

export const verifyUser = (email: string, password: string) => {
	const user = getUserEmailDB(email);
	if (!user) return null;

	try {
		const [nonce, expected] = user.password.split(':');
		const actual = hash(password, Buffer.from(nonce, 'hex'));
		const ok = crypto.timingSafeEqual(actual, Buffer.from(expected, 'hex'));
		return ok ? { id: user.id, email: user.email } : null;
	} catch {
		return null;
	}
};

export const createMeeting = (ownerId: string, title: string, start: string, end: string, userIds: string[]) => {
	const id = crypto.randomUUID();
	return createMeetingDB({ id, ownerId, title, timeStart: start, timeEnd: end }, userIds);
};
