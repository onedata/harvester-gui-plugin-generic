import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { Promise, resolve, all as allFulfilled } from 'rsvp';
import { click, settled } from '@ember/test-helpers';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import SpacesProvider from 'harvester-gui-plugin-generic/services/spaces-provider';

const indexName = 'generic-index';

describe('Integration | Component | content-index', function () {
  setupRenderingTest();

  beforeEach(function () {
    sinon.stub(SpacesProvider.prototype, 'fetchElasticsearchSpaces')
      .resolves([]);

    const dataRequestStub = sinon.stub();
    stubIndexMappingRequest(dataRequestStub);
    stubQueryRequest(dataRequestStub);
    const dataCurlCommandRequestStub = sinon.stub().resolves('curl');

    sinon.stub(this.owner.lookup('service:app-proxy'), 'dataRequest')
      .get(() => dataRequestStub);
    sinon.stub(this.owner.lookup('service:app-proxy'), 'dataCurlCommandRequest')
      .get(() => dataCurlCommandRequestStub);
    sinon.stub(this.owner.lookup('service:app-proxy'), 'fileBrowserUrlRequest')
      .get(() => (fileId => resolve(`${fileId}url`)));

    this.setProperties({
      dataRequestStub,
      dataCurlCommandRequestStub,
    });
  });

  afterEach(function () {
    if (SpacesProvider.prototype.fetchElasticsearchSpaces.restore) {
      SpacesProvider.prototype.fetchElasticsearchSpaces.restore();
    }
  });

  it('has class "content-index"', async function () {
    await render(hbs `<ContentIndex/>`);

    expect(this.element.querySelectorAll('.content-index')).to.have.length(1);
  });

  it('shows only spinner when index schema is being loaded', async function () {
    this.dataRequestStub.resetBehavior();
    this.dataRequestStub.returns(new Promise(() => {}));

    await render(hbs `<ContentIndex/>`);

    const componentChildren = this.element.querySelectorAll('.content-index > *');
    expect(componentChildren).to.have.length(1);
    expect(componentChildren[0]).to.have.class('spinner-display');
    expect(this.dataRequestStub).to.be.calledOnce
      .and.to.be.calledWith(sinon.match({
        method: 'get',
        indexName,
        path: '_mapping',
        body: undefined,
      }));
  });

  it('shows error when index schema cannot be loaded', async function () {
    this.dataRequestStub.resetBehavior();
    let rejectDataRequest;
    this.dataRequestStub.returns(
      new Promise((resolve, reject) => rejectDataRequest = reject)
    );

    await render(hbs `<ContentIndex/>`);
    rejectDataRequest('indexError');
    await settled();

    const componentChildren = this.element.querySelectorAll('.content-index > *');
    expect(componentChildren).to.have.length(1);
    expect(componentChildren[0]).to.have.class('resource-load-error');
    expect(componentChildren[0].textContent).to.contain('indexError');
  });

  it(
    'shows query builder and filtered properties selector',
    async function () {
      await render(hbs `<ContentIndex/>`);

      expect(this.element.querySelector('.query-builder')).to.exist;
      expect(this.element.querySelector('.filtered-properties-selector')).to.exist;
    }
  );

  it(
    'lists index properties in query builder',
    async function () {
      await render(hbs `<ContentIndex/>`);
      await click('.query-builder-block-adder');
      await clickTrigger('.ember-attacher .property-selector');

      const options = this.element.querySelectorAll('.ember-power-select-option');
      expect(options).to.have.length(4);
      ['any property', 'space', 'a.b', 'c'].forEach((propertyPath, index) =>
        expect(options[index].textContent.trim()).to.equal(propertyPath)
      );
    }
  );

  it(
    'lists index properties in filtered properties selector',
    async function () {
      await render(hbs `<ContentIndex/>`);
      await click('.show-properties-selector');
      // expand all nodes
      await allFulfilled(
        [...document.querySelectorAll('.ember-attacher .tree .toggle-icon')]
        .map(element => click(element))
      );

      const treeLabels = document.querySelectorAll('.ember-attacher .tree-label');
      expect(treeLabels).to.have.length(3);
      ['a', 'b', 'c'].forEach((propertyName, index) =>
        expect(treeLabels[index].textContent.trim()).to.equal(propertyName)
      );
    }
  );

  it('shows results of initial query', async function () {
    await render(hbs `<ContentIndex/>`);

    // #1 request: getting spaces list, #2 request: fetching initial query results
    expect(this.dataRequestStub).to.be.calledTwice.and.to.be.calledWith(sinon.match({
      method: 'post',
      indexName,
      path: '_search',
      body: '{"from":0,"size":10,"sort":[{"_score":"desc"}]}',
    }));
    expect(this.element.querySelectorAll('.query-results-result')).to.have.length(1);
    expect(this.element.querySelector('.result-sample').textContent.trim())
      .to.equal('a: {b: false}, c: "abc"');
    expect(this.element.querySelector('.go-to-file-link'))
      .to.have.attr('href', 'file123url');
  });

  it('shows results spinner while initial query is pending', async function () {
    this.dataRequestStub.resetBehavior();
    stubIndexMappingRequest(this.dataRequestStub);
    this.dataRequestStub.returns(new Promise(() => {}));

    await render(hbs `<ContentIndex/>`);

    expect(this.element.querySelector('.query-results .spinner-display')).to.exist;
  });

  it('shows results error when initial query failed', async function () {
    this.dataRequestStub.resetBehavior();
    stubIndexMappingRequest(this.dataRequestStub);
    let rejectQuery;
    this.dataRequestStub.returns(new Promise((resolve, reject) => rejectQuery = reject));

    await render(hbs `<ContentIndex/>`);
    rejectQuery('queryError');
    await settled();

    const errorContainer =
      this.element.querySelector('.query-results .resource-load-error');
    expect(errorContainer).to.exist;
    expect(errorContainer.textContent).to.contain('queryError');
  });

  it('allows to perform custom query with conditions', async function () {
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
    await selectChoose('.ember-attacher .property-selector', 'a.b');
    await click('.accept-condition');
    await click('.submit-query');

    expect(this.dataRequestStub).to.be.calledOnce.and.to.be.calledWith(sinon.match({
      method: 'post',
      indexName,
      path: '_search',
      body: '{"from":0,"size":10,"sort":[{"_score":"desc"}],"query":{"bool":{"must":[{"term":{"a.b":{"value":"true"}}}]}}}',
    }));

    expect(this.element.querySelectorAll('.query-results-result')).to.have.length(1);
    expect(this.element.querySelector('.result-sample').textContent.trim())
      .to.equal('a: {b: true}');
  });

  it('shows spinner while loading custom query with conditions', async function () {
    await render(hbs `<ContentIndex/>`);
    this.dataRequestStub.resetBehavior();
    this.dataRequestStub.returns(new Promise(() => {}));
    await click('.query-builder-block-adder');
    await selectChoose('.ember-attacher .property-selector', 'a.b');
    await click('.accept-condition');
    await click('.submit-query');

    expect(this.element.querySelector('.query-results .spinner-display')).to.exist;
    expect(this.element.querySelector('.result-sample')).to.not.exist;
  });

  it('shows loading error when custom query with conditions failed', async function () {
    await render(hbs `<ContentIndex/>`);
    this.dataRequestStub.resetBehavior();
    let rejectQuery;
    this.dataRequestStub.returns(new Promise((resolve, reject) => rejectQuery = reject));
    await click('.query-builder-block-adder');
    await selectChoose('.ember-attacher .property-selector', 'a.b');
    await click('.accept-condition');
    await click('.submit-query');
    rejectQuery('queryError');
    await settled();

    const errorContainer =
      this.element.querySelector('.query-results .resource-load-error');
    expect(errorContainer).to.exist;
    expect(errorContainer.textContent).to.contain('queryError');
    expect(this.element.querySelector('.result-sample')).to.not.exist;
  });

  it('allows to change sorting of results', async function () {
    await render(hbs `<ContentIndex/>`);
    this.dataRequestStub.resetHistory();
    await selectChoose('.query-results-sort-selector .property-selector', 'a.b');
    await selectChoose('.query-results-sort-selector .direction-selector', 'asc');

    expect(this.dataRequestStub).to.be.calledTwice
      .and.to.be.calledWith(sinon.match({
        method: 'post',
        indexName,
        path: '_search',
        body: '{"from":0,"size":10,"sort":[{"a.b":"desc"}]}',
      }))
      .and.to.be.calledWith(sinon.match({
        method: 'post',
        indexName,
        path: '_search',
        body: '{"from":0,"size":10,"sort":[{"a.b":"asc"}]}',
      }));
    expect(
      this.element.querySelector('.query-results-sort-selector .property-selector')
      .textContent.trim()
    ).to.equal('a.b');
    expect(
      this.element.querySelector('.query-results-sort-selector .direction-selector')
      .textContent.trim()
    ).to.equal('asc');
  });

  it('allows to change results page', async function () {
    await render(hbs `<ContentIndex/>`);
    this.dataRequestStub.resetHistory();
    await click('.next-page');

    expect(this.dataRequestStub).to.be.calledOnce
      .and.to.be.calledWith(sinon.match({
        method: 'post',
        indexName,
        path: '_search',
        body: '{"from":10,"size":10,"sort":[{"_score":"desc"}]}',
      }));
    expect(this.element.querySelector('.active-page-number')).to.have.value('2');
  });

  it('allows to change results page size', async function () {
    await render(hbs `<ContentIndex/>`);
    this.dataRequestStub.resetHistory();
    await selectChoose('.page-size-selector', '25');

    expect(this.dataRequestStub).to.be.calledOnce
      .and.to.be.calledWith(sinon.match({
        method: 'post',
        indexName,
        path: '_search',
        body: '{"from":0,"size":25,"sort":[{"_score":"desc"}]}',
      }));
    expect(this.element.querySelector('.page-size-selector').textContent.trim())
      .to.equal('25');
  });

  it('resets page number on results page size change', async function () {
    await render(hbs `<ContentIndex/>`);
    this.dataRequestStub.resetHistory();
    await click('.next-page');
    await selectChoose('.page-size-selector', '25');

    expect(this.dataRequestStub).to.be.calledTwice
      .and.to.be.calledWith(sinon.match({
        method: 'post',
        indexName,
        path: '_search',
        body: '{"from":0,"size":25,"sort":[{"_score":"desc"}]}',
      }));
    expect(this.element.querySelector('.active-page-number')).to.have.value('1');
  });

  it('resets page number on sort property change', async function () {
    await render(hbs `<ContentIndex/>`);
    this.dataRequestStub.resetHistory();
    await click('.next-page');
    await selectChoose('.query-results-sort-selector .property-selector', 'a.b');

    expect(this.dataRequestStub).to.be.calledTwice
      .and.to.be.calledWith(sinon.match({
        method: 'post',
        indexName,
        path: '_search',
        body: '{"from":0,"size":10,"sort":[{"a.b":"desc"}]}',
      }));
    expect(this.element.querySelector('.active-page-number')).to.have.value('1');
  });

  it('resets page number on sort direction change', async function () {
    await render(hbs `<ContentIndex/>`);
    this.dataRequestStub.resetHistory();
    await click('.next-page');
    await selectChoose('.query-results-sort-selector .direction-selector', 'asc');

    expect(this.dataRequestStub).to.be.calledTwice
      .and.to.be.calledWith(sinon.match({
        method: 'post',
        indexName,
        path: '_search',
        body: '{"from":0,"size":10,"sort":[{"_score":"asc"}]}',
      }));
    expect(this.element.querySelector('.active-page-number')).to.have.value('1');
  });

  it(
    'generates curl command with custom conditions, sorting and filtered properties',
    async function () {
      await render(hbs `<ContentIndex/>`);
      await click('.query-builder-block-adder');
      await selectChoose('.ember-attacher .property-selector', 'a.b');
      await click('.accept-condition');
      await click('.submit-query');
      await selectChoose('.query-results-sort-selector .property-selector', 'a.b');
      await selectChoose('.query-results-sort-selector .direction-selector', 'asc');
      // page number should not be visible in CURL
      await click('.next-page');
      await click('.filtered-properties-selector .show-properties-selector');
      // will click the first checkbox, which corresponds to the `a` property
      await click('.ember-attacher .one-checkbox');
      await click('.generate-query-request');

      expect(this.element.querySelector('.copy-textarea').textContent.trim())
        .to.equal('curl');
      expect(this.dataCurlCommandRequestStub).to.be.calledOnce
        .and.to.be.calledWith(sinon.match({
          method: 'post',
          indexName,
          path: '_search',
          body: '{"from":0,"size":10,"sort":[{"a.b":"asc"}],"query":{"bool":{"must":[{"term":{"a.b":{"value":"true"}}}]}},"_source":["a.b"]}',
        }));
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
