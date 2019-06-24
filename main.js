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
const os = require("os");
const { exec } = require('child_process');

// var dls = new Array();
var task = new EventEmitter();
var dts = {};
var osDownloadDir = getDir();

function getDir() {
  if (os.type() == 'Darwin') {
    var osHomeDir = os.homedir();
    var dirname =  osHomeDir + "/Downloads";
  } else if (os.type() == 'Windows_NT') {
    var dirname = "C:\\";
  }
  return dirname;
}

task.on('dl-start', function(dl) {
    dl.start();
    console.log("dl start")
}).on('finish', function(ret) {
  console.log(ret)
  mergeFile(ret.dirname, ret.files);
});

function mergeFile(dirname, files) {
  var mergeFilePath = dirname + "/tmp.txt";
  var mergedFilePath = dirname + "/1.mp4";
  var content = "";
  for (var i=0; i<files.length; i++) {
      content += `file '${files[i]}'\n`;
      
  }
  fs.writeFile(mergeFilePath, content, { 'flag': 'a' }, function(err) {
      if (err) {
          console.log(err);
          return;
      }
      var cmd = `./ffmpeg -y -f concat -safe -1 -i ${mergeFilePath} -c copy -bsf:a aac_adtstoasc ${mergedFilePath}`;
      exec(cmd, (err, stdout, stderr) => {
          if(err) {
              console.log(err);
              return;
          }
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
      })
  });
}

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
  // "uuid": uuid,
  // 'data': data,
  // 'index': index,
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
    var title = getRegDir(params.data.title);
    console.log(title)
    var referer = params.data.url;
    var target = params.data.streams[params.index];
    
    dirname = osDownloadDir + "/" + title;

    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, 0777)
    }
    var urlList = new Array();
    var files = new Array();
    for(var i = 0; i < target.urls.length ; i++) {
        urlList[i] = {
            'av_url':title,
            'event':params.event,
            'uuid': params.uuid,
            'partIndex':i,
            'url': target.urls[i]['url'],
            'dirname': dirname,
            'filename': `${i}.${target.urls[i]['ext']}`,
            'referer':referer
        };
        files[i] =`${i}.${target.urls[i]['ext']}`;
    }
    async.mapLimit(urlList, 1, function(option, callback) {
        if (!dts[params.uuid]) {
          dts[params.uuid] = new Array();
        }
        dts[params.uuid]["av" + option['partIndex']] = createDownloadTask(option, callback);
    }, function(err, result) {
        console.log('down')
        task.emit('finish', {
          'dirname': dirname,
          'files': files
        });
    });
    return dts;
}

function createDownloadTask(option, callback) {
    // 检测文件是否存在
    const options = {
        method: 'GET',
        headers: {
          "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Charset":  "UTF-8,*;q=0.5",
          "Accept-Encoding": "gzip,deflate,sdch",
          "Accept-Language": "en-US,en;q=0.8",
          "User-Agent":      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36",
          "Referer": option.referer,
          "Cookie": "_uuid=3936B6EC-64F6-ADBD-5A79-425FA33D898B40358infoc; LIVE_BUVID=AUTO4715448940306411; sid=9qred3f7; stardustvideo=1; CURRENT_FNVAL=16; buvid3=A28B999F-06F8-4D99-8813-D04E4AC1CDB77998infoc; arrange=matrix; im_notify_type_9305177=0; fts=1548766821; rpdid=|(k|~u|lRYm|0J'ullY|k~llm; im_local_unread_9305177=0; im_seqno_9305177=261; finger=7b9b8fea; CURRENT_QUALITY=0; UM_distinctid=16b5c7bebc1867-0f22e604cf71ae-37677e04-2a3000-16b5c7bebc2722; DedeUserID=9305177; DedeUserID__ckMd5=fed4a30ce7c92490; SESSDATA=8d2dccde%2C1563297241%2Cf08c1961; bili_jct=d3f38fc87a30b18258ca2238b56d4377; _dfcaptcha=0057bad015a8e7f410231c45f92ad899; bp_t_offset_9305177=268126257015306248"
        },
        fileName: option.filename,
        override: false,
        forceResume: false, 
        httpRequestOptions: {}, 
        httpsRequestOptions: {} 
    };
    var dl = new DownloaderHelper(option.url, option.dirname, options);
    dl.on('end', () => {
        console.log('Download Completed');
        callback(null, "Download Completed");
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

function getRegDir(value){
  var reg=/\\|\/|\?|\？|\*|\"|\“|\”|\'|\‘|\’|\<|\>|\{|\}|\[|\]|\【|\】|\：|\:|\、|\^|\$|\!|\~|\`|\|\|/g;
  value = value.replace(reg,"");
  return value.replace(/\s+/g,"_");;
}