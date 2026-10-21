import { Request, Response, Router } from 'express';

const router = Router();

router.post('/register', (req: Request, res: Response) => {
	return res.sendStatus(201);
});

router.post('/login', (req: Request, res: Response) => {
	return res.sendStatus(201);
});

export default router;
