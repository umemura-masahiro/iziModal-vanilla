/**
 * DOM操作ヘルパー関数
 */

/**
 * セレクターで要素を検索
 */
export function query(selector, context = document) {
  if (typeof selector === 'string') {
    return context.querySelector(selector);
  }
  return selector;
}

/**
 * セレクターで複数の要素を検索
 */
export function queryAll(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

/**
 * クラスを追加
 */
export function addClass(element, ...classes) {
  if (element) {
    element.classList.add(...classes);
  }
}

/**
 * クラスを削除
 */
export function removeClass(element, ...classes) {
  if (element) {
    element.classList.remove(...classes);
  }
}

/**
 * クラスの有無を確認
 */
export function hasClass(element, className) {
  return element ? element.classList.contains(className) : false;
}

/**
 * HTML文字列から要素を作成
 */
export function create(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

/**
 * 要素の属性を取得
 */
export function getAttr(element, attr) {
  return element ? element.getAttribute(attr) : null;
}

/**
 * 要素の属性を設定
 */
export function setAttr(element, attr, value) {
  if (element) {
    element.setAttribute(attr, value);
  }
}

/**
 * 要素の属性を削除
 */
export function removeAttr(element, attr) {
  if (element) {
    element.removeAttribute(attr);
  }
}

/**
 * CSSスタイルを設定または取得
 */
export function css(element, styles) {
  if (!element) return null;

  // 文字列の場合は取得
  if (typeof styles === 'string') {
    return window.getComputedStyle(element)[styles];
  }

  // オブジェクトの場合は設定
  if (styles && typeof styles === 'object') {
    Object.keys(styles).forEach(property => {
      element.style[property] = styles[property];
    });
  }

  return element;
}

/**
 * 要素の表示・非表示
 */
export function show(element) {
  if (element) {
    element.style.display = 'block';
  }
}

export function hide(element) {
  if (element) {
    element.style.display = 'none';
  }
}

/**
 * 要素を削除
 */
export function remove(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

/**
 * 要素の寸法を取得
 */
export function outerWidth(element, includeMargin = false) {
  if (!element) return 0;
  let width = element.offsetWidth;
  if (includeMargin) {
    const style = getComputedStyle(element);
    width += parseInt(style.marginLeft) + parseInt(style.marginRight);
  }
  return width;
}

export function outerHeight(element, includeMargin = false) {
  if (!element) return 0;
  let height = element.offsetHeight;
  if (includeMargin) {
    const style = getComputedStyle(element);
    height += parseInt(style.marginTop) + parseInt(style.marginBottom);
  }
  return height;
}

export function innerWidth(element) {
  if (!element) return 0;
  return element.clientWidth;
}

export function innerHeight(element) {
  if (!element) return 0;
  return element.clientHeight;
}

/**
 * 要素が可視かどうかをチェック（jQuery :visible の代替）
 */
export function isVisible(element) {
  if (!element) return false;

  // display: none でないか、offsetParent が存在するかをチェック
  if (element.offsetParent === null) {
    return false;
  }

  // 計算されたスタイルをチェック
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }

  return true;
}

/**
 * 可視な要素のみを取得
 */
export function queryAllVisible(selector, context = document) {
  const elements = queryAll(selector, context);
  return elements.filter(el => isVisible(el));
}

/**
 * 要素を追加
 */
export function append(parent, child) {
  if (parent && child) {
    parent.appendChild(child);
  }
}

export function prepend(parent, child) {
  if (parent && child) {
    parent.insertBefore(child, parent.firstChild);
  }
}

export function appendTo(child, parent) {
  if (typeof parent === 'string') {
    parent = query(parent);
  }
  if (parent && child) {
    parent.appendChild(child);
  }
}
