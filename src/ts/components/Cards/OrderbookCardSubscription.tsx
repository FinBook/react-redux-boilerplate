import * as React from 'react';
import * as CST from 'ts/common/constants';
import util from 'ts/common/util';
import { IWSOrderBookSubscription } from '../../common/types';
import { SDivFlexCenter } from '../_styled';
import { SCard, SCardTitle } from './_styled';
import { SCardList } from './_styled';

interface IProps {
	orderBookSubscription: IWSOrderBookSubscription;
}

interface IState {
	orderBookSubscription: IWSOrderBookSubscription;
}

export default class TimeSeriesCard extends React.Component<IProps, IState> {
	public render() {
		const { orderBookSubscription } = this.props;
		console.log(orderBookSubscription);
		const title = CST.TH_ORDERBOOK.toUpperCase();
		const askArray: number[][] = [];
		const bidArray: number[][] = [];
		const type = orderBookSubscription.type;
		if (orderBookSubscription && type === "subscribe") {
			const asks = orderBookSubscription.payload.asks;
			const bids = orderBookSubscription.payload.bids;
			console.log(bids);
			for (const bid of bids) bidArray.push([bid.amount, bid.price]);
			for (const ask of asks) askArray.push([ask.amount, ask.price]);
		}
		askArray.sort((a, b) => a[0] - b[0]);
		bidArray.sort((a, b) => b[0] - a[0]);
		console.log(bidArray);
		return (
			<SCard title={<SCardTitle>{title}</SCardTitle>} width="500px" margin="0 10px 0 0">
				<SDivFlexCenter center horizontal>
					<SCardList>
						<div className="status-list-wrapper">
							<ul>
								<li className="right">
									<span className="title">{CST.TH_BID.toUpperCase()}</span>
								</li>
								{bidArray.length && type === "subscribe" ? (
									util.range(0, bidArray.length).map((i: any) => (
										<li key={i}>
											<span className="content">
												{i < bidArray.length
													? bidArray[i][1] !== 0
														? util.formatNumber(bidArray[i][1])
														: '-'
													: '-'}
											</span>
											<span className="title">
												{i < bidArray.length
													? bidArray[i][0] !== 0
														? util.formatNumber(bidArray[i][0])
														: '-'
													: '-'}
											</span>
										</li>
									))
								) : (
										<li className="block-title t-center">{CST.TH_LOADING}</li>
									)}
							</ul>
						</div>
					</SCardList>

					<SCardList fixWidth>
						<div className="status-list-wrapper narrow">
							<ul className="noborder">
								<li>
									<span className="title">Price</span>
								</li>
								<li className="block-title t-center">...</li>
							</ul>
						</div>
					</SCardList>

					<SCardList>
						<div className="status-list-wrapper">
							<ul>
								<li>
									<span className="title">{CST.TH_ASK.toUpperCase()}</span>
								</li>
								{askArray.length && type === "subscribe" ? (
									util.range(0, askArray.length).map((i: any) => (
										<li key={i}>
											<span className="title">
												{i < askArray.length
													? askArray[i][0] !== 0
														? util.formatNumber(askArray[i][0])
														: '-'
													: '-'}
											</span>
											<span className="content">
												{i < askArray.length
													? askArray[i][1] !== 0
														? util.formatNumber(askArray[i][1])
														: '-'
													: '-'}
											</span>
										</li>
									))
								) : (
										<li className="block-title t-center">{CST.TH_LOADING}</li>
									)}
							</ul>
						</div>
					</SCardList>
				</SDivFlexCenter>
			</SCard>
		);
	}
}
