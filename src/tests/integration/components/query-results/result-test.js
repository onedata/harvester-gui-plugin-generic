import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import QueryResult from 'harvester-gui-plugin-generic/utils/query-result';

describe('Integration | Component | query-results/result', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('queryResult', new QueryResult({
      _source: {
        a: {
          b: true,
        },
        c: 'someText',
        e: {
          f: 'anotherText',
        },
        g: {
          h: {
            i: 1,
            j: 2,
            k: 3,
          },
        },
        l: {
          m: [{
            n: [{
              o: {
                p: 1,
                q: 'abc',
              },
            }, {
              o: {
                p: 2,
                q: 'def',
                r: 'ghi',
              },
            }],
          }],
        },
        __onedata: {
          fileName: 'abc.txt',
        },
      },
    }));
  });

  it('has class "query-results-result" and is a <li> element', async function () {
    await render(hbs `<QueryResults::Result />`);

    expect(this.element.querySelector('li.query-results-result')).to.exist;
  });

  it('shows file name', async function () {
    this.set('filteredProperties', {});
    await render(hbs `<QueryResults::Result @queryResult={{this.queryResult}}/>`);

    expect(this.element.querySelector('.file-name').textContent.trim())
      .to.equal('abc.txt');
  });

  it('shows no fields, when none are specified as visible', async function () {
    this.set('filteredProperties', {});
    await render(hbs `<QueryResults::Result
      @queryResult={{this.queryResult}}
      @filteredProperties={{this.filteredProperties}}
    />`);

    expect(this.element.querySelector('.fields-visualiser')).to.not.exist;
  });

  [{
    description: 'shows single not nested property',
    filteredProperties: {
      c: {},
    },
    results: [{
      key: 'c',
      value: '"someText"',
    }],
  }, {
    description: 'shows single nested property',
    filteredProperties: {
      e: {
        f: {},
      },
    },
    results: [{
      key: 'e.f',
      value: '"anotherText"',
    }],
  }, {
    description: 'shows multiple nested properties',
    filteredProperties: {
      a: {
        b: {},
      },
      c: {},
      e: {
        f: {},
      },
    },
    results: [{
      key: 'a.b',
      value: 'true',
    }, {
      key: 'c',
      value: '"someText"',
    }, {
      key: 'e.f',
      value: '"anotherText"',
    }],
  }, {
    description: 'shows multiple double-nested properties',
    filteredProperties: {
      g: {
        h: {
          i: {},
          k: {},
        },
      },
    },
    results: [{
      key: 'g.h.i',
      value: '1',
    }, {
      key: 'g.h.k',
      value: '3',
    }],
  }, {
    description: 'shows multiple properties nested in arrays',
    filteredProperties: {
      l: {
        m: {
          n: {
            o: {
              p: {},
              q: {},
            },
          },
        },
      },
    },
    results: [{
      key: 'l.m',
      value: '[{"n":[{"o":{"p":1,"q":"abc"}},{"o":{"p":2,"q":"def"}}]}]',
    }],
  }, {
    description: 'does not show properties nested in arrays, which are empty',
    filteredProperties: {
      l: {
        m: {
          n: {
            o: {
              r: {},
            },
          },
        },
      },
    },
    results: [{
      key: 'l.m',
      value: '[{"n":[{"o":{"r":"ghi"}}]}]',
    }],
  }, {
    description: 'does not show anything when all properties nested in arrays are empty',
    filteredProperties: {
      l: {
        m: {
          n: {
            o: {
              not_exist: {},
            },
          },
        },
      },
    },
    results: [],
  }].forEach(({ description, filteredProperties, results }) => {
    it(description, async function () {
      this.set('filteredProperties', filteredProperties);
      await render(hbs `<QueryResults::Result
        @queryResult={{this.queryResult}}
        @filteredProperties={{this.filteredProperties}}
      />`);

      const properties = this.element.querySelectorAll('.fields-visualiser .property');
      expect(properties).to.have.length(results.length);
      results.forEach(({ key, value }, index) => {
        expect(properties[index].querySelector('.property-name').textContent.trim())
          .to.equal(key);
        expect(properties[index].querySelector('.property-value').textContent.trim())
          .to.equal(value);
      });
    });
  });
});
