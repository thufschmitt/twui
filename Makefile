REPORTER = spec
JQUERY_VERSION = 2.1.1.min

test: node_modules
	@NODE_ENV=test ./node_modules/.bin/mocha test/*-test.js --reporter $(REPORTER)

node_modules:
	npm install

deploy: public/js/jquery-$(JQUERY_VERSION).js

public/js/jquery-$(JQUERY_VERSION).js:
	@mkdir -p public/js
	curl http://code.jquery.com/jquery-$(JQUERY_VERSION).js > $@

.PHONY: test deploy
