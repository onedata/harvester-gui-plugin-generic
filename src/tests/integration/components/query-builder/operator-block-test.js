import { module, test } from 'qunit';
import { setupRenderingTest } from '../../../helpers';
import { render, click, fillIn, blur } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import OrOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/or-operator-query-block';
import NotOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/not-operator-query-block';
import RootOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/root-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import sinon from 'sinon';
import QueryValueComponentsBuilder from 'harvester-gui-plugin-generic/utils/query-value-components-builder';

const multiOperandOperatorsList = ['and', 'or'];
const singleOperandOperatorsList = ['not', 'root'];
const operatorsList = [...multiOperandOperatorsList, ...singleOperandOperatorsList];
const operatorBlockClasses = {
  and: AndOperatorQueryBlock,
  or: OrOperatorQueryBlock,
  not: NotOperatorQueryBlock,
  root: RootOperatorQueryBlock,
};

module('Integration | Component | query-builder/operator-block', hooks => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.valuesBuilder = new QueryValueComponentsBuilder([]);
  });

  test(
    'has classes "query-builder-block" and "query-builder-operator-block"',
    async function (assert) {
      await render(hbs`<QueryBuilder::OperatorBlock
        @valuesBuilder={{this.valuesBuilder}}
      />`);

      assert.strictEqual(this.element.querySelectorAll(
        '.query-builder-block.query-builder-operator-block'
      ).length, 1);
    }
  );

  operatorsList.forEach(operatorName => {
    module(`with ${operatorName.toUpperCase()} operator`, () => {
      const isMultiOperandOperator = multiOperandOperatorsList.includes(operatorName);

      test(
        `has class "${operatorName}-operator-block"`,
        async function (assert) {
          this.set('queryBlock', new operatorBlockClasses[operatorName]());

          await render(hbs `
            <QueryBuilder::OperatorBlock
              @queryBlock={{this.queryBlock}}
              @valuesBuilder={{this.valuesBuilder}}
            />
          `);

          assert.strictEqual(this.element.querySelectorAll(
            `.query-builder-block.${operatorName}-operator-block`
          ).length, 1);
        }
      );

      if (isMultiOperandOperator) {
        test(
          'has two block-adders (only first enabled) and no block when it represents empty block',
          async function (assert) {
            this.set('queryBlock', new operatorBlockClasses[operatorName]());

            await render(hbs `
              <QueryBuilder::OperatorBlock
                @queryBlock={{this.queryBlock}}
                @valuesBuilder={{this.valuesBuilder}}
              />
            `);

            const blockAdderTriggers =
              this.element.querySelectorAll('.query-builder-block-adder');
            assert.strictEqual(blockAdderTriggers.length, 2);
            assert.dom(blockAdderTriggers[0]).doesNotHaveAttribute('disabled');
            assert.dom(blockAdderTriggers[1]).hasAttribute('disabled');
            assert.notOk(this.element.querySelector(
              '.query-builder-block .query-builder-block'
            ));
          }
        );

        test(
          'shows blocks and one enabled block-adder when it represents non-empty block',
          async function (assert) {
            const queryBlock =
              this.set('queryBlock', new operatorBlockClasses[operatorName]());
            queryBlock.operands.pushObjects([
              new NotOperatorQueryBlock(),
              new NotOperatorQueryBlock(),
            ]);

            await render(hbs `
              <QueryBuilder::OperatorBlock
                @queryBlock={{this.queryBlock}}
                @valuesBuilder={{this.valuesBuilder}}
              />
            `);

            // 2 operands
            assert.strictEqual(this.element.querySelectorAll(
              '.query-builder-block .query-builder-block'
            ).length, 2);
            // 2 from operands + 1 from the parent block
            assert.strictEqual(this.element.querySelectorAll(
              '.query-builder-block-adder:not([disabled])'
            ).length, 3);
            // exactly 2 are from operands (NOT operators)
            assert.strictEqual(this.element.querySelectorAll(
              '.query-builder-block .query-builder-block .query-builder-block-adder'
            ).length, 2);
          }
        );

        test('allows to add block using block-adder', async function (assert) {
          const queryBlock =
            this.set('queryBlock', new operatorBlockClasses[operatorName]());

          await render(hbs `<QueryBuilder::OperatorBlock
            @queryBlock={{this.queryBlock}}
            @valuesBuilder={{this.valuesBuilder}}
          />`);
          await click('.query-builder-block-adder');
          await click('.block-adder-body .operator-not');

          // 1 operand
          assert.strictEqual(this.element.querySelectorAll(
            '.query-builder-block .query-builder-block'
          ).length, 1);
          // 1 from operands + 1 from the parent block
          assert.strictEqual(
            this.element.querySelectorAll('.query-builder-block-adder').length,
            2
          );
          // exactly 1 is from operands (NOT operators)
          assert.strictEqual(this.element.querySelectorAll(
            '.query-builder-block .query-builder-block .query-builder-block-adder'
          ).length, 1);
          assert.strictEqual(queryBlock.operands.length, 1);
          assert.ok(queryBlock.operands[0] instanceof NotOperatorQueryBlock);
        });

        test('shows operator name', async function (assert) {
          const queryBlock =
            this.set('queryBlock', new operatorBlockClasses[operatorName]());
          queryBlock.operands.pushObjects([
            new NotOperatorQueryBlock(),
            new NotOperatorQueryBlock(),
          ]);

          await render(hbs `
            <QueryBuilder::OperatorBlock
              @queryBlock={{this.queryBlock}}
              @valuesBuilder={{this.valuesBuilder}}
            />
          `);

          const labels = this.element.querySelectorAll('.block-infix-label');
          assert.strictEqual(labels.length, 2);
          labels.forEach(label =>
            assert.strictEqual(label.textContent.trim(), operatorName)
          );
        });
      } else {
        test(
          'shows single block-adder and no block when it represents empty block',
          async function (assert) {
            this.set('queryBlock', new operatorBlockClasses[operatorName]());

            await render(hbs `
              <QueryBuilder::OperatorBlock
                @queryBlock={{this.queryBlock}}
                @valuesBuilder={{this.valuesBuilder}}
              />
            `);

            assert.strictEqual(
              this.element.querySelectorAll('.query-builder-block-adder').length,
              1
            );
            assert.notOk(
              this.element.querySelector('.query-builder-block .query-builder-block')
            );
          }
        );

        test(
          'shows block and no block-adder when it represents non-empty block',
          async function (assert) {
            const queryBlock =
              this.set('queryBlock', new operatorBlockClasses[operatorName]());
            queryBlock.operands.pushObject(new NotOperatorQueryBlock());

            await render(hbs `
              <QueryBuilder::OperatorBlock
                @queryBlock={{this.queryBlock}}
                @valuesBuilder={{this.valuesBuilder}}
              />
            `);

            // 1 operand
            assert.strictEqual(this.element.querySelectorAll(
              '.query-builder-block .query-builder-block'
            ).length, 1);
            // 1 adder... (or 2 if operator is "root")
            assert.strictEqual(
              this.element.querySelectorAll('.query-builder-block-adder').length,
              operatorName === 'root' ? 2 : 1
            );
            // ... where 1 is from operand
            assert.ok(this.element.querySelectorAll(
              '.query-builder-block .query-builder-block .query-builder-block-adder'
            ));
          }
        );

        // eslint-disable-next-line qunit/no-identical-names
        test('allows to add block using block-adder', async function (assert) {
          const queryBlock =
            this.set('queryBlock', new operatorBlockClasses[operatorName]());

          await render(hbs `
            <QueryBuilder::OperatorBlock
              @queryBlock={{this.queryBlock}}
              @valuesBuilder={{this.valuesBuilder}}
            />
          `);
          await click('.query-builder-block-adder');
          await click('.block-adder-body .operator-not');

          // 1 operand
          assert.strictEqual(this.element.querySelectorAll(
            '.query-builder-block .query-builder-block'
          ).length, 1);
          // 1 adder... (or 2 if operator is "root")
          assert.strictEqual(
            this.element.querySelectorAll('.query-builder-block-adder').length,
            operatorName === 'root' ? 2 : 1
          );
          // ... where 1 is from operand
          assert.ok(this.element.querySelectorAll(
            '.query-builder-block .query-builder-block .query-builder-block-adder'
          ));
          assert.strictEqual(queryBlock.operands.length, 1);
          assert.ok(queryBlock.operands[0] instanceof NotOperatorQueryBlock);
        });

        if (operatorName === 'root') {
          test('does not show operator name', async function (assert) {
            this.set('queryBlock', new operatorBlockClasses[operatorName]());

            await render(hbs `
              <QueryBuilder::OperatorBlock
                @queryBlock={{this.queryBlock}}
                @valuesBuilder={{this.valuesBuilder}}
              />
            `);

            assert.notOk(this.element.querySelector('.block-prefix-label'));
          });

          test(
            'allows to surround existing operand with an operator via block-adder',
            async function (assert) {
              const queryBlock =
                this.set('queryBlock', new operatorBlockClasses[operatorName]());

              await render(hbs `<QueryBuilder::OperatorBlock
                @queryBlock={{this.queryBlock}}
                @valuesBuilder={{this.valuesBuilder}}
              />`);
              await click('.query-builder-block-adder');
              await click('.block-adder-body .operator-not');
              await click('.query-builder-block-adder.surround-root');

              assert.notOk(
                this.element.querySelector('.block-adder-body .condition-selector')
              );

              await click('.block-adder-body .operator-and');

              assert.strictEqual(
                this.element.querySelectorAll('.query-builder-block').length,
                3
              );
              const surroundingBlock =
                this.element.querySelector('.query-builder-block .query-builder-block');
              assert.dom(surroundingBlock).hasClass('and-operator-block');
              const innerBlock = this.element.querySelector(
                '.query-builder-block .query-builder-block .query-builder-block'
              );
              assert.dom(innerBlock).hasClass('not-operator-block');
              assert.ok(queryBlock.operands[0] instanceof AndOperatorQueryBlock);
              assert.ok(
                queryBlock.operands[0].operands[0] instanceof NotOperatorQueryBlock
              );
              assert.ok(
                this.element.querySelector('.query-builder-block-adder.surround-root')
              );
            }
          );
        } else {
          // eslint-disable-next-line qunit/no-identical-names
          test('shows operator name', async function (assert) {
            this.set('queryBlock', new operatorBlockClasses[operatorName]());

            await render(hbs `
              <QueryBuilder::OperatorBlock
                @queryBlock={{this.queryBlock}}
                @valuesBuilder={{this.valuesBuilder}}
              />
            `);

            assert.strictEqual(
              this.element.querySelector('.block-prefix-label').textContent.trim(),
              operatorName
            );
          });
        }
      }

      test('allows to remove nested block', async function (assert) {
        const {
          queryBlock,
          removedSpy,
        } = this.setProperties({
          queryBlock: new operatorBlockClasses[operatorName](),
          removedSpy: sinon.spy(),
        });

        await render(hbs `<QueryBuilder::OperatorBlock
          @queryBlock={{this.queryBlock}}
          @valuesBuilder={{this.valuesBuilder}}
          @onBlockRemoved={{this.removedSpy}}
        />`);
        await click('.query-builder-block-adder');
        await click('.block-adder-body .operator-not');
        assert.ok(removedSpy.notCalled);
        const nestedBlock = queryBlock.operands[0];
        await click('.remove-block');

        assert.notOk(this.element.querySelector(
          '.query-builder-block .query-builder-block'
        ));
        assert.strictEqual(
          this.element.querySelectorAll('.query-builder-block-adder').length,
          isMultiOperandOperator ? 2 : 1
        );
        assert.strictEqual(queryBlock.operands.length, 0);
        assert.ok(removedSpy.calledOnce);
        assert.ok(removedSpy.calledWith(nestedBlock));
      });

      test('allows to surround nested block with an operator', async function (assert) {
        const queryBlock =
          this.set('queryBlock', new operatorBlockClasses[operatorName]());

        await render(hbs `<QueryBuilder::OperatorBlock
          @queryBlock={{this.queryBlock}}
          @valuesBuilder={{this.valuesBuilder}}
        />`);
        await click('.query-builder-block-adder');
        await click('.block-adder-body .operator-not');
        await click('.query-builder-block-visualiser');
        await click('.block-settings-body .surround-section .operator-and');

        assert.strictEqual(
          this.element.querySelectorAll('.query-builder-block').length,
          3
        );
        const surroundingBlock =
          this.element.querySelector('.query-builder-block .query-builder-block');
        assert.dom(surroundingBlock).hasClass('and-operator-block');
        const innerBlock = this.element.querySelector(
          '.query-builder-block .query-builder-block .query-builder-block'
        );
        assert.dom(innerBlock).hasClass('not-operator-block');
        assert.ok(queryBlock.operands[0] instanceof AndOperatorQueryBlock);
        assert.ok(queryBlock.operands[0].operands[0] instanceof NotOperatorQueryBlock);
      });

      test('allows to change nested operator to another operator',
        async function (assert) {
          const queryBlock =
            this.set('queryBlock', new operatorBlockClasses[operatorName]());

          await render(hbs `<QueryBuilder::OperatorBlock
            @queryBlock={{this.queryBlock}}
            @valuesBuilder={{this.valuesBuilder}}
          />`);
          await click('.query-builder-block-adder');
          await click('.block-adder-body .operator-not');
          await click('.query-builder-block-adder');
          await click('.block-adder-body .operator-or');
          await click('.query-builder-block-visualiser');
          await click('.block-settings-body .change-to-section .operator-and');

          assert.strictEqual(
            this.element.querySelectorAll('.query-builder-block').length,
            3
          );
          const changedBlock =
            this.element.querySelector('.query-builder-block .query-builder-block');
          assert.dom(changedBlock).hasClass('and-operator-block');
          const innerBlock = this.element.querySelector(
            '.query-builder-block .query-builder-block .query-builder-block'
          );
          assert.dom(innerBlock).hasClass('or-operator-block');
          assert.ok(queryBlock.operands[0] instanceof AndOperatorQueryBlock);
          assert.ok(queryBlock.operands[0].operands[0] instanceof OrOperatorQueryBlock);
        }
      );

      test(
        'removes nested NOT operator (with no children) from parent operator when using "change to" "NONE"',
        async function (assert) {
          const queryBlock =
            this.set('queryBlock', new operatorBlockClasses[operatorName]());

          await render(hbs `<QueryBuilder::OperatorBlock
            @queryBlock={{this.queryBlock}}
            @valuesBuilder={{this.valuesBuilder}}
          />`);
          await click('.query-builder-block-adder');
          await click('.block-adder-body .operator-not');
          await click('.query-builder-block-visualiser');
          await click('.block-settings-body .change-to-section .operator-none');

          const blocks = this.element.querySelectorAll('.query-builder-block');
          assert.strictEqual(blocks.length, 1);
          assert.dom(blocks[0]).hasClass(`${operatorName}-operator-block`);
          assert.strictEqual(queryBlock.operands.length, 0);
        }
      );

      test(
        'extracts nested NOT operator (with single child) to parent operator when using "change to" "NONE"',
        async function (assert) {
          const queryBlock =
            this.set('queryBlock', new operatorBlockClasses[operatorName]());

          await render(hbs `<QueryBuilder::OperatorBlock
            @queryBlock={{this.queryBlock}}
            @valuesBuilder={{this.valuesBuilder}}
          />`);
          await click('.query-builder-block-adder');
          await click('.block-adder-body .operator-not');
          await click('.query-builder-block-adder');
          await click('.block-adder-body .operator-and');
          await click('.query-builder-block-visualiser');
          await click('.block-settings-body .change-to-section .operator-none');

          const blocks = this.element.querySelectorAll('.query-builder-block');
          assert.strictEqual(blocks.length, 2);
          assert.dom(blocks[0]).hasClass(`${operatorName}-operator-block`);
          assert.dom(blocks[1]).hasClass('and-operator-block');
          assert.strictEqual(queryBlock.operands.length, 1);
          assert.ok(queryBlock.operands[0] instanceof AndOperatorQueryBlock);
          assert.strictEqual(queryBlock.operands[0].operands.length, 0);
        }
      );

      test(
        `${isMultiOperandOperator ? 'extracts' : 'does not allow to extract' } nested AND operator (with two child) to parent operator when using "change to" "NONE"`,
        async function (assert) {
          const queryBlock =
            this.set('queryBlock', new operatorBlockClasses[operatorName]());

          await render(hbs `<QueryBuilder::OperatorBlock
            @queryBlock={{this.queryBlock}}
            @valuesBuilder={{this.valuesBuilder}}
          />`);
          await click('.query-builder-block-adder');
          await click('.block-adder-body .operator-and');
          await click('.query-builder-block-adder');
          await click('.block-adder-body .operator-not');
          await click('.and-operator-block > .query-builder-block-adder');
          await click('.block-adder-body .operator-not');
          await click('.query-builder-block-visualiser');

          if (isMultiOperandOperator) {
            await click('.block-settings-body .change-to-section .operator-none');

            const blocks = this.element.querySelectorAll('.query-builder-block');
            assert.strictEqual(blocks.length, 3);
            [operatorName, 'not', 'not'].forEach((renderedOperatorName, index) =>
              assert.dom(blocks[index]).hasClass(`${renderedOperatorName}-operator-block`)
            );
            assert.strictEqual(queryBlock.operands.length, 2);
            assert.ok(queryBlock.operands[0] instanceof NotOperatorQueryBlock);
            assert.ok(queryBlock.operands[1] instanceof NotOperatorQueryBlock);
          } else {
            assert.notOk(this.element.querySelector(
              '.block-settings-body .change-to-section .operator-none'
            ));
          }
        }
      );

      test(
        'propagates edition-related notifications from condition blocks',
        async function (assert) {
          const {
            queryBlock,
            editionStartSpy,
            editionEndSpy,
            editionValidityChangeSpy,
          } = this.setProperties({
            queryBlock: new operatorBlockClasses[operatorName](),
            editionStartSpy: sinon.spy(),
            editionEndSpy: sinon.spy(),
            editionValidityChangeSpy: sinon.spy(),
          });
          const nestedOperator = new operatorBlockClasses[operatorName]();
          queryBlock.operands.pushObject(nestedOperator);
          const condition =
            new ConditionQueryBlock({ path: 'a.b' }, 'text.contains', 'abc');
          nestedOperator.operands.pushObject(condition);

          await render(hbs `
            <QueryBuilder::OperatorBlock
              @valuesBuilder={{this.valuesBuilder}}
              @queryBlock={{this.queryBlock}}
              @onConditionEditionStart={{this.editionStartSpy}}
              @onConditionEditionEnd={{this.editionEndSpy}}
              @onConditionEditionValidityChange={{this.editionValidityChangeSpy}}
            />
          `);
          assert.ok(editionStartSpy.notCalled);
          assert.ok(editionEndSpy.notCalled);
          assert.ok(editionValidityChangeSpy.notCalled);

          await click('.comparator-value');
          assert.ok(editionStartSpy.calledOnce);
          assert.ok(editionStartSpy.calledWith(condition));
          assert.ok(editionEndSpy.notCalled);
          assert.ok(editionValidityChangeSpy.notCalled);

          await fillIn('.comparator-value', 'def');
          assert.ok(editionStartSpy.calledOnce);
          assert.ok(editionEndSpy.notCalled);
          assert.ok(editionValidityChangeSpy.calledOnce);
          assert.ok(editionValidityChangeSpy.calledWith(condition, true));

          await blur('.comparator-value');
          assert.ok(editionStartSpy.calledOnce);
          assert.ok(editionEndSpy.calledOnce);
          assert.ok(editionEndSpy.calledWith(condition));
          assert.ok(editionValidityChangeSpy.calledOnce);
        }
      );

      test('yields', async function (assert) {
        this.set('queryBlock', new operatorBlockClasses[operatorName]());

        await render(hbs `
          <QueryBuilder::OperatorBlock
            @queryBlock={{this.queryBlock}}
            @valuesBuilder={{this.valuesBuilder}}
          >
            <span class="test-element"></span>
          </QueryBuilder::OperatorBlock>
        `);

        assert.ok(this.element.querySelector('.test-element'));
      });
    });
  });
});
