
/**
 * Throttle Options
 * limit: { @number } how many task can be executed at a time. Default is 10.
 * interval: { @number } how many milliseconds to run { @limit } task. Default is 1000 milliseconds.
 * autoStart: { @boolean } whether to automatically start at first task appended. Default is true.
 */
type ThrottleOptions = {
    limit: number,
    interval: number,
    autoStart: boolean,
}