import * as d3 from 'd3';
import moment from 'moment';

class Util {
	public convertUpdateTime(timestamp: number): string {
		const diff = this.getUTCNowTimestamp() - timestamp;
		if (diff < 60000) return 'Just Now';
		else if (diff < 3600000) return Math.floor(diff / 60000) + ' Minutes Ago';
		else if (diff < 86400000) return Math.floor(diff / 3600000) + ' Hours Ago';
		else return moment(timestamp).format('YYYY-MM-DD hh:mm:ss');
	}

	public getUTCNowTimestamp() {
		return moment().valueOf();
	}

	public isEmptyObject(obj: object | undefined | null): boolean {
		if (!obj) return true;

		for (const prop in obj) if (obj.hasOwnProperty(prop)) return false;

		return true;
	}

	public round(num: number) {
		return +(Math.floor((num + 'e+8') as any) + 'e-8');
	}

	public formatNumber(num: number) {
		if (Math.abs(num) < 1e-8) return '0.000';
		if (Math.abs(num) < 1) return d3.format(',.4n')(num);
		if (Math.abs(num) < 100000) return d3.format(',.2f')(num);
		return d3
			.format(',.4s')(num)
			.toUpperCase()
			.replace(/G/g, 'B');
	}

	public range(start: number, end: number) {
		const subArray = Array.apply(null, { length: end }).map(Number.call, Number);
		return subArray.slice(start, end);
	}
}

const util = new Util();
export default util;
