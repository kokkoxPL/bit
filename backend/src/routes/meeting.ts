import { Request, Response, Router } from 'express';
import {
	deleteMeetingDB,
	getBusyByUserDB,
	getMeetingByIdDB,
	getMeetingsByParticipantDB,
	getParticipantIdsDB,
	hasOverlapDB,
	updateMeetingDB,
} from '../database';
import { createMeeting } from '../helper';
import { Meeting } from '../interfaces';

const router = Router();

router.get('/get/all', (req: Request, res: Response) => {
	const id = res.locals.userId;
	const meetings = getMeetingsByParticipantDB(id);
	return res.json(meetings);
});

router.get('/get', (req: Request, res: Response) => {
	const { id } = req.body;
	const meeting = getMeetingByIdDB(id);
	return res.json(meeting);
});

router.post('/new', (req: Request, res: Response) => {
	const ownerId = res.locals.userId;
	const { title, start, end, users } = req.body;

	const everyone = [...new Set([ownerId, ...users])];
	if (everyone.some((id) => hasOverlapDB(id, start, end))) {
		return res.status(409).json({ error: 'overlap' });
	}

	if (createMeeting(ownerId, title, start, end, users)) return res.sendStatus(201);
	return res.sendStatus(500);
});

router.post('/update', (req: Request, res: Response) => {
	const { id, title, timeStart, timeEnd }: Meeting = req.body;

	if (timeEnd <= timeStart) {
		return res.status(400).json({ error: 'timeEnd is before timeStart' });
	}

	const meeting = getMeetingByIdDB(id);
	if (!meeting) return res.status(404).json({ error: 'meeting not found' });

	const conflict = getParticipantIdsDB(meeting.id).some((userId) =>
		hasOverlapDB(userId, timeStart, timeEnd, meeting.id),
	);
	if (conflict) return res.status(409);

	if (updateMeetingDB(id, title, timeStart, timeEnd)) return res.sendStatus(200);
	return res.sendStatus(500);
});

router.post('/delete', (req: Request, res: Response) => {
	const { id } = req.body;

	const meeting = getMeetingByIdDB(id);
	if (!meeting) return res.status(404).json({ error: 'meeting not found' });

	if (deleteMeetingDB(meeting.id)) return res.sendStatus(204);
	return res.sendStatus(500);
});

router.post('/busy', (req: Request, res: Response) => {
	const { userId, day } = req.body;
	return res.json(getBusyByUserDB(userId, day));
});

export default router;
