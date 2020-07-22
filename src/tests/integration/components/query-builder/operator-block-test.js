import { expect } from 'chai';
import { describe, context, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { click } from '@ember/test-helpers';
import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import OrOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/or-operator-query-block';
import NotOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/not-operator-query-block';
import RootOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/root-operator-query-block';

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
              this.element.querySelectorAll('.query-builder-block-adder .add-trigger');
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
            const block = new operatorBlockClasses[operatorName]();
            block.operands.pushObjects([
              new NotOperatorQueryBlock(),
              new NotOperatorQueryBlock(),
            ]);
            this.set('queryBlock', block);

            await render(hbs `
              <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
            `);

            expect(this.element.querySelectorAll(
              '.query-builder-block .query-builder-block'
            )).to.have.length(2);
            expect(this.element.querySelectorAll(
              '.query-builder-block-adder .add-trigger:not([disabled])'
            )).to.have.length(3);
            expect(this.element.querySelectorAll(
              '.query-builder-block .query-builder-block .query-builder-block-adder'
            )).to.have.length(2);
          }
        );

        it('allows to add block using block-adder', async function () {
          const block = new operatorBlockClasses[operatorName]();
          this.set('queryBlock', block);

          await render(hbs `
            <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
          `);
          const addTriggers = this.element.querySelectorAll('.add-trigger');
          await click(addTriggers[0]);
          await click('.ember-attacher .operator-not');
          await click(addTriggers[1]);
          await click('.ember-attacher .operator-not');

          expect(this.element.querySelectorAll(
            '.query-builder-block .query-builder-block'
          )).to.have.length(2);
          expect(this.element.querySelectorAll('.query-builder-block-adder'))
            .to.have.length(3);
          expect(this.element.querySelectorAll(
            '.query-builder-block .query-builder-block .query-builder-block-adder'
          )).to.have.length(2);
        });

        it('shows operator name', async function () {
          const block = new operatorBlockClasses[operatorName]();
          block.operands.pushObjects([
            new NotOperatorQueryBlock(),
            new NotOperatorQueryBlock(),
          ]);
          this.set('queryBlock', block);

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

            expect(this.element.querySelectorAll('.query-builder-block-adder')).to.exist;
            expect(
              this.element.querySelectorAll('.query-builder-block .query-builder-block')
            ).to.not.exist;
          }
        );

        it(
          'shows block and no block-adder when it represents non-empty block',
          async function () {
            const block = new operatorBlockClasses[operatorName]();
            block.operands.pushObject(new NotOperatorQueryBlock());
            this.set('queryBlock', block);

            await render(hbs `
              <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
            `);

            expect(this.element.querySelectorAll(
              '.query-builder-block .query-builder-block'
            )).to.exist;
            expect(this.element.querySelectorAll('.query-builder-block-adder'))
              .to.have.length(1);
            expect(this.element.querySelectorAll(
              '.query-builder-block .query-builder-block .query-builder-block-adder'
            )).to.exist;
          }
        );

        it('allows to add block using block-adder', async function () {
          const block = new operatorBlockClasses[operatorName]();
          this.set('queryBlock', block);

          await render(hbs `
            <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
          `);
          await click('.add-trigger');
          await click('.ember-attacher .operator-not');

          expect(this.element.querySelectorAll(
            '.query-builder-block .query-builder-block'
          )).to.exist;
          expect(this.element.querySelectorAll('.query-builder-block-adder'))
            .to.have.length(1);
          expect(this.element.querySelectorAll(
            '.query-builder-block .query-builder-block .query-builder-block-adder'
          )).to.exist;
        });

        if (operatorName !== 'root') {
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
        this.set('queryBlock', new operatorBlockClasses[operatorName]());

        await render(hbs `
          <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
        `);
        await click('.add-trigger');
        await click('.ember-attacher .operator-not');
        await click('.remove-block');

        expect(this.element.querySelectorAll(
          '.query-builder-block .query-builder-block'
        )).to.not.exist;
        expect(this.element.querySelectorAll('.query-builder-block-adder'))
          .to.have.length(isMultiOperandOperator ? 2 : 1);
      });

      it('allows to surround nested block with an operator', async function () {
        this.set('queryBlock', new operatorBlockClasses[operatorName]());

        await render(hbs `
          <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
        `);
        await click('.add-trigger');
        await click('.ember-attacher .operator-not');
        await click('.block-settings');
        await click('.ember-attacher .surround-section .operator-and');

        expect(this.element.querySelectorAll('.query-builder-block')).to.have.length(3);
        const surroundingBlock =
          this.element.querySelector('.query-builder-block .query-builder-block');
        expect(surroundingBlock).to.have.class('and-operator-block');
        const innerBlock = this.element.querySelector(
          '.query-builder-block .query-builder-block .query-builder-block'
        );
        expect(innerBlock).to.have.class('not-operator-block');
      });

      it('allows to change nested operator to another operator', async function () {
        this.set('queryBlock', new operatorBlockClasses[operatorName]());

        await render(hbs `
          <QueryBuilder::OperatorBlock @queryBlock={{this.queryBlock}} />
        `);
        await click('.add-trigger');
        await click('.ember-attacher .operator-not');
        await click('.add-trigger');
        await click('.ember-attacher .operator-or');
        await click('.not-operator-block > .block-settings');
        await click('.ember-attacher .change-to-section .operator-and');

        expect(this.element.querySelectorAll('.query-builder-block')).to.have.length(3);
        const changedBlock =
          this.element.querySelector('.query-builder-block .query-builder-block');
        expect(changedBlock).to.have.class('and-operator-block');
        const innerBlock = this.element.querySelector(
          '.query-builder-block .query-builder-block .query-builder-block'
        );
        expect(innerBlock).to.have.class('or-operator-block');
      });

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
