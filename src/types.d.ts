import type config from '../config.json';

declare type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
declare type StackItem = { page: Page, index: number, listener: ArrayElement<typeof config.listeners>; };