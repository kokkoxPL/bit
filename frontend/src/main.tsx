import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/calendar.css';
import './styles/index.css';

import { createBrowserRouter, Outlet, redirect, RouterProvider } from 'react-router';
import {
	changeMeetingAction,
	createMeetingAction,
	getMeetingsLoader,
	loginAction,
	logoutAction,
	registerAction,
	requireUserLoader,
} from './actions.ts';

export const router = createBrowserRouter([
	{ path: 'login', action: loginAction, lazy: () => import('./pages/Login') },
	{ path: 'register', action: registerAction, lazy: () => import('./pages/Register') },

	{ path: 'logout', action: logoutAction, loader: () => redirect('/') },

	{
		id: 'auth',
		path: '/',
		loader: requireUserLoader,
		Component: App,
		children: [
			{
				id: 'meetings',
				loader: getMeetingsLoader,
				Component: Outlet,
				children: [
					{ index: true, action: changeMeetingAction, lazy: () => import('./pages/Home') },
					{ path: 'meeting/new', action: createMeetingAction, lazy: () => import('./pages/NewMeeting.tsx') },
					{ path: 'meeting/:id', action: changeMeetingAction },
				],
			},
		],
	},
]);

createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
