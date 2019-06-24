const { exec } = require('child_process');
const fs = require('fs');
var t = "荒村怨灵";
var mergeFilePath = "/Users/chenhao/Downloads/"+t+"/tmp.txt";
var mergedFilePath = "/Users/chenhao/Downloads/"+t+"/1.mp4";
var content = "";
for (var i=0;i<=6; i++) {
    content += "file '" +i + ".f4v'\n";
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