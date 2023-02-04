# EVE Settings Manager

用于管理EVE Online本地设置文件的第三方工具

从旧项目[ESAM](https://github.com/mintnick/ESAM)升级，用Electron重构并添加了一些新功能。

当前状态：公开测试 :test_tube:

![Screen Shot 2023-02-04 at 16 32 53](https://user-images.githubusercontent.com/14357052/216757533-494e13b2-aafd-423a-954f-301d08b2236b.png)

## 使用方法

1. 下载并解压缩
2. 运行软件
3. :warning: 建议：先进行备份
    1. 点击“打开文件夹”
    2. 将文件夹中的设置文件复制粘贴到一个单独的文件夹中
    3. 如需恢复，把备份的文件放回文件夹内

## 功能

- 选择一个设置文件作为模版
  - 覆盖其它所有文件
  - 覆盖选定的文件
- 获取并缓存用户名
- 添加备注信息
- 支持简/繁中文和英语
- 支持宁静、晨曦、测试服等（部分服务器尚未测试）

## 卸载

1. 删除软件
2. (可选)删除缓存文件
    - Windows: 删除 **C:\用户\\\<User>\AppData\Local\eve-settings-manager**
    - Mac: 删除 **\<User>/Library/Application Support/eve-settings-manager**