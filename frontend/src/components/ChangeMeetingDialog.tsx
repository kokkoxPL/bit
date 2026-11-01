import { useEffect, useRef } from 'react';
import { useFetcher } from 'react-router';
import type { Meeting } from '../interfaces';

type Props = {
	meeting: Meeting;
	onClose: () => void;
};

export const ChangeMeetingDialog = ({ meeting, onClose }: Props) => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const fetcher = useFetcher();

	useEffect(() => {
		if (!dialogRef.current?.open) dialogRef.current?.showModal();
	}, []);

	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data?.ok) onClose();
	}, [fetcher.state, fetcher.data, onClose]);

	return (
		<dialog ref={dialogRef} onClose={onClose}>
			<fetcher.Form method="post" action={`/meeting/${meeting.id}`} className="calendar-dialog">
				<h2>Zmień Spotkanie</h2>
				<p>
					{meeting.timeStart.replace('T', ' ')} - {meeting.timeEnd.slice(11)}
				</p>

				<input type="hidden" name="id" value={meeting.id} />

				<label>
					Tytuł <input name="title" required autoFocus defaultValue={meeting.title} />
				</label>

				<label>
					Dzień <input type="date" name="date" required defaultValue={meeting.timeStart.slice(0, 10)} />
				</label>

				<label>
					Czas startu{' '}
					<input
						type="time"
						name="start"
						step="1800"
						min="08:00"
						max="20:00"
						required
						defaultValue={meeting.timeStart.slice(11)}
					/>
				</label>

				<label>
					Czas końca{' '}
					<input
						type="time"
						name="end"
						step="1800"
						min="08:00"
						max="20:00"
						required
						defaultValue={meeting.timeEnd.slice(11)}
					/>
				</label>

				{fetcher.data?.error && <p>{fetcher.data.error}</p>}
				<br />
				<button type="submit" name="action" value="change" disabled={fetcher.state !== 'idle'}>
					Zmień
				</button>
				<button type="button" onClick={onClose}>
					Zamknij
				</button>
				<button
					type="submit"
					name="action"
					value="delete"
					disabled={fetcher.state !== 'idle'}
					className="button-delete">
					Usuń
				</button>
			</fetcher.Form>
		</dialog>
	);
};
