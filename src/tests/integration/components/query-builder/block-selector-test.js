import { expect } from 'chai';
import { describe, context, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';
import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import OrOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/or-operator-query-block';
import NotOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/not-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';

const multiOperandOperatorsList = ['and', 'or'];
const singleOperandOperatorsList = ['not'];
const operatorsList = [...multiOperandOperatorsList, ...singleOperandOperatorsList];
const operatorBlockClasses = {
  and: AndOperatorQueryBlock,
  or: OrOperatorQueryBlock,
  not: NotOperatorQueryBlock,
};

describe('Integration | Component | query-builder/block-selector', function () {
  setupRenderingTest();

  context('in "create" mode', function () {
    beforeEach(function () {
      this.set('indexProperties', [{
        path: 'boolProp',
        type: 'boolean',
      }, {
        path: 'textProp',
        type: 'text',
      }]);
    });

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
          const blockMatcher = sinon.match.instanceOf(operatorBlockClasses[operatorName]);
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
      this.set('editBlock', new NotOperatorQueryBlock());
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
          const editBlock = this.get('editBlock');
          const replaceSpy = this.set('replaceSpy', sinon.spy());

          await render(hbs `<QueryBuilder::BlockSelector
            @mode="edit"
            @editBlock={{this.editBlock}}
            @onBlockReplace={{this.replaceSpy}}
          />`);

          expect(replaceSpy).to.not.be.called;
          await click(`.surround-section .operator-${operatorName}`);
          const blockMatcher = sinon.match.instanceOf(operatorBlockClasses[operatorName])
            .and(sinon.match.has('operands', [editBlock]));
          expect(replaceSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
        }
      );
    });

    it(
      'renders three operators: AND, OR and NOT in "change to" section',
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector
          @mode="edit"
          @editBlock={{this.editBlock}}
        />`);

        const operators = this.element.querySelectorAll(
          '.change-to-section .operator-selector .operator'
        );
        expect(operators).to.have.length(3);
        operatorsList.forEach((operatorName, index) => {
          const operator = operators[index];
          expect(operator.textContent.trim()).to.equal(operatorName);
        });
      }
    );

    it(
      'does not render operators in "change to" section when block is an operator',
      async function () {
        this.set('editBlock', new ConditionQueryBlock());

        await render(hbs `<QueryBuilder::BlockSelector
          @mode="edit"
          @editBlock={{this.editBlock}}
        />`);

        expect(this.element.querySelector('.change-to-section')).to.not.exist;
      }
    );

    operatorsList.forEach(operatorName => {
      [{
        beforeFunc() {},
        descriptionSuffix: 'with no condition',
      }, {
        beforeFunc(testCase) {
          const editBlock = testCase.get('editBlock');
          const conditionBlock = new ConditionQueryBlock();
          editBlock.operands.pushObject(conditionBlock);
        },
        descriptionSuffix: 'with single condition',
      }].forEach(({ beforeFunc, descriptionSuffix }) => {
        it(
          `blocks "change to" ${operatorName.toUpperCase()} when editing ${operatorName.toUpperCase()} operator ${descriptionSuffix}`,
          async function () {
            this.set('editBlock', new operatorBlockClasses[operatorName](operatorName));
            beforeFunc(this);

            await render(hbs `<QueryBuilder::BlockSelector
              @mode="edit"
              @editBlock={{this.editBlock}}
            />`);

            expect(
              this.element.querySelector(`.change-to-section .operator-${operatorName}`)
            ).to.have.attr('disabled');
            expect(
              this.element.querySelectorAll('.change-to-section .operator:not([disabled])')
            ).to.have.length(2);
          }
        );
      });
    });

    multiOperandOperatorsList.forEach(operatorName => {
      it(
        `blocks "change to" ${operatorName.toUpperCase()} and NOT when editing ${operatorName.toUpperCase()} operator with two conditions`,
        async function () {
          const editBlock = this.set(
            'editBlock',
            new operatorBlockClasses[operatorName](operatorName)
          );
          const conditionBlock = new ConditionQueryBlock();
          editBlock.operands.pushObjects([conditionBlock, conditionBlock]);

          await render(hbs `<QueryBuilder::BlockSelector
            @mode="edit"
            @editBlock={{this.editBlock}}
          />`);

          [
            operatorName,
            'not',
          ].forEach(disabledOperator => {
            expect(this.element.querySelector(
              `.change-to-section .operator-${disabledOperator}`
            )).to.have.attr('disabled');
          });

          expect(
            this.element.querySelectorAll('.change-to-section .operator:not([disabled])')
          ).to.have.length(1);
        }
      );
    });

    operatorsList.forEach(sourceOperatorName => {
      operatorsList.without(sourceOperatorName).forEach(destinationOperatorName => {
        it(
          `changes ${sourceOperatorName.toUpperCase()} operator with single condition to ${destinationOperatorName.toUpperCase()} operator`,
          async function () {
            const editBlock = this.set(
              'editBlock',
              new operatorBlockClasses[sourceOperatorName](sourceOperatorName)
            );
            const conditionBlock = new ConditionQueryBlock();
            editBlock.operands.pushObject(conditionBlock);
            const replaceSpy = this.set('replaceSpy', sinon.spy());

            await render(hbs `<QueryBuilder::BlockSelector
              @mode="edit"
              @editBlock={{this.editBlock}}
              @onBlockReplace={{this.replaceSpy}}
            />`);
            await click(`.change-to-section .operator-${destinationOperatorName}`);

            const blockMatcher = sinon.match
              .instanceOf(operatorBlockClasses[destinationOperatorName])
              .and(sinon.match.has('operands', [conditionBlock]));
            expect(replaceSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
          }
        );
      });
    });
  });
});
