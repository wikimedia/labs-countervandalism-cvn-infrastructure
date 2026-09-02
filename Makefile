#
# Usage:
#
# $ make megatable
#

all: megatable

megatable:
	@ curl -s --fail 'https://noc.wikimedia.org/conf/dblists/large.dblist' > cvn-docroot/megatable/var/large.dblist
	@ curl -s --fail 'https://noc.wikimedia.org/conf/InitialiseSettings.php.txt' > cvn-docroot/megatable/var/InitialiseSettings.php.txt
