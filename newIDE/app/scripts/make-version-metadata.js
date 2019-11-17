/**
 * Launch this script to re-generate the files containing the list of extensions
 * being used by each example.
 */
const fs = require('fs');
var shell = require('shelljs');

const electronAppPackageJson = require('../../electron-app/app/package.json');
const version = electronAppPackageJson.version;
const outputFile = '../src/Version/VersionMetadata.js';
const gitHashShellString = shell.exec(`git rev-parse "HEAD"`, {
  silent: true,
});

let gitHash = gitHashShellString.stdout.trim();
if (gitHashShellString.stderr || gitHashShellString.code) {
  shell.echo(`⚠️ Can't find the hash or branch of the associated commit.`);
  gitHash = 'unknown-hash';
}

const writeFile = object => {
  return new Promise((resolve, reject) => {
    const content = [
      `// @flow`,
      `// This file is generated by make-version-metadata.js script`,
      `// Don't import this file directly, prefer to use newIDE/app/src/Version/index.js instead.`,
      `// prettier-ignore`,
      `module.exports = ${JSON.stringify(object, null, 2)};`,
      ``,
    ].join('\n');
    fs.writeFile(outputFile, content, err => {
      if (err) return reject(err);

      resolve();
    });
  });
};

writeFile({
  version,
  gitHash,
  versionWithHash: [version, gitHash].join('-'),
}).then(
  () => console.info('✅ src/Version/VersionMetadata.js properly generated.'),
  err => console.error('❌ Error while src/Version/VersionMetadata.js', err)
);
