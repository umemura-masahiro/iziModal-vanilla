/**
 * iziModal - Vanilla JavaScript版
 * エントリーポイント
 */
import IziModal, { getInstance, setInstance } from './core/IziModal.js';
import { defaults } from './core/defaults.js';
import { PLUGIN_NAME } from './core/constants.js';
import * as dom from './utils/dom.js';
import * as events from './utils/events.js';
import { extend } from './utils/helpers.js';

/**
 * ファクトリー関数
 * 使用例:
 *   const modal = iziModal('#myModal', options);
 *   modal.open();
 *
 * または互換性のために:
 *   iziModal('#myModal', 'open');
 *   iziModal('#myModal', 'setTitle', '新しいタイトル');
 */
function iziModal(selector, optionOrMethod, ...args) {
  // セレクターから要素を取得
  let elements;
  if (typeof selector === 'string') {
    elements = dom.queryAll(selector);

    // 要素が見つからない場合、新しく作成
    if (elements.length === 0) {
      const newEl = createElementFromSelector(selector);
      if (newEl) {
        document.body.appendChild(newEl);
        elements = [newEl];
      }
    }
  } else if (selector instanceof HTMLElement) {
    elements = [selector];
  } else if (selector instanceof NodeList || Array.isArray(selector)) {
    elements = Array.from(selector);
  } else {
    throw new Error('Invalid selector');
  }

  // 各要素に対して処理
  const instances = elements.map(element => {
    let instance = getInstance(element);

    // メソッド呼び出し（文字列が渡された場合）
    if (typeof optionOrMethod === 'string') {
      if (!instance) {
        // インスタンスがまだない場合は作成
        instance = new IziModal(element, {});
        setInstance(element, instance);
      }

      // メソッドを実行
      if (typeof instance[optionOrMethod] === 'function') {
        return instance[optionOrMethod](...args);
      } else {
        console.warn(`Method "${optionOrMethod}" does not exist on IziModal`);
        return instance;
      }
    }

    // 新しいインスタンスを作成（オプションが渡された場合）
    if (!instance || optionOrMethod) {
      const options = extend(defaults, optionOrMethod || {});
      instance = new IziModal(element, options);
      setInstance(element, instance);

      // autoOpen処理
      if (options.autoOpen) {
        if (!isNaN(parseInt(options.autoOpen))) {
          setTimeout(() => instance.open(), options.autoOpen);
        } else if (options.autoOpen === true) {
          instance.open();
        }
        window.$iziModal.autoOpen++;
      }
    }

    return instance;
  });

  // 単一要素の場合は1つのインスタンスを返す、複数の場合は配列を返す
  return instances.length === 1 ? instances[0] : instances;
}

/**
 * セレクターから要素を作成
 */
function createElementFromSelector(selector) {
  const parts = {
    tag: 'div',
    id: null,
    classes: []
  };

  // IDを抽出
  const idMatch = selector.match(/#([^.]+)/);
  if (idMatch) {
    parts.id = idMatch[1];
  }

  // クラスを抽出
  const classMatches = selector.match(/\.([^.#]+)/g);
  if (classMatches) {
    parts.classes = classMatches.map(c => c.substring(1));
  }

  // タグを抽出
  const tagMatch = selector.match(/^([^#.]+)/);
  if (tagMatch) {
    parts.tag = tagMatch[1];
  }

  try {
    const element = document.createElement(parts.tag);
    if (parts.id) element.id = parts.id;
    if (parts.classes.length > 0) {
      parts.classes.forEach(className => element.classList.add(className));
    }
    return element;
  } catch (err) {
    return null;
  }
}

/**
 * デフォルトオプションを設定
 */
iziModal.setDefaults = function(options) {
  Object.assign(defaults, options);
};

/**
 * グローバルイベントの初期化
 */
function initGlobalEvents() {
  // data-iziModal-open属性を持つ要素のクリックイベント
  events.delegate(document, 'click', `[data-${PLUGIN_NAME}-open]`, function(e) {
    e.preventDefault();

    const openModal = dom.getAttr(this, `data-${PLUGIN_NAME}-open`);
    const preventClose = dom.getAttr(this, `data-${PLUGIN_NAME}-preventClose`);
    const transitionIn = dom.getAttr(this, `data-${PLUGIN_NAME}-transitionIn`);
    const transitionOut = dom.getAttr(this, `data-${PLUGIN_NAME}-transitionOut`);
    const zindex = dom.getAttr(this, `data-${PLUGIN_NAME}-zindex`);

    if (zindex) {
      iziModal(openModal, 'setZindex', zindex);
    }

    // 既存のモーダルを閉じる
    if (!preventClose) {
      const visibleModals = dom.queryAll(`.${PLUGIN_NAME}:visible`);
      visibleModals.forEach(modal => {
        const instance = getInstance(modal);
        if (instance) {
          if (transitionOut) {
            instance.close({ transition: transitionOut });
          } else {
            instance.close();
          }
        }
      });
    }

    // 新しいモーダルを開く
    setTimeout(() => {
      if (transitionIn) {
        iziModal(openModal, 'open', { transition: transitionIn });
      } else {
        iziModal(openModal, 'open');
      }
    }, 200);
  });

  // キーボード操作（矢印キー）
  events.on(document, 'keyup', (event) => {
    const visibleModals = dom.queryAll(`.${PLUGIN_NAME}:visible`);

    if (visibleModals.length > 0) {
      const modal = visibleModals[0];
      const instance = getInstance(modal);

      if (instance && instance.options.arrowKeys && instance.group.name) {
        const target = event.target;

        // input/textareaにフォーカスがある場合は無効
        if (target.tagName.toUpperCase() !== 'INPUT' && target.tagName.toUpperCase() !== 'TEXTAREA') {
          if (event.keyCode === 37) { // 左矢印
            instance.prev(event);
          } else if (event.keyCode === 39) { // 右矢印
            instance.next(event);
          }
        }
      }
    }
  });
}

// DOM読み込み後にグローバルイベントを初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobalEvents);
} else {
  initGlobalEvents();
}

// 履歴管理の初期化
import { initHashAutoOpen, initHashChange } from './modules/history.js';
initHashAutoOpen();
initHashChange();

// エクスポート
export default iziModal;
export { IziModal };
