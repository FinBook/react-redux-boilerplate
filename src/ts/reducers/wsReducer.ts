import { AnyAction } from 'redux';
import * as CST from 'ts/common/constants';
import { IWSState } from 'ts/common/types';

export const initialState = {
	[CST.AC_ADD]: [],
	[CST.AC_SUBSCRIBE]: {}
	// [CST.AC_PRICE_SUB]: () => ({})
};

export function wsReducer(state: IWSState = initialState, action: AnyAction): IWSState {
	switch (action.type) {
		case CST.AC_ADD:
			return action[CST.AC_ADD]
				? Object.assign({}, state, {
						[CST.AC_ADD]: action[CST.AC_ADD]
				})
				: initialState;
		// case CST.AC_SUBSCRIBEWEB:
		// 	if (action[action.type])
		// 		return Object.assign({}, state, { [action.type]: action[action.type] });
		// 	else return { [CST.AC_ADD]: [], [CST.AC_SUBSCRIBE]: {} };
		// case CST.AC_INITWEB:
		// 	wsUtil.init();
		// 	return { [CST.AC_ADD]: [], [CST.AC_SUBSCRIBE]: {} };
		// case CST.AC_UPDATE:
		// 	wsUtil.sendingMessage();
		// 	return { [CST.AC_ADD]: [], [CST.AC_SUBSCRIBE]: {} };
		default:
			return state;
	}
}
