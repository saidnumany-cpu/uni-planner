/**
 * Liquid Glass — gerçek kırılma (refraction) efekti.
 *
 * Her cam yüzey için boyutuna özel bir "mercek haritası" (displacement map) üretilir:
 * merkez düz ve berrak, kenarlara doğru eğim artar; arkadaki içerik kenarlarda bükülür.
 * Kırmızı/yeşil/mavi kanallar biraz farklı miktarda büküldüğü için kenarlarda hafif
 * renk sapması (prizma etkisi) oluşur — Apple'ın Liquid Glass'ındaki gibi.
 *
 * Harita SVG filtresi olarak `backdrop-filter: url(#...)` ile uygulanır.
 * Bu özellik yalnızca Chromium tabanlı tarayıcılarda (Chrome, Edge, Android) çalışır;
 * Safari/iOS'ta yüzeyler bulanık cam + kenar parlamasıyla görünür.
 */

const SELECTOR = '.bottom-nav, .modal';
const SVG_NS = 'http://www.w3.org/2000/svg';

let svgRoot = null;
let counter = 0;
const state = new WeakMap(); // element -> { id, filter, key }

export function supportsRefraction() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Firefox|FxiOS|CriOS/i.test(ua)) return false; // iOS'ta tüm tarayıcılar WebKit
  if (!/Chrome|Chromium|Edg/i.test(ua)) return false;
  return CSS.supports('backdrop-filter', 'url(#a)');
}

/** Yuvarlatılmış dikdörtgen için kenara uzaklık ve dışa bakan normal */
function edgeInfo(x, y, w, h, r) {
  const cx = w / 2;
  const cy = h / 2;
  const px = x - cx;
  const py = y - cy;
  const qx = Math.abs(px) - (cx - r);
  const qy = Math.abs(py) - (cy - r);
  let nx;
  let ny;
  let dist;
  if (qx > 0 && qy > 0) {
    const len = Math.hypot(qx, qy) || 1;
    dist = r - len;
    nx = (qx / len) * Math.sign(px);
    ny = (qy / len) * Math.sign(py);
  } else if (qx > qy) {
    dist = r - qx;
    nx = Math.sign(px);
    ny = 0;
  } else {
    dist = r - qy;
    nx = 0;
    ny = Math.sign(py);
  }
  return { dist, nx, ny };
}

/** Mercek haritasını PNG data URL olarak üretir */
function buildMap(w, h, radius, bezel) {
  const scale = Math.min(1, 360 / Math.max(w, h)); // büyük yüzeylerde daha küçük harita yeterli
  const cw = Math.max(8, Math.round(w * scale));
  const ch = Math.max(8, Math.round(h * scale));
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(cw, ch);
  const r = Math.min(radius, w / 2, h / 2);

  for (let j = 0; j < ch; j++) {
    for (let i = 0; i < cw; i++) {
      const x = (i + 0.5) / scale;
      const y = (j + 0.5) / scale;
      const { dist, nx, ny } = edgeInfo(x, y, w, h, r);
      let dx = 0;
      let dy = 0;
      if (dist >= 0 && dist < bezel) {
        // Dışbükey "squircle" yüzey: kenara yaklaştıkça eğim (ve bükülme) hızla artar
        const t = 1 - dist / bezel;
        const m = Math.pow(t, 2.4);
        // İçeriye doğru örnekle: kenardaki görüntü merkeze doğru çekilmiş gibi bükülür
        dx = -nx * m;
        dy = -ny * m;
      }
      const k = (j * cw + i) * 4;
      img.data[k] = Math.round(128 + dx * 127);
      img.data[k + 1] = Math.round(128 + dy * 127);
      img.data[k + 2] = 128;
      img.data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png');
}

function ensureSvg() {
  if (svgRoot) return svgRoot;
  svgRoot = document.createElementNS(SVG_NS, 'svg');
  svgRoot.setAttribute('aria-hidden', 'true');
  svgRoot.setAttribute('width', '0');
  svgRoot.setAttribute('height', '0');
  svgRoot.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  document.body.appendChild(svgRoot);
  return svgRoot;
}

function filterMarkup(id, w, h, map, strength) {
  const channel = (name, s, matrix) => `
    <feDisplacementMap in="SourceGraphic" in2="map" scale="${s}" xChannelSelector="R" yChannelSelector="G" result="d${name}"/>
    <feColorMatrix in="d${name}" type="matrix" values="${matrix}" result="${name}"/>`;
  return `
    <filter id="${id}" x="0" y="0" width="${w}" height="${h}" filterUnits="userSpaceOnUse"
            primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feImage href="${map}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="map"/>
      ${channel('r', strength, '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0')}
      ${channel('g', strength * 1.08, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0')}
      ${channel('b', strength * 1.16, '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0')}
      <feBlend in="r" in2="g" mode="screen" result="rg"/>
      <feBlend in="rg" in2="b" mode="screen"/>
    </filter>`;
}

function update(el) {
  // offset* ölçüleri açılış animasyonundaki transform'dan etkilenmez
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  if (w < 8 || h < 8) return;
  const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 24;
  const isNav = el.classList.contains('bottom-nav');
  const bezel = isNav ? Math.min(h / 2, 16) : 24;
  const strength = isNav ? 40 : 56;
  const key = `${w}x${h}x${radius}`;

  let s = state.get(el);
  if (s && s.key === key) return;
  if (!s) {
    s = { id: `lg-${++counter}` };
    state.set(el, s);
  }
  s.key = key;

  const wrapper = document.createElementNS(SVG_NS, 'svg');
  wrapper.innerHTML = filterMarkup(s.id, w, h, buildMap(w, h, radius, bezel), strength);
  const next = wrapper.firstElementChild;
  const root = ensureSvg();
  if (s.filter?.isConnected) root.replaceChild(next, s.filter);
  else root.appendChild(next);
  s.filter = next;
  el.style.setProperty('--lg-refract', `url(#${s.id})`);
  el.classList.add('lg-refract');
}

function cleanup(el) {
  const s = state.get(el);
  if (s?.filter?.isConnected) s.filter.remove();
  state.delete(el);
}

/** Uygulama açılışında bir kez çağrılır */
export function initLiquidGlass() {
  if (typeof window === 'undefined' || !supportsRefraction()) return;
  document.documentElement.classList.add('lg-refraction');

  const tracked = new Set();
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) update(entry.target);
  });

  const scan = () => {
    for (const el of document.querySelectorAll(SELECTOR)) {
      if (tracked.has(el)) continue;
      tracked.add(el);
      resizeObserver.observe(el);
      update(el);
    }
    for (const el of tracked) {
      if (el.isConnected) continue;
      tracked.delete(el);
      resizeObserver.unobserve(el);
      cleanup(el);
    }
  };

  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; scan(); });
  }).observe(document.body, { childList: true, subtree: true });
  scan();
}
