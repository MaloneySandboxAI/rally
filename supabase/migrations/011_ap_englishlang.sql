-- 011_ap_englishlang.sql
-- 20 AP English Language and Composition questions
-- Subtopics: rhetorical-analysis, argument-evidence, synthesis, style-tone (5 each)
-- Difficulty spread per subtopic: 2 easy, 2 medium, 1 hard
-- Answer distribution: 5A, 5B, 5C, 5D

INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation)
VALUES

-- ============================================================
-- RHETORICAL ANALYSIS (5 questions: 2 easy, 2 medium, 1 hard)
-- ============================================================

-- 1 (easy) — correct: A
(
  'AP English Language', 'easy', 'rhetorical-analysis',
  'A speaker at a town hall says: "We must act now—not tomorrow, not next week, but now—before our schools crumble around our children." Which rhetorical device is most prominent in this statement?',
  'Repetition for urgency',
  'Appeal to authority',
  'Understatement',
  'Ad hominem attack',
  'A',
  'The speaker repeats "now" and uses escalating phrasing to create a sense of immediacy, making repetition the dominant device.'
),

-- 2 (easy) — correct: B
(
  'AP English Language', 'easy', 'rhetorical-analysis',
  'When a writer includes statistics from a medical journal to support a claim about public health, which rhetorical appeal is primarily being used?',
  'Pathos',
  'Logos',
  'Ethos',
  'Kairos',
  'B',
  'Citing factual data and statistics from a credible source is an appeal to logic (logos), as it relies on evidence and reason.'
),

-- 3 (medium) — correct: C
(
  'AP English Language', 'medium', 'rhetorical-analysis',
  'Consider the passage: "The governor, a Harvard-educated economist who balanced three state budgets, urged residents to trust her fiscal plan." The description of the governor''s background primarily serves to establish which appeal?',
  'Pathos, by evoking sympathy for her hard work',
  'Logos, by presenting a logical argument',
  'Ethos, by building the speaker''s credibility',
  'Kairos, by emphasizing timeliness',
  'C',
  'Listing credentials and achievements establishes the speaker''s authority and trustworthiness, which is a direct appeal to ethos.'
),

-- 4 (medium) — correct: D
(
  'AP English Language', 'medium', 'rhetorical-analysis',
  'A columnist writes: "If we ban this book today, what stops us from banning newspapers tomorrow and burning libraries next year?" This sentence is an example of which rhetorical strategy?',
  'Circular reasoning',
  'False equivalence',
  'Straw man argument',
  'Slippery slope',
  'D',
  'The writer suggests that one action will inevitably lead to increasingly extreme consequences, which is the hallmark of a slippery slope argument.'
),

-- 5 (hard) — correct: A
(
  'AP English Language', 'hard', 'rhetorical-analysis',
  'An essayist writes: "Some argue that standardized testing ensures fairness. And indeed, there is a certain equality in giving every student the same blunt instrument with which to demonstrate the full range of human intellect." The author''s strategy here is best described as:',
  'Using concession followed by verbal irony to undermine the opposing view',
  'Presenting a balanced analysis that validates both sides equally',
  'Employing an analogy to strengthen the case for standardized testing',
  'Relying on emotional appeal to generate sympathy for students',
  'A',
  'The author appears to concede the fairness argument but then uses the ironic phrase "blunt instrument" to subtly mock the position, combining concession with verbal irony.'
),

-- ============================================================
-- ARGUMENT & EVIDENCE (5 questions: 2 easy, 2 medium, 1 hard)
-- ============================================================

-- 6 (easy) — correct: D
(
  'AP English Language', 'easy', 'argument-evidence',
  'Which of the following would be considered a primary source in an argument about working conditions in early 20th-century factories?',
  'A modern historian''s analysis of industrialization',
  'A textbook chapter on the Progressive Era',
  'A documentary film released in 2020',
  'A diary entry written by a factory worker in 1905',
  'D',
  'A diary from someone who experienced the conditions firsthand is a primary source, while analyses, textbooks, and later documentaries are secondary or tertiary sources.'
),

-- 7 (easy) — correct: C
(
  'AP English Language', 'easy', 'argument-evidence',
  'A writer argues: "Everyone I know prefers online learning, so it must be better for all students." This reasoning is flawed because it relies on:',
  'A false dilemma',
  'Circular reasoning',
  'Anecdotal evidence mistaken for universal proof',
  'An appeal to authority',
  'C',
  'Generalizing from personal acquaintances to all students is a classic anecdotal evidence fallacy; a small, non-representative sample cannot support a universal claim.'
),

-- 8 (medium) — correct: B
(
  'AP English Language', 'medium', 'argument-evidence',
  'In a persuasive essay, a writer first acknowledges that social media can spread misinformation, then argues that it remains a net positive for democratic participation. This structure is best described as:',
  'Refutation followed by a counterexample',
  'Concession and rebuttal',
  'Cause and effect analysis',
  'Compare and contrast organization',
  'B',
  'Acknowledging a valid opposing point (concession) before presenting one''s own stronger argument (rebuttal) is a classic concession-and-rebuttal structure.'
),

-- 9 (medium) — correct: A
(
  'AP English Language', 'medium', 'argument-evidence',
  'A researcher claims that a new reading program improves literacy rates and cites a study of 3,000 students across 40 schools. A critic responds that all 40 schools were in affluent suburbs. The critic is primarily challenging the:',
  'External validity of the evidence',
  'Moral authority of the researcher',
  'Timeliness of the study',
  'Definition of literacy used in the study',
  'A',
  'By pointing out the narrow demographic sample, the critic questions whether the results can be generalized to other populations, which is a challenge to external validity.'
),

-- 10 (hard) — correct: B
(
  'AP English Language', 'hard', 'argument-evidence',
  'An editorial argues: "City budgets prove we value parking lots over parks: last year, $12 million went to garage maintenance while green-space funding was cut to $2 million. Meanwhile, a pediatric health study links childhood obesity to a lack of outdoor play areas." The writer combines these two pieces of evidence primarily to:',
  'Demonstrate that city officials are personally corrupt',
  'Connect a fiscal policy decision to a concrete public health consequence',
  'Prove that parking garages are the sole cause of childhood obesity',
  'Suggest that all city spending should be redirected to parks',
  'B',
  'The budget data establishes the policy choice, and the health study shows its real-world impact; together they link fiscal priorities to a tangible consequence without claiming sole causation.'
),

-- ============================================================
-- SYNTHESIS (5 questions: 2 easy, 2 medium, 1 hard)
-- ============================================================

-- 11 (easy) — correct: D
(
  'AP English Language', 'easy', 'synthesis',
  'When writing a synthesis essay, the primary goal is to:',
  'Summarize each source in equal detail without connecting them',
  'Choose the single best source and argue exclusively from it',
  'List every source alphabetically and paraphrase each one',
  'Combine information from multiple sources to develop a coherent argument',
  'D',
  'Synthesis requires integrating ideas from several sources into a unified argument, not merely summarizing or ranking individual sources.'
),

-- 12 (easy) — correct: C
(
  'AP English Language', 'easy', 'synthesis',
  'Source 1 reports that volunteer rates among teens have risen 15% since 2019. Source 2 quotes a school principal saying community service requirements were added in 2019. A student synthesizing these sources should:',
  'Ignore Source 2 because it is an opinion',
  'Argue that Source 1 disproves Source 2',
  'Use Source 2 to offer a possible explanation for the trend in Source 1',
  'Present each source in its own paragraph with no connection',
  'C',
  'Effective synthesis connects sources: Source 2 provides a plausible cause for the statistical trend reported in Source 1.'
),

-- 13 (medium) — correct: A
(
  'AP English Language', 'medium', 'synthesis',
  'A synthesis essay on renewable energy uses three sources: a government report on solar costs, an opinion column favoring nuclear power, and a scientific study on wind-farm efficiency. How should a writer best handle the opinion column?',
  'Incorporate it as a counterargument and evaluate its reasoning against the data from the other sources',
  'Exclude it entirely because opinion pieces are never valid in academic writing',
  'Place it first to set the emotional tone for the essay',
  'Quote it without comment and let readers decide its merit',
  'A',
  'Strong synthesis acknowledges differing viewpoints and assesses them critically in relation to other evidence, rather than dismissing or uncritically accepting them.'
),

-- 14 (medium) — correct: D
(
  'AP English Language', 'medium', 'synthesis',
  'Which of the following best demonstrates effective source integration in a synthesis essay?',
  '"Source A says screen time is bad. Source B says screen time is good. Source C says it depends."',
  '"According to Source A, teens spend too much time on devices (Source A, p. 4)."',
  '"I personally believe that screen time is harmful, and many sources agree."',
  '"While Source A links excessive screen time to sleep disruption, Source B notes that educational apps can improve literacy—suggesting the debate hinges on how, not whether, teens use technology."',
  'D',
  'Option D weaves two sources into a single analytical point with a clear interpretive claim, which is the hallmark of skilled synthesis.'
),

-- 15 (hard) — correct: B
(
  'AP English Language', 'hard', 'synthesis',
  'A student is writing a synthesis essay on public transportation funding. Source 1 is a transit authority budget showing declining ridership. Source 2 is a sociological study arguing that low-income workers depend on buses. Source 3 is an editorial calling for fare increases. The most sophisticated use of these sources would be to:',
  'Agree with all three sources equally to avoid taking a position',
  'Argue that Source 1''s ridership data must be interpreted through Source 2''s equity lens before evaluating Source 3''s proposal',
  'Dismiss Source 3 as biased and rely only on Sources 1 and 2',
  'Summarize each source in chronological order and let the reader draw conclusions',
  'B',
  'The strongest synthesis creates a framework where sources inform each other: using equity data to contextualize ridership trends produces a richer evaluation of the fare-increase proposal.'
),

-- ============================================================
-- STYLE & TONE (5 questions: 2 easy, 2 medium, 1 hard)
-- ============================================================

-- 16 (easy) — correct: C
(
  'AP English Language', 'easy', 'style-tone',
  'Which word best describes the tone of the following sentence? "The committee, after months of tireless deliberation, graciously decided to grant the public an extra five minutes of comment time."',
  'Celebratory',
  'Neutral',
  'Sarcastic',
  'Mournful',
  'C',
  'Words like "tireless deliberation" and "graciously" for such a trivial concession create an ironic contrast, signaling a sarcastic tone.'
),

-- 17 (easy) — correct: B
(
  'AP English Language', 'easy', 'style-tone',
  'A writer shifts from formal academic language to short, punchy sentences and colloquial expressions. This shift most likely serves to:',
  'Demonstrate the writer''s lack of vocabulary',
  'Change the pace and make the writing more accessible or urgent',
  'Signal that the argument has ended',
  'Indicate a factual error in the previous section',
  'B',
  'Deliberate shifts from formal to informal diction typically change the rhythm and draw readers in, creating urgency or accessibility rather than indicating a mistake.'
),

-- 18 (medium) — correct: D
(
  'AP English Language', 'medium', 'style-tone',
  'Consider: "The old bridge stood over the river like a crooked spine, bearing the weight of a thousand daily crossings without complaint." The figurative language in this sentence primarily creates a tone that is:',
  'Humorous and lighthearted',
  'Aggressive and confrontational',
  'Clinical and detached',
  'Reverent and sympathetic',
  'D',
  'Personifying the bridge as enduring weight "without complaint" and comparing it to a spine gives it a dignified, almost human resilience, creating a reverent and sympathetic tone.'
),

-- 19 (medium) — correct: A
(
  'AP English Language', 'medium', 'style-tone',
  'An author writes a passage using predominantly long, complex sentences with embedded clauses and Latin-derived vocabulary. This stylistic choice most likely reflects an intent to:',
  'Convey intellectual authority and formality',
  'Appeal to a young, casual audience',
  'Speed up the reader''s pace through the text',
  'Simplify a complicated topic for general readers',
  'A',
  'Long, syntactically complex sentences with elevated diction signal formality and scholarly authority, positioning the writer as an expert addressing a literate audience.'
),

-- 20 (hard) — correct: C
(
  'AP English Language', 'hard', 'style-tone',
  'A political speech alternates between intimate second-person address ("you deserve better") and sweeping collective language ("we, as a nation, must rise"). This oscillation between "you" and "we" primarily functions to:',
  'Confuse the audience about who is responsible for action',
  'Demonstrate the speaker''s grammatical range',
  'Build personal connection while simultaneously fostering collective identity',
  'Shift blame from the speaker to the audience',
  'C',
  'Using "you" creates individual rapport and empathy, while "we" unifies the audience into a shared cause; alternating between them forges both personal and communal bonds.'
);
