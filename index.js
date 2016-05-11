#!/usr/bin/env node

var parseArgs = require('minimist');
var tree = require('./lib/tree');
var pkg = require('./package.json');

var args = parseArgs(process.argv.slice(2), {
  alias: {
    h: 'help',
    s: 'source',
    i: 'ignore',
    o: 'output',
  }
});

if (args.help) {
  console.log('Version: ' + pkg.version + '\n');
  console.log('Usage: tree-dir -s <sourceDir> -i <ignoreDir1> -i <ignoreDir2> -o <outputDir>\n');
  console.log('Commands:');
  console.log('tree-dir\tShow tree of current dir\n');
  console.log('Options:');
  console.log('-s <sourceDir>\tShow dir\n');
  console.log('-i <ignoreDir>\tIgnore dir\n');
  console.log('-o <outputDir>\tOutput dir\n');
} else {
  tree.run(args, function(err, result) {
    if (err) {
      console.error('ERROR: ' + err);
      process.exit(1);
    }
  });
}
