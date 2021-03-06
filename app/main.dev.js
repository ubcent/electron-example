/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import { Client } from 'node-ssdp';
import ip from 'ip';
import os from 'os';
import fs from 'fs';

import SubnetDiscoverer from 'subnet-discover';
import snmp from 'net-snmp';

import MenuBuilder from './menu';

let mainWindow = null;
const bus = new Client();

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log);
};


/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();

    console.log('My IP', ip.address());
    const myIp = ip.address();

    ipcMain.on('fetchTree', (event, ...args) => {
      const [ip] = args;
      console.log('tree', ip);
      const session = snmp.createSession(ip, 'public');

      let vBinds = [];

      session.walk('1.3.6.1', 20, varbinds => {
        vBinds = vBinds.concat(varbinds);
      }, error => {
        if (error) {
          console.log(error);
        }
        fs.writeFile(`${ip}.txt`, JSON.stringify(vBinds.map(item => {
          if(item.value) item.value = item.value.toString();
          return item;
        })), function (err) {
          if (err) {
            return console.log(err);
          }

          console.log("The file was saved!", ip);
        });
      });
    });

    ipcMain.on('ping', (event, ...args) => {
      bus.on('response', (headers, code, rinfo) => {
        event.sender.send('addHost', {
          ip: rinfo.address,
          source: 'ssdp',
          type: 'printer'
        });
      });

      setImmediate(() => {
        bus.search('urn:schemas-upnp-org:device:Printer:1');
      });
      console.log('Ping', ...args);
      event.sender.send('setEnvProp', {
        value: ip.address(),
        name: 'ip'
      });

      const subnetDiscoverer = new SubnetDiscoverer();
      subnetDiscoverer.on('host:alive', ip => {
        event.sender.send('addHost', {
          ip,
          source: 'ping',
          type: 'unknown'
        });
      });
      subnetDiscoverer.on('host:printer', (ip, deviceName) => {
        console.log(ip, deviceName);
        event.sender.send('updateHost', {
          ip,
          source: 'snmp',
          type: 'printer',
          model: deviceName
        });
      });
      subnetDiscoverer.discover();
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});
