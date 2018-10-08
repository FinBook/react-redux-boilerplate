import * as CST from 'ts/common/constants';
import { VoidThunkAction } from 'ts/common/types';
import wsUtil from 'ts/common/wsUtil';
import { IWSOrderBook, IWSOrderBookSubscription } from '../common/types';

export function processAdd(message: IWSOrderBook) {
	return { type: CST.AC_ADD, [CST.AC_ADD]: message };
}

export function addOrder(ws: WebSocket) {
	return async () => {
		await wsUtil.addOrder(ws);
	}
}

export function cancelOrder(ws: WebSocket) {

	return async () => {
		await wsUtil.cancelOrder(ws);
	}
}
export function subscribe(ws: WebSocket) {
	return { type: CST.AC_SUBSCRIBEWEB, [CST.AC_SUBSCRIBEWEB]: ws };
}

export function onMessage(ws: WebSocket): VoidThunkAction {
	return async () => {
		await wsUtil.subscription(ws);
	};
}

export function processSubscribe(message: IWSOrderBookSubscription) {
	return { type: CST.AC_SUBSCRIBE, [CST.AC_SUBSCRIBE]: message };
}
