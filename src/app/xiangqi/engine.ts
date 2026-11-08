export type Side = 'r' | 'b';
export interface Move { from: number; to: number; }
export interface GameState { board: string[]; turn: Side; }

/** Uppercase = red (bottom, moves first), lowercase = black. r=rook n=horse b=elephant a=advisor k=general c=cannon p=pawn */
export const START_FEN = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w';

export const sideOf = (p: string): Side => (p === p.toUpperCase() ? 'r' : 'b');

export function fromFen(fen: string): GameState {
  const [rows, t] = fen.split(' ');
  const board: string[] = [];
  for (const ch of rows.replace(/\//g, '')) {
    if (/\d/.test(ch)) for (let i = 0; i < +ch; i++) board.push('');
    else board.push(ch);
  }
  return { board, turn: t === 'b' ? 'b' : 'r' };
}

const inB = (r: number, c: number) => r >= 0 && r < 10 && c >= 0 && c < 9;
const palace = (s: Side, r: number, c: number) => c >= 3 && c <= 5 && (s === 'r' ? r >= 7 : r <= 2);
const ORTH = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const DIAG = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

/** Moves by piece rules only (ignores check). Used for lessons. */
export function pseudoMoves(b: string[], from: number): number[] {
  const p = b[from];
  if (!p) return [];
  const s = sideOf(p), t = p.toLowerCase(), r = Math.floor(from / 9), c = from % 9;
  const out: number[] = [];
  const free = (nr: number, nc: number) => inB(nr, nc) && (!b[nr * 9 + nc] || sideOf(b[nr * 9 + nc]) !== s);
  const add = (nr: number, nc: number) => { if (free(nr, nc)) out.push(nr * 9 + nc); };

  if (t === 'r' || t === 'c') {
    for (const [dr, dc] of ORTH) {
      let nr = r + dr, nc = c + dc, screen = false;
      while (inB(nr, nc)) {
        const q = b[nr * 9 + nc];
        if (t === 'r') {
          if (!q) out.push(nr * 9 + nc);
          else { if (sideOf(q) !== s) out.push(nr * 9 + nc); break; }
        } else if (!screen) {
          if (!q) out.push(nr * 9 + nc); else screen = true;
        } else if (q) {
          if (sideOf(q) !== s) out.push(nr * 9 + nc);
          break;
        }
        nr += dr; nc += dc;
      }
    }
  } else if (t === 'n') {
    for (const [a, d] of ORTH) {
      if (!inB(r + a, c + d) || b[(r + a) * 9 + c + d]) continue; // horse leg blocked
      for (const k of [-1, 1]) { if (a) add(r + 2 * a, c + k); else add(r + k, c + 2 * d); }
    }
  } else if (t === 'b') {
    for (const [a, d] of DIAG) {
      const nr = r + 2 * a, nc = c + 2 * d;
      if (inB(nr, nc) && !b[(r + a) * 9 + c + d] && (s === 'r' ? nr >= 5 : nr <= 4)) add(nr, nc);
    }
  } else if (t === 'a') {
    for (const [a, d] of DIAG) if (palace(s, r + a, c + d)) add(r + a, c + d);
  } else if (t === 'k') {
    for (const [a, d] of ORTH) if (palace(s, r + a, c + d)) add(r + a, c + d);
  } else if (t === 'p') {
    add(r + (s === 'r' ? -1 : 1), c);
    if (s === 'r' ? r <= 4 : r >= 5) { add(r, c - 1); add(r, c + 1); }
  }
  return out;
}

export function inCheck(b: string[], s: Side): boolean {
  const k = b.indexOf(s === 'r' ? 'K' : 'k');
  if (k < 0) return true;
  const ek = b.indexOf(s === 'r' ? 'k' : 'K');
  if (ek >= 0 && ek % 9 === k % 9) { // flying general
    let clear = true;
    for (let i = Math.min(k, ek) + 9; i < Math.max(k, ek); i += 9) if (b[i]) { clear = false; break; }
    if (clear) return true;
  }
  for (let i = 0; i < 90; i++) {
    const p = b[i];
    if (p && sideOf(p) !== s && pseudoMoves(b, i).includes(k)) return true;
  }
  return false;
}

export function applyMove(g: GameState, m: Move): GameState {
  const board = g.board.slice();
  board[m.to] = board[m.from];
  board[m.from] = '';
  return { board, turn: g.turn === 'r' ? 'b' : 'r' };
}

export function legalMoves(g: GameState, from: number): number[] {
  const p = g.board[from];
  if (!p || sideOf(p) !== g.turn) return [];
  return pseudoMoves(g.board, from).filter(to => !inCheck(applyMove(g, { from, to }).board, g.turn));
}

export function allMoves(g: GameState): Move[] {
  const ms: Move[] = [];
  g.board.forEach((p, from) => { if (p && sideOf(p) === g.turn) legalMoves(g, from).forEach(to => ms.push({ from, to })); });
  return ms;
}

/** Side to move with no legal move loses (checkmate or stalemate). */
export function status(g: GameState): 'ok' | 'check' | 'mate' {
  if (!allMoves(g).length) return 'mate';
  return inCheck(g.board, g.turn) ? 'check' : 'ok';
}

const VAL: Record<string, number> = { k: 10000, r: 900, c: 450, n: 400, b: 200, a: 200, p: 100 };
const evalG = (g: GameState) => g.board.reduce((s, p) => (p ? s + (sideOf(p) === g.turn ? 1 : -1) * VAL[p.toLowerCase()] : s), 0);

function nega(g: GameState, d: number, alpha: number, beta: number): number {
  if (d === 0) return evalG(g);
  const ms = allMoves(g);
  if (!ms.length) return -99999;
  let best = -Infinity;
  for (const m of ms) {
    best = Math.max(best, -nega(applyMove(g, m), d - 1, -beta, -alpha));
    alpha = Math.max(alpha, best);
    if (alpha >= beta) break;
  }
  return best;
}

export function bestMove(g: GameState, depth: number): Move | null {
  let best: Move | null = null, bv = -Infinity;
  for (const m of allMoves(g).sort(() => Math.random() - 0.5)) {
    const v = -nega(applyMove(g, m), depth - 1, -Infinity, Infinity);
    if (v > bv) { bv = v; best = m; }
  }
  return best;
}
