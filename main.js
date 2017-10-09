'use strict';

// Import parts of electron to use
const {app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let tray;

// Keep a reference for dev mode
let dev = false;
if ( process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath) ) {
  dev = true;
}

function createWindow() {
  // hide electron dock icon
  app.dock.hide();

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024/2, height: 768/2, show: false, closable: true, resizable: true, moveable: true
  });

  // and load the index.html of the app (webpack-bundled react web app)
  let indexPath;
  if ( dev && process.argv.indexOf('--noDevServer') === -1 ) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true
    });
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true
    });
  }
  mainWindow.loadURL( indexPath );

  // // determine platform to display correct tray icon
  // const iconName = process.platform = 'win32' ? 'windows-icon.png' : 'iconTemplate.png';
  // const iconPath = path.join(__dirname, `./src/assets/${iconName}`);
  // // take iconPath and create instance of tray constructor... 
  // tray = new Tray(iconPath, mainWindow);
  // console.log('tray -> ', tray);

  // tray.on('click', (event, bounds) => {
  //   const { x, y } = bounds;
  //   const { height, width } = mainWindow.getBounds();
  //   const yPosition = process.platform === 'darwin' ? y : (y - height);
  //   mainWindow.setBounds({
  //     x: x - (width / 2),
  //     y: yPosition,
  //     height,
  //     width
  //   });

  //   mainWindow.show();
  //   if (dev) {
  //     mainWindow.webContents.openDevTools();
  //   }
  // });

  // tray.on('right-click', () => {
  //   const menuConfig = Menu.buildFromTemplate([
  //     {
  //       label: 'Quit',
  //       click: () => app.quit()
  //     }
  //   ])

  //   this.popUpContextMenu(menuConfig);
  // });


  
  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Open the DevTools automatically if developing
    if ( dev ) {
      mainWindow.webContents.openDevTools();
    }
  });
  

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
