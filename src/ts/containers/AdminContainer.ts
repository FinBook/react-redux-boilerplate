import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import * as wsActions from 'ts/actions/wsActions';
import { IState } from 'ts/common/types';
import Admin from 'ts/components/Admin';

function mapStateToProps(state: IState) {
	return {
		signedIn: state.firebase.auth
	};
}

function mapDispatchToProps(dispatch: ThunkDispatch<IState, undefined, AnyAction>) {
	return {
		addOrder: (ws: WebSocket) => {
			dispatch(wsActions.addOrder(ws));
		},
		cancelOrder: (ws: WebSocket) => {
			dispatch(wsActions.cancelOrder(ws));
		},
		subscription: (ws: WebSocket) => {
			dispatch(wsActions.onMessage(ws));
		}
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Admin as any);
