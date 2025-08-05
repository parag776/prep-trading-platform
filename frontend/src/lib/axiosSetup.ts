import axios from 'axios';

function reviveDates<T>(obj: T): T {
	const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
	function _revive(value: any): any {
		if (typeof value === 'string' && isoDateRegex.test(value)) return new Date(value);
		if (Array.isArray(value)) return value.map(_revive);
		if (value && typeof value === 'object') {
			const newObj: any = {};
			for (const k in value) newObj[k] = _revive(value[k]);
			return newObj;
		}
		return value;
	}
	return _revive(obj);
}

axios.interceptors.response.use((res) => {
	if (res.data) res.data = reviveDates(res.data);
	return res;
});