import {
	assetDataUtils,
	BigNumber,
	// ContractWrappers,
	generatePseudoRandomSalt,
	Order,
	orderHashUtils,
	signatureUtils,
	SignerType
} from '0x.js';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import * as CST from '../constants';
import { providerEngine } from '../providerEngine';
import { WsChannelMessageTypes, WsChannelName } from '../types';
import util from '../util';
import assetsUtil from './assetsUtil';
import firebaseUtil from './firebaseUtil';

class WSUtil {
	/**********************************************************
	 *
	 * authentication
	 *
	 **********************************************************/

	// constructor() {
	// 	this.
	// }

	public async cancelOrder(ws: WebSocket) {
		await firebaseUtil.init();
		const marketId = CST.TOKEN_ZRX + '-' + CST.TOKEN_WETH;
		const orders = await firebaseUtil.getOrders(
			marketId,
			'0x7457d5e02197480db681d3fdf256c7aca21bdc12'
		);
		if (orders.length === 0) throw Error('No orders found in DB!');
		console.log('num of fetched orders' + orders.length);

		const orderHashHex = orders[0].orderHash;
		console.log('Order to be cancelled is', orderHashHex);

		// Send cancel order request
		const cancelReq = {
			type: WsChannelMessageTypes.Cancel,
			channel: {
				name: WsChannelName.Order,
				marketId: 'ZRX-WETH'
			},
			requestId: Date.now(),
			payload: {
				orderHash: orderHashHex
			}
		};
		ws.send(JSON.stringify(cancelReq));
	}

	public async addOrder(ws: WebSocket) {
		const ADD_TAKER_ETH_DEPOSIT = 0.001;
		await assetsUtil.init();
		const taker = assetsUtil.taker;
		const exchangeAddress = assetsUtil.contractWrappers.exchange.getContractAddress();
		const zrxTokenAddress = assetsUtil.getTokenAddressFromName(CST.TOKEN_ZRX);
		const etherTokenAddress = assetsUtil.getTokenAddressFromName(CST.TOKEN_WETH);

		if (etherTokenAddress === undefined) throw console.error('undefined etherTokenAddress');

		const makerAssetData = assetDataUtils.encodeERC20AssetData(zrxTokenAddress);
		const takerAssetData = assetDataUtils.encodeERC20AssetData(etherTokenAddress);

		const balance = await assetsUtil.web3Wrapper.getBalanceInWeiAsync(taker);
		console.log('taker %s, balance %s', taker, balance.valueOf());

		// Allow the 0x ERC20 Proxy to move WETH on behalf of takerAccount
		const takerWETHApprovalTxHash = await assetsUtil.contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
			etherTokenAddress,
			taker
		);
		await assetsUtil.web3Wrapper.awaitTransactionSuccessAsync(takerWETHApprovalTxHash);
		util.log('taker WETH approved');

		// Convert ETH into WETH for taker by depositing ETH into the WETH contract
		// console.log(assetsUtil.web3Wrapper. balance);
		// console.log(web3.fromWei(balance.valueOf(), 'ether'));
		const takerWETHDepositTxHash = await assetsUtil.contractWrappers.etherToken.depositAsync(
			etherTokenAddress,
			Web3Wrapper.toBaseUnitAmount(new BigNumber(ADD_TAKER_ETH_DEPOSIT), 18),
			taker
		);
		await assetsUtil.web3Wrapper.awaitTransactionSuccessAsync(takerWETHDepositTxHash);
		await assetsUtil.approveAllMakers(zrxTokenAddress);

		// Send signed order to relayer every 5 seconds
		let isBid = true;
		const randomExpiration = util.getRandomFutureDateInSeconds();
		const maker = assetsUtil.getRandomMaker();
		// the amount the maker is selling of maker asset
		const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(
			new BigNumber(Number(Math.random() * 10 || 5).toFixed(3)),
			18
		);
		// the amount the maker wants of taker asset
		const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(
			new BigNumber(Number(Math.random() || 5).toFixed(3)),
			18
		);

		// Create the order
		const order: Order = {
			exchangeAddress,
			makerAddress: maker,
			takerAddress: taker,
			senderAddress: maker,
			feeRecipientAddress: taker,
			expirationTimeSeconds: randomExpiration,
			salt: generatePseudoRandomSalt(),
			makerAssetAmount: isBid ? takerAssetAmount : makerAssetAmount,
			takerAssetAmount: isBid ? makerAssetAmount : takerAssetAmount,
			makerAssetData: isBid ? makerAssetData : takerAssetData,
			takerAssetData: isBid ? takerAssetData : makerAssetData,
			makerFee: new BigNumber(0),
			takerFee: new BigNumber(0)
		};
		const orderHashHex = orderHashUtils.getOrderHashHex(order);
		const signature = await signatureUtils.ecSignOrderHashAsync(
			providerEngine,
			orderHashHex,
			maker,
			SignerType.Default
		);
		const signedOrder = { ...order, signature };
		isBid = !isBid;

		// Submit order to relayer
		const msg = {
			type: WsChannelMessageTypes.Add,
			channel: {
				name: WsChannelName.Order,
				marketId: 'ZRX-WETH'
			},
			requestId: Date.now(),
			payload: {
				order: signedOrder,
				orderHash: orderHashHex
			}
		};
		ws.send(JSON.stringify(msg));
	}

	public async subscription(ws: WebSocket) {
		const msg = {
			type: 'subscribe',
			channel: {
				name: 'orderbook',
				marketId: 'ZRX-WETH'
			},
			requestId: Date.now().toString()
		};
		if (ws.readyState !== WebSocket.OPEN)
			ws.onopen = function open() {
				console.log('Connected');
				ws.send(JSON.stringify(msg));
				console.log('hello');
			};
		else ws.send(JSON.stringify(msg));
		util.log('sent subscrible request!');
	}

	public async receiveMessage(ws: WebSocket) {
		ws.onmessage = (event: any) => {
			console.log(event.data);
			console.log('receiveMessage');
			const msg = JSON.parse(event.data);
			return msg;
		};
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

const wsUtil = new WSUtil();
export default wsUtil;
