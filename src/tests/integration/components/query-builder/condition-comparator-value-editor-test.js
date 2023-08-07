import { module, test } from 'qunit';
import { setupRenderingTest } from '../../../helpers';
import { render, click, fillIn, blur, triggerKeyEvent, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
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

module('Integration | Component | query-builder/condition-comparator-value-editor',
  (hooks) => {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
      sinon.stub(SpacesProvider.prototype, 'reloadSpaces').callsFake(function () {
        this.spaces = spaces;
      });
      this.owner.lookup('service:spaces-provider').reloadSpaces();
      this.valuesBuilder = new QueryValueComponentsBuilder(spaces);
    });

    hooks.afterEach(function () {
      if (SpacesProvider.prototype.reloadSpaces.restore) {
        SpacesProvider.prototype.reloadSpaces.restore();
      }
    });

    module('in view mode', () => {
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
        test(
          `shows comparator value for "${comparatorType}" comparator for ${propertyType} property${descriptionSuffix || ''}`,
          async function (assert) {
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

            assert.dom(find('.comparator-value')).hasText(viewValue);
          }
        );
      });

      test('calls "onStartEdit" on click', async function (assert) {
        const onStartEditSpy = this.set('onStartEditSpy', sinon.spy());

        await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
          @mode="view"
          @valuesBuilder={{this.valuesBuilder}}
          @comparator="boolean.is"
          @value="false"
          @onStartEdit={{this.onStartEditSpy}}
        />`);
        await click('.comparator-value');

        assert.ok(onStartEditSpy.calledOnce);
      });
    });

    module('in create mode', () => {
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

        test(
          `shows text input for "${comparatorType}" comparator for ${propertyType} property`,
          async function (assert) {
            this.set('comparator', comparator);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="create"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
            />`);

            assert.ok(find('input[type="text"].comparator-value'));
          }
        );

        test(
          `calls "onValueChange" callback, when ${propertyType} property "${comparatorType}" condition value has changed`,
          async function (assert) {
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

            assert.ok(changeSpy.calledOnce);
            assert.ok(changeSpy.calledWith(valueToInput));
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

        test(
          `shows dropdown for "${comparatorType}" comparator for ${propertyType} property`,
          async function (assert) {
            this.set('comparator', comparator);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="create"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
            />`);
            await clickTrigger('.comparator-value');

            const optionsNodes =
              findAll('.ember-power-select-option');
            assert.strictEqual(optionsNodes.length, options.length);
            options.forEach((option, index) =>
              assert.dom(optionsNodes[index]).hasText(option)
            );
          }
        );

        test(
          `calls "onValueChange" callback, when ${propertyType} property "${comparatorType}" condition value has changed`,
          async function (assert) {
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

            assert.ok(changeSpy.calledOnce);
            assert.ok(changeSpy.calledWith(selectedValue));
          }
        );
      });

      mathOperators.forEach(operator => {
        test(
          `shows flatpickr input without time for "${operator}" comparator for date property`,
          async function (assert) {
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

            assert.dom(find('.comparator-value')).hasValue('2020-05-04');
            assert.ok(find('.flatpickr-calendar'));
            assert.notOk(find('.flatpickr-time.hasSeconds'));
          }
        );

        test(
          `allows to enable time flatpickr input for "${operator}" comparator for date property`,
          async function (assert) {
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

            assert.ok(changeSpy.calledOnce);
            assert.ok(changeSpy.calledWith({
              datetime: sinon.match.date,
              timeEnabled: true,
            }));
            assert.dom(find('.comparator-value')).hasValue('2020-05-04 12:00:00');
            assert.ok(find('.flatpickr-time.hasSeconds'));
          }
        );

        test(
          `calls "onValueChange" callback, when date property "${operator}" condition value has changed`,
          async function (assert) {
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

            assert.ok(changeSpy.calledTwice);
            assert.ok(changeSpy.calledWith({
              datetime: sinon.match.date,
              timeEnabled: true,
            }));
            assert.strictEqual(
              moment(changeSpy.lastCall.args[0].datetime).format('YYYY-MM-DD HH:mm:ss'),
              '2020-01-02 13:10:15'
            );
          }
        );
      });
    });

    module('in edit mode', () => {
      [
        'text.contains',
        ...mathOperators.map(operator => `number.${operator}`),
        'keyword.is',
        'anyProperty.hasPhrase',
      ].forEach(comparator => {
        const [propertyType, comparatorType] = comparator.split('.');
        const beforeTest = testCase => testCase.set('comparator', comparator);

        test(
          `has focused editor on init for "${comparatorType}" comparator for ${propertyType} property`,
          async function (assert) {
            beforeTest(this);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value="abc"
            />`);

            assert.strictEqual(
              find('.comparator-value'),
              document.activeElement
            );
          }
        );

        test(
          `shows current comparator value for "${comparatorType}" comparator for ${propertyType} property`,
          async function (assert) {
            beforeTest(this);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value="abc"
            />`);

            assert.dom(find('.comparator-value')).hasValue('abc');
          }
        );

        test(
          `closes editor and notifies about new value for "${comparatorType}" comparator for ${propertyType} property (close using Enter)`,
          async function (assert) {
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

            assert.ok(changeSpy.calledWith('def'));
            assert.ok(finishEditSpy.calledOnce);
          }
        );

        test(
          `closes editor and notifies about new value for "${comparatorType}" comparator for ${propertyType} property (close using blur)`,
          async function (assert) {
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

            assert.ok(changeSpy.calledWith('def'));
            assert.ok(finishEditSpy.calledOnce);
          }
        );

        test(
          `notifies about partial new value before close for "${comparatorType}" comparator for ${propertyType} property`,
          async function (assert) {
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

            assert.ok(changeSpy.calledWith('de'));
            assert.ok(finishEditSpy.notCalled);
          }
        );

        test(
          `cancels editor on Escape key down for "${comparatorType}" comparator for ${propertyType} property`,
          async function (assert) {
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

            assert.ok(finishEditSpy.notCalled);
            assert.ok(cancelEditSpy.calledOnce);
          }
        );

        test(
          `does not add class "is-invalid" to the input by default for "${comparatorType}" comparator for ${propertyType} property`,
          async function (assert) {
            beforeTest(this);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value="abc"
            />`);

            assert.dom(find('.comparator-value'))
              .doesNotHaveClass('is-invalid');
          }
        );

        test(
          `adds class "is-invalid" to the input if isValueInvalid is true for "${comparatorType}" comparator for ${propertyType} property`,
          async function (assert) {
            beforeTest(this);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @isValueInvalid={{true}}
              @value="abc"
            />`);

            assert.dom(find('.comparator-value')).hasClass('is-invalid');
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

        test(
          `has focused editor on init for "${comparatorType}" comparator for ${propertyType} property`,
          async function (assert) {
            beforeTest(this);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value="abc"
            />`);

            assert.strictEqual(
              find('.comparator-value'),
              document.activeElement
            );
          }
        );

        test(
          `shows current comparator value for "${comparatorType}" comparator for ${propertyType} property`,
          async function (assert) {
            beforeTest(this);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value={{this.value}}
            />`);

            assert.dom(find('.comparator-value .ember-power-select-selected-item'))
              .hasText(initialTriggerValue);
          }
        );

        test(
          `shows expanded dropdown for "${comparatorType}" comparator for ${propertyType} property`,
          async function (assert) {
            beforeTest(this);

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @valuesBuilder={{this.valuesBuilder}}
              @comparator={{this.comparator}}
              @value={{this.value}}
            />`);

            const options = findAll('.ember-power-select-option');
            assert.strictEqual(options.length, optionsCount);
          }
        );

        test(
          `closes editor and notifies about new value for "${comparatorType}" comparator for ${propertyType} property`,
          async function (assert) {
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

            assert.ok(changeSpy.calledOnce);
            assert.ok(changeSpy.calledWith(selectionResult));
            assert.ok(finishEditSpy.calledOnce);
          }
        );

        test(
          `closes editor for "${comparatorType}" comparator for ${propertyType} property on dropdown trigger click`,
          async function (assert) {
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

            assert.ok(finishEditSpy.calledOnce);
          }
        );
      });

      test(
        'shows current comparator value and opened flatpickr for "lt" comparator for date property',
        async function (assert) {
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

          assert.dom(find('.comparator-value')).hasValue('2020-05-04 12:00:00');
          assert.dom(find('.include-time')).hasClass('active');
          assert.true(isFlatpickrOpen());
        }
      );

      mathOperators.forEach(operator => {
        const comparator = `date.${operator}`;

        test(
          `closes editor for "${operator}" comparator for date property on flatpickr close`,
          async function (assert) {
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

            assert.ok(finishEditSpy.calledOnce);
          }
        );

        test(
          `toggle of "time-enabled" button does not turn off editor of "${operator}" comparator for date property`,
          async function (assert) {
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

            assert.true(isFlatpickrOpen());
            assert.ok(find('.flatpickr-time.hasSeconds'));
            assert.ok(finishEditSpy.notCalled);
            assert.ok(valueChangeStub.calledWith(sinon.match({
              datetime: sinon.match.date,
              timeEnabled: true,
            })));
          }
        );

        test(
          `notifies about changed value of "${operator}" comparator for date property`,
          async function (assert) {
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

            assert.ok(finishEditSpy.notCalled);
            assert.ok(valueChangeSpy.calledWith(sinon.match({
              datetime: sinon.match.date,
              timeEnabled: false,
            })));
            assert.strictEqual(
              moment(valueChangeSpy.lastCall.args[0].datetime).format('YYYY-MM-DD'),
              '2020-01-02'
            );
          }
        );
      });
    });
  }
);
