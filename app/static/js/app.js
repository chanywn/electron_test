let app = {
    about: function(html) {
        let c = document.createElement("div");
        c.innerHTML = html;
        asticode.modaler.setContent(c);
        asticode.modaler.show();
    },
    init: function() {
        // Wait for astilectron to be ready
        document.addEventListener('astilectron-ready', function() {
            app.listen();
        })
    },
    search: function(url, callback) {
        let request = {
            "name": "search",
            "payload":url
        };
        astilectron.sendMessage(request, function(response) {
            callback && callback(response);
        })
    },
    listen: function() {
        astilectron.onMessage(function(message) {
            switch (message.name) {
                case "about":
                    app.about(message.payload);
                    return {payload: "payload"};
                    break;
                case "progess":
                    app.Progess(message.payload);
                    return {payload: "payload"};
                    break;
            }
        });
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
    getClipboard: function (callback) {
        let request = {
            "name": "get_clipboard",
            "payload": ""
        };
        astilectron.sendMessage(request, function(response) {
            // console.log(response);
            callback && callback(response);
        })
    },
    
    createDownload: function(payload, callback) {
        let request = {
            "name": "video_download",
            "payload": payload
        };
        astilectron.sendMessage(request, function(response) {
            // console.log(response);
            callback && callback(response);
        })
    },
    Progess: function (payload) {
        console.log(payload)
        if (payload != 'undefined') {
            var ConsumedBytes = fileLengthFormat(payload.ConsumedBytes / 8,1) + "/" + fileLengthFormat(payload.TotalBytes / 8,1);
            // console.log(ConsumedBytes)
            $$("#per_" + payload.uuid).text(ConsumedBytes)
            $$("#botper_" + payload.uuid).css("width", payload.Progess + "%")
            $$("#speed_" + payload.uuid).text(fileLengthFormatPerScond(payload.IncrementBytesPerSecond / 8, 1))
        }
    },
    Addtask: function(url, key, title){
        mdui.snackbar({
            position: "right-bottom",
            message: '已建立缓存任务'
        });

        var uuid = getUUID();
        html = `<div class="mdui-panel-item mdui-panel-item-open" title="${title}">
            <div class="mdui-panel-item-header">
                <div class="mdui-panel-item-title" style="line-height: 48px;">
                    <span>${title}</span>
                </div>
                <div id="per_${uuid}" class="mdui-panel-item-summary"></div>
                <div id="speed_${uuid}" class="mdui-panel-item-summary"></div>
            </div>
            <div class="mdui-panel-item-body">
                <div class="mdui-progress">
                    <div id="botper_${uuid}" class="mdui-progress-determinate" style="width: 0%;"></div>
                </div>
            </div>
        </div>`;
        $$('#v-downloads').append(html);
        app.notice('./static/icon.png', '已建立缓存任务', title);

        $$("#download-mc-empty").css('display', 'none');
        app.createDownload({
            "uuid": uuid,
            'url': url,
            'index': key
        }, function (response) {
            console.log(response);
        });
    }
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

function fileLengthFormatPerScond(total, n) {
    var format;
    var len = total / (1024.0);
    if (len > 1000) {
        return arguments.callee(len, ++n);
    } else {
        switch (n) {
            case 1:
                format = len.toFixed(2) + "KB/s";
                break;
            case 2:
                format = len.toFixed(2) + "MB/s";
                break;
            case 3:
                format = len.toFixed(2) + "GB/s";
                break;
            case 4:
                format = len.toFixed(2) + "TB/s";
                break;
        }
        return format;
    }
}