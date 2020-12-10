# harvester-gui-plugin-generic

`harvester-gui-plugin-generic` is a base implementation of a harvester GUI plugin created
by Onedata developers. It's main goals:
1. Provide basic functionality for a newly created harvester (it is a default harvester GUI plugin used by Onedata).
2. Allow other developers to create their own GUI plugins using this project as a customizable template to fulfill specific needs.

This plugin is created using Ember.js framework and is compatible with Elasticsearch 7.x harvesting backend.

## About GUI plugins

GUI plugins are used by Onezone GUI to serve and query data stored in a harvester. Each harvester has it's own GUI plugin rendered inside an `iframe` element. Data fetching functions are injected into the `iframe` so the plugin is able to communicate with Onezone and to send queries to the harvesting backend.

Starting from 20.02.1 release of Onedata, default GUI plugin (`harvester-gui-plugin-generic`) is bundled with Onezone service and used for newly created harvesters. A harvester administrator (usually a creator of the harvester) is able to replace that default GUI plugin with a new one - custom or provided by Onedata team - by uploading `.tar.gz` plugin archive via the harvester settings.

## Using custom GUI plugins

This `harvester-gui-plugin-generic` project is a perfect starting point for creating your own GUI plugin - just fork this repository and add new functionality. You can also copy communication mechanisms from this code and add them to your own plugin made from scratch.

Before you upload a custom plugin, you have to contact Onezone administrator and ask to add harvester GUI checksum (from `shasum -a 256 your-plugin.tar.gz`) to `/etc/oz_worker/compatibility.json` configuration file. That checksum is later used by Onezone during the upload package verification process. It prevents from injecting possibly harmfull web applications into the Onedata system.

**WARNING:** Use only GUI plugins, which are whitelisted by the Onezone or are taken from a trusted source. Custom GUI plugins may contain malicious code and using them without caution can cause critical security issues, including **data leaks** and **unauthorized operations**.

## Compatibility

Specific `harvester-gui-plugin-generic` releases are intended to be used only with compatible Onezone versions:

| Onezone version | Compatible GUI plugin versions |
|-----------------|--------------------------------|
| `20.02.1`+      | `1.0.x`                        |

## Project structure

All of the files related to GUI application functionality are located in `src` directory. The structure is typical for Ember.js applications. Styles were written using SCSS, internationalization is provided via `ember-intl`. Files worth noticing:
- communication related mechanisms: `src/services`,
- specification of needed indices, plugin version and default configuration: `src/manifest.json`,
- automated files metadata generator (may be useful for testing): `scripts/generate-demo-metadata.py`,

## Prerequisites

`harvester-gui-plugin-generic` is an Ember.js application, which means you will need the following dependencies properly installed on your computer:

* [Node.js](https://nodejs.org/) (with npm)
* [Ember CLI](https://ember-cli.com/)

Also to run the `harvester-gui-plugin-generic` itself, a fully deployed Onedata system should be available. It will let the harvester plugin interact with a real harvester connected to the Elasticsearch instance and test it's features.


## Building

To build a development release of GUI plugin:

```
cd src && npm run-script build-plugin:dev
```

or a production one:
```
cd src && npm run-script build-plugin
```

In both versions the result plugin will be available under `plugin.tar.gz` file, which is ready to be uploaded via the harvester configuration in Onezone GUI.

## Testing

To start GUI tests:
```
cd src && npm run-script test
```

There is a possibility to run tests using xvfb environment (e.g. on a CI server). In that case you can use:

```
cd src && npm run-script test:xvfb
```
or the same, but with an xunit output (may be useful for automated test results parsers):
```
cd src && npm run-script test:xvfb-xunit-output
```
