import type { ThrottleOptions, ThrottleResult } from "./types";
import { isLegalNumber, firstKeyOfMap } from "./utils";
import { CancelError, ThrottleError } from "./error";

class Throttle<T1, T2> {
	private taskQueue = new Map<Symbol, () => Promise<T2> | T2>();
	private props: ThrottleOptions = {
		limit: 10,
		interval: 1000,
	};
	// all tasks count
	private total: number = 0;
	// fulfilled tasks count
	private fulfilled: number = 0;
	// failed tasks count
	private rejected: number = 0;
	// throttle start time
	private startTime: number = 0;
	// current runing tasks number;
	private activeCount: number = 1;
	// current running tasks start time;
	private currentTick: number = 0;

	constructor(options: Partial<ThrottleOptions>) {
		this.props = Object.assign(this.props, options);
		if (!isLegalNumber(this.props.limit)) {
			throw TypeError(
				"Throttle limit must be ispositive and more than zero and not is finite number"
			);
		}
		if (!isLegalNumber(this.props.interval)) {
			throw TypeError(
				"Throttle interval must be ispositive and more than zero and not is finite number"
			);
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
	remove(key: Symbol) {
		if (this.taskQueue.has(key)) {
			this.taskQueue.delete(key);
			return;
		}
		this.onError(new ThrottleError("Key not found at throttle queue"));
	}
	/**
	 * push task to throttled queue
	 */
	push(fn: (args: T1) => Promise<T2> | T2, args: T1) {
		const key = Symbol();
		this.taskQueue.set(key, () => {
			return fn(args)
		});
		this.total++;
		return key;
	}
	/*
	 * get next task from throttle queue and return it.
	 * if key or throttle queue is empty, throttle is done immediately
	 */
	private next() {
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
	private runPromise(fn: () => Promise<T2>) {
		fn().then((res) => {
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
	private allTaskDone() {
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
	private saftFunction(fn: () => T2) {
		return () => new Promise<T2>((resolve, reject) => {
			try {
				resolve(fn());
			} catch (err) {
				reject(err);
			}
		});
	}
	/**
	 * throttle all tasks is done event
	 * returns throttle result info
	 */
	done(res: ThrottleResult) { }

	private nextDelay() {
		const now = Date.now();
		const { limit, interval } = this.props;
		if (now - this.currentTick > interval) {
			this.activeCount = 1;
			return 0;
		}
		if (this.activeCount >= limit) {
			this.activeCount = 1;
			this.currentTick += interval;
		} else {
			this.activeCount++;
		}
		return this.currentTick - now;
	}
	private execute() {
		const fn = this.next();
		if (!fn) this.allTaskDone();
		else if (fn?.toString().includes("Promise")) this.runPromise(fn as () => Promise<T2>);
		else this.runPromise(this.saftFunction(fn as () => T2));
	}
	/**
	 * run next task
	 */
	private runNext() {
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
	onChange(total: number, current: number) { }

	/**
	 * events: when the throttle error
	 */
	onError(error: ThrottleError) { }
	/**
	 * events: when the throttle cancelled
	 */
	onCannel(error: CancelError) { }
	/**
	 * events: when the throttle task error
	 */
	onTaskError(error: ThrottleError) { }
}
export default Throttle;
