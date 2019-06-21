const { exec } = require('child_process');
const fs = require('fs');

var mergeFilePath = "/Users/yucongtang/Downloads/少年派妙妙新生入学欢乐多/a.cache";
var mergedFilePath = "/Users/yucongtang/Downloads/少年派妙妙新生入学欢乐多/妙妙新生入学欢乐多.mp4";
var content = "";
for (var i=0;i<=247; i++) {
    content += "file '" +i + ".ts'\n";
}
fs.writeFile(mergeFilePath, content, { 'flag': 'a' }, function(err) {
    if (err) {
        console.log(err);
        return;
    }
    var cmd = `ffmpeg -y -f concat -safe -1 -i ${mergeFilePath} -c copy -bsf:a aac_adtstoasc ${mergedFilePath}`;
    exec(cmd, (err, stdout, stderr) => {
        if(err) {
            console.log(err);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    })
});