import { Component, computed, signal } from '@angular/core';
import { BoardComponent } from '../xiangqi/board';
import { GameState, Move, START_FEN, applyMove, bestMove, fromFen, legalMoves, sideOf, status } from '../xiangqi/engine';

@Component({
  selector: 'app-play',
  imports: [BoardComponent],
  template: `
  <div class="grid gap-6 md:grid-cols-[1fr_16rem] items-start">
    <app-board [board]="state().board" [selected]="sel()" [targets]="targets()" [last]="last()" (cell)="click($event)"/>
    <aside class="space-y-4">
      <p class="text-lg font-semibold" aria-live="polite">{{ message() }}</p>
      <fieldset class="space-y-1">
        <legend class="text-sm text-stone-300">Computer level</legend>
        <label class="flex items-center gap-2"><input type="radio" name="lv" [checked]="level() === 1" (change)="level.set(1)"/> Easy</label>
        <label class="flex items-center gap-2"><input type="radio" name="lv" [checked]="level() === 2" (change)="level.set(2)"/> Normal</label>
      </fieldset>
      <div class="flex gap-2">
        <button type="button" class="rounded bg-emerald-700 px-4 py-2" (click)="reset()">New game</button>
        <button type="button" class="rounded border border-white/30 px-4 py-2 disabled:opacity-40" [disabled]="!history().length || thinking()" (click)="undo()">Undo</button>
      </div>
      <p class="text-sm text-stone-400">You play red (bottom). Tap a piece, then a highlighted point. Illegal moves, including ones that leave your general in check, are not offered.</p>
    </aside>
  </div>`,
})
export class PlayComponent {
  state = signal<GameState>(fromFen(START_FEN));
  history = signal<GameState[]>([]);
  sel = signal<number | null>(null);
  last = signal<Move | null>(null);
  thinking = signal(false);
  level = signal(2);

  targets = computed(() => (this.sel() === null ? [] : legalMoves(this.state(), this.sel()!)));
  st = computed(() => status(this.state()));
  message = computed(() => {
    const t = this.state().turn, s = this.st();
    if (s === 'mate') return t === 'b' ? 'Checkmate. You win!' : 'Checkmate. The computer wins.';
    if (this.thinking()) return 'Computer is thinking…';
    return s === 'check' ? 'Check! Protect your general.' : 'Your move.';
  });

  click(i: number) {
    const g = this.state();
    if (g.turn !== 'r' || this.thinking() || this.st() === 'mate') return;
    const s = this.sel();
    if (s !== null && this.targets().includes(i)) {
      this.history.update(h => [...h, g]);
      this.apply({ from: s, to: i });
      if (this.st() !== 'mate') this.reply();
      return;
    }
    const p = g.board[i];
    this.sel.set(p && sideOf(p) === 'r' ? i : null);
  }

  private apply(m: Move) {
    this.state.set(applyMove(this.state(), m));
    this.last.set(m);
    this.sel.set(null);
  }

  private reply() {
    this.thinking.set(true);
    setTimeout(() => {
      const m = bestMove(this.state(), this.level());
      if (m) this.apply(m);
      this.thinking.set(false);
    }, 50);
  }

  undo() {
    const h = this.history();
    if (!h.length) return;
    this.state.set(h[h.length - 1]);
    this.history.set(h.slice(0, -1));
    this.last.set(null);
    this.sel.set(null);
  }

  reset() {
    this.state.set(fromFen(START_FEN));
    this.history.set([]);
    this.last.set(null);
    this.sel.set(null);
  }
}
