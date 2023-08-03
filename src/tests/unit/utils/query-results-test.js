import { module, test } from 'qunit';
import QueryResults from 'harvester-gui-plugin-generic/utils/query-results';
import QueryResult from 'harvester-gui-plugin-generic/utils/query-result';
import sinon from 'sinon';
import { settled } from '@ember/test-helpers';
import { resolve } from 'rsvp';

module('Unit | Utility | query-results', hooks => {
  hooks.beforeEach(function () {
    this.rawQueryResults = {
      hits: {
        total: {
          value: 10,
        },
        hits: [{
          _id: 'file123',
          _source: {
            a: {
              b: true,
            },
            c: 'someText',
            e: {
              f: 'anotherText',
            },
          },
        }, {
          _id: 'file456',
          _source: {
            a: [{
              b: false,
            }, {
              b: true,
            }],
            c: 'someText2',
          },
        }],
      },
    };
  });

  test('stores raw results object in "rawResultsObject"', function (assert) {
    const results = new QueryResults(this.rawQueryResults);
    assert.strictEqual(results.rawResultsObject, this.rawQueryResults);
  });

  test('extracts results from raw results object', async function (assert) {
    const urlRequestStub = sinon.stub().callsFake(fileId => resolve(`${fileId}url`));
    const results = new QueryResults(this.rawQueryResults, {
      fileBrowserUrlRequest: urlRequestStub,
    });

    assert.strictEqual(results.totalResultsCount, 10);
    assert.strictEqual(results.results.length, 2);
    results.results.forEach((result, index) => {
      assert.ok(result instanceof QueryResult);
      assert.strictEqual(result.rawObject, this.rawQueryResults.hits.hits[index]);
      assert.notOk(result.fileBrowserUrl);
    });
    await settled();
    assert.strictEqual(results.results[0].fileBrowserUrl, 'file123url');
    assert.strictEqual(results.results[1].fileBrowserUrl, 'file456url');
  });

  test('returns properties tree on "getPropertiesTree()" call', function (assert) {
    const results = new QueryResults(this.rawQueryResults);
    assert.deepEqual(results.getPropertiesTree(), {
      a: {
        b: {},
      },
      c: {},
      e: {
        f: {},
      },
    });
  });
});
