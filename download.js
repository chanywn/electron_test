const request = require('request');
const fs = require('fs');
const async = require('async');
const EventEmitter = require('events').EventEmitter
const { DownloaderHelper } = require('node-downloader-helper');
const { byteHelper, pauseResumeTimer } = require('./helpers');

// const STATES = {
//     IDLE: 'IDLE',
//     STARTED: 'STARTED',
//     DOWNLOADING: 'DOWNLOADING',
//     PAUSED: 'PAUSED',
//     RESUMED: 'RESUMED',
//     STOPPED: 'STOPPED',
//     FINISHED: 'FINISHED',
//     FAILED: 'FAILED',
//     MERGE: "MERGE"
// }

// var dls = new Array();
// // new task


// function download(url, dirname) {
//     const options = {
//         method: 'GET',
//         headers: {},
//         fileName: '',
//         override: false,
//         forceResume: false, 
//         httpRequestOptions: {}, 
//         httpsRequestOptions: {} 
//     };
//     var dl = new DownloaderHelper(url, dirname, options);
//     dl.on('end', () => {
//         console.log('Download Completed');
//     }).on('error', err => console.error('Something happend', err))
//     .on('stateChanged', state => console.log('State: ', state))
//     .once('download', () => {})
//     .on('progress', stats => {
//         const progress = stats.progress.toFixed(1);
//         const speed = byteHelper(stats.speed);
//         const downloaded = byteHelper(stats.downloaded);
//         const total = byteHelper(stats.total);
//         console.log(`${speed}/s - ${progress}% [${downloaded}/${total}]`);
//     });
//     return dl;
// }



// function newTask() {
//     var task = {
//         'title': "",
//         'status': STATES.IDLE,
//         'dls': [],
//     }
//     request({
//         url: "http://localhost:9090/?u=http://www.iqiyi.com/v_19rrax9nq4.html?vfm=2008_aldbd",
//         method: "GET",
//         headers: {
//             "content-type": "application/json",
//         },
//         body: null
//     }, function(error, response, body) {
//         if (!error && response.statusCode == 200) {
//             var rets = JSON.parse(body);
//             // console.log(rets[0].streams['5']);
//             var title = rets[0].title;
//             var target = rets[0].streams['5'];
//             var dirname =  "/Users/yucongtang/project/electron_test/" + title
//             fs.mkdir(dirname, 0777,function (err) {
//                 if(err) {
//                     return console.log(err);
//                 }
//             })
//             for(var i=0; i < target.urls.length ; i++) {
//                 var dl = download(target.urls[i]['url'], dirname);
//                 dls.push(dl);
//             }
//             dls[0].start();
//             setTimeout(function() {
//                 dls[0].pause()
//             }, 3000);
    
//             setTimeout(function() {
//                 dls[0].resume()
//             }, 5000);
//         } else {
//             console.log("请求失败或无响应")
//         }
//     });
// }


var task = new EventEmitter();
var rets = new Array();
function d() {
    for (var i =0; i<9;i++) {
        rets.push(i)   
    }
    async.mapLimit(rets, 1, function(ret, callback) {
        t(ret, callback)
    }, function(err,result) {
        // console.log(result)
        console.log('down')
    });
}

function t(i, callback) {
    setTimeout(()=>{
        console.log(i)
        if (i == 8) {
            task.emit('create', rets[i]);
        }
        callback(null, 'success');
    }, 1000);
}
task.on('create', function(who){
    console.log("create finish")
})

d();

