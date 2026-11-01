import { useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';
import { checkIfUserExist, getBusy } from '../actions';
import type { Busy, User } from '../interfaces';

type Props = {
	range: { start: string; end: string };
	onClose: () => void;
};

interface BusyUser extends User {
	busy: Busy[];
}

export const NewMeetingDialog = ({ range, onClose }: Props) => {
	const [users, setUsers] = useState<BusyUser[]>([]);
	const [email, setEmail] = useState('');
	const [checking, setChecking] = useState(false);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const fetcher = useFetcher();

	const day = range.start.slice(0, 10);
	const busyConflicts = (b: Busy) => b.timeStart < range.end && b.timeEnd > range.start;
	const conflicts = users.filter((u) => u.busy.some(busyConflicts));

	useEffect(() => {
		if (!dialogRef.current?.open) dialogRef.current?.showModal();
	}, []);

	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data?.ok) onClose();
	}, [fetcher.state, fetcher.data, onClose]);

	const addEmail = async () => {
		const value = email.trim().toLowerCase();
		if (!value || checking || users.some((u) => u.email === value)) return;

		setChecking(true);
		try {
			const found = await checkIfUserExist(value);
			if (!found) throw new Error('not found');

			const busy = await getBusy(found.id, day);
			const user: BusyUser = { ...found, busy };
			setUsers((prev) => (prev.some((u) => u.id === user.id) ? prev : [...prev, user]));
			setEmail('');
		} catch (error) {
			alert(error);
		} finally {
			setChecking(false);
		}
	};

	return (
		<dialog ref={dialogRef} onClose={onClose}>
			<fetcher.Form method="post" action="/meeting/new" className="calendar-dialog">
				<h2>Nowe Spotkanie</h2>
				<p>
					{range.start.replace('T', ' ')} - {range.end.slice(11)}
				</p>

				<input type="hidden" name="start" value={range.start} />
				<input type="hidden" name="end" value={range.end} />
				{users.map((u) => (
					<input key={u.id} type="hidden" name="users" value={u.id} />
				))}

				<label>
					Tytuł <input name="title" required autoFocus />
				</label>

				<input
					type="email"
					placeholder="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							addEmail();
						}
					}}
				/>
				<button type="button" onClick={addEmail} disabled={checking}>
					{checking ? 'Sprawdzam...' : 'Dodaj użytkownika'}
				</button>

				<ul>
					{users.map((u) => (
						<li key={u.id}>
							{u.email}{' '}
							<button type="button" onClick={() => setUsers((prev) => prev.filter((x) => x.id !== u.id))}>
								x
							</button>
							<br />
							<small>
								{u.busy.length === 0
									? 'wolny cały dzień'
									: u.busy.map((b) => (
											<span key={b.timeStart} className={busyConflicts(b) ? 'busy clash' : 'busy'}>
												{b.timeStart.slice(11)}-{b.timeEnd.slice(11)}{' '}
											</span>
										))}
							</small>
						</li>
					))}
				</ul>

				{conflicts.length > 0 && <p>Zajęci w tym czasie: {conflicts.map((u) => u.email).join(', ')}</p>}

				{fetcher.data?.error && <p>{fetcher.data.error}</p>}

				<div>
					<button type="button" onClick={onClose}>
						Zamknij
					</button>
					<button type="submit" disabled={fetcher.state !== 'idle' || conflicts.length > 0}>
						Stwórz
					</button>
				</div>
			</fetcher.Form>
		</dialog>
	);
};
