import { module, test } from 'qunit';
import { setupRenderingTest } from '../../../../helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

const allowedOperatorsList = ['and', 'or', 'not', 'none'];
const defaultVisibleOperatorsList = allowedOperatorsList.without('none');

module(
  'Integration | Component | query-builder/block-selector/operator-selector',
  hooks => {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
      this.set('allOperators', allowedOperatorsList);
    });

    test(
      `renders three operators: ${defaultVisibleOperatorsList.map(s => s.toUpperCase()).join(', ')} by default`,
      async function (assert) {
        await render(hbs `<QueryBuilder::BlockSelector::OperatorSelector/>`);

        const operators = this.element.querySelectorAll('.operator-selector .operator');
        assert.strictEqual(operators.length, 3);
        defaultVisibleOperatorsList.forEach((operatorName, index) =>
          checkOperatorButton(assert, operators[index], operatorName)
        );
      }
    );

    test(
      `renders all operators: ${allowedOperatorsList.map(s => s.toUpperCase()).join(', ')} when specified`,
      async function (assert) {
        await render(hbs `<QueryBuilder::BlockSelector::OperatorSelector
          @operators={{this.allOperators}}
        />`);

        const operators = this.element.querySelectorAll('.operator-selector .operator');
        assert.strictEqual(operators.length, 4);
        allowedOperatorsList.forEach((operatorName, index) =>
          checkOperatorButton(assert, operators[index], operatorName)
        );
      }
    );

    allowedOperatorsList.forEach(operatorName => {
      test(
        `calls "onOperatorSelected" callback, when ${operatorName.toUpperCase()} operator has been clicked`,
        async function (assert) {
          const addSpy = this.set('addSpy', sinon.spy());

          await render(hbs `<QueryBuilder::BlockSelector::OperatorSelector
            @operators={{this.allOperators}}
            @onOperatorSelected={{this.addSpy}}
          />`);

          assert.ok(addSpy.notCalled);
          await click(`.operator-${operatorName}`);
          assert.ok(addSpy.calledOnce);
          assert.ok(addSpy.calledWith(operatorName));
        }
      );
    });

    test(
      'renders only specified subset of operators',
      async function (assert) {
        await render(hbs `<QueryBuilder::BlockSelector::OperatorSelector
          @operators={{array "and" "or"}}
        />`);

        const operators = this.element.querySelectorAll('.operator-selector .operator');
        assert.strictEqual(operators.length, 2);
        ['and', 'or'].forEach((operatorName, index) =>
          checkOperatorButton(assert, operators[index], operatorName)
        );
      }
    );

    test(
      'does not render incorrect operators',
      async function (assert) {
        await render(hbs `<QueryBuilder::BlockSelector::OperatorSelector
          @operators={{array "and" "xor"}}
        />`);

        const operators = this.element.querySelectorAll('.operator-selector .operator');
        assert.strictEqual(operators.length, 1);
        checkOperatorButton(assert, operators[0], 'and');
      }
    );

    test(
      'does not disable any operator by default',
      async function (assert) {
        await render(hbs `<QueryBuilder::BlockSelector::OperatorSelector/>`);

        assert.notOk(this.element.querySelector(
          '.operator-selector .operator[disabled]'
        ));
      }
    );

    test(
      'disables specified operators',
      async function (assert) {
        await render(hbs `<QueryBuilder::BlockSelector::OperatorSelector
          @operators={{this.allOperators}}
          @disabledOperators={{array "and" "or"}}
        />`);

        assert.strictEqual(this.element.querySelectorAll(
          '.operator-selector .operator[disabled]'
        ).length, 2);
        ['not', 'none'].forEach(operatorName => assert.dom(this.element.querySelector(
          `.operator-selector .operator-${operatorName}`
        )).doesNotHaveAttribute('disabled'));
      }
    );
  }
);

function checkOperatorButton(assert, buttonNode, operatorName) {
  assert.strictEqual(buttonNode.textContent.trim(), operatorName);
  assert.dom(buttonNode).hasClass(`operator-${operatorName}`);
}
