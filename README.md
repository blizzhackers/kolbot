[**Join the Forums!**](https://blizzhackers.discourse.group)

[**Join the Discord Channel!**](https://discord.gg/z844XRhxFC)

[**Join the Slack Channel!**](https://join.slack.com/t/blizzhackers/shared_invite/zt-qahq0w11-uzETJNgKmS9DdApJSRQqaw)

## Table of Contents

- [General](#general)
- [Install Dependencies](#install-dependencies---do-this-first)
- [Required after Download Setup](#required-after-download-setup)
- [Getting Started](#getting-started)
- [Guides](#guides)
- [D2BotNG](#d2botng---alternative-manager)
- [LimeDrop](#limedrop-web-based-item-manager-and-dropper)

## General

1. D2BS, D2Bot#, D2BotNG and kolbot are educational tools with an open source developer community. These tools are meant to be used offline or on private servers that explicitly allow them. These tools are not meant to be abused on battle.net (a Blizzard Entertainment entity).

2. D2BS, D2Bot#, D2BotNG and kolbot are provided as is and for FREE. If you paid or are asked to pay for these tools, do not proceed.

3. These tools are not inteded for cheating, maliciously exploiting, or illegal use of software.

## kolbot

* this name is better known than others, even it is just a part of d2bs (diablo 2 botting system) which contain 3 distinct components:
	* D2BS - core (C++)
	* D2Bot# - manager (C#)
	* D2BotNG - alternative manager (C#)
	* kolbot - script library (JS)

If you want to contribute to kolbot code, make sure you run `npm run lint` for final polish.

If you want to contribute to d2bs/d2bot#, come to irc.synirc.net/d2bs and ask around.

[**Live Docs**](https://bhdocs.github.io/)

[**Documentation Repo**](https://github.com/blizzhackers/documentation#diablo-2-botting-system-d2bs)

## Install dependencies - do this first!
- [Microsoft Visual C++ 2010 Redistributable Package (x86)](https://www.microsoft.com/en-us/download/details.aspx?id=26999)
- [Microsoft .NET Framework 4.0 (or higher)](https://dotnet.microsoft.com/download/dotnet-framework)

## Required after download setup

**kolbot will NOT work without running the setup script first!**

After downloading kolbot, you **MUST** run the setup script before attempting to use the bot:

1. Run `setup.bat` to copy configuration files to their correct locations
2. The script will also initialize Git submodules if Git is available
3. This step is required for kolbot to function properly

To keep your installation updated, you can run `update.bat` at any time to pull the latest changes from the repository and update all submodules.

### What happens if you skip setup:
- Missing configuration files
- You'll see this error: `Please view your exceptions.log file. D2Bot# will close now :(`

## Getting Started
- [download kolbot](https://github.com/blizzhackers/documentation/blob/restructure/d2bot/Download.md#download)
- [d2bot manager setup](https://github.com/blizzhackers/documentation/blob/restructure/d2bot/ManagerSetup.md/#manager-setup)
- [IDE-Setup](https://github.com/blizzhackers/documentation/blob/restructure/kolbot/IDES.md/#code-editors-ides)
- [FAQ](https://github.com/blizzhackers/documentation/blob/restructure/kolbot/FAQ.md/#faq)

## Guides
- [manual playing](https://github.com/blizzhackers/documentation/blob/restructure/kolbot/ManualPlay.md/#manual-playing)
- [multi botting](https://github.com/blizzhackers/documentation/blob/restructure/kolbot/MultiBotting.md/#multi-botting)
- [kolbot-SoloPlay](https://github.com/blizzhackers/kolbot-SoloPlay)
- [character config](https://github.com/blizzhackers/documentation/blob/restructure/kolbot/CharacterConfig.md/#character-configuration)
- [TCP/IP Games](https://github.com/blizzhackers/documentation/blob/restructure/kolbot/TCP-IP%20games.md#tcpip-games)

## D2BotNG - Alternative Manager

[D2BotNG](https://github.com/ResurrectedTrader/D2BotNG) is a modern rewrite of D2Bot# that aims to match existing functionality. Features a dark-themed web UI accessible remotely from any browser, and Discord bot integration. Requires the [.NET 10 Desktop Runtime (x86)](https://dotnet.microsoft.com/en-us/download/dotnet/10.0).

See the [D2BotNG project page](https://github.com/ResurrectedTrader/D2BotNG) for screenshots and details. For issues and feature requests, use the [issue tracker](https://github.com/ResurrectedTrader/D2BotNG/issues).

## LimeDrop web based item manager and dropper

- Limedrop is available by default on the master(trunk) branch.
- [limedrop install and usage](https://github.com/blizzhackers/documentation/tree/master/limedrop#limedrop-guide)


![limedrop-general](https://github.com/blizzhackers/documentation/blob/master/limedrop/assets/limedrop-general.png)
