import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click, waitUntil, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

describe('Integration | Component | one-popover', function () {
  setupRenderingTest();

  it('does not render anything in place when is not opened', async function () {
    await render(hbs`<button class="btn">
      <OnePopover>some text</OnePopover>
    </button>`);

    expect(find('.btn').children).to.have.length(0);
  });

  it('is not visible when not opened', async function () {
    await render(hbs`<button class="btn">
      <OnePopover>some text</OnePopover>
    </button>`);

    expect(isPopoverHidden()).to.be.true;
    expect(this.element).to.have.trimmed.text('');
  });

  it('becomes visible when opened by trigger click', async function () {
    await render(hbs`<button class="btn">
      <OnePopover>some text</OnePopover>
    </button>`);

    await click('.btn');

    expect(isPopoverShown()).to.be.true;
    expect(this.element).to.have.trimmed.text('some text');
    expect(find('.btn').children).to.have.length(0);
  });

  it('becomes hidden when closed by trigger click', async function () {
    await render(hbs`<button class="btn"><OnePopover /></button>`);

    await click('.btn');
    await click('.btn');

    expect(isPopoverHidden()).to.be.true;
  });

  it('becomes hidden when closed by outside click', async function () {
    await render(hbs`<button class="btn"><OnePopover /></button>`);

    await click('.btn');
    await click(this.element);

    expect(isPopoverHidden()).to.be.true;
  });

  it('is still visible after click inside popover', async function () {
    await render(hbs`<button class="btn">
      <OnePopover><button class="inside"></button></OnePopover>
    </button>`);

    await click('.btn');
    await click('.inside');

    expect(isPopoverShown()).to.be.true;
  });

  it('can be hidden using yielded "hide" action', async function () {
    await render(hbs`<button class="btn">
      <OnePopover as |popover|>
        <button class="inside" {{on "click" popover.hide}}></button>
      </OnePopover>
    </button>`);

    await click('.btn');
    await click('.inside');

    expect(isPopoverHidden()).to.be.true;
  });

  it('renders dynamic ember-ish content inside popover', async function () {
    this.set('content', 'ab');
    await render(hbs`<button class="btn">
      <OnePopover>{{content}}</OnePopover>
    </button>`);

    await click('.btn');
    this.set('content', 'cd');
    await settled();

    expect(this.element).to.have.trimmed.text('cd');
  });

  it('triggers both onShow and onShown events when becomes visible', async function () {
    this.setProperties({
      onShow: sinon.spy(),
      onShown: sinon.spy(),
    });
    await render(hbs`<button class="btn">
      <OnePopover @onShow={{this.onShow}} @onShown={{this.onShown}} />
    </button>`);

    await click('.btn');

    expect(this.onShow).to.be.calledOnce;
    expect(this.onShown).to.be.calledOnce;
  });

  it('does not trigger onShown and does not show popover when onShow returns false', async function () {
    this.setProperties({
      onShow: sinon.spy(() => false),
      onShown: sinon.spy(),
    });
    await render(hbs`<button class="btn">
      <OnePopover @onShow={{this.onShow}} @onShown={{this.onShown}} />
    </button>`);

    await click('.btn');

    expect(this.onShow).to.be.calledOnce;
    expect(this.onShown).to.be.not.called;
    expect(isPopoverHidden()).to.be.true;
  });

  it('triggers both onHide and onHidden events when becomes hidden', async function () {
    this.setProperties({
      onHide: sinon.spy(),
      onHidden: sinon.spy(),
    });
    await render(hbs`<button class="btn">
      <OnePopover @onHide={{this.onHide}} @onHidden={{this.onHidden}} />
    </button>`);

    await click('.btn');
    await click('.btn');

    expect(this.onHide).to.be.calledOnce;
    expect(this.onHidden).to.be.calledOnce;
  });

  it('does not trigger onHidden and does not hide popover when onHide returns false', async function () {
    this.setProperties({
      onHide: sinon.spy(() => false),
      onHidden: sinon.spy(),
    });
    await render(hbs`<button class="btn">
      <OnePopover @onHide={{this.onHide}} @onHidden={{this.onHidden}} />
    </button>`);

    await click('.btn');
    await click('.btn');

    expect(this.onHide).to.be.calledOnce;
    expect(this.onHidden).to.be.not.called;
    expect(isPopoverShown()).to.be.true;
  });

  it('can be opened with "manual" trigger', async function () {
    await render(hbs`<button class="btn">
      <OnePopover @trigger="manual" @isOpen={{this.isOpen}} />
    </button>`);

    this.set('isOpen', true);
    await settled();

    expect(isPopoverShown()).to.be.true;
  });

  it('can be closed with "manual" trigger', async function () {
    await render(hbs`<button class="btn">
      <OnePopover @trigger="manual" @isOpen={{this.isOpen}} />
    </button>`);

    this.set('isOpen', true);
    await settled();
    this.set('isOpen', false);
    await settled();

    expect(isPopoverHidden()).to.be.true;
  });

  it('triggers onShow when trigger is "manual" and user clicks on trigger element', async function () {
    this.setProperties({
      onShow: sinon.spy(),
      onShown: sinon.spy(),
      isOpen: false,
    });
    await render(hbs`<button class="btn">
      <OnePopover
        @trigger="manual"
        @onShow={{this.onShow}}
        @onShown={{this.onShown}}
        @isOpen={{this.isOpen}}
      />
    </button>`);

    await click('.btn');

    expect(this.onShow).to.be.calledOnce;
    expect(this.onShown).to.be.not.called;
    expect(isPopoverHidden()).to.be.true;
  });

  it('triggers onHide when trigger is "manual", popover is opened and user clicks on trigger element',
    async function () {
      this.setProperties({
        onHide: sinon.spy(),
        onHidden: sinon.spy(),
        isOpen: true,
      });
      await render(hbs`<button class="btn">
        <OnePopover
          @trigger="manual"
          @onHide={{this.onHide}}
          @onHidden={{this.onHidden}}
          @isOpen={{this.isOpen}}
        />
      </button>`);

      await click('.btn');

      expect(this.onHide).to.be.calledOnce;
      expect(this.onHidden).to.be.not.called;
      expect(isPopoverShown()).to.be.true;
    }
  );
});

function isPopoverShown() {
  return find('.btn').getAttribute('aria-expanded') === 'true' &&
    Boolean(find('.tippy-box'));
}

function isPopoverHidden() {
  return find('.btn').getAttribute('aria-expanded') === 'false' &&
    !find('.tippy-box');
}
