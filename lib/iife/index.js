(function (exports) {
	'use strict';

	/**
	 * Check Number  is not finite number
	 * @param value number to check
	 * @returns is finite number
	 */
	const isFinite = (value) => {
	    return !Number.isFinite(value);
	};
	/**
	 * check Number is positive and more than zero
	 * @param value number to check
	 * @returns is positive and more than zero number
	 */
	const isPositiveInteger = (value) => {
	    return value > 0 && value % 1 == 0;
	};
	/**
	 * check number ispositive and more than zero and not is finite number
	 * @param value number to check
	 * @returns number is positive and not is finite number and more than zero
	 */
	const isLegalNumber = (value) => {
	    return isFinite(value) || isPositiveInteger(value);
	};
	function firstKeyOfMap(map) {
	    if (map.size === 0)
	        return false;
	    for (const entity of map.entries()) {
	        if (entity[0]) {
	            return entity[0];
	        }
	    }
	    return false;
	}

	/**
	 * Throttle Cancelled Error Information
	 */
	class CancelError extends Error {
	    constructor() {
	        super("Tasks has been cancelled");
	        this.name = "cancelled";
	    }
	}
	class ThrottleError extends Error {
	    constructor(message) {
	        super(message);
	        this.name = "throttled error";
	    }
	}

	class Throttle {
	    constructor(options) {
	        this.taskQueue = new Map();
	        this.props = {
	            limit: 10,
	            interval: 1000,
	        };
	        // all tasks count
	        this.total = 0;
	        // fulfilled tasks count
	        this.fulfilled = 0;
	        // failed tasks count
	        this.rejected = 0;
	        // throttle start time
	        this.startTime = 0;
	        // current runing tasks number;
	        this.activeCount = 1;
	        // current running tasks start time;
	        this.currentTick = 0;
	        this.props = Object.assign(this.props, options);
	        if (!isLegalNumber(this.props.limit)) {
	            throw TypeError("Throttle limit must be ispositive and more than zero and not is finite number");
	        }
	        if (!isLegalNumber(this.props.interval)) {
	            throw TypeError("Throttle interval must be ispositive and more than zero and not is finite number");
	        }
	    }
	    /**
	     * cancel the throttle
	     */
	    cancel() {
	        this.taskQueue.clear();
	        this.onCannel(new CancelError());
	    }
	    /**
	     * remove task from throttle queue
	     */
	    remove(key) {
	        if (this.taskQueue.has(key)) {
	            this.taskQueue.delete(key);
	            return;
	        }
	        this.onError(new ThrottleError("Key not found at throttle queue"));
	    }
	    /**
	     * push task to throttled queue
	     */
	    push(fn) {
	        const key = Symbol();
	        this.taskQueue.set(key, fn());
	        this.total++;
	        return key;
	    }
	    /*
	     * get next task from throttle queue and return it.
	     * if key or throttle queue is empty, throttle is done immediately
	     */
	    next() {
	        const key = firstKeyOfMap(this.taskQueue);
	        if (!key) {
	            return;
	        }
	        const fn = this.taskQueue.get(key);
	        this.taskQueue.delete(key);
	        return fn;
	    }
	    /**
	     *if called function is Promise.
	     * then when status fulfilled run next task
	     */
	    runPromise(fn) {
	        fn.then((res) => {
	            this.fulfilled++;
	            return res;
	        })
	            .catch((err) => {
	            this.rejected++;
	            this.onTaskError(err);
	        })
	            .finally(() => {
	            this.runNext();
	            this.onChange(this.total, this.activeCount);
	        });
	    }
	    /**
	     * throttle all tasks is done immediately
	     */
	    allTaskDone() {
	        this.done({
	            total: this.total,
	            taskTime: Date.now() - this.startTime,
	            fulfilled: this.fulfilled,
	            rejected: this.rejected,
	        });
	    }
	    /**
	     * transform task to promise for execution more than one task at same time
	     */
	    saftFunction(fn) {
	        return new Promise((resolve, reject) => {
	            try {
	                resolve(fn());
	            }
	            catch (err) {
	                reject(err);
	            }
	        });
	    }
	    /**
	     * throttle all tasks is done event
	     * returns throttle result info
	     */
	    done(res) { }
	    nextDelay() {
	        const now = Date.now();
	        const { limit, interval } = this.props;
	        if (now - this.currentTick > interval) {
	            this.activeCount = 1;
	            return 0;
	        }
	        if (this.activeCount >= limit) {
	            this.activeCount = 1;
	            this.currentTick += interval;
	        }
	        else {
	            this.activeCount++;
	        }
	        return this.currentTick - now;
	    }
	    execute() {
	        const fn = this.next();
	        if (!fn)
	            this.allTaskDone();
	        else if (fn instanceof Promise)
	            this.runPromise(fn);
	        else
	            this.runPromise(this.saftFunction(fn));
	    }
	    /**
	     * run next task
	     */
	    runNext() {
	        const timer = this.nextDelay();
	        setTimeout(() => {
	            this.execute();
	        }, timer);
	    }
	    /**
	     * start throttle queue.
	     */
	    run() {
	        this.onBeforeStart();
	        this.startTime = Date.now();
	        this.currentTick = Date.now();
	        this.runNext();
	    }
	    /**
	     * events before the throttle starts
	     */
	    onBeforeStart() { }
	    /**
	     * events: when the throttle changed
	     */
	    onChange(total, current) { }
	    /**
	     * events: when the throttle error
	     */
	    onError(error) { }
	    /**
	     * events: when the throttle cancelled
	     */
	    onCannel(error) { }
	    /**
	     * events: when the throttle task error
	     */
	    onTaskError(error) { }
	}

	exports.CancelError = CancelError;
	exports.Throttle = Throttle;
	exports.ThrottleError = ThrottleError;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({});
//# sourceMappingURL=index.js.map
