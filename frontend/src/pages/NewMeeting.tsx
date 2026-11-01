import { useState } from 'react';
import { useRouteLoaderData } from 'react-router';
import { Calendar } from '../components/Calendar';
import { NewMeetingDialog } from '../components/NewMeetingDialog';
import type { Meeting, Range } from '../interfaces';

export const Component = () => {
	const meetings = (useRouteLoaderData('meetings') as Meeting[] | null) ?? [];
	const [selection, setSelection] = useState<Range | null>(null);

	return (
		<>
			<Calendar meetings={meetings} selection={selection} onSelect={setSelection} />
			{selection && <NewMeetingDialog range={selection} onClose={() => setSelection(null)} />}
		</>
	);
};
