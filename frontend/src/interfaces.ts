export interface User {
	id: string;
	email: string;
}

export interface Meeting {
	id: string;
	ownerId: string;
	title: string;
	timeStart: string;
	timeEnd: string;
}

export interface Range {
	start: string;
	end: string;
}

export interface Busy {
	timeStart: string;
	timeEnd: string;
}
