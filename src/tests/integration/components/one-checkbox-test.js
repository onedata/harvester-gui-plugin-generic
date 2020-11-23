import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';

describe('Integration | Component | one-checkbox', function () {
  setupRenderingTest();

  it('has class "one-checkbox"', async function () {
    await render(hbs `<OneCheckbox />`);

    expect(this.element.querySelectorAll('.one-checkbox')).to.have.length(1);
  });

  it('shows value "true"', async function () {
    await render(hbs `<OneCheckbox @value={{true}}/>`);

    const checkboxNode = this.element.querySelector('.one-checkbox');
    expect(checkboxNode).to.have.class('checked');
    expect(checkboxNode.querySelector('.fa-icon')).to.have.class('fa-check');
  });

  it('shows value "false"', async function () {
    await render(hbs `<OneCheckbox @value={{false}}/>`);

    const checkboxNode = this.element.querySelector('.one-checkbox');
    expect(checkboxNode).to.have.class('unchecked');
    expect(checkboxNode.querySelector('.fa-icon')).to.not.exist;
  });

  it('shows value "indeterminate"', async function () {
    await render(hbs `<OneCheckbox @value="indeterminate"/>`);

    const checkboxNode = this.element.querySelector('.one-checkbox');
    expect(checkboxNode).to.have.class('indeterminate');
    expect(checkboxNode.querySelector('.fa-icon')).to.have.class('fa-circle');
  });

  it('is enabled by default', async function () {
    await render(hbs `<OneCheckbox />`);

    const checkboxNode = this.element.querySelector('.one-checkbox');
    expect(checkboxNode).to.not.have.class('disabled');
  });

  it('can be disabled', async function () {
    await render(hbs `<OneCheckbox @disabled={{true}}/>`);

    const checkboxNode = this.element.querySelector('.one-checkbox');
    expect(checkboxNode).to.have.class('disabled');
  });

  it('has customizable input id', async function () {
    await render(hbs `<OneCheckbox @inputId="my-id"/>`);

    const inputNode = this.element.querySelector('.one-checkbox input');
    expect(inputNode).to.have.attr('id', 'my-id');
  });

  [{
    prev: true,
    next: false,
  }, {
    prev: false,
    next: true,
  }, {
    prev: 'indeterminate',
    next: true,
  }].forEach(({ prev, next }) => {
    it(`notifies about value change from "${prev}" to "${next}"`, async function () {
      this.initialValue = prev;
      this.changeSpy = sinon.spy();

      await render(hbs `<OneCheckbox
        @value={{this.initialValue}}
        @onChange={{this.changeSpy}}
      />`);
      await click('.one-checkbox');

      expect(this.changeSpy).to.be.calledOnce.and.to.be.calledWith(next);
    });
  });

  it('can be changed using associated label', async function () {
    this.changeSpy = sinon.spy();

    await render(hbs `
      <label class="label" for="my-id">click me</label>
      <OneCheckbox
        @inputId="my-id"
        @value={{true}}
        @onChange={{this.changeSpy}}
      />
    `);
    await click('.label');

    expect(this.changeSpy).to.be.calledOnce.and.to.be.calledWith(false);
  });
});
