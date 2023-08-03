import { module, test } from 'qunit';
import { setupRenderingTest } from '../../../helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { typeInSearch, clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import sinon from 'sinon';
import EsIndex from 'harvester-gui-plugin-generic/utils/es-index';

module('Integration | Component | query-results/sort-selector', hooks => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('index', new EsIndex({
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
    }));
  });

  test('has class "query-results-sort-selector"', async function (assert) {
    await render(hbs `<QueryResults::SortSelector />`);

    assert.ok(this.element.querySelector('.query-results-sort-selector'));
  });

  test('has asc/desc dropdown selector', async function (assert) {
    await render(hbs `<QueryResults::SortSelector />`);
    await clickTrigger('.direction-selector');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    assert.strictEqual(options.length, 2);
    assert.strictEqual(options[0].textContent.trim(), 'asc');
    assert.strictEqual(options[1].textContent.trim(), 'desc');
    assert.strictEqual(this.element.querySelector(
      '.direction-selector .ember-power-select-selected-item'
    ).textContent.trim(), 'desc');
  });

  test('notifies about sort direction change', async function (assert) {
    const changeSpy = this.set('changeSpy', sinon.spy());

    await render(hbs `<QueryResults::SortSelector
      @index={{this.index}}
      @onSortChange={{this.changeSpy}}
    />`);
    await selectChoose('.direction-selector', 'asc');

    const changeMatcher = sinon.match({
      property: sinon.match({}),
      direction: 'asc',
    });
    assert.ok(changeSpy.calledOnce);
    assert.ok(changeSpy.calledWith(changeMatcher));
  });

  test('has index properties selector', async function (assert) {
    await render(hbs `<QueryResults::SortSelector @index={{this.index}} />`);
    await clickTrigger('.property-selector');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    assert.strictEqual(options.length, 3);
    [
      'query score',
      'a.b',
      'c.d',
    ].forEach((propertyPath, index) => {
      assert.strictEqual(options[index].textContent.trim(), propertyPath);
    });
    assert.strictEqual(this.element.querySelector(
      '.property-selector .ember-power-select-selected-item'
    ).textContent.trim(), 'query score');
  });

  test('filters index properties in dropdown', async function (assert) {
    await render(hbs `<QueryResults::SortSelector @index={{this.index}} />`);
    await clickTrigger('.property-selector');
    await typeInSearch('c');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    assert.strictEqual(options.length, 2);
    assert.strictEqual(options[0].textContent.trim(), 'query score');
    assert.strictEqual(options[1].textContent.trim(), 'c.d');
  });

  test('notifies about sort property change', async function (assert) {
    const changeSpy = this.set('changeSpy', sinon.spy());

    await render(hbs `<QueryResults::SortSelector
      @index={{this.index}}
      @onSortChange={{this.changeSpy}}
    />`);
    await selectChoose('.property-selector', 'a.b');
    const changeMatcher = sinon.match({
      direction: 'desc',
      property: sinon.match.same(this.index.properties.a.properties.b),
    });
    assert.ok(changeSpy.calledOnce);
    assert.ok(changeSpy.calledWith(changeMatcher));
  });
});
