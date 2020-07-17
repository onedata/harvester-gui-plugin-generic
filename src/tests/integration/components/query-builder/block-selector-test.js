import { expect } from 'chai';
import { describe, context, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';

const multiSlotOperatorsList = ['and', 'or'];
const singleSlotOperatorsList = ['not'];
const operatorsList = [...multiSlotOperatorsList, ...singleSlotOperatorsList];
const operatorBlockClasses = {
  and: MultiSlotQueryBlock,
  or: MultiSlotQueryBlock,
  not: SingleSlotQueryBlock,
};

describe('Integration | Component | query-builder/block-selector', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('indexProperties', [{
      path: 'boolProp',
      type: 'boolean',
    }, {
      path: 'textProp',
      type: 'text',
    }]);
  });

  context('in "create" mode', function () {
    it('renders three operators: AND, OR and NOT', async function () {
      await render(hbs `<QueryBuilder::BlockSelector @mode="create"/>`);

      const operators = this.element.querySelectorAll('.operator-selector .operator');
      expect(operators).to.have.length(3);
      operatorsList.forEach((operatorName, index) => {
        const operator = operators[index];
        expect(operator.textContent.trim()).to.equal(operatorName);
      });
    });

    operatorsList.forEach(operatorName => {
      it(
        `calls "onBlockAdd" callback, when ${operatorName.toUpperCase()} operator has been clicked`,
        async function () {
          const addSpy = this.set('addSpy', sinon.spy());

          await render(hbs `<QueryBuilder::BlockSelector
            @mode="create"
            @onBlockAdd={{this.addSpy}}
          />`);

          expect(addSpy).to.not.be.called;
          await click(`.operator-${operatorName}`);
          const blockMatcher = sinon.match.instanceOf(operatorBlockClasses[operatorName])
            .and(sinon.match.has('operator', operatorName));
          expect(addSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
        }
      );
    });

    it('lists index properties in dropdown', async function () {
      await render(hbs `<QueryBuilder::BlockSelector
        @mode="create"
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

    it(
      'calls "onBlockAdd" callback, when condition has been accepted',
      async function () {
        const addSpy = this.set('addSpy', sinon.spy());

        await render(hbs `<QueryBuilder::BlockSelector
          @mode="create"
          @onBlockAdd={{this.addSpy}}
          @indexProperties={{this.indexProperties}}
        />`);

        await selectChoose('.property-selector', 'boolProp');
        await selectChoose('.comparator-value-selector', 'false');
        await click('.accept-condition');

        const blockMatcher = sinon.match.instanceOf(ConditionQueryBlock)
          .and(sinon.match.hasNested('property.path', 'boolProp'))
          .and(sinon.match.has('comparator', 'boolean.is'))
          .and(sinon.match.hasNested('comparatorValue', 'false'));
        expect(addSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
      }
    );
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('editBlock', new SingleSlotQueryBlock('not'));
    });

    it(
      'renders three operators: AND, OR and NOT in "surround" section',
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector @mode="edit"/>`);

        const operators = this.element.querySelectorAll(
          '.surround-section .operator-selector .operator'
        );
        expect(operators).to.have.length(3);
        operatorsList.forEach((operatorName, index) => {
          const operator = operators[index];
          expect(operator.textContent.trim()).to.equal(operatorName);
        });
      }
    );

    operatorsList.forEach(operatorName => {
      it(
        `calls "onBlockReplace" callback, when ${operatorName.toUpperCase()} operator in "surround" section has been clicked`,
        async function () {
          const isSingleSlot = singleSlotOperatorsList.includes(operatorName);
          const editBlock = this.get('editBlock');
          const addSpy = this.set('replaceSpy', sinon.spy());

          await render(hbs `<QueryBuilder::BlockSelector
            @mode="edit"
            @editBlock={{this.editBlock}}
            @onBlockReplace={{this.replaceSpy}}
          />`);

          expect(addSpy).to.not.be.called;
          await click(`.surround-section .operator-${operatorName}`);
          const blockMatcher = sinon.match.instanceOf(operatorBlockClasses[operatorName])
            .and(sinon.match.has('operator', operatorName))
            .and(isSingleSlot ?
              sinon.match.has('slot', editBlock) :
              sinon.match.has('slots', [editBlock])
            );
          expect(addSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
        }
      );
    });
  });
});
