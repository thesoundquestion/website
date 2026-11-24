import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const signal=read('assets/header-waveform.svg'),mark=read('assets/mark.svg'),
  css=read('assets/styles.css'),home=read('index.html');
test('visual signal is a separate safe static SVG, original brand mark intact',()=>{
 assert.match(signal,/viewBox="0 0 1440 28"/);
 assert.match(signal,/Intro-inspired decorative waveform/);
 assert.match(signal,/stroke="url\(#signal\)"/);
 assert.doesNotMatch(signal,/<script|https?:\/\/|<foreignObject|onload=/i);
 assert.match(mark,/M9 32H16L20 25L24 41/);
 assert.match(home,/src="\/assets\/mark\.svg"/);
});
test('consistent decorative signal across subpage headers and homepage',()=>{
 assert.match(css,/\.site-header::after\{/);
 assert.match(css,/\.home-simple \.home-goal-intro::after\{/);
 assert.match(css,/header-waveform\.svg/);
 assert.match(css,/pointer-events:none/);
 assert.match(css,/\.site-header \.header-inner\{z-index:1\}/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{[\s\S]*?\.site-header::after\{animation:none/);
});
