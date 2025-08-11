const path = require('path');
const os = require('os');

export function getDataDirectory() {
  return path.join(
    os.homedir(),
    'AppData',
    'Roaming',
    'Hummingbird',
    'SoundSelf Updater',
  );
}
