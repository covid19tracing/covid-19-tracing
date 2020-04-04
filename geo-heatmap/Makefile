SHELL := /bin/bash

BUCKET := gs://covid-19-tracing-location-history
LOCALDATAFILESDIR := ./datafiles
MAPHUGO := ../website-hugo/src/static/map/heatmap.html

.PHONY: help
help: ## This help message
	@echo -e "$$(grep -hE '^\S+:.*##' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)"

.PHONY: datasync 
datasync: ## download all new json data files
	gsutil rsync -r $(BUCKET) $(LOCALDATAFILESDIR)

.PHONY: map 
map: ## create the map based on all json files
	python3 GenerateMap.py

.PHONY: copymap2hugo 
copymap2hugo: ## copy heatmap to hugo live server
	cp heatmap.html $(MAPHUGO)

.PHONY: jupiter2python 
jupiter2python: ## convert jupiter file to python file
	jupyter nbconvert --to script *.ipynb

.PHONY: deploy 
deploy: datasync map copymap2hugo ## fetch data, generate and deploy map
	git add $(MAPHUGO)
	git commit -m "map generated and updated"
	git push