/**
 * レイアウト計算機能
 */
import { PLUGIN_NAME, STATES } from '../core/constants.js';
import * as dom from '../utils/dom.js';
import { clearValue, isMobile } from '../utils/helpers.js';

const isMobileDevice = isMobile();

/**
 * モーダルの幅を再計算
 */
export function recalcWidth(modal) {
  dom.css(modal.$element, { maxWidth: modal.options.width + 'px' });
}

/**
 * モーダルの縦位置を再計算
 */
export function recalcVerticalPos(modal, first = true) {
  if (modal.options.top !== null && modal.options.top !== false) {
    dom.css(modal.$element, { marginTop: modal.options.top + 'px' });
    if (modal.options.top === 0) {
      dom.css(modal.$element, {
        borderTopRightRadius: '0',
        borderTopLeftRadius: '0'
      });
    }
  } else {
    if (first === false) {
      dom.css(modal.$element, {
        marginTop: '',
        borderRadius: modal.options.radius + 'px'
      });
    }
  }

  if (modal.options.bottom !== null && modal.options.bottom !== false) {
    dom.css(modal.$element, { marginBottom: modal.options.bottom + 'px' });
    if (modal.options.bottom === 0) {
      dom.css(modal.$element, {
        borderBottomRightRadius: '0',
        borderBottomLeftRadius: '0'
      });
    }
  } else {
    if (first === false) {
      dom.css(modal.$element, {
        marginBottom: '',
        borderRadius: modal.options.radius + 'px'
      });
    }
  }
}

/**
 * モーダルのレイアウトを再計算
 */
export function recalcLayout(modal) {
  const windowHeight = window.innerHeight;
  const modalHeight = dom.outerHeight(modal.$element);
  const modalWidth = dom.outerWidth(modal.$element);
  const content = dom.query(`.${PLUGIN_NAME}-content`, modal.$element);
  const contentHeight = content ? content.scrollHeight : 0;
  const outerHeight = contentHeight + modal.headerHeight;
  const wrapperHeight = dom.innerHeight(modal.$element) - modal.headerHeight;
  const scrollTop = modal.$wrap ? modal.$wrap.scrollTop : 0;
  let borderSize = 0;

  if (modal.options.borderBottom === true && modal.options.title !== '') {
    borderSize = 3;
  }

  // ヘッダーの高さを更新
  const header = dom.query(`.${PLUGIN_NAME}-header`, modal.$element);
  if (header && dom.css(header, 'display') !== 'none') {
    modal.headerHeight = dom.innerHeight(header);
    dom.css(modal.$element, { overflow: 'hidden' });
  } else {
    modal.headerHeight = 0;
    dom.css(modal.$element, { overflow: '' });
  }

  // ローダーの位置を更新
  const loader = dom.query(`.${PLUGIN_NAME}-loader`, modal.$element);
  if (loader) {
    dom.css(loader, { top: modal.headerHeight + 'px' });
  }

  // モーダルの高さが変更された場合
  if (modalHeight !== modal.modalHeight) {
    modal.modalHeight = modalHeight;

    if (modal.options.onResize && typeof modal.options.onResize === 'function') {
      modal.options.onResize(modal);
    }
  }

  if (modal.state === STATES.OPENED || modal.state === STATES.OPENING) {
    // iframe対応
    if (modal.options.iframe === true) {
      const iframe = dom.query(`.${PLUGIN_NAME}-iframe`, modal.$element);
      if (windowHeight < (modal.options.iframeHeight + modal.headerHeight + borderSize) || modal.isFullscreen === true) {
        dom.css(iframe, { height: (windowHeight - (modal.headerHeight + borderSize)) + 'px' });
      } else {
        dom.css(iframe, { height: modal.options.iframeHeight + 'px' });
      }
    }

    // モーダルがウィンドウと同じ高さの場合
    if (modalHeight === windowHeight) {
      dom.addClass(modal.$element, 'isAttached');
    } else {
      dom.removeClass(modal.$element, 'isAttached');
    }

    // フルスクリーンボタンの表示/非表示
    const fullscreenBtn = dom.query(`.${PLUGIN_NAME}-button-fullscreen`, modal.$element);
    if (fullscreenBtn) {
      if (modal.isFullscreen === false && modalWidth >= window.innerWidth) {
        dom.hide(fullscreenBtn);
      } else {
        dom.show(fullscreenBtn);
      }
    }

    recalcButtons(modal);

    let adjustedWindowHeight = windowHeight;
    if (modal.isFullscreen === false) {
      adjustedWindowHeight = windowHeight - (clearValue(modal.options.top) || 0) - (clearValue(modal.options.bottom) || 0);
    }

    // モーダルがウィンドウの高さより大きい場合
    if (outerHeight > adjustedWindowHeight) {
      if (modal.options.top > 0 && modal.options.bottom === null && contentHeight < window.innerHeight) {
        dom.addClass(modal.$element, 'isAttachedBottom');
      }
      if (modal.options.bottom > 0 && modal.options.top === null && contentHeight < window.innerHeight) {
        dom.addClass(modal.$element, 'isAttachedTop');
      }
      if (dom.queryAll(`.${PLUGIN_NAME}:visible`).length === 1) {
        dom.addClass(document.documentElement, `${PLUGIN_NAME}-isAttached`);
      }
      dom.css(modal.$element, { height: adjustedWindowHeight + 'px' });
    } else {
      dom.css(modal.$element, { height: (contentHeight + modal.headerHeight + borderSize) + 'px' });
      dom.removeClass(modal.$element, 'isAttachedTop', 'isAttachedBottom');
      if (dom.queryAll(`.${PLUGIN_NAME}:visible`).length === 1) {
        dom.removeClass(document.documentElement, `${PLUGIN_NAME}-isAttached`);
      }
    }

    // スクロール処理
    if (contentHeight > wrapperHeight && outerHeight > adjustedWindowHeight) {
      dom.addClass(modal.$element, 'hasScroll');
      dom.css(modal.$wrap, { height: (modalHeight - (modal.headerHeight + borderSize)) + 'px' });
    } else {
      dom.removeClass(modal.$element, 'hasScroll');
      dom.css(modal.$wrap, { height: 'auto' });
    }

    // シャドウ処理
    if (wrapperHeight + scrollTop < (contentHeight - 30)) {
      dom.addClass(modal.$element, 'hasShadow');
    } else {
      dom.removeClass(modal.$element, 'hasShadow');
    }
  }
}

/**
 * ヘッダーボタンの位置を再計算
 */
export function recalcButtons(modal) {
  const buttons = dom.query(`.${PLUGIN_NAME}-header-buttons`, modal.$header);
  if (buttons) {
    const widthButtons = dom.innerWidth(buttons) + 10;
    if (modal.options.rtl === true) {
      dom.css(modal.$header, { paddingLeft: widthButtons + 'px' });
    } else {
      dom.css(modal.$header, { paddingRight: widthButtons + 'px' });
    }
  }
}
