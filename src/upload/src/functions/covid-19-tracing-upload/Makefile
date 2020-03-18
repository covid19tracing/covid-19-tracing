SHELL := /bin/bash
VERSION_TAG := $(shell git describe HEAD)

ifeq ($(VERSION_TAG),)
$(error git describe empty, maybe no tags present? do also push them!)
endif

.PHONY: help
help: ## help message, list all command
	@echo -e "$$(grep -hE '^\S+:.*##' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)"

.PHONY: run
run:  ## run the function
	npm start

.PHONY: watch-run
 watch-run:  ## run and watch code changes for the function
	npm run watch

