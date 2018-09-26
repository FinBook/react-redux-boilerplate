import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

export type VoidThunkAction = ThunkAction<void, IState, undefined, AnyAction>;

export interface IState {
	readonly firebase: IFirebaseState;
}

export interface IFirebaseState {
	readonly auth: boolean;
}

export interface IWSOrderBook {
	type: string;
	channel: {
		name: string;
		marketId: string;
	};
	changes: [
		{
			side: string;
			price: string;
			amount: string;
		}
	];
}
