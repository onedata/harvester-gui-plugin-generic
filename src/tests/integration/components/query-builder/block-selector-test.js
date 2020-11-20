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
import RootOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/root-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';

const multiOperandOperatorsList = ['and', 'or'];
const singleOperandOperatorsList = ['not'];
const operatorsList = [...multiOperandOperatorsList, ...singleOperandOperatorsList];
const operatorBlockClasses = {
  and: AndOperatorQueryBlock,
  or: OrOperatorQueryBlock,
  not: NotOperatorQueryBlock,
  root: RootOperatorQueryBlock,
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

    it(
      `renders operators ${operatorsList.map(s => s.toUpperCase()).join(', ')}`,
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector @mode="create"/>`);

        const operators = this.element.querySelectorAll('.operator-selector .operator');
        expect(operators).to.have.length(3);
        operatorsList.forEach((operatorName, index) => {
          const operator = operators[index];
          expect(operator.textContent.trim()).to.equal(operatorName);
        });
      }
    );

    operatorsList.forEach(operatorName => {
      const operatorNameUpper = operatorName.toUpperCase();
      it(
        `calls "onBlockAdd" callback, when ${operatorNameUpper} operator has been clicked`,
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

      const indexProperties = this.indexProperties;
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
        await selectChoose('.comparator-value', 'false');
        await click('.accept-condition');

        const blockMatcher = sinon.match.instanceOf(ConditionQueryBlock)
          .and(sinon.match.hasNested('property.path', 'boolProp'))
          .and(sinon.match.has('comparator', 'boolean.is'))
          .and(sinon.match.hasNested('comparatorValue', 'false'));
        expect(addSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
      }
    );

    it(
      'does not render condition selector when "hideConditionCreation" is true',
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector
          @mode="create"
          @hideConditionCreation={{true}}
        />`);

        expect(this.element.querySelector('.condition-selector')).to.not.exist;
      }
    );

    it('does not render edit-specific sections', async function () {
      await render(hbs `<QueryBuilder::BlockSelector @mode="create"/>`);

      expect(this.element.querySelector('.surround-section')).to.not.exist;
      expect(this.element.querySelector('.change-to-section')).to.not.exist;
    });
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('editBlock', new NotOperatorQueryBlock());
    });

    it(
      `renders operators ${operatorsList.map(s => s.toUpperCase()).join(', ')} in "surround" section`,
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
      const operatorNameUpper = operatorName.toUpperCase();
      it(
        `calls "onBlockReplace" callback, when ${operatorNameUpper} operator in "surround" section has been clicked`,
        async function () {
          const editBlock = this.editBlock;
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
          expect(replaceSpy).to.be.calledOnce.and.to.be.calledWith([blockMatcher]);
        }
      );
    });

    it(
      'renders four operators: AND, OR, NOT and NONE in "change to" section',
      async function () {
        this.set('parentBlock', new AndOperatorQueryBlock());
        await render(hbs `<QueryBuilder::BlockSelector
          @mode="edit"
          @editBlock={{this.editBlock}}
          @editParentBlock={{this.parentBlock}}
        />`);

        const operators = this.element.querySelectorAll(
          '.change-to-section .operator-selector .operator'
        );
        expect(operators).to.have.length(4);
        [...operatorsList, 'none'].forEach((operatorName, index) => {
          const operator = operators[index];
          expect(operator.textContent.trim()).to.equal(operatorName);
        });
      }
    );

    it(
      'does not render operators in "change to" section when block is not an operator',
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
      const operatorUpper = operatorName.toUpperCase();
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
          `blocks "change to" ${operatorUpper} when editing ${operatorUpper} operator ${descriptionSuffix}`,
          async function () {
            this.set('editBlock', new operatorBlockClasses[operatorName]());
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
      const operatorUpper = operatorName.toUpperCase();
      it(
        `blocks "change to" ${operatorUpper} and NOT when editing ${operatorUpper} operator with two conditions`,
        async function () {
          const editBlock = this.set(
            'editBlock',
            new operatorBlockClasses[operatorName]()
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
      const sourceOperatorNameUpper = sourceOperatorName.toUpperCase();
      operatorsList.without(sourceOperatorName).forEach(destinationOperatorName => {
        const destinationOperatorNameUpper = destinationOperatorName.toUpperCase();
        it(
          `changes ${sourceOperatorNameUpper} operator with single condition to ${destinationOperatorNameUpper} operator`,
          async function () {
            const editBlock = this.set(
              'editBlock',
              new operatorBlockClasses[sourceOperatorName]()
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
            expect(replaceSpy).to.be.calledOnce.and.to.be.calledWith([blockMatcher]);
          }
        );
      });

      // Test scenario: create parentOperator with nested editOperator. Then add
      // `nestedBlockCount` NOT operators to editOperator. Then try to use "change to"
      // "NONE" on editOperator and check results.
      [...operatorsList, 'root'].forEach(parentOperatorName => {
        const parentOperatorNameUpper = parentOperatorName.toUpperCase();
        [{
          nestedBlockCount: 0,
          notAllowed: false,
        }, {
          nestedBlockCount: 1,
          notAllowed: false,
        }, {
          nestedBlockCount: 2,
          // For some types of parents, change to "NONE" with multiple operands is not
          // allowed (example: try to move two operands from AND to NOT operator -
          // it's impossible).
          notAllowed: [
            ...singleOperandOperatorsList,
            'root',
          ].includes(parentOperatorName),
        }].forEach(({ nestedBlockCount, notAllowed }) => {
          if (
            nestedBlockCount > 1 &&
            singleOperandOperatorsList.includes(sourceOperatorName)
          ) {
            // Cannot create so much nested blocks for given source operator -> this test
            // case is impossible in real app.
            return;
          }

          let description;
          if (!nestedBlockCount) {
            description =
              `removes ${sourceOperatorNameUpper} operator (with no children) from ${parentOperatorNameUpper} parent operator when using "change to" "NONE"`;
          } else {
            description =
              `${notAllowed ? 'does not allow to extract' : 'extracts'} ${nestedBlockCount} nested elements in ${sourceOperatorNameUpper} operator to ${parentOperatorNameUpper} parent operator using "change to" "NONE"`;
          }

          it(description, async function () {
            const {
              editBlock,
              parentBlock,
              replaceSpy,
            } = this.setProperties({
              editBlock: new operatorBlockClasses[sourceOperatorName](),
              parentBlock: new operatorBlockClasses[parentOperatorName](),
              replaceSpy: sinon.spy(),
            });
            parentBlock.operands.push(editBlock);

            const nestedOperands = [];
            for (let i = 0; i < nestedBlockCount; i++) {
              nestedOperands.push(new NotOperatorQueryBlock());
            }
            editBlock.operands = [...nestedOperands];

            await render(hbs `<QueryBuilder::BlockSelector
              @mode="edit"
              @editBlock={{this.editBlock}}
              @editParentBlock={{this.parentBlock}}
              @onBlockReplace={{this.replaceSpy}}
            />`);

            const noneOperatorBtn =
              this.element.querySelector('.change-to-section .operator-none');
            if (notAllowed) {
              expect(noneOperatorBtn).to.not.exist;
              return;
            } else {
              expect(noneOperatorBtn).to.not.have.attr('disabled');
            }

            await click(noneOperatorBtn);

            expect(replaceSpy).to.be.calledOnce.and.to.be.calledWith(nestedOperands);
          });
        });
      });
    });

    it('does not render create-specific sections', async function () {
      await render(hbs `<QueryBuilder::BlockSelector
        @mode="edit"
        @editBlock={{this.editBlock}}
      />`);

      expect(this.element.querySelector('.add-operator-section')).to.not.exist;
      expect(this.element.querySelector('.condition-section')).to.not.exist;
    });
  });
});
