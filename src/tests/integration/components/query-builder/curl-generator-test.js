import { module, test } from 'qunit';
import { setupRenderingTest } from '../../../helpers';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { set } from '@ember/object';
import RootOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/root-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';

module('Integration | Component | query-builder/curl-generator', hooks => {
  setupRenderingTest(hooks);

  test('renders trigger button', async function (assert) {
    await render(hbs `<QueryBuilder::CurlGenerator />`);

    const trigger = this.element.querySelector('.generate-query-request');
    assert.ok(trigger);
    assert.strictEqual(trigger.textContent.trim(), '{ REST API }');
  });

  test('has hidden modal on init', async function (assert) {
    await render(hbs `<QueryBuilder::CurlGenerator />`);

    assert.notOk(this.element.querySelector('.curl-generator-modal.show'));
  });

  test('opens modal on trigger click', async function (assert) {
    await render(hbs `<QueryBuilder::CurlGenerator />`);
    await click('.generate-query-request');

    assert.ok(this.element.querySelector('.curl-generator-modal.show'));
  });

  test('allows to close modal', async function (assert) {
    await render(hbs `<QueryBuilder::CurlGenerator />`);
    await click('.generate-query-request');
    await click('.modal');

    assert.notOk(this.element.querySelector('.curl-generator-modal.show'));
  });

  test('allows to reopen modal', async function (assert) {
    await render(hbs `<QueryBuilder::CurlGenerator />`);
    await click('.generate-query-request');
    await click('.modal');
    await click('.generate-query-request');

    assert.ok(this.element.querySelector('.curl-generator-modal.show'));
  });

  test(
    'does not load CURL request before trigger click',
    async function (assert) {
      const generateCurlStub = this.set('generateCurlStub', sinon.stub());

      await render(hbs `<QueryBuilder::CurlGenerator
        @onGenerateCurl={{this.generateCurlStub}}
      />`);

      assert.ok(generateCurlStub.notCalled);
    }
  );

  test('shows spinner when CURL request is being loaded', async function (assert) {
    this.set('generateCurlStub', () => new Promise(() => {}));

    await render(hbs `<QueryBuilder::CurlGenerator
      @onGenerateCurl={{this.generateCurlStub}}
    />`);
    await click('.generate-query-request');

    assert.notOk(document.querySelector('.curl-generator-modal textarea'));
    assert.ok(document.querySelector('.curl-generator-modal .spinner'));
  });

  test('shows error when getting CURL request failed', async function (assert) {
    let rejectPromise;
    this.set(
      'generateCurlStub',
      () => new Promise((resolve, reject) => rejectPromise = reject)
    );

    await render(hbs `<QueryBuilder::CurlGenerator
      @onGenerateCurl={{this.generateCurlStub}}
    />`);
    await click('.generate-query-request');
    rejectPromise('err');
    await settled();

    const errorContainer =
      this.element.querySelector('.curl-generator-modal .error-container');
    assert.ok(errorContainer);
    assert.strictEqual(errorContainer.querySelector('.details-json').textContent.trim(), '"err"');
  });

  [{
    additionalAttrs: {},
    additionalAttrsInQuery: {},
    descriptionSuffix: '',
  }, {
    additionalAttrs: {
      filteredProperties: {
        a: {
          b: {},
        },
        c: {},
      },
    },
    additionalAttrsInQuery: {
      _source: [
        'a.b',
        'c',
      ],
    },
    descriptionSuffix: ' with filtered properties',
  }, {
    additionalAttrs: {
      sortProperty: { path: 'a.b' },
      sortDirection: 'asc',
    },
    additionalAttrsInQuery: {
      sort: [{
        'a.b': 'asc',
      }],
    },
    descriptionSuffix: ' with custom sort',
  }].forEach(({ additionalAttrs, additionalAttrsInQuery, descriptionSuffix }) => {
    test(`shows CURL request${descriptionSuffix}`, async function (assert) {
      const rootQueryBlock = new RootOperatorQueryBlock();
      rootQueryBlock.operands.pushObject(
        new ConditionQueryBlock({ path: 'a.b' }, 'boolean.is', 'true')
      );
      const { generateCurlStub } = this.setProperties(Object.assign({
        generateCurlStub: sinon.stub().resolves('curl!'),
        rootQueryBlock,
      }, additionalAttrs));

      await render(hbs `<QueryBuilder::CurlGenerator
        @onGenerateCurl={{this.generateCurlStub}}
        @rootQueryBlock={{this.rootQueryBlock}}
        @filteredProperties={{this.filteredProperties}}
        @sortProperty={{this.sortProperty}}
        @sortDirection={{this.sortDirection}}
      />`);
      await click('.generate-query-request');

      assert.ok(generateCurlStub.calledOnce);
      assert.deepEqual(generateCurlStub.lastCall.args[0], Object.assign({
        from: 0,
        size: 10,
        sort: [{
          _score: 'desc',
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
      }, additionalAttrsInQuery));

      assert.notOk(document.querySelector('.curl-generator-modal .spinner'));
      assert.dom('.curl-generator-modal textarea').hasValue('curl!');
    });
  });

  ['private', null].forEach((viewMode) => {
    test(`shows access token information when viewMode is ${JSON.stringify(viewMode)}`,
      async function (assert) {
        set(this.owner.lookup('service:view-parameters'), 'viewMode', viewMode);
        this.set('generateCurlStub', sinon.stub().resolves('curl!'));
        await render(hbs`<QueryBuilder::CurlGenerator
        @onGenerateCurl={{this.generateCurlStub}}
      />`);

        await click('.generate-query-request');

        assert.ok(document.querySelector('.curl-generator-modal .access-token-info'));
      }
    );
  });

  test('does not show access token information when viewMode is "public"',
    async function (assert) {
      set(this.owner.lookup('service:view-parameters'), 'viewMode', 'public');
      this.set('generateCurlStub', sinon.stub().resolves('curl!'));
      await render(hbs`<QueryBuilder::CurlGenerator
        @onGenerateCurl={{this.generateCurlStub}}
      />`);

      await click('.generate-query-request');

      assert.notOk(document.querySelector('.curl-generator-modal .access-token-info'));
    }
  );
});
