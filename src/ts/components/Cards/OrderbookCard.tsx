import * as React from 'react';
import * as CST from 'ts/common/constants';
import util from 'ts/common/util';
import { IWSOrderBook } from '../../common/types';
import { SDivFlexCenter } from '../_styled';
import { SCard, SCardTitle } from './_styled';
import { SCardList } from './_styled';

interface IProps {
	orderBook: IWSOrderBook;
}

interface IState {
	orderBook: IWSOrderBook;
}

export default class TimeSeriesCard extends React.Component<IProps, IState> {

	public render() {
		const { orderBook } = this.props;
		const title = orderBook.type !== "" ? orderBook.type.toUpperCase() + ' ' + orderBook.channel.marketId.toUpperCase() : CST.TH_ORDERBOOK.toUpperCase();
		return (
			<SCard
				title={<SCardTitle>{title}</SCardTitle>}
				width="440px"
				margin="0 10px 0 0"
			>
				<SDivFlexCenter center horizontal>
					<SCardList>
						<div className="status-list-wrapper">
							<ul>
								{orderBook.type !== "" ? (
									util.range(0, orderBook.changes.length).map((i: any) => (
										<li key={i}>
											<span className="title">
												{orderBook.changes[i].side}
											</span>
										</li>
									))
								) : (
										<li className="block-title t-center">{CST.TH_LOADING}</li>
									)
								}
							</ul>
						</div>
					</SCardList>

					<SCardList>
						<div className="status-list-wrapper narrow">
							<ul className="noborder">
								<li>
									<span className="title">Price</span>
								</li>
								{orderBook.type !== "" ? (
									util.range(0, orderBook.changes.length).map((i: any) => (
										<li key={i}>
											<span className="title">
												{util.formatNumber(+orderBook.changes[i].price)}
											</span>
										</li>
										))
									) : (
										<li className="block-title t-center">{CST.TH_LOADING}</li>
									)
								}
							</ul>
						</div>
					</SCardList>

					<SCardList>
						<div className="status-list-wrapper">
							<ul>
								<li>
									<span className="title"> Amount </span>
								</li>
								{orderBook.type !== "" ? (
									util.range(0, orderBook.changes.length).map((i: any) => (
										<li key={i}>
											<span className="title">
												{util.formatNumber(+orderBook.changes[i].amount)}
											</span>
										</li>
									))
								) : (
										<li className="block-title t-center">{CST.TH_LOADING}</li>
									)
								}
							</ul>
						</div>
					</SCardList>
				</SDivFlexCenter>
			</SCard>
		);
	}
}
