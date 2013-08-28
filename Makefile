REPORTER = spec

test:
	@./node_modules/.bin/mocha -t 4000 -R spec

.PHONY: test