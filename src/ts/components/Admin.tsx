import { Layout } from 'antd';
import { Affix } from 'antd';
import * as React from 'react';
import { IWSOrderBook, IWSOrderBookSubscription } from '../common/types';
import * as CST from '../constants';
import util from '../util';
import { SDivFlexCenter } from './_styled';
import OperationCard from './Cards/OperationCard';
import OrberbookCard from './Cards/OrderbookCard';
import OrderbookCardSubscription from './Cards/OrderbookCardSubscription';

export interface IProps {
	signedIn: boolean;
	addOrder: (ws: WebSocket) => any;
	subscription: (ws: WebSocket) => any;
	cancelOrder: (ws: WebSocket) => any;
}

export interface IState {
	result: string;
	orderBook: IWSOrderBook;
	orderBookSubscription: IWSOrderBookSubscription;
}

const WebSocket = require('isomorphic-ws');

const ws = new WebSocket(CST.RELAYER_WS_URL);

ws.onopen = function open() {
	console.log('connected');
};

ws.onclose = function close() {
	console.log('disconnected');
};
// ws.onmessage = function incoming(data: any) {
// 	console.log(data.data);
// };

export default class Admin extends React.PureComponent<IProps, IState> {
	// public initWS() {

	// }

	public componentDidUpdate() {
		console.log('componentDidUpdate');
	}

	private async disconnect() {
		this.props.cancelOrder(ws);
	}

	private async subscription() {
		this.props.subscription(ws);
		console.log('subscription');
		util.log('sent subscrible request!');
	}

	private addOrderButton() {
		this.props.addOrder(ws);
	}

	public componentDidMount() {
		this.props.subscription(ws);
		console.log('componentDidMount');
		ws.onmessage = (event: any) => {
			const msg = JSON.parse(event.data);
			console.log(msg);
			this.setState({ result: event.data });
			if (msg.type === 'subscribe' || msg.type === 'update')
				this.setState({
					orderBookSubscription: msg
				});
			else if (msg.type === 'add')
				this.setState({
					orderBook: msg
				});
			console.log(msg.type);
		};
	}

	constructor(props: IProps) {
		super(props);
		this.state = {
			result: '',
			orderBook: {
				type: '',
				channel: { name: '', marketId: '' },
				changes: [{ side: '', price: '', amount: '' }]
			},
			orderBookSubscription: {
				type: '',
				channel: { name: '', marketId: '' },
				requestId: 0,
				bids: [
					{
						makerTokenName: '',
						takerTokenName: '',
						marketId: '',
						side: '',
						amount: 0,
						price: 0
					}
				],
				asks: [
					{
						makerTokenName: '',
						takerTokenName: '',
						marketId: '',
						side: '',
						amount: 0,
						price: 0
					}
				]
			}
		};
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
						<h1 className="App-title">Welcome to DUO DEX</h1>
					</header>
					<p className="App-intro" style={{ textAlign: 'center' }}>
						<button
							onClick={() => this.addOrderButton()}
							style={{ margin: '0 0 0 20px' }}
						>
							Add Order
						</button>
						<button
							onClick={() => this.subscription()}
							style={{ margin: '0 0 0 20px' }}
						>
							Subscription
						</button>
						<button onClick={() => this.disconnect()} style={{ margin: '0 0 0 20px' }}>
							Cancel Order
						</button>
					</p>
					{/* <div style={{ textAlign: 'center', background: 'white' }}>
						<h3> {this.state.result} </h3>
					</div> */}
					<SDivFlexCenter center horizontal>
						<Affix offsetTop={20}>
							<OrberbookCard orderBook={this.state.orderBook} />
						</Affix>
						<OrderbookCardSubscription
							orderBookSubscription={this.state.orderBookSubscription}
						/>
						<Affix offsetTop={20}>
							<OperationCard />
						</Affix>
					</SDivFlexCenter>
				</div>
			</Layout>
		);
	}
}
