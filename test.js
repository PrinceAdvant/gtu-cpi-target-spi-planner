const F = require('./calc.js');
const a = (x, y, tol = 1e-6) => { if (Math.abs(x - y) > tol * Math.max(1, Math.abs(y))) throw Error(x + ' vs ' + y); };

// CPI target planner (CPI 199/26 after 26 credits is the worked example in GTU Hero's CPI guide)
a(F.cpi.requiredSpi(199 / 26, 26, 13, 8), (312 - 199) / 13);
a(F.cpi.after(199 / 26, 26, (312 - 199) / 13, 13), 8);
a(F.cpi.maxReachable(199 / 26, 26, 13), (199 + 130) / 39);
a(F.cpi.percent(7.43), 74.3);
if (!(F.cpi.requiredSpi(6, 120, 20, 7) > 10)) throw Error('jumping from 6 to 7 in one 20-credit sem after 120 credits is impossible');

// Attendance (own practice values)
a(F.att.mustAttend(45, 64), 12); a(57 / 76, 0.75);
a(F.att.canMiss(70, 84), 9); if (!(70 / 93 >= 0.75 && 70 / 94 < 0.75)) throw Error('canMiss boundary');
a(F.att.canMiss(45, 64), 0); a(F.att.mustAttend(70, 84), 0);
a(F.att.canMiss(60, 80), 0); a(F.att.mustAttend(60, 80), 0);

// Diagonalization (own practice matrices)
const chk = (A) => { const r = F.m.diagonalize(A); if (r.diagonalizable) { const M = F.m.mul(F.m.inverse(r.P), F.m.mul(A, r.P)); M.forEach((row, i) => row.forEach((v, j) => a(v, i === j ? r.D[i] : 0, 1e-5))); } return r; };
let r = chk([[4, 1], [2, 3]]); if (!r.diagonalizable) throw Error('2x2 distinct'); a(r.D[0], 2, 1e-6); a(r.D[1], 5, 1e-6);
r = chk([[2, 1, 1], [1, 2, 1], [1, 1, 2]]); if (!r.diagonalizable) throw Error('symmetric must diagonalize'); a(r.groups[0].l, 1, 1e-5); a(r.groups[0].gm, 2);
r = chk([[2, 0, 0], [1, 2, 0], [0, 0, 3]]); if (r.diagonalizable) throw Error('defective matrix'); a(r.groups[0].am, 2); a(r.groups[0].gm, 1);
r = chk([[0, -1], [1, 0]]); if (r.real) throw Error('rotation has complex eigenvalues');
r = chk([[1, 2, 0], [0, 3, 0], [2, -4, 2]]); if (!r.diagonalizable) throw Error('distinct 1,2,3');

// Elastic constants (own practice values)
let e = F.el.fromYs(200e9, 0.3); a(e.n, 200e9 / 2.6); a(e.K, 200e9 / 1.2);
a(9 / 200e9, 1 / e.K + 3 / e.n);
e = F.el.fromYn(200e9, 200e9 / 2.6); a(e.s, 0.3); a(e.K, 200e9 / 1.2);
a(F.el.youngWire(5, 2, 0.5e-3, 2.5e-3), 5 * 9.81 * 2 / (Math.PI * 0.0625e-6 * 2.5e-3));

console.log('All checks passed');
