import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import QueryResults from 'harvester-gui-plugin-generic/utils/query-results';

describe('Unit | Utility | query-results', function () {
  beforeEach(function () {
    this.rawQueryResults = {
      hits: {
        hits: [{
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
