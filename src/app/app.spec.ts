import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { fromFen, START_FEN, legalMoves, status } from './xiangqi/engine';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] }).compileComponents();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain('Dạy Cờ Tướng');
  });
});

describe('engine', () => {
  it('red has 44 legal moves at the start', () => {
    const g = fromFen(START_FEN);
    const n = g.board.reduce((s, _, i) => s + legalMoves(g, i).length, 0);
    expect(n).toBe(44);
    expect(status(g)).toBe('ok');
  });
});
