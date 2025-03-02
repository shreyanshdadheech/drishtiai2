const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const { version } = require('../package.json');

// Change these values according to your setup
const config = {
  version: version,
  files: [
    {
      url: `DrishtiAI-Setup-${version}.exe`,
      sha512: 'SHA512_HASH_PLACEHOLDER', // This should be calculated from the actual file
      size: 'SIZE_PLACEHOLDER' // This should be the actual file size
    }
  ],
  path: `DrishtiAI-Setup-${version}.exe`,
  sha512: 'SHA512_HASH_PLACEHOLDER', // Same as above
  releaseDate: new Date().toISOString()
};

const yamlString = yaml.stringify(config);

// Ensure the out directory exists
const outDir = path.join(__dirname, '../out');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Write the latest.yml file
fs.writeFileSync(path.join(outDir, 'latest.yml'), yamlString);
console.log('Generated latest.yml file');
