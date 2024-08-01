import type { StackItem } from '~/types';
import config from '~/../config.json';
import notify from '~/lib/pushover';
import moment from 'moment';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { LOG_PATH, LOGS_PATH } from '~/constants';

const timeouts = new Map();

async function handler(stack: StackItem[], item: StackItem) {
	const { page, listener, index, logger } = item;

	const timeout = timeouts.get(index);
	const gracePeriod = timeout && timeout.diff(moment());

	if (timeout && gracePeriod <= 0) {
		timeouts.delete(index);
	} else if (gracePeriod) {
		logger.warn(`Listener is in a grace period of ${gracePeriod}ms. Skipping it.`);
		stack.push(item);
		return;
	} else {
		timeouts.delete(index);
	}

	logger.info(`Checking for keywords...`);

	await page.reload();

	const text = await page.$eval('*', (element: HTMLElement) => element.innerText?.toLowerCase());
	const logId = Date.now();

	if (config.saveSnapshots) {
		if (!existsSync(LOGS_PATH)) mkdirSync(LOGS_PATH);
		writeFileSync(LOG_PATH(logId), text, 'utf-8');
	}

	switch (listener.mode) {
		case 'notify-if-missing': {
			if (listener.keywords.some(k => !text.includes(k))) {
				notify(item, logId);
				timeouts.set(index, moment().add(config.gracePeriod, 'ms'));
			}
		} break;

		case 'notify-if-present': {
			if (listener.keywords.some(k => text.includes(k))) {
				notify(item, logId);
				timeouts.set(index, moment().add(config.gracePeriod, 'ms'));
			}
		} break;
	}

	stack.push(item);
	logger.success(`Check completed for ${listener.url}.`);
}

export default handler;