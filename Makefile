REPORTER = spec
JQUERY_VERSION = 2.1.1.min
ANGULAR_VERSION = 1.2.1

test: node_modules
	@NODE_ENV=test ./node_modules/.bin/mocha test/*-test.js --reporter $(REPORTER)

node_modules:
	npm install

deploy: public/js/jquery-$(JQUERY_VERSION).js public/js/angular.min.js public/js/angular-ui-router.min.js

public/js/jquery-$(JQUERY_VERSION).js:
	@mkdir -p public/js
	curl http://code.jquery.com/jquery-$(JQUERY_VERSION).js > $@

public/js/angular.min.js:
	@mkdir -p public/js
	curl http://cdnjs.cloudflare.com/ajax/libs/angular.js/$(ANGULAR_VERSION)/angular.min.js > $@

public/js/angular-ui-router.min.js:
	@mkdir -p public/js
	curl http://angular-ui.github.io/ui-router/release/angular-ui-router.js > $@

.PHONY: test deploy
