import { Fragment, useMemo, useRef, useState } from 'react';
import type { Meeting, Range } from '../interfaces';

const defaultHour = new Temporal.PlainTime(8);
const hours = [...Array(24)].map((_, i) => defaultHour.add({ minutes: 30 * i }).toString({ smallestUnit: 'minute' }));
const nextHour = (hour: string) => hours[hours.indexOf(hour) + 1] ?? '20:00';

const toRange = (a: string, b: string): Range => {
	const [first, last] = a <= b ? [a, b] : [b, a];
	const end = Temporal.PlainDateTime.from(last).add({ minutes: 30 }).toString({ smallestUnit: 'minute' });
	return { start: first, end };
};

const slotAt = (e: React.PointerEvent) =>
	(document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.dataset.slot;

const firstDayOfWeek = (date: Temporal.PlainDate) => date.subtract({ days: date.dayOfWeek - 1 }).toString();

type Props = {
	meetings: Meeting[];
	selection?: Range | null;
	onSelect?: (range: Range) => void;
	onSlotClick?: (meeting: Meeting) => void;
};

export const Calendar = ({ meetings, selection = null, onSelect, onSlotClick }: Props) => {
	const anchor = useRef<string | null>(null);
	const [preview, setPreview] = useState<Range | null>(null);
	const [start, setStart] = useState(() => firstDayOfWeek(Temporal.Now.plainDateISO()));

	const days = useMemo(
		() => [...Array(7)].map((_, i) => Temporal.PlainDate.from(start).add({ days: i }).toString()),
		[start],
	);

	const moveDays = (n: number) => setStart((s) => Temporal.PlainDate.from(s).add({ days: n }).toString());
	const goToToday = () => setStart(firstDayOfWeek(Temporal.Now.plainDateISO()));

	const meetingAt = (slot: string) => meetings.find((m) => m.timeStart <= slot && slot < m.timeEnd);

	const onPointerDown = (e: React.PointerEvent) => {
		const slot = slotAt(e);
		if (!slot || meetingAt(slot)) return;
		anchor.current = slot;
		setPreview(toRange(slot, slot));
	};

	const onPointerMove = (e: React.PointerEvent) => {
		const a = anchor.current;
		const slot = slotAt(e);
		if (!a || !slot) return;

		const day = a.slice(0, 10);
		if (!slot.startsWith(day)) return;

		const from = hours.indexOf(a.slice(11));
		const to = hours.indexOf(slot.slice(11));
		const step = to >= from ? 1 : -1;

		let last = from;
		while (last !== to && !meetingAt(`${day}T${hours[last + step]}`)) last += step;

		setPreview(toRange(a, `${day}T${hours[last]}`));
	};

	const endDrag = () => {
		if (!anchor.current) return;
		anchor.current = null;
		const finished = preview;
		setPreview(null);
		if (finished) onSelect?.(finished);
	};

	const onClick = (e: React.MouseEvent) => {
		const cell = (e.target as HTMLElement).closest<HTMLElement>('[data-slot]');
		const slot = cell?.dataset.slot;
		if (slot) onSlotClick?.(meetingAt(slot)!);
	};

	const highlighted = preview ?? selection;

	const dragHandlers = onSelect
		? { onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerLeave: endDrag, onPointerCancel: endDrag }
		: {};

	return (
		<>
			<div className="calendar-nav">
				<button type="button" onClick={() => moveDays(-1)}>
					&lt;
				</button>
				<button type="button" onClick={goToToday}>
					Dzisiaj
				</button>
				<button type="button" onClick={() => moveDays(1)}>
					&gt;
				</button>
			</div>

			<div className={`calendar ${onSelect ? 'selectable' : ''}`} {...dragHandlers}>
				<div /> {/* lewy górny róg */}
				{days.map((day) => (
					<div key={day} className="calendar-day">
						{day}
					</div>
				))}
				{hours.map((hour, i) => (
					<Fragment key={hour}>
						<div className="calendar-time">
							{hour} - {nextHour(hour)}
						</div>
						{days.map((day) => {
							const slot = `${day}T${hour}`;
							const meeting = meetingAt(slot);
							const selected = highlighted && slot >= highlighted.start && slot < highlighted.end;
							const showTitle = meeting && (i === 0 || meetingAt(`${day}T${hours[i - 1]}`)?.id !== meeting.id);

							return (
								<div
									key={slot}
									data-slot={slot}
									title={meeting?.title}
									onClick={meeting && onSlotClick ? onClick : undefined}
									className={`calendar-cell ${selected ? 'selected' : meeting ? 'blocked' : ''}`}>
									{showTitle && <span className="calendar-cell-title">{meeting.title}</span>}
								</div>
							);
						})}
					</Fragment>
				))}
			</div>
		</>
	);
};
