import { Component, input, output } from '@angular/core';
import { Move, sideOf } from './engine';

const RED: Record<string, string> = { k: '帥', a: '仕', b: '相', n: '傌', r: '俥', c: '炮', p: '兵' };
const BLK: Record<string, string> = { k: '將', a: '士', b: '象', n: '馬', r: '車', c: '砲', p: '卒' };

@Component({
  selector: 'app-board',
  template: `
  <svg viewBox="0 0 900 1000" class="w-full max-w-md mx-auto select-none rounded-md shadow-xl" style="background:#d9c08a" role="img" aria-label="Xiangqi board">
    @for (r of rows; track r) {
      <line x1="50" x2="850" [attr.y1]="50 + r * 100" [attr.y2]="50 + r * 100" stroke="#4a2f14" stroke-width="3"/>
    }
    @for (c of cols; track c) {
      @if (c === 0 || c === 8) {
        <line [attr.x1]="50 + c * 100" [attr.x2]="50 + c * 100" y1="50" y2="950" stroke="#4a2f14" stroke-width="3"/>
      } @else {
        <line [attr.x1]="50 + c * 100" [attr.x2]="50 + c * 100" y1="50" y2="450" stroke="#4a2f14" stroke-width="3"/>
        <line [attr.x1]="50 + c * 100" [attr.x2]="50 + c * 100" y1="550" y2="950" stroke="#4a2f14" stroke-width="3"/>
      }
    }
    <path d="M350 50 L550 250 M550 50 L350 250 M350 750 L550 950 M550 750 L350 950" stroke="#4a2f14" stroke-width="3" fill="none"/>
    <text x="250" y="518" text-anchor="middle" font-size="64" fill="#4a2f14" opacity=".6">楚 河</text>
    <text x="650" y="518" text-anchor="middle" font-size="64" fill="#4a2f14" opacity=".6">漢 界</text>

    @if (last(); as m) {
      <rect [attr.x]="x(m.from) - 46" [attr.y]="y(m.from) - 46" width="92" height="92" fill="none" stroke="#2f6f5a" stroke-width="6" stroke-dasharray="14 10"/>
      <rect [attr.x]="x(m.to) - 46" [attr.y]="y(m.to) - 46" width="92" height="92" fill="none" stroke="#2f6f5a" stroke-width="6"/>
    }
    @for (p of board(); track $index) {
      @if (p) {
        <g pointer-events="none">
          <circle [attr.cx]="x($index)" [attr.cy]="y($index)" r="43" fill="#f6ecd2" [attr.stroke]="color(p)" stroke-width="6"/>
          <circle [attr.cx]="x($index)" [attr.cy]="y($index)" r="34" fill="none" [attr.stroke]="color(p)" stroke-width="2"/>
          <text [attr.x]="x($index)" [attr.y]="y($index) + 18" text-anchor="middle" font-size="52" font-weight="700" [attr.fill]="color(p)">{{ glyph(p) }}</text>
        </g>
      }
    }
    @if (selected() !== null) {
      <circle [attr.cx]="x(selected()!)" [attr.cy]="y(selected()!)" r="50" fill="none" stroke="#2f6f5a" stroke-width="8" pointer-events="none"/>
    }
    @for (t of targets(); track t) {
      @if (board()[t]) {
        <circle [attr.cx]="x(t)" [attr.cy]="y(t)" r="50" fill="none" stroke="#b3261e" stroke-width="8" pointer-events="none"/>
      } @else {
        <circle [attr.cx]="x(t)" [attr.cy]="y(t)" r="16" fill="#2f6f5a" opacity=".85" pointer-events="none"/>
      }
    }
    @for (p of board(); track $index) {
      <circle [attr.cx]="x($index)" [attr.cy]="y($index)" r="46" fill="transparent" class="cursor-pointer" (click)="cell.emit($index)"/>
    }
  </svg>`,
})
export class BoardComponent {
  board = input.required<string[]>();
  selected = input<number | null>(null);
  targets = input<number[]>([]);
  last = input<Move | null>(null);
  cell = output<number>();

  rows = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  cols = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  x = (i: number) => 50 + (i % 9) * 100;
  y = (i: number) => 50 + Math.floor(i / 9) * 100;
  color = (p: string) => (sideOf(p) === 'r' ? '#b3261e' : '#1b1b1b');
  glyph = (p: string) => (sideOf(p) === 'r' ? RED : BLK)[p.toLowerCase()];
}
