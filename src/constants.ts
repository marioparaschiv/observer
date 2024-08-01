import { join } from 'path';

export const SNAPSHOTS_PATH = join(__dirname, '..', 'snapshots');
export const SNAPSHOT_PATH = (id: number) => join(SNAPSHOTS_PATH, `${id}.txt`);