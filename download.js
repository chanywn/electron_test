const request = require('request');
const fs = require('fs');
const async = require('async');
const EventEmitter = require('events').EventEmitter
const { DownloaderHelper } = require('node-downloader-helper');
const { byteHelper, pauseResumeTimer } = require('./helpers');

const STATES = {
    IDLE: 'IDLE',
    STARTED: 'STARTED',
    DOWNLOADING: 'DOWNLOADING',
    PAUSED: 'PAUSED',
    RESUMED: 'RESUMED',
    STOPPED: 'STOPPED',
    FINISHED: 'FINISHED',
    FAILED: 'FAILED',
    MERGE: "MERGE"
}

// var dls = new Array();
var task = new EventEmitter();

request({
    url: "http://localhost:9090/?u=http://www.iqiyi.com/v_19rrax9nq4.html?vfm=2008_aldbd",
    method: "GET",
    headers: {
        "content-type": "application/json",
    },
    body: null
}, function(error, response, body) {
    if (!error && response.statusCode == 200) {
        var rets = JSON.parse(body);
        var title = rets[0].title;
        var target = rets[0].streams['5'];
        var dirname =  "/Users/yucongtang/project/electron_test/" + title
        fs.mkdir(dirname, 0777, function (err) {
            if(err) { return console.log(err); }
            return;
        })
        var urlList = new Array();
        for(var i=0; i < target.urls.length ; i++) {
            urlList[i] = {
                'url': target.urls[i]['url'],
                'dirname': dirname,
                'filename': i + ".f4v"
            };
        }
        async.mapLimit(urlList, 1, function(option, callback) {
            createDownloadTask(option, callback)
        }, function(err,result) {
            console.log('down')
        });
    } else {
        console.log("请求失败或无响应")
    }
});

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
    .on('error', err => console.error('Something happend', err))
    .on('stateChanged', state => console.log('State: ', state))
    .once('download', () => {})
    .on('progress', stats => {
        const progress = stats.progress.toFixed(1);
        const speed = byteHelper(stats.speed);
        const downloaded = byteHelper(stats.downloaded);
        const total = byteHelper(stats.total);
        console.log(`[${option.filename}] ${speed}/s - ${progress}% [${downloaded}/${total}]`);
    });
    dl.start();
}
