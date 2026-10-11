import * as migration_20261011_073413_initial from './20261011_073413_initial';

export const migrations = [
  {
    up: migration_20261011_073413_initial.up,
    down: migration_20261011_073413_initial.down,
    name: '20261011_073413_initial'
  },
];
