import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

export type VoidThunkAction = ThunkAction<void, IState, undefined, AnyAction>;

export interface IState {
	readonly firebase: IFirebaseState;
}

export interface IFirebaseState {
	readonly auth: boolean;
}

export interface IWSOrderBook extends IChannel {
	changes: [
		{
			side: string;
			price: string;
			amount: string;
		}
	];
}

export interface IChannel {
	type: string;
	channel: {
		name: string;
		marketId: string;
	};
}

export interface IWSOrderBookSubscription extends IChannel {
	requestId: number;
	payload: {
		bids: [
			{
				makerTokenName: string;
				takerTokenName: string;
				marketId: string;
				side: string;
				amount: number;
				price: number;
			}
		];
		asks: [
			{
				makerTokenName: string;
				takerTokenName: string;
				marketId: string;
				side: string;
				amount: number;
				price: number;
			}
		];
	};
}
