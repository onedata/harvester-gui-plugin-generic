import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { click, fillIn, triggerKeyEvent } from '@ember/test-helpers';
import { clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import sinon from 'sinon';

describe('Integration | Component | query-results/pagination', function () {
  setupRenderingTest();

  it('renders correct number of pages', async function () {
    await render(hbs `<QueryResults::Pagination
      @resultsCount={{121}}
      @pageSize={{10}}
    />`);

    expect(this.element.querySelector('.pages-count').textContent.trim()).to.equal('13');
  });

  it('shows active page number', async function () {
    await render(hbs `<QueryResults::Pagination
      @resultsCount={{121}}
      @pageSize={{10}}
      @activePageNumber={{2}}
    />`);

    expect(this.element.querySelector('.active-page-number')).to.have.value('2');
  });

  it('notifies about "go to first" page change', async function () {
    const changeSpy = this.set('changeSpy', sinon.spy());
    await render(hbs `<QueryResults::Pagination
      @resultsCount={{121}}
      @pageSize={{10}}
      @activePageNumber={{5}}
      @onPageChange={{this.changeSpy}}
    />`);
    await click('.first-page');

    expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(1);
  });

  it('notifies about "go to prev" page change', async function () {
    const changeSpy = this.set('changeSpy', sinon.spy());
    await render(hbs `<QueryResults::Pagination
      @resultsCount={{121}}
      @pageSize={{10}}
      @activePageNumber={{5}}
      @onPageChange={{this.changeSpy}}
    />`);
    await click('.prev-page');

    expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(4);
  });

  it('notifies about "go to next" page change', async function () {
    const changeSpy = this.set('changeSpy', sinon.spy());
    await render(hbs `<QueryResults::Pagination
      @resultsCount={{121}}
      @pageSize={{10}}
      @activePageNumber={{5}}
      @onPageChange={{this.changeSpy}}
    />`);
    await click('.next-page');

    expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(6);
  });

  it('notifies about "go to last" page change', async function () {
    const changeSpy = this.set('changeSpy', sinon.spy());
    await render(hbs `<QueryResults::Pagination
      @resultsCount={{121}}
      @pageSize={{10}}
      @activePageNumber={{5}}
      @onPageChange={{this.changeSpy}}
    />`);
    await click('.last-page');

    expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(13);
  });

  it(
    'blocks "go to prev" and "go to first" page buttons, when is on the first page',
    async function () {
      await render(hbs `<QueryResults::Pagination
        @resultsCount={{121}}
        @pageSize={{10}}
        @activePageNumber={{1}}
      />`);

      expect(this.element.querySelector('.first-page')).to.have.attr('disabled');
      expect(this.element.querySelector('.prev-page')).to.have.attr('disabled');
    }
  );

  it(
    'unlocks "go to prev" and "go to first" page buttons, when is not on the first page',
    async function () {
      await render(hbs `<QueryResults::Pagination
        @resultsCount={{121}}
        @pageSize={{10}}
        @activePageNumber={{2}}
      />`);

      expect(this.element.querySelector('.first-page')).to.not.have.attr('disabled');
      expect(this.element.querySelector('.prev-page')).to.not.have.attr('disabled');
    }
  );

  it(
    'blocks "go to next" and "go to last" page buttons, when is on the last page',
    async function () {
      await render(hbs `<QueryResults::Pagination
        @resultsCount={{121}}
        @pageSize={{10}}
        @activePageNumber={{13}}
      />`);

      expect(this.element.querySelector('.next-page')).to.have.attr('disabled');
      expect(this.element.querySelector('.last-page')).to.have.attr('disabled');
    }
  );

  it(
    'unlocks "go to next" and "go to last" page buttons, when is not on the last page',
    async function () {
      await render(hbs `<QueryResults::Pagination
        @resultsCount={{121}}
        @pageSize={{10}}
        @activePageNumber={{12}}
      />`);

      expect(this.element.querySelector('.next-page')).to.not.have.attr('disabled');
      expect(this.element.querySelector('.last-page')).to.not.have.attr('disabled');
    }
  );

  [
    ['5', 5],
    ['555', 13],
    ['-5', 1],
    ['asdf', 1],
  ].forEach(([rawValue, notifiedValue]) => {
    it(
      `notifies about changed page number in input (input value: "${rawValue}", notified value: ${notifiedValue})`,
      async function () {
        const changeSpy = this.set('changeSpy', sinon.spy());
        await render(hbs `<QueryResults::Pagination
          @resultsCount={{121}}
          @pageSize={{10}}
          @activePageNumber={{12}}
          @onPageChange={{this.changeSpy}}
        />`);
        await fillIn('.active-page-number', rawValue);
        await triggerKeyEvent('.active-page-number', 'keydown', 'Enter');

        expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(notifiedValue);
      }
    );
  });

  it('provides options 10, 25, 50 and 100 in page size selector', async function () {
    await render(hbs `<QueryResults::Pagination @pageSize={{10}}/>`);
    await clickTrigger('.query-results-pagination');
    const options = this.element.querySelectorAll('.ember-power-select-option');

    expect(options).to.have.length(4);
    [10, 25, 50, 100].forEach((pageSize, index) =>
      expect(options[index].textContent.trim()).to.equal(String(pageSize))
    );
  });

  it('has selected active page size option in page size selector', async function () {
    await render(hbs `<QueryResults::Pagination @pageSize={{50}}/>`);

    expect(this.element.querySelector(
      '.page-size-selector .ember-power-select-selected-item'
    ).textContent.trim()).to.equal('50');
  });

  it('notifies about changed page size', async function () {
    const changeSpy = this.set('changeSpy', sinon.spy());
    await render(hbs `<QueryResults::Pagination @onPageSizeChange={{this.changeSpy}}/>`);
    await selectChoose('.page-size-selector', '50');

    expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(50);
  });
});
