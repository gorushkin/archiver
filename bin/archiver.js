#!/usr/bin/env node

import { program } from 'commander';

import app from '../src/index.js';

program
  .version('0.0.1')
  .argument('<filename>')
  .option('-o, --output [path]', 'output dir', process.cwd())
  .option('-p, --password [password]', 'password')
  .option('-n, --name [name]', 'archive name', 'archive')
  .option('-d, --name [directory]', 'directory name')
  .action((filename) => {
    const { output, password, name } = program.opts();
    app(output, password, filename, name);
  });

program
  .command('pack <filename>')
  .description('pack file')
  .alias('p')
  .action((filename) => {
    const { output, password, name } = program.opts();
    app(output, password, filename, name, 'pack');
  });

program
  .command('unpack <filename>')
  .description('unpack file')
  .alias('u')
  .action((filename) => {
    const { output, password, name } = program.opts();
    app(output, password, filename, name, 'unpack');
  });

program.parse(process.argv);
