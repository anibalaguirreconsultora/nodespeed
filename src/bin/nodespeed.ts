#!/usr/bin/env node
/**
 * @module nodespeed CLI Tool
 * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
 * @license MTI
 * @description
 *
 * This CLI Tool generates nodespeed projects and provides a handful way to work
 * with MEAN Stack based Applications.
 **/
const yargs  = require('yargs')
const chalk  = require('chalk');
const path   = require('path');
const yeoman = require('yeoman-environment');
const env    = yeoman.createEnv();

/**
 * CLI Options Description
 */
var argv = yargs
  .usage('\n********************* nodespeed CLI Tool ************************\n' +
  '\nGenerate nodespeed Projects, Angular 2 Clients and SDK.' +
  '\nUsage:' +
  '\n $ nodespeed [command [options]]')
  .argv;

if (argv._[0] === 'convert-from-beta') {
  let xx = require('../utils/convert-from-beta');

  xx().then(() => {
    process.exit;
  });

} else {

// Register generators
  env.register(require.resolve('generator-nodespeed'), 'nodespeed');
  // env.register(require.resolve('../lib/model'), 'nodespeed:model');
  // env.register(require.resolve('../lib/property'), 'nodespeed:property');

  // Show default menu when no command is added
  if (!argv._ || argv._.length === 0) {

    try {
      env.run('nodespeed',[]);
      process.exit();
    }

    catch(e) {
      chalk.red(e.message);
    }

  }

  // Process Commands

  const cmd = argv._.shift();

  try {
    env.run(`nodespeed:${cmd}`, { _argv: argv });
  } catch (err) {
    chalk.red(err.message);
  }
}