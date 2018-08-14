import firebase from 'firebase/app';
import 'firebase/auth';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'whatwg-fetch';
import '../css/style.css';
import * as firebaseActions from './actions/firebaseActions';
import Admin from './containers/AdminContainer';
import store from './store/store';

let promise;
if (__DEV__) {
	// Initialize Firebase
	firebase.initializeApp({
		apiKey: '',
		authDomain: '',
		databaseURL: '',
		projectId: '',
		storageBucket: '',
		messagingSenderId: ''
	});
	promise = new Promise(resolve => resolve());
} else
	promise = fetch('/__/firebase/init.json', { cache: 'no-store' })
		.then(response => response.json())
		.then(config => firebase.initializeApp(config));

promise.then(() => {
	firebase.auth().onAuthStateChanged(user => {
		if (user) store.dispatch(firebaseActions.authUpdate(true));
		else store.dispatch(firebaseActions.authUpdate(false));
	});

	ReactDOM.render(
		<Provider store={store}>
			<React.StrictMode>
				<Admin />
			</React.StrictMode>
		</Provider>,
		document.getElementById('app')
	);
});
