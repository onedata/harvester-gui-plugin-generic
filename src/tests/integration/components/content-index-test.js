import { module, test } from 'qunit';
import { setupRenderingTest } from '../../helpers';
import { render, click, settled, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { Promise, resolve, all as allFulfilled } from 'rsvp';
import { clickTrigger, selectChoose } from '../../helpers/ember-power-select';
import SpacesProvider from 'harvester-gui-plugin-generic/services/spaces-provider';

const indexName = 'generic-index';

module('Integration | Component | content-index', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    sinon.stub(SpacesProvider.prototype, 'fetchElasticsearchSpaces')
      .resolves([]);

    this.dataRequestStub = sinon.stub();
    stubIndexMappingRequest(this.dataRequestStub);
    stubQueryRequest(this.dataRequestStub);
    this.dataCurlCommandRequestStub = sinon.stub().resolves('curl');

    sinon.stub(this.owner.lookup('service:app-proxy'), 'dataRequest')
      .get(() => this.dataRequestStub);
    sinon.stub(this.owner.lookup('service:app-proxy'), 'dataCurlCommandRequest')
      .get(() => this.dataCurlCommandRequestStub);
    sinon.stub(this.owner.lookup('service:app-proxy'), 'fileBrowserUrlRequest')
      .get(() => (fileId => resolve(`${fileId}url`)));
  });

  hooks.afterEach(function () {
    if (SpacesProvider.prototype.fetchElasticsearchSpaces.restore) {
      SpacesProvider.prototype.fetchElasticsearchSpaces.restore();
    }
  });

  test('has class "content-index"', async function (assert) {
    await render(hbs `<ContentIndex/>`);

    assert.strictEqual(findAll('.content-index').length, 1);
  });

  test('shows only spinner when index schema is being loaded', async function (assert) {
    this.dataRequestStub.resetBehavior();
    this.dataRequestStub.returns(new Promise(() => {}));

    await render(hbs `<ContentIndex/>`);

    const componentChildren = findAll('.content-index > *');
    assert.strictEqual(componentChildren.length, 1);
    assert.dom(componentChildren[0]).hasClass('spinner-display');
    assert.ok(this.dataRequestStub.calledOnce);
    assert.ok(this.dataRequestStub.calledWith(sinon.match({
      method: 'get',
      indexName,
      path: '_mapping',
      body: undefined,
    })));
  });

  test('shows error when index schema cannot be loaded', async function (assert) {
    this.dataRequestStub.resetBehavior();
    let rejectDataRequest;
    this.dataRequestStub.returns(
      new Promise((resolve, reject) => rejectDataRequest = reject)
    );

    await render(hbs `<ContentIndex/>`);
    rejectDataRequest('indexError');
    await settled();

    const componentChildren = findAll('.content-index > *');
    assert.strictEqual(componentChildren.length, 1);
    assert.dom(componentChildren[0]).hasClass('resource-load-error');
    assert.contains(componentChildren[0].textContent, 'indexError');
  });

  test(
    'shows query builder and filtered properties selector',
    async function (assert) {
      await render(hbs `<ContentIndex/>`);

      assert.ok(find('.query-builder'));
      assert.ok(find('.filtered-properties-selector'));
    }
  );

  test(
    'lists index properties in query builder',
    async function (assert) {
      await render(hbs `<ContentIndex/>`);
      await click('.query-builder-block-adder');
      await clickTrigger('.block-adder-body .property-selector');

      const options = findAll('.ember-power-select-option');
      assert.strictEqual(options.length, 4);
      ['any property', 'space', 'a.b', 'c'].forEach((propertyPath, index) =>
        assert.dom(options[index]).hasText(propertyPath)
      );
    }
  );

  test(
    'lists index properties in filtered properties selector',
    async function (assert) {
      await render(hbs `<ContentIndex/>`);
      await click('.show-properties-selector');
      // expand all nodes
      await allFulfilled(
        [...document.querySelectorAll(
          '.filtered-properties-selector-body .tree .toggle-icon'
        )]
        .map(element => click(element))
      );

      const treeLabels =
        document.querySelectorAll('.filtered-properties-selector-body .tree-label');
      assert.strictEqual(treeLabels.length, 3);
      ['a', 'b', 'c'].forEach((propertyName, index) =>
        assert.dom(treeLabels[index]).hasText(propertyName)
      );
    }
  );

  test('shows results of initial query', async function (assert) {
    await render(hbs `<ContentIndex/>`);

    // #1 request: getting spaces list, #2 request: fetching initial query results
    assert.ok(this.dataRequestStub.calledTwice);
    assert.ok(this.dataRequestStub.calledWith(sinon.match({
      method: 'post',
      indexName,
      path: '_search',
      body: '{"from":0,"size":10,"sort":[{"_score":"desc"}]}',
    })));
    assert.strictEqual(findAll('.query-results-result').length, 1);
    assert.dom(find('.result-sample')).hasText('a: {b: false}, c: "abc"');
    assert.dom(find('.go-to-file-link')).hasAttribute('href', 'file123url');
  });

  test('shows results spinner while initial query is pending', async function (assert) {
    this.dataRequestStub.resetBehavior();
    stubIndexMappingRequest(this.dataRequestStub);
    this.dataRequestStub.returns(new Promise(() => {}));

    await render(hbs `<ContentIndex/>`);

    assert.ok(find('.query-results .spinner-display'));
  });

  test('shows results error when initial query failed', async function (assert) {
    this.dataRequestStub.resetBehavior();
    stubIndexMappingRequest(this.dataRequestStub);
    let rejectQuery;
    this.dataRequestStub.returns(new Promise((resolve, reject) => rejectQuery = reject));

    await render(hbs `<ContentIndex/>`);
    rejectQuery('queryError');
    await settled();

    const errorContainer =
      find('.query-results .resource-load-error');
    assert.ok(errorContainer);
    assert.contains(errorContainer.textContent, 'queryError');
  });

  test('allows to perform custom query with conditions', async function (assert) {
    await render(hbs `<ContentIndex/>`);
    this.dataRequestStub.reset();
    this.dataRequestStub.resolves({
      hits: {
        total: {
          value: 1,
        },
        hits: [{
          _id: 'file456',
          _source: {
            a: {
              b: true,
            },
          },
        }],
      },
    });
    await click('.query-builder-block-adder');
    await selectChoose('.block-adder-body .property-selector', 'a.b');
    await click('.accept-condition');
    await click('.submit-query');

    assert.ok(this.dataRequestStub.calledOnce);
    assert.ok(this.dataRequestStub.calledWith(sinon.match({
      method: 'post',
      indexName,
      path: '_search',
      body: '{"from":0,"size":10,"sort":[{"_score":"desc"}],"query":{"bool":{"must":[{"term":{"a.b":{"value":"true"}}}]}}}',
    })));

    assert.strictEqual(findAll('.query-results-result').length, 1);
    assert.dom(find('.result-sample')).hasText('a: {b: true}');
  });

  test('shows spinner while loading custom query with conditions',
    async function (assert) {
      await render(hbs `<ContentIndex/>`);
      this.dataRequestStub.resetBehavior();
      this.dataRequestStub.returns(new Promise(() => {}));
      await click('.query-builder-block-adder');
      await selectChoose('.block-adder-body .property-selector', 'a.b');
      await click('.accept-condition');
      await click('.submit-query');

      assert.ok(find('.query-results .spinner-display'));
      assert.notOk(find('.result-sample'));
    }
  );

  test('shows loading error when custom query with conditions failed',
    async function (assert) {
      await render(hbs `<ContentIndex/>`);
      this.dataRequestStub.resetBehavior();
      let rejectQuery;
      this.dataRequestStub.returns(
        new Promise((resolve, reject) => rejectQuery = reject)
      );
      await click('.query-builder-block-adder');
      await selectChoose('.block-adder-body .property-selector', 'a.b');
      await click('.accept-condition');
      await click('.submit-query');
      rejectQuery('queryError');
      await settled();

      const errorContainer =
        find('.query-results .resource-load-error');
      assert.ok(errorContainer);
      assert.contains(errorContainer.textContent, 'queryError');
      assert.notOk(find('.result-sample'));
    }
  );

  test('allows to change sorting of results', async function (assert) {
    await render(hbs `<ContentIndex/>`);
    this.dataRequestStub.resetHistory();
    await selectChoose('.query-results-sort-selector .property-selector', 'a.b');
    await selectChoose('.query-results-sort-selector .direction-selector', 'asc');

    assert.ok(this.dataRequestStub.calledTwice);
    assert.ok(this.dataRequestStub.calledWith(sinon.match({
      method: 'post',
      indexName,
      path: '_search',
      body: '{"from":0,"size":10,"sort":[{"a.b":"desc"}]}',
    })));
    assert.ok(this.dataRequestStub.calledWith(sinon.match({
      method: 'post',
      indexName,
      path: '_search',
      body: '{"from":0,"size":10,"sort":[{"a.b":"asc"}]}',
    })));
    assert.dom(find('.query-results-sort-selector .property-selector')).hasText('a.b');
    assert.dom(find('.query-results-sort-selector .direction-selector')).hasText('asc');
  });

  test('allows to change results page', async function (assert) {
    await render(hbs `<ContentIndex/>`);
    this.dataRequestStub.resetHistory();
    await click('.next-page');

    assert.ok(this.dataRequestStub.calledOnce);
    assert.ok(this.dataRequestStub.calledWith(sinon.match({
      method: 'post',
      indexName,
      path: '_search',
      body: '{"from":10,"size":10,"sort":[{"_score":"desc"}]}',
    })));
    assert.dom(find('.active-page-number')).hasValue('2');
  });

  test('allows to change results page size', async function (assert) {
    await render(hbs `<ContentIndex/>`);
    this.dataRequestStub.resetHistory();
    await selectChoose('.page-size-selector', '25');

    assert.ok(this.dataRequestStub.calledOnce);
    assert.ok(this.dataRequestStub.calledWith(sinon.match({
      method: 'post',
      indexName,
      path: '_search',
      body: '{"from":0,"size":25,"sort":[{"_score":"desc"}]}',
    })));
    assert.dom(find('.page-size-selector')).hasText('25');
  });

  test('resets page number on results page size change', async function (assert) {
    await render(hbs `<ContentIndex/>`);
    this.dataRequestStub.resetHistory();
    await click('.next-page');
    await selectChoose('.page-size-selector', '25');

    assert.ok(this.dataRequestStub.calledTwice);
    assert.ok(this.dataRequestStub.calledWith(sinon.match({
      method: 'post',
      indexName,
      path: '_search',
      body: '{"from":0,"size":25,"sort":[{"_score":"desc"}]}',
    })));
    assert.dom(find('.active-page-number')).hasValue('1');
  });

  test('resets page number on sort property change', async function (assert) {
    await render(hbs `<ContentIndex/>`);
    this.dataRequestStub.resetHistory();
    await click('.next-page');
    await selectChoose('.query-results-sort-selector .property-selector', 'a.b');

    assert.ok(this.dataRequestStub.calledTwice);
    assert.ok(this.dataRequestStub.calledWith(sinon.match({
      method: 'post',
      indexName,
      path: '_search',
      body: '{"from":0,"size":10,"sort":[{"a.b":"desc"}]}',
    })));
    assert.dom(find('.active-page-number')).hasValue('1');
  });

  test('resets page number on sort direction change', async function (assert) {
    await render(hbs `<ContentIndex/>`);
    this.dataRequestStub.resetHistory();
    await click('.next-page');
    await selectChoose('.query-results-sort-selector .direction-selector', 'asc');

    assert.ok(this.dataRequestStub.calledTwice);
    assert.ok(this.dataRequestStub.calledWith(sinon.match({
      method: 'post',
      indexName,
      path: '_search',
      body: '{"from":0,"size":10,"sort":[{"_score":"asc"}]}',
    })));
    assert.dom(find('.active-page-number')).hasValue('1');
  });

  test(
    'generates curl command with custom conditions, sorting and filtered properties',
    async function (assert) {
      await render(hbs `<ContentIndex/>`);
      await click('.query-builder-block-adder');
      await selectChoose('.block-adder-body .property-selector', 'a.b');
      await click('.accept-condition');
      await click('.submit-query');
      await selectChoose('.query-results-sort-selector .property-selector', 'a.b');
      await selectChoose('.query-results-sort-selector .direction-selector', 'asc');
      // page number should not be visible in CURL
      await click('.next-page');
      await click('.filtered-properties-selector .show-properties-selector');
      // will click the first checkbox, which corresponds to the `a` property
      await click('.filtered-properties-selector-body .one-checkbox');
      await click('.generate-query-request');

      assert.dom(find('.copy-textarea')).hasText('curl');
      assert.ok(this.dataCurlCommandRequestStub.calledOnce);
      assert.ok(this.dataCurlCommandRequestStub.calledWith(sinon.match({
        method: 'post',
        indexName,
        path: '_search',
        body: '{"from":0,"size":10,"sort":[{"a.b":"asc"}],"query":{"bool":{"must":[{"term":{"a.b":{"value":"true"}}}]}},"_source":["a.b"]}',
      })));
    }
  );
});

function stubIndexMappingRequest(dataRequestStub) {
  const indexMappingResponse = {
    somerandomindexid: {
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
          },
        },
      },
    },
  };

  dataRequestStub
    .withArgs(sinon.match({
      method: 'get',
      indexName,
      path: '_mapping',
      body: undefined,
    }))
    .returns(resolve(indexMappingResponse));
  return dataRequestStub;
}

function stubQueryRequest(dataRequestStub) {
  dataRequestStub
    .withArgs(sinon.match({
      method: 'post',
      indexName,
      path: '_search',
      body: sinon.match.string,
    }))
    .returns(resolve({
      hits: {
        total: {
          value: 12,
        },
        hits: [{
          _id: 'file123',
          _source: {
            a: {
              b: false,
            },
            c: 'abc',
          },
        }],
      },
    }));
  return dataRequestStub;
}
