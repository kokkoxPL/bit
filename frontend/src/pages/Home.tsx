import { useState } from 'react';
import { Link, useRouteLoaderData } from 'react-router';
import { Calendar } from '../components/Calendar';
import { ChangeMeetingDialog } from '../components/ChangeMeetingDialog';
import type { Meeting } from '../interfaces';

export const Component = () => {
	const meeting = useRouteLoaderData('meetings') as Meeting[];
	const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

	return (
		<>
			<Link to={'/meeting/new'}>
				<button>Utwórz spotkanie</button>
			</Link>
			<Calendar meetings={meeting} onSlotClick={(meeting: Meeting) => setSelectedMeeting(meeting)} />
			{selectedMeeting && <ChangeMeetingDialog meeting={selectedMeeting} onClose={() => setSelectedMeeting(null)} />}
		</>
	);
};
