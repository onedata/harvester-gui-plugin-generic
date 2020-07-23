import { expect } from 'chai';
import { describe, context, it, beforeEach, afterEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import sinon from 'sinon';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import { click, fillIn } from '@ember/test-helpers';
import { setFlatpickrDate } from 'ember-flatpickr/test-support/helpers';
import moment from 'moment';
import SpacesProvider from 'harvester-gui-plugin-generic/services/spaces-provider';

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
            .to.equal('false');
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
            .to.equal('a | b');
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
            .to.equal('2');
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
            .to.equal('abc');
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
            .to.equal('abc def');
        }
      );
    });

    context('in create mode', function () {
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
  }
);
