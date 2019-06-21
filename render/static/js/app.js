
let app = {
    init: function(html) {
        
        var sys_download_dir = localStorage.getItem("sys_download_dir", data[0]);
        if (sys_download_dir) {
            $$("#sys_download_dir").text(sys_download_dir);
        }
    },
    search: function(url, callback) {
        let response = ipcRenderer.sendSync('search', {
            "payload":url
        });
        callback && callback(response);
    },
    listen: function() {
        ipcRenderer.on('search-reply', (event, payload) => {
            console.log(payload);
        }).on('video-download-reply', (event, payload) => {
            // console.log(payload);
            $$("#finish_" + payload.uuid).text(`${payload.downloaded}/${payload.total}`)
            $$("#botper_" + payload.uuid).css("width", payload.progress + "%")
            $$("#per_" + payload.uuid).text(payload.progress + "%")
            $$("#speed_" + payload.uuid).text(payload.speed + "/s")
            $$("#index_" + payload.uuid).text(payload.partIndex + 1)

            $$("#pause_" + payload.uuid).attr("data-index",payload.partIndex)
        }).on('video-download-status-reply', (event, payload) => {
            if (payload.state == "DOWNLOADING") {
                $$("#pause_" + payload.uuid).text("暂停")
            } else if (payload.state == "PAUSED") {
                $$("#pause_" + payload.uuid).text("开始")
            }
            console.log(payload);
        })
    },
    notice: function (head, title, msg) {
        var Notification = window.Notification || window.mozNotification || window.webkitNotification;
        if (Notification) {
            Notification.requestPermission(function (status) {
                //status默认值'default'等同于拒绝 'denied' 意味着用户不想要通知 'granted' 意味着用户同意启用通知
                if ("granted" != status) {
                    return;
                } else {
                    var tag = "sds" + Math.random();
                    var notify = new Notification(
                        title,
                        {
                            dir: 'auto',
                            lang: 'zh-CN',
                            tag: tag,//实例化的notification的id
                            icon: '/' + head,//通知的缩略图,//icon 支持ico、png、jpg、jpeg格式
                            body: msg //通知的具体内容
                        }
                    );
                    notify.onclick = function () {
                        //如果通知消息被点击,通知窗口将被激活
                        window.focus();
                    },
                        notify.onerror = function () {
                            console.log("HTML5桌面消息出错！！！");
                        };
                    notify.onshow = function () {
                        // setTimeout(function () {
                        //     notify.close();
                        // }, 10000)
                    };
                    notify.onclose = function () {
                        console.log("HTML5桌面消息关闭！！！");
                    };
                }
            });
        } else {
            console.log("您的浏览器不支持桌面消息");
        }
    },
    createDownload: function(payload, callback) {
        let response = ipcRenderer.send('video-download', payload);
        callback && callback(response);
    },
    Addtask: function(data, index, title){
        mdui.snackbar({
            position: "right-bottom",
            message: '已建立缓存任务'
        });
        var title = data.title;
        var uuid = getUUID();
        var target = data.streams[index];
        // 构建数据
        html = `<div class="mdui-panel-item mdui-panel-item-open" title="${title}">
            <div class="mdui-panel-item-header">
                <div class="mdui-panel-item-title" style="line-height: 48px;">
                    <span>【<span id="index_${uuid}">0</span>/${target.urls.length}】</span>
                    <span>${title}</span>
                </div>
                <div id="finish_${uuid}" class="mdui-panel-item-summary"></div>
                <div id="per_${uuid}" class="mdui-panel-item-summary"></div>
                <div id="speed_${uuid}" class="mdui-panel-item-summary" style="text-align: right;"></div>
            </div>
            <div class="mdui-panel-item-body">
                    <div class="mdui-progress">
                    <div id="botper_${uuid}" class="mdui-progress-determinate" style="width: 0%;"></div>
                </div>
                <div class="mdui-panel-item-actions">
                    <button class="mdui-btn mdui-ripple">cancel</button>
                    <button id="pause_${uuid}" data-uuid="${uuid}" data-index="" class="btn_pause mdui-btn mdui-ripple">暂停</button>
                </div>
            </div>
        </div>`;
        $$('#v-downloads').append(html);
        app.notice('./static/icon.png', '已建立缓存任务', title);

        $$("#download-mc-empty").css('display', 'none');
        app.createDownload({
            "uuid": uuid,
            'data': data,
            'index': index
        }, function (response) {
            console.log(response);
        });
    },
    pause: function(payload, callback) {
        let response = ipcRenderer.send('video-download-pause', payload);
        callback && callback(response);
    },
    resume: function(payload, callback) {
        let response = ipcRenderer.send('video-download-resume', payload);
        callback && callback(response);
    },
};

function fileLengthFormat(total, n) {
    var format;
    var len = total / (1024.0);
    if (len > 1000) {
        return arguments.callee(len, ++n);
    } else {
        switch (n) {
            case 1:
                format = len.toFixed(2) + "KB";
                break;
            case 2:
                format = len.toFixed(2) + "MB";
                break;
            case 3:
                format = len.toFixed(2) + "GB";
                break;
            case 4:
                format = len.toFixed(2) + "TB";
                break;
        }
        return format;
    }
}