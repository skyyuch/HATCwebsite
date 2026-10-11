import * as migration_20261011_073413_initial from './20261011_073413_initial';
import * as migration_20261011_091538_add_open_account_url from './20261011_091538_add_open_account_url';

export const migrations = [
  {
    up: migration_20261011_073413_initial.up,
    down: migration_20261011_073413_initial.down,
    name: '20261011_073413_initial',
  },
  {
    up: migration_20261011_091538_add_open_account_url.up,
    down: migration_20261011_091538_add_open_account_url.down,
    name: '20261011_091538_add_open_account_url'
  },
];
