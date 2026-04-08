-- ============================================================
-- Migration 007: Add harder diagnostic-level questions
-- These are medium/hard questions designed to genuinely test
-- student knowledge at SAT difficulty level.
-- ============================================================

-- Reset sequence
SELECT setval(pg_get_serial_sequence('sat_questions', 'id'), COALESCE((SELECT MAX(id) FROM sat_questions), 0) + 1, false);

-- ===================== ALGEBRA — HARDER =====================

INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
-- Linear Equations (hard)
('Algebra', 'hard', 'linear-equations', 'The line 2x - 3y = 12 is reflected across the y-axis. What is the equation of the reflected line?', '-2x - 3y = 12', '2x + 3y = 12', '-2x + 3y = 12', '2x - 3y = -12', 'A', 'Reflecting across the y-axis replaces x with -x: 2(-x) - 3y = 12 → -2x - 3y = 12.'),
('Algebra', 'hard', 'linear-equations', 'A taxi charges a flat fee plus a per-mile rate. A 5-mile ride costs $14 and a 12-mile ride costs $24.50. What is the flat fee?', '$3.50', '$4.00', '$4.50', '$6.50', 'D', 'Let f = flat fee, r = rate. f + 5r = 14 and f + 12r = 24.50. Subtracting: 7r = 10.50, so r = 1.50. Then f = 14 - 5(1.50) = 14 - 7.50 = $6.50.'),
('Algebra', 'medium', 'linear-equations', 'If the lines y = (k+1)x + 3 and y = 2kx - 1 are parallel, what is k?', '1', '-1', '1/2', '2', 'A', 'Parallel lines have equal slopes: k + 1 = 2k → k = 1.'),

-- Systems of Equations (hard)
('Algebra', 'hard', 'systems-of-equations', 'A chemist mixes a 40% acid solution with a 70% acid solution to get 60 liters of a 50% solution. How many liters of the 40% solution are needed?', '20', '30', '40', '45', 'C', 'Let x = liters of 40%. Then 0.40x + 0.70(60 - x) = 0.50(60). 0.40x + 42 - 0.70x = 30. -0.30x = -12. x = 40.'),
('Algebra', 'hard', 'systems-of-equations', 'The system ax + 2y = 5 and 3x + ay = 7 has no solution when a equals:', '√6', '-√6', '√6 or -√6', '6', 'C', 'No solution when determinant = 0 and not proportional: a·a - 2·3 = 0 → a² = 6 → a = ±√6. Check: 5/7 ≠ a/3 for these values, confirming no solution.'),
('Algebra', 'medium', 'systems-of-equations', 'A movie theater sold 200 tickets. Adult tickets cost $12 and child tickets cost $8. Total revenue was $2,000. How many adult tickets were sold?', '80', '100', '120', '150', 'B', 'Let a = adult. a + c = 200 and 12a + 8c = 2000. From first: c = 200 - a. Substitute: 12a + 8(200-a) = 2000 → 4a = 400 → a = 100.'),

-- Quadratics (hard)
('Algebra', 'hard', 'quadratics', 'The graph of y = ax² + bx + c passes through (0, 5), (1, 2), and (2, 3). What is the value of a?', '1', '2', '3', '4', 'B', 'From (0,5): c = 5. From (1,2): a + b + 5 = 2, so a + b = -3. From (2,3): 4a + 2b + 5 = 3, so 4a + 2b = -2. From a + b = -3: b = -3 - a. Substitute: 4a + 2(-3-a) = -2 → 2a - 6 = -2 → a = 2.'),
('Algebra', 'hard', 'quadratics', 'If the sum of the roots of 3x² - kx + 12 = 0 is equal to the product of the roots, what is k?', '12', '36', '4', '6', 'A', 'By Vieta''s: sum = k/3, product = 12/3 = 4. Setting equal: k/3 = 4, so k = 12.'),
('Algebra', 'medium', 'quadratics', 'A ball is thrown upward with height h(t) = -16t² + 48t + 5. What is its maximum height?', '41 feet', '36 feet', '53 feet', '48 feet', 'A', 'Max at t = -48/(2·(-16)) = 1.5. h(1.5) = -16(2.25) + 48(1.5) + 5 = -36 + 72 + 5 = 41.'),

-- Functions (hard)
('Algebra', 'hard', 'functions', 'If f(x) = (2x + 1)/(x - 3), what is f⁻¹(x)?', '(3x + 1)/(x - 2)', '(x - 3)/(2x + 1)', '(3x - 1)/(x + 2)', '(x + 1)/(2x - 3)', 'A', 'Set y = (2x+1)/(x-3). Solve for x: y(x-3) = 2x+1 → yx - 3y = 2x + 1 → x(y-2) = 3y+1 → x = (3y+1)/(y-2). So f⁻¹(x) = (3x+1)/(x-2).'),
('Algebra', 'hard', 'functions', 'Let f(x) = x² - 4x + 3. For what values of x is f(x) ≤ 0?', 'x ≤ 1 or x ≥ 3', '1 ≤ x ≤ 3', '-1 ≤ x ≤ 3', 'x ≤ -1 or x ≥ 3', 'B', 'Factor: (x-1)(x-3) ≤ 0. The parabola opens up, so it''s ≤ 0 between roots: 1 ≤ x ≤ 3.'),

-- Inequalities (hard)
('Algebra', 'hard', 'inequalities', 'Solve: |3x - 2| ≥ 7', 'x ≤ -5/3 or x ≥ 3', '-5/3 ≤ x ≤ 3', 'x ≤ -3 or x ≥ 5/3', 'x ≥ 3 only', 'A', '3x - 2 ≥ 7 → x ≥ 3, or 3x - 2 ≤ -7 → x ≤ -5/3.'),
('Algebra', 'hard', 'inequalities', 'If 0 < a < 1, which inequality is true?', 'a² > a', 'a² < a', 'a² = a', '1/a < 1', 'B', 'For 0 < a < 1, multiplying both sides of a < 1 by a (positive): a² < a.');

-- ===================== READING — HARDER =====================

INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
-- Main Idea (hard)
('Reading Comprehension', 'hard', 'main-idea', 'A passage discusses how the "Green Revolution" of the 1960s-70s dramatically increased crop yields through high-yield varieties, but also led to soil degradation, water depletion, and loss of traditional farming knowledge. The author''s central argument is that:', 'The Green Revolution was a failure', 'Technological solutions to food scarcity can create new systemic problems', 'Traditional farming is superior to modern agriculture', 'Governments should not invest in agricultural research', 'B', 'The author acknowledges benefits (increased yields) while arguing the approach created systemic problems — a nuanced "unintended consequences" argument, not a blanket rejection.'),
('Reading Comprehension', 'hard', 'main-idea', 'An essay contrasts two approaches to criminal justice: retributive (punishment-focused) and restorative (reconciliation-focused). The author presents evidence for both but concludes that "a just society must address the needs of victims without perpetuating cycles of harm." The author most likely advocates for:', 'Eliminating all forms of punishment', 'A restorative approach that incorporates victim input', 'Harsher sentences for violent crimes', 'Abolishing the court system', 'B', 'The conclusion balances "addressing victim needs" (not ignoring crime) with "not perpetuating harm" (not purely punitive), suggesting a restorative model with victim voice.'),

-- Evidence-Based (hard)
('Reading Comprehension', 'hard', 'evidence-based', 'A researcher claims that social media use causes depression in teenagers. Study A found a correlation (r=0.3) between screen time and depression scores. Study B assigned teens randomly to reduce social media use for 3 weeks and found no change in depression. Which statement best evaluates the evidence?', 'Study A proves social media causes depression', 'Study B disproves any relationship between social media and depression', 'Study A shows correlation while Study B''s experimental design provides stronger evidence against causation', 'Both studies are equally valid and their contradictory results are inconclusive', 'C', 'Study B (randomized experiment) is methodologically stronger for testing causation. Study A (correlational) cannot establish causation. Together, they suggest the correlation may be due to other factors.'),
('Reading Comprehension', 'hard', 'evidence-based', 'An author argues that standardized testing perpetuates inequality. An opponent counters that test scores correlate with college success. Which response would most effectively address the opponent''s point?', 'Correlation with college success doesn''t address whether the tests create barriers for disadvantaged students', 'Standardized tests are too easy', 'College success isn''t important', 'All correlations are meaningless', 'A', 'This response accepts the data while redirecting to the equity argument — the tests may predict success AND still create unfair barriers, making the correlation irrelevant to the fairness question.'),

-- Vocabulary in Context (hard)
('Reading Comprehension', 'hard', 'vocabulary-in-context', '"The committee''s findings were qualified by numerous caveats about data limitations." As used here, "qualified" most nearly means:', 'Made eligible', 'Restricted or limited', 'Certified', 'Enhanced', 'B', 'In academic writing, "qualified" means limited or modified by conditions — the findings came with restrictions, not endorsements.'),
('Reading Comprehension', 'hard', 'vocabulary-in-context', '"The prosecutor mounted a compelling case, but the defense''s rebuttal was so trenchant that it shifted the jury''s sympathies." As used here, "trenchant" most nearly means:', 'Lengthy', 'Emotional', 'Incisive and effective', 'Hostile and angry', 'C', '"Trenchant" means sharp, penetrating, and effective in argument — it''s about intellectual force, not emotional intensity.'),

-- Inference (hard)
('Reading Comprehension', 'hard', 'inference', 'A passage notes: "While Company X''s revenue grew 15% annually for five years, its stock price remained flat. Meanwhile, the CEO''s compensation tripled." The author most likely includes this detail to suggest:', 'The CEO is highly skilled at growing revenue', 'Revenue growth alone does not indicate shareholder value, and executive compensation may be misaligned with performance', 'The stock market is unpredictable', 'Company X should be valued more highly', 'B', 'The juxtaposition of flat stock price (shareholder returns) against tripling CEO pay despite strong revenue growth implies a disconnect between executive compensation and actual value creation.'),
('Reading Comprehension', 'hard', 'inference', '"The museum''s new exhibit on indigenous art was curated by the museum''s European art department rather than in consultation with indigenous communities." This detail implies the author believes:', 'The exhibit will be historically accurate', 'The curatorial approach may lack authentic cultural perspective', 'European art departments are unqualified', 'Indigenous art should not be displayed in museums', 'B', 'The author highlights WHO curated (European department) versus WHO was excluded (indigenous communities), implying concern about authenticity and representation without making an extreme claim.');

-- ===================== GRAMMAR — HARDER =====================

INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
-- Sentence Structure (hard)
('Grammar', 'hard', 'sentence-structure', 'Which revision eliminates the dangling modifier? "Having studied all night, the exam seemed easy."', 'Having studied all night, the exam seemed easy to me.', 'Having studied all night, I found the exam easy.', 'The exam, having studied all night, seemed easy.', 'The exam seemed easy, having studied all night.', 'B', 'The modifier "Having studied all night" must attach to the person who studied. Only B makes "I" the subject of the main clause.'),
('Grammar', 'hard', 'sentence-structure', '"The report, which the committee spent three months drafting and which was reviewed by external auditors, ___." Which correctly completes this sentence?', 'recommending sweeping changes', 'it recommended sweeping changes', 'recommended sweeping changes', 'that recommended sweeping changes', 'C', 'The subject is "The report," and after the nonessential clause, we need a main verb: "recommended."'),

-- Punctuation (hard)
('Grammar', 'hard', 'punctuation', 'Which sentence uses the semicolon correctly?', 'The study had three phases; planning, execution, and analysis.', 'The results were clear; however, the methodology was flawed.', 'She was tired; and hungry after the long hike.', 'The project; which took two years; was finally complete.', 'B', 'A semicolon correctly joins two independent clauses. B uses it before a conjunctive adverb (however). A should use a colon before a list, C shouldn''t have a semicolon before "and," and D should use commas or dashes.'),
('Grammar', 'hard', 'punctuation', '"The three countries — France, Germany, and Italy — signed the agreement; the other members abstained." This sentence contains:', 'A punctuation error with the dashes', 'A punctuation error with the semicolon', 'No punctuation errors', 'A missing comma after "members"', 'C', 'The dashes correctly set off a parenthetical list, and the semicolon correctly separates two independent clauses.'),

-- Subject-Verb Agreement (hard)
('Grammar', 'hard', 'subject-verb-agreement', '"The number of students who ___ graduated has increased." Choose the correct verb:', 'has', 'have', 'is', 'was', 'B', '"Who" refers to "students" (plural), so the verb in the relative clause is "have." Note: "The number" takes a singular main verb ("has increased"), but the relative clause follows "students."'),
('Grammar', 'hard', 'subject-verb-agreement', '"Either the manager or the employees ___ responsible for the error." Choose the correct verb:', 'is', 'are', 'was', 'has been', 'B', 'With "either...or," the verb agrees with the nearest subject. "Employees" is plural, so "are."'),

-- Pronoun Clarity (hard)
('Grammar', 'hard', 'pronoun-clarity', '"The researchers presented their findings to the board, but they were unconvinced." What is the issue?', 'No issue — the sentence is correct', '"they" ambiguously refers to either the researchers or the board', '"their" should be "the"', 'The sentence is a fragment', 'B', '"They" could refer to the researchers or the board. The sentence should clarify: "but the board was unconvinced" or "but the board members were unconvinced."'),

-- Transitions (hard)
('Grammar', 'hard', 'transitions', '"The city invested $50 million in public transit. ___, ridership declined by 15% over the following year." Choose the best transition:', 'Consequently', 'Paradoxically', 'Similarly', 'In other words', 'B', '"Paradoxically" signals that the result (declining ridership) contradicts what you''d expect from a large investment — the relationship is surprising, not causal or parallel.'),
('Grammar', 'hard', 'transitions', '"The initial data supported the hypothesis. ___, subsequent experiments with larger sample sizes failed to replicate the findings, casting doubt on the original conclusions." Choose the best transition:', 'Furthermore', 'In addition', 'However', 'For instance', 'C', '"However" introduces a contrast — the later experiments contradict the initial data.');

-- ===================== DATA & STATISTICS — HARDER =====================

INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
-- Tables and Graphs (hard)
('Data & Statistics', 'hard', 'tables-and-graphs', 'A survey of 500 people shows: 60% support Policy A, with a margin of error of ±4%. A politician claims "a majority supports Policy A." Is this claim justified?', 'Yes, because 60% is a majority', 'No, because the margin of error is too large', 'Yes, because even the lower bound (56%) exceeds 50%', 'No, because 500 people is too small a sample', 'C', 'With 60% ± 4%, the range is 56%-64%. Since even the lower bound exceeds 50%, we can be confident a majority supports the policy.'),
('Data & Statistics', 'hard', 'tables-and-graphs', 'Two graphs show the same data: Graph A uses a y-axis from 0-100, Graph B uses 45-55. A company''s satisfaction score changed from 48% to 52%. Which graph would a marketing team prefer to use in a presentation?', 'Graph A, because it shows the full context', 'Graph B, because the improvement appears more dramatic', 'Either graph, since they show the same data', 'Graph A, because it makes the change look bigger', 'B', 'Graph B''s truncated y-axis makes the 4-point change appear much larger visually. Marketing teams often prefer graphs that emphasize improvement, even if the scale is misleading.'),

-- Probability (hard)
('Data & Statistics', 'hard', 'probability', 'In a class of 30 students, 18 play soccer, 15 play basketball, and 10 play both. If a student is chosen at random, what is the probability they play neither sport?', '7/30', '3/30', '10/30', '23/30', 'A', 'Soccer or Basketball = 18 + 15 - 10 = 23. Neither = 30 - 23 = 7. Probability = 7/30.'),
('Data & Statistics', 'hard', 'probability', 'A medical test has a 95% true positive rate and a 3% false positive rate. If 1% of the population has the disease, what is the approximate probability that a person who tests positive actually has the disease?', '95%', '76%', '24%', '97%', 'C', 'P(disease|positive) = P(pos|disease)·P(disease) / P(pos) = (0.95·0.01) / (0.95·0.01 + 0.03·0.99) = 0.0095/0.0392 ≈ 24%. This is Bayes'' theorem — most positives are false positives when the disease is rare.'),

-- Mean Median Mode (hard)
('Data & Statistics', 'hard', 'mean-median-mode', 'A teacher curves a test by adding 8 points to every score. How does this affect the mean and standard deviation?', 'Both increase by 8', 'Mean increases by 8, standard deviation stays the same', 'Both stay the same', 'Mean stays the same, standard deviation increases by 8', 'B', 'Adding a constant shifts all values equally: mean increases by 8. Standard deviation measures spread, which doesn''t change when all values shift by the same amount.'),
('Data & Statistics', 'hard', 'mean-median-mode', 'A dataset has a mean of 75 and a standard deviation of 5. If every value is multiplied by 2 then increased by 10, what are the new mean and standard deviation?', 'Mean = 160, SD = 10', 'Mean = 160, SD = 20', 'Mean = 150, SD = 10', 'Mean = 85, SD = 10', 'A', 'Multiplying by 2: new mean = 150, new SD = 10. Adding 10: new mean = 160, SD stays 10. Multiplying scales both mean and SD; adding only shifts the mean.'),

-- Scatterplots (hard)
('Data & Statistics', 'hard', 'scatterplots', 'A scatterplot shows a strong positive linear relationship (r = 0.89) between hours studied and exam scores. A student studied 20 hours and scored 95. Another student studied 2 hours and scored 88. The second student is best described as:', 'An outlier', 'A residual', 'A confounding variable', 'A lurking variable', 'A', 'An outlier is a data point that doesn''t follow the general pattern. Scoring 88 with only 2 hours of study is far above what the trend line would predict.'),
('Data & Statistics', 'hard', 'scatterplots', 'A researcher finds r = -0.85 between daily temperature and hot chocolate sales. Adding a data point for a 100°F day with 0 hot chocolate sales would most likely:', 'Increase |r| because it follows the trend', 'Decrease |r| because it''s an extreme point', 'Have no effect on r', 'Change the sign of r', 'A', 'The point (100°F, 0 sales) follows the negative trend — high temperature, low sales. Since it aligns with the existing pattern, it reinforces the correlation and |r| stays the same or slightly increases.');
