import { module, test } from 'qunit';
import { setupRenderingTest } from '../../../../helpers';
import { render, click, fillIn, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import moment from 'moment';
import SpacesProvider from 'harvester-gui-plugin-generic/services/spaces-provider';
import { typeInSearch, clickTrigger, selectChoose } from '../../../../helpers/ember-power-select';
import { setFlatpickrDate } from 'ember-flatpickr/test-support/helpers';
import QueryValueComponentsBuilder from 'harvester-gui-plugin-generic/utils/query-value-components-builder';

const numberComparators = [{
  operator: 'eq',
  symbol: '=',
}, {
  operator: 'lt',
  symbol: '<',
}, {
  operator: 'lte',
  symbol: '≤',
}, {
  operator: 'gt',
  symbol: '>',
}, {
  operator: 'gte',
  symbol: '≥',
}];
const dateComparators = numberComparators;

const comparatorTranslations = {
  'boolean.is': 'is',
  'text.contains': 'contains',
  'keyword.is': 'is',
  'space.is': 'is',
  'anyProperty.hasPhrase': 'has phrase',
};
numberComparators.forEach(({ operator, symbol }) => {
  comparatorTranslations[`number.${operator}`] = symbol;
  comparatorTranslations[`date.${operator}`] = symbol;
});

const spaces = [{
  id: 'space1Id',
  name: 'space1',
}, {
  id: 'space2Id',
  name: 'space2',
}];
let fakeClock;

const comparatorsTestData = [{
  propertyName: 'boolProp',
  propertyType: 'boolean',
  comparators: [{
    comparator: 'boolean.is',
    inputValueCallback: async function () {
      await selectChoose('.comparator-value', 'false');
    },
    notifiedInputValue: 'false',
  }],
  defaultComparator: 'boolean.is',
  defaultComparatorVisibleValue: 'true',
  isAddEnabledForDefaults: true,
}, {
  propertyName: 'textProp',
  propertyType: 'text',
  comparators: [{
    comparator: 'text.contains',
    inputValueCallback: async function () {
      await fillIn('.comparator-value', 'a | b');
    },
    notifiedInputValue: 'a | b',
  }],
  defaultComparator: 'text.contains',
  defaultComparatorVisibleValue: '',
  isAddEnabledForDefaults: false,
}, {
  propertyName: 'numberProp',
  propertyType: 'number',
  comparators: numberComparators.map(({ operator }) => ({
    comparator: `number.${operator}`,
    inputValueCallback: async function () {
      await fillIn('.comparator-value', '2');
    },
    notifiedInputValue: '2',
  })),
  defaultComparator: 'number.eq',
  defaultComparatorVisibleValue: '',
  isAddEnabledForDefaults: false,
}, {
  propertyName: 'keywordProp',
  propertyType: 'keyword',
  comparators: [{
    comparator: 'keyword.is',
    inputValueCallback: async function () {
      await fillIn('.comparator-value', 'abc');
    },
    notifiedInputValue: 'abc',
  }],
  defaultComparator: 'keyword.is',
  defaultComparatorVisibleValue: '',
  isAddEnabledForDefaults: false,
}, {
  propertyName: 'dateProp',
  propertyType: 'date',
  comparators: numberComparators.map(({ operator }) => ({
    comparator: `date.${operator}`,
    inputValueCallback: async function () {
      await click('.include-time');
      await setFlatpickrDate('.flatpickr-input', new Date(2020, 0, 2, 13, 10, 15));
    },
    notifiedInputValue: sinon.match({
      datetime: sinon.match.date,
      timeEnabled: true,
    }),
    extraNotifiedInputCheck: (assert, spy) => assert.strictEqual(
      moment(spy.lastCall.args[2].datetime).format('YYYY-MM-DD HH:mm:ss'),
      '2020-01-02 13:10:15'
    ),
  })),
  defaultComparator: 'date.eq',
  defaultComparatorVisibleValue: '2020-05-04',
  isAddEnabledForDefaults: true,
}, {
  propertyName: 'space',
  propertyType: 'space',
  comparators: [{
    comparator: 'space.is',
    inputValueCallback: async function () {
      await selectChoose('.comparator-value', 'space2');
    },
    notifiedInputValue: spaces[1],
  }],
  defaultComparator: 'space.is',
  defaultComparatorVisibleValue: 'space1',
  isAddEnabledForDefaults: true,
}, {
  propertyName: 'any property',
  propertyType: 'anyProperty',
  comparators: [{
    comparator: 'anyProperty.hasPhrase',
    inputValueCallback: async function () {
      await fillIn('.comparator-value', 'abc');
    },
    notifiedInputValue: 'abc',
  }],
  defaultComparator: 'anyProperty.hasPhrase',
  defaultComparatorVisibleValue: '',
  isAddEnabledForDefaults: false,
}];

module(
  'Integration | Component | query-builder/block-selector/condition-selector',
  (hooks) => {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
      sinon.stub(SpacesProvider.prototype, 'reloadSpaces').callsFake(function () {
        this.spaces = spaces;
      });
      this.owner.lookup('service:spaces-provider').reloadSpaces();

      this.setProperties({
        spaces,
        indexProperties: [{
          path: 'boolProp',
          type: 'boolean',
        }, {
          path: 'textProp',
          type: 'text',
        }, {
          path: 'numberProp',
          type: 'number',
        }, {
          path: 'keywordProp',
          type: 'keyword',
        }, {
          path: 'dateProp',
          type: 'date',
        }, {
          path: 'space',
          type: 'space',
        }, {
          path: 'any property',
          type: 'anyProperty',
        }],
        valuesBuilder: new QueryValueComponentsBuilder(spaces),
      });

      fakeClock = sinon.useFakeTimers({
        now: moment('2020-05-04 12:00').valueOf(),
        shouldAdvanceTime: true,
      });
    });

    hooks.afterEach(function () {
      fakeClock.restore();

      if (SpacesProvider.prototype.reloadSpaces.restore) {
        SpacesProvider.prototype.reloadSpaces.restore();
      }
    });

    test('lists index properties in dropdown', async function (assert) {
      await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
        @valuesBuilder={{this.valuesBuilder}}
        @indexProperties={{this.indexProperties}}
      />`);
      await clickTrigger('.property-selector');

      const indexProperties = this.indexProperties;
      const options = findAll('.ember-power-select-option');
      assert.strictEqual(options.length, indexProperties.length);
      indexProperties.mapBy('path').forEach((path, index) =>
        assert.dom(options[index]).hasText(path)
      );
    });

    test('filters index properties in dropdown', async function (assert) {
      await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
        @valuesBuilder={{this.valuesBuilder}}
        @indexProperties={{this.indexProperties}}
      />`);
      await clickTrigger('.property-selector');
      await typeInSearch('bool');

      const options = findAll('.ember-power-select-option');
      assert.strictEqual(options.length, 1);
      assert.dom(options[0]).hasText('boolProp');
    });

    test('hides "Add" button when no property is selected', async function (assert) {
      await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
        @valuesBuilder={{this.valuesBuilder}}
        @indexProperties={{this.indexProperties}}
      />`);

      assert.notOk(find('.accept-condition'));
    });

    test('does not show comparator selector on init', async function (assert) {
      await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
        @valuesBuilder={{this.valuesBuilder}}
        @indexProperties={{this.indexProperties}}
      />`);

      assert.notOk(find('.comparator-selector'));
    });

    test('shows comparator selector when property is selected', async function (assert) {
      await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
        @valuesBuilder={{this.valuesBuilder}}
        @indexProperties={{this.indexProperties}}
      />`);
      await selectChoose('.property-selector', 'boolProp');

      assert.ok(find('.comparator-selector'));
    });

    comparatorsTestData.forEach(({
      propertyName,
      propertyType,
      comparators,
      defaultComparator,
      defaultComparatorVisibleValue,
      isAddEnabledForDefaults,
    }) => {
      test(`shows comparators for ${propertyType} property`, async function (assert) {
        await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
          @valuesBuilder={{this.valuesBuilder}}
          @indexProperties={{this.indexProperties}}
        />`);
        await selectChoose('.property-selector', propertyName);
        if (comparators.length > 1) {
          await clickTrigger('.comparator-selector');

          const options = findAll('.ember-power-select-option');
          assert.strictEqual(options.length, comparators.length);
          comparators.forEach(({ comparator }, index) =>
            assert.dom(options[index]).hasText(comparatorTranslations[comparator])
          );
          assert.dom(find(
            '.comparator-selector .ember-power-select-selected-item'
          )).hasText(comparatorTranslations[defaultComparator]);
        } else {
          assert.dom(find('.comparator-selector'))
            .hasText(comparatorTranslations[comparators[0].comparator]);
        }
      });

      comparators.forEach(({
        comparator,
        inputValueCallback,
        notifiedInputValue,
        extraNotifiedInputCheck,
      }) => {
        const [propertyType, comparatorType] = comparator.split('.');

        test(
          `calls "onConditionSelected" callback, when ${propertyType} property "${comparatorType}" condition has been accepted`,
          async function (assert) {
            const selectedSpy = this.set('selectedSpy', sinon.spy());

            await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
              @valuesBuilder={{this.valuesBuilder}}
              @onConditionSelected={{this.selectedSpy}}
              @indexProperties={{this.indexProperties}}
            />`);

            await selectChoose('.property-selector', propertyName);
            if (comparators.length > 1) {
              await selectChoose(
                '.comparator-selector',
                comparatorTranslations[comparator]
              );
            }
            await inputValueCallback();
            await click('.accept-condition');

            assert.ok(selectedSpy.calledOnce);
            assert.ok(selectedSpy.calledWith(
              sinon.match.has('path', propertyName),
              comparator,
              notifiedInputValue
            ));

            if (extraNotifiedInputCheck) {
              extraNotifiedInputCheck(assert, selectedSpy);
            }
          }
        );

        test(
          `sets default comparator value for "${comparatorType}" comparator for ${propertyType} property`,
          async function (assert) {
            await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
              @valuesBuilder={{this.valuesBuilder}}
              @indexProperties={{this.indexProperties}}
            />`);
            await selectChoose('.property-selector', propertyName);

            const comparatorValueNode = find('.comparator-value');
            const comparatorValue = comparatorValueNode.value !== undefined ?
              comparatorValueNode.value : comparatorValueNode.textContent.trim();
            assert.strictEqual(comparatorValue, defaultComparatorVisibleValue);
          }
        );

        test(
          `${isAddEnabledForDefaults ? 'does not block' : 'blocks'} "Add" button when ${propertyType} property "${comparatorType}" condition has default comparator value`,
          async function (assert) {
            await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
              @valuesBuilder={{this.valuesBuilder}}
              @indexProperties={{this.indexProperties}}
            />`);

            await selectChoose('.property-selector', propertyName);

            const addBtn = find('.accept-condition');
            if (isAddEnabledForDefaults) {
              assert.dom(addBtn).doesNotHaveAttribute('disabled');
            } else {
              assert.dom(addBtn).hasAttribute('disabled');
            }
          }
        );
      });
    });

    numberComparators.forEach(({ operator, symbol }) => {
      test(
        `blocks "Add" button when number property "${operator}" condition has a non-number condition value`,
        async function (assert) {
          await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
            @valuesBuilder={{this.valuesBuilder}}
            @indexProperties={{this.indexProperties}}
          />`);

          await selectChoose('.property-selector', 'numberProp');
          await selectChoose('.comparator-selector', symbol);
          await fillIn('.comparator-value', 'xyz');

          assert.dom(find('.accept-condition')).hasAttribute('disabled');
        }
      );
    });

    dateComparators.forEach(({ operator, symbol }) => {
      test(
        `sets default comparator value for "${operator}" comparator for date property (time enabled)`,
        async function (assert) {
          await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
            @valuesBuilder={{this.valuesBuilder}}
            @indexProperties={{this.indexProperties}}
          />`);
          await selectChoose('.property-selector', 'dateProp');
          await selectChoose('.comparator-selector', symbol);
          await click('.include-time');

          assert.dom(find('.comparator-value')).hasValue('2020-05-04 00:00:00');
        }
      );
    });

    test(
      'blocks "Add" button when space property "is" condition has empty condition value',
      async function (assert) {
        // simulate no space to choose
        this.spaces.clear();
        await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
          @valuesBuilder={{this.valuesBuilder}}
          @indexProperties={{this.indexProperties}}
        />`);

        await selectChoose('.property-selector', 'space');

        assert.dom(find('.accept-condition')).hasAttribute('disabled');
      }
    );
  }
);
