import { SNAPSHOT_PATH, SNAPSHOTS_PATH } from '~/constants';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import type { StackItem } from '~/types';
import config from '~/../config.json';
import notify from '~/lib/pushover';
import moment from 'moment';

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

	if (listener['wait-after-load']) {
		await new Promise(r => setTimeout(r, listener['wait-after-load']));
		logger.info(`Waited ${listener['wait-after-load']}ms after the page loaded.`);
	}

	const selectors = listener['wait-for-selectors'];
	const timeoutBehaviour = listener['selector-timeout-behaviour'] ?? 'skip';
	let failed = false;

	if (selectors?.length) {
		await new Promise(async (resolve) => {
			for (const item of selectors) {
				const selector = Array.isArray(item) ? item[0] : item;
				const options = Array.isArray(item) ? item[1] : {};

				try {
					await page.waitForSelector(selector, options);
					logger.success(`Found selector "${item}"`);
				} catch (error) {
					logger.warn(`Failed to wait for "${item}" selector:`, error);
					failed = true;
				}
			}

			resolve(null);
		});
	}

	if (failed && timeoutBehaviour === 'skip') {
		logger.warn(`Skipping checks as the selector timed out.`);
		stack.push(item);
		return;
	}

	const text = await page.$eval('*', (element: HTMLElement) => element.innerText?.toLowerCase());
	const logId = Date.now();

	if (config.saveSnapshots) {
		if (!existsSync(SNAPSHOTS_PATH)) mkdirSync(SNAPSHOTS_PATH);

		writeFileSync(SNAPSHOT_PATH(logId), [
			'=============================',
			JSON.stringify(listener, null, 2),
			'=============================',
			'',
			text
		].join('\n'), 'utf-8');
	}

	if (listener['unsuccessful-keywords'].some(k => text.includes(k))) {
		logger.error(`Matched unsuccessful keyword. Please check snapshot.`);


	} else {
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

		logger.success(`Check completed for ${listener.url}.`);
	}

	stack.push(item);
}

export default handler;