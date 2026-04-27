-- 011: AP Pre Calculus starter questions (20 questions, 4 subtopics)
-- Subtopics: polynomial-rational, exponential-logarithmic, trigonometric, polar-parametric
-- Difficulty per subtopic: 2 easy, 2 medium, 1 hard
-- Balanced answer positions: 5 A, 5 B, 5 C, 5 D correct

INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES

-- ============================================================
-- POLYNOMIAL & RATIONAL FUNCTIONS (5 questions)
-- ============================================================

-- Easy (polynomial-rational)
('AP Pre Calculus', 'easy', 'polynomial-rational',
 'What is the degree of the polynomial f(x) = 3x^4 - 2x^2 + 7x - 1?',
 '4', '3', '2', '1',
 'A', 'The degree of a polynomial is the highest power of x that appears. Here the highest power is x^4, so the degree is 4.'),

('AP Pre Calculus', 'easy', 'polynomial-rational',
 'Which of the following is a vertical asymptote of f(x) = 1/(x - 5)?',
 'y = 5', 'x = -5', 'y = 0', 'x = 5',
 'D', 'A vertical asymptote occurs where the denominator equals zero. Setting x - 5 = 0 gives x = 5.'),

-- Medium (polynomial-rational)
('AP Pre Calculus', 'medium', 'polynomial-rational',
 'How many real zeros does f(x) = x^3 - 4x have?',
 '1', '2', '3', '4',
 'C', 'Factoring gives x(x^2 - 4) = x(x - 2)(x + 2), which has three real zeros: x = 0, x = 2, and x = -2.'),

('AP Pre Calculus', 'medium', 'polynomial-rational',
 'What is the horizontal asymptote of f(x) = (2x^2 + 1)/(x^2 - 3)?',
 'y = 0', 'y = 2', 'y = -3', 'No horizontal asymptote',
 'B', 'When the degrees of numerator and denominator are equal, the horizontal asymptote is the ratio of leading coefficients: 2/1 = 2, so y = 2.'),

-- Hard (polynomial-rational)
('AP Pre Calculus', 'hard', 'polynomial-rational',
 'The rational function f(x) = (x^2 - 9)/(x^2 - x - 6) has a hole at which point?',
 '(3, 0)', '(-3, 6/5)', '(3, 6/5)', '(-3, 0)',
 'C', 'Factoring gives (x - 3)(x + 3)/((x - 3)(x + 2)). The common factor (x - 3) cancels, creating a hole at x = 3. Substituting into the simplified form (x + 3)/(x + 2) gives 6/5, so the hole is at (3, 6/5).'),

-- ============================================================
-- EXPONENTIAL & LOGARITHMIC FUNCTIONS (5 questions)
-- ============================================================

-- Easy (exponential-logarithmic)
('AP Pre Calculus', 'easy', 'exponential-logarithmic',
 'What is log_2(32)?',
 '4', '5', '6', '8',
 'B', 'Since 2^5 = 32, we have log_2(32) = 5.'),

('AP Pre Calculus', 'easy', 'exponential-logarithmic',
 'If f(x) = 3^x, what is f(0)?',
 '0', '3', 'Undefined', '1',
 'D', 'Any nonzero base raised to the power 0 equals 1, so 3^0 = 1.'),

-- Medium (exponential-logarithmic)
('AP Pre Calculus', 'medium', 'exponential-logarithmic',
 'Solve for x: log(x) + log(x - 3) = 1, where log is base 10.',
 'x = -2', 'x = 5 and x = -2', 'x = 10', 'x = 5',
 'D', 'Using the product rule: log(x(x - 3)) = 1, so x^2 - 3x = 10, giving x^2 - 3x - 10 = 0. Factoring yields (x - 5)(x + 2) = 0. Since x must be positive and x - 3 must be positive, only x = 5 is valid.'),

('AP Pre Calculus', 'medium', 'exponential-logarithmic',
 'A population doubles every 6 years. If the initial population is 500, which expression gives the population after t years?',
 '500 + 2t', '500 * 2^(t/6)', '500 * 6^(t/2)', '1000^t',
 'B', 'Exponential growth with doubling time T uses the formula P = P_0 * 2^(t/T). With P_0 = 500 and T = 6, the expression is 500 * 2^(t/6).'),

-- Hard (exponential-logarithmic)
('AP Pre Calculus', 'hard', 'exponential-logarithmic',
 'If ln(a) = 2 and ln(b) = 3, what is ln(a^2 * sqrt(b))?',
 '7', '5', '5.5', '4',
 'C', 'Using logarithm properties: ln(a^2 * sqrt(b)) = 2·ln(a) + (1/2)·ln(b) = 2(2) + (1/2)(3) = 4 + 1.5 = 5.5.'),

-- ============================================================
-- TRIGONOMETRIC FUNCTIONS (5 questions)
-- ============================================================

-- Easy (trigonometric)
('AP Pre Calculus', 'easy', 'trigonometric',
 'What is the period of f(x) = sin(x)?',
 'pi', 'pi/2', '4*pi', '2*pi',
 'D', 'The standard sine function sin(x) completes one full cycle over an interval of 2*pi radians.'),

('AP Pre Calculus', 'easy', 'trigonometric',
 'What is cos(pi)?',
 '1', '0', '-1', 'Undefined',
 'C', 'On the unit circle, the angle pi radians (180 degrees) corresponds to the point (-1, 0), so cos(pi) = -1.'),

-- Medium (trigonometric)
('AP Pre Calculus', 'medium', 'trigonometric',
 'What is the amplitude of f(x) = -4sin(2x) + 1?',
 '-4', '4', '2', '1',
 'B', 'The amplitude is the absolute value of the coefficient in front of the sine function: |-4| = 4. The negative sign reflects the graph but does not change the amplitude.'),

('AP Pre Calculus', 'medium', 'trigonometric',
 'Which identity is equivalent to sin^2(x) + cos^2(x)?',
 '0', '1', 'sin(2x)', '2',
 'B', 'The Pythagorean identity states that sin^2(x) + cos^2(x) = 1 for all values of x. This follows directly from the unit circle definition of sine and cosine.'),

-- Hard (trigonometric)
('AP Pre Calculus', 'hard', 'trigonometric',
 'How many solutions does 2sin^2(x) - sin(x) - 1 = 0 have on the interval [0, 2*pi)?',
 '2', '4', '3', '1',
 'C', 'Factoring gives (2sin(x) + 1)(sin(x) - 1) = 0, so sin(x) = -1/2 or sin(x) = 1. sin(x) = 1 gives x = pi/2. sin(x) = -1/2 gives x = 7*pi/6 and x = 11*pi/6. That is 3 solutions total.'),

-- ============================================================
-- POLAR & PARAMETRIC FUNCTIONS (5 questions)
-- ============================================================

-- Easy (polar-parametric)
('AP Pre Calculus', 'easy', 'polar-parametric',
 'Convert the polar coordinate (4, pi/2) to rectangular (Cartesian) coordinates.',
 '(0, 4)', '(-4, 0)', '(4, 0)', '(0, -4)',
 'A', 'Using x = r*cos(theta) and y = r*sin(theta): x = 4*cos(pi/2) = 0 and y = 4*sin(pi/2) = 4, giving (0, 4).'),

('AP Pre Calculus', 'easy', 'polar-parametric',
 'For the parametric equations x = 2t and y = t + 1, what is y in terms of x?',
 'y = x/2 + 1', 'y = 2x + 1', 'y = x + 2', 'y = x - 1',
 'A', 'From x = 2t we get t = x/2. Substituting into y = t + 1 gives y = x/2 + 1.'),

-- Medium (polar-parametric)
('AP Pre Calculus', 'medium', 'polar-parametric',
 'What type of curve is described by the polar equation r = 3?',
 'A circle of radius 3 centered at the origin', 'A line through the origin', 'A spiral', 'A cardioid',
 'A', 'When r equals a constant, every point is the same distance from the origin regardless of the angle theta, forming a circle centered at the origin with that radius.'),

('AP Pre Calculus', 'medium', 'polar-parametric',
 'A particle moves along the parametric path x = cos(t), y = sin(t) for 0 <= t <= 2*pi. What shape does it trace?',
 'An ellipse', 'A parabola', 'A line segment', 'A unit circle',
 'D', 'Since cos^2(t) + sin^2(t) = 1, the point (cos(t), sin(t)) always lies on the unit circle x^2 + y^2 = 1, tracing the full circle as t goes from 0 to 2*pi.'),

-- Hard (polar-parametric)
('AP Pre Calculus', 'hard', 'polar-parametric',
 'Convert the rectangular equation x^2 + y^2 = 6y to polar form.',
 'r = 6sin(theta)', 'r = 6cos(theta)', 'r^2 = 6', 'r = 3',
 'A', 'Substituting x^2 + y^2 = r^2 and y = r*sin(theta) gives r^2 = 6r*sin(theta). Dividing both sides by r (for r not equal to 0) yields r = 6sin(theta).');
