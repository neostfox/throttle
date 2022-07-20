'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Check Number  is not finite number
 * @param value number to check
 * @returns is finite number
 */
var isFinite = function (value) {
    return !Number.isFinite(value);
};
/**
 * check Number is positive and more than zero
 * @param value number to check
 * @returns is positive and more than zero number
 */
var isPositiveInteger = function (value) {
    return value > 0 && value % 1 == 0;
};
/**
 * check number ispositive and more than zero and not is finite number
 * @param value number to check
 * @returns number is positive and not is finite number and more than zero
 */
var isLegalNumber = function (value) {
    return isFinite(value) || isPositiveInteger(value);
};
function firstKeyOfMap(map) {
    if (map.size === 0)
        return false;
    for (var _i = 0, _a = map.entries(); _i < _a.length; _i++) {
        var entity = _a[_i];
        if (entity[0]) {
            return entity[0];
        }
    }
    return false;
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

/**
 * Throttle Cancelled Error Information
 */
var CancelError = /** @class */ (function (_super) {
    __extends(CancelError, _super);
    function CancelError() {
        var _this = _super.call(this, "Tasks has been cancelled") || this;
        _this.name = "cancelled";
        return _this;
    }
    return CancelError;
}(Error));
var ThrottleError = /** @class */ (function (_super) {
    __extends(ThrottleError, _super);
    function ThrottleError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "throttled error";
        return _this;
    }
    return ThrottleError;
}(Error));

var Throttle = /** @class */ (function () {
    function Throttle(options) {
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
    Throttle.prototype.cancel = function () {
        this.taskQueue.clear();
        this.onCannel(new CancelError());
    };
    /**
     * remove task from throttle queue
     */
    Throttle.prototype.remove = function (key) {
        if (this.taskQueue.has(key)) {
            this.taskQueue.delete(key);
            return;
        }
        this.onError(new ThrottleError("Key not found at throttle queue"));
    };
    /**
     * push task to throttled queue
     */
    Throttle.prototype.push = function (fn) {
        var key = Symbol();
        this.taskQueue.set(key, fn());
        this.total++;
        return key;
    };
    /*
     * get next task from throttle queue and return it.
     * if key or throttle queue is empty, throttle is done immediately
     */
    Throttle.prototype.next = function () {
        var key = firstKeyOfMap(this.taskQueue);
        if (!key) {
            return;
        }
        var fn = this.taskQueue.get(key);
        this.taskQueue.delete(key);
        return fn;
    };
    /**
     *if called function is Promise.
     * then when status fulfilled run next task
     */
    Throttle.prototype.runPromise = function (fn) {
        var _this = this;
        fn.then(function (res) {
            _this.fulfilled++;
            return res;
        })
            .catch(function (err) {
            _this.rejected++;
            _this.onTaskError(err);
        })
            .finally(function () {
            _this.runNext();
            _this.onChange(_this.total, _this.activeCount);
        });
    };
    /**
     * throttle all tasks is done immediately
     */
    Throttle.prototype.allTaskDone = function () {
        this.done({
            total: this.total,
            taskTime: Date.now() - this.startTime,
            fulfilled: this.fulfilled,
            rejected: this.rejected,
        });
    };
    /**
     * transform task to promise for execution more than one task at same time
     */
    Throttle.prototype.saftFunction = function (fn) {
        return new Promise(function (resolve, reject) {
            try {
                resolve(fn());
            }
            catch (err) {
                reject(err);
            }
        });
    };
    /**
     * throttle all tasks is done event
     * returns throttle result info
     */
    Throttle.prototype.done = function (res) { };
    Throttle.prototype.nextDelay = function () {
        var now = Date.now();
        var _a = this.props, limit = _a.limit, interval = _a.interval;
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
    };
    Throttle.prototype.execute = function () {
        var fn = this.next();
        if (!fn)
            this.allTaskDone();
        else if (fn instanceof Promise)
            this.runPromise(fn);
        else
            this.runPromise(this.saftFunction(fn));
    };
    /**
     * run next task
     */
    Throttle.prototype.runNext = function () {
        var _this = this;
        var timer = this.nextDelay();
        setTimeout(function () {
            _this.execute();
        }, timer);
    };
    /**
     * start throttle queue.
     */
    Throttle.prototype.run = function () {
        this.onBeforeStart();
        this.startTime = Date.now();
        this.currentTick = Date.now();
        this.runNext();
    };
    /**
     * events before the throttle starts
     */
    Throttle.prototype.onBeforeStart = function () { };
    /**
     * events: when the throttle changed
     */
    Throttle.prototype.onChange = function (total, current) { };
    /**
     * events: when the throttle error
     */
    Throttle.prototype.onError = function (error) { };
    /**
     * events: when the throttle cancelled
     */
    Throttle.prototype.onCannel = function (error) { };
    /**
     * events: when the throttle task error
     */
    Throttle.prototype.onTaskError = function (error) { };
    return Throttle;
}());

exports.CancelError = CancelError;
exports.Throttle = Throttle;
exports.ThrottleError = ThrottleError;
//# sourceMappingURL=index.js.map
