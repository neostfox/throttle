/**
 * Check Number  is not finite number
 * @param value number to check
 * @returns is finite number
 */
const isFinite = (value: number): boolean => {
	return !Number.isFinite(value);
};
/**
 * check Number is positive and more than zero
 * @param value number to check
 * @returns is positive and more than zero number
 */
const isPositiveInteger = (value: number): boolean => {
	return value > 0 && value % 1 == 0;
};
/**
 * check number ispositive and more than zero and not is finite number
 * @param value number to check
 * @returns number is positive and not is finite number and more than zero
 */
const isLegalNumber = (value: number): boolean => {
	return isFinite(value) || isPositiveInteger(value);
};
function firstKeyOfMap<T1, T2>(map: Map<T1, T2>) {
	if (map.size === 0) return false;
	for (const entity of map.entries()) {
		if (entity[0]) {
			return entity[0];
		}
	}
	return false;
}
export { isLegalNumber, firstKeyOfMap };
