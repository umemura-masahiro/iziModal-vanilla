/**
 * ヘルパー関数
 */

/**
 * HTMLをサニタイズ（XSS対策）
 */
export function sanitize(html) {
  const div = document.createElement('div');
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');

  // すべての要素を走査して危険な属性を削除
  const elements = doc.body.querySelectorAll('*');
  elements.forEach(node => {
    Array.from(node.attributes).forEach(attr => {
      const attrName = attr.name;
      const attrValue = attr.value;
      // onで始まる属性（イベントハンドラ）やjavascript:を含む属性を削除
      if (attrName.indexOf('on') === 0 || attrValue.indexOf('javascript:') === 0) {
        node.removeAttribute(attrName);
      }
    });
  });

  return doc.body.innerHTML;
}

/**
 * CSS値から数値を抽出
 */
export function clearValue(value) {
  const separators = /%|px|em|cm|vh|vw/;
  return parseInt(String(value).split(separators)[0]);
}

/**
 * ハッシュ変更時にスクロールしないようにする
 */
export function changeHashWithoutScrolling(hash) {
  const id = hash.replace(/^.*#/, '');
  const elem = document.querySelector(hash);
  if (elem) {
    const tempId = id + '-tmp';
    elem.id = tempId;
    window.location.hash = hash;
    elem.id = id;
  }
}

/**
 * モバイルデバイスかどうかを判定
 */
export function isMobile() {
  return /Mobi/.test(navigator.userAgent);
}

/**
 * オブジェクトをマージ（Object.assignの代替）
 */
export function extend(target, ...sources) {
  return Object.assign({}, target, ...sources);
}

/**
 * オブジェクトの各プロパティに対して処理を実行
 */
export function each(obj, callback) {
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => callback(index, item));
  } else if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(key => callback(key, obj[key]));
  }
}
