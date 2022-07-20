/**
 * Throttle Options
 * limit: { @number } how many task can be executed at a time. Default is 10.
 * interval: { @number } how many milliseconds to run { @limit } task. Default is 1000 milliseconds.
 */
type ThrottleOptions = {
	limit: number;
	interval: number;
};
/**
 * Throttle Result
 */
type ThrottleResult = {
	total: number;
	taskTime: number;
	fulfilled: number;
	rejected: number;
};
export { ThrottleOptions, ThrottleResult };
