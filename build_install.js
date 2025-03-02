const {MSICreator} = require('electron-wix-msi');
const path = require('path');
const APP_DIR = path.resolve(__dirname, './out/Drishti AI-win32-x64');


const OUT_DIR = path.resolve(__dirname, './out/installer');


const msiCreator = new MSICreator({
    appDirectory: APP_DIR,
    outputDirectory: OUT_DIR,

    description: 'DrishtiAI',
    exe: 'DrishtiAI',
    name: 'DrishtiAI',
    manufacturer: 'DrishtiAI',
    version: '1.0.0',
    ui: {
        chooseDirectory: true
    }
});

msiCreator.create().then(function () {
    msiCreator.compile();
});