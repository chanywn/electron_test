{
  "name": "download-spirit",
  "description":"web video download tool",
  "author":"chansoft",
  "version": "0.1.0",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build-win": "electron-builder --win --x64",
    "build-mac": "electron-builder --mac --x64",
    "build": "electron-builder -mwl"
  },
  "license": "UNLICENSED",
  "dependencies": {
    
  },
  "devDependencies": {
    "electron": "^5.0.4",
    "electron-builder": "^20.44.4"
  },
  "build": {
    "productName": "v-spirit",
    "appId": "com.chansoft.web-video-downloader",
    "copyright":"chansoft",
    "mac": {
      "target": ["dmg"],
      "icon": "icon.ico"
    },
    "win": {
      "target": [
        "nsis",
        "zip"
      ],
      "icon": "icon.ico"
    }
  },
  "nsis": {
    "oneClick": false, // 是否一键安装
    "allowElevation": true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
    "allowToChangeInstallationDirectory": true, // 允许修改安装目录
    "installerIcon": "./build/icons/aaa.ico",// 安装图标
    "uninstallerIcon": "./build/icons/bbb.ico",//卸载图标
    "installerHeaderIcon": "./build/icons/aaa.ico", // 安装时头部图标
    "createDesktopShortcut": true, // 创建桌面图标
    "createStartMenuShortcut": true,// 创建开始菜单图标
    "shortcutName": "", // 图标名称
    "include": "build/script/installer.nsh", // 包含的自定义nsis脚本 这个对于构建需求严格得安装过程相当有用。
    "script" : "build/script/installer.nsh" // NSIS脚本的路径，用于自定义安装程序。 默认为build / installer.nsi  
  }
}
