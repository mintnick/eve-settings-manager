# EVE Settings Manager

[中文文档](/docs/README_CN.md)

A third party tool that manages EVE Online local setting files.

Refactor and upgrade from my previous project [ESAM](https://github.com/mintnick/ESAM), inspired by [EANM](https://github.com/FontaineRiant/EANM).

Newest version: v1.1.1

## Contributors

<a href="https://kentcdodds.com"><img src="https://avatars.githubusercontent.com/u/81599?v=4?s=100" width="80px;" alt="David Roden"/><br /><sub><b>David Roden</b></sub></a>

## Screenshot

![Screenshot 2024-01-31 at 07 48 24](https://github.com/mintnick/eve-settings-manager/assets/14357052/291cff8b-4b5b-4ffe-b65a-297afb0768aa)

## Usage

1. Download and unzip
    - for MacOS: you can either run the .app file directly, or install it with .dmg file
2. Run the program, select the setting folder and profile you are using
3. (Optional) Use "Backup" button to prepare a backup
4. Select one as base profile
    - overwrite all other profiles
    - overwrite selected profiles

## Other Features

- Fetch and save character names
- Add notes to characters and accounts
- Support English and Simplified/Tranditional Chinese
- Support Tranquility, Serenity, Singularity, Infinity (aka Dawn/曙光, new China server), Thunderdome

## Uninstall

1. Delete the executable file
2. (Optional) Delete the config file:
    - Windows: Delete **C:\Users\\\<User>\AppData\Roaming\eve-settings-manager**
    - Mac: Delete **\<User>/Library/Application Support/eve-settings-manager**

## :warning: About Chat Channel Password

If the base character is in a password-protected chat channel, the other characters won't grant permission automatically, but require entering password.