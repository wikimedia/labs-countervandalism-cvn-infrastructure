# Set umask 002 for project-cvn
# so that stuff isn't broken (e.g. interacting with git repos)
if groups | grep -w -q project-cvn; then
	umask 0002
else
	umask 0022
fi
