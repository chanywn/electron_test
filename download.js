const request = require('request');
const fs = require('fs');
const { DownloaderHelper } = require('node-downloader-helper');
const { byteHelper, pauseResumeTimer } = require('./helpers');
const url = 'http://123.125.132.41/r/baiducdncnc.inter.iqiyi.com/videos/v0/20190419/6f/89/3b0c289564d42993d3c4cfdefd0dc1de.f4v?key=06d2dddee14d14a49d8f2cc5686c92682&dis_k=39429a5612b37683647932fb308fcfa6&dis_t=1560926117&dis_dz=CNC-BeiJing&dis_st=103&src=iqiyi.com&uuid=72fce8c6-5d09d7a5-1fa&qd_vipres=0&qd_stert=0&qd_vipdyn=0&qd_p=72fcc3a1&qd_tvid=655498800&qd_src=01012001010000000000&qd_aid=204446001&qd_index=1&qd_vip=0&qd_ip=72fcc3a1&qd_uid=0&qd_k=92a635d10ef3dfb617f27690246fcb45&qd_tm=1560926116247';


var maxBf = 2;
var bf = 0;
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
        console.log(rets[0].streams['5']);
        var title = rets[0].title;
        var target = rets[0].streams['5'];
        var dirname =  "/Users/yucongtang/project/electron_test/" + title
        fs.mkdir(dirname, 0777,function (err) {
            if(err) {
                return console.log(err);
            }
        })
        for(var i=0; i < target.urls.length ; i++) {
            waitingForBf();
            download(target.urls[i]['url'], dirname);
        }
    } else {
        console.log("请求失败或无响应")
    }
});

function waitingForBf() {
    while(true) {
        if (bf <= maxBf) {
			return;
		} else {
			time.Sleep(time.Duration(1))
		}
    }
}

function download(url, dirname) {
    const options = {
        method: 'GET',
        headers: {},
        fileName: '',
        override: false,
        forceResume: false, 
        httpRequestOptions: {}, 
        httpsRequestOptions: {} 
    };
    const dl = new DownloaderHelper(url, dirname, options);
    dl.on('end', () => {
        console.log('Download Completed');
        bf--;
    }).on('error', err => console.error('Something happend', err))
        .on('stateChanged', state => console.log('State: ', state))
        .once('download', () => pauseResumeTimer(dl, 5000))
        .on('progress', stats => {
            const progress = stats.progress.toFixed(1);
            const speed = byteHelper(stats.speed);
            const downloaded = byteHelper(stats.downloaded);
            const total = byteHelper(stats.total);
            console.log(`${speed}/s - ${progress}% [${downloaded}/${total}]`);
        });
    console.log('Downloading: ', url);
    dl.start();
}
