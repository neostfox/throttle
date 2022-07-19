/**
 * Throttle Cancelled Error Information
 */
export default class CancelError extends Error {
    constructor() {
        super("Tasks has been cancelled");
        this.name = "cancelled";
    }
}