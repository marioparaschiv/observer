import type { createLogger } from '~/lib/logger';
import type config from '../config.json';
import type { Page } from 'puppeteer';

declare type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
declare type Listener = ArrayElement<typeof config.listeners>;

declare interface StackItem {
	page: Page;
	index: number;
	listener: Listener;
	logger: ReturnType<typeof createLogger>;
}