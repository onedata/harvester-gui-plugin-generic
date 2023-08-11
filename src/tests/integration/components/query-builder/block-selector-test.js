import { module, test } from 'qunit';
import { setupRenderingTest } from '../../../helpers';
import { render, click, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import OrOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/or-operator-query-block';
import NotOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/not-operator-query-block';
import RootOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/root-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import { clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import QueryValueComponentsBuilder from 'harvester-gui-plugin-generic/utils/query-value-components-builder';

const multiOperandOperatorsList = ['and', 'or'];
const singleOperandOperatorsList = ['not'];
const operatorsList = [...multiOperandOperatorsList, ...singleOperandOperatorsList];
const operatorBlockClasses = {
  and: AndOperatorQueryBlock,
  or: OrOperatorQueryBlock,
  not: NotOperatorQueryBlock,
  root: RootOperatorQueryBlock,
};

module('Integration | Component | query-builder/block-selector', (hooks) => {
  setupRenderingTest(hooks);

  module('in "create" mode', (hooks) => {
    hooks.beforeEach(function () {
      this.setProperties({
        valuesBuilder: new QueryValueComponentsBuilder([]),
        indexProperties: [{
          path: 'boolProp',
          type: 'boolean',
        }, {
          path: 'textProp',
          type: 'text',
        }],
      });
    });

    test(
      `renders operators ${operatorsList.map(s => s.toUpperCase()).join(', ')}`,
      async function (assert) {
        await render(hbs `<QueryBuilder::BlockSelector
          @mode="create"
          @valuesBuilder={{this.valuesBuilder}}
        />`);

        const operators = findAll('.operator-selector .operator');
        assert.strictEqual(operators.length, 3);
        operatorsList.forEach((operatorName, index) => {
          const operator = operators[index];
          assert.dom(operator).hasText(operatorName);
        });
      }
    );

    operatorsList.forEach(operatorName => {
      const operatorNameUpper = operatorName.toUpperCase();
      test(
        `calls "onBlockAdd" callback, when ${operatorNameUpper} operator has been clicked`,
        async function (assert) {
          const addSpy = this.set('addSpy', sinon.spy());

          await render(hbs `<QueryBuilder::BlockSelector
            @mode="create"
            @valuesBuilder={{this.valuesBuilder}}
            @onBlockAdd={{this.addSpy}}
          />`);
          assert.ok(addSpy.notCalled);
          await click(`.operator-${operatorName}`);

          const blockMatcher = sinon.match.instanceOf(operatorBlockClasses[operatorName]);
          assert.ok(addSpy.calledOnce);
          assert.ok(addSpy.calledWith(blockMatcher));
        }
      );
    });

    test('lists index properties in dropdown', async function (assert) {
      await render(hbs `<QueryBuilder::BlockSelector
        @mode="create"
        @valuesBuilder={{this.valuesBuilder}}
        @indexProperties={{this.indexProperties}}
      />`);
      await clickTrigger('.property-selector');

      const indexProperties = this.indexProperties;
      const options = findAll('.ember-power-select-option');
      assert.strictEqual(options.length, indexProperties.length);
      indexProperties.forEach(({ path }, index) =>
        assert.dom(options[index]).hasText(path)
      );
    });

    test(
      'calls "onBlockAdd" callback, when condition has been accepted',
      async function (assert) {
        const addSpy = this.set('addSpy', sinon.spy());

        await render(hbs `<QueryBuilder::BlockSelector
          @mode="create"
          @valuesBuilder={{this.valuesBuilder}}
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
        assert.ok(addSpy.calledOnce);
        assert.ok(addSpy.calledWith(blockMatcher));
      }
    );

    test(
      'does not render condition selector when "hideConditionCreation" is true',
      async function (assert) {
        await render(hbs `<QueryBuilder::BlockSelector
          @mode="create"
          @valuesBuilder={{this.valuesBuilder}}
          @hideConditionCreation={{true}}
        />`);

        assert.notOk(find('.condition-selector'));
      }
    );

    test('does not render edit-specific sections', async function (assert) {
      await render(hbs `<QueryBuilder::BlockSelector
        @mode="create"
        @valuesBuilder={{this.valuesBuilder}}
      />`);

      assert.notOk(find('.surround-section'));
      assert.notOk(find('.change-to-section'));
    });
  });

  module('in "edit" mode', (hooks) => {
    hooks.beforeEach(function () {
      this.set('editBlock', new NotOperatorQueryBlock());
    });

    test(
      `renders operators ${operatorsList.map(s => s.toUpperCase()).join(', ')} in "surround" section`,
      async function (assert) {
        await render(hbs `<QueryBuilder::BlockSelector @mode="edit"/>`);

        const operators = findAll(
          '.surround-section .operator-selector .operator'
        );
        assert.strictEqual(operators.length, 3);
        operatorsList.forEach((operatorName, index) => {
          const operator = operators[index];
          assert.dom(operator).hasText(operatorName);
        });
      }
    );

    operatorsList.forEach(operatorName => {
      const operatorNameUpper = operatorName.toUpperCase();
      test(
        `calls "onBlockReplace" callback, when ${operatorNameUpper} operator in "surround" section has been clicked`,
        async function (assert) {
          const editBlock = this.editBlock;
          const replaceSpy = this.set('replaceSpy', sinon.spy());

          await render(hbs `<QueryBuilder::BlockSelector
            @mode="edit"
            @editBlock={{this.editBlock}}
            @onBlockReplace={{this.replaceSpy}}
          />`);

          assert.ok(replaceSpy.notCalled);
          await click(`.surround-section .operator-${operatorName}`);
          const blockMatcher = sinon.match.instanceOf(operatorBlockClasses[operatorName])
            .and(
              // Matching Ember Array
              sinon.match((val) =>
                sinon.match.array.deepEquals([editBlock]).test(val.operands.toArray()))
            );
          assert.ok(replaceSpy.calledOnce);
          assert.ok(replaceSpy.calledWith([blockMatcher]));
        }
      );
    });

    test(
      'renders four operators: AND, OR, NOT and NONE in "change to" section',
      async function (assert) {
        this.set('parentBlock', new AndOperatorQueryBlock());
        await render(hbs `<QueryBuilder::BlockSelector
          @mode="edit"
          @editBlock={{this.editBlock}}
          @editParentBlock={{this.parentBlock}}
        />`);

        const operators = findAll(
          '.change-to-section .operator-selector .operator'
        );
        assert.strictEqual(operators.length, 4);
        [...operatorsList, 'none'].forEach((operatorName, index) => {
          const operator = operators[index];
          assert.dom(operator).hasText(operatorName);
        });
      }
    );

    test(
      'does not render operators in "change to" section when block is not an operator',
      async function (assert) {
        this.set('editBlock', new ConditionQueryBlock());

        await render(hbs `<QueryBuilder::BlockSelector
          @mode="edit"
          @editBlock={{this.editBlock}}
        />`);

        assert.notOk(find('.change-to-section'));
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
        test(
          `blocks "change to" ${operatorUpper} when editing ${operatorUpper} operator ${descriptionSuffix}`,
          async function (assert) {
            this.set('editBlock', new operatorBlockClasses[operatorName]());
            beforeFunc(this);

            await render(hbs `<QueryBuilder::BlockSelector
              @mode="edit"
              @editBlock={{this.editBlock}}
            />`);

            assert.dom(
              find(`.change-to-section .operator-${operatorName}`)
            ).hasAttribute('disabled');
            assert.strictEqual(findAll(
              '.change-to-section .operator:not([disabled])'
            ).length, 2);
          }
        );
      });
    });

    multiOperandOperatorsList.forEach(operatorName => {
      const operatorUpper = operatorName.toUpperCase();
      test(
        `blocks "change to" ${operatorUpper} and NOT when editing ${operatorUpper} operator with two conditions`,
        async function (assert) {
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
            assert.dom(find(
              `.change-to-section .operator-${disabledOperator}`
            )).hasAttribute('disabled');
          });

          assert.strictEqual(findAll(
            '.change-to-section .operator:not([disabled])'
          ).length, 1);
        }
      );
    });

    operatorsList.forEach(sourceOperatorName => {
      const sourceOperatorNameUpper = sourceOperatorName.toUpperCase();
      operatorsList
        .filter((operator) => operator !== sourceOperatorName)
        .forEach(destinationOperatorName => {
          const destinationOperatorNameUpper = destinationOperatorName.toUpperCase();
          test(
            `changes ${sourceOperatorNameUpper} operator with single condition to ${destinationOperatorNameUpper} operator`,
            async function (assert) {
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
                .and(
                  // Matching Ember Array
                  sinon.match((val) =>
                    sinon.match.array.deepEquals([conditionBlock])
                    .test(val.operands.toArray()))
                );
              assert.ok(replaceSpy.calledOnce);
              assert.ok(replaceSpy.calledWith([blockMatcher]));
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

          test(description, async function (assert) {
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
              find('.change-to-section .operator-none');
            if (notAllowed) {
              assert.notOk(noneOperatorBtn);
            } else {
              assert.dom(noneOperatorBtn).doesNotHaveAttribute('disabled');

              await click(noneOperatorBtn);

              assert.ok(replaceSpy.calledOnce);
              assert.ok(replaceSpy.calledWith(nestedOperands));
            }
          });
        });
      });
    });

    test('does not render create-specific sections', async function (assert) {
      await render(hbs `<QueryBuilder::BlockSelector
        @mode="edit"
        @editBlock={{this.editBlock}}
      />`);

      assert.notOk(find('.add-operator-section'));
      assert.notOk(find('.condition-section'));
    });
  });
});
