import { module, test } from 'qunit';
import { setupRenderingTest } from '../../helpers';
import { render, click, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import QueryResults from 'harvester-gui-plugin-generic/utils/query-results';
import { selectChoose } from '../../helpers/ember-power-select';
import { all as allFulfilled, resolve, Promise } from 'rsvp';
import sinon from 'sinon';
import EsIndex from 'harvester-gui-plugin-generic/utils/es-index';

module('Integration | Component | query-results', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.queryResults = new QueryResults({
      hits: {
        total: {
          value: 2,
        },
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
              bb: false,
            }],
            c: 'someText2',
          },
        }],
      },
    });
    this.queryResultsPromise = resolve(this.queryResults);
    this.index = new EsIndex({
      mappings: {
        properties: {
          a: {
            type: 'object',
            properties: {
              b: {
                type: 'boolean',
              },
            },
          },
          c: {
            type: 'text',
            fields: {
              d: {
                type: 'keyword',
              },
            },
          },
          e: {
            type: 'nested',
            properties: {
              f: {
                type: 'text',
              },
            },
          },
        },
      },
    });
  });

  test('renders results', async function (assert) {
    await render(hbs `<QueryResults @queryResultsPromise={{this.queryResultsPromise}}/>`);

    const results = findAll('.query-results-result');
    assert.strictEqual(results.length, 2);
    assert.contains(results[0].textContent, 'anotherText');
    assert.contains(results[1].textContent, 'someText2');
  });

  test(
    'shows "loading" placeholder view when query results are loading',
    async function (assert) {
      this.queryResultsPromise = new Promise(() => {});

      await render(hbs `<QueryResults @queryResultsPromise={{this.queryResultsPromise}}/>`);

      assert.dom(find('.query-results-placeholder')).hasClass('mode-loading');
    }
  );

  test('shows "empty" placeholder view when query results are empty',
    async function (assert) {
      this.queryResultsPromise = resolve(new QueryResults({
        hits: {
          hits: [],
        },
      }));

      await render(hbs `<QueryResults @queryResultsPromise={{this.queryResultsPromise}}/>`);

      assert.dom(find('.query-results-placeholder')).hasClass('mode-empty');
    }
  );

  test('filters properties', async function (assert) {
    await render(hbs `<QueryResults @queryResultsPromise={{this.queryResultsPromise}}/>`);
    await click('.show-properties-selector');
    // expand all nodes
    await allFulfilled(
      [...document.querySelectorAll(
        '.filtered-properties-selector-body .tree .toggle-icon'
      )]
      .map(element => click(element))
    );
    const firstBranchLastCheckbox = document.querySelectorAll(
      '.filtered-properties-selector-body .tree > .tree-branch > .tree-node:first-child > .tree-branch .one-checkbox'
    )[1];
    await click(firstBranchLastCheckbox);

    const resultSamples = findAll('.result-sample');
    assert.dom(resultSamples[0]).hasText('No match.');
    assert.dom(resultSamples[1]).hasText('a: [{bb: false}]');
  });

  test('does not notify about changed filtered properties on init',
    async function (assert) {
      this.changeSpy = sinon.spy();

      await render(hbs `<QueryResults
        @queryResultsPromise={{this.queryResultsPromise}}
        @onFilteredPropertiesChange={{this.changeSpy}}
      />`);

      assert.ok(this.changeSpy.notCalled);
    }
  );

  test('notifies about changed filtered properties', async function (assert) {
    this.changeSpy = sinon.spy();

    await render(hbs `<QueryResults
      @queryResultsPromise={{this.queryResultsPromise}}
      @onFilteredPropertiesChange={{this.changeSpy}}
    />`);
    await click('.show-properties-selector');
    await click(document.querySelector('.select-all'));

    assert.ok(this.changeSpy.calledOnce);
    assert.deepEqual(this.changeSpy.lastCall.args[0], {
      a: {
        b: {},
        bb: {},
      },
      c: {},
      e: {
        f: {},
      },
    });
  });

  test('has no pagination controls when query results are empty',
    async function (assert) {
      this.queryResultsPromise = resolve(new QueryResults({
        hits: {
          hits: [],
        },
      }));

      await render(hbs `<QueryResults @queryResultsPromise={{this.queryResultsPromise}}/>`);

      assert.notOk(find('.query-results-pagination'));
    }
  );

  test('has two pagination controls when query results are not empty',
    async function (assert) {
      await render(hbs `<QueryResults @queryResultsPromise={{this.queryResultsPromise}}/>`);

      assert.strictEqual(
        findAll('.query-results-pagination').length,
        2
      );
    }
  );

  ['top', 'bottom'].forEach((paginationPosition, index) => {
    test(
      `has page set to a value passed on init (${paginationPosition} pagination control)`,
      async function (assert) {
        await render(hbs `<QueryResults
          @queryResultsPromise={{this.queryResultsPromise}}
          @activePageNumber={{5}}
        />`);

        const activePageInput = this.element
          .querySelectorAll('.query-results-pagination .active-page-number')[index];
        assert.dom(activePageInput).hasValue('5');
      }
    );

    test(
      `has page size set to a value passed on init (${paginationPosition} pagination control)`,
      async function (assert) {
        await render(hbs `<QueryResults
          @queryResultsPromise={{this.queryResultsPromise}}
          @pageSize={{25}}
        />`);

        const pageSize = findAll(
          '.query-results-pagination .page-size-selector .ember-power-select-selected-item'
        )[index];
        assert.dom(pageSize).hasText('25');
      }
    );

    test(
      `shows correct number of pages for a small results set (${paginationPosition} pagination control)`,
      async function (assert) {
        await render(hbs `<QueryResults
          @queryResultsPromise={{this.queryResultsPromise}}
          @pageSize={{10}}
        />`);

        const pagesCount = findAll(
          '.query-results-pagination .pages-count'
        )[index];
        assert.dom(pagesCount).hasText('1');
      }
    );

    test(
      `shows correct number of pages for a large results set (${paginationPosition} pagination control)`,
      async function (assert) {
        this.queryResults.totalResultsCount = 50;
        await render(hbs `<QueryResults
          @queryResultsPromise={{this.queryResultsPromise}}
          @pageSize={{10}}
        />`);

        const pagesCount = findAll(
          '.query-results-pagination .pages-count'
        )[index];
        assert.dom(pagesCount).hasText('5');
      }
    );

    test(
      `notifies about page change (${paginationPosition} pagination control)`,
      async function (assert) {
        this.queryResults.totalResultsCount = 50;
        this.changeSpy = sinon.spy();

        await render(hbs `<QueryResults
          @queryResultsPromise={{this.queryResultsPromise}}
          @pageSize={{10}}
          @onPageChange={{this.changeSpy}}
        />`);
        const nextBtn = findAll(
          '.query-results-pagination .next-page'
        )[index];
        await click(nextBtn);

        assert.ok(this.changeSpy.calledOnce);
        assert.ok(this.changeSpy.calledWith(2));
      }
    );

    test(
      `notifies about page size change (${paginationPosition} pagination control)`,
      async function (assert) {
        this.changeSpy = sinon.spy();

        await render(hbs `<QueryResults
          @queryResultsPromise={{this.queryResultsPromise}}
          @pageSize={{10}}
          @onPageSizeChange={{this.changeSpy}}
        />`);
        const pageSizeSelector = findAll(
          '.query-results-pagination .page-size-selector'
        )[index];
        await selectChoose(pageSizeSelector, '50');

        assert.ok(this.changeSpy.calledOnce);
        assert.ok(this.changeSpy.calledWith(50));
      }
    );
  });

  test('has sort selector set to values passed to the component',
    async function (assert) {
      await render(hbs `<QueryResults
        @index={{this.index}}
        @queryResultsPromise={{this.queryResultsPromise}}
        @sortProperty={{this.index.properties.a.properties.b}}
        @sortDirection="asc"
      />`);

      assert.dom(find(
        '.property-selector .ember-power-select-selected-item'
      )).hasText('a.b');
      assert.dom(find(
        '.direction-selector .ember-power-select-selected-item'
      )).hasText('asc');
    }
  );

  test('notifies about sort property change', async function (assert) {
    this.changeSpy = sinon.spy();

    await render(hbs `<QueryResults
      @index={{this.index}}
      @queryResultsPromise={{this.queryResultsPromise}}
      @sortProperty={{this.index.properties.a.properties.b}}
      @sortDirection="desc"
      @onSortChange={{this.changeSpy}}
    />`);

    await selectChoose('.property-selector', 'c.d');
    const changeMatcher = sinon.match({
      direction: 'desc',
      property: sinon.match.same(this.index.properties.c.properties.d),
    });
    assert.ok(this.changeSpy.calledOnce);
    assert.ok(this.changeSpy.calledWith(changeMatcher));
  });

  test('notifies about sort direction change', async function (assert) {
    this.changeSpy = sinon.spy();

    await render(hbs `<QueryResults
      @index={{this.index}}
      @queryResultsPromise={{this.queryResultsPromise}}
      @sortProperty={{this.index.properties.a.properties.b}}
      @sortDirection="desc"
      @onSortChange={{this.changeSpy}}
    />`);

    await selectChoose('.direction-selector', 'asc');
    const changeMatcher = sinon.match({
      direction: 'asc',
      property: sinon.match.same(this.index.properties.a.properties.b),
    });
    assert.ok(this.changeSpy.calledOnce);
    assert.ok(this.changeSpy.calledWith(changeMatcher));
  });
});
