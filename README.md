# GTU target CPI planner: what SPI do I need next semester?

GTU CPI is a credit-weighted average of all your semesters, and GTU converts it to percentage as CPI × 10 (both from GTU Hero's CPI guide). So 'next sem mein kitna SPI chahiye for CPI 8?' is just algebra. Current CPI, credits done, next semester credits aur target daalo; ye page required SPI, the best CPI you can reach next sem, and the percentage batata hai.

Live page: https://princeadvant.github.io/gtu-cpi-target-spi-planner/

## Formulas

- CPI = Σ (grade point × credits) / Σ credits
- New CPI = (CPI × credits done + SPI × next credits) / (credits done + next credits)
- Required SPI = (target × (done + next) − CPI × done) / next
- Percentage = CPI × 10 (not × 9.5, that is CBSE)

## Test

`node test.js` checks the formulas against hand-worked values and prints `All checks passed`.

## Tips

- Defaults: CPI 7.65 after 26 credits is the two-semester worked example in GTU Hero's CPI guide (exact value 199/26). Target 8 with 13 more credits needs SPI 8.69 (the page shows 8.70 because 7.65 is rounded). Your own credits will differ, check your result sheet.
- The more credits you have done, the less one semester moves CPI. Isliye Sem 1 and 2 matter so much.
- Use the CPI printed on your result. Do not round it before multiplying by 10: 7.43 is 74.3%.

CPI formula, grade table and the official percentage certificate: [GTU Hero](https://gtuhero.com/blogs/gtu-cpi-to-percentage) (GTU Hero is my project).
