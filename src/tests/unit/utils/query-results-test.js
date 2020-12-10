import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import QueryResults from 'harvester-gui-plugin-generic/utils/query-results';
import QueryResult from 'harvester-gui-plugin-generic/utils/query-result';
import sinon from 'sinon';
import { settled } from '@ember/test-helpers';
import { resolve } from 'rsvp';

describe('Unit | Utility | query-results', function () {
  beforeEach(function () {
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

  it('stores raw results object in "rawResultsObject"', function () {
    const results = new QueryResults(this.rawQueryResults);
    expect(results.rawResultsObject).to.equal(this.rawQueryResults);
  });

  it('extracts results from raw results object', async function () {
    const urlRequestStub = sinon.stub().callsFake(fileId => resolve(`${fileId}url`));
    const results = new QueryResults(this.rawQueryResults, {
      fileBrowserUrlRequest: urlRequestStub,
    });

    expect(results.totalResultsCount).to.equal(10);
    expect(results.results).to.have.length(2);
    results.results.forEach((result, index) => {
      expect(result).to.be.an.instanceOf(QueryResult);
      expect(result.rawObject).to.equal(this.rawQueryResults.hits.hits[index]);
      expect(result.fileBrowserUrl).to.be.empty;
    });
    await settled();
    expect(results.results[0].fileBrowserUrl).to.equal('file123url');
    expect(results.results[1].fileBrowserUrl).to.equal('file456url');
  });

  it('returns properties tree on "getPropertiesTree()" call', function () {
    const results = new QueryResults(this.rawQueryResults);
    expect(results.getPropertiesTree()).to.deep.equal({
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
