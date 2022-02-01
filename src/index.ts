#!/usr/bin/env node

import { program } from 'commander';

import app from './app'

program
  .version('0.0.1')
  .option('-o, --output [path]', 'output dir', process.cwd())
  .option('-p, --password [password]', 'password');

program
  .command('pack <filename>')
  .description('pack file')
  .alias('p')
  .action((filename) => {
    const { output, password } = program.opts();
    app(output, password, filename, 'pack');
  });

program
  .command('unpack <filename>')
  .description('unpack file')
  .alias('u')
  .action((filename) => {
    const { output, password } = program.opts();
    app(output, password, filename, 'unpack');
  });

program.parse(process.argv);
