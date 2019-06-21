const async = require('async');
const EventEmitter = require('events').EventEmitter

// var task = new EventEmitter();
// var rets = new Array();
// function d() {
//     for (var i =0; i<9;i++) {
//         rets.push(i)   
//     }
//     async.mapLimit(rets, 4, function(ret, callback) {
//         t(ret, callback)
//     }, function(err,result) {
//         console.log('down')
//     });
// }

// function t(i, callback) {
//     setTimeout(()=>{
//         console.log(i)
//         task.emit('start', i);
//         callback(null, 'success');
//     }, 1000);
// }

// task.once('start', function(who){
//     console.log("start " + who)
// })

// d();

var d = new Array();
if (!d["123"]) {
    d["123"] = new Array();
}
d["123"]["124"] = "asdas";
console.log(d);