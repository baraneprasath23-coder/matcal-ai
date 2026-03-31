export interface FormulaTopic {
  title: string;
  content: string;
}

export const MATH_FORMULAS: FormulaTopic[] = [
  {
    title: "Number System",
    content: `
- **Fundamental Relation:** $LCM \times HCF = \text{Product of two numbers}$
- **Rational Numbers:** Numbers in the form $p/q$ where $q \neq 0$.
- **Irrational Numbers:** Numbers that cannot be expressed as $p/q$ (e.g., $\sqrt{2}, \sqrt{3}, \pi$).
- **Real Numbers:** The set of all rational and irrational numbers.
    `
  },
  {
    title: "Algebra Identities",
    content: `
- $(a + b)^2 = a^2 + 2ab + b^2$
- $(a - b)^2 = a^2 - 2ab + b^2$
- $a^2 - b^2 = (a - b)(a + b)$
- $(a + b + c)^2 = a^2 + b^2 + c^2 + 2(ab + bc + ca)$
- $(a + b)^3 = a^3 + b^3 + 3ab(a + b)$
- $(a - b)^3 = a^3 - b^3 - 3ab(a - b)$
- $a^3 + b^3 = (a + b)(a^2 - ab + b^2)$
- $a^3 - b^3 = (a - b)(a^2 + ab + b^2)$
    `
  },
  {
    title: "Linear Equations",
    content: `
- **One Variable:** $ax + b = 0 \implies x = -b/a$
- **Two Variables:**
  - $a_1x + b_1y + c_1 = 0$
  - $a_2x + b_2y + c_2 = 0$
- **Consistency Conditions:**
  - Unique Solution: $\frac{a_1}{a_2} \neq \frac{b_1}{b_2}$
  - Infinite Solutions: $\frac{a_1}{a_2} = \frac{b_1}{b_2} = \frac{c_1}{c_2}$
  - No Solution: $\frac{a_1}{a_2} = \frac{b_1}{b_2} \neq \frac{c_1}{c_2}$
    `
  },
  {
    title: "Quadratic Equations",
    content: `
- **Standard Form:** $ax^2 + b x + c = 0$
- **Quadratic Formula:** $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
- **Discriminant ($D$):** $D = b^2 - 4ac$
  - $D > 0$: Real and distinct roots.
  - $D = 0$: Real and equal roots.
  - $D < 0$: Complex roots.
- **Relations:**
  - Sum of Roots: $\alpha + \beta = -b/a$
  - Product of Roots: $\alpha\beta = c/a$
    `
  },
  {
    title: "Sequences and Series",
    content: `
### Arithmetic Progression (AP)
- **General Term:** $a_n = a + (n - 1)d$
- **Sum of $n$ Terms:** $S_n = \frac{n}{2} [2a + (n - 1)d] = \frac{n}{2}(a + l)$
- **Common Difference:** $d = a_n - a_{n-1}$

### Geometric Progression (GP)
- **General Term:** $a_n = ar^{n-1}$
- **Sum of $n$ Terms:** $S_n = \frac{a(1-r^n)}{1-r}$ ($r \neq 1$)
- **Infinite Sum:** $S_\infty = \frac{a}{1-r}$ ($|r| < 1$)

### Power Series Expansions
- **Sine Series:** $\sin x = x - \frac{x^3}{3!} + \frac{x^5}{5!} - \dots = \sum_{n=0}^{\infty} \frac{(-1)^n x^{2n+1}}{(2n+1)!}$
- **Cosine Series:** $\cos x = 1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \dots = \sum_{n=0}^{\infty} \frac{(-1)^n x^{2n}}{(2n)!}$
    `
  },
  {
    title: "Geometry (Triangles)",
    content: `
- **Area:** $\frac{1}{2} \times \text{base} \times \text{height}$
- **Pythagoras Theorem:** $a^2 + b^2 = c^2$ (for right-angled triangles)
- **Heron's Formula:** $\text{Area} = \sqrt{s(s-a)(s-b)(s-c)}$, where $s = \frac{a+b+c}{2}$
- **Similarity:** Two triangles are similar if their corresponding angles are equal and sides are in the same ratio.
    `
  },
  {
    title: "Trigonometry",
    content: `
### Ratios
- $\sin \theta = \frac{\text{Opposite}}{\text{Hypotenuse}}$
- $\cos \theta = \frac{\text{Adjacent}}{\text{Hypotenuse}}$
- $\tan \theta = \frac{\text{Opposite}}{\text{Adjacent}}$

### Identities
- $\sin^2 \theta + \cos^2 \theta = 1$
- $1 + \tan^2 \theta = \sec^2 \theta$
- $1 + \cot^2 \theta = \csc^2 \theta$

### Standard Values
| $\theta$ | $0^\circ$ | $30^\circ$ | $45^\circ$ | $60^\circ$ | $90^\circ$ |
| :--- | :---: | :---: | :---: | :---: | :---: |
| $\sin$ | $0$ | $1/2$ | $1/\sqrt{2}$ | $\sqrt{3}/2$ | $1$ |
| $\cos$ | $1$ | $\sqrt{3}/2$ | $1/\sqrt{2}$ | $1/2$ | $0$ |
| $\tan$ | $0$ | $1/\sqrt{3}$ | $1$ | $\sqrt{3}$ | $\infty$ |
    `
  },
  {
    title: "Mensuration (2D)",
    content: `
- **Rectangle:** $\text{Area} = l \times b$, $\text{Perimeter} = 2(l + b)$
- **Square:** $\text{Area} = a^2$, $\text{Perimeter} = 4a$
- **Circle:** $\text{Area} = \pi r^2$, $\text{Circumference} = 2\pi r$
- **Triangle:** $\text{Area} = \frac{1}{2} \times b \times h$
- **Parallelogram:** $\text{Area} = b \times h$
- **Rhombus:** $\text{Area} = \frac{1}{2} \times d_1 \times d_2$
- **Trapezium:** $\text{Area} = \frac{1}{2} \times (a + b) \times h$
- **Sector of Circle:** $\text{Area} = \frac{\theta}{360^\circ} \times \pi r^2$
    `
  },
  {
    title: "Mensuration (3D)",
    content: `
- **Cube:** $\text{Volume} = a^3$, $\text{Surface Area} = 6a^2$
- **Cuboid:** $\text{Volume} = l \times b \times h$, $\text{Surface Area} = 2(lb + bh + hl)$
- **Cylinder:** $\text{Volume} = \pi r^2 h$, $\text{CSA} = 2\pi rh$, $\text{TSA} = 2\pi r(r + h)$
- **Sphere:** $\text{Volume} = \frac{4}{3} \pi r^3$, $\text{Surface Area} = 4\pi r^2$
- **Hemisphere:** $\text{Volume} = \frac{2}{3} \pi r^3$, $\text{CSA} = 2\pi r^2$, $\text{TSA} = 3\pi r^2$
- **Cone:** $\text{Volume} = \frac{1}{3} \pi r^2 h$, $\text{CSA} = \pi rl$, $\text{TSA} = \pi r(r + l)$ (where $l = \sqrt{r^2 + h^2}$)
- **Frustum of Cone:** $\text{Volume} = \frac{1}{3} \pi h (R^2 + r^2 + Rr)$
    `
  },
  {
    title: "Statistics",
    content: `
- **Mean:** $\bar{x} = \frac{\sum x_i}{n}$
- **Median:** The middle value when data is arranged in order.
- **Mode:** The most frequent value in the dataset.
- **Empirical Relation:** $\text{Mode} = 3 \times \text{Median} - 2 \times \text{Mean}$
    `
  },
  {
    title: "Probability",
    content: `
- **Basic Formula:** $P(E) = \frac{\text{Number of favorable outcomes}}{\text{Total number of outcomes}}$
- **Range:** $0 \leq P(E) \leq 1$
- **Complement:** $P(E) + P(\text{not } E) = 1$
- **Sure Event:** $P = 1$, **Impossible Event:** $P = 0$
    `
  },
  {
    title: "Sets, Relations, and Functions",
    content: `
### Sets
- **De Morgan's Laws:**
  - $(A \cup B)' = A' \cap B'$
  - $(A \cap B)' = A' \cup B'$
- **Cardinality:**
  - $n(A \cup B) = n(A) + n(B) - n(A \cap B)$

### Functions
- **Composition:** $(g \circ f)(x) = g(f(x))$
- **Inverse:** $f^{-1}(y) = x \iff f(x) = y$
    `
  },
  {
    title: "Matrices and Determinants",
    content: `
- **Inverse:** $A^{-1} = \frac{1}{|A|} adj(A)$
- **Cramer's Rule:** $x = \frac{D_x}{D}, y = \frac{D_y}{D}, z = \frac{D_z}{D}$
- **Area of Triangle:** $\frac{1}{2} |x_1(y_2-y_3) + x_2(y_3-y_1) + x_3(y_1-y_2)|$
    `
  },
  {
    title: "Calculus (Advanced)",
    content: `
- **L'Hopital's Rule:** $\lim_{x \to a} \frac{f(x)}{g(x)} = \lim_{x \to a} \frac{f'(x)}{g'(x)}$
- **Product Rule:** $(uv)' = u'v + uv'$
- **Quotient Rule:** $(\frac{u}{v})' = \frac{u'v - uv'}{v^2}$
- **Integration by Parts:** $\int u dv = uv - \int v du$
- **Definite Integral Property:** $\int_0^a f(x) dx = \int_0^a f(a-x) dx$
    `
  },
  {
    title: "Vector Algebra",
    content: `
- **Magnitude:** $|\\vec{a}| = \\sqrt{x^2 + y^2 + z^2}$
- **Dot Product:** $\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}| \\cos \\theta = x_1x_2 + y_1y_2 + z_1z_2$
- **Cross Product:** $\\vec{a} \\times \\vec{b} = |\\vec{a}||\\vec{b}| \\sin \\theta \\hat{n}$
- **Unit Vector:** $\\hat{a} = \\frac{\\vec{a}}{|\\vec{a}|}$
- **Projection:** $\\text{Projection of } \\vec{a} \\text{ on } \\vec{b} = \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{b}|}$
    `
  },
  {
    title: "Coordinate Geometry",
    content: `
- **Distance Formula:** $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$
- **Section Formula:** $P(x, y) = \\left( \\frac{mx_2+nx_1}{m+n}, \\frac{my_2+ny_1}{m+n} \\right)$
- **Midpoint Formula:** $M = \\left( \\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2} \\right)$
- **Slope of Line:** $m = \\frac{y_2-y_1}{x_2-x_1} = \\tan \\theta$
- **Equation of Line:**
  - Point-Slope: $y - y_1 = m(x - x_1)$
  - Slope-Intercept: $y = mx + c$
- **Circle:** $(x-h)^2 + (y-k)^2 = r^2$
    `
  },
  {
    title: "Numbers & Divisibility",
    content: `
- **Natural Numbers:** $1, 2, 3, \dots$
- **Whole Numbers:** $0, 1, 2, \dots$
- **Integers:** $\dots, -2, -1, 0, 1, 2, \dots$
- **Prime Numbers:** Numbers with exactly two factors (1 and itself).
- **Divisibility Rules:**
  - **2:** Last digit is even.
  - **3:** Sum of digits is divisible by 3.
  - **4:** Last two digits are divisible by 4.
  - **5:** Last digit is 0 or 5.
  - **9:** Sum of digits is divisible by 9.
  - **11:** Difference between sum of odd-place and even-place digits is 0 or multiple of 11.
    `
  },
  {
    title: "HCF & LCM",
    content: `
- **Product of Two Numbers:** $HCF \times LCM = \text{Product of numbers}$
- **HCF of Fractions:** $\frac{HCF \text{ of Numerators}}{LCM \text{ of Denominators}}$
- **LCM of Fractions:** $\frac{LCM \text{ of Numerators}}{HCF \text{ of Denominators}}$
- **Co-prime Numbers:** Two numbers whose HCF is 1.
    `
  },
  {
    title: "Decimal Fractions",
    content: `
- **Conversion:** To convert decimal to fraction, divide by $10^n$ where $n$ is number of decimal places.
- **Recurring Decimals:** $0.\bar{a} = a/9$, $0.\overline{ab} = ab/99$, $0.a\bar{b} = (ab-a)/90$.
    `
  },
  {
    title: "Simplification (BODMAS)",
    content: `
- **B:** Brackets (), [], {}
- **O:** Of (Multiplication)
- **D:** Division /
- **M:** Multiplication $\times$
- **A:** Addition +
- **S:** Subtraction -
    `
  },
  {
    title: "Square & Cube Roots",
    content: `
- **Square Root:** $\sqrt{x \cdot y} = \sqrt{x} \cdot \sqrt{y}$
- **Cube Root:** $\sqrt[3]{x \cdot y} = \sqrt[3]{x} \cdot \sqrt[3]{y}$
- **Perfect Square:** Ends in 0, 1, 4, 5, 6, 9. Never ends in 2, 3, 7, 8.
    `
  },
  {
    title: "Average",
    content: `
- **Average:** $\frac{\text{Sum of Observations}}{\text{Number of Observations}}$
- **Average Speed:** $\frac{2xy}{x+y}$ (for same distance at speeds $x$ and $y$)
- **Average of first $n$ natural numbers:** $\frac{n+1}{2}$
- **Average of first $n$ even numbers:** $n+1$
- **Average of first $n$ odd numbers:** $n$
    `
  },
  {
    title: "Problems on Numbers & Ages",
    content: `
- **Number Representation:** A two-digit number with digits $x$ and $y$ is $10x + y$.
- **Ages:** If current age is $x$, then age $n$ years ago was $x-n$ and age $n$ years hence will be $x+n$.
- **Ratio of Ages:** If ratio of ages is $a:b$, ages can be taken as $ax$ and $bx$.
    `
  },
  {
    title: "Surds & Indices",
    content: `
- **Laws of Indices:**
  - $a^m \cdot a^n = a^{m+n}$
  - $a^m / a^n = a^{m-n}$
  - $(a^m)^n = a^{mn}$
  - $(ab)^n = a^n b^n$
  - $a^0 = 1$
- **Laws of Surds:**
  - $\sqrt[n]{a} = a^{1/n}$
  - $\sqrt[n]{ab} = \sqrt[n]{a} \cdot \sqrt[n]{b}$
  - $\sqrt[n]{a/b} = \frac{\sqrt[n]{a}}{\sqrt[n]{b}}$
    `
  },
  {
    title: "Percentage",
    content: `
- **Percentage:** $x\% \text{ of } y = \frac{x}{100} \times y$
- **Percentage Change:** $\frac{\text{Change}}{\text{Original Value}} \times 100$
- **Population Formula:** $P(1 + R/100)^n$ (Increase), $P(1 - R/100)^n$ (Decrease)
- **Result on Sales:** If price increases by $R\%$, reduction in consumption to keep expenditure same is $\left(\frac{R}{100+R} \times 100\right)\%$.
    `
  },
  {
    title: "Profit & Loss",
    content: `
- **Gain:** $SP - CP$
- **Loss:** $CP - SP$
- **Gain\%:** $\frac{\text{Gain}}{CP} \times 100$
- **Loss\%:** $\frac{\text{Loss}}{CP} \times 100$
- **Selling Price:** $SP = \frac{100 + \text{Gain}\%}{100} \times CP$
- **Cost Price:** $CP = \frac{100}{100 + \text{Gain}\%} \times SP$
- **Discount:** Marked Price - Selling Price
    `
  },
  {
    title: "Ratio & Proportion",
    content: `
- **Ratio:** $a:b = a/b$
- **Proportion:** $a:b = c:d \implies ad = bc$
- **Mean Proportional:** $\sqrt{ab}$ (between $a$ and $b$)
- **Third Proportional:** $b^2/a$ (to $a$ and $b$)
- **Compounded Ratio:** $(a \times c) : (b \times d)$
    `
  },
  {
    title: "Partnership",
    content: `
- **Simple Partnership:** Ratio of profits = Ratio of investments.
- **Compound Partnership:** Ratio of profits = Ratio of (Investment $\times$ Time).
- **Working Partner:** Receives a portion of profit as salary before distribution.
    `
  },
  {
    title: "Chain Rule",
    content: `
- **Direct Proportion:** $x_1/y_1 = x_2/y_2$
- **Indirect Proportion:** $x_1 y_1 = x_2 y_2$
- **General Formula:** $\frac{M_1 D_1 H_1}{W_1} = \frac{M_2 D_2 H_2}{W_2}$
  - $M$: Men, $D$: Days, $H$: Hours, $W$: Work
    `
  },
  {
    title: "Time & Work",
    content: `
- **Work Done:** $\text{Time} \times \text{Rate}$
- **Efficiency:** If A is $n$ times as good as B, ratio of work done is $n:1$ and ratio of time taken is $1:n$.
- **Combined Work:** If A takes $x$ days and B takes $y$ days, together they take $\frac{xy}{x+y}$ days.
    `
  },
  {
    title: "Pipes & Cisterns",
    content: `
- **Inlet Pipe:** Fills the tank (Positive work).
- **Outlet Pipe:** Empties the tank (Negative work).
- **Net Fill Rate:** $\frac{1}{\text{Inlet Time}} - \frac{1}{\text{Outlet Time}}$
    `
  },
  {
    title: "Time, Distance & Trains",
    content: `
- **Basic Formula:** $\text{Distance} = \text{Speed} \times \text{Time}$
- **Conversion:** $1 \text{ km/hr} = 5/18 \text{ m/s}$, $1 \text{ m/s} = 18/5 \text{ km/hr}$
- **Relative Speed:**
  - Same direction: $u - v$
  - Opposite direction: $u + v$
- **Train crossing object:**
  - Stationary point: $\text{Time} = \frac{\text{Length of Train}}{\text{Speed}}$
  - Platform/Bridge: $\text{Time} = \frac{\text{Length of Train} + \text{Length of Platform}}{\text{Speed}}$
    `
  },
  {
    title: "Boats & Streams",
    content: `
- **Downstream Speed:** $u + v$
- **Upstream Speed:** $u - v$
- **Speed in Still Water:** $\frac{1}{2}(\text{Downstream} + \text{Upstream})$
- **Speed of Stream:** $\frac{1}{2}(\text{Downstream} - \text{Upstream})$
  - $u$: Speed of boat, $v$: Speed of stream
    `
  },
  {
    title: "Simple & Compound Interest",
    content: `
- **Simple Interest (SI):** $\frac{P \times R \times T}{100}$
- **Amount (SI):** $P + SI$
- **Compound Interest (CI):** $P(1 + R/100)^n - P$
- **Amount (CI):** $P(1 + R/100)^n$
- **Compounded Half-yearly:** $R \to R/2$, $n \to 2n$
- **Compounded Quarterly:** $R \to R/4$, $n \to 4n$
    `
  },
  {
    title: "Miscellaneous (Alligation, Clock, Calendar)",
    content: `
- **Alligation Rule:** $\frac{\text{Quantity of Cheaper}}{\text{Quantity of Dearer}} = \frac{\text{CP of Dearer} - \text{Mean Price}}{\text{Mean Price} - \text{CP of Cheaper}}$
- **Clock:**
  - Minute hand moves $6^\circ$ per minute.
  - Hour hand moves $0.5^\circ$ per minute.
  - Angle between hands: $|30h - 5.5m|^\circ$
- **Calendar:**
  - Ordinary year: 365 days (1 odd day)
  - Leap year: 366 days (2 odd days)
    `
  },
  {
    title: "Quick Tips",
    content: `
- $\pi \approx 3.14$ or $22/7$
- $\sqrt{2} \approx 1.414$
- $\sqrt{3} \approx 1.732$
- $1 \text{ radian} \approx 57.3^\circ$
- $1 \text{ km/h} = 5/18 \text{ m/s}$
    `
  }
];
