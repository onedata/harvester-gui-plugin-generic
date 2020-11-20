import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import QueryResult from 'harvester-gui-plugin-generic/utils/query-result';
import { click } from '@ember/test-helpers';
import { resolve } from 'rsvp';

describe('Integration | Component | query-results/result', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('queryResult', new QueryResult({
      _id: 'file123',
      _source: {
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
        // "a" key is at the end to test keys sorting
        a: {
          b: true,
        },
      },
    }, {
      fileBrowserUrlRequest: () => resolve('fileUrl'),
    }));
  });

  it('has class "query-results-result" and is a <li> element', async function () {
    await render(hbs `<QueryResults::Result />`);

    expect(this.element.querySelector('li.query-results-result')).to.exist;
  });

  it('shows "Go to file" link with file name included', async function () {
    await render(hbs `<QueryResults::Result @queryResult={{this.queryResult}}/>`);

    const linkNode = this.element.querySelector('.go-to-file-link');
    expect(linkNode).to.exist;
    expect(linkNode.textContent.trim()).to.equal('Go to source file "abc.txt"');
    expect(linkNode).to.have.attr('href', 'fileUrl');
  });

  it(
    'shows "Go to file" link without file name, when name is not available',
    async function () {
      this.queryResult.fileName = undefined;

      await render(hbs `<QueryResults::Result @queryResult={{this.queryResult}}/>`);

      const linkNode = this.element.querySelector('.go-to-file-link');
      expect(linkNode).to.exist;
      expect(linkNode.textContent.trim()).to.equal('Go to source file');
      expect(linkNode).to.have.attr('href', 'fileUrl');
    }
  );

  it('has copy button with file id', async function () {
    await render(hbs `<QueryResults::Result @queryResult={{this.queryResult}}/>`);

    const copyBtn = this.element.querySelector('.copy-file-id');
    expect(copyBtn).to.exist;
    expect(copyBtn.textContent.trim()).to.equal('File ID');
    expect(copyBtn).to.have.attr('data-clipboard-text', 'file123');
  });

  [{
    description: 'shows stringified json in header',
    filteredProperties: {},
    json: 'a: {b: true}, c: "someText", e: {f: "anotherText"}, g: {h: {i: 1, j: 2, k: 3}}, l: {m: [{n: [{o: {p: 1, q: "abc"}}, {o: {p: 2, q: "def", r: "ghi"}}]}]}, __onedata: {fileName: "abc.txt"}',
  }, {
    description: 'shows stringified json in header filtered to single not nested property',
    filteredProperties: {
      c: {},
    },
    json: 'c: "someText"',
  }, {
    description: 'shows stringified json in header filtered to single nested property',
    filteredProperties: {
      e: {
        f: {},
      },
    },
    json: 'e: {f: "anotherText"}',
  }, {
    description: 'shows stringified json in header filtered to multiple nested properties',
    filteredProperties: {
      a: {
        b: {},
      },
      c: {},
      e: {
        f: {},
      },
    },
    json: 'a: {b: true}, c: "someText", e: {f: "anotherText"}',
  }, {
    description: 'shows stringified json in header filtered to multiple double-nested properties',
    filteredProperties: {
      g: {
        h: {
          i: {},
          k: {},
        },
      },
    },
    json: 'g: {h: {i: 1, k: 3}}',
  }, {
    description: 'shows stringified json in header filtered to multiple properties nested in arrays',
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
    json: 'l: {m: [{n: [{o: {p: 1, q: "abc"}}, {o: {p: 2, q: "def"}}]}]}',
  }, {
    description: 'does not show in-array objects emptied by filters in stringified and filtered json in header',
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
    json: 'l: {m: [{n: [{o: {r: "ghi"}}]}]}',
  }, {
    description: 'does not show anything when all in-array objects are emptied by filters in stringified and filtered json in header',
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
    json: 'No match.',
  }].forEach(({ description, filteredProperties, json }) => {
    it(description, async function () {
      this.set('filteredProperties', filteredProperties);
      await render(hbs `<QueryResults::Result
        @queryResult={{this.queryResult}}
        @filteredProperties={{this.filteredProperties}}
      />`);

      expect(this.element.querySelector('.result-sample').textContent.trim())
        .to.equal(json);
    });
  });

  it('is collapsed on init', async function () {
    await render(hbs `<QueryResults::Result
      @queryResult={{this.queryResult}}
    />`);

    expect(this.element.querySelector('.result-representations-collapse'))
      .to.not.have.class('show');
  });

  it('expands on header click', async function () {
    await render(hbs `<QueryResults::Result
      @queryResult={{this.queryResult}}
    />`);
    await click('.result-heading');

    expect(this.element.querySelector('.result-representations-collapse'))
      .to.have.class('show');
  });

  it('has "table" tab active by default', async function () {
    await render(hbs `<QueryResults::Result
      @queryResult={{this.queryResult}}
    />`);

    expect(this.element.querySelector('.tab-pane.active .properties-table')).to.exist;
  });

  it('shows data in table', async function () {
    await render(hbs `<QueryResults::Result
      @queryResult={{this.queryResult}}
    />`);

    const expectedProperties = [{
      key: 'a.b',
      value: 'true',
    }, {
      key: 'c',
      value: '"someText"',
    }, {
      key: 'e.f',
      value: '"anotherText"',
    }, {
      key: 'g.h.i',
      value: '1',
    }, {
      key: 'g.h.j',
      value: '2',
    }, {
      key: 'g.h.k',
      value: '3',
    }, {
      key: 'l.m',
      value: '[{n: [{o: {p: 1, q: "abc"}}, {o: {p: 2, q: "def", r: "ghi"}}]}]',
    }, {
      key: '__onedata.fileName',
      value: '"abc.txt"',
    }];
    const properties = this.element.querySelectorAll('.properties-table .property');
    expect(properties).to.have.length(expectedProperties.length);
    expectedProperties.forEach(({ key, value }, index) => {
      expect(properties[index].querySelector('.property-name').textContent.trim())
        .to.equal(key);
      expect(properties[index].querySelector('.property-value').textContent.trim())
        .to.equal(value);
    });
  });

  it('shows raw JSON in textarea', async function () {
    await render(hbs `<QueryResults::Result
      @queryResult={{this.queryResult}}
    />`);

    expect(this.element.querySelector('.json-textarea').textContent.trim())
      .to.equal(JSON.stringify(this.queryResult.source, null, 2));
  });
});
