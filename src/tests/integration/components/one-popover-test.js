import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { htmlSafe } from '@ember/template';

const manualShowEvents = ['onWillShow', 'onDidShow'];
const showEvents = ['onShowEventTriggered', ...manualShowEvents];
const manualHideEvents = ['onWillHide', 'onDidHide'];
const hideEvents = ['onHideEventTriggered', ...manualHideEvents];
const allEvents = [...showEvents, ...hideEvents];

describe('Integration | Component | one-popover', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      trigger: 'click',
      isOpen: false,
      events: [],
      onShowEventTriggered: () => {
        this.events.push('onShowEventTriggered');
        return this.onShowEventTriggeredResult;
      },
      onWillShow: () => this.events.push('onWillShow'),
      onDidShow: () => this.events.push('onDidShow'),
      onHideEventTriggered: () => {
        this.events.push('onHideEventTriggered');
        return this.onHideEventTriggeredResult;
      },
      onWillHide: () => this.events.push('onWillHide'),
      onDidHide: () => this.events.push('onDidHide'),
      onShowEventTriggeredResult: undefined,
      onHideEventTriggeredResult: undefined,
      popoverContent: undefined,
    });
  });

  it('does not render anything in place when is not opened', async function () {
    this.set('popoverContent', 'some text');
    await renderPopover();

    expect(find('.btn').children).to.have.length(0);
  });

  it('is not visible when not opened', async function () {
    this.set('popoverContent', 'some text');
    await renderPopover();

    expect(isPopoverHidden()).to.be.true;
    expect(this.element).to.have.trimmed.text('');
  });

  it('becomes visible when opened by trigger click', async function () {
    this.set('popoverContent', 'some text');
    await renderPopover();

    await click('.btn');

    expect(isPopoverShown()).to.be.true;
    expect(this.element).to.have.trimmed.text('some text');
    expect(find('.btn').children).to.have.length(0);
  });

  it('becomes hidden when closed by trigger click', async function () {
    await renderPopover();

    await click('.btn');
    await click('.btn');

    expect(isPopoverHidden()).to.be.true;
  });

  it('becomes hidden when closed by outside click', async function () {
    await renderPopover();

    await click('.btn');
    await click(this.element);

    expect(isPopoverHidden()).to.be.true;
  });

  it('is still visible after click inside popover', async function () {
    this.set('popoverContent', htmlSafe('<button class="inside"></button>'));
    await renderPopover();

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
    this.set('popoverContent', 'ab');
    await renderPopover();

    await click('.btn');
    this.set('popoverContent', 'cd');
    await settled();

    expect(this.element).to.have.trimmed.text('cd');
  });

  it('triggers onShowEventTriggered, onWillShow and onDidShow events when becomes visible',
    async function () {
      await renderPopover();

      await click('.btn');

      expectEvents(this, showEvents);
    }
  );

  it('does not trigger onWillShow and onDidShow events and does not show popover when onShowEventTriggered returns false',
    async function () {
      this.set('onShowEventTriggeredResult', false);
      await renderPopover();

      await click('.btn');

      expectEvents(this, ['onShowEventTriggered']);
      expect(isPopoverHidden()).to.be.true;
    }
  );

  it('has nothing rendered when onShowEventTriggered is called', async function () {
    const onShowEventTriggeredOld = this.onShowEventTriggered;
    const eventHandler = this.set('onShowEventTriggered', sinon.spy(() => {
      expect(isPopoverHidden()).to.be.true;
      return onShowEventTriggeredOld();
    }));
    await renderPopover();

    await click('.btn');

    expect(eventHandler).to.be.calledOnce;
  });

  it('has nothing rendered when onWillShow is called', async function () {
    const onWillShowOld = this.onWillShow;
    const eventHandler = this.set('onWillShow', sinon.spy(() => {
      expect(isPopoverHidden()).to.be.true;
      return onWillShowOld();
    }));
    await renderPopover();

    await click('.btn');

    expect(eventHandler).to.be.calledOnce;
  });

  it('has rendered popover when onDidShow is called', async function () {
    const onDidShowOld = this.onDidShow;
    const eventHandler = this.set('onDidShow', sinon.spy(() => {
      expect(isPopoverShown()).to.be.true;
      return onDidShowOld();
    }));
    await renderPopover();

    await click('.btn');

    expect(eventHandler).to.be.calledOnce;
  });

  it('triggers onHideEventTriggered, onWillHide and onDidHide events when becomes hidden',
    async function () {
      await renderPopover();

      await click('.btn');
      await click('.btn');

      expectEvents(this, allEvents);
    }
  );

  it('does not trigger onWillHide and onDidHide events and does not hide popover when onHideEventTriggered returns false',
    async function () {
      this.set('onHideEventTriggeredResult', false);
      await renderPopover();

      await click('.btn');
      await click('.btn');

      expectEvents(this, [...showEvents, 'onHideEventTriggered']);
      expect(isPopoverShown()).to.be.true;
    }
  );

  it('has rendered popover when onHideEventTriggered is called', async function () {
    const onHideEventTriggeredOld = this.onHideEventTriggered;
    const eventHandler = this.set('onHideEventTriggered', sinon.spy(() => {
      expect(isPopoverShown()).to.be.true;
      return onHideEventTriggeredOld();
    }));
    await renderPopover();

    await click('.btn');
    await click('.btn');

    expect(eventHandler).to.be.calledOnce;
  });

  it('has rendered popover when onWillHide is called', async function () {
    const onWillHideOld = this.onWillHide;
    const eventHandler = this.set('onWillHide', sinon.spy(() => {
      expect(isPopoverShown()).to.be.true;
      return onWillHideOld();
    }));
    await renderPopover();

    await click('.btn');
    await click('.btn');

    expect(eventHandler).to.be.calledOnce;
  });

  it('has nothing rendered when onDidHide is called', async function () {
    const onDidHideOld = this.onDidHide;
    const eventHandler = this.set('onDidHide', sinon.spy(() => {
      expect(isPopoverHidden()).to.be.true;
      return onDidHideOld();
    }));
    await renderPopover();

    await click('.btn');
    await click('.btn');

    expect(eventHandler).to.be.calledOnce;
  });

  it('can be opened with "manual" trigger', async function () {
    this.set('trigger', 'manual');
    await renderPopover();

    this.set('isOpen', true);
    await settled();

    expectEvents(this, manualShowEvents);
    expect(isPopoverShown()).to.be.true;
  });

  it('can be closed with "manual" trigger', async function () {
    this.set('trigger', 'manual');
    await renderPopover();

    this.set('isOpen', true);
    await settled();
    this.set('isOpen', false);
    await settled();

    expectEvents(this, [...manualShowEvents, ...manualHideEvents]);
    expect(isPopoverHidden()).to.be.true;
  });

  it('triggers onShowEventTriggered when trigger is "manual" and user clicks on trigger element',
    async function () {
      this.set('trigger', 'manual');
      await renderPopover();

      await click('.btn');

      expectEvents(this, ['onShowEventTriggered']);
      expect(isPopoverHidden()).to.be.true;
    }
  );

  it('triggers two onShowEventTriggered events when trigger is "manual" and user clicks two times on trigger element',
    async function () {
      this.set('trigger', 'manual');
      await renderPopover();

      await click('.btn');
      await click('.btn');

      expectEvents(this, ['onShowEventTriggered', 'onShowEventTriggered']);
      expect(isPopoverHidden()).to.be.true;
    }
  );

  it('triggers onHideEventTriggered when trigger is "manual", popover is opened and user clicks on trigger element',
    async function () {
      this.setProperties({
        trigger: 'manual',
        isOpen: true,
      });
      await renderPopover();

      await click('.btn');

      expectEvents(this, [...manualShowEvents, 'onHideEventTriggered']);
      expect(isPopoverShown()).to.be.true;
    }
  );

  it('triggers two onHideEventTriggered events when trigger is "manual", popover is opened and and user clicks two times on trigger element',
    async function () {
      this.setProperties({
        trigger: 'manual',
        isOpen: true,
      });
      await renderPopover();

      await click('.btn');
      await click('.btn');

      expectEvents(
        this,
        [...manualShowEvents, 'onHideEventTriggered', 'onHideEventTriggered']
      );
      expect(isPopoverShown()).to.be.true;
    }
  );

  it('triggers onHideEventTriggered on outside click when popover is open in manual mode',
    async function () {
      this.setProperties({
        trigger: 'manual',
        isOpen: true,
      });
      await renderPopover();

      await click(this.element);

      expectEvents(this, [...manualShowEvents, 'onHideEventTriggered']);
      expect(isPopoverShown()).to.be.true;
    }
  );

  it('triggers two onHideEventTriggered events on outside two clicks when popover is open in manual mode',
    async function () {
      this.setProperties({
        trigger: 'manual',
        isOpen: true,
      });
      await renderPopover();

      await click(this.element);
      await click(this.element);

      expectEvents(
        this,
        [...manualShowEvents, 'onHideEventTriggered', 'onHideEventTriggered']
      );
      expect(isPopoverShown()).to.be.true;
    }
  );

  it('does not trigger onHideEventTriggered on outside click after ignored show trigger in manual mode',
    async function () {
      this.set('trigger', 'manual');
      await renderPopover();

      await click('.btn');
      await click(this.element);

      expectEvents(this, ['onShowEventTriggered']);
      expect(isPopoverHidden()).to.be.true;
    }
  );
});

async function renderPopover() {
  await render(hbs`<button class="btn">
    <OnePopover
      @trigger={{this.trigger}}
      @isOpen={{this.isOpen}}
      @onShowEventTriggered={{this.onShowEventTriggered}}
      @onWillShow={{this.onWillShow}}
      @onDidShow={{this.onDidShow}}
      @onHideEventTriggered={{this.onHideEventTriggered}}
      @onWillHide={{this.onWillHide}}
      @onDidHide={{this.onDidHide}}
    >{{this.popoverContent}}</OnePopover>
  </button>`);
}

function isPopoverShown() {
  return find('.btn').getAttribute('aria-expanded') === 'true' &&
    Boolean(find('.tippy-box'));
}

function isPopoverHidden() {
  return find('.btn').getAttribute('aria-expanded') === 'false' &&
    !find('.tippy-box');
}

function expectEvents(testCase, events) {
  expect(testCase.events).to.deep.equal(events);
}
