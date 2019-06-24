const async = require('async');
const EventEmitter = require('events').EventEmitter

var task = new EventEmitter();
var rets = new Array();
function d() {
    for (var i =0; i<9;i++) {
        rets.push(i)   
    }
    async.mapLimit(rets, 4, function(ret, callback) {
        t(ret, callback)
    }, function(err,result) {
        console.log('down')
    });
}

function t(i, callback) {
    setTimeout(()=>{
        console.log(i)
        task.emit('start', i);
        callback(null, 'success');
    }, 1000);
}

task.once('start', function(who){
    console.log("start " + who)
})

// d();

var value = "带着爸爸去留学 /第12集 老黄紧盯儿子遭群嘲"

function getRegDir(value){
    var reg=/\\|\/|\?|\？|\*|\"|\“|\”|\'|\‘|\’|\<|\>|\{|\}|\[|\]|\【|\】|\：|\:|\、|\^|\$|\!|\~|\`|\|\|/g;
    value = value.replace(reg,"");
    return value.replace(/\s+/g,"_");;
}
console.log(getRegDir(value));
