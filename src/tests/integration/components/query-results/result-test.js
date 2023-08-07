import { module, test } from 'qunit';
import { setupRenderingTest } from '../../../helpers';
import { render, click, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import QueryResult from 'harvester-gui-plugin-generic/utils/query-result';
import { resolve } from 'rsvp';

module('Integration | Component | query-results/result', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
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

  test('has class "query-results-result" and is a <li> element', async function (assert) {
    await render(hbs `<QueryResults::Result />`);

    assert.ok(find('li.query-results-result'));
  });

  test('shows "Go to file" link with file name included', async function (assert) {
    await render(hbs `<QueryResults::Result @queryResult={{this.queryResult}}/>`);

    const linkNode = find('.go-to-file-link');
    assert.ok(linkNode);
    assert.dom(linkNode).hasText('Go to source file "abc.txt"');
    assert.dom(linkNode).hasAttribute('href', 'fileUrl');
  });

  test(
    'shows "Go to file" link without file name, when name is not available',
    async function (assert) {
      this.queryResult.fileName = undefined;

      await render(hbs `<QueryResults::Result @queryResult={{this.queryResult}}/>`);

      const linkNode = find('.go-to-file-link');
      assert.ok(linkNode);
      assert.dom(linkNode).hasText('Go to source file');
      assert.dom(linkNode).hasAttribute('href', 'fileUrl');
    }
  );

  test('has copy button with file id', async function (assert) {
    await render(hbs `<QueryResults::Result @queryResult={{this.queryResult}}/>`);

    const copyBtn = find('.copy-file-id');
    assert.ok(copyBtn);
    assert.dom(copyBtn).hasText('File ID');
    assert.dom(copyBtn).hasAttribute('data-clipboard-text', 'file123');
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
    test(description, async function (assert) {
      this.set('filteredProperties', filteredProperties);
      await render(hbs `<QueryResults::Result
        @queryResult={{this.queryResult}}
        @filteredProperties={{this.filteredProperties}}
      />`);

      assert.dom(find('.result-sample')).hasText(json);
    });
  });

  test('is collapsed on init', async function (assert) {
    await render(hbs `<QueryResults::Result
      @queryResult={{this.queryResult}}
    />`);

    assert.dom(find('.result-representations-collapse')).doesNotHaveClass('show');
  });

  test('expands on header click', async function (assert) {
    await render(hbs `<QueryResults::Result
      @queryResult={{this.queryResult}}
    />`);
    await click('.result-heading');

    assert.dom(find('.result-representations-collapse')).hasClass('show');
  });

  test('has "table" tab active by default', async function (assert) {
    await render(hbs `<QueryResults::Result
      @queryResult={{this.queryResult}}
    />`);

    assert.ok(find('.tab-pane.active .properties-table'));
  });

  test('shows data in table', async function (assert) {
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
    const properties = findAll('.properties-table .property');
    assert.strictEqual(properties.length, expectedProperties.length);
    expectedProperties.forEach(({ key, value }, index) => {
      assert.dom(properties[index].querySelector('.property-name')).hasText(key);
      assert.dom(properties[index].querySelector('.property-value')).hasText(value);
    });
  });

  test('shows raw JSON in textarea', async function (assert) {
    await render(hbs `<QueryResults::Result
      @queryResult={{this.queryResult}}
    />`);

    assert.dom(find('.json-textarea'))
      .hasText(JSON.stringify(this.queryResult.source, null, 2));
  });
});
