import config from '../config.json';

async function notify(name: string, priority: number, link: string, message: string, id: number) {
	console.log(`Notifying "${name}" with priority ${priority}.`);

	const url = new URL('https://api.pushover.net/1/messages.json');

	const content = message?.replaceAll('{{name}}', name).replaceAll('{{url}}', link).replaceAll('{{logId}}', id.toString());

	// Authentication
	url.searchParams.set('token', config.pushover['api-key']);
	url.searchParams.set('user', config.pushover['user-key']);

	// Message
	url.searchParams.set('message', content ?? `${name} matched the observer conditions. (Log ID: ${id})`);
	url.searchParams.set('priority', priority.toString());
	url.searchParams.set('url_title', 'Link');
	url.searchParams.set('url', link);

	if (priority === 2) {
		url.searchParams.set('retry', '30');
		url.searchParams.set('expire', '600');
	}

	const res = await fetch(url, { method: 'POST' });

	if (res.status !== 200) {
		return console.error('Failed to notify pushover:', await res.text());
	}
}

export default notify;