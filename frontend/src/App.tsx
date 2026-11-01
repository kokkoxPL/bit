import { Form, NavLink, Outlet, useRouteLoaderData } from 'react-router';
import type { User } from './interfaces';

function App() {
	const user = useRouteLoaderData('auth') as User;
	return (
		<div>
			<div style={{ display: 'inline' }}>
				<NavLink to="/">
					<button>HOME</button>
				</NavLink>

				<span>{user.email}</span>

				<Form method="post" action="/logout" style={{ display: 'inline', margin: '0px 10px' }}>
					<button>Wyloguj</button>
				</Form>
			</div>

			<section id="center">
				<main>
					<Outlet />
				</main>
			</section>

			<section id="spacer"></section>
		</div>
	);
}

export default App;
