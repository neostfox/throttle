/**
 * Throttle Options
 * limit: { @number } how many task can be executed at a time. Default is 10.
 * interval: { @number } how many milliseconds to run { @limit } task. Default is 1000 milliseconds.
 */
declare type ThrottleOptions = {
    limit: number;
    interval: number;
};
/**
 * Throttle Result
 */
declare type ThrottleResult = {
    total: number;
    taskTime: number;
    fulfilled: number;
    rejected: number;
};

/**
 * Throttle Cancelled Error Information
 */
declare class CancelError extends Error {
    constructor();
}
declare class ThrottleError extends Error {
    constructor(message: string);
}

declare class Throttle {
    private taskQueue;
    private props;
    private total;
    private fulfilled;
    private rejected;
    private startTime;
    private activeCount;
    private currentTick;
    constructor(options: Partial<ThrottleOptions>);
    /**
     * cancel the throttle
     */
    cancel(): void;
    /**
     * remove task from throttle queue
     */
    remove(key: Symbol): void;
    /**
     * push task to throttled queue
     */
    push<T>(fn: () => Promise<T> | void): symbol;
    private next;
    /**
     *if called function is Promise.
     * then when status fulfilled run next task
     */
    private runPromise;
    /**
     * throttle all tasks is done immediately
     */
    private allTaskDone;
    /**
     * transform task to promise for execution more than one task at same time
     */
    private saftFunction;
    /**
     * throttle all tasks is done event
     * returns throttle result info
     */
    done(res: ThrottleResult): void;
    private nextDelay;
    private execute;
    /**
     * run next task
     */
    private runNext;
    /**
     * start throttle queue.
     */
    run(): void;
    /**
     * events before the throttle starts
     */
    onBeforeStart(): void;
    /**
     * events: when the throttle changed
     */
    onChange(total: number, current: number): void;
    /**
     * events: when the throttle error
     */
    onError(error: ThrottleError): void;
    /**
     * events: when the throttle cancelled
     */
    onCannel(error: CancelError): void;
    /**
     * events: when the throttle task error
     */
    onTaskError(error: ThrottleError): void;
}

export { CancelError, Throttle, ThrottleError, ThrottleOptions, ThrottleResult };
