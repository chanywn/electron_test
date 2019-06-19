const { DownloaderHelper } = require('node-downloader-helper');
const { byteHelper, pauseResumeTimer } = require('./helpers');
const url = 'http://123.125.132.41/r/baiducdncnc.inter.iqiyi.com/videos/v0/20190419/6f/89/3b0c289564d42993d3c4cfdefd0dc1de.f4v?key=06d2dddee14d14a49d8f2cc5686c92682&dis_k=39429a5612b37683647932fb308fcfa6&dis_t=1560926117&dis_dz=CNC-BeiJing&dis_st=103&src=iqiyi.com&uuid=72fce8c6-5d09d7a5-1fa&qd_vipres=0&qd_stert=0&qd_vipdyn=0&qd_p=72fcc3a1&qd_tvid=655498800&qd_src=01012001010000000000&qd_aid=204446001&qd_index=1&qd_vip=0&qd_ip=72fcc3a1&qd_uid=0&qd_k=92a635d10ef3dfb617f27690246fcb45&qd_tm=1560926116247';


// these are the default options
const options = {
    method: 'GET', // Request Method Verb
    headers: {},
    fileName: '', // Custom filename when saved
    override: false, // if true it will override the file, otherwise will append '(number)' to the end of file
    forceResume: false, // If the server does not return the "accept-ranges" header, can be force if it does support it
    httpRequestOptions: {}, // Override the http request options  
    httpsRequestOptions: {} // Override the https request options, ex: to add SSL Certs
};

const dl = new DownloaderHelper(url, __dirname, options);

dl
    .on('end', () => console.log('Download Completed'))
    .on('error', err => console.error('Something happend', err))
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