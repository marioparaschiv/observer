---

<div align="center">
  <h3>🤖 Observer</h3>
  <p>Easily observe URLs for text changes and get notified through Pushover.</p>
</div>

---

## Requirements
- [Bun](https://bun.sh/) or [Node.js](https://nodejs.org/en)

## Usage

Setting Observer up is simple and straight forward.
- First, create a `config.json` and copy the contents of `sample_config.json` into it.
- Fill out the configurable values to your preference, then build the source and run it.

Observer uses [Pushover](https://pushover.net/). You will need an account along with an Application API key and a User/Group key.

Once you obtain these values, fill them out in the config under the following keys:
```json
"pushover": {
	"api-key": "KEY",
	"user-key": "KEY"
},
```

<br>

### Modes
In `queue` mode, observer uses a stack queue. This essentially means that any job is queued up into a stack where it is handled one by one. Through each iteration, Observer will wait the configured delay (in milliseconds) before moving onto the next listener.

In `concurrent` mode, all listeners will be checked concurrently. Once all checks are complete, Observer will wait the configured delay (in milliseconds) before checking all listeners again.

<br>

### Delays

You can customize the delay for both of these modes in the config under the property `delay`. This setting's behaviour is completely defined by the `mode` you choose.

<br>

### Unsuccessful Keywords

To avoid false positives, you can provide an array of strings under `unsuccessful-keywords` for each listener. Example:
```json
"unsuccessful-keywords": [
	"robot",
	"access denied"
],
```

<br>

### Wait after load

Some websites fetch data after the page is loaded. To combat this, you can set `wait-after-load` on any listener with a delay in milliseconds

### Grace Periods
To avoid spam, Observer will have a grace period where it does not check for any changes on the website after meeting the condition for that listener. When the listener meets the condition, it will be timed out and wait the configured grace period (in milliseconds) before continuing to check.

Setting the grace period to `1200000` (20 minutes) is often a good idea, as you would only receive notifications from the same product every 20 minutes.

You can find this in the config under the property `gracePeriod`.

<br>

### Listeners
Observer operates on listeners. An example of a listener:
```json
{
	"name": "Name",
	"url": "https://url.com/product",
	"mode": "notify-if-missing",
	"pushover-priority": 0,
	"keywords": [
		"this item is out of stock",
		"out of stock"
	]
},
```

Each listener can have its own name, which will be used inside the pushover notification.

For example, if we set the name property to `Dyson Hoover`, by default, we would receive the following notification: `Dyson Hoover matched the observer conditions. (Log ID: 1234)`

<br>

### Customizing Notifications
You can customize the message you receive by adding the "message" property to a listener. This is not a necessary property, if it is not provided, the default message mentioned in the above section will be used.

You can use the following variables inside your message:

- `{{name}}` - The name of the listener.
- `{{url}}` - The URL of the listener.
- `{{logId}}` - The log ID for that iteration of the check. This is useful to know if you are receiving notifications even though the condition was not met. It is possible that your request could be getting blocked.

Example: `{{name}} is now in stock. (Log ID: {{logId}})`

<br>

### Available Notification Modes
In `notify-if-missing` mode, you will get notified if any of the configured keywords for that listener are missing.
In `notify-if-present` mode, you will get notified if any of the configured keywords for that listener are present.

<br>

### Snapshots

You can choose to save snapshots of each check through the `saveSnapshots` config option.
This will save a file with the text content of the website to more easily diagnose issues or errors.

<br>

## Setup
- `[pnpm | yarn | npm | bun] run build`
- `[node | bun] .`

## Licensing
See [LICENSE](/LICENSE).
