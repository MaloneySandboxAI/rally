-- 010: AP Biology starter questions (20 questions, 4 subtopics)
-- Subtopics: cell-structure, genetics, evolution, ecology
-- Balanced answer positions: 5 A, 5 B, 5 C, 5 D correct

INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES

-- ============================================================
-- CELL STRUCTURE & FUNCTION (5 questions)
-- ============================================================

-- Easy (cell-structure)
('AP Biology', 'easy', 'cell-structure',
 'Which organelle is responsible for producing ATP, the main energy currency of the cell?',
 'Ribosome', 'Mitochondria', 'Golgi apparatus', 'Endoplasmic reticulum',
 'B', 'Mitochondria are the powerhouse of the cell. They carry out cellular respiration, converting glucose and oxygen into ATP through the electron transport chain and oxidative phosphorylation.'),

('AP Biology', 'easy', 'cell-structure',
 'What structure surrounds the cell and controls what enters and exits?',
 'Cell wall', 'Nucleus', 'Plasma membrane', 'Cytoplasm',
 'C', 'The plasma membrane (cell membrane) is a selectively permeable phospholipid bilayer that regulates the movement of substances into and out of the cell through passive and active transport.'),

-- Medium (cell-structure)
('AP Biology', 'medium', 'cell-structure',
 'A cell is placed in a hypertonic solution. Which of the following will most likely occur?',
 'The cell will swell and possibly lyse', 'Water will move out of the cell by osmosis, causing it to shrink', 'The cell will remain the same size', 'Solutes will move into the cell by diffusion',
 'B', 'In a hypertonic solution the solute concentration outside the cell is higher than inside. Water moves out of the cell by osmosis (from high to low water concentration), causing the cell to shrink or crenate.'),

-- Hard (cell-structure)
('AP Biology', 'hard', 'cell-structure',
 'Which of the following best explains why the inner mitochondrial membrane is highly folded into cristae?',
 'To increase the surface area available for the electron transport chain and ATP synthase', 'To store calcium ions for cell signaling', 'To provide attachment sites for ribosomes during translation', 'To separate the intermembrane space from the cytoplasm',
 'A', 'The cristae dramatically increase the surface area of the inner mitochondrial membrane, allowing more copies of electron transport chain complexes and ATP synthase to be embedded. This maximizes the rate of oxidative phosphorylation and ATP production.'),

('AP Biology', 'hard', 'cell-structure',
 'A researcher observes that a drug blocks the formation of clathrin-coated pits on the plasma membrane. Which cellular process would be most directly inhibited?',
 'Exocytosis of neurotransmitters', 'Active transport of sodium ions', 'Receptor-mediated endocytosis', 'Facilitated diffusion of glucose',
 'C', 'Clathrin-coated pits are essential for receptor-mediated endocytosis. When ligands bind to receptors on the cell surface, clathrin proteins assemble on the cytoplasmic side to form a coated pit that pinches off as a vesicle, bringing specific molecules into the cell.'),

-- ============================================================
-- GENETICS & HEREDITY (5 questions)
-- ============================================================

-- Easy (genetics)
('AP Biology', 'easy', 'genetics',
 'In a monohybrid cross between two heterozygous parents (Aa × Aa), what fraction of offspring are expected to show the dominant phenotype?',
 '3/4', '1/4', '1/2', '2/4',
 'A', 'A cross of Aa × Aa produces offspring in a 1:2:1 genotypic ratio (AA:Aa:aa). Since both AA and Aa display the dominant phenotype, 3 out of 4 (3/4) offspring are expected to show the dominant trait.'),

('AP Biology', 'easy', 'genetics',
 'What molecule carries the genetic instructions from DNA in the nucleus to the ribosome for protein synthesis?',
 'tRNA', 'rRNA', 'mRNA', 'DNA polymerase',
 'C', 'Messenger RNA (mRNA) is transcribed from DNA in the nucleus and then travels to ribosomes in the cytoplasm, where it serves as the template for translation (protein synthesis).'),

-- Medium (genetics)
('AP Biology', 'medium', 'genetics',
 'A geneticist crosses a red-flowered plant (RR) with a white-flowered plant (rr). All F1 offspring are pink. This pattern of inheritance is best described as:',
 'Complete dominance', 'Codominance', 'Epistasis', 'Incomplete dominance',
 'D', 'Incomplete dominance occurs when the heterozygous phenotype is intermediate between the two homozygous phenotypes. Here, the Rr heterozygotes are pink rather than red or white, showing a blending of the parental phenotypes.'),

-- Hard (genetics)
('AP Biology', 'hard', 'genetics',
 'A woman who is a carrier for hemophilia A (X-linked recessive) has children with an unaffected man. What is the probability that their first son will have hemophilia?',
 '0%', '1/2', '1/4', '100%',
 'B', 'The carrier mother is X^H X^h and the father is X^H Y. Sons receive the Y from their father and one X from their mother. There is a 1/2 chance a son receives X^h (and has hemophilia) and a 1/2 chance he receives X^H (and is unaffected).'),

('AP Biology', 'hard', 'genetics',
 'In an operon model, a mutation that makes the repressor protein unable to bind to the operator would result in:',
 'No transcription of the structural genes', 'Constitutive (continuous) expression of the structural genes', 'Increased binding of RNA polymerase to the terminator', 'Degradation of the mRNA before translation',
 'B', 'If the repressor cannot bind the operator, there is nothing to block RNA polymerase from transcribing the structural genes. This leads to constitutive expression regardless of whether the inducer molecule is present.'),

-- ============================================================
-- EVOLUTION & NATURAL SELECTION (5 questions)
-- ============================================================

-- Easy (evolution)
('AP Biology', 'easy', 'evolution',
 'Which of the following is required for natural selection to occur in a population?',
 'All individuals must be genetically identical', 'Heritable variation in traits that affect survival and reproduction', 'The population must be very small', 'Mutations must occur every generation',
 'B', 'Natural selection requires heritable variation in traits that influence an organism''s fitness (survival and reproductive success). Without variation, there is no differential survival, and without heritability, advantageous traits cannot be passed to offspring.'),

-- Medium (evolution)
('AP Biology', 'medium', 'evolution',
 'A population of beetles living on a volcanic island has darker coloring than the mainland population. Gene flow between the two populations is prevented by the ocean. This is an example of:',
 'Sympatric speciation', 'Allopatric speciation', 'Artificial selection', 'Balanced polymorphism',
 'B', 'Allopatric speciation occurs when a geographic barrier (here, the ocean) separates populations, preventing gene flow. Over time, the isolated populations diverge due to natural selection, genetic drift, and mutation, potentially becoming separate species.'),

('AP Biology', 'medium', 'evolution',
 'Which of the following would most likely lead to an increase in genetic drift?',
 'A large, stable population size', 'High rates of gene flow between populations', 'A significant reduction in population size (bottleneck event)', 'Strong directional selection',
 'C', 'Genetic drift has the greatest effect in small populations. A bottleneck event dramatically reduces population size, making allele frequencies much more susceptible to random changes. Some alleles may be lost entirely by chance.'),

-- Hard (evolution)
('AP Biology', 'hard', 'evolution',
 'Two species of frogs live in the same pond but breed at different times of year. This reproductive isolation mechanism is classified as:',
 'Mechanical isolation', 'Temporal (seasonal) isolation', 'Gametic isolation', 'Behavioral isolation',
 'B', 'Temporal isolation is a prezygotic barrier where two species that could potentially mate do not because they breed at different times (different seasons, times of day, or years). This prevents the formation of hybrid offspring.'),

('AP Biology', 'hard', 'evolution',
 'Hardy-Weinberg equilibrium predicts that allele frequencies in a population will remain constant across generations. Which of the following conditions would violate this equilibrium?',
 'Random mating within the population', 'A very large population size', 'No net migration into or out of the population', 'Non-random mating based on phenotype',
 'D', 'Hardy-Weinberg equilibrium requires random mating, no selection, no mutation, no migration, and a large population. Non-random mating (such as assortative mating based on phenotype) violates this assumption and can change genotype frequencies over time.'),

-- ============================================================
-- ECOLOGY & ECOSYSTEMS (5 questions)
-- ============================================================

-- Easy (ecology)
('AP Biology', 'easy', 'ecology',
 'In a food chain, which trophic level contains the most energy?',
 'Tertiary consumers', 'Secondary consumers', 'Primary consumers', 'Producers',
 'D', 'Producers (autotrophs like plants) contain the most energy because they capture energy directly from sunlight through photosynthesis. At each successive trophic level, roughly 90% of energy is lost as heat, so energy decreases as you move up the food chain.'),

-- Medium (ecology)
('AP Biology', 'medium', 'ecology',
 'A population of rabbits in a meadow grows rapidly at first but then levels off as resources become scarce. This growth pattern is best described by which model?',
 'Exponential growth (J-curve)', 'Logistic growth (S-curve)', 'Linear growth', 'Boom-and-bust cycle',
 'B', 'Logistic growth occurs when a population grows rapidly at first (when resources are abundant) but slows as it approaches the carrying capacity (K) of the environment. The resulting growth curve is S-shaped (sigmoidal).'),

('AP Biology', 'medium', 'ecology',
 'Clownfish live among the tentacles of sea anemones. The clownfish receive protection while helping attract prey for the anemone. This relationship is an example of:',
 'Parasitism', 'Mutualism', 'Commensalism', 'Competition',
 'B', 'Mutualism is a symbiotic relationship in which both species benefit. The clownfish gains protection from predators among the anemone''s stinging tentacles, while the anemone benefits from nutrients in the clownfish''s waste and prey attracted by the clownfish''s movements.'),

-- Hard (ecology)
('AP Biology', 'hard', 'ecology',
 'In an ecosystem, removing a keystone species such as sea otters from a kelp forest would most likely result in:',
 'Increased kelp growth due to reduced competition', 'A trophic cascade where sea urchin populations explode and overgraze the kelp', 'No significant change because other predators would fill the niche', 'Increased biodiversity due to reduced predation pressure',
 'B', 'Sea otters are a keystone species that control sea urchin populations. Without otters, sea urchin numbers explode and they overgraze kelp forests, leading to a trophic cascade that dramatically reduces kelp cover and the biodiversity the kelp forest supports.'),

('AP Biology', 'hard', 'ecology',
 'Which biogeochemical cycle is most directly disrupted by the burning of fossil fuels, contributing to the greenhouse effect?',
 'The carbon cycle', 'The nitrogen cycle', 'The phosphorus cycle', 'The water cycle',
 'A', 'Burning fossil fuels releases carbon that was stored underground for millions of years back into the atmosphere as CO2. This disrupts the carbon cycle by adding excess CO2 faster than natural sinks (oceans, forests) can absorb it, intensifying the greenhouse effect and driving climate change.');
