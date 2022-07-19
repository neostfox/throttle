import { isLegalNumber } from "./utils";

class Throttle {
    props: ThrottleOptions = { limit: 10, interval: 1000, autoStart: true };
    constructor(options: Partial<ThrottleOptions>) {
        this.props = Object.assign(this.props, options);
        if (isLegalNumber(this.props.limit)) {
            throw TypeError("Throttle limit must be ispositive and more than zero and not is finite number");
        }
        if (isLegalNumber(this.props.interval)) {
            throw TypeError("Throttle interval must be ispositive and more than zero and not is finite number");
        }
    }
}