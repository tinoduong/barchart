HR=\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#

#
# BUILD DOCS
#

build:
	@echo "Minifying scripts ..."
	@uglifyjs -nc scripts/mbarchart.js > scripts/mbarchart.min.js
