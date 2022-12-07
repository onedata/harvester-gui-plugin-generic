import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { typeInSearch, clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import sinon from 'sinon';
import EsIndex from 'harvester-gui-plugin-generic/utils/es-index';

describe('Integration | Component | query-results/sort-selector', function () {
  setupRenderingTest();

  beforeEach(function () {
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

  it('has class "query-results-sort-selector"', async function () {
    await render(hbs `<QueryResults::SortSelector />`);

    expect(this.element.querySelector('.query-results-sort-selector')).to.exist;
  });

  it('has asc/desc dropdown selector', async function () {
    await render(hbs `<QueryResults::SortSelector />`);
    await clickTrigger('.direction-selector');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(2);
    expect(options[0].textContent.trim()).to.equal('asc');
    expect(options[1].textContent.trim()).to.equal('desc');
    expect(this.element.querySelector(
      '.direction-selector .ember-power-select-selected-item'
    ).textContent.trim()).to.equal('desc');
  });

  it('notifies about sort direction change', async function () {
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
    expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(changeMatcher);
  });

  it('has index properties selector', async function () {
    await render(hbs `<QueryResults::SortSelector @index={{this.index}} />`);
    await clickTrigger('.property-selector');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(3);
    [
      'query score',
      'a.b',
      'c.d',
    ].forEach((propertyPath, index) => {
      expect(options[index].textContent.trim()).to.equal(propertyPath);
    });
    expect(this.element.querySelector(
      '.property-selector .ember-power-select-selected-item'
    ).textContent.trim()).to.equal('query score');
  });

  it('filters index properties in dropdown', async function () {
    await render(hbs `<QueryResults::SortSelector @index={{this.index}} />`);
    await clickTrigger('.property-selector');
    await typeInSearch('c');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(2);
    expect(options[0].textContent.trim()).to.equal('query score');
    expect(options[1].textContent.trim()).to.equal('c.d');
  });

  it('notifies about sort property change', async function () {
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
    expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(changeMatcher);
  });
});
