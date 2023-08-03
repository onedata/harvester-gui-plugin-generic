import Application from '../app';
import config from '../config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup as setupQUnitDom } from 'qunit-dom';
import { setup as setupQUnitAssertionsExtra } from 'qunit-assertions-extra';
import { start } from 'ember-qunit';

setApplication(Application.create(config.APP));

setupQUnitDom(QUnit.assert);
setupQUnitAssertionsExtra(QUnit.assert);

start();
