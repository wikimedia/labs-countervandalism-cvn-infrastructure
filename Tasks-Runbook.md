# Task

## stillalive

Browse repo: https://gerrit.wikimedia.org/g/labs/countervandalism/stillalive

### Quit a bot

First try to quite it by writing `MyBotName quit` to the `#cvn-bots` channel on IRC.

If that doesn't work:
* Connect over SSH to the server where the bot is enabled according to stillalive settings.
* `ssh cvn-appXX.cvn.eqiad1.wikimedia.cloud`
* Find the process id, and terminate it
  ```
  $ ps aux | grep MyBotName
  sudo kill MY_PID
  ```

The bot should restart within 5 minutes via the stillalive cron.

### Deploy a change

After you've made a change to the settings file in the Git repository,
deploy it to one or both cvn-app servers as needed.

* `ssh cvn-appXX.cvn.eqiad1.wikimedia.cloud`
* `cd /srv/cvn/git/stillalive`
* `git pull`
* Optional: Force a run or wait upto 5 minutes.

### Force a run

```sh
sudo /srv/cvn/git/stillalive/bin/stillalive --pool=$(hostname)
```

### Disable stillalive

```sh
stillalive-disable
```

**Remember to re-enable it** afterwards with:

```sh
stillalive-enable
```

### Add a new CVNBot

Follow installation instructions for CVNBot and run it manually on the new server first. Once that works to your satisfaction, quit it, and let it run via stillalive.

* Add a task for MyBotName to `localSettings-cvn.yaml` in `stillalive.git`
* Follow "Deploy a change"
* Follow "Force a run"

### Move a CVNBot

Change on which server a process is pooled.

* Edit the `pool` property from server PREV to NEW for MyBotName task, in `localSettings-cvn.yaml` in `stillalive.git`
* Follow "Deploy a change" on the previous server (so that it won't restart)
* Quit a bit on the previous server.
* Copy the bot (while it is not running) to the new server using our NFS as temporary dropbox
  ```sh
  ssh PREVIOUS.cvn.eqiad1.wikimedia.cloud
  rsync -v -c -a --delete-delay --compress /srv/cvn/services/cvnbot/MyBotName /data/project/cvn-common/dropbox/
  ```
  ```sh
  ssh NEW.cvn.eqiad1.wikimedia.cloud
  rsync -v -c -a --delete-delay --compress /data/project/cvn-common/dropbox/MyBotName /srv/cvn/services/cvnbot/
  ```
* Folow "Deploy a change" and "Force a run" on the new server.

### Remove a CVNBot

* Remove the task from  `localSettings-cvn.yaml` in `stillalive.git`
* Follow "Deploy a change"
* Follow "Quit a bot". This step is needed because stillalive only starts processes, it does quit or otherwise interfere with existing processes. After you remove the task, it no longer knows about it. This also avoids breaking your processes while debugging.

## CVNBot

Browse repo: https://gerrit.wikimedia.org/g/labs/countervandalism/CVNBot

### Install CVNBot

```sh
ssh cvn-appXX.cvn.eqiad1.wikimedia.cloud
cd /srv/cvn/git/CVNBot
git remote update && git reset --hard origin/master && git clean -dffx
```

Follow https://gerrit.wikimedia.org/g/labs/countervandalism/CVNBot/+/HEAD/docs/install.md

Edit the new CVNBot.ini as follows:

```ini
botnick=CVNBot1
botpass=CVNBots-A:***
botrealname=#cvn-sandbox CVNBot
partmsg=https://meta.wikimedia.org/wiki/CVN

ircserver=irc.libera.chat
controlchannel=#cvn-bots
feedchannel=#cvn-sandbox
broadcastchannel=#cvn-broadcast

lists=./Lists.sqlite
projects=./Projects.xml
logsyslog=1
```

* Set `botnick` and `botpass` with the nickname and NickServ account from https://meta.wikimedia.org/wiki/Countervandalism_Network/Bots#Nick_management and the password from either another bot/server or from your password manager.
* Set `feedchannel` to the desired channel name.
* Set `botrealname` to include the feed channel.
* Set `logsyslog=1`.

If you're migrating data from an old bot:

```sh
cp /path/to/oldbot/{CVNBot.ini,Lists.sqlite,Projects.xml,Console.msgs} .
```

If the bot has a custom `Console.msgs` file, make sure to declare that in CVNBot.ini.

Ensure permissions and group ownership is set correctly after copying data from an existing bot.

```sh
chmod 660 CVNBot.ini
chmod 664 Console.msgs
chmod 775 Lists.sqlite
chmod 664 Projects.xml
```

### Upgrade CVNBot

```sh
ssh cvn-appXX.cvn.eqiad1.wikimedia.cloud
cd /srv/cvn/git/CVNBot
# Fetch the latest code and remove any local modifications or build artefacts
git remote update && git reset --hard origin/master && git clean -dffx
```

Then, restart bot on IRC. Or, if the bot is unresponsive or you have duplicates:
* Quit the bot via `ps` and `kill`
* Start it via `sudo /srv/cvn/git/stillalive/bin/stillalive --pool=$(hostname)`
* Follow "Monitor CVNBot"

### Monitor CVNBot

```sh
ssh cvn-appXX.cvn.eqiad1.wikimedia.cloud
# Open a log of recent logs from all CVNBot instances, updating in real time:
sudo tail -n1000 -f /var/log/syslog | fgrep cvnbot

# Find recent warnings and errors from any CVNBot:
sudo tail -n1000 -f /var/log/syslog | fgrep cvnbot | grep -v ': INFO '

# Find errors from any CVNBot:
sudo tail -n1000 -f /var/log/syslog | fgrep cvnbot | grep -E ': (ERROR|FATAL) '

# Find errors from any CVNBot (including yesterday):
sudo tail -n1000 -f /var/log/syslog{,.1} | fgrep cvnbot | grep -E ': (ERROR|FATAL) '

# Show last 10 log messages grouped by bot
alias cvnlog='for dir in `ls -d /srv/cvn/services/cvnbot/* | sort -V`; do name=$(basename "$dir"); echo; echo "# $name"; (sudo cat /var/log/syslog | grep -F "[$name]" | tail -n10); done;'
cvnlog
```
