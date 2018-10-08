import { CollectionReference, DocumentReference, QuerySnapshot } from '@google-cloud/firestore';
import * as admin from 'firebase-admin';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import * as CST from '../constants';
import { IDuoOrder } from './types';

class FirebaseUtil {
	/**********************************************************
	 *
	 * authentication
	 *
	 **********************************************************/

	private db: admin.firestore.Firestore | null = null;

	public init() {
		// const serviceAccount = require('../keys/duo-dev-f64ce-firebase-adminsdk-gu930-519c00a624.json');
		// admin.initializeApp({
		// 	credential: admin.credential.cert(serviceAccount),
		// 	databaseURL: 'https://duo-dev-f64ce.firebaseio.com'
		// });
		// this.db = admin.firestore();
		// this.db.settings({ timestampsInSnapshots: true });
	}

	private translateFirebaseError(errorCode: string, errorMessage: string): string {
		switch (errorCode) {
			case 'auth/user-not-found':
				return 'Invalid user. Please sign up or log in by other method.';
			case 'auth/wrong-password':
				return 'Invalid password. Please try again.';
			case 'auth/weak-password':
				return 'Password too weak. Please try again.';
			case 'auth/email-already-in-use':
			case 'auth/account-exists-with-different-credential':
				return 'Already signed up. Please log in via the correct method.';
			case 'auth/invalid-email':
				return 'Invalid email. Please try again.';
			default:
				return errorMessage;
		}
	}

	public async emailSignIn(email: string, password: string) {
		try {
			await firebase.auth().signInWithEmailAndPassword(email, password);
			return '';
		} catch (error) {
			return this.translateFirebaseError(error.code, error.message);
		}
	}

	public getRef(path: string): CollectionReference | DocumentReference {
		const parts = ((path.startsWith('/') ? '' : '/') + path).split('/').filter(p => !!p.trim());
		let dbRef: any = this.db;
		parts.forEach((p, i) => {
			dbRef = i % 2 ? dbRef.doc(p) : dbRef.collection(p);
		});
		return dbRef;
	}

	public querySnapshotToDuo(qs: QuerySnapshot): IDuoOrder[] {
		return qs.docs.map(doc => doc.data() as IDuoOrder);
	}

	public async getOrders(marketId: string, address?: string): Promise<IDuoOrder[]> {
		let query = (this.getRef(`/${CST.DB_ORDERS}|${marketId}`) as CollectionReference)
			.where(CST.DB_ORDER_IS_CANCELLED, '==', false)
			.where(CST.DB_ORDER_IS_VALID, '==', true);

		if (address) query = query.where(CST.DB_ORDER_MAKER_ADDR, '==', address);
		query = query.orderBy(CST.DB_UPDATED_AT, 'desc');
		const result = await query.get();
		if (result.empty) return [];
		return this.querySnapshotToDuo(result);
	}

	public signOut() {
		return firebase.auth().signOut();
	}
	/**********************************************************
	 *
	 * fetch bot data
	 *
	 **********************************************************/
}

const firebaseUtil = new FirebaseUtil();
export default firebaseUtil;
