import {  ExchangeContractErrs, OrderRelevantState } from '0x.js';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

export type VoidThunkAction = ThunkAction<void, IState, undefined, AnyAction>;

export interface IState {
	readonly firebase: IFirebaseState;
	readonly ws: IWSState;
}

export interface IFirebaseState {
	readonly auth: boolean;
}

export interface IWSState {
	readonly add: IWSOrderBookChanges[];
	readonly subscribe: { [src: string]: IWSOrderBookSubscription };
}

export interface IWSOrderBook extends IWSChannel {
	changes: [
		{
			side: string;
			price: string;
			amount: string;
		}
	];
}

export interface IWSOrderBookChanges {
	side: string;
	price: string;
	amount: string;
}

export interface IWSChannel {
	type: string;
	channel: {
		name: string;
		marketId: string;
	};
}

export interface IDuoSignedOrder {
	senderAddress: string;
	makerAddress: string;
	takerAddress: string;
	makerFee: string;
	takerFee: string;
	makerAssetAmount: string;
	takerAssetAmount: string;
	makerAssetData: string;
	takerAssetData: string;
	salt: string;
	exchangeAddress: string;
	feeRecipientAddress: string;
	expirationTimeSeconds: string;
	signature: string;
}

export interface IDuoOrder extends IDuoSignedOrder {
	orderHash: string;
	isValid: boolean;
	isCancelled: boolean;
	updatedAt: number;
	orderWatcherState: OrderRelevantState | ExchangeContractErrs;
}

export interface IWSOrderBookSubscription extends IWSChannel {
	requestId: number;
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
}
