// Genera los SVG del README de perfil (assets/*.svg) con la identidad de soyjulian.dev:
// fondo casi negro, violeta/cian/rosa, Geist y Geist Mono incrustadas (GitHub muestra los SVG
// como <img>, así que no pueden cargar fuentes externas ni JS; las animaciones son CSS/SMIL).
//
//   node scripts/build.mjs
//
// Lee iconos, fuentes y el codificador de QR de los node_modules de los proyectos hermanos.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WEBS = join(ROOT, '..', 'Webs');
const SITE = join(WEBS, 'soyjulian');
const OUT = join(ROOT, 'assets');
mkdirSync(OUT, { recursive: true });

const requireQr = createRequire(join(WEBS, 'qr_generator', 'package.json'));
const QRCode = requireQr('qrcode');

const b64 = (p) => readFileSync(p).toString('base64');
const GEIST = b64(join(SITE, 'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'));
const GEIST_MONO = b64(join(SITE, 'node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2'));

// ---------- Tokens ----------
const C = {
  bg: '#1a1a18',
  elev: '#222220',
  card: '#1e1e1c',
  border: 'rgba(230,230,224,0.09)',
  borderStrong: 'rgba(230,230,224,0.18)',
  fg: '#e6e6e0',
  muted: '#9a9a92',
  dim: '#6b6b64',
  // Un único color: el rojo. a2/a3 apuntan a él para que los antiguos degradados queden lisos.
  a1: '#ff4a3d',
  a2: '#ff4a3d',
  a3: '#ff4a3d',
  green: '#7fd49a',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Ancho aproximado de un texto en Geist (em por carácter), para colocar cosas en fila.
function textWidth(str, size, { mono = false, spacing = 0 } = {}) {
  if (mono) return str.length * size * 0.6 + str.length * spacing;
  let w = 0;
  for (const ch of str) {
    if ('iljI.,:;\'!|· '.includes(ch)) w += 0.28;
    else if ('ft()[]r'.includes(ch)) w += 0.38;
    else if ('mwMW'.includes(ch)) w += 0.86;
    else if (ch >= 'A' && ch <= 'Z') w += 0.66;
    else if (ch >= '0' && ch <= '9') w += 0.6;
    else w += 0.55;
  }
  return w * size + str.length * spacing;
}

function fonts({ mono = true } = {}) {
  return `@font-face{font-family:G;font-weight:100 900;src:url(data:font/woff2;base64,${GEIST}) format('woff2')}` +
    (mono ? `@font-face{font-family:GM;font-weight:100 900;src:url(data:font/woff2;base64,${GEIST_MONO}) format('woff2')}` : '');
}

function svg(w, h, body, { css = '', mono = true, title = '' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>${fonts({ mono })}
text{font-family:G,system-ui,sans-serif}text:not([fill]){fill:${C.fg}}
.m{font-family:GM,ui-monospace,monospace}
${css}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
${body}
</svg>
`;
}

// Degradados y fondos comunes
const defs = (id = '') => `
<linearGradient id="grad${id}" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${C.a1}"/><stop offset="0.5" stop-color="${C.a2}"/><stop offset="1" stop-color="${C.a3}"/>
</linearGradient>
<pattern id="grid${id}" width="32" height="32" patternUnits="userSpaceOnUse">
  <path d="M32 0H0V32" stroke="rgba(230,230,224,0.05)" stroke-width="1"/>
</pattern>
<radialGradient id="fade${id}" cx="0.5" cy="0" r="0.9">
  <stop offset="0.2" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
</radialGradient>
<mask id="gridMask${id}"><rect width="100%" height="100%" fill="url(#fade${id})"/></mask>
<radialGradient id="glowA${id}"><stop offset="0" stop-color="${C.a1}" stop-opacity="0"/><stop offset="1" stop-color="${C.a1}" stop-opacity="0"/></radialGradient>
<radialGradient id="glowB${id}"><stop offset="0" stop-color="${C.a2}" stop-opacity="0"/><stop offset="1" stop-color="${C.a2}" stop-opacity="0"/></radialGradient>
<radialGradient id="glowC${id}"><stop offset="0" stop-color="${C.a3}" stop-opacity="0"/><stop offset="1" stop-color="${C.a3}" stop-opacity="0"/></radialGradient>`;

const frame = (w, h, r = 18) =>
  `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${r}" fill="${C.bg}" stroke="${C.border}"/>`;

// ---------- Hero ----------
function hero() {
  const W = 840, H = 390;
  const roles = ['Full Stack', 'paneles de gestión', 'SaaS', 'React & Next.js', 'Astro', 'integración con IA', 'productos web'];
  const slot = 2.6, T = roles.length * slot;
  const pct = (s) => ((s / T) * 100).toFixed(3) + '%';
  const rolesCss = `@keyframes roll{0%{opacity:0;transform:translateY(22px)}${pct(0.45)}{opacity:1;transform:translateY(0)}${pct(slot - 0.35)}{opacity:1;transform:translateY(0)}${pct(slot + 0.1)}{opacity:0;transform:translateY(-22px)}100%{opacity:0;transform:translateY(-22px)}}
.role{opacity:0;animation:roll ${T}s cubic-bezier(.16,1,.3,1) infinite both}
${roles.map((_, i) => `.r${i}{animation-delay:${(i * slot - 1).toFixed(2)}s}`).join('\n')}
@keyframes ping{0%{transform:scale(1);opacity:.7}80%,100%{transform:scale(2.6);opacity:0}}
.ping{transform-box:fill-box;transform-origin:center;animation:ping 1.8s cubic-bezier(0,0,.2,1) infinite}
@keyframes spin{0%{transform:rotate(0)}25%{transform:rotate(360deg)}100%{transform:rotate(360deg)}}
.spin{transform-box:fill-box;transform-origin:center;animation:spin 2s cubic-bezier(.4,0,.2,1) infinite}
@keyframes blink{50%{opacity:0}}.caret{animation:blink 1s steps(1) infinite}
@keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(-40px,24px)}}
.drift{animation:drift 14s ease-in-out infinite}
.drift2{animation:drift 18s ease-in-out infinite reverse}`;

  // Logo vectorizado (src/assets/logo.svg de la web): sus tres trazados, en el color del texto
  const logoPaths = [...readFileSync(join(SITE, 'src/assets/logo.svg'), 'utf8').matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
  const roleX = 36 + textWidth('Desarrollador de ', 18) + 2;

  // Terminal: líneas que se escriben una tras otra
  const term = [
    ['$ ', 'whoami', 'cmd'],
    ['', 'julián montañez — full stack', 'out'],
    ['$ ', 'ls proyectos/', 'cmd'],
    ['', 'icaro/  qr-generator/  capturo/', 'dir'],
    ['', 'aapc/  vertical-pip/  utils/', 'dir'],
    ['$ ', 'cat hoy.txt', 'cmd'],
    ['', 'IA que corre en el navegador ✦', 'out'],
  ];
  const TX = 500, TY = 84, TW = 304, TH = 262;
  let t = 0.6;
  const lines = term.map(([p, s, kind], i) => {
    const y = TY + 60 + i * 24;
    const full = p + s;
    const w = textWidth(full, 12.5, { mono: true }) + 4;
    const dur = kind === 'cmd' ? Math.max(0.35, s.length * 0.045) : 0.05;
    const steps = kind === 'cmd' ? s.length : 1;
    const begin = t;
    t += dur + (kind === 'cmd' ? 0.25 : 0.12);
    const vals = Array.from({ length: steps + 1 }, (_, k) => (textWidth(p, 12.5, { mono: true }) + ((w - textWidth(p, 12.5, { mono: true })) * k) / steps).toFixed(1)).join(';');
    const color = kind === 'cmd' ? C.fg : kind === 'dir' ? C.a2 : C.muted;
    return `<text class="m" x="${TX + 18}" y="${y}" font-size="12.5"><tspan fill="${C.a1}">${esc(p)}</tspan><tspan fill="${color}">${esc(s)}</tspan></text>`;
  }).join('\n');
  const caretY = TY + 60 + term.length * 24;

  const body = `<defs>${defs()}
<linearGradient id="nameGrad" x1="0" y1="0" x2="560" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="reflect">
  <stop offset="0" stop-color="${C.a1}"/><stop offset="0.5" stop-color="${C.a2}"/><stop offset="1" stop-color="${C.a3}"/>
  <animateTransform attributeName="gradientTransform" type="translate" values="0 0;-280 0;0 0" dur="9s" repeatCount="indefinite"/>
</linearGradient>
<clipPath id="card"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="17"/></clipPath>
<clipPath id="roleClip"><rect x="${roleX - 2}" y="262" width="300" height="30"/></clipPath>
</defs>
${frame(W, H)}
<g clip-path="url(#card)">
  <rect width="${W}" height="${H}" fill="url(#grid)" mask="url(#gridMask)"/>
  <g class="drift"><circle cx="700" cy="40" r="260" fill="url(#glowA)"/></g>
  <g class="drift2"><circle cx="120" cy="400" r="220" fill="url(#glowB)"/></g>
  <circle cx="480" cy="420" r="180" fill="url(#glowC)"/>
</g>

<g class="in">
  <g transform="translate(34 27) scale(0.068)" fill="${C.fg}"><g class="spin">${logoPaths.map((d) => `<path d="${d}"/>`).join('')}</g></g>
  <text class="m" x="74" y="49" font-size="13" fill="${C.muted}" letter-spacing="0.5">soyjulian.dev</text>
</g>


<g class="in" style="animation-delay:.1s">
  <text x="36" y="118" font-size="24" fill="${C.muted}" font-weight="450">Hola, soy</text>
  <text x="32" y="196" font-size="84" font-weight="650" letter-spacing="-3" fill="url(#nameGrad)">Julián</text>
  <text x="36" y="234" font-size="24" font-weight="550" letter-spacing="-0.5">Montañez Martos</text>
</g>

<g class="in" style="animation-delay:.25s">
  <text x="36" y="284" font-size="18" fill="${C.muted}">Desarrollador de</text>
  <g clip-path="url(#roleClip)">
    ${roles.map((r, i) => `<text class="role r${i}" x="${roleX}" y="284" font-size="18" font-weight="550">${esc(r)}</text>`).join('\n    ')}
  </g>
  <text x="36" y="314" font-size="15" fill="${C.dim}">Construyo productos web que la gente usa de verdad.</text>
</g>

<text x="36" y="358" font-size="13" fill="${C.dim}">Webs, tiendas online, paneles de gestión, SaaS e IA en el navegador.</text>

<g class="in" style="animation-delay:.3s">
  <rect x="${TX}" y="${TY}" width="${TW}" height="${TH}" rx="14" fill="${C.elev}" stroke="${C.border}"/>
  <path d="M${TX} ${TY + 38}H${TX + TW}" stroke="${C.border}"/>
  <circle cx="${TX + 20}" cy="${TY + 19}" r="5" fill="#ff5f57" opacity=".85"/>
  <circle cx="${TX + 37}" cy="${TY + 19}" r="5" fill="#febc2e" opacity=".85"/>
  <circle cx="${TX + 54}" cy="${TY + 19}" r="5" fill="#28c840" opacity=".85"/>
  <text class="m" x="${TX + TW - 16}" y="${TY + 23}" font-size="11" fill="${C.dim}" text-anchor="end">~/soyjulian.dev</text>
  ${lines}
  <text class="m" x="${TX + 18}" y="${caretY}" font-size="12.5" fill="${C.a1}">$ <tspan class="caret" fill="${C.fg}">▌</tspan></text>
</g>`;
  return svg(W, H, body, { css: rolesCss, title: 'Julián Montañez Martos — Desarrollador Full Stack. Construyo productos web que la gente usa de verdad.' });
}

// ---------- Cintas cruzadas ----------
function ribbons() {
  const W = 840, H = 170;
  const unit1 = 'WEBS ✦ PANELES DE GESTIÓN ✦ SAAS ✦ TIENDAS ONLINE ✦ TYPESCRIPT ✦ REACT ✦ ASTRO ✦ ';
  const unit2 = 'IA EN EL NAVEGADOR ✦ WEBGPU ✦ OPEN SOURCE ✦ PYTHON ✦ DOCKER ✦ VERCEL ✦ LINUX ✦ ';
  const U1 = Math.round(textWidth(unit1, 17, { spacing: 1.5 }) * 1.08);
  const U2 = Math.round(textWidth(unit2, 15, { spacing: 1.5 }) * 1.08);
  const p1 = 'M-700 70 Q-560 20 -420 70 T-140 70 T140 70 T420 70 T700 70 T980 70 T1260 70 T1540 70 T1820 70';
  const p2 = 'M-700 108 Q-560 150 -420 108 T-140 108 T140 108 T420 108 T700 108 T980 108 T1260 108 T1540 108 T1820 108';
  const band = (id, d, stroke, width, unit, U, size, color, dir, dur) => `
  <path id="${id}" d="${d}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>
  <text font-size="${size}" font-weight="750" letter-spacing="1.5" fill="${color}" dominant-baseline="central">
    <textPath href="#${id}" textLength="${U * 4}" lengthAdjust="spacing" startOffset="${dir > 0 ? -U : 0}">${esc(unit.repeat(4))}<animate attributeName="startOffset" from="${dir > 0 ? -U : 0}" to="${dir > 0 ? 0 : -U}" dur="${dur}s" repeatCount="indefinite"/></textPath>
  </text>`;
  const body = `<defs><clipPath id="c"><rect x="0" y="0" width="${W}" height="${H}" rx="18"/></clipPath>
<linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="#e03a2f"/><stop offset="1" stop-color="${C.a1}"/></linearGradient></defs>
<g clip-path="url(#c)">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  ${band('b2', p2, C.fg, 36, unit2, U2, 15, C.bg, -1, 26)}
  ${band('b1', p1, 'url(#rg)', 44, unit1, U1, 17, '#fff', 1, 22)}
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18" stroke="${C.border}"/>`;
  return svg(W, H, body, { mono: false, title: 'TypeScript, React, Next.js, Astro, Node.js, Tailwind, PostgreSQL, Prisma, Python, Docker, Vercel, Linux e IA en el navegador' });
}

// ---------- Cifras ----------
function stats() {
  const W = 840, H = 112;
  const items = [
    ['7', 'proyectos en producción'],
    ['2', 'open source, MIT'],
    ['100 %', 'del código, mío'],
    ['< 24 h', 'para responderte'],
  ];
  const cw = W / items.length;
  const body = `<defs>${defs()}</defs>${frame(W, H)}
${items.map(([n, l], i) => `<g class="s" style="animation-delay:${(i * 0.12).toFixed(2)}s">
  ${i ? `<path d="M${i * cw} 22V${H - 22}" stroke="${C.border}"/>` : ''}
  <text x="${i * cw + 28}" y="62" font-size="40" font-weight="650" letter-spacing="-1.5" fill="url(#grad)">${esc(n)}</text>
  <text x="${i * cw + 28}" y="86" font-size="12.5" fill="${C.muted}">${esc(l)}</text>
</g>`).join('\n')}`;
  return svg(W, H, body, { mono: false, title: '7 proyectos en producción, 2 open source, 100 % del código mío, respuesta en menos de 24 horas' });
}

// ---------- Cabecera de sección ----------
function section(n, title, sub) {
  const W = 840, H = 64;
  const tx = 2 + 14;
  const tw = textWidth(title, 24);
  const body = `<defs>${defs()}</defs>
<rect x="2" y="30" width="8" height="8" rx="2" fill="${C.a1}"/>
<text x="${tx + 14}" y="42" font-size="24" font-weight="600" letter-spacing="-0.6">${esc(title)}</text>
<path d="M${tx + 14 + tw + 20} 34H${W - 12 - textWidth(sub, 13) - 16}" stroke="${C.border}"/>
<text x="${W - 2}" y="39" font-size="13" fill="${C.dim}" text-anchor="end">${esc(sub)}</text>`;
  return svg(W, H, body, { title });
}

// ---------- Tarjeta Ícaro ----------
function icaro() {
  const W = 412, H = 360;
  const wing = `<g transform="translate(34 32) scale(1.05)" fill="none" stroke="${C.fg}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 27C7 13 17 5 29 5"/><path d="M29 5c-4 5-9 9-16 12"/><path d="M24 11c-4 5-9 8-15 10"/><path d="M18 17c-4 4-8 7-15 10"/></g>`;
  const css = `@keyframes cyc{0%,3%{opacity:0;transform:translateY(8px)}8%,88%{opacity:1;transform:none}94%,100%{opacity:0}}
@keyframes dots{0%,14%{opacity:0}18%,30%{opacity:1}33%,100%{opacity:0}}
@keyframes ans{0%,31%{opacity:0;transform:translateY(8px)}35%,88%{opacity:1;transform:none}94%,100%{opacity:0}}
@keyframes type{0%,34%{transform:scaleX(0)}56%,100%{transform:scaleX(1)}}
@keyframes pill{0%,57%{opacity:0;transform:scale(.6)}61%{opacity:1;transform:scale(1.12)}64%,88%{opacity:1;transform:scale(1)}94%,100%{opacity:0}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.q,.dts,.a,.tp,.pl{animation-delay:-6.5s!important}
.q{animation:cyc 10s ease infinite both}.dts{animation:dots 10s linear infinite both}
.a{animation:ans 10s ease infinite both}
.tp{transform-box:fill-box;transform-origin:left;animation:type 10s steps(24) infinite both}
.pl{transform-box:fill-box;transform-origin:center;animation:pill 10s ease infinite both}
.d1,.d2,.d3{transform-box:fill-box;animation:bounce .9s ease-in-out infinite}.d2{animation-delay:.15s}.d3{animation-delay:.3s}`;
  const body = `<defs>${defs()}<clipPath id="k"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="17"/></clipPath>
<clipPath id="ansClip"><rect class="tp" x="146" y="178" width="220" height="40"/></clipPath></defs>
${frame(W, H)}
<rect x="24" y="22" width="56" height="56" rx="14" fill="${C.elev}" stroke="${C.border}"/>
${wing}
<text x="${W - 24}" y="40" font-size="12" fill="${C.dim}" text-anchor="end">open source · MIT</text>
<text x="24" y="116" font-size="30" font-weight="650" letter-spacing="-1">Ícaro</text>
<text x="24" y="140" font-size="14" fill="${C.muted}">Tu asistente de PDF. IA en el navegador.</text>

<g class="q"><rect x="182" y="156" width="206" height="34" rx="12" fill="rgba(230,230,224,0.06)" stroke="${C.border}"/>
<text x="196" y="178" font-size="13">¿Cuánto es la fianza?</text></g>
<g class="dts"><rect x="24" y="200" width="58" height="30" rx="12" fill="${C.elev}" stroke="${C.border}"/>
<circle class="d1" cx="42" cy="215" r="3" fill="${C.muted}"/><circle class="d2" cx="53" cy="215" r="3" fill="${C.muted}"/><circle class="d3" cx="64" cy="215" r="3" fill="${C.muted}"/></g>
<g class="a"><rect x="24" y="200" width="300" height="56" rx="12" fill="${C.elev}" stroke="${C.border}"/>
<g clip-path="url(#ansClip)" transform="translate(-122 22)"><text x="160" y="200" font-size="13" fill="${C.fg}">Dos mensualidades, a devolver</text></g>
<text x="38" y="244" font-size="13" fill="${C.fg}" opacity=".0">.</text></g>
<g class="a"><text x="38" y="244" font-size="13" fill="${C.muted}">al terminar el contrato</text></g>
<g class="pl"><text class="m" x="214" y="245" font-size="11.5" fill="${C.a1}" text-anchor="middle">[p. 4]</text></g>

<path d="M24 290H${W - 24}" stroke="${C.border}"/>
<text x="24" y="312.5" font-size="12" fill="${C.muted}">El documento nunca sube a la nube.</text>
<text class="m" x="24" y="338" font-size="11.5" fill="${C.a1}">icaro.soyjulian.dev ↗</text>
<text class="m" x="${W - 24}" y="338" font-size="10.5" fill="${C.dim}" text-anchor="end">astro · webgpu · transformers.js</text>`;
  return svg(W, H, body, { css, title: 'Ícaro — tu asistente de PDF. Pregunta a un PDF y responde citando páginas; la IA corre en el navegador. icaro.soyjulian.dev' });
}

// ---------- Tarjeta Generador de QR ----------
function qr() {
  const W = 412, H = 360;
  const q = QRCode.create('https://qr-generator.soyjulian.dev', { errorCorrectionLevel: 'M' });
  const n = q.modules.size, data = q.modules.data;
  const S = 160, cell = S / n, ox = W - 24 - S, oy = 88;
  const inFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  let dots = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (!data[r * n + c] || inFinder(r, c)) continue;
    dots += `<circle cx="${(ox + (c + 0.5) * cell).toFixed(2)}" cy="${(oy + (r + 0.5) * cell).toFixed(2)}" r="${(cell * 0.43).toFixed(2)}"/>`;
  }
  const finder = (r, c) => {
    const x = ox + c * cell, y = oy + r * cell;
    return `<rect x="${(x + cell / 2).toFixed(2)}" y="${(y + cell / 2).toFixed(2)}" width="${(cell * 6).toFixed(2)}" height="${(cell * 6).toFixed(2)}" rx="${(cell * 1.8).toFixed(2)}" fill="none" stroke="${C.fg}" stroke-width="${cell.toFixed(2)}"/>
<rect x="${(x + cell * 2).toFixed(2)}" y="${(y + cell * 2).toFixed(2)}" width="${(cell * 3).toFixed(2)}" height="${(cell * 3).toFixed(2)}" rx="${(cell * 0.9).toFixed(2)}" fill="${C.fg}"/>`;
  };
  const css = `@keyframes scan{0%{transform:translateY(0);opacity:0}8%{opacity:1}46%{transform:translateY(${S}px);opacity:1}52%,100%{transform:translateY(${S}px);opacity:0}}
.scan{animation:scan 4s cubic-bezier(.65,0,.35,1) infinite}
@keyframes ok{0%,48%{opacity:0;transform:scale(.7)}54%{opacity:1;transform:scale(1.08)}58%,92%{opacity:1;transform:scale(1)}100%{opacity:0}}
.ok{transform-box:fill-box;transform-origin:center;animation:ok 4s ease infinite both;animation-delay:-2.6s}.scan{animation-delay:-1s}`;
  const opts = [['Formas', '6 módulos · 4 esquinas'], ['Color', 'sólido o degradado'], ['Logo', 'centrado, vaciando módulos'], ['Exporta', 'SVG · PNG hasta 4096 px']];
  const body = `<defs>${defs()}
<clipPath id="k"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="17"/></clipPath>
<clipPath id="qc"><rect x="${ox - 12}" y="${oy - 12}" width="${S + 24}" height="${S + 24}" rx="16"/></clipPath></defs>
${frame(W, H)}
<rect x="24" y="22" width="56" height="56" rx="14" fill="${C.elev}" stroke="${C.border}"/>
<g fill="${C.fg}" transform="translate(36 34) scale(0.5)"><rect x="0" y="0" width="16" height="16" rx="3"/><rect x="32" y="0" width="16" height="16" rx="3"/><rect x="0" y="32" width="16" height="16" rx="3"/><rect x="36" y="36" width="8" height="8" rx="2"/><rect x="24" y="24" width="6" height="6" rx="1.5"/></g>
<text x="${W - 24}" y="40" font-size="12" fill="${C.dim}" text-anchor="end">open source · MIT</text>
<text x="24" y="116" font-size="30" font-weight="650" letter-spacing="-1">QR</text>
<text x="24" y="140" font-size="14" fill="${C.muted}">que se comprueban solos.</text>
${opts.map(([k, v], i) => `<text x="24" y="${172 + i * 30}" font-size="11.5" fill="${C.dim}">${k}</text><text x="24" y="${172 + i * 30 + 15}" font-size="11.5" fill="${C.muted}">${esc(v)}</text>`).join('')}
<rect x="${ox - 12}" y="${oy - 12}" width="${S + 24}" height="${S + 24}" rx="16" fill="${C.elev}" stroke="${C.border}"/>
<g fill="${C.fg}">${dots}</g>
${finder(0, 0)}${finder(0, n - 7)}${finder(n - 7, 0)}
<g clip-path="url(#qc)"><g class="scan"><rect x="${ox - 12}" y="${oy}" width="${S + 24}" height="1.5" fill="${C.a1}"/></g></g>
<g class="ok"><text x="${ox + S / 2}" y="${oy + S + 32}" font-size="12" fill="${C.muted}" text-anchor="middle">✓ se lee bien</text></g>
<path d="M24 290H${W - 24}" stroke="${C.border}"/>
<text x="24" y="312.5" font-size="12" fill="${C.muted}">Verificado con jsQR en cada cambio.</text>
<text class="m" x="24" y="338" font-size="11.5" fill="${C.a1}">qr-generator.soyjulian.dev ↗</text>
<text class="m" x="${W - 24}" y="338" font-size="10.5" fill="${C.dim}" text-anchor="end">vite · react · jsqr</text>`;
  return svg(W, H, body, { css, title: 'Generador de QR — QR personalizables que se comprueban solos con jsQR. qr-generator.soyjulian.dev' });
}

// ---------- Open source: filas anchas con una ilustración de lo que hace cada proyecto ----------
// Mismo lenguaje que las filas de producción: plano, borde fino, texto a la izquierda y a la
// derecha un dibujo del propio proyecto. Todo se ve en reposo; la animación solo lo acompaña.
function osText(W, { title, lines, url, stack }) {
  return `<text x="32" y="46" font-size="12.5" fill="${C.dim}">open source · MIT</text>
<text x="32" y="88" font-size="32" font-weight="650" letter-spacing="-1">${esc(title)}</text>
${lines.map((l, i) => `<text x="32" y="${122 + i * 22}" font-size="14.5" fill="${C.muted}">${esc(l)}</text>`).join('')}
<text class="m" x="32" y="214" font-size="12.5" fill="${C.a1}">${esc(url)} ↗</text>
<text class="m" x="${32 + textWidth(url + ' ↗', 12.5, { mono: true }) + 18}" y="214" font-size="11.5" fill="${C.dim}">${esc(stack)}</text>`;
}

function icaroRow() {
  const W = 840, H = 250;
  // Página de PDF: líneas de texto grises; la citada va marcada en rojo
  const PX = 488, PY = 30, PW = 150, PH = 190;
  const widths = [118, 124, 96, 0, 120, 110, 124, 80, 0, 116, 122];
  let y = PY + 36;
  const lines = widths.map((w, i) => {
    const out = w ? `<rect x="${PX + 16}" y="${y}" width="${w}" height="5" rx="2.5" fill="#9a9a92" opacity="${i === 5 ? 0 : 0.55}"/>` : '';
    const yy = y;
    y += w ? 11 : 9;
    return { out, yy };
  });
  const hl = lines[5].yy;
  const css = `@keyframes mark{0%,100%{opacity:.35}50%{opacity:1}}.hl{animation:mark 2.4s ease-in-out infinite}
@keyframes dash{to{stroke-dashoffset:-16}}.link{animation:dash 1.2s linear infinite}`;
  const body = `${frame(W, H)}
${osText(W, { title: 'Ícaro', lines: ['Tu asistente de PDF: preguntas y responde', 'citando la página. La IA corre en tu navegador', 'y el documento nunca sube a la nube.'], url: 'icaro.soyjulian.dev', stack: 'astro · webgpu' })}
<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="6" fill="#e6e6e0"/>
<text class="m" x="${PX + 16}" y="${PY + 22}" font-size="9" fill="#7d7d76">contrato.pdf</text>
${lines.map((l) => l.out).join('')}
<rect class="hl" x="${PX + 12}" y="${hl - 3}" width="118" height="11" rx="3" fill="${C.a1}" opacity=".35"/>
<rect x="${PX + 16}" y="${hl}" width="110" height="5" rx="2.5" fill="#161616"/>
<text class="m" x="${PX + PW - 12}" y="${PY + PH - 12}" font-size="9" fill="#7d7d76" text-anchor="end">p. 4</text>
<g>
  <rect x="648" y="44" width="168" height="34" rx="12" fill="${C.elev}" stroke="${C.border}"/>
  <text x="662" y="66" font-size="12.5">¿Cuánto es la fianza?</text>
  <rect x="648" y="92" width="168" height="56" rx="12" fill="${C.bg}" stroke="${C.borderStrong}"/>
  <text x="662" y="114" font-size="12.5">Dos mensualidades</text>
  <text x="662" y="134" font-size="12.5">de fianza <tspan class="m" font-size="11.5" fill="${C.a1}">[p. 4]</tspan></text>
  <path class="link" d="M735 140 C 735 176, 700 ${hl + 30}, ${PX + PW - 8} ${hl + 3}" stroke="${C.a1}" stroke-width="1.4" stroke-dasharray="4 4" fill="none" opacity=".8"/>
</g>`;
  return svg(W, H, body, { css, title: 'Ícaro — tu asistente de PDF. Responde citando la página; la IA corre en el navegador. icaro.soyjulian.dev' });
}

function qrRow() {
  const W = 840, H = 250;
  const q = QRCode.create('https://qr-generator.soyjulian.dev', { errorCorrectionLevel: 'M' });
  const n = q.modules.size, data = q.modules.data;
  const S = 168, cell = S / n, ox = 600, oy = 30;
  const inFinder = (r, col) => (r < 7 && col < 7) || (r < 7 && col >= n - 7) || (r >= n - 7 && col < 7);
  let dots = '';
  for (let r = 0; r < n; r++) for (let col = 0; col < n; col++) {
    if (!data[r * n + col] || inFinder(r, col)) continue;
    dots += `<circle cx="${(ox + (col + 0.5) * cell).toFixed(2)}" cy="${(oy + (r + 0.5) * cell).toFixed(2)}" r="${(cell * 0.43).toFixed(2)}"/>`;
  }
  const finder = (r, col) => {
    const x = ox + col * cell, y = oy + r * cell;
    return `<rect x="${(x + cell / 2).toFixed(2)}" y="${(y + cell / 2).toFixed(2)}" width="${(cell * 6).toFixed(2)}" height="${(cell * 6).toFixed(2)}" rx="${(cell * 1.8).toFixed(2)}" fill="none" stroke="${C.fg}" stroke-width="${cell.toFixed(2)}"/>
<rect x="${(x + cell * 2).toFixed(2)}" y="${(y + cell * 2).toFixed(2)}" width="${(cell * 3).toFixed(2)}" height="${(cell * 3).toFixed(2)}" rx="${(cell * 0.9).toFixed(2)}" fill="${C.fg}"/>`;
  };
  const css = `@keyframes scan{0%{transform:translateY(0)}50%{transform:translateY(${S}px)}100%{transform:translateY(0)}}.scan{animation:scan 3.6s cubic-bezier(.65,0,.35,1) infinite}`;
  const body = `<defs><clipPath id="qc"><rect x="${ox - 10}" y="${oy - 10}" width="${S + 20}" height="${S + 20}" rx="14"/></clipPath></defs>
${frame(W, H)}
${osText(W, { title: 'Generador de QR', lines: ['Formas, colores, degradados y logo, en SVG o', 'PNG hasta 4096 px. Cada cambio se lee con jsQR:', 'si el diseño no escanea, te avisa antes de imprimir.'], url: 'qr-generator.soyjulian.dev', stack: 'vite · react' })}
<g fill="${C.fg}">${dots}</g>
${finder(0, 0)}${finder(0, n - 7)}${finder(n - 7, 0)}
<g clip-path="url(#qc)"><rect class="scan" x="${ox - 10}" y="${oy}" width="${S + 20}" height="1.5" fill="${C.a1}"/></g>
<text x="${ox + S / 2}" y="${oy + S + 30}" font-size="12.5" fill="${C.muted}" text-anchor="middle">✓ se lee</text>`;
  return svg(W, H, body, { css, title: 'Generador de QR — QR personalizables que se comprueban solos con jsQR. qr-generator.soyjulian.dev' });
}

// ---------- Filas de producción ----------
// Una fila a lo ancho por proyecto: logo, nombre, qué es y dominio. Solo una línea fina debajo;
// apiladas en el README forman una lista.
function prodRow(p) {
  const W = 840, H = 76;
  const logo = p.logo ? `<image href="data:image/png;base64,${b64(join(SITE, 'public', p.logo))}" x="12" y="20" width="36" height="36"/>` : '';
  const body = `<rect x="4" y="14" width="52" height="48" rx="12" fill="${C.elev}" stroke="${C.border}"/>
<g transform="translate(-2 0)">${logo}</g>
<text x="76" y="35" font-size="17" font-weight="600" letter-spacing="-0.3">${esc(p.title)}</text>
<text x="76" y="56" font-size="13.5" fill="${C.muted}">${esc(p.line)}</text>
<text x="${W - 4}" y="35" font-size="12.5" fill="${C.dim}" text-anchor="end">${esc(p.tag)}</text>
<text class="m" x="${W - 4}" y="56" font-size="12" fill="${C.fg}" text-anchor="end">${esc(p.domain)} ↗</text>
<path d="M4 ${H - 0.5}H${W - 4}" stroke="${C.border}"/>`;
  return svg(W, H, body, { title: `${p.title} — ${p.line} ${p.domain}` });
}

function allRow() {
  const W = 840, H = 60;
  const css = `@keyframes nudge{0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}.ar{animation:nudge 1.6s ease-in-out infinite}`;
  const body = `<text x="4" y="36" font-size="14" fill="${C.muted}">Todos los proyectos, con capturas y stack, en <tspan fill="${C.fg}" font-weight="500">soyjulian.dev</tspan></text>
<g class="ar"><text x="${W - 8}" y="37" font-size="18" fill="${C.a1}" text-anchor="end">→</text></g>`;
  return svg(W, H, body, { css, title: 'Todos los proyectos en soyjulian.dev' });
}

// ---------- Stack ----------
function stack() {
  const W = 840;
  const icon = (slug) => {
    const s = readFileSync(join(SITE, 'node_modules/simple-icons/icons', `${slug}.svg`), 'utf8');
    return s.match(/ d="([^"]+)"/)[1];
  };
  const groups = [
    ['Frontend', [['TypeScript', 'typescript', '#3178C6'], ['React', 'react', '#61DAFB'], ['Next.js', 'nextdotjs', '#ffffff'], ['Astro', 'astro', '#BC52EE'], ['Tailwind', 'tailwindcss', '#06B6D4'], ['Vite', 'vite', '#646CFF']]],
    ['Backend y datos', [['Node.js', 'nodedotjs', '#5FA04E'], ['PostgreSQL', 'postgresql', '#4169E1'], ['Prisma', 'prisma', '#ffffff'], ['Python', 'python', '#3776AB']]],
    ['IA', [['transformers.js', 'huggingface', '#FFD21E'], ['WebGPU', 'webgpu', '#005A9C'], ['Claude', 'claude', '#D97757']]],
    ['Infra', [['Vercel', 'vercel', '#ffffff'], ['Docker', 'docker', '#2496ED'], ['Linux', 'linux', '#FCC624'], ['Git', 'git', '#F05032']]],
  ];
  const rowH = 54, top = 28, H = top * 2 + groups.length * rowH - 12;
  let k = 0;
  const rows = groups.map(([label, items], gi) => {
    const y = top + gi * rowH;
    let x = 190;
    const chips = items.map(([name, slug, color]) => {
      const w = 44 + textWidth(name, 13);
      const out = `<g class="chip" style="animation-delay:${(k++ * 0.05).toFixed(2)}s">
  <rect x="${x}" y="${y}" width="${w.toFixed(1)}" height="36" rx="10" fill="rgba(230,230,224,0.035)" stroke="${C.border}"/>
  <g transform="translate(${x + 13} ${y + 10}) scale(0.6667)"><path d="${icon(slug)}" fill="${color}"/></g>
  <text x="${x + 34}" y="${y + 22.5}" font-size="13" font-weight="500">${esc(name)}</text>
</g>`;
      x += w + 8;
      return out;
    }).join('\n');
    return `<text x="28" y="${y + 23}" font-size="12.5" fill="${C.muted}">${label}</text>${gi ? `<path d="M28 ${y - 9}H${W - 28}" stroke="rgba(230,230,224,0.04)"/>` : ''}\n${chips}`;
  }).join('\n');
  return svg(W, H, `${frame(W, H)}\n${rows}`, {title: 'Stack: TypeScript, React, Next.js, Astro, Tailwind, Vite, Node.js, PostgreSQL, Prisma, Python, transformers.js, WebGPU, Claude, Vercel, Docker, Linux, Git' });
}

// ---------- Contacto ----------
// El borde es un degradado rojo y cemento que gira alrededor de la tarjeta.
function contact() {
  const W = 840, H = 230;
  const body = `<defs>${defs()}
<linearGradient id="bd" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0">
  <stop offset="0" stop-color="${C.a1}"/><stop offset=".35" stop-color="${C.a1}" stop-opacity=".15"/>
  <stop offset=".6" stop-color="${C.fg}" stop-opacity=".55"/><stop offset=".85" stop-color="${C.a1}" stop-opacity=".2"/><stop offset="1" stop-color="${C.a1}"/>
  <animateTransform attributeName="gradientTransform" type="rotate" from="0 ${W / 2} ${H / 2}" to="360 ${W / 2} ${H / 2}" dur="6s" repeatCount="indefinite"/>
</linearGradient>
<clipPath id="k"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="17"/></clipPath></defs>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="${C.bg}" stroke="url(#bd)" stroke-width="2"/>
<g clip-path="url(#k)"><rect width="${W}" height="${H}" fill="url(#grid)" mask="url(#gridMask)"/></g>
<text x="${W / 2}" y="104" font-size="38" font-weight="650" letter-spacing="-1.5" text-anchor="middle">¿Tienes un proyecto en mente?</text>
<text x="${W / 2}" y="150" font-size="38" font-weight="650" letter-spacing="-1.5" text-anchor="middle" fill="${C.a1}">Hablemos.</text>
<text class="m" x="${W / 2}" y="190" font-size="13" fill="${C.muted}" text-anchor="middle">julianmontanezmartos@gmail.com</text>`;
  return svg(W, H, body, { title: '¿Tienes un proyecto en mente? Hablemos: julianmontanezmartos@gmail.com' });
}

function button(label, sub, primary) {
  const W = Math.round(Math.max(textWidth(label, 14), textWidth(sub, 10.5, { mono: true })) + 64), H = 52;
  const body = `<defs>${defs()}</defs>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="26" fill="${primary ? C.fg : C.bg}" stroke="${primary ? C.fg : C.borderStrong}"/>
<text x="28" y="24" font-size="14" font-weight="600" fill="${primary ? C.bg : C.fg}">${esc(label)}</text>
<text class="m" x="28" y="39" font-size="10.5" fill="${primary ? '#5f6474' : C.dim}">${esc(sub)}</text>
<text x="${W - 26}" y="31" font-size="16" fill="${primary ? C.bg : C.a1}" text-anchor="middle">↗</text>`;
  return svg(W, H, body, { title: label });
}

// ---------- Escribir ----------
const files = {
  'hero.svg': hero(),
  'ribbons.svg': ribbons(),
  'stats.svg': stats(),
  'section-open-source.svg': section('01', 'Open source', 'código abierto · MIT'),
  'section-produccion.svg': section('02', 'En producción', 'clientes y productos propios'),
  'section-stack.svg': section('03', 'Stack', 'con lo que trabajo'),
  'project-icaro.svg': icaroRow(),
  'project-qr.svg': qrRow(),
  'prod-capturo.svg': prodRow({ title: 'Capturo', tag: 'Producto', domain: 'capturo.es', logo: 'projects/capturo.png', line: 'Fotos y vídeos de tu evento en un sitio: los invitados escanean un QR y suben.' }),
  'prod-aapc.svg': prodRow({ title: 'AAPC Constantina', tag: 'Tienda online + ERP', domain: 'aapcconstantina.com', logo: 'projects/aapc.png', line: 'Tienda y panel de gestión de un negocio de informática: stock, pedidos y taller.' }),
  'prod-vpip.svg': prodRow({ title: 'Vertical Picture-in-Picture', tag: 'Extensión de Chrome', domain: 'soyjulian.dev/vertical-pip', logo: 'projects/vertical-pip.png', line: 'TikTok, Reels y Shorts en una ventana flotante, con sus controles.' }),
  'prod-utils.svg': prodRow({ title: 'utils.soyjulian.dev', tag: 'Herramientas', domain: 'utils.soyjulian.dev', logo: 'projects/utils.png', line: 'PDF, imágenes y documentos procesados en tu navegador, sin subir nada.' }),
  'prod-demonsmc.svg': prodRow({ title: 'DemonsMC Store', tag: 'Tienda Tebex · FiveM', domain: 'demonsmc.tebex.io', logo: 'projects/demonsmc.png', line: 'Tienda de mapas, MLOs y ropa para FiveM, con tema a medida.' }),
  'prod-all.svg': allRow(),
  'stack.svg': stack(),
  'contact.svg': contact(),
  'btn-email.svg': button('Escríbeme', 'julianmontanezmartos@gmail.com', true),
  'btn-web.svg': button('soyjulian.dev', 'portfolio y contacto', false),
};
// Cada versión se escribe con un nombre distinto (nombre-<hash del contenido>.svg). GitHub guarda
// en caché las imágenes del README por URL y raw.githubusercontent ignora el ?v=, así que si el
// nombre no cambia se siguen viendo versiones viejas. Se borran las versiones anteriores y el
// README se reescribe para apuntar a las nuevas.
const README = join(ROOT, 'README.md');
let readme = readFileSync(README, 'utf8');
for (const [name, content] of Object.entries(files)) {
  const base = name.replace(/\.svg$/, '');
  const hash = createHash('sha1').update(content).digest('hex').slice(0, 8);
  const file = `${base}-${hash}.svg`;
  const versioned = new RegExp(`^${base}-[0-9a-f]{8}\\.svg$`);
  for (const old of readdirSync(OUT)) {
    if (old !== file && (old === name || versioned.test(old))) unlinkSync(join(OUT, old));
  }
  writeFileSync(join(OUT, file), content);
  readme = readme.replace(new RegExp(`assets/${base}(-[0-9a-f]{8})?\\.svg(\\?v=\\d+)?`, 'g'), `assets/${file}`);
  console.log(file.padEnd(34), (content.length / 1024).toFixed(1), 'KB');
}
writeFileSync(README, readme);
