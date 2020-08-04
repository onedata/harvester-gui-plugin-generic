import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click, fillIn } from '@ember/test-helpers';
import moment from 'moment';
import SpacesProvider from 'harvester-gui-plugin-generic/services/spaces-provider';
import { typeInSearch, clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import { setFlatpickrDate } from 'ember-flatpickr/test-support/helpers';

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

describe(
  'Integration | Component | query-builder/block-selector/condition-selector',
  function () {
    setupRenderingTest();

    beforeEach(function () {
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
      });

      fakeClock = sinon.useFakeTimers({
        now: moment('2020-05-04 12:00').valueOf(),
        shouldAdvanceTime: true,
      });
    });

    afterEach(function () {
      fakeClock.restore();

      if (SpacesProvider.prototype.reloadSpaces.restore) {
        SpacesProvider.prototype.reloadSpaces.restore();
      }
    });

    it('lists index properties in dropdown', async function () {
      await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
        @indexProperties={{this.indexProperties}}
      />`);
      await clickTrigger('.property-selector');

      const indexProperties = this.get('indexProperties');
      const options = this.element.querySelectorAll('.ember-power-select-option');
      expect(options).to.have.length(indexProperties.length);
      indexProperties.mapBy('path').forEach((path, index) =>
        expect(options[index].textContent.trim()).to.equal(path)
      );
    });

    it('filters index properties in dropdown', async function () {
      await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
        @indexProperties={{this.indexProperties}}
      />`);
      await clickTrigger('.property-selector');
      await typeInSearch('bool');

      const options = this.element.querySelectorAll('.ember-power-select-option');
      expect(options).to.have.length(1);
      expect(options[0].textContent.trim()).to.equal('boolProp');
    });

    it('blocks "Add" button when no property is selected', async function () {
      await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
        @indexProperties={{this.indexProperties}}
      />`);

      expect(this.element.querySelector('.accept-condition')).to.have.attr('disabled');
    });

    it('does not show comparator selector on init', async function () {
      await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
        @indexProperties={{this.indexProperties}}
      />`);

      expect(this.element.querySelector('.comparator-selector')).to.not.exist;
    });

    it('shows comparator selector when propery is selected', async function () {
      await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
        @indexProperties={{this.indexProperties}}
      />`);
      await selectChoose('.property-selector', 'boolProp');

      expect(this.element.querySelector('.comparator-selector')).to.exist;
    });

    [{
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
        extraNotifiedInputCheck: spy => expect(
          moment(spy.lastCall.args[2].datetime).format('YYYY-MM-DD HH:mm:ss')
        ).to.equal('2020-01-02 13:10:15'),
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
    }].forEach(({
      propertyName,
      propertyType,
      comparators,
      defaultComparator,
      defaultComparatorVisibleValue,
      isAddEnabledForDefaults,
    }) => {
      it(`shows comparators for ${propertyType} property`, async function () {
        await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
          @indexProperties={{this.indexProperties}}
        />`);
        await selectChoose('.property-selector', propertyName);
        await clickTrigger('.comparator-selector');

        const options = this.element.querySelectorAll('.ember-power-select-option');
        expect(options).to.have.length(comparators.length);
        comparators.forEach(({ comparator }, index) =>
          expect(options[index].textContent.trim())
          .to.equal(comparatorTranslations[comparator])
        );
        expect(this.element.querySelector(
          '.comparator-selector .ember-power-select-selected-item'
        ).textContent.trim()).to.equal(comparatorTranslations[defaultComparator]);
      });

      comparators.forEach(({
        comparator,
        inputValueCallback,
        notifiedInputValue,
        extraNotifiedInputCheck,
      }) => {
        const [propertyType, comparatorName] = comparator.split('.');

        it(
          `calls "onConditionSelected" callback, when ${propertyType} property "${comparatorName}" condition has been accepted`,
          async function () {
            const selectedSpy = this.set('selectedSpy', sinon.spy());

            await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
              @onConditionSelected={{this.selectedSpy}}
              @indexProperties={{this.indexProperties}}
            />`);

            await selectChoose('.property-selector', propertyName);
            await selectChoose(
              '.comparator-selector',
              comparatorTranslations[comparator]
            );
            await inputValueCallback(this.element);
            await click('.accept-condition');

            expect(selectedSpy).to.be.calledOnce.and.to.be.calledWith(
              sinon.match.has('path', propertyName),
              comparator,
              notifiedInputValue
            );

            if (extraNotifiedInputCheck) {
              extraNotifiedInputCheck(selectedSpy);
            }
          }
        );

        it(
          `sets default comparator value for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
              @indexProperties={{this.indexProperties}}
            />`);
            await selectChoose('.property-selector', propertyName);

            const comparatorValueNode = this.element.querySelector('.comparator-value');
            const comparatorValue = comparatorValueNode.value !== undefined ?
              comparatorValueNode.value : comparatorValueNode.textContent.trim();
            expect(comparatorValue).to.equal(defaultComparatorVisibleValue);
          }
        );

        it(
          `${isAddEnabledForDefaults ? 'does not block' : 'blocks'} "Add" button when ${propertyType} property "${comparatorName}" condition has default comparator value`,
          async function () {
            await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
              @indexProperties={{this.indexProperties}}
            />`);

            await selectChoose('.property-selector', propertyName);

            const addBtn = this.element.querySelector('.accept-condition');
            if (isAddEnabledForDefaults) {
              expect(addBtn).to.not.have.attr('disabled');
            } else {
              expect(addBtn).to.have.attr('disabled');
            }
          }
        );
      });
    });

    numberComparators.forEach(({ operator, symbol }) => {
      it(
        `blocks "Add" button when number property "${operator}" condition has a non-number condition value`,
        async function () {
          await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
            @indexProperties={{this.indexProperties}}
          />`);

          await selectChoose('.property-selector', 'numberProp');
          await selectChoose('.comparator-selector', symbol);
          await fillIn('.comparator-value', 'xyz');

          expect(this.element.querySelector('.accept-condition')).to.have.attr('disabled');
        }
      );
    });

    dateComparators.forEach(({ operator, symbol }) => {
      it(
        `sets default comparator value for "${operator}" comparator for date property (time enabled)`,
        async function () {
          await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
            @indexProperties={{this.indexProperties}}
          />`);
          await selectChoose('.property-selector', 'dateProp');
          await selectChoose('.comparator-selector', symbol);
          await click('.include-time');

          expect(this.element.querySelector('.comparator-value'))
            .to.have.value('2020-05-04 00:00:00');
        }
      );
    });

    it(
      'blocks "Add" button when space property "is" condition has empty condition value',
      async function () {
        // simulate no space to choose
        this.get('spaces').clear();
        await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
          @indexProperties={{this.indexProperties}}
        />`);

        await selectChoose('.property-selector', 'space');

        expect(this.element.querySelector('.accept-condition')).to.have.attr('disabled');
      }
    );
  }
);
