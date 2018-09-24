import {
	assetDataUtils,
	BigNumber,
	generatePseudoRandomSalt,
	Order,
	orderHashUtils,
	signatureUtils,
	SignerType
} from '0x.js';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
import { Layout } from 'antd';
// import WebSocket from 'isomorphic-ws';
import * as React from 'react';
import assetsUtil from '../assetsUtil';
import * as CST from '../constants';
import { providerEngine } from '../providerEngine';
import { WsChannelMessageTypes, WsChannelName } from '../types';
import util from '../util';

export interface IAdminProps {
	signedIn: boolean;
}

const WebSocket = require('isomorphic-ws');

const ws = new WebSocket(CST.RELAYER_WS_URL);

ws.onopen = function open() {
	console.log('connected');
	ws.send(Date.now());
};

ws.onclose = function close() {
	console.log('disconnected');
};

// let result = 'abcd';
let makerAssetData = '';
let takerAssetData = '';
let taker = '';
let exchangeAddress = '';
const TAKER_ETH_DEPOSIT = 1;

export default class Admin extends React.PureComponent<IAdminProps> {
	private async init() {
		await assetsUtil.init();
		taker = assetsUtil.taker;
		exchangeAddress = assetsUtil.contractWrappers.exchange.getContractAddress();
		const zrxTokenAddress = assetsUtil.getTokenAddressFromName(CST.TOKEN_ZRX);
		const etherTokenAddress = assetsUtil.getTokenAddressFromName(CST.TOKEN_WETH);

		if (etherTokenAddress === undefined) throw console.error('undefined etherTokenAddress');

		makerAssetData = assetDataUtils.encodeERC20AssetData(zrxTokenAddress);
		takerAssetData = assetDataUtils.encodeERC20AssetData(etherTokenAddress);

		// Allow the 0x ERC20 Proxy to move WETH on behalf of takerAccount
		const takerWETHApprovalTxHash = await assetsUtil.contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
			etherTokenAddress,
			taker
		);
		await assetsUtil.web3Wrapper.awaitTransactionSuccessAsync(takerWETHApprovalTxHash);
		util.log('taker WETH approved');

		// Convert ETH into WETH for taker by depositing ETH into the WETH contract
		const takerWETHDepositTxHash = await assetsUtil.contractWrappers.etherToken.depositAsync(
			etherTokenAddress,
			Web3Wrapper.toBaseUnitAmount(new BigNumber(TAKER_ETH_DEPOSIT), 18),
			taker
		);
		await assetsUtil.web3Wrapper.awaitTransactionSuccessAsync(takerWETHDepositTxHash);
		await assetsUtil.approveAllMakers(zrxTokenAddress);

		ws.onmessage = function incoming(data: MessageEvent) {
			console.log(data);
			// result = data.data;
			setMessage(data.data);
		};

		function setMessage(e: string) {
			console.log(e);
		}
	}

	public componentDidUpdate() {
		console.log('componentDidUpdate');
	}

	private async sendingMessage() {
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
			makerAssetAmount,
			takerAssetAmount,
			makerAssetData,
			takerAssetData,
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

		// Submit order to relayer
		const msg = {
			type: WsChannelMessageTypes.Add,
			channel: { name: WsChannelName.Orders, marketId: 'ZRX-ETH' },
			requestId: Date.now(),
			payload: { order: signedOrder, orderHash: orderHashHex }
		};

		ws.send(JSON.stringify(msg));
	}

	// this.consider = function (arg) {
	// 	console.log(arg);
	// }

	public componentWillMount() {
		this.init();
	}

	private sendingMessageButton() {
		this.sendingMessage();
	}

	constructor(props: IAdminProps) {
		super(props);
	}
	public render() {
		const { signedIn } = this.props;
		console.log('signedIn: ' + signedIn);
		return (
			<Layout>
				<div className="App">
					<header
						className="App-header"
						style={{ background: 'white', textAlign: 'center' }}
					>
						<h1 className="App-title">Welcome to React</h1>
					</header>
					<p className="App-intro" style={{ textAlign: 'center' }}>
						<button onClick={() => this.sendingMessageButton()}> WebSocket </button>
					</p>
					<div style={{ textAlign: 'center', background: 'white' }}>
						{/* <h3> {result} </h3> */}
					</div>
				</div>
			</Layout>
		);
	}
}
