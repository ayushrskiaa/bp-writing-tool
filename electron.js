const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let flaskProcess = null;

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  win.loadURL('http://localhost:5000');
}

app.whenReady().then(() => {
  // Start Flask backend as executable
  const flaskExe = path.join(__dirname, 'dist', 'app.exe');
  flaskProcess = spawn(flaskExe, [], {
    cwd: path.join(__dirname, 'dist'),
    shell: true,
    env: { ...process.env, FLASK_ENV: 'development' }
  });

  flaskProcess.stdout.on('data', (data) => {
    console.log(`Flask: ${data}`);
  });
  flaskProcess.stderr.on('data', (data) => {
    console.error(`Flask Error: ${data}`);
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (flaskProcess) flaskProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});