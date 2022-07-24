import { Throttle } from "../src/index";
import test from "ava";
import inRange from "in-range";
import timeSpan from "time-span";
import delay from "delay";
const helloWorld = (str: string) => {
	console.log("helloWorld" + str);
};
const throttler = new Throttle<number, number>({ limit: 5, interval: 1000 });
const fn = (index: number) => {
	return new Promise<number>((resolve, reject) => {
		console.log(index);
		setTimeout(() => {
			resolve(index)
		}, 10);
	})
}
for (let i = 0; i < 100; i++) {
	throttler.push(fn, i);
}

throttler.run();

// const throttlerAsync = new Throttle<string, void>({ limit: 5, interval: 1000 });

// for (let i = 0; i < 100; i++) {
// 	throttlerAsync.push(helloWorld, i + "");
// }
// throttlerAsync.run();