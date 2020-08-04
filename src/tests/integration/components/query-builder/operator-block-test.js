import { expect } from 'chai';
import { describe, context, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { click, fillIn } from '@ember/test-helpers';
import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import OrOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/or-operator-query-block';
import NotOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/not-operator-query-block';
import RootOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/root-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import sinon from 'sinon';

const multiOperandOperatorsList = ['and', 'or'];
const singleOperandOperatorsList = ['not', 'root'];
const operatorsList = [...multiOperandOperatorsList, ...singleOperandOperatorsList];
const operatorBlockClasses = {
  and: AndOperatorQueryBlock,
  or: OrOperatorQueryBlock,
  not: NotOperatorQueryBlock,
  root: RootOperatorQueryBlock,
};

describe('Integration | Component | query-builder/operator-block', function () {
  setupRenderingTest();

  it(
    'has classes "query-builder-block" and "query-builder-operator-block"',
    async function () {
      await render(hbs `<QueryBuilder::OperatorBlock />`);

      expect(this.element.querySelectorAll(
        '.query-builder-block.query-builder-operator-block'
      )).to.have.length(1);
    }
  );

  operatorsList.forEach(operatorName => {
    context(`with ${operatorName.toUpperCase()} operator`, function () {
      const isMultiOperandOperator = multiOperandOperatorsList.includes(operatorName);

      it(
        `has class "${operatorName}-operator-block"`,
        async function () {
          this.set('queryBlock', new operatorBlockClasses[operatorName]());

          await render(hbs `
            <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
          `);

          expect(this.element.querySelectorAll(
            `.query-builder-block.${operatorName}-operator-block`
          )).to.have.length(1);
        }
      );

      if (isMultiOperandOperator) {
        it(
          'has two block-adders (only first enabled) and no block when it represents empty block',
          async function () {
            this.set('queryBlock', new operatorBlockClasses[operatorName]());

            await render(hbs `
              <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
            `);

            const blockAdderTriggers =
              this.element.querySelectorAll('.query-builder-block-adder');
            expect(blockAdderTriggers).to.have.length(2);
            expect(blockAdderTriggers[0]).to.not.have.attr('disabled');
            expect(blockAdderTriggers[1]).to.have.attr('disabled');
            expect(this.element.querySelector(
              '.query-builder-block .query-builder-block'
            )).to.not.exist;
          }
        );

        it(
          'shows blocks and one enabled block-adder when it represents non-empty block',
          async function () {
            const queryBlock =
              this.set('queryBlock', new operatorBlockClasses[operatorName]());
            queryBlock.operands.pushObjects([
              new NotOperatorQueryBlock(),
              new NotOperatorQueryBlock(),
            ]);

            await render(hbs `
              <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
            `);

            // 2 operands
            expect(this.element.querySelectorAll(
              '.query-builder-block .query-builder-block'
            )).to.have.length(2);
            // 2 from operands + 1 from the parent block
            expect(this.element.querySelectorAll(
              '.query-builder-block-adder:not([disabled])'
            )).to.have.length(3);
            // exactly 2 are from operands (NOT operators)
            expect(this.element.querySelectorAll(
              '.query-builder-block .query-builder-block .query-builder-block-adder'
            )).to.have.length(2);
          }
        );

        it('allows to add block using block-adder', async function () {
          const queryBlock =
            this.set('queryBlock', new operatorBlockClasses[operatorName]());

          await render(hbs `
            <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
          `);
          await click(this.element.querySelector('.query-builder-block-adder'));
          await click('.ember-attacher .operator-not');

          // 1 operand
          expect(this.element.querySelectorAll(
            '.query-builder-block .query-builder-block'
          )).to.have.length(1);
          // 1 from operands + 1 from the parent block
          expect(this.element.querySelectorAll('.query-builder-block-adder'))
            .to.have.length(2);
          // exactly 1 is from operands (NOT operators)
          expect(this.element.querySelectorAll(
            '.query-builder-block .query-builder-block .query-builder-block-adder'
          )).to.have.length(1);
          expect(queryBlock.operands).to.have.length(1);
          expect(queryBlock.operands[0]).to.be.an.instanceOf(NotOperatorQueryBlock);
        });

        it('shows operator name', async function () {
          const queryBlock =
            this.set('queryBlock', new operatorBlockClasses[operatorName]());
          queryBlock.operands.pushObjects([
            new NotOperatorQueryBlock(),
            new NotOperatorQueryBlock(),
          ]);

          await render(hbs `
            <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
          `);

          const labels = this.element.querySelectorAll('.block-infix-label');
          expect(labels).to.have.length(2);
          labels.forEach(label =>
            expect(label.textContent.trim()).to.equal(operatorName)
          );
        });
      } else {
        it(
          'shows single block-adder and no block when it represents empty block',
          async function () {
            this.set('queryBlock', new operatorBlockClasses[operatorName]());

            await render(hbs `
              <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
            `);

            expect(this.element.querySelectorAll('.query-builder-block-adder'))
              .to.have.length(1);
            expect(
              this.element.querySelectorAll('.query-builder-block .query-builder-block')
            ).to.not.exist;
          }
        );

        it(
          'shows block and no block-adder when it represents non-empty block',
          async function () {
            const queryBlock =
              this.set('queryBlock', new operatorBlockClasses[operatorName]());
            queryBlock.operands.pushObject(new NotOperatorQueryBlock());

            await render(hbs `
              <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
            `);

            // 1 operand
            expect(this.element.querySelectorAll(
              '.query-builder-block .query-builder-block'
            )).to.have.length(1);
            // 1 adder...
            expect(this.element.querySelectorAll('.query-builder-block-adder'))
              .to.have.length(1);
            // ... but from operand, not parent block
            expect(this.element.querySelectorAll(
              '.query-builder-block .query-builder-block .query-builder-block-adder'
            )).to.exist;
          }
        );

        it('allows to add block using block-adder', async function () {
          const queryBlock =
            this.set('queryBlock', new operatorBlockClasses[operatorName]());

          await render(hbs `
            <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
          `);
          await click('.query-builder-block-adder');
          await click('.ember-attacher .operator-not');

          // 1 operand
          expect(this.element.querySelectorAll(
            '.query-builder-block .query-builder-block'
          )).to.have.length(1);
          // 1 adder...
          expect(this.element.querySelectorAll('.query-builder-block-adder'))
            .to.have.length(1);
          // ... but from operand, not parent block
          expect(this.element.querySelectorAll(
            '.query-builder-block .query-builder-block .query-builder-block-adder'
          )).to.exist;
          expect(queryBlock.operands).to.have.length(1);
          expect(queryBlock.operands[0]).to.be.an.instanceOf(NotOperatorQueryBlock);
        });

        if (operatorName === 'root') {
          it('does not show operator name', async function () {
            this.set('queryBlock', new operatorBlockClasses[operatorName]());

            await render(hbs `
              <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
            `);

            expect(this.element.querySelector('.block-prefix-label')).to.not.exist;
          });
        } else {
          it('shows operator name', async function () {
            this.set('queryBlock', new operatorBlockClasses[operatorName]());

            await render(hbs `
              <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
            `);

            expect(this.element.querySelector('.block-prefix-label').textContent.trim())
              .to.equal(operatorName);
          });
        }
      }

      it('allows to remove nested block', async function () {
        const {
          queryBlock,
          removedSpy,
        } = this.setProperties({
          queryBlock: new operatorBlockClasses[operatorName](),
          removedSpy: sinon.spy(),
        });

        await render(hbs `<QueryBuilder::OperatorBlock
          @queryBlock={{this.queryBlock}}
          @onBlockRemoved={{this.removedSpy}}
        />`);
        await click('.query-builder-block-adder');
        await click('.ember-attacher .operator-not');
        expect(removedSpy).to.be.not.called;
        const nestedBlock = queryBlock.operands[0];
        await click('.remove-block');

        expect(this.element.querySelectorAll(
          '.query-builder-block .query-builder-block'
        )).to.not.exist;
        expect(this.element.querySelectorAll('.query-builder-block-adder'))
          .to.have.length(isMultiOperandOperator ? 2 : 1);
        expect(queryBlock.operands).to.have.length(0);
        expect(removedSpy).to.be.calledOnce.and.to.be.calledWith(nestedBlock);
      });

      it('allows to surround nested block with an operator', async function () {
        const queryBlock =
          this.set('queryBlock', new operatorBlockClasses[operatorName]());

        await render(hbs `
          <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
        `);
        await click('.query-builder-block-adder');
        await click('.ember-attacher .operator-not');
        await click('.query-builder-block-visualiser');
        await click('.ember-attacher .surround-section .operator-and');

        expect(this.element.querySelectorAll('.query-builder-block')).to.have.length(3);
        const surroundingBlock =
          this.element.querySelector('.query-builder-block .query-builder-block');
        expect(surroundingBlock).to.have.class('and-operator-block');
        const innerBlock = this.element.querySelector(
          '.query-builder-block .query-builder-block .query-builder-block'
        );
        expect(innerBlock).to.have.class('not-operator-block');
        expect(queryBlock.operands[0]).to.be.an.instanceOf(AndOperatorQueryBlock);
        expect(queryBlock.operands[0].operands[0])
          .to.be.an.instanceOf(NotOperatorQueryBlock);
      });

      it('allows to change nested operator to another operator', async function () {
        const queryBlock =
          this.set('queryBlock', new operatorBlockClasses[operatorName]());

        await render(hbs `
          <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
        `);
        await click('.query-builder-block-adder');
        await click('.ember-attacher .operator-not');
        await click('.query-builder-block-adder');
        await click('.ember-attacher .operator-or');
        await click('.query-builder-block-visualiser');
        await click('.ember-attacher .change-to-section .operator-and');

        expect(this.element.querySelectorAll('.query-builder-block')).to.have.length(3);
        const changedBlock =
          this.element.querySelector('.query-builder-block .query-builder-block');
        expect(changedBlock).to.have.class('and-operator-block');
        const innerBlock = this.element.querySelector(
          '.query-builder-block .query-builder-block .query-builder-block'
        );
        expect(innerBlock).to.have.class('or-operator-block');
        expect(queryBlock.operands[0]).to.be.an.instanceOf(AndOperatorQueryBlock);
        expect(queryBlock.operands[0].operands[0])
          .to.be.an.instanceOf(OrOperatorQueryBlock);
      });

      it(
        'propagates edition-related notifications from condition blocks',
        async function () {
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
              @queryBlock={{this.queryBlock}}
              @onConditionEditionStart={{this.editionStartSpy}}
              @onConditionEditionEnd={{this.editionEndSpy}}
              @onConditionEditionValidityChange={{this.editionValidityChangeSpy}}
            />
          `);
          expect(editionStartSpy).to.not.be.called;
          expect(editionEndSpy).to.not.be.called;
          expect(editionValidityChangeSpy).to.not.be.called;

          await click('.comparator-value');
          expect(editionStartSpy).to.be.calledOnce.and.to.be.calledWith(condition);
          expect(editionEndSpy).to.not.be.called;
          expect(editionValidityChangeSpy).to.not.be.called;

          await fillIn('.comparator-value', 'def');
          expect(editionStartSpy).to.be.calledOnce;
          expect(editionEndSpy).to.not.be.called;
          expect(editionValidityChangeSpy).to.be.calledOnce
            .and.to.be.calledWith(condition, true);

          await blur('.comparator-value');
          expect(editionStartSpy).to.be.calledOnce;
          expect(editionEndSpy).to.not.calledOnce.and.to.be.calledWith(condition);
          expect(editionValidityChangeSpy).to.be.calledOnce;
        }
      );

      it('yields', async function () {
        this.set('queryBlock', new operatorBlockClasses[operatorName]());

        await render(hbs `
          <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}}>
            <span class="test-element"></span>
          </QueryBuilder::OperatorBlock>
        `);

        expect(this.element.querySelector('.test-element')).to.exist;
      });
    });
  });
});
