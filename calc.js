// GTU Hero practice calculators (shared by the 4 repos). Plain JS, no dependencies.
const F = {
  cpi: {
    // CPI is credit weighted: CPI = sum(SPI_i * C_i) / sum(C_i), and percentage = CPI x 10 at GTU
    requiredSpi: (cpi, creditsDone, nextCredits, target) => (target * (creditsDone + nextCredits) - cpi * creditsDone) / nextCredits,
    after: (cpi, creditsDone, spi, nextCredits) => (cpi * creditsDone + spi * nextCredits) / (creditsDone + nextCredits),
    maxReachable: (cpi, creditsDone, nextCredits) => F.cpi.after(cpi, creditsDone, 10, nextCredits),
    percent: (cpi) => cpi * 10,
  },
  att: {
    // integer maths so 75% boundaries are exact; req is a whole-number percentage
    pct: (a, h) => (100 * a) / h,
    canMiss: (a, h, req = 75) => Math.max(0, Math.floor((100 * a - req * h) / req)),
    mustAttend: (a, h, req = 75) => Math.max(0, Math.ceil((req * h - 100 * a) / (100 - req))),
  },
  m: {
    clone: (A) => A.map((r) => r.slice()),
    mul: (A, B) => A.map((r) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0))),
    eye: (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => +(i === j))),
    parse: (s) => s.trim().split(';').map((r) => r.trim().split(/[\s,]+/).map(Number)),
    // row echelon with partial pivoting; returns { R, pivots }
    rref(A, tol = 1e-7) {
      const R = F.m.clone(A), rows = R.length, cols = R[0].length, pivots = [];
      let r = 0;
      for (let c = 0; c < cols && r < rows; c++) {
        let p = r;
        for (let i = r + 1; i < rows; i++) if (Math.abs(R[i][c]) > Math.abs(R[p][c])) p = i;
        if (Math.abs(R[p][c]) < tol) { for (let i = r; i < rows; i++) R[i][c] = 0; continue; }
        [R[r], R[p]] = [R[p], R[r]];
        const pv = R[r][c];
        R[r] = R[r].map((v) => v / pv);
        for (let i = 0; i < rows; i++) if (i !== r) { const f = R[i][c]; R[i] = R[i].map((v, j) => v - f * R[r][j]); }
        pivots.push(c); r++;
      }
      return { R, pivots };
    },
    rank: (A, tol) => F.m.rref(A, tol).pivots.length,
    inverse(A) {
      const n = A.length, { R, pivots } = F.m.rref(A.map((r, i) => r.concat(F.m.eye(n)[i])));
      if (pivots.slice(0, n).some((p, i) => p !== i) || pivots.length < n || pivots[n - 1] >= n) throw Error('matrix is singular');
      return R.map((r) => r.slice(n));
    },
    nullspace(A, tol = 1e-6) {
      const n = A[0].length, { R, pivots } = F.m.rref(A, tol), free = [];
      for (let c = 0; c < n; c++) if (!pivots.includes(c)) free.push(c);
      return free.map((f) => {
        const v = Array(n).fill(0); v[f] = 1;
        pivots.forEach((pc, i) => { v[pc] = -R[i][f]; });
        return v;
      });
    },
    // characteristic polynomial coefficients of lambda^n + a1 lambda^(n-1) + ... (n = 2 or 3)
    charPoly(A) {
      const n = A.length, tr = A.reduce((s, r, i) => s + r[i], 0);
      if (n === 2) return [1, -tr, A[0][0] * A[1][1] - A[0][1] * A[1][0]];
      if (n !== 3) throw Error('only 2x2 and 3x3 supported');
      const m2 = (i, j) => A[i][i] * A[j][j] - A[i][j] * A[j][i];
      const det = A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
      return [1, -tr, m2(0, 1) + m2(0, 2) + m2(1, 2), -det];
    },
    // all roots of a monic polynomial by Durand-Kerner, as [re, im] pairs
    roots(c) {
      const n = c.length - 1, mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
      const div = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
      const ev = (z) => c.reduce((acc, k) => { const t = mul(acc, z); return [t[0] + k, t[1]]; }, [0, 0]);
      let z = Array.from({ length: n }, (_, i) => { let p = [1, 0]; for (let k = 0; k < i; k++) p = mul(p, [0.4, 0.9]); return p; });
      for (let it = 0; it < 2000; it++) z = z.map((zi, i) => { let d = [1, 0]; z.forEach((zj, j) => { if (j !== i) d = mul(d, [zi[0] - zj[0], zi[1] - zj[1]]); }); const q = div(ev(zi), d); return [zi[0] - q[0], zi[1] - q[1]]; });
      return z;
    },
    diagonalize(A) {
      const n = A.length, rts = F.m.roots(F.m.charPoly(A));
      if (rts.some((r) => Math.abs(r[1]) > 1e-6)) return { real: false, diagonalizable: false, eig: rts };
      const vals = rts.map((r) => r[0]).sort((a, b) => a - b), groups = [];
      vals.forEach((v) => { const g = groups.find((g) => Math.abs(g.l - v) < 1e-4); if (g) { g.am++; g.l = (g.l * (g.am - 1) + v) / g.am; } else groups.push({ l: v, am: 1 }); });
      const P = [], D = [];
      groups.forEach((g) => {
        const vecs = F.m.nullspace(A.map((r, i) => r.map((x, j) => x - (i === j ? g.l : 0))), 1e-5);
        g.gm = vecs.length; vecs.forEach((v) => { P.push(v); D.push(g.l); });
      });
      const ok = groups.every((g) => g.gm === g.am);
      return { real: true, diagonalizable: ok, groups, P: ok ? P[0].map((_, i) => P.map((v) => v[i])) : null, D };
    },
  },
  el: {
    // isotropic elastic constants: Y = 2n(1 + s) = 3K(1 - 2s), 9/Y = 1/K + 3/n
    fromYs: (Y, s) => ({ n: Y / (2 * (1 + s)), K: Y / (3 * (1 - 2 * s)) }),
    fromYn: (Y, n) => ({ s: Y / (2 * n) - 1, K: (Y * n) / (3 * (3 * n - Y)) }),
    youngWire: (massKg, Lm, dM, dLm, g = 9.81) => (massKg * g * Lm) / (Math.PI * (dM / 2) ** 2 * dLm),
  },
};
if (typeof module !== 'undefined') module.exports = F;
