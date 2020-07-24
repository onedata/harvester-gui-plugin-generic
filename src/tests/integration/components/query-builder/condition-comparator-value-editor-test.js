import { expect } from 'chai';
import { describe, context, it, beforeEach, afterEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import sinon from 'sinon';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import { click, fillIn, blur, triggerKeyEvent } from '@ember/test-helpers';
import { isFlatpickrOpen, setFlatpickrDate, closeFlatpickrDate } from 'ember-flatpickr/test-support/helpers';
import moment from 'moment';
import SpacesProvider from 'harvester-gui-plugin-generic/services/spaces-provider';

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

    context('in view mode', function () {
      it(
        'shows comparator value for boolean "is" condition',
        async function () {
          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="view"
            @comparator="boolean.is"
            @value="false"
          />`);

          expect(this.element.querySelector('.comparator-value').textContent.trim())
            .to.equal('"false"');
        }
      );

      it(
        'shows comparator value for text "contains" condition',
        async function () {
          this.set('block', new ConditionQueryBlock({ path: 'a.b' },
            'text.contains',
            'a | b'
          ));

          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="view"
            @conditionBlock={{this.block}}
            @comparator="text.contains"
            @value="a | b"
          />`);

          expect(this.element.querySelector('.comparator-value').textContent.trim())
            .to.equal('"a | b"');
        }
      );

      it(
        'shows comparator value for number condition',
        async function () {
          this.set('block', new ConditionQueryBlock({ path: 'a.b' },
            'number.eq',
            '2'
          ));

          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="view"
            @comparator="number.eq"
            @value="2"
          />`);

          expect(this.element.querySelector('.comparator-value').textContent.trim())
            .to.equal('"2"');
        }
      );

      it(
        'shows comparator value for date condition',
        async function () {
          this.set('value', { timeEnabled: false, datetime: new Date(2020, 0, 2) });

          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="view"
            @comparator="date.eq"
            @value={{this.value}}
          />`);

          expect(this.element.querySelector('.comparator-value').textContent.trim())
            .to.equal('2020-01-02');
        }
      );

      it(
        'shows comparator value for date  condition with truthy timeEnabled',
        async function () {
          this.set('value', {
            timeEnabled: true,
            datetime: new Date(2020, 0, 2, 12, 5, 40),
          });
          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="view"
            @comparator="date.eq"
            @value={{this.value}}
          />`);

          expect(this.element.querySelector('.comparator-value').textContent.trim())
            .to.equal('2020-01-02 12:05:40');
        }
      );

      it(
        'shows comparator value for keyword "is" condition',
        async function () {
          this.set('block', new ConditionQueryBlock({ path: 'a.b' },
            'keyword.is',
            'abc'
          ));

          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="view"
            @comparator="keyword.is"
            @value="abc"
          />`);

          expect(this.element.querySelector('.comparator-value').textContent.trim())
            .to.equal('"abc"');
        }
      );

      it(
        'shows comparator value for space "is" condition',
        async function () {
          this.set('block', new ConditionQueryBlock({ path: 'space' },
            'space.is',
          ));
          this.set('value', { id: 'space1Id', name: 'space1' });

          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="view"
            @comparator='space.is'
            @value={{this.value}}
          />`);

          expect(this.element.querySelector('.comparator-value').textContent.trim())
            .to.equal('space1');
        }
      );

      it(
        'shows comparator value for anyProperty "hasPhrase" condition',
        async function () {
          this.set('block', new ConditionQueryBlock({ path: 'any property' },
            'anyProperty.hasPhrase',
            'abc def'
          ));

          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="view"
            @comparator="anyProperty.hasPhrase"
            @value="abc def"
          />`);

          expect(this.element.querySelector('.comparator-value').textContent.trim())
            .to.equal('"abc def"');
        }
      );

      it('calls "onStartEdit" on click', async function () {
        const onStartEditSpy = this.set('onStartEditSpy', sinon.spy());
        await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
          @mode="view"
          @comparator="boolean.is"
          @value="false"
          @onStartEdit={{this.onStartEditSpy}}
        />`);
        await click('.comparator-value');

        expect(onStartEditSpy).to.be.calledOnce;
      });
    });

    context('in create mode', function () {
      beforeEach(function () {
        sinon.stub(SpacesProvider.prototype, 'loadSpaces').callsFake(function () {
          this.spaces = spaces;
        });
      });

      afterEach(function () {
        if (SpacesProvider.prototype.loadSpaces.restore) {
          SpacesProvider.prototype.loadSpaces.restore();
        }
      });

      it(
        'shows true/false dropdown for "is" comparator for boolean property',
        async function () {
          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="create"
            @comparator="boolean.is"
          />`);
          await clickTrigger('.comparator-value');

          const options = this.element.querySelectorAll('.ember-power-select-option');
          expect(options).to.have.length(2);
          expect(options[0].textContent.trim()).to.equal('true');
          expect(options[1].textContent.trim()).to.equal('false');
        }
      );

      it(
        'calls "onValueChange" callback, when boolean property "is" condition value has changed',
        async function () {
          const changeSpy = this.set('changeSpy', sinon.spy());

          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="create"
            @comparator="boolean.is"
            @onValueChange={{this.changeSpy}}
          />`);

          await selectChoose('.comparator-value', 'false');

          expect(changeSpy).to.be.calledOnce.and.to.be.calledWith('false');
        }
      );

      it(
        'shows text input for "contains" comparator for text property',
        async function () {
          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="create"
            @comparator="text.contains"
          />`);

          expect(this.element.querySelector('input[type="text"].comparator-value'))
            .to.exist;
        }
      );

      it(
        'calls "onValueChange" callback, when text property "contains" condition value has changed',
        async function () {
          const changeSpy = this.set('changeSpy', sinon.spy());

          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="create"
            @comparator="text.contains"
            @onValueChange={{this.changeSpy}}
          />`);
          await fillIn('.comparator-value', 'a | b');

          expect(changeSpy).to.be.calledOnce.and.to.be.calledWith('a | b');
        }
      );

      it(
        'shows text input for "=" comparator for number property',
        async function () {
          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="create"
            @comparator="number.eq"
          />`);

          expect(this.element.querySelector('input[type="text"].comparator-value'))
            .to.exist;
        }
      );

      it(
        'calls "onValueChange" callback, when number property "=" condition value has changed',
        async function () {
          const changeSpy = this.set('changeSpy', sinon.spy());

          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="create"
            @comparator="number.eq"
            @onValueChange={{this.changeSpy}}
          />`);
          await fillIn('.comparator-value', '2');

          expect(changeSpy).to.be.calledOnce.and.to.be.calledWith('2');
        }
      );

      it(
        'shows text input for "is" comparator for keyword property',
        async function () {
          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="create"
            @comparator="keyword.is"
          />`);

          expect(this.element.querySelector('input[type="text"].comparator-value'))
            .to.exist;
        }
      );

      it(
        'calls "onValueChange" callback, when keyword property "is" condition value has changed',
        async function () {
          const changeSpy = this.set('changeSpy', sinon.spy());

          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="create"
            @comparator="keyword.is"
            @onValueChange={{this.changeSpy}}
          />`);
          await fillIn('.comparator-value', 'abc');

          expect(changeSpy).to.be.calledOnce.and.to.be.calledWith('abc');
        }
      );

      it(
        'shows flatpickr input without time for "=" comparator for date property',
        async function () {
          this.set('value', {
            datetime: moment('2020-05-04 12:00').toDate(),
            timeEnabled: false,
          });
          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="create"
            @comparator="date.eq"
            @value={{this.value}}
          />`);

          expect(this.element.querySelector('.comparator-value'))
            .to.exist.and.to.have.value('2020-05-04');
          expect(this.element.querySelector('.flatpickr-calendar')).to.exist;
          expect(this.element.querySelector('.flatpickr-time.hasSeconds')).to.not.exist;
        }
      );

      it(
        'allows to enable time flatpickr input for "=" comparator for date property',
        async function () {
          const changeSpy = this.set(
            'changeSpy',
            sinon.stub().callsFake(value => {
              this.set('value', value);
            })
          );
          this.set('value', {
            datetime: moment('2020-05-04 12:00').toDate(),
            timeEnabled: false,
          });
          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="create"
            @comparator="date.eq"
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
        'calls "onValueChange" callback, when date property "=" condition value has changed',
        async function () {
          const changeSpy = this.set(
            'changeSpy',
            sinon.stub().callsFake(value => {
              this.set('value', value);
            })
          );
          this.set('value', {
            datetime: moment('2020-05-04 12:00').toDate(),
            timeEnabled: false,
          });
          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="create"
            @comparator="date.eq"
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

      it(
        'shows spaces dropdown for "is" comparator for space property',
        async function () {
          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="create"
            @comparator="space.is"
          />`);
          await clickTrigger('.comparator-value');

          const options = this.element.querySelectorAll('.ember-power-select-option');
          expect(options).to.have.length(2);
          expect(options[0].textContent.trim()).to.equal('space1');
          expect(options[1].textContent.trim()).to.equal('space2');
        }
      );

      it(
        'calls "onValueChange" callback, when space property "is" condition value has changed',
        async function () {
          const changeSpy = this.set('changeSpy', sinon.spy());

          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="create"
            @comparator="space.is"
            @onValueChange={{this.changeSpy}}
          />`);
          await selectChoose('.comparator-value', 'space2');

          expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(
            sinon.match({ id: 'space2Id', name: 'space2' })
          );
        }
      );

      it(
        'shows text input for "hasPhrase" comparator for anyProperty property',
        async function () {
          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="create"
            @comparator="anyProperty.hasPhrase"
          />`);

          expect(this.element.querySelector('input[type="text"].comparator-value'))
            .to.exist;
        }
      );

      it(
        'calls "onValueChange" callback, when anyProperty property "hasPhrase" condition value has changed',
        async function () {
          const changeSpy = this.set('changeSpy', sinon.spy());

          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="create"
            @comparator="anyProperty.hasPhrase"
            @onValueChange={{this.changeSpy}}
          />`);
          await fillIn('.comparator-value', 'abc def');

          expect(changeSpy).to.be.calledOnce.and.to.be.calledWith('abc def');
        }
      );
    });

    context('in edit mode', function () {
      beforeEach(function () {

        sinon.stub(SpacesProvider.prototype, 'loadSpaces').callsFake(function () {
          this.spaces = spaces;
        });
      });

      afterEach(function () {
        if (SpacesProvider.prototype.loadSpaces.restore) {
          SpacesProvider.prototype.loadSpaces.restore();
        }
      });

      [
        'text.contains',
        'number.lt',
        'keyword.is',
        'anyProperty.hasPhrase',
      ].forEach(comparator => {
        const [propertyType, comparatorName] = comparator.split('.');
        const beforeTest = testCase => {
          testCase.setProperties({
            comparator,
          });
        };

        it(
          `has focused editor on init for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);
            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @comparator={{this.comparator}}
              @value="abc"
            />`);

            expect(this.element.querySelector('.comparator-value'))
              .to.equal(document.activeElement);
          }
        );

        it(
          `shows current comparator value for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);
            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @comparator={{this.comparator}}
              @value="abc"
            />`);

            expect(this.element.querySelector('.comparator-value')).to.have.value('abc');
          }
        );

        it(
          `closes editor and notifies about new value for "${comparatorName}" comparator for ${propertyType} property (close using Enter)`,
          async function () {
            beforeTest(this);
            const changeSpy = this.set('changeSpy', sinon.spy());
            const stopEditSpy = this.set('stopEditSpy', sinon.spy());

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @comparator={{this.comparator}}
              @value={{this.value}}
              @onValueChange={{this.changeSpy}}
              @onStopEdit={{this.stopEditSpy}}
            />`);
            await fillIn('.comparator-value', 'def');
            await triggerKeyEvent('.comparator-value', 'keydown', 13);

            expect(changeSpy).to.be.calledWith('def');
            expect(stopEditSpy).to.be.calledOnce;
          }
        );

        it(
          `closes editor and notifies about new value for "${comparatorName}" comparator for ${propertyType} property (close using blur)`,
          async function () {
            beforeTest(this);
            const changeSpy = this.set('changeSpy', sinon.spy());
            const stopEditSpy = this.set('stopEditSpy', sinon.spy());

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @comparator={{this.comparator}}
              @value={{this.value}}
              @onValueChange={{this.changeSpy}}
              @onStopEdit={{this.stopEditSpy}}
            />`);
            await fillIn('.comparator-value', 'def');
            await blur('.comparator-value');

            expect(changeSpy).to.be.calledWith('def');
            expect(stopEditSpy).to.be.calledOnce;
          }
        );

        it(
          `notifies about partial new value before close for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);
            const changeSpy = this.set('changeSpy', sinon.spy());
            const stopEditSpy = this.set('stopEditSpy', sinon.spy());

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @comparator={{this.comparator}}
              @value={{this.value}}
              @onValueChange={{this.changeSpy}}
              @onStopEdit={{this.stopEditSpy}}
            />`);
            await fillIn('.comparator-value', 'de');

            expect(changeSpy).to.be.calledWith('de');
            expect(stopEditSpy).to.not.be.called;
          }
        );

        it(
          `cancels editor on Escape key down for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);
            const cancelEditSpy = this.set('cancelEditSpy', sinon.spy());
            const stopEditSpy = this.set('stopEditSpy', sinon.spy());

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @comparator={{this.comparator}}
              @value={{this.value}}
              @onStopEdit={{this.stopEditSpy}}
              @onCancelEdit={{this.cancelEditSpy}}
            />`);
            await triggerKeyEvent('.comparator-value', 'keydown', 27);

            expect(stopEditSpy).to.not.be.called;
            expect(cancelEditSpy).to.be.calledOnce;
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
        const [propertyType, comparatorName] = comparator.split('.');
        const beforeTest = testCase => {
          testCase.setProperties({
            comparator,
            value: initialValue,
          });
        };

        it(
          `has focused editor on init for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);
            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @comparator={{this.comparator}}
              @value="abc"
            />`);

            expect(
              this.element.querySelector('.comparator-value .ember-power-select-trigger')
            ).to.equal(document.activeElement);
          }
        );

        it(
          `shows current comparator value for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);
            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @comparator={{this.comparator}}
              @value={{this.value}}
            />`);

            expect(this.element.querySelector(
              '.comparator-value .ember-power-select-selected-item'
            ).textContent.trim()).to.equal(initialTriggerValue);
          }
        );

        it(
          `shows expanded dropdown for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);
            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @comparator={{this.comparator}}
              @value={{this.value}}
            />`);

            const options = this.element.querySelectorAll('.ember-power-select-option');
            expect(options).to.have.length(optionsCount);
          }
        );

        it(
          `closes editor and notifies about new value for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);
            const changeSpy = this.set('changeSpy', sinon.spy());
            const stopEditSpy = this.set('stopEditSpy', sinon.spy());

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @comparator={{this.comparator}}
              @value={{this.value}}
              @onValueChange={{this.changeSpy}}
              @onStopEdit={{this.stopEditSpy}}
            />`);
            await selectChoose('.comparator-value', stringToSelect);

            expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(selectionResult);
            expect(stopEditSpy).to.be.calledOnce;
          }
        );

        it(
          `closes editor for "${comparatorName}" comparator for ${propertyType} property on dropdown trigger click`,
          async function () {
            beforeTest(this);
            const stopEditSpy = this.set('stopEditSpy', sinon.spy());

            await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
              @mode="edit"
              @comparator={{this.comparator}}
              @value={{this.value}}
              @onStopEdit={{this.stopEditSpy}}
            />`);
            await clickTrigger('.comparator-value');

            expect(stopEditSpy).to.be.calledOnce;
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
            @comparator="date.lt"
            @value={{this.value}}
          />`);

          expect(this.element.querySelector('.comparator-value'))
            .to.have.value('2020-05-04 12:00:00');
          expect(this.element.querySelector('.include-time')).to.have.class('active');
          expect(isFlatpickrOpen()).to.be.true;
        }
      );

      it(
        'closes editor for "lt" comparator for date property on flatpickr close',
        async function () {
          this.set('value', {
            datetime: moment('2020-05-04 12:00').toDate(),
            timeEnabled: false,
          });
          const stopEditSpy = this.set('stopEditSpy', sinon.spy());

          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="edit"
            @comparator="date.lt"
            @value={{this.value}}
            @onStopEdit={{this.stopEditSpy}}
          />`);
          await closeFlatpickrDate('.flatpickr-input');

          expect(stopEditSpy).to.be.calledOnce;
        }
      );

      it(
        'toggle of "time-enabled" button does not turn off editor of "lt" comparator for date property',
        async function () {
          this.set('value', {
            datetime: moment('2020-05-04 12:00').toDate(),
            timeEnabled: false,
          });
          const stopEditSpy = this.set('stopEditSpy', sinon.spy());
          const valueChangeStub = this.set(
            'valueChangeStub',
            sinon.stub().callsFake(value => this.set('value', value))
          );

          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="edit"
            @comparator="date.lt"
            @value={{this.value}}
            @onValueChange={{this.valueChangeStub}}
            @onStopEdit={{this.stopEditSpy}}
          />`);
          await click('.include-time');

          expect(isFlatpickrOpen()).to.be.true;
          expect(this.element.querySelector('.flatpickr-time.hasSeconds')).to.exist;
          expect(stopEditSpy).to.not.be.called;
          expect(valueChangeStub).to.be.calledWith(sinon.match({
            datetime: sinon.match.date,
            timeEnabled: true,
          }));
        }
      );

      it(
        'notifies about changed value of "lt" comparator for date property',
        async function () {
          this.set('value', {
            datetime: moment('2020-05-04 12:00').toDate(),
            timeEnabled: false,
          });
          const stopEditSpy = this.set('stopEditSpy', sinon.spy());
          const valueChangeSpy = this.set('valueChangeSpy', sinon.spy());

          await render(hbs `<QueryBuilder::ConditionComparatorValueEditor
            @mode="edit"
            @comparator="date.lt"
            @value={{this.value}}
            @onValueChange={{this.valueChangeSpy}}
            @onStopEdit={{this.stopEditSpy}}
          />`);
          await setFlatpickrDate('.flatpickr-input', new Date(2020, 0, 2));

          expect(stopEditSpy).to.not.be.called;
          expect(valueChangeSpy).to.be.calledWith(sinon.match({
            datetime: sinon.match.date,
            timeEnabled: false,
          }));
          expect(moment(valueChangeSpy.lastCall.args[0].datetime).format('YYYY-MM-DD'))
            .to.equal('2020-01-02');
        }
      );
    });
  }
);
