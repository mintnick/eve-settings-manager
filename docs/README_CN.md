# EVE Settings Manager

用于管理EVE Online本地设置文件的第三方工具

从旧项目[ESAM](https://github.com/mintnick/ESAM)升级，用Electron重构并添加了一些新功能。

当前状态：1.0.0版本

![Screen Shot 2023-02-09 at 15 30 17](https://user-images.githubusercontent.com/14357052/217746381-e0f74ca8-2377-417f-8030-6d751ed8788b.png)

## 使用方法

1. 下载并解压缩
2. 运行软件
3. (可选)在覆盖操作前使用“备份”按钮创建备份
4. 选择一个设置文件作为模版
    - 覆盖其它所有文件
    - 覆盖选定的文件

## 其它功能

- 获取并缓存用户名
- 给角色和帐号添加备注信息
- 支持简/繁中文和英语
- 支持宁静、晨曦、测试服、曙光、雷电穹顶

## 卸载

1. 删除软件
2. (可选)删除缓存文件
    - Windows: 删除 **C:\用户\\\<User>\AppData\Local\eve-settings-manager**
    - Mac: 删除 **\<User>/Library/Application Support/eve-settings-manager**

## :warning: 关于带密码的聊天频道

如果用于覆盖的模版角色，在一个有密码保护的聊天频道中，其他角色**不会**自动获得进入权限，需要输入密码。