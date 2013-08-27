REPORTER = spec

test:
  @./node_modules/.bin/mocha -R spec -t 6000

.PHONY: test