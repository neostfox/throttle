/**
 * Throttle Cancelled Error Information
 */
export class CancelError extends Error {
	constructor() {
		super("Tasks has been cancelled");
		this.name = "cancelled";
	}
}
export class ThrottleError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "throttled error";
	}
}
