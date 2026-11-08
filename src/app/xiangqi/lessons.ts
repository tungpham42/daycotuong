import { START_FEN } from './engine';

export interface Lesson { id: string; title: string; text: string; fen: string; }

/** Board placements only. Tap any piece to see where it can move. */
export const LESSONS: Lesson[] = [
  { id: 'setup', title: 'The board and setup', fen: START_FEN,
    text: 'Pieces sit on the intersections. The river splits the board in half, and each general stays inside its 3×3 palace. Red moves first. Tap any piece to see its moves.' },
  { id: 'general', title: 'General', fen: '3k5/9/9/9/9/9/9/9/4K4/9',
    text: 'The general steps one point up, down, left or right, and never leaves the palace. The two generals may never face each other on an open file.' },
  { id: 'advisor', title: 'Advisor', fen: '3k5/9/9/9/9/9/9/9/4A4/4K4',
    text: 'The advisor moves one point diagonally and stays inside the palace.' },
  { id: 'elephant', title: 'Elephant', fen: '3k5/9/9/9/9/9/9/9/3P5/2B1K4',
    text: 'The elephant jumps exactly two points diagonally, cannot cross the river, and is blocked if the point in between (the "eye") is occupied. Here the pawn blocks one jump.' },
  { id: 'horse', title: 'Horse', fen: '3k5/9/9/9/9/9/9/4P4/4N4/4K4',
    text: 'The horse moves one point straight, then one diagonally outward. If the first point is occupied (the "leg"), that direction is blocked. Notice how the pawn and general block the upward and downward jumps.' },
  { id: 'rook', title: 'Rook', fen: '3k5/9/9/9/4R4/9/9/9/9/4K4',
    text: 'The rook slides any distance in a straight line until it meets a piece. It captures the first enemy piece in its way. It is the strongest piece.' },
  { id: 'cannon', title: 'Cannon', fen: '3k5/4r4/9/4p4/9/4C4/9/9/9/4K4',
    text: 'The cannon moves like a rook, but captures by jumping over exactly one piece (the screen). Here the cannon can capture the rook by jumping over the pawn.' },
  { id: 'pawn', title: 'Pawn', fen: '3k5/9/9/9/6P2/9/P8/9/9/4K4',
    text: 'A pawn moves one point forward. After crossing the river it may also move one point sideways. It never moves backward. Compare the pawn on its own side with the one past the river.' },
];
