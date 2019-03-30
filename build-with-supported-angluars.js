#!/usr/bin/env node
const { spawnSync } = require('child_process');
const ANGULAR_PACKAGES = [
  '@angular/common', '@angular/compiler', '@angular/core',
  '@angular/forms','@angular/platform-browser', '@angular/platform-browser-dynamic',
  '@angular/router'
];
const VERSIONS = {
  '6': {
    packages: {
      'rxjs': '^6.0.0',
      'zone.js': '^0.8.26',
      'typescript': '2.9.x',
    }
  },
  '7': {
    packages: {
      'rxjs': '^6.0.0',
      'zone.js': '^0.8.26',
      'typescript': '3.1.x',
    }
  },
}
 
const run = cmd => {
  console.log(`> ${cmd}`);
  const splitCmd = cmd.split(' ');
  const result = spawnSync(splitCmd[0], splitCmd.slice(1));
  if (result.status !== 0) {
    throw new Error(
      [
        `Command exited with status: ${result.status}`,
        cmd,
        result.output.toString()
      ].join('\n')
    );
  }
  return result.stdout.toString().trim();
};

Object.entries(VERSIONS).forEach(([angularVersion, config]) => {
  console.log(`Building with Angular ${angularVersion}...`);
  const oldPackages = [
    ...ANGULAR_PACKAGES,
    ...Object.keys(config.packages)
  ];
  const newPackages = [
    ...ANGULAR_PACKAGES.map(p => `${p}@${angularVersion}`),
    ...Object.entries(config.packages).map(([p, version]) => `${p}@${version}`)
  ];
  run(`npm uninstall --no-save ${oldPackages.join(' ')}`);
  run(`npm install --no-save ${newPackages.join(' ')}`);
  run('npm run build:all')
});
console.log('Testing complete');
run('npm install');
