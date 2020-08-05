import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click, fillIn, triggerKeyEvent } from '@ember/test-helpers';
import { selectChoose, clickTrigger } from 'ember-power-select/test-support/helpers';
import RootOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/root-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import Index from 'harvester-gui-plugin-generic/utils/index';

describe('Integration | Component | query-builder', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('index', new Index({
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

  it('has class "query-builder', async function () {
    await render(hbs `<QueryBuilder />`);

    expect(this.element.querySelector('.query-builder'));
  });

  it('filters list of available index properties to supported ones', async function () {
    await render(hbs `<QueryBuilder @index={{this.index}}/>`);
    await click('.query-builder-block-adder');
    await clickTrigger('.property-selector');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(5);
    ['any property', 'space', 'a.b', 'c', 'c.d'].forEach((propertyPath, index) =>
      expect(options[index].textContent.trim()).to.equal(propertyPath)
    );
  });

  it('calls "onPerformQuery" after submit button press', async function () {
    const submitSpy = this.set('submitSpy', sinon.spy());

    await render(hbs `<QueryBuilder
      @onPerformQuery={{this.submitSpy}}
      @index={{this.index}}
    />`);
    await click('.query-builder-block-adder');
    await selectChoose('.property-selector', 'a.b');
    await click('.accept-condition');
    await click('.submit-query');

    const queryMatcher = sinon.match.instanceOf(RootOperatorQueryBlock)
      .and(sinon.match.has('operands', [sinon.match.instanceOf(ConditionQueryBlock)]));
    expect(submitSpy).to.be.calledOnce.and.be.calledWith(queryMatcher);
  });

  it(
    'does not disable submit button when edited condition has valid value',
    async function () {
      await render(hbs `<QueryBuilder @index={{this.index}}/>`);
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector', 'c.d');
      await fillIn('.ember-attacher .comparator-value', 'abc');
      await click('.accept-condition');
      await click('.query-builder-condition-block .comparator-value');
      await fillIn('.query-builder-condition-block .comparator-value', 'def');

      expect(this.element.querySelector('.submit-query')).to.not.have.attr('disabled');
    }
  );

  it('disables submit button when edited condition has invalid value', async function () {
    await render(hbs `<QueryBuilder @index={{this.index}}/>`);
    await click('.query-builder-block-adder');
    await selectChoose('.property-selector', 'c.d');
    await fillIn('.ember-attacher .comparator-value', 'abc');
    await click('.accept-condition');
    await click('.query-builder-condition-block .comparator-value');
    await fillIn('.query-builder-condition-block .comparator-value', '');

    expect(this.element.querySelector('.submit-query')).to.have.attr('disabled');
  });

  it(
    'enables submit button when edited condition had invalid value and then the edition was cancelled',
    async function () {
      await render(hbs `<QueryBuilder @index={{this.index}}/>`);
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector', 'c.d');
      await fillIn('.ember-attacher .comparator-value', 'abc');
      await click('.accept-condition');
      await click('.query-builder-condition-block .comparator-value');
      await fillIn('.query-builder-condition-block .comparator-value', '');
      await triggerKeyEvent('.comparator-value', 'keydown', 27);

      expect(this.element.querySelector('.submit-query')).to.not.have.attr('disabled');
    }
  );

  it(
    'enables submit button when edited condition had invalid value and then the condition was deleted',
    async function () {
      await render(hbs `<QueryBuilder @index={{this.index}}/>`);
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector', 'c.d');
      await fillIn('.ember-attacher .comparator-value', 'abc');
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
      await render(hbs `<QueryBuilder @index={{this.index}}/>`);
      await click('.query-builder-block-adder');
      await click('.operator-not');
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector', 'c.d');
      await fillIn('.ember-attacher .comparator-value', 'abc');
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
      const { generateCurlStub } = this.setProperties({
        generateCurlStub: sinon.stub().resolves('curl!'),
        filteredProperties: {
          a: {
            b: {},
          },
          c: {},
        },
        sortProperty: { path: 'e.f' },
        sortDirection: 'asc',
      });

      await render(hbs `<QueryBuilder
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

      expect(generateCurlStub).to.be.calledOnce;
      expect(generateCurlStub.lastCall.args[0]).to.deep.equal({
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
