import { colorize } from '~/utilities';
import { inspect } from 'node:util';

const enabled = process.env.DISABLE_LOGGER != '1';

export function log(...args: string[]): void {
	return enabled && console.log('»', ...args);
}

export function error(...args: string[]): void {
	return enabled && console.error('»', ...args.map(arg => colorize(typeof arg === 'string' ? arg : inspect(arg), 'red')));
}

export function success(...args: string[]): void {
	return enabled && console.log('»', ...args.map(arg => colorize(typeof arg === 'string' ? arg : inspect(arg), 'green')));
}

export function warn(...args: string[]): void {
	return enabled && console.warn('»', ...args.map(arg => colorize(typeof arg === 'string' ? arg : inspect(arg), 'yellow')));
}

export function debug(...args: string[]): void {
	return enabled && console.debug('»', ...args.map(arg => colorize(typeof arg === 'string' ? arg : inspect(arg), 'gray')));
}

export function info(...args: string[]): void {
	return enabled && console.info('»', ...args.map(arg => colorize(typeof arg === 'string' ? arg : inspect(arg), 'cyan')));
}

export function createLogger(...callers: string[]) {
	const prefix = '[' + callers.join(' → ') + ']';

	return {
		log: (...args) => log(prefix, ...args),
		error: (...args) => error(prefix, ...args),
		success: (...args) => success(prefix, ...args),
		warn: (...args) => warn(prefix, ...args),
		debug: (...args) => debug(prefix, ...args),
		info: (...args) => info(prefix, ...args),
	};
}