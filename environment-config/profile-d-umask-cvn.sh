# Inspired by WMF puppet
# https://gerrit.wikimedia.org/g/operations/puppet/+/ba2083cc3c4b64c1b48f9e60317b40847ecb1aee/modules/deployment/files/umask-wikidev-profile-d.sh
# -------

# Set umask 002 for project-cvn
# so that stuff isn't broken (e.g. interacting with git repos)
if groups | grep -w -q project-cvn; then
	umask 0002
else
	umask 0022
fi
