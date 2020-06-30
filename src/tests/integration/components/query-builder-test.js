import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';
import { selectChoose, clickTrigger } from 'ember-power-select/test-support/helpers';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import Index from 'harvester-gui-plugin-generic/utils/index';
import { Promise } from 'rsvp';

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
    await click('.add-trigger');
    await clickTrigger('.property-selector');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(4);
    ['a.b', 'c', 'c.d', 'space'].forEach((propertyPath, index) =>
      expect(options[index].textContent.trim()).to.equal(propertyPath)
    );
  });

  it('calls "onPerformQuery" after submit button press', async function () {
    const submitSpy = this.set('submitSpy', sinon.spy());

    await render(hbs `<QueryBuilder
      @onPerformQuery={{this.submitSpy}}
      @index={{this.index}}
    />`);
    await click('.add-trigger');
    await selectChoose('.property-selector', 'a.b');
    await click('.accept-condition');
    await click('.submit-query');

    const queryMatcher = sinon.match.instanceOf(SingleSlotQueryBlock)
      .and(sinon.match.has('slot', sinon.match.instanceOf(ConditionQueryBlock)));
    expect(submitSpy).to.be.calledOnce.and.be.calledWith(queryMatcher);
  });

  it(
    'does not ask for CURL request before "generate request" button click',
    async function () {
      const generateCurlStub = this.set('generateCurlStub', sinon.stub());

      await render(hbs `<QueryBuilder
        @onGenerateCurl={{this.generateCurlStub}}
        @index={{this.index}}
      />`);
      await click('.add-trigger');
      await selectChoose('.property-selector', 'a.b');
      await click('.accept-condition');

      expect(generateCurlStub).to.not.be.called;
    }
  );

  it('shows CURL request content on "generate request" button click', async function () {
    const generateCurlStub = this.set('generateCurlStub', sinon.stub().resolves('curl!'));

    await render(hbs `<QueryBuilder
      @onGenerateCurl={{this.generateCurlStub}}
      @index={{this.index}}
    />`);
    await click('.add-trigger');
    await selectChoose('.property-selector', 'a.b');
    await click('.accept-condition');
    await click('.generate-query-request');

    expect(generateCurlStub).to.be.calledOnce;
    expect(generateCurlStub.lastCall.args[0]).to.deep.equal({
      from: 0,
      size: 10,
      query: {
        term: {
          'a.b': {
            value: 'true',
          },
        },
      },
    });
    expect(document.querySelector('.ember-attacher .spinner')).to.not.exist;
    expect(document.querySelector('.ember-attacher textarea')).to.have.value('curl!');
  });

  it('shows spinner when CURL request is being loaded', async function () {
    this.set(
      'generateCurlStub',
      sinon.stub().returns(new Promise(() => {}))
    );

    await render(hbs `<QueryBuilder
      @onGenerateCurl={{this.generateCurlStub}}
      @index={{this.index}}
    />`);
    await click('.add-trigger');
    await selectChoose('.property-selector', 'a.b');
    await click('.accept-condition');
    await click('.generate-query-request');

    expect(document.querySelector('.ember-attacher textarea')).to.not.exist;
    expect(document.querySelector('.ember-attacher .spinner')).to.exist;
  });

  it(
    'shows CURL request content on "generate request" button click (with filtered fields)',
    async function () {
      const generateCurlStub =
        this.set('generateCurlStub', sinon.stub().resolves('curl!'));
      this.set('filteredProperties', {
        a: {
          b: {},
        },
        c: {},
      });

      await render(hbs `<QueryBuilder
        @onGenerateCurl={{this.generateCurlStub}}
        @filteredProperties={{this.filteredProperties}}
        @index={{this.index}}
      />`);
      await click('.add-trigger');
      await selectChoose('.property-selector', 'a.b');
      await click('.accept-condition');
      await click('.generate-query-request');

      expect(generateCurlStub).to.be.calledOnce;
      expect(generateCurlStub.lastCall.args[0]).to.deep.equal({
        from: 0,
        size: 10,
        query: {
          term: {
            'a.b': {
              value: 'true',
            },
          },
        },
        _source: [
          'a.b',
          'c',
        ],
      });
      expect(document.querySelector('.ember-attacher .curl-command-string'))
        .to.have.value('curl!');
    }
  );
});
