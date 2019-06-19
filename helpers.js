const { DH_STATES } = require('node-downloader-helper');

module.exports.byteHelper = function (value) {
    var units = ['b', 'kB', 'MB', 'GB', 'TB'],
        number = Math.floor(Math.log(value) / Math.log(1024));
    return (value / Math.pow(1024, Math.floor(number))).toFixed(1) + ' ' +
        units[number];
}

module.exports.pauseResumeTimer = function (_dl, wait) {
    setTimeout(() => {
        if (_dl.state === DH_STATES.FINISHED ||
            _dl.state === DH_STATES.FAILED) {
            return;
        }

        _dl.pause()
            .then(() => console.log(`Paused for ${wait / 1000} seconds`))
            .then(() => setTimeout(() => {
                if (!_dl.isResumable()) {
                    console.warn("This URL doesn't support resume, it will start from the beginning");
                }
                return _dl.resume();
            }, wait));

    }, wait);
}