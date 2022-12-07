import { expect } from 'chai';
import { describe, context, it, beforeEach, afterEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import { click, fillIn, blur, triggerKeyEvent } from '@ember/test-helpers';
import { isFlatpickrOpen, setFlatpickrDate, closeFlatpickrDate } from 'ember-flatpickr/test-support/helpers';
import moment from 'moment';
import SpacesProvider from 'harvester-gui-plugin-generic/services/spaces-provider';
import QueryValueComponentsBuilder from 'harvester-gui-plugin-generic/utils/query-value-components-builder';

const mathOperators = ['eq', 'lt', 'lte', 'gt', 'gte'];

const spaces = [{
  id: 'space1Id',
  name: 'space1',
}, {
  id: 'space2Id',
  name: 'space2',
}];

describe(
  'Integration | Component | query-builder/condition-comparator-value-editor',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      sinon.stub(SpacesProvider.prototype, 'reloadSpaces').callsFake(function () {
        this.spaces = spaces;
      });
      this.owner.lookup('service:spaces-provider').reloadSpaces();
      this.valuesBuilder = new QueryValueComponentsBuilder(spaces);
    });

    afterEach(function () {
      if (SpacesProvider.prototype.reloadSpaces.restore) {
        SpacesProvider.prototype.reloadSpaces.restore();
      }
    });

    context('in view mode', function () {
      [{
        comparator: 'boolean.is',
        value: 'false',
        viewValue: 'false',
      }, {
        comparator: 'text.contains',
        value: 'a | b',
        viewValue: '"a | b"',
      }, {
        comparator: 'number.eq',
        value: '2',
        viewValue: '2',
      }, {
        comparator: 'date.eq',
        value: { timeEnabled: false, datetime: new Date(2020, 0, 2) },
        viewValue: '2020-01-02',
      }, {
        comparator: 'date.eq',
        value: {
          timeEnabled: true,
          datetime: new Date(2020, 0, 2, 12, 5, 40),
        },
        viewValue: '2020-01-02 12:05:40',
        descriptionSuffix: ' with truthy timeEnabled',
      }, {
        comparator: 'space.is',
        value: { id: 'space1Id', name: 'space1' },
        viewValue: 'space1',
      }, {
        comparator: 'anyProperty.hasPhrase',
        value: 'abc def',
        viewValue: '"abc def"',
      }].forEach(({ comparator, value, viewValue, descriptionSuffix }) => {
        const [propertyType, comparatorType] = comparator.split('.');
        it(
          `shows comparator value for "${comparatorType}" comparator for ${propertyType} property${descriptionSuffix || ''}`,
          async function () {
            this.setProperties({
              comparator,
              value,
            });

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="view"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value={{this.value}}
            />`);

            expect(this.element.querySelector('.comparator-value').textContent.trim())
              .to.equal(viewValue);
          }
        );
      });

      it('calls "onStartEdit" on click', async function () {
        const onStartEditSpy = this.set('onStartEditSpy', sinon.spy());

        await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
          @mode="view"
          @valuesBuilder={{this.valuesBuilder}}
          @comparator="boolean.is"
          @value="false"
          @onStartEdit={{this.onStartEditSpy}}
        />`);
        await click('.comparator-value');

        expect(onStartEditSpy).to.be.calledOnce;
      });
    });

    context('in create mode', function () {
      [{
        comparator: 'text.contains',
        valueToInput: 'abc',
      }, ...mathOperators.map(operator => ({
        comparator: `number.${operator}`,
        valueToInput: '2',
      })), {
        comparator: 'keyword.is',
        valueToInput: 'abc',
      }, {
        comparator: 'anyProperty.hasPhrase',
        valueToInput: 'abc',
      }].forEach(({ comparator, valueToInput }) => {
        const [propertyType, comparatorType] = comparator.split('.');

        it(
          `shows text input for "${comparatorType}" comparator for ${propertyType} property`,
          async function () {
            this.set('comparator', comparator);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="create"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
            />`);

            expect(this.element.querySelector('input[type="text"].comparator-value'))
              .to.exist;
          }
        );

        it(
          `calls "onValueChange" callback, when ${propertyType} property "${comparatorType}" condition value has changed`,
          async function () {
            const { changeSpy } = this.setProperties({
              comparator,
              changeSpy: sinon.spy(),
            });

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="create"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @onValueChange={{this.changeSpy}}
            />`);
            await fillIn('.comparator-value', valueToInput);

            expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(valueToInput);
          }
        );
      });

      [{
        comparator: 'boolean.is',
        options: ['true', 'false'],
        toSelect: 'false',
        selectedValue: 'false',
      }, {
        comparator: 'space.is',
        options: ['space1', 'space2'],
        toSelect: 'space2',
        selectedValue: spaces[1],
      }].forEach(({ comparator, options, toSelect, selectedValue }) => {
        const [propertyType, comparatorType] = comparator.split('.');

        it(
          `shows dropdown for "${comparatorType}" comparator for ${propertyType} property`,
          async function () {
            this.set('comparator', comparator);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="create"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
            />`);
            await clickTrigger('.comparator-value');

            const optionsNodes =
              this.element.querySelectorAll('.ember-power-select-option');
            expect(optionsNodes).to.have.length(options.length);
            options.forEach((option, index) =>
              expect(optionsNodes[index].textContent.trim()).to.equal(option)
            );
          }
        );

        it(
          `calls "onValueChange" callback, when ${propertyType} property "${comparatorType}" condition value has changed`,
          async function () {
            const { changeSpy } = this.setProperties({
              comparator,
              changeSpy: sinon.spy(),
            });

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="create"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @onValueChange={{this.changeSpy}}
            />`);
            await selectChoose('.comparator-value', toSelect);

            expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(selectedValue);
          }
        );
      });

      mathOperators.forEach(operator => {
        it(
          `shows flatpickr input without time for "${operator}" comparator for date property`,
          async function () {
            this.setProperties({
              value: {
                datetime: moment('2020-05-04 12:00').toDate(),
                timeEnabled: false,
              },
              comparator: `date.${operator}`,
            });
            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="create"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value={{this.value}}
            />`);

            expect(this.element.querySelector('.comparator-value'))
              .to.exist.and.to.have.value('2020-05-04');
            expect(this.element.querySelector('.flatpickr-calendar')).to.exist;
            expect(this.element.querySelector('.flatpickr-time.hasSeconds')).to.not.exist;
          }
        );

        it(
          `allows to enable time flatpickr input for "${operator}" comparator for date property`,
          async function () {
            const { changeSpy } = this.setProperties({
              value: {
                datetime: moment('2020-05-04 12:00').toDate(),
                timeEnabled: false,
              },
              comparator: `date.${operator}`,
              changeSpy: sinon.stub().callsFake(value => {
                this.set('value', value);
              }),
            });

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="create"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value={{this.value}}
              @onValueChange={{this.changeSpy}}
            />`);
            await click('.include-time');

            expect(changeSpy).to.be.calledOnce.and.to.be.calledWith({
              datetime: sinon.match.date,
              timeEnabled: true,
            });
            expect(this.element.querySelector('.comparator-value'))
              .to.have.value('2020-05-04 12:00:00');
            expect(this.element.querySelector('.flatpickr-time.hasSeconds')).to.exist;
          }
        );

        it(
          `calls "onValueChange" callback, when date property "${operator}" condition value has changed`,
          async function () {
            const { changeSpy } = this.setProperties({
              value: {
                datetime: moment('2020-05-04 12:00').toDate(),
                timeEnabled: false,
              },
              comparator: `date.${operator}`,
              changeSpy: sinon.stub().callsFake(value => {
                this.set('value', value);
              }),
            });

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="create"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value={{this.value}}
              @onValueChange={{this.changeSpy}}
            />`);
            await click('.include-time');
            await setFlatpickrDate('.flatpickr-input', new Date(2020, 0, 2, 13, 10, 15));

            expect(changeSpy).to.be.calledTwice.and.to.be.calledWith({
              datetime: sinon.match.date,
              timeEnabled: true,
            });
            expect(
              moment(changeSpy.lastCall.args[0].datetime).format('YYYY-MM-DD HH:mm:ss')
            ).to.equal('2020-01-02 13:10:15');
          }
        );
      });
    });

    context('in edit mode', function () {
      [
        'text.contains',
        ...mathOperators.map(operator => `number.${operator}`),
        'keyword.is',
        'anyProperty.hasPhrase',
      ].forEach(comparator => {
        const [propertyType, comparatorType] = comparator.split('.');
        const beforeTest = testCase => testCase.set('comparator', comparator);

        it(
          `has focused editor on init for "${comparatorType}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value="abc"
            />`);

            expect(this.element.querySelector('.comparator-value'))
              .to.equal(document.activeElement);
          }
        );

        it(
          `shows current comparator value for "${comparatorType}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value="abc"
            />`);

            expect(this.element.querySelector('.comparator-value')).to.have.value('abc');
          }
        );

        it(
          `closes editor and notifies about new value for "${comparatorType}" comparator for ${propertyType} property (close using Enter)`,
          async function () {
            beforeTest(this);
            const {
              changeSpy,
              finishEditSpy,
            } = this.setProperties({
              changeSpy: sinon.spy(),
              finishEditSpy: sinon.spy(),
            });

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value="abc"
              @onValueChange={{this.changeSpy}}
              @onFinishEdit={{this.finishEditSpy}}
            />`);
            await fillIn('.comparator-value', 'def');
            await triggerKeyEvent('.comparator-value', 'keydown', 'Enter');

            expect(changeSpy).to.be.calledWith('def');
            expect(finishEditSpy).to.be.calledOnce;
          }
        );

        it(
          `closes editor and notifies about new value for "${comparatorType}" comparator for ${propertyType} property (close using blur)`,
          async function () {
            beforeTest(this);
            const {
              changeSpy,
              finishEditSpy,
            } = this.setProperties({
              changeSpy: sinon.spy(),
              finishEditSpy: sinon.spy(),
            });

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value="abc"
              @onValueChange={{this.changeSpy}}
              @onFinishEdit={{this.finishEditSpy}}
            />`);
            await fillIn('.comparator-value', 'def');
            await blur('.comparator-value');

            expect(changeSpy).to.be.calledWith('def');
            expect(finishEditSpy).to.be.calledOnce;
          }
        );

        it(
          `notifies about partial new value before close for "${comparatorType}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);
            const {
              changeSpy,
              finishEditSpy,
            } = this.setProperties({
              changeSpy: sinon.spy(),
              finishEditSpy: sinon.spy(),
            });

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value="abc"
              @onValueChange={{this.changeSpy}}
              @onFinishEdit={{this.finishEditSpy}}
            />`);
            await fillIn('.comparator-value', 'de');

            expect(changeSpy).to.be.calledWith('de');
            expect(finishEditSpy).to.not.be.called;
          }
        );

        it(
          `cancels editor on Escape key down for "${comparatorType}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);
            const {
              finishEditSpy,
              cancelEditSpy,
            } = this.setProperties({
              finishEditSpy: sinon.spy(),
              cancelEditSpy: sinon.spy(),
            });

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value="abc"
              @onFinishEdit={{this.finishEditSpy}}
              @onCancelEdit={{this.cancelEditSpy}}
            />`);
            await triggerKeyEvent('.comparator-value', 'keydown', 'Escape');

            expect(finishEditSpy).to.not.be.called;
            expect(cancelEditSpy).to.be.calledOnce;
          }
        );

        it(
          `does not add class "is-invalid" to the input by default for "${comparatorType}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value="abc"
            />`);

            expect(this.element.querySelector('.comparator-value'))
              .to.not.have.class('is-invalid');
          }
        );

        it(
          `adds class "is-invalid" to the input if isValueInvalid is true for "${comparatorType}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @isValueInvalid={{true}}
              @value="abc"
            />`);

            expect(this.element.querySelector('.comparator-value'))
              .to.have.class('is-invalid');
          }
        );
      });

      [{
        comparator: 'boolean.is',
        initialValue: 'false',
        initialTriggerValue: 'false',
        optionsCount: 2,
        stringToSelect: 'true',
        selectionResult: 'true',
      }, {
        comparator: 'space.is',
        initialValue: spaces[0],
        initialTriggerValue: 'space1',
        optionsCount: 2,
        stringToSelect: 'space2',
        selectionResult: spaces[1],
      }].forEach(({
        comparator,
        initialValue,
        initialTriggerValue,
        optionsCount,
        stringToSelect,
        selectionResult,
      }) => {
        const [propertyType, comparatorType] = comparator.split('.');
        const beforeTest = testCase => testCase.setProperties({
          comparator,
          value: initialValue,
        });

        it(
          `has focused editor on init for "${comparatorType}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value="abc"
            />`);

            expect(
              this.element.querySelector('.comparator-value')
            ).to.equal(document.activeElement);
          }
        );

        it(
          `shows current comparator value for "${comparatorType}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value={{this.value}}
            />`);

            expect(this.element.querySelector(
              '.comparator-value .ember-power-select-selected-item'
            ).textContent.trim()).to.equal(initialTriggerValue);
          }
        );

        it(
          `shows expanded dropdown for "${comparatorType}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value={{this.value}}
            />`);

            const options = this.element.querySelectorAll('.ember-power-select-option');
            expect(options).to.have.length(optionsCount);
          }
        );

        it(
          `closes editor and notifies about new value for "${comparatorType}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);
            const {
              changeSpy,
              finishEditSpy,
            } = this.setProperties({
              changeSpy: sinon.spy(),
              finishEditSpy: sinon.spy(),
            });

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value={{this.value}}
              @onValueChange={{this.changeSpy}}
              @onFinishEdit={{this.finishEditSpy}}
            />`);
            await selectChoose('.comparator-value', stringToSelect);

            expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(selectionResult);
            expect(finishEditSpy).to.be.calledOnce;
          }
        );

        it(
          `closes editor for "${comparatorType}" comparator for ${propertyType} property on dropdown trigger click`,
          async function () {
            beforeTest(this);
            const finishEditSpy = this.set('finishEditSpy', sinon.spy());

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value={{this.value}}
              @onFinishEdit={{this.finishEditSpy}}
            />`);
            await clickTrigger('.comparator-value');

            expect(finishEditSpy).to.be.calledOnce;
          }
        );
      });

      it(
        'shows current comparator value and opened flatpickr for "lt" comparator for date property',
        async function () {
          this.set('value', {
            datetime: moment('2020-05-04 12:00').toDate(),
            timeEnabled: true,
          });

          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="edit"
            @valuesBuilder={{this.valuesBuilder}}
            @comparator="date.lt"
            @value={{this.value}}
          />`);

          expect(this.element.querySelector('.comparator-value'))
            .to.have.value('2020-05-04 12:00:00');
          expect(this.element.querySelector('.include-time')).to.have.class('active');
          expect(isFlatpickrOpen()).to.be.true;
        }
      );

      mathOperators.forEach(operator => {
        const comparator = `date.${operator}`;

        it(
          `closes editor for "${operator}" comparator for date property on flatpickr close`,
          async function () {
            const { finishEditSpy } = this.setProperties({
              value: {
                datetime: moment('2020-05-04 12:00').toDate(),
                timeEnabled: false,
              },
              comparator,
              finishEditSpy: sinon.spy(),
            });

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value={{this.value}}
              @onFinishEdit={{this.finishEditSpy}}
            />`);
            await closeFlatpickrDate('.flatpickr-input');

            expect(finishEditSpy).to.be.calledOnce;
          }
        );

        it(
          `toggle of "time-enabled" button does not turn off editor of "${operator}" comparator for date property`,
          async function () {
            const {
              finishEditSpy,
              valueChangeStub,
            } = this.setProperties({
              value: {
                datetime: moment('2020-05-04 12:00').toDate(),
                timeEnabled: false,
              },
              comparator,
              finishEditSpy: sinon.spy(),
              valueChangeStub: sinon.stub().callsFake(value => this.set('value', value)),
            });

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value={{this.value}}
              @onValueChange={{this.valueChangeStub}}
              @onFinishEdit={{this.finishEditSpy}}
            />`);
            await click('.include-time');

            expect(isFlatpickrOpen()).to.be.true;
            expect(this.element.querySelector('.flatpickr-time.hasSeconds')).to.exist;
            expect(finishEditSpy).to.not.be.called;
            expect(valueChangeStub).to.be.calledWith(sinon.match({
              datetime: sinon.match.date,
              timeEnabled: true,
            }));
          }
        );

        it(
          `notifies about changed value of "${operator}" comparator for date property`,
          async function () {
            const {
              finishEditSpy,
              valueChangeSpy,
            } = this.setProperties({
              value: {
                datetime: moment('2020-05-04 12:00').toDate(),
                timeEnabled: false,
              },
              comparator,
              finishEditSpy: sinon.spy(),
              valueChangeSpy: sinon.spy(),
            });

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value={{this.value}}
              @onValueChange={{this.valueChangeSpy}}
              @onFinishEdit={{this.finishEditSpy}}
            />`);
            await setFlatpickrDate('.flatpickr-input', new Date(2020, 0, 2));

            expect(finishEditSpy).to.not.be.called;
            expect(valueChangeSpy).to.be.calledWith(sinon.match({
              datetime: sinon.match.date,
              timeEnabled: false,
            }));
            expect(moment(valueChangeSpy.lastCall.args[0].datetime).format('YYYY-MM-DD'))
              .to.equal('2020-01-02');
          }
        );
      });
    });
  }
);
