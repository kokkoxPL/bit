export type User = {
	id: string;
	email: string;
	password: string;
};

export type Meeting = {
	id: string;
	ownerId: string;
	title: string;
	timeStart: string;
	timeEnd: string;
};
