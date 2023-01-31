import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click, fillIn, triggerKeyEvent } from '@ember/test-helpers';
import { selectChoose, clickTrigger } from '../../helpers/ember-power-select';
import RootOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/root-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import EsIndex from 'harvester-gui-plugin-generic/utils/es-index';
import QueryValueComponentsBuilder from 'harvester-gui-plugin-generic/utils/query-value-components-builder';

describe('Integration | Component | query-builder', function () {
  setupRenderingTest();

  beforeEach(function () {
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
    this.valuesBuilder = new QueryValueComponentsBuilder([]);
  });

  it('has class "query-builder', async function () {
    await render(hbs `<QueryBuilder @valuesBuilder={{this.valuesBuilder}} />`);

    expect(this.element.querySelector('.query-builder'));
  });

  it('filters list of available index properties to supported ones', async function () {
    await render(hbs `<QueryBuilder
      @index={{this.index}}
      @valuesBuilder={{this.valuesBuilder}}
    />`);
    await click('.query-builder-block-adder');
    await clickTrigger('.property-selector');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(5);
    ['any property', 'space', 'a.b', 'c', 'c.d'].forEach((propertyPath, index) =>
      expect(options[index].textContent.trim()).to.equal(propertyPath)
    );
  });

  it('calls "onPerformQuery" after submit button press', async function () {
    this.submitSpy = sinon.spy();

    await render(hbs `<QueryBuilder
      @valuesBuilder={{this.valuesBuilder}}
      @onPerformQuery={{this.submitSpy}}
      @index={{this.index}}
    />`);
    await click('.query-builder-block-adder');
    await selectChoose('.property-selector', 'a.b');
    await click('.accept-condition');
    await click('.submit-query');

    const queryMatcher = sinon.match.instanceOf(RootOperatorQueryBlock)
      .and(sinon.match.has('operands', [sinon.match.instanceOf(ConditionQueryBlock)]));
    expect(this.submitSpy).to.be.calledOnce.and.be.calledWith(queryMatcher);
  });

  it(
    'does not disable submit button when edited condition has valid value',
    async function () {
      await render(hbs `<QueryBuilder
        @index={{this.index}}
        @valuesBuilder={{this.valuesBuilder}}
      />`);
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector', 'c.d');
      await fillIn('.block-adder-body .comparator-value', 'abc');
      await click('.accept-condition');
      await click('.query-builder-condition-block .comparator-value');
      await fillIn('.query-builder-condition-block .comparator-value', 'def');

      expect(this.element.querySelector('.submit-query')).to.not.have.attr('disabled');
    }
  );

  it('disables submit button when edited condition has invalid value', async function () {
    await render(hbs `<QueryBuilder
      @index={{this.index}}
      @valuesBuilder={{this.valuesBuilder}}
    />`);
    await click('.query-builder-block-adder');
    await selectChoose('.property-selector', 'c.d');
    await fillIn('.block-adder-body .comparator-value', 'abc');
    await click('.accept-condition');
    await click('.query-builder-condition-block .comparator-value');
    await fillIn('.query-builder-condition-block .comparator-value', '');

    expect(this.element.querySelector('.submit-query')).to.have.attr('disabled');
  });

  it(
    'enables submit button when edited condition had invalid value and then the edition was cancelled',
    async function () {
      await render(hbs `<QueryBuilder
        @index={{this.index}}
        @valuesBuilder={{this.valuesBuilder}}
      />`);
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector', 'c.d');
      await fillIn('.block-adder-body .comparator-value', 'abc');
      await click('.accept-condition');
      await click('.query-builder-condition-block .comparator-value');
      await fillIn('.query-builder-condition-block .comparator-value', '');
      await triggerKeyEvent('.comparator-value', 'keydown', 'Escape');

      expect(this.element.querySelector('.submit-query')).to.not.have.attr('disabled');
    }
  );

  it(
    'enables submit button when edited condition had invalid value and then the condition was deleted',
    async function () {
      await render(hbs `<QueryBuilder
        @index={{this.index}}
        @valuesBuilder={{this.valuesBuilder}}
      />`);
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector', 'c.d');
      await fillIn('.block-adder-body .comparator-value', 'abc');
      await click('.accept-condition');
      await click('.query-builder-condition-block .comparator-value');
      await fillIn('.query-builder-condition-block .comparator-value', '');
      await click('.remove-block');

      expect(this.element.querySelector('.submit-query')).to.not.have.attr('disabled');
    }
  );

  it(
    'enables submit button when edited condition had invalid value and then the containing operator was deleted',
    async function () {
      await render(hbs `<QueryBuilder
        @index={{this.index}}
        @valuesBuilder={{this.valuesBuilder}}
      />`);
      await click('.query-builder-block-adder');
      await click('.operator-not');
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector', 'c.d');
      await fillIn('.block-adder-body .comparator-value', 'abc');
      await click('.accept-condition');
      await click('.query-builder-condition-block .comparator-value');
      await fillIn('.query-builder-condition-block .comparator-value', '');
      await click('.not-operator-block > .remove-block');

      expect(this.element.querySelector('.submit-query')).to.not.have.attr('disabled');
    }
  );

  it(
    'shows CURL request content on "generate request" button click',
    async function () {
      this.generateCurlStub = sinon.stub().resolves('curl!');
      this.filteredProperties = {
        a: {
          b: {},
        },
        c: {},
      };
      this.sortProperty = { path: 'e.f' };
      this.sortDirection = 'asc';

      await render(hbs `<QueryBuilder
        @valuesBuilder={{this.valuesBuilder}}
        @onGenerateCurl={{this.generateCurlStub}}
        @filteredProperties={{this.filteredProperties}}
        @sortProperty={{this.sortProperty}}
        @sortDirection={{this.sortDirection}}
        @index={{this.index}}
      />`);
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector', 'a.b');
      await click('.accept-condition');
      await click('.generate-query-request');

      expect(this.generateCurlStub).to.be.calledOnce;
      expect(this.generateCurlStub.lastCall.args[0]).to.deep.equal({
        from: 0,
        size: 10,
        sort: [{
          'e.f': 'asc',
        }],
        query: {
          bool: {
            must: [{
              term: {
                'a.b': {
                  value: 'true',
                },
              },
            }],
          },
        },
        _source: [
          'a.b',
          'c',
        ],
      });
      expect(document.querySelector('.curl-generator-modal textarea'))
        .to.have.value('curl!');
    }
  );
});
