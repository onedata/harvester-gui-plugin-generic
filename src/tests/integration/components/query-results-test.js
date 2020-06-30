import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import QueryResults from 'harvester-gui-plugin-generic/utils/query-results';
import { click } from '@ember/test-helpers';
import { all as allFulfilled } from 'rsvp';
import sinon from 'sinon';

describe('Integration | Component | query-results', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('queryResults', new QueryResults({
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
    }));
  });

  it('renders results', async function () {
    await render(hbs `<QueryResults @queryResults={{this.queryResults}}/>`);

    const results = this.element.querySelectorAll('.query-results-result');
    expect(results).to.have.length(2);
    expect(results[0].textContent).to.contain('anotherText');
    expect(results[1].textContent).to.contain('someText2');
  });

  it('has no filtered properties on init', async function () {
    await render(hbs `<QueryResults @queryResults={{this.queryResults}}/>`);

    const selectionCounter =
      this.element.querySelector('.show-properties-selector .selection-counter');
    expect(selectionCounter.textContent.trim()).to.equal('0/6');
    expect(this.element.querySelectorAll('.query-results-result .fields-visualiser'))
      .to.have.length(0);
  });

  it('filters visible properties', async function () {
    await render(hbs `<QueryResults @queryResults={{this.queryResults}}/>`);
    await click('.show-properties-selector');
    // expand all nodes
    await allFulfilled(
      [...document.querySelectorAll('.ember-attacher .tree .toggle-icon')]
      .map(element => click(element))
    );
    const firstBranchLastCheckbox = document.querySelectorAll(
      '.ember-attacher .tree > .tree-branch > .tree-node:first-child > .tree-branch input'
    )[1];
    await click(firstBranchLastCheckbox);

    const fieldsVisualiser =
      this.element.querySelectorAll('.query-results-result .fields-visualiser');
    expect(fieldsVisualiser).to.have.length(1);
    expect(fieldsVisualiser[0].querySelectorAll('.property')).to.have.length(1);
    expect(fieldsVisualiser[0].querySelector('.property-name').textContent.trim())
      .to.equal('a');
    expect(fieldsVisualiser[0].querySelector('.property-value').textContent.trim())
      .to.equal('[{"bb":false}]');
  });

  it('does not notify about changed filtered properties on init', async function () {
    const changeSpy = this.set('changeSpy', sinon.spy());

    await render(hbs `<QueryResults
      @queryResults={{this.queryResults}}
      @onFilteredPropertiesChange={{this.changeSpy}}
    />`);

    expect(changeSpy).to.not.be.called;
  });

  it('notifies about act of changing filtered properties', async function () {
    const changeSpy = this.set('changeSpy', sinon.spy());

    await render(hbs `<QueryResults
      @queryResults={{this.queryResults}}
      @onFilteredPropertiesChange={{this.changeSpy}}
    />`);
    await click('.show-properties-selector');
    await click('.select-all');

    expect(changeSpy).to.be.calledOnce;
    expect(changeSpy.lastCall.args[0]).to.deep.equal({
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

  it('has no pagination controls when query results are empty', async function () {
    this.set('queryResults', new QueryResults({
      hits: {
        hits: [],
      },
    }));

    await render(hbs `<QueryResults @queryResults={{this.queryResults}}/>`);

    expect(this.element.querySelector('.query-results-pagination')).to.not.exist;
  });

  it('has two pagination controls when query results are not empty', async function () {
    await render(hbs `<QueryResults @queryResults={{this.queryResults}}/>`);

    expect(this.element.querySelectorAll('.query-results-pagination')).to.have.length(2);
  });

  ['top', 'bottom'].forEach((paginationPosition, index) => {
    it(
      `has page set to a value passed on init (${paginationPosition} pagination control)`,
      async function () {
        await render(hbs `<QueryResults
          @queryResults={{this.queryResults}}
          @activePageNumber={{5}}
        />`);

        const activePageInput = this.element
          .querySelectorAll('.query-results-pagination .active-page-number')[index];
        expect(activePageInput).to.have.value('5');
      }
    );

    it(
      `has page size set to a value passed on init (${paginationPosition} pagination control)`,
      async function () {
        await render(hbs `<QueryResults
          @queryResults={{this.queryResults}}
          @pageSize={{25}}
        />`);

        const pageSize = this.element.querySelectorAll(
          '.query-results-pagination .page-size-selector .ember-power-select-selected-item'
        )[index];
        expect(pageSize.textContent.trim()).to.equal('25');
      }
    );

    it(
      `shows correct number of pages for a small results set (${paginationPosition} pagination control)`,
      async function () {
        await render(hbs `<QueryResults @queryResults={{this.queryResults}}/>`);

        const pagesCount = this.element.querySelectorAll(
          '.query-results-pagination .pages-count'
        )[index];
        expect(pagesCount.textContent.trim()).to.equal('1');
      }
    );

    it(
      `shows correct number of pages for a large results set (${paginationPosition} pagination control)`,
      async function () {
        this.get('queryResults').totalResultsCount = 50;
        await render(hbs `<QueryResults @queryResults={{this.queryResults}}/>`);

        const pagesCount = this.element.querySelectorAll(
          '.query-results-pagination .pages-count'
        )[index];
        expect(pagesCount.textContent.trim()).to.equal('5');
      }
    );

    it(
      `notifies about page change (${paginationPosition} pagination control)`,
      async function () {
        this.get('queryResults').totalResultsCount = 50;
        const changeSpy = this.set('changeSpy', sinon.spy());

        await render(hbs `<QueryResults
          @queryResults={{this.queryResults}}
          @onPageChange={{this.changeSpy}}
        />`);
        const nextBtn = this.element.querySelectorAll(
          '.query-results-pagination .next-page'
        )[index];
        await click(nextBtn);

        expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(2);
      }
    );
  });
});
