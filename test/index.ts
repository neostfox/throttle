import { Throttle } from "../src/index";
import test from "ava";
import inRange from "in-range";
import timeSpan from "time-span";
import delay from "delay";
const helloWorld = (str: string) => {
	console.log("helloWorld" + str);
};
test("main", async (t) => {
	const throttler = new Throttle({ limit: 5, interval: 1000 });
	for (let i = 0; i < 100; i++) {
		throttler.push<void>(() => () => helloWorld(i + ""));
	}
	throttler.done = (res) => {
		const { total, taskTime } = res;
		t.true(
			inRange(timeSpan()(), {
				start: taskTime - 200,
				end: taskTime + 200,
			})
		);
	};
});
