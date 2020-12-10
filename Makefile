SRC_DIR	 ?= src
REL_DIR	 ?= rel
XVFB_ARGS ?= --server-args="-screen 0, 1366x768x24"

.PHONY: deps build_dev build_prod build_plugin_dev build_plugin_prod doc clean test test_xvfb test_xvfb_xunit_output submodules

all: build_plugin_dev

rel: build_plugin_prod

deps:
	cd $(SRC_DIR) && npm run-script deps

build_dev: deps
	cd $(SRC_DIR) && npm run-script build:dev

build_prod: deps
	cd $(SRC_DIR) && npm run-script build

build_plugin_dev: deps
	cd $(SRC_DIR) && npm run-script build-plugin:dev

build_plugin_prod: deps
	cd $(SRC_DIR) && npm run-script build-plugin

clean:
	cd $(SRC_DIR) && npm run-script clean

test: deps
	cd $(SRC_DIR) && npm run-script test

test_xvfb: deps
	cd $(SRC_DIR) && npm run-script test:xvfb

test_xvfb_xunit_output: deps
	cd $(SRC_DIR) && npm run-script test:xvfb-xunit-output

##
## Submodules
##

submodules:
	git submodule sync --recursive ${submodule}
	git submodule update --init --recursive ${submodule}

