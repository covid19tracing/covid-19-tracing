SHELL := /bin/bash

.PHONY: help
help: ## This help message
	@echo -e "$$(grep -hE '^\S+:.*##' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)"

.PHONY: build 
build: ## run hugo in a docker to generate the page in public
	docker-compose up hugobuild

.PHONY: watch 
watch: ## run hugo in a docker to generate the page in public
	docker-compose up hugowatch
