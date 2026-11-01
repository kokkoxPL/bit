import { Form, useActionData, useNavigation } from 'react-router';

type ActionData = { error?: string; values?: { login: string } };

export function Component() {
	const actionData = useActionData() as ActionData | undefined;
	const submitting = useNavigation().state === 'submitting';

	return (
		<Form method="post" className="flex">
			<label>
				E-mail
				<input name="email" type="email" required autoComplete="email" defaultValue={'test@test.com'} />
			</label>
			<label>
				Hasło
				<input name="password" type="password" required autoComplete="current-password" defaultValue={'test'} />
			</label>

			{actionData?.error && <p>{actionData.error}</p>}

			<button type="submit" disabled={submitting}>
				{submitting ? 'Logowanie...' : 'Zaloguj'}
			</button>
		</Form>
	);
}
