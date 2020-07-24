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
  name: 'eq',
  symbol: '=',
}, {
  name: 'lt',
  symbol: '<',
}, {
  name: 'lte',
  symbol: '≤',
}, {
  name: 'gt',
  symbol: '>',
}, {
  name: 'gte',
  symbol: '≥',
}];
const dateComparators = numberComparators;
let fakeClock;

describe(
  'Integration | Component | query-builder/block-selector/condition-selector',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      const spaces = [{
        id: 'space1Id',
        name: 'space1',
      }, {
        id: 'space2Id',
        name: 'space2',
      }];
      sinon.stub(SpacesProvider.prototype, 'loadSpaces').callsFake(function () {
        this.spaces = spaces;
      });

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

      if (SpacesProvider.prototype.loadSpaces.restore) {
        SpacesProvider.prototype.loadSpaces.restore();
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

    it('shows only "is" comparator for boolean property', async function () {
      await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
        @indexProperties={{this.indexProperties}}
      />`);
      await selectChoose('.property-selector', 'boolProp');
      await clickTrigger('.comparator-selector');

      const options = this.element.querySelectorAll('.ember-power-select-option');
      expect(options).to.have.length(1);
      expect(options[0].textContent.trim()).to.equal('is');
      expect(this.element.querySelector(
        '.comparator-selector .ember-power-select-selected-item'
      ).textContent.trim()).to.equal('is');
    });

    it(
      'sets default comparator value for "is" comparator for boolean property',
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
          @indexProperties={{this.indexProperties}}
        />`);
        await selectChoose('.property-selector', 'boolProp');

        expect(this.element.querySelector(
          '.comparator-value .ember-power-select-selected-item'
        ).textContent.trim()).to.equal('true');
      }
    );

    it(
      'calls "onConditionSelected" callback, when boolean property "is" condition has been accepted',
      async function () {
        const selectedSpy = this.set('selectedSpy', sinon.spy());

        await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
          @onConditionSelected={{this.selectedSpy}}
          @indexProperties={{this.indexProperties}}
        />`);

        await selectChoose('.property-selector', 'boolProp');
        await selectChoose('.comparator-value', 'false');
        await click('.accept-condition');

        expect(selectedSpy).to.be.calledOnce.and.to.be.calledWith(
          sinon.match.has('path', 'boolProp'),
          'boolean.is',
          'false'
        );
      }
    );

    it(
      'does not block "Add" button when boolean property "is" condition has default value',
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
          @indexProperties={{this.indexProperties}}
        />`);

        await selectChoose('.property-selector', 'boolProp');

        expect(this.element.querySelector('.accept-condition'))
          .to.not.have.attr('disabled');
      }
    );

    it('shows only "contains" comparator for text property', async function () {
      await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
        @indexProperties={{this.indexProperties}}
      />`);
      await selectChoose('.property-selector', 'textProp');
      await clickTrigger('.comparator-selector');

      const options = this.element.querySelectorAll('.ember-power-select-option');
      expect(options).to.have.length(1);
      expect(options[0].textContent.trim()).to.equal('contains');
      expect(this.element.querySelector(
        '.comparator-selector .ember-power-select-selected-item'
      ).textContent.trim()).to.equal('contains');
    });

    it(
      'calls "onConditionSelected" callback, when text property "contains" condition has been accepted',
      async function () {
        const selectedSpy = this.set('selectedSpy', sinon.spy());

        await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
          @onConditionSelected={{this.selectedSpy}}
          @indexProperties={{this.indexProperties}}
        />`);

        await selectChoose('.property-selector', 'textProp');
        await fillIn('.comparator-value', 'a | b');
        await click('.accept-condition');

        expect(selectedSpy).to.be.calledOnce.and.to.be.calledWith(
          sinon.match.has('path', 'textProp'),
          'text.contains',
          'a | b'
        );
      }
    );

    it(
      'blocks "Add" button when text property "contains" condition has empty condition value',
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
          @indexProperties={{this.indexProperties}}
        />`);

        await selectChoose('.property-selector', 'textProp');
        await fillIn('.comparator-value', '');

        expect(this.element.querySelector('.accept-condition')).to.have.attr('disabled');
      }
    );

    it('shows number comparators for number property', async function () {
      await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
        @indexProperties={{this.indexProperties}}
      />`);
      await selectChoose('.property-selector', 'numberProp');
      await clickTrigger('.comparator-selector');

      const options = this.element.querySelectorAll('.ember-power-select-option');
      expect(options).to.have.length(5);
      numberComparators.mapBy('symbol').forEach((comparator, index) =>
        expect(options[index].textContent.trim()).to.equal(comparator)
      );
      expect(this.element.querySelector(
        '.comparator-selector .ember-power-select-selected-item'
      ).textContent.trim()).to.equal('=');
    });

    numberComparators.forEach(({ name, symbol }) => {
      it(
        `calls "onConditionSelected" callback, when number property "${symbol}" condition has been accepted`,
        async function () {
          const selectedSpy = this.set('selectedSpy', sinon.spy());

          await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
            @onConditionSelected={{this.selectedSpy}}
            @indexProperties={{this.indexProperties}}
          />`);

          await selectChoose('.property-selector', 'numberProp');
          await selectChoose('.comparator-selector', symbol);
          await fillIn('.comparator-value', '2');
          await click('.accept-condition');

          expect(selectedSpy).to.be.calledOnce.and.to.be.calledWith(
            sinon.match.has('path', 'numberProp'),
            `number.${name}`,
            '2'
          );
        }
      );

      it(
        `blocks "Add" button when number property "${symbol}" condition has empty condition value`,
        async function () {
          await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
            @indexProperties={{this.indexProperties}}
          />`);

          await selectChoose('.property-selector', 'numberProp');
          await selectChoose('.comparator-selector', symbol);

          expect(this.element.querySelector('.accept-condition')).to.have.attr('disabled');
        }
      );

      it(
        `blocks "Add" button when number property "${symbol}" condition has a non-number condition value`,
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

    it('shows only "is" comparator for keyword property', async function () {
      await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
        @indexProperties={{this.indexProperties}}
      />`);
      await selectChoose('.property-selector', 'keywordProp');
      await clickTrigger('.comparator-selector');

      const options = this.element.querySelectorAll('.ember-power-select-option');
      expect(options).to.have.length(1);
      expect(options[0].textContent.trim()).to.equal('is');
      expect(this.element.querySelector(
        '.comparator-selector .ember-power-select-selected-item'
      ).textContent.trim()).to.equal('is');
    });

    it(
      'calls "onConditionSelected" callback, when keyword property "is" condition has been accepted',
      async function () {
        const selectedSpy = this.set('selectedSpy', sinon.spy());

        await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
          @onConditionSelected={{this.selectedSpy}}
          @indexProperties={{this.indexProperties}}
        />`);

        await selectChoose('.property-selector', 'keywordProp');
        await fillIn('.comparator-value', 'abc');
        await click('.accept-condition');

        expect(selectedSpy).to.be.calledOnce.and.to.be.calledWith(
          sinon.match.has('path', 'keywordProp'),
          'keyword.is',
          'abc'
        );
      }
    );

    it(
      'blocks "Add" button when keyword property "is" condition has empty condition value',
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
          @indexProperties={{this.indexProperties}}
        />`);

        await selectChoose('.property-selector', 'keywordProp');
        await fillIn('.comparator-value', '');

        expect(this.element.querySelector('.accept-condition')).to.have.attr('disabled');
      }
    );

    it('shows date comparators for date property', async function () {
      await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
        @indexProperties={{this.indexProperties}}
      />`);
      await selectChoose('.property-selector', 'dateProp');
      await clickTrigger('.comparator-selector');

      const options = this.element.querySelectorAll('.ember-power-select-option');
      expect(options).to.have.length(5);
      dateComparators.mapBy('symbol').forEach((comparator, index) =>
        expect(options[index].textContent.trim()).to.equal(comparator)
      );
      expect(this.element.querySelector(
        '.comparator-selector .ember-power-select-selected-item'
      ).textContent.trim()).to.equal('=');
    });

    numberComparators.forEach(({ name, symbol }) => {
      it(
        `sets default comparator value for "${symbol}" comparator for date property`,
        async function () {
          await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
            @indexProperties={{this.indexProperties}}
          />`);
          await selectChoose('.property-selector', 'dateProp');
          await selectChoose('.comparator-selector', symbol);

          expect(this.element.querySelector('.comparator-value'))
            .to.exist.and.to.have.value('2020-05-04');
        }
      );

      it(
        `sets default comparator value for "${symbol}" comparator for date property (time enabled)`,
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

      it(
        `calls "onConditionSelected" callback, when date property "${symbol}" condition has been accepted`,
        async function () {
          const selectedSpy = this.set('selectedSpy', sinon.spy());

          await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
              @onConditionSelected={{this.selectedSpy}}
              @indexProperties={{this.indexProperties}}
            />`);

          await selectChoose('.property-selector', 'dateProp');
          await selectChoose('.comparator-selector', symbol);
          await click('.include-time');
          await setFlatpickrDate('.flatpickr-input', new Date(2020, 0, 2, 13, 10, 15));
          await click('.accept-condition');

          expect(selectedSpy).to.be.calledOnce.and.to.be.calledWith(
            sinon.match.has('path', 'dateProp'),
            `date.${name}`,
            sinon.match({
              datetime: sinon.match.date,
              timeEnabled: true,
            })
          );
          expect(
            moment(selectedSpy.lastCall.args[2].datetime).format('YYYY-MM-DD HH:mm:ss')
          ).to.equal('2020-01-02 13:10:15');
        }
      );
    });

    it('shows only "is" comparator for space property', async function () {
      await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
        @indexProperties={{this.indexProperties}}
      />`);
      await selectChoose('.property-selector', 'space');
      await clickTrigger('.comparator-selector');

      const options = this.element.querySelectorAll('.ember-power-select-option');
      expect(options).to.have.length(1);
      expect(options[0].textContent.trim()).to.equal('is');
      expect(this.element.querySelector(
        '.comparator-selector .ember-power-select-selected-item'
      ).textContent.trim()).to.equal('is');
    });

    it(
      'sets default comparator value for "is" comparator for space property',
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
          @indexProperties={{this.indexProperties}}
        />`);
        await selectChoose('.property-selector', 'space');

        expect(this.element.querySelector(
          '.comparator-value .ember-power-select-selected-item'
        ).textContent.trim()).to.equal('space1');
      }
    );

    it(
      'calls "onConditionSelected" callback, when space property "is" condition has been accepted',
      async function () {
        const selectedSpy = this.set('selectedSpy', sinon.spy());

        await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
          @onConditionSelected={{this.selectedSpy}}
          @indexProperties={{this.indexProperties}}
        />`);

        await selectChoose('.property-selector', 'space');
        await selectChoose('.comparator-value', 'space2');
        await click('.accept-condition');

        expect(selectedSpy).to.be.calledOnce.and.to.be.calledWith(
          sinon.match.has('path', 'space'),
          'space.is',
          sinon.match({ id: 'space2Id', name: 'space2' })
        );
      }
    );

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

    it('shows only "is" comparator for anyProperty property', async function () {
      await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
        @indexProperties={{this.indexProperties}}
      />`);
      await selectChoose('.property-selector', 'any property');
      await clickTrigger('.comparator-selector');

      const options = this.element.querySelectorAll('.ember-power-select-option');
      expect(options).to.have.length(1);
      expect(options[0].textContent.trim()).to.equal('has phrase');
      expect(this.element.querySelector(
        '.comparator-selector .ember-power-select-selected-item'
      ).textContent.trim()).to.equal('has phrase');
    });

    it(
      'calls "onConditionSelected" callback, when anyProperty property "hasPhrase" condition has been accepted',
      async function () {
        const selectedSpy = this.set('selectedSpy', sinon.spy());

        await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
          @onConditionSelected={{this.selectedSpy}}
          @indexProperties={{this.indexProperties}}
        />`);

        await selectChoose('.property-selector', 'any property');
        await fillIn('.comparator-value', 'abc def');
        await click('.accept-condition');

        expect(selectedSpy).to.be.calledOnce.and.to.be.calledWith(
          sinon.match.has('path', 'any property'),
          'anyProperty.hasPhrase',
          'abc def'
        );
      }
    );

    it(
      'blocks "Add" button when anyProperty property "hasPhrase" condition has empty condition value',
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector::ConditionSelector
          @indexProperties={{this.indexProperties}}
        />`);

        await selectChoose('.property-selector', 'any property');
        await fillIn('.comparator-value', '');

        expect(this.element.querySelector('.accept-condition')).to.have.attr('disabled');
      }
    );
  }
);
