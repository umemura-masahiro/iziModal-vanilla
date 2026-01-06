/**
 * IziModalコアクラス
 */
import { PLUGIN_NAME, STATES } from './constants.js';
import { defaults } from './defaults.js';
import * as dom from '../utils/dom.js';
import * as events from '../utils/events.js';
import { sanitize, clearValue, changeHashWithoutScrolling, isMobile, extend } from '../utils/helpers.js';
import { animationEvent } from '../utils/animation.js';
import { next as navigationNext, prev as navigationPrev } from '../modules/navigation.js';
import { recalcWidth as layoutRecalcWidth, recalcVerticalPos as layoutRecalcVerticalPos, recalcLayout as layoutRecalcLayout } from '../modules/layout.js';

// グローバル変数
const $document = document;
const isMobileDevice = isMobile();

class IziModal {
  constructor(element, options) {
    this.$element = typeof element === 'string' ? dom.query(element) : element;

    if (!this.$element) {
      throw new Error('Element not found');
    }

    this.init(options);
  }

  init(options) {
    const that = this;

    // IDの設定
    if (this.$element.id) {
      this.id = this.$element.id;
    } else {
      this.id = PLUGIN_NAME + Math.floor(Math.random() * 10000000 + 1);
      this.$element.id = this.id;
    }

    // 初期プロパティの設定
    this.classes = this.$element.className || '';
    this.content = this.$element.innerHTML;
    this.state = STATES.CLOSED;
    this.options = extend(defaults, options || {});
    this.width = 0;
    this.timer = null;
    this.timerTimeout = null;
    this.progressBar = null;
    this.isPaused = false;
    this.isFullscreen = false;
    this.headerHeight = 0;
    this.modalHeight = 0;

    // オーバーレイとナビゲーション要素を作成
    this.$overlay = dom.create(`<div class="${PLUGIN_NAME}-overlay"></div>`);
    dom.css(this.$overlay, { backgroundColor: this.options.overlayColor });

    this.$navigate = dom.create(
      `<div class="${PLUGIN_NAME}-navigate"><div class="${PLUGIN_NAME}-navigate-caption">Use</div><button class="${PLUGIN_NAME}-navigate-prev"></button><button class="${PLUGIN_NAME}-navigate-next"></button></div>`
    );

    // グループ設定
    this.group = {
      name: dom.getAttr(this.$element, `data-${PLUGIN_NAME}-group`),
      index: null,
      ids: [],
    };

    // ARIA属性の設定
    dom.setAttr(this.$element, 'aria-hidden', 'true');
    dom.setAttr(this.$element, 'aria-labelledby', this.id);
    dom.setAttr(this.$element, 'role', 'dialog');

    // iziModalクラスを追加
    if (!dom.hasClass(this.$element, 'iziModal')) {
      dom.addClass(this.$element, 'iziModal');
    }

    // イベントハンドラーの参照を保存
    this._eventsInitialized = false;
    this._closeBtnHandler = null;
    this._fullscreenBtnHandler = null;

    // グループ設定
    if (this.group.name === null && this.options.group !== '') {
      this.group.name = this.options.group;
      dom.setAttr(this.$element, `data-${PLUGIN_NAME}-group`, this.options.group);
    }

    if (this.options.loop === true) {
      dom.setAttr(this.$element, `data-${PLUGIN_NAME}-loop`, 'true');
    }

    // data属性からオプションを読み込み
    Object.keys(this.options).forEach((key) => {
      const attr = dom.getAttr(this.$element, `data-${PLUGIN_NAME}-${key}`);
      if (attr !== null) {
        if (attr === '' || attr === 'true') {
          this.options[key] = true;
        } else if (attr === 'false') {
          this.options[key] = false;
        } else {
          this.options[key] = attr;
        }
      }
    });

    // appendTo設定
    if (this.options.appendTo !== false) {
      dom.appendTo(this.$element, this.options.appendTo);
    }

    // iframe対応
    if (this.options.iframe === true) {
      this.$element.innerHTML = `<div class="${PLUGIN_NAME}-wrap"><div class="${PLUGIN_NAME}-content"><iframe class="${PLUGIN_NAME}-iframe"></iframe>${this.content}</div></div>`;

      if (this.options.iframeHeight !== null) {
        const iframe = dom.query(`.${PLUGIN_NAME}-iframe`, this.$element);
        dom.css(iframe, { height: this.options.iframeHeight + 'px' });
      }
    } else {
      this.$element.innerHTML = `<div class="${PLUGIN_NAME}-wrap"><div class="${PLUGIN_NAME}-content">${this.content}</div></div>`;
    }

    // 背景色設定
    if (this.options.background !== null) {
      dom.css(this.$element, { background: this.options.background });
    }

    this.$wrap = dom.query(`.${PLUGIN_NAME}-wrap`, this.$element);

    // z-index設定
    if (this.options.zindex !== null && !isNaN(parseInt(this.options.zindex))) {
      dom.css(this.$element, { zIndex: this.options.zindex });
      dom.css(this.$navigate, { zIndex: this.options.zindex - 1 });
      dom.css(this.$overlay, { zIndex: this.options.zindex - 2 });
    }

    // border-radius設定
    if (this.options.radius !== '') {
      dom.css(this.$element, { borderRadius: this.options.radius + 'px' });
    }

    // padding設定
    if (this.options.padding !== '') {
      const content = dom.query(`.${PLUGIN_NAME}-content`, this.$element);
      dom.css(content, { padding: this.options.padding + 'px' });
    }

    // テーマ設定
    if (this.options.theme !== '') {
      if (this.options.theme === 'light') {
        dom.addClass(this.$element, `${PLUGIN_NAME}-light`);
      } else {
        dom.addClass(this.$element, this.options.theme);
      }
    }

    // RTL設定
    if (this.options.rtl === true) {
      dom.addClass(this.$element, `${PLUGIN_NAME}-rtl`);
    }

    // フルスクリーン設定
    if (this.options.openFullscreen === true) {
      this.isFullscreen = true;
      dom.addClass(this.$element, 'isFullscreen');
    }

    this.createHeader();
    this.recalcWidth();
    this.recalcVerticalPos();

    // afterRenderコールバック
    if (this.options.afterRender && typeof this.options.afterRender === 'function') {
      this.options.afterRender(this);
    }
  }

  createHeader() {
    this.$header = dom.create(
      `<div class="${PLUGIN_NAME}-header"><h2 class="${PLUGIN_NAME}-header-title"></h2><p class="${PLUGIN_NAME}-header-subtitle"></p><div class="${PLUGIN_NAME}-header-buttons"></div></div>`
    );

    // 閉じるボタン
    if (this.options.closeButton === true) {
      const closeBtn = dom.create(`<a href="javascript:void(0)" class="${PLUGIN_NAME}-button ${PLUGIN_NAME}-button-close" data-${PLUGIN_NAME}-close></a>`);
      dom.append(dom.query(`.${PLUGIN_NAME}-header-buttons`, this.$header), closeBtn);
    }

    // フルスクリーンボタン
    if (this.options.fullscreen === true) {
      const fullscreenBtn = dom.create(`<a href="javascript:void(0)" class="${PLUGIN_NAME}-button ${PLUGIN_NAME}-button-fullscreen" data-${PLUGIN_NAME}-fullscreen></a>`);
      dom.append(dom.query(`.${PLUGIN_NAME}-header-buttons`, this.$header), fullscreenBtn);
    }

    // プログレスバー
    if (this.options.timeoutProgressbar === true) {
      const progressbar = dom.create(`<div class="${PLUGIN_NAME}-progressbar"><div></div></div>`);
      const progressbarInner = dom.query('div', progressbar);
      dom.css(progressbarInner, { backgroundColor: this.options.timeoutProgressbarColor });
      dom.prepend(this.$header, progressbar);
    }

    // サブタイトル
    if (this.options.subtitle === '') {
      dom.addClass(this.$header, `${PLUGIN_NAME}-noSubtitle`);
    } else {
      dom.query(`.${PLUGIN_NAME}-header-subtitle`, this.$header).innerHTML = sanitize(this.options.subtitle);
    }

    // タイトル
    if (this.options.title === '') {
      dom.addClass(this.$header, `${PLUGIN_NAME}-noTitle`);
    } else {
      dom.query(`.${PLUGIN_NAME}-header-title`, this.$header).innerHTML = sanitize(this.options.title);
    }

    // ヘッダーカラーとアイコン（タイトルまたはサブタイトルがある場合に適用）
    if (this.options.title !== '' || this.options.subtitle !== '') {
      if (this.options.headerColor !== null) {
        if (this.options.borderBottom === true) {
          dom.css(this.$element, { borderBottom: `3px solid ${this.options.headerColor}` });
        }
        dom.css(this.$header, { background: this.options.headerColor });
      }

      // アイコン
      if (this.options.icon !== null || this.options.iconText !== null) {
        const icon = dom.create(`<i class="${PLUGIN_NAME}-header-icon"></i>`);

        if (this.options.icon !== null) {
          dom.addClass(icon, this.options.icon);
          dom.css(icon, { color: this.options.iconColor });
        }

        if (this.options.iconText !== null) {
          icon.innerHTML = sanitize(this.options.iconText);
        }

        dom.prepend(this.$header, icon);
      }
    }

    // ヘッダーが必要かどうかを判断
    // タイトル、サブタイトル、ボタン類のいずれかが有効な場合にヘッダーを表示
    const shouldShowHeader =
      this.options.title !== '' || this.options.subtitle !== '' || this.options.closeButton === true || this.options.fullscreen === true || this.options.timeoutProgressbar === true;

    if (shouldShowHeader) {
      dom.css(this.$element, { overflow: 'hidden' });
      dom.prepend(this.$element, this.$header);
    }
  }

  toggle() {
    if (this.state === STATES.OPENED) {
      this.close();
    } else if (this.state === STATES.CLOSED) {
      this.open();
    }
  }

  open(param) {
    const that = this;
    console.log('=== open() called ===', {
      id: this.id,
      state: this.state,
      group: this.group,
    });

    // 他のモーダルを閉じる
    if (param && param.preventClose === false) {
      const modals = dom.queryAll(`.${PLUGIN_NAME}`);
      modals.forEach((modal) => {
        const instance = getInstance(modal);
        if (instance) {
          const state = instance.getState();
          if (state === 'opened' || state === 'opening') {
            instance.close();
          }
        }
      });
    }

    // URL履歴管理
    if (this.options.history) {
      const oldTitle = document.title;
      document.title = oldTitle + ' - ' + this.options.title;
      changeHashWithoutScrolling('#' + this.id);
      document.title = oldTitle;
      window.$iziModal.history = true;
    } else {
      window.$iziModal.history = false;
    }

    function opened() {
      that.state = STATES.OPENED;
      events.trigger(that.$element, STATES.OPENED);

      if (that.options.onOpened && typeof that.options.onOpened === 'function') {
        that.options.onOpened(that);
      }
    }

    function bindEvents() {
      // 既にイベントが初期化されている場合はスキップ
      if (that._eventsInitialized) {
        // ナビゲーションボタンのみ再バインド（これらは毎回削除/再作成されるため）
        bindNavigationEvents();
        return;
      }

      // 閉じるボタン
      const closeBtn = dom.query(`[data-${PLUGIN_NAME}-close]`, that.$element);
      if (closeBtn) {
        that._closeBtnHandler = (e) => {
          e.preventDefault();
          const transition = dom.getAttr(e.currentTarget, `data-${PLUGIN_NAME}-transitionOut`);
          that.close(transition ? { transition } : undefined);
        };
        events.on(closeBtn, 'click', that._closeBtnHandler);
      }

      // フルスクリーンボタン
      const fullscreenBtn = dom.query(`[data-${PLUGIN_NAME}-fullscreen]`, that.$element);
      if (fullscreenBtn) {
        that._fullscreenBtnHandler = (e) => {
          e.preventDefault();
          if (that.isFullscreen === true) {
            that.isFullscreen = false;
            dom.removeClass(that.$element, 'isFullscreen');
          } else {
            that.isFullscreen = true;
            dom.addClass(that.$element, 'isFullscreen');
          }

          if (that.options.onFullscreen && typeof that.options.onFullscreen === 'function') {
            that.options.onFullscreen(that);
          }
          events.trigger(that.$element, 'fullscreen', that);
        };
        events.on(fullscreenBtn, 'click', that._fullscreenBtnHandler);
      }

      that._eventsInitialized = true;

      // ナビゲーションイベントをバインド
      bindNavigationEvents();
    }

    function bindNavigationEvents() {
      // ナビゲーション（次へ・前へ）
      const nextBtn = dom.query(`.${PLUGIN_NAME}-navigate-next`, that.$navigate);
      if (nextBtn) {
        events.on(nextBtn, 'click', (e) => that.next(e));
      }

      const prevBtn = dom.query(`.${PLUGIN_NAME}-navigate-prev`, that.$navigate);
      if (prevBtn) {
        events.on(prevBtn, 'click', (e) => that.prev(e));
      }
    }

    if (this.state === STATES.CLOSED) {
      console.log('Modal state is CLOSED, initializing...');
      bindEvents();

      this.setGroup();
      console.log('Group set after open:', this.group);
      this.state = STATES.OPENING;
      events.trigger(this.$element, STATES.OPENING);
      dom.setAttr(this.$element, 'aria-hidden', 'false');

      // プログレスバーをリセット
      if (this.options.timeoutProgressbar === true) {
        const progressbar = dom.query(`.${PLUGIN_NAME}-progressbar > div`, this.$element);
        if (progressbar) {
          dom.css(progressbar, { width: '100%' });
        }
      }

      // iframe URL設定
      if (this.options.iframe === true) {
        const content = dom.query(`.${PLUGIN_NAME}-content`, this.$element);
        dom.addClass(content, `${PLUGIN_NAME}-content-loader`);

        const iframe = dom.query(`.${PLUGIN_NAME}-iframe`, this.$element);
        events.on(iframe, 'load', function () {
          dom.removeClass(content, `${PLUGIN_NAME}-content-loader`);
        });

        let href = null;
        if (param && param.currentTarget) {
          href = dom.getAttr(param.currentTarget, 'href');
        }

        if (!href && this.options.iframeURL) {
          href = this.options.iframeURL;
        }

        if (!href) {
          const triggerInfo =
            param && param.currentTarget
              ? `Trigger: ${param.currentTarget.tagName}${param.currentTarget.id ? '#' + param.currentTarget.id : ''}${
                  param.currentTarget.className ? '.' + param.currentTarget.className.split(' ').join('.') : ''
                }`
              : 'No trigger element';
          throw new Error(`Failed to find iframe URL for modal #${this.$element.id}. ${triggerInfo}. Please set iframeURL option or use <a> tag with href attribute.`);
        }

        dom.setAttr(iframe, 'src', href);
      }

      // body overflow設定
      if (this.options.bodyOverflow || isMobileDevice) {
        dom.addClass(document.documentElement, `${PLUGIN_NAME}-isOverflow`);
        if (isMobileDevice) {
          dom.css(document.body, { overflow: 'hidden' });
        }
      }

      // onOpeningコールバック
      if (this.options.onOpening && typeof this.options.onOpening === 'function') {
        this.options.onOpening(this);
      }

      // オーバーレイとナビゲーションを表示
      if (this.options.overlay === true) {
        if (this.options.appendToOverlay === false) {
          dom.appendTo(this.$overlay, 'body');
        } else {
          dom.appendTo(this.$overlay, this.options.appendToOverlay);
        }
      }

      if (this.options.transitionInOverlay) {
        dom.addClass(this.$overlay, this.options.transitionInOverlay);
      }

      // ナビゲーション矢印を表示
      console.log('Navigation check:', {
        groupName: this.group.name,
        groupIdsLength: this.group.ids.length,
        groupIds: this.group.ids,
        navigateArrows: this.options.navigateArrows,
        shouldShow: !!(
          this.group.name &&
          this.group.ids.length > 1 &&
          (this.options.navigateArrows === true || this.options.navigateArrows === 'closeToModal' || this.options.navigateArrows === 'closeScreenEdge')
        ),
      });

      if (
        this.group.name &&
        this.group.ids.length > 1 &&
        (this.options.navigateArrows === true || this.options.navigateArrows === 'closeToModal' || this.options.navigateArrows === 'closeScreenEdge')
      ) {
        console.log('Appending navigation arrows to body');
        dom.appendTo(this.$navigate, 'body');

        // ナビゲーション矢印の位置を設定
        const prevBtn = dom.query(`.${PLUGIN_NAME}-navigate-prev`, this.$navigate);
        const nextBtn = dom.query(`.${PLUGIN_NAME}-navigate-next`, this.$navigate);

        if (this.options.navigateArrows === 'closeToModal') {
          // モーダルの近くに配置
          // offsetWidthは0になることがあるので、options.widthを使用
          const modalWidth = this.options.width || this.$element.offsetWidth || 600;
          const screenWidth = window.innerWidth;
          const modalLeft = (screenWidth - modalWidth) / 2;

          console.log('Navigation position calculation:', {
            screenWidth,
            modalWidth,
            'options.width': this.options.width,
            offsetWidth: this.$element.offsetWidth,
            modalLeft,
            prevLeft: modalLeft - 84,
            nextRight: modalLeft - 84,
          });

          if (prevBtn) {
            // モーダルの左端から84px左に配置
            const leftPos = Math.max(10, modalLeft - 84); // 最小10px
            dom.css(prevBtn, {
              left: leftPos + 'px',
              right: 'auto',
            });
            console.log('prevBtn left set to:', leftPos);
          }
          if (nextBtn) {
            // モーダルの右端から84px右に配置
            const rightPos = Math.max(10, modalLeft - 84); // 最小10px
            dom.css(nextBtn, {
              right: rightPos + 'px',
              left: 'auto',
            });
            console.log('nextBtn right set to:', rightPos);
          }
        } else if (this.options.navigateArrows === 'closeScreenEdge') {
          // 画面端に配置
          if (prevBtn) {
            dom.css(prevBtn, {
              left: '10px',
              right: 'auto',
            });
          }
          if (nextBtn) {
            dom.css(nextBtn, {
              right: '10px',
              left: 'auto',
            });
          }
        }
        // navigateArrows === true の場合は、CSSのデフォルト値（left: 50%, right: 50%）を使用

        dom.addClass(this.$navigate, 'fadeIn');

        // ナビゲーションキャプションを更新
        if (this.options.navigateCaption === true) {
          const caption = dom.query(`.${PLUGIN_NAME}-navigate-caption`, this.$navigate);
          if (caption) {
            caption.innerHTML = `${this.group.index + 1} / ${this.group.ids.length}`;
          }
        } else {
          const caption = dom.query(`.${PLUGIN_NAME}-navigate-caption`, this.$navigate);
          if (caption) {
            dom.hide(caption);
          }
        }
      }

      // トランジション設定
      let transitionIn = this.options.transitionIn;
      if (param && typeof param === 'object') {
        if (param.transition || param.transitionIn) {
          transitionIn = param.transition || param.transitionIn;
        }
        if (param.zindex) {
          this.setZindex(param.zindex);
        }
      }

      // アニメーション実行
      if (transitionIn !== '' && animationEvent) {
        dom.addClass(this.$element, 'transitionIn', transitionIn);
        dom.show(this.$element);

        events.one(this.$wrap, animationEvent, () => {
          dom.removeClass(this.$element, transitionIn, 'transitionIn');
          dom.removeClass(this.$overlay, this.options.transitionInOverlay);
          dom.removeClass(this.$navigate, 'fadeIn');
          opened();
        });
      } else {
        dom.show(this.$element);
        opened();
      }

      // pauseOnHover設定
      if (this.options.pauseOnHover === true && this.options.timeout !== false && !isNaN(parseInt(this.options.timeout)) && this.options.timeout !== 0) {
        events.on(this.$element, 'mouseenter', (e) => {
          e.preventDefault();
          this.isPaused = true;
        });

        events.on(this.$element, 'mouseleave', (e) => {
          e.preventDefault();
          this.isPaused = false;
        });
      }

      // タイムアウト設定
      if (this.options.timeout !== false && !isNaN(parseInt(this.options.timeout)) && this.options.timeout !== 0) {
        this.startProgress(this.options.timeout);
      }

      // オーバーレイクリックで閉じる
      if (this.options.overlayClose && !dom.hasClass(this.$element, this.options.transitionOut)) {
        events.on(this.$overlay, 'click', () => {
          this.close();
        });
      }

      // フォーカス設定
      if (this.options.focusInput) {
        // :inputはjQuery独自セレクターなので、ネイティブセレクターに変換
        const firstInput = dom.query('input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([disabled]), textarea:not([disabled]), select:not([disabled])', this.$element);
        if (firstInput) {
          firstInput.focus();
        }
      }

      // レイアウト更新タイマー
      const updateTimer = () => {
        this.recalcLayout();
        this.timer = setTimeout(updateTimer, 300);
      };
      updateTimer();

      // Escキーで閉じる
      const escHandler = (e) => {
        if (this.options.closeOnEscape && e.keyCode === 27) {
          this.close();
        }
      };
      events.on($document, 'keydown', escHandler);
      this._escHandler = escHandler;
    }
  }

  close(param) {
    const that = this;

    if (this.options.history) {
      window.location.hash = '';
    }

    function closed() {
      that.state = STATES.CLOSED;
      events.trigger(that.$element, STATES.CLOSED);

      if (that.options.iframe === true) {
        const iframe = dom.query(`.${PLUGIN_NAME}-iframe`, that.$element);
        dom.setAttr(iframe, 'src', '');
      }

      if (that.options.bodyOverflow || isMobileDevice) {
        dom.removeClass(document.documentElement, `${PLUGIN_NAME}-isOverflow`);
        if (isMobileDevice) {
          dom.css(document.body, { overflow: 'auto' });
        }
      }

      if (that.options.onClosed && typeof that.options.onClosed === 'function') {
        that.options.onClosed(that);
      }

      if (that.options.restoreDefaultContent === true) {
        const content = dom.query(`.${PLUGIN_NAME}-content`, that.$element);
        content.innerHTML = that.content;
      }

      if (dom.queryAllVisible(`.${PLUGIN_NAME}`).length === 0) {
        dom.removeClass(document.documentElement, `${PLUGIN_NAME}-isAttached`);
      }
    }

    if (this.state === STATES.OPENED || this.state === STATES.OPENING) {
      // Escキーハンドラーを削除
      if (this._escHandler) {
        events.off($document, 'keydown', this._escHandler);
      }

      this.state = STATES.CLOSING;
      events.trigger(this.$element, STATES.CLOSING);
      dom.setAttr(this.$element, 'aria-hidden', 'true');

      clearTimeout(this.timer);
      clearTimeout(this.timerTimeout);

      if (this.options.onClosing && typeof this.options.onClosing === 'function') {
        this.options.onClosing(this);
      }

      let transitionOut = this.options.transitionOut;
      if (param && typeof param === 'object') {
        if (param.transition || param.transitionOut) {
          transitionOut = param.transition || param.transitionOut;
        }
      }

      if (!transitionOut || transitionOut === '' || !animationEvent) {
        dom.hide(this.$element);
        dom.remove(this.$overlay);
        dom.remove(this.$navigate);
        closed();
      } else {
        this.$element.className = [
          this.classes,
          PLUGIN_NAME,
          transitionOut,
          this.options.theme === 'light' ? `${PLUGIN_NAME}-light` : this.options.theme,
          this.isFullscreen ? 'isFullscreen' : '',
          this.options.rtl ? `${PLUGIN_NAME}-rtl` : '',
        ]
          .filter((c) => c)
          .join(' ');

        dom.addClass(this.$overlay, this.options.transitionOutOverlay);

        events.one(this.$element, animationEvent, () => {
          if (dom.hasClass(this.$element, transitionOut)) {
            dom.removeClass(this.$element, transitionOut, 'transitionOut');
            dom.hide(this.$element);
          }
          dom.removeClass(this.$overlay, this.options.transitionOutOverlay);
          dom.remove(this.$overlay);
          dom.remove(this.$navigate);
          closed();
        });
      }
    }
  }

  /**
   * イベントリスナーを削除
   */
  unbindEvents() {
    // 閉じるボタンのイベントリスナーを削除
    if (this._closeBtnHandler) {
      const closeBtn = dom.query(`[data-${PLUGIN_NAME}-close]`, this.$element);
      if (closeBtn) {
        events.off(closeBtn, 'click', this._closeBtnHandler);
      }
      this._closeBtnHandler = null;
    }

    // フルスクリーンボタンのイベントリスナーを削除
    if (this._fullscreenBtnHandler) {
      const fullscreenBtn = dom.query(`[data-${PLUGIN_NAME}-fullscreen]`, this.$element);
      if (fullscreenBtn) {
        events.off(fullscreenBtn, 'click', this._fullscreenBtnHandler);
      }
      this._fullscreenBtnHandler = null;
    }

    // Escキーハンドラーを削除
    if (this._escHandler) {
      events.off($document, 'keydown', this._escHandler);
      this._escHandler = null;
    }

    this._eventsInitialized = false;
  }

  destroy() {
    events.trigger(this.$element, 'destroy');

    // イベントリスナーをクリーンアップ
    this.unbindEvents();

    clearTimeout(this.timer);
    clearTimeout(this.timerTimeout);

    if (this.options.iframe === true) {
      const iframe = dom.query(`.${PLUGIN_NAME}-iframe`, this.$element);
      dom.remove(iframe);
    }

    const content = dom.query(`.${PLUGIN_NAME}-content`, this.$element);
    this.$element.innerHTML = content.innerHTML;

    this.$element.removeAttribute('style');

    dom.remove(this.$overlay);
    dom.remove(this.$navigate);

    events.trigger(this.$element, STATES.DESTROYED);

    // インスタンスを削除
    modalInstances.delete(this.$element);
    this.$element = null;
  }

  getState() {
    return this.state;
  }

  getGroup() {
    return this.group;
  }

  setGroup(groupName) {
    const that = this;
    const group = groupName || this.group.name;
    this.group.ids = [];

    if (groupName && groupName !== this.group.name) {
      this.group.name = groupName;
      dom.setAttr(this.$element, `data-${PLUGIN_NAME}-group`, groupName);
    }

    if (group) {
      const modals = dom.queryAll(`.${PLUGIN_NAME}[data-${PLUGIN_NAME}-group="${group}"]`);
      let count = 0;

      modals.forEach((modal) => {
        that.group.ids.push(modal.id);
        if (that.id === modal.id) {
          that.group.index = count;
        }
        count++;
      });
    }
  }

  // 次のモーダルへ
  next(e) {
    return navigationNext(this, e);
  }

  // 前のモーダルへ
  prev(e) {
    return navigationPrev(this, e);
  }

  // プログレスバー開始
  startProgress(timeout) {
    const that = this;
    this.isPaused = false;
    clearTimeout(this.timerTimeout);

    if (this.options.timeoutProgressbar === true) {
      this.progressBar = {
        hideEta: null,
        maxHideTime: null,
        currentTime: new Date().getTime(),
        el: dom.query(`.${PLUGIN_NAME}-progressbar > div`, this.$element),
        updateProgress: function () {
          if (!that.isPaused) {
            that.progressBar.currentTime = that.progressBar.currentTime + 10;
            const percentage = ((that.progressBar.hideEta - that.progressBar.currentTime) / that.progressBar.maxHideTime) * 100;
            dom.css(that.progressBar.el, { width: percentage + '%' });

            if (percentage < 0) {
              that.close();
            }
          }
        },
      };

      if (timeout > 0) {
        this.progressBar.maxHideTime = parseFloat(timeout);
        this.progressBar.hideEta = new Date().getTime() + this.progressBar.maxHideTime;
        this.timerTimeout = setInterval(this.progressBar.updateProgress, 10);
      }
    } else {
      this.timerTimeout = setTimeout(() => {
        that.close();
      }, timeout);
    }
  }

  pauseProgress() {
    this.isPaused = true;
  }

  resumeProgress() {
    this.isPaused = false;
  }

  resetProgress() {
    clearTimeout(this.timerTimeout);
    this.progressBar = {};
    const progressbar = dom.query(`.${PLUGIN_NAME}-progressbar > div`, this.$element);
    if (progressbar) {
      dom.css(progressbar, { width: '100%' });
    }
  }

  // レイアウト再計算
  recalcWidth() {
    return layoutRecalcWidth(this);
  }

  recalcVerticalPos(first) {
    return layoutRecalcVerticalPos(this, first);
  }

  recalcLayout() {
    return layoutRecalcLayout(this);
  }

  setWidth(width) {
    this.options.width = width;
    this.recalcWidth();
  }

  setTop(top) {
    this.options.top = top;
    this.recalcVerticalPos();
  }

  setBottom(bottom) {
    this.options.bottom = bottom;
    this.recalcVerticalPos();
  }

  setZindex(zindex) {
    if (!isNaN(parseInt(zindex))) {
      this.options.zindex = zindex;
      dom.css(this.$element, { zIndex: zindex });
      dom.css(this.$navigate, { zIndex: zindex - 1 });
      dom.css(this.$overlay, { zIndex: zindex - 2 });
    }
  }

  setTitle(title) {
    this.options.title = title;
    const titleEl = dom.query(`.${PLUGIN_NAME}-header-title`, this.$header);
    if (titleEl) {
      titleEl.innerHTML = sanitize(title);
    }
  }

  setSubtitle(subtitle) {
    this.options.subtitle = subtitle;
    const subtitleEl = dom.query(`.${PLUGIN_NAME}-header-subtitle`, this.$header);
    if (subtitleEl) {
      subtitleEl.innerHTML = sanitize(subtitle);
    }
  }

  setContent(content) {
    if (typeof content === 'object' && content.content) {
      if (content.default === true) {
        this.content = content.content;
      }
      content = content.content;
    }

    if (this.options.iframe === false) {
      const contentEl = dom.query(`.${PLUGIN_NAME}-content`, this.$element);
      if (contentEl) {
        contentEl.innerHTML = sanitize(content);
      }
    }
  }
}

// WeakMapでインスタンスを管理
const modalInstances = new WeakMap();

export function getInstance(element) {
  return modalInstances.get(element);
}

export function setInstance(element, instance) {
  modalInstances.set(element, instance);
}

// グローバル変数の初期化
if (!window.$iziModal) {
  window.$iziModal = {};
  window.$iziModal.autoOpen = 0;
  window.$iziModal.history = false;
}

export default IziModal;
