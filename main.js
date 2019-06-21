const { app, BrowserWindow } = require('electron');

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    backgroundColor: "#f4f4f4",
    show: false,
    opacity: 1.0,
    center: true,
    minHeight: 480,
    height: 480,
    maxWidth: 850,
    minWidth: 850,
    width: 850,
    fullscreenable: false,
    titleBarStyle: "hidden",
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  mainWindow.loadFile('render/index.html')
  mainWindow.webContents.openDevTools()
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  global.mainId = mainWindow.id;
}

app.on('ready', () => {
  createWindow();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

const request = require('request');
const fs = require('fs');
const async = require('async');
const EventEmitter = require('events').EventEmitter
const { DownloaderHelper } = require('node-downloader-helper');
const { byteHelper } = require('./helpers');
const { ipcMain } = require('electron')


// var dls = new Array();
var task = new EventEmitter();
var dts = {};

task.on('dl-start', function(dl) {
    dl.start();
    console.log("dl start")
});

ipcMain.on('search', (event, data) => {
  console.log(data)
    request({
        url: `http://localhost:9090/?u=${data.payload}`,
        method: "GET",
        headers: {
            "content-type": "application/json",
        },
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var body = JSON.parse(body);
            // event.reply('search-reply', body)
            event.returnValue = body
        } else {
            console.log("请求失败或无响应")
            // event.reply('search-reply', {"error":"请求失败或无响应"})
            event.returnValue = {"error":"请求失败或无响应"}
        }
    });
})

ipcMain.on('video-download', (event, data) => {
  console.log(data)
  data.event = event;
  newTask(data);
})

ipcMain.on('video-download-pause', (event, data) => {
  console.log(data)
  dts[data.uuid]['av'+data.index].pause();
  // console.log(dts)
})

ipcMain.on('video-download-resume', (event, data) => {
  console.log(data)
  dts[data.uuid]['av'+data.index].resume();
  // console.log(dts)
})


function newTask(params) {
    var title = params.data.title;
    var target = params.data.streams[params.index];
    var dirname =  "/Users/yucongtang/project/electron_test/" + title
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, 0777)
    }
    var urlList = new Array();
    for(var i = 0; i < target.urls.length ; i++) {
        urlList[i] = {
            'event':params.event,
            'uuid': params.uuid,
            'partIndex':i,
            'url': target.urls[i]['url'],
            'dirname': dirname,
            'filename': `${i}.${target.urls[i]['ext']}`
        };
    }
    async.mapLimit(urlList, 1, function(option, callback) {
        if (!dts[params.uuid]) {
          dts[params.uuid] = new Array();
        }
        dts[params.uuid]["av" + option['partIndex']] = createDownloadTask(option, callback);
    }, function(err, result) {
        console.log('down')
    });
    return dts;
}

function createDownloadTask(option, callback) {
    // 检测文件是否存在
    const options = {
        method: 'GET',
        headers: {},
        fileName: option.filename,
        override: false,
        forceResume: false, 
        httpRequestOptions: {}, 
        httpsRequestOptions: {} 
    };
    var dl = new DownloaderHelper(option.url, option.dirname, options);
    dl.on('end', () => {
        console.log('Download Completed');
        callback(null, 'Download Completed');
    })
    .on('error', err => {
      console.error('Something happend', err)
    })
    .on('stateChanged', state => {
      console.log('State: ', state)
      option.event.reply('video-download-status-reply', {
        "uuid":option.uuid,
        'partIndex':option.partIndex,
        "state":state,
      })
    })
    .once('download', () => {})
    .on('progress', stats => {
        const progress = stats.progress.toFixed(1);
        const speed = byteHelper(stats.speed);
        const downloaded = byteHelper(stats.downloaded);
        const total = byteHelper(stats.total);
        console.log(`[${option.uuid}] [${option.filename}] ${speed}/s - ${progress}% [${downloaded}/${total}]`);
        option.event.reply('video-download-reply', {
          "uuid":option.uuid,
          'partIndex':option.partIndex,
          "progress":progress,
          'speed':speed,
          'downloaded':downloaded,
          'total':total
        })
    });
    task.emit('dl-start', dl);
    return dl;
}