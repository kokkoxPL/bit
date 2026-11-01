import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import type { Busy, Meeting, User } from './interfaces';

const API = import.meta.env.VITE_API_URL;

export async function checkIfUserExist(email: string): Promise<User | null> {
	const response = await fetch(`${API}/api/user/email`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ email }),
	});
	if (response.status === 404) return null;

	const { id } = (await response.json()) as { id: string };
	return { id, email };
}

export const requireUserLoader = async () => {
	const response = await fetch(`${API}/api/user/me`, { credentials: 'include' });
	if (!response.ok) throw redirect('/login');
	return response.json();
};

export const loginAction = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const response = await fetch(`${API}/api/user/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(Object.fromEntries(formData)),
	});

	if (!response.ok) {
		return { error: 'zły email lub hasło' };
	}

	return redirect('/');
};

export const registerAction = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const response = await fetch(`${API}/api/user/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(Object.fromEntries(formData)),
	});

	if (!response.ok) {
		return { error: 'zły email lub hasło' };
	}

	return redirect('/');
};

export const logoutAction = async () => {
	await fetch(`${API}/api/user/logout`, { method: 'POST', credentials: 'include' });
	return redirect('/login');
};

export const getMeetingsLoader = async ({ request }: LoaderFunctionArgs) => {
	const response = await fetch(`${API}/api/meeting/get/all`, {
		credentials: 'include',
		signal: request.signal,
	});

	if (!response.ok) throw new Response('problem z załadowaniem', { status: response.status });
	return response.json() as Promise<Meeting[] | null>;
};

export const createMeetingAction = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const users = formData.getAll('users').map(String);

	const response = await fetch(`${API}/api/meeting/new`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({
			title: formData.get('title'),
			start: formData.get('start'),
			end: formData.get('end'),
			users,
		}),
	});

	if (!response.ok) throw new Response('problem z tworzeniem', { status: response.status });
	return redirect('/');
};

export const changeMeetingAction = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const id = formData.get('id');
	const action = formData.get('action');
	const date = formData.get('date');
	let response;

	const data = {
		id: id!.toString(),
		title: formData.get('title')!.toString(),
		timeStart: `${date}T${formData.get('start')}`,
		timeEnd: `${date}T${formData.get('end')}`,
	};

	if (action === 'delete') {
		response = await fetch(`${API}/api/meeting/delete/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ id }),
		});

		if (!response.ok) throw new Response('problem z usunięciem', { status: response.status });
	}

	if (action === 'change') {
		response = await fetch(`${API}/api/meeting/update/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(data),
		});

		if (!response.ok) throw new Response('problem z zmienieniem', { status: response.status });
	}
	if (response!.status === 200 || response!.status === 204) return { ok: true };

	const body = await response!.json().catch(() => null);
	return { error: body?.error ?? 'Something went wrong' };
};

export async function getBusy(userId: string, day: string) {
	const response = await fetch(`${API}/api/meeting/busy`, {
		credentials: 'include',
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ userId, day }),
	});
	if (!response.ok) throw new Error('problem z załadowaniem');
	return response.json() as Promise<Busy[]>;
}
