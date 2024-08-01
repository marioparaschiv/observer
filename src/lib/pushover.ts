import config from '~/../config.json';
import type { StackItem } from '~/types';

async function notify(item: StackItem, logId: number) {
	const { listener, logger } = item;

	const name = listener.name;
	const priority = listener['pushover-priority'] ?? 0;
	const link = listener.url;
	const message = listener.message;

	logger.info(`Notifying "${name}" with priority ${priority}.`);

	const url = new URL('https://api.pushover.net/1/messages.json');

	const content = message?.replaceAll('{{name}}', name).replaceAll('{{url}}', link).replaceAll('{{logId}}', logId.toString());

	// Authentication
	url.searchParams.set('token', config.pushover['api-key']);
	url.searchParams.set('user', config.pushover['user-key']);

	// Message
	url.searchParams.set('message', content ?? `${name} matched the observer conditions. (Log ID: ${logId})`);
	url.searchParams.set('priority', priority.toString());
	url.searchParams.set('url_title', 'Link');
	url.searchParams.set('url', link);

	if (priority === 2) {
		url.searchParams.set('retry', '30');
		url.searchParams.set('expire', '600');
	}

	const res = await fetch(url, { method: 'POST' });

	if (res.status !== 200) {
		return logger.error('Failed to notify pushover:', await res.text());
	}
}

export default notify;