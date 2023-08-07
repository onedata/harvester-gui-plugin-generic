import { module, test } from 'qunit';
import { setupRenderingTest } from '../../../helpers';
import { render, click, fillIn, triggerKeyEvent, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import sinon from 'sinon';

module('Integration | Component | query-results/pagination', (hooks) => {
  setupRenderingTest(hooks);

  test('renders correct number of pages', async function (assert) {
    await render(hbs `<QueryResults::Pagination
      @resultsCount={{121}}
      @pageSize={{10}}
    />`);

    assert.dom(find('.pages-count')).hasText('13');
  });

  test('shows active page number', async function (assert) {
    await render(hbs `<QueryResults::Pagination
      @resultsCount={{121}}
      @pageSize={{10}}
      @activePageNumber={{2}}
    />`);

    assert.dom(find('.active-page-number')).hasValue('2');
  });

  test('notifies about "go to first" page change', async function (assert) {
    const changeSpy = this.set('changeSpy', sinon.spy());
    await render(hbs `<QueryResults::Pagination
      @resultsCount={{121}}
      @pageSize={{10}}
      @activePageNumber={{5}}
      @onPageChange={{this.changeSpy}}
    />`);
    await click('.first-page');

    assert.ok(changeSpy.calledOnce);
    assert.ok(changeSpy.calledWith(1));
  });

  test('notifies about "go to prev" page change', async function (assert) {
    const changeSpy = this.set('changeSpy', sinon.spy());
    await render(hbs `<QueryResults::Pagination
      @resultsCount={{121}}
      @pageSize={{10}}
      @activePageNumber={{5}}
      @onPageChange={{this.changeSpy}}
    />`);
    await click('.prev-page');

    assert.ok(changeSpy.calledOnce);
    assert.ok(changeSpy.calledWith(4));
  });

  test('notifies about "go to next" page change', async function (assert) {
    const changeSpy = this.set('changeSpy', sinon.spy());
    await render(hbs `<QueryResults::Pagination
      @resultsCount={{121}}
      @pageSize={{10}}
      @activePageNumber={{5}}
      @onPageChange={{this.changeSpy}}
    />`);
    await click('.next-page');

    assert.ok(changeSpy.calledOnce);
    assert.ok(changeSpy.calledWith(6));
  });

  test('notifies about "go to last" page change', async function (assert) {
    const changeSpy = this.set('changeSpy', sinon.spy());
    await render(hbs `<QueryResults::Pagination
      @resultsCount={{121}}
      @pageSize={{10}}
      @activePageNumber={{5}}
      @onPageChange={{this.changeSpy}}
    />`);
    await click('.last-page');

    assert.ok(changeSpy.calledOnce);
    assert.ok(changeSpy.calledWith(13));
  });

  test(
    'blocks "go to prev" and "go to first" page buttons, when is on the first page',
    async function (assert) {
      await render(hbs `<QueryResults::Pagination
        @resultsCount={{121}}
        @pageSize={{10}}
        @activePageNumber={{1}}
      />`);

      assert.dom(find('.first-page')).hasAttribute('disabled');
      assert.dom(find('.prev-page')).hasAttribute('disabled');
    }
  );

  test(
    'unlocks "go to prev" and "go to first" page buttons, when is not on the first page',
    async function (assert) {
      await render(hbs `<QueryResults::Pagination
        @resultsCount={{121}}
        @pageSize={{10}}
        @activePageNumber={{2}}
      />`);

      assert.dom(find('.first-page')).doesNotHaveAttribute('disabled');
      assert.dom(find('.prev-page')).doesNotHaveAttribute('disabled');
    }
  );

  test(
    'blocks "go to next" and "go to last" page buttons, when is on the last page',
    async function (assert) {
      await render(hbs `<QueryResults::Pagination
        @resultsCount={{121}}
        @pageSize={{10}}
        @activePageNumber={{13}}
      />`);

      assert.dom(find('.next-page')).hasAttribute('disabled');
      assert.dom(find('.last-page')).hasAttribute('disabled');
    }
  );

  test(
    'unlocks "go to next" and "go to last" page buttons, when is not on the last page',
    async function (assert) {
      await render(hbs `<QueryResults::Pagination
        @resultsCount={{121}}
        @pageSize={{10}}
        @activePageNumber={{12}}
      />`);

      assert.dom(find('.next-page')).doesNotHaveAttribute('disabled');
      assert.dom(find('.last-page')).doesNotHaveAttribute('disabled');
    }
  );

  [
    ['5', 5],
    ['555', 13],
    ['-5', 1],
    ['asdf', 1],
  ].forEach(([rawValue, notifiedValue]) => {
    test(
      `notifies about changed page number in input (input value: "${rawValue}", notified value: ${notifiedValue})`,
      async function (assert) {
        const changeSpy = this.set('changeSpy', sinon.spy());
        await render(hbs `<QueryResults::Pagination
          @resultsCount={{121}}
          @pageSize={{10}}
          @activePageNumber={{12}}
          @onPageChange={{this.changeSpy}}
        />`);
        await fillIn('.active-page-number', rawValue);
        await triggerKeyEvent('.active-page-number', 'keydown', 'Enter');

        assert.ok(changeSpy.calledOnce);
        assert.ok(changeSpy.calledWith(notifiedValue));
      }
    );
  });

  test('provides options 10, 25, 50 and 100 in page size selector',
    async function (assert) {
      await render(hbs `<QueryResults::Pagination @pageSize={{10}}/>`);
      await clickTrigger('.query-results-pagination');
      const options = findAll('.ember-power-select-option');

      assert.strictEqual(options.length, 4);
      [10, 25, 50, 100].forEach((pageSize, index) =>
        assert.dom(options[index]).hasText(String(pageSize))
      );
    }
  );

  test('has selected active page size option in page size selector',
    async function (assert) {
      await render(hbs `<QueryResults::Pagination @pageSize={{50}}/>`);

      assert.dom(find(
        '.page-size-selector .ember-power-select-selected-item'
      )).hasText('50');
    }
  );

  test('notifies about changed page size', async function (assert) {
    const changeSpy = this.set('changeSpy', sinon.spy());
    await render(hbs `<QueryResults::Pagination @onPageSizeChange={{this.changeSpy}}/>`);
    await selectChoose('.page-size-selector', '50');

    assert.ok(changeSpy.calledOnce);
    assert.ok(changeSpy.calledWith(50));
  });
});
