import { join } from 'path';

export const LOGS_PATH = join(__dirname, '..', 'logs');
export const LOG_PATH = (id: number) => join(LOGS_PATH, `${id}.txt`);