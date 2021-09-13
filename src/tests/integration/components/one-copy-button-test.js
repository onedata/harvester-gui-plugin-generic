import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one-copy-button', function () {
  setupRenderingTest();

  it('has class "one-copy-button"', async function () {
    await render(hbs `<OneCopyButton />`);

    expect(this.element.querySelectorAll('.one-copy-button')).to.have.length(1);
  });

  it('shows only button in "button" mode', async function () {
    await render(hbs `<OneCopyButton @mode="button" @value="abc" />`);

    const button = this.element.querySelector('button');
    expect(button).to.exist;
    expect(button).to.have.attr('data-clipboard-text', 'abc');
    expect(this.element.querySelectorAll('input, textarea')).to.have.length(0);
  });

  it('shows input and button in "input" mode', async function () {
    await render(hbs `<OneCopyButton @mode="input" @value="abc" />`);

    const button = this.element.querySelector('button');
    const input = this.element.querySelector('input');
    expect(button).to.exist;
    expect(button).to.have.attr('data-clipboard-target', `#${input.id}`);
    expect(input).to.exist;
    expect(input).to.have.value('abc');
    expect(this.element.querySelectorAll('textarea')).to.have.length(0);
  });

  it('shows textarea and button in "textarea" mode', async function () {
    await render(hbs `<OneCopyButton @mode="textarea" @value="abc" />`);

    const button = this.element.querySelector('button');
    const textarea = this.element.querySelector('textarea');
    expect(button).to.exist;
    expect(button).to.have.attr('data-clipboard-target', `#${textarea.id}`);
    expect(textarea).to.exist;
    expect(textarea.textContent.trim()).to.equal('abc');
    expect(this.element.querySelectorAll('input')).to.have.length(0);
  });

  it('allows to pass custom content to copy button', async function () {
    await render(hbs `<OneCopyButton>test</OneCopyButton>`);

    expect(this.element.querySelector('button').textContent.trim()).to.equal('test');
  });

  it('allows to set custom class for copy button', async function () {
    await render(hbs `<OneCopyButton @buttonClasses="test"/>`);

    expect(this.element.querySelector('button')).to.have.class('test');
  });
});
