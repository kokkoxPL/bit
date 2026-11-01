import { Request, Response, Router } from 'express';
import { getUserByIdDB, getUserEmailDB } from '../database';
import { cookieOptions, createUser, requireAuth, signToken, verifyUser } from '../helper';

const router = Router();

router.post('/register', (req: Request, res: Response) => {
	const { email, password } = req.body;
	const user = createUser(email, password);
	if (!user) return res.status(409).json({ error: 'could not create user' });
	return res.status(201).json(user);
});

router.post('/login', (req, res) => {
	const { email, password } = req.body;
	const user = verifyUser(email, password);
	if (!user) return res.status(401).json({ error: 'wrong login' });

	res.cookie('token', signToken(user.id), { ...cookieOptions, maxAge: 15 * 60 * 1000 });
	res.json(user);
});

router.post('/logout', (req: Request, res: Response) => {
	res.clearCookie('token', cookieOptions);
	return res.sendStatus(204);
});

router.get('/me', requireAuth, (req: Request, res: Response) => {
	const user = getUserByIdDB(res.locals.userId);
	if (!user) return res.sendStatus(401);
	return res.json(user);
});

router.post('/email', requireAuth, (req: Request, res: Response) => {
	const { email } = req.body;
	const user = getUserEmailDB(email);
	if (!user) return res.sendStatus(404);
	return res.json({ id: user.id });
});

export default router;
