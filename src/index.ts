import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { StackItem } from '~/types.d.ts';
import { createLogger } from '~/lib/logger';
import puppeteer from 'puppeteer-extra';
import config from '~/../config.json';
import handler from '~/lib/handler';

puppeteer.use(StealthPlugin());

const logger = createLogger('Observer');

async function run() {
	logger.info('Launching browser...');
	const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
	logger.info('Browser launched.');

	const stack: StackItem[] = [];

	for (const listener of config.listeners) {
		const index = config.listeners.indexOf(listener);
		const page = await browser.newPage();
		const logger = createLogger('Observer', listener.name);

		await page.goto(listener.url);
		stack.push({ page, index, listener, logger });
	}

	while (stack.length) {
		switch (config.mode) {
			case 'concurrent': {
				const items = [...stack];
				stack.length = 0;

				await Promise.allSettled(items.map(async (item) => await handler(stack, item)));
			} break;
			case 'queue': {
				const item = stack.shift();
				await handler(stack, item);
			} break;
		}

		logger.info(`Timing out for ${config.delay}ms.`);
		await new Promise((resolve) => setTimeout(resolve, config.delay));
	}
}

try {
	run();
} catch (error) {
	console.error('Fatal error while monitoring listeners:', error);
}