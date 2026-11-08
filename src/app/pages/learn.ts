import { Component, computed, signal } from '@angular/core';
import { BoardComponent } from '../xiangqi/board';
import { fromFen, pseudoMoves } from '../xiangqi/engine';
import { LESSONS } from '../xiangqi/lessons';

@Component({
  selector: 'app-learn',
  imports: [BoardComponent],
  template: `
  <div class="grid gap-8 md:grid-cols-[14rem_1fr]">
    <nav aria-label="Lessons" class="flex md:flex-col gap-1 overflow-x-auto">
      @for (l of lessons; track l.id; let i = $index) {
        <button type="button" (click)="go(i)"
          class="whitespace-nowrap rounded px-3 py-2 text-left text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-emerald-300"
          [class.bg-emerald-800]="i === idx()" [class.font-semibold]="i === idx()">{{ l.title }}</button>
      }
    </nav>
    <section>
      <h2 class="text-2xl font-semibold">{{ lesson().title }}</h2>
      <p class="mt-2 max-w-prose leading-relaxed text-stone-300">{{ lesson().text }}</p>
      <div class="my-6">
        <app-board [board]="board()" [selected]="sel()" [targets]="targets()" (cell)="pick($event)"/>
      </div>
      <div class="flex gap-3">
        <button type="button" class="rounded border border-white/30 px-4 py-2 disabled:opacity-40" [disabled]="idx() === 0" (click)="go(idx() - 1)">Previous lesson</button>
        <button type="button" class="rounded bg-emerald-700 px-4 py-2 disabled:opacity-40" [disabled]="idx() === lessons.length - 1" (click)="go(idx() + 1)">Next lesson</button>
      </div>
    </section>
  </div>`,
})
export class LearnComponent {
  lessons = LESSONS;
  idx = signal(0);
  sel = signal<number | null>(null);
  lesson = computed(() => this.lessons[this.idx()]);
  board = computed(() => fromFen(this.lesson().fen).board);
  targets = computed(() => (this.sel() === null ? [] : pseudoMoves(this.board(), this.sel()!)));

  go(i: number) { this.idx.set(i); this.sel.set(null); }
  pick(i: number) { this.sel.set(this.board()[i] ? i : null); }
}
