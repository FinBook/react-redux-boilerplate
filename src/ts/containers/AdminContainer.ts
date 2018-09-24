import { connect } from 'react-redux';
import { IState } from 'ts/common/types';
import Admin from 'ts/components/Admin';

function mapStateToProps(state: IState) {
	return {
		signedIn: state.firebase.auth
	};
}

export default connect(
	mapStateToProps,
	{}
)(Admin);
