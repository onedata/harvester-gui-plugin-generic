SRC_DIR	 ?= src
REL_DIR	 ?= rel
XVFB_ARGS ?= --server-args="-screen 0, 1366x768x24"

.PHONY: deps build_dev build_prod build_plugin_dev build_plugin_prod doc clean test test_xvfb test_xvfb_xunit_output submodules

all: build_dev

rel: build_prod

deps:
	cd $(SRC_DIR) && npm install --no-package-lock

build_dev: deps
	cd $(SRC_DIR) && ember build --environment=development --output-path=../$(REL_DIR)

build_prod: deps
	cd $(SRC_DIR) && ember build --environment=production --output-path=../$(REL_DIR)

build_plugin_dev: build_dev
	tar -czf plugin.tar.gz $(REL_DIR)

build_plugin_prod: build_prod
	tar -czf plugin.tar.gz $(REL_DIR)

clean:
	cd $(SRC_DIR) && rm -rf node_modules dist tmp ../$(REL_DIR)/*

test: deps
	cd $(SRC_DIR) && ember test

test_xvfb: deps
	cd $(SRC_DIR) && xvfb-run $(XVFB_ARGS) ember test

test_xvfb_xunit_output: deps
	cd $(SRC_DIR) && xvfb-run $(XVFB_ARGS) ember test -r xunit

##
## Submodules
##

submodules:
	git submodule sync --recursive ${submodule}
	git submodule update --init --recursive ${submodule}

