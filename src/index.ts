import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { StackItem } from '~/types.d.ts';
import puppeteer from 'puppeteer-extra';
import config from '~/../config.json';
import notify from '~/pushover';
import moment from 'moment';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { LOG_PATH, LOGS_PATH } from '~/constants';

puppeteer.use(StealthPlugin());

const timeouts = new Map();

async function run() {
	console.log('Launching browser...');
	const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
	console.log('Browser launched.\n');

	const stack: StackItem[] = [];

	for (const listener of config.listeners) {
		const index = config.listeners.indexOf(listener);
		const page = await browser.newPage();

		await page.goto(listener.url);
		stack.push({ page, index, listener });
	}


	while (stack.length) {
		const { page, listener, index } = stack.shift()!;

		const timeout = timeouts.get(index);
		const gracePeriod = timeout && timeout.diff(moment());

		if (timeout && gracePeriod <= 0) {
			timeouts.delete(index);
		} else if (gracePeriod) {
			console.log(`Pushing ${listener.url} at the end of the stack as it is in a grace period of ${gracePeriod}ms.`);
			stack.push({ page, listener, index });
			await new Promise((resolve) => setTimeout(resolve, 1000));
			continue;
		} else {
			timeouts.delete(index);
		}

		console.log(`Checking ${listener.url}...`);

		await page.bringToFront();
		await page.reload();

		const text = await page.$eval('*', (element) => element.innerText?.toLowerCase());
		const id = Date.now();

		if (!existsSync(LOGS_PATH)) mkdirSync(LOGS_PATH);
		writeFileSync(LOG_PATH(id), text, 'utf-8');

		switch (listener.mode) {
			case 'notify-if-missing': {
				if (listener.keywords.every(k => !text.includes(k))) {
					notify(listener.name, listener['pushover-priority'] ?? 0, listener.url, listener.message, id);
					timeouts.set(index, moment().add(config.gracePeriod, 'ms'));
				}
			} break;

			case 'notify-if-present': {
				if (listener.keywords.some(k => text.includes(k))) {
					notify(listener.name, listener['pushover-priority'] ?? 0, listener.url, listener.message, id);
					timeouts.set(index, moment().add(config.gracePeriod, 'ms'));
				}
			} break;
		}

		console.log(`Check completed for ${listener.url}. Timing out for ${config.delay}ms.\n`);
		await new Promise((resolve) => setTimeout(resolve, config.delay));
		stack.push({ page, listener, index });
	}
}

try {
	run();
} catch (error) {
	console.error('Fatal error while monitoring listeners:', error);
}