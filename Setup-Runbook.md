# Setup Runbook

Setting up a new cluster or new server inside that cluster.

## Global (once)

```sh
ssh ANYWHERE.cvn.eqiad1.wikimedia.cloud
umask 0002
#
## Prepare directory structure on on NFS
#
cd /data/project
sudo mkdir cvn-common
sudo chgrp project-cvn cvn-common/
sudo chmod 2775 cvn-common/
mkdir cvn-common/backup/ cvn-common/dropbox/
```

## Server specification

In Horizon (<https://horizon.wikimedia.org/>, <https://wikitech.wikimedia.org/wiki/Help:Horizon_FAQ>):

NOTE: **When in doubt, match the instance that you're replacing.**

* project: `cvn`
* source: latest Debian
* flavour: 
  * cvn-apache: 2 vCPUs, 4 GB RAM (`g4.cores2.ram4.disk20`)
  * cvn-app: 4 vCPUS, 8 GB RAM (`g4.cores4.ram8.disk20`)
* security-groups: 
  * cvn-apache: default, **web**
  * cvn-app: default
* floating-ip:
  * cvn-apache: None
  * cvn-app: Yes, we need this for increased rate limits at Libera Chat IRC.

## Server provision

### All servers

Remember:
* `/data/project` is an NFS mount shared between all servers.
* `/srv` is local to the individual server.

```sh
#
## Ensure the shared "cvn.cvnservice" user exists. https://phabricator.wikimedia.org/T162945#4030092
## The below should return 1 without error.
#
sudo -- sudo -u cvn.cvnservice echo 1
#
## Packages
#
sudo apt-get -y install git nano vim cron rsync
#
## Create local directory structure
#
cd /srv
sudo mkdir cvn
sudo chgrp project-cvn cvn/
sudo chmod 2775 cvn/
mkdir cvn/git/ cvn/services/ cvn/log/
sudo chgrp cvn.cvnservice cvn/services
#
## Add repos
#
cd /srv/cvn/git
git clone https://gerrit.wikimedia.org/r/labs/countervandalism/cvn-infrastructure infrastructure
git clone https://gerrit.wikimedia.org/r/labs/countervandalism/stillalive
#
## Configure profile.d
#
cd /etc/profile.d/
sudo ln -s /srv/cvn/git/infrastructure/environment-config/profile-d-umask-cvn.sh umask-cvn.sh
#
## Configure PATH
#
sudo ln -s /srv/cvn/git/infrastructure/bin/stillalive-disable /usr/local/bin/stillalive-disable
sudo ln -s /srv/cvn/git/infrastructure/bin/stillalive-enable /usr/local/bin/stillalive-enable
#
## Configure stillalive
#
cd /srv/cvn/git/stillalive
ln -s localSettings-cvn.yaml localSettings.yaml
#
## File permissions
#
sudo chown root /srv/cvn/git/infrastructure/crontab-config/*.cron
sudo chmod 644 /srv/cvn/git/infrastructure/crontab-config/*.cron
sudo chown root /srv/cvn/git/infrastructure/bin/*
```

### cvn-apache

```sh
#
## Packages
#
sudo apt-get install -y apache2 libapache2-mod-php php-apcu php-cli php-curl php-mysql php-sqlite3
#
## Add repos
#
cd /srv/cvn/git
git clone https://gerrit.wikimedia.org/r/labs/countervandalism/cvn-api
#
## Create document root
#
ln -s /srv/cvn/git/infrastructure/cvn-docroot /srv/cvn/services/www
ln -s /srv/cvn/git/cvn-api/public_html/api.php /srv/cvn/services/www/api.php
#
## Setup cvn-api
#
sudo ln -s /srv/cvn/git/infrastructure/crontab-config/cvndb-pull.cron /etc/cron.d/cvndb-pull
#
## Configure PHP (e.g. /etc/php/8.2)
#
export CVN_PHP_ETCDIR=$(dirname $(dirname "$(php -r 'echo php_ini_loaded_file();')"));
sudo ln -sf /srv/cvn/git/infrastructure/php-cvn.ini $CVN_PHP_ETCDIR/mods-available/cvn.ini
sudo ln -sf $CVN_PHP_ETCDIR/mods-available/cvn.ini $CVN_PHP_ETCDIR/apache2/conf.d/50-cvn.ini
#
## Configure webserver
#
sudo ln -sf /srv/cvn/git/infrastructure/apache-config/cvn.conf /etc/apache2/sites-available/cvn.conf
sudo ln -sf /etc/apache2/sites-available/cvn.conf /etc/apache2/sites-enabled/100-cvn.conf
sudo apachectl graceful
```

### cvn-app

```sh
#
## Back up data via hourly cron
#
sudo ln -s /srv/cvn/git/infrastructure/bin/backup-wmflabs-node /etc/cron.hourly/cvn-backup-data
#
## Packages
#
# * php-mbstring is required by stillalive (via ulrichsg/getopt-php)
#
sudo apt-get install -y php-cli php-mbstring
#
## Add repos
#
cd /srv/cvn/git
git clone https://gerrit.wikimedia.org/r/labs/countervandalism/CVNBot
cd /srv/cvn/services
mkdir cvnbot
#
## Enable stillalive cron
#
stillalive-enable
```

### cvn-app: CVNClerkBot

One of the two cvn-app servers, we additionally run CVNClerkBot.

```sh
#
## Install CVNClerkBot
#
# Browse repo: https://gerrit.wikimedia.org/g/labs/countervandalism/cvn-clerkbot
#
# Packages
sudo apt-get install -y mariadb-server mariadb-client python3 python3-mysqldb python3-twisted
# Add repo
cd /srv/cvn/git
git clone https://gerrit.wikimedia.org/r/labs/countervandalism/cvn-clerkbot CVNClerkBot
# Configure
cp /srv/cvn/git/infrastructure/clerkbotconfig.py CVNClerkBot/cvnclerkbotconfig.py
# Prepare database
echo "SET PASSWORD FOR 'root'@'localhost' = PASSWORD('root');" | sudo mysql -u root mysql
mysql -u root -proot -e 'CREATE DATABASE cvnclerkbot;'
```

Then, set the correct `password` in `CVNClerkBot/cvnclerkbotconfig.py`. You can copy this from the previous server or from your password manager.

Then, update our public database backup in cvn-infrastructure.git with the latest data from the old server, and merge your commit in Gerrit.

```sh
me@mylaptop:cvn-infrastructure$ ssh cvn-app12.cvn.eqiad1.wikimedia.cloud -- mysqldump cvnclerkbot -u root -proot --extended-insert=FALSE > mysql_cvnclerkbot.sql
me@mylaptop:cvn-infrastructure$ git add -p && git commit -m "Update mysql_cvnclerkbot.sql dump" && git review
```

Then, on the new server, import the database:

```sh
mysql -u root -proot cvnclerkbot < /srv/cvn/git/infrastructure/mysql_cvnclerkbot.sql
```

Then, migrate the bot from the old server to the new server:

* Edit the `pool` property from server PREV to NEW for MyBotName task, in `localSettings-cvn.yaml` in `stillalive.git`
* From [Tasks-Runbook.md](./Tasks-Runbook.md), follow "Deploy a change" on the previous server.
* Quit the bot.
* From [Tasks-Runbook.md](./Tasks-Runbook.md), follow "Deploy a change" and "Force a run" on the previous server.

### cvn-app: CVNBot14

```sh
#
## Enable CVNBot14 cron
#
# NOTE: Only do this after having installed and migrated CVNBot14 with its database to this host.
# as it may otherwise overwrite or delete the NFS dropbox used by cvn-api on cvn-apache.
#
read -r -p $'\nHave you migrated and switched CVNBot14 to this host yet? (y/n) ' answer && [[ $answer == y ]] && sudo ln -s /srv/cvn/git/infrastructure/crontab-config/cvndb-CVNBot14-publish.cron /etc/cron.d/cvndb-CVNBot14-publish
```
