-- 012: AP Biology extra questions (20 questions, 4 NEW subtopics)
-- Subtopics: molecular-biology, energy-metabolism, animal-physiology, diversity-of-life
-- Balanced answer positions: 5 A, 5 B, 5 C, 5 D correct
-- Difficulty spread per subtopic: 2 easy, 2 medium, 1 hard

INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES

-- ============================================================
-- MOLECULAR BIOLOGY (5 questions)
-- ============================================================

-- Easy (molecular-biology)
('AP Biology', 'easy', 'molecular-biology',
 'What enzyme is responsible for unwinding the DNA double helix during replication?',
 'Helicase', 'DNA polymerase', 'Ligase', 'Primase',
 'A', 'Helicase breaks the hydrogen bonds between complementary base pairs, separating the two strands of DNA to create replication forks where new strands can be synthesized.'),

('AP Biology', 'easy', 'molecular-biology',
 'During transcription, which molecule is produced from a DNA template?',
 'A new DNA strand', 'Messenger RNA (mRNA)', 'A polypeptide chain', 'Transfer RNA (tRNA)',
 'B', 'Transcription is the process by which RNA polymerase reads a DNA template strand and synthesizes a complementary mRNA molecule, which then carries the genetic code to the ribosome for translation.'),

-- Medium (molecular-biology)
('AP Biology', 'medium', 'molecular-biology',
 'A point mutation changes a codon from UAC to UAG. What is the most likely effect on the resulting protein?',
 'A different amino acid is incorporated', 'The protein is unchanged due to wobble base pairing', 'Translation terminates prematurely because UAG is a stop codon', 'The reading frame shifts downstream of the mutation',
 'C', 'UAG is one of three stop codons (UAG, UAA, UGA). Changing a sense codon to a stop codon creates a nonsense mutation, causing the ribosome to release the incomplete polypeptide prematurely.'),

('AP Biology', 'medium', 'molecular-biology',
 'Which of the following correctly describes the role of tRNA during translation?',
 'It catalyzes the formation of peptide bonds between amino acids', 'It carries the genetic code from the nucleus to the ribosome', 'It delivers specific amino acids to the ribosome by matching its anticodon to the mRNA codon', 'It removes introns from the pre-mRNA transcript',
 'C', 'Each tRNA molecule has an anticodon that base-pairs with a complementary mRNA codon, ensuring the correct amino acid is added to the growing polypeptide chain in the sequence specified by the mRNA.'),

-- Hard (molecular-biology)
('AP Biology', 'hard', 'molecular-biology',
 'In eukaryotes, which regulatory mechanism allows a single gene to produce multiple different proteins?',
 'DNA methylation of CpG islands', 'Histone acetylation of promoter regions', 'Alternative splicing of pre-mRNA', 'Activation of enhancer sequences by transcription factors',
 'C', 'Alternative splicing allows different combinations of exons to be joined together from the same pre-mRNA transcript, producing distinct mRNA variants that are translated into different protein isoforms from a single gene.'),

-- ============================================================
-- ENERGY & METABOLISM (5 questions)
-- ============================================================

-- Easy (energy-metabolism)
('AP Biology', 'easy', 'energy-metabolism',
 'In which organelle does photosynthesis take place in plant cells?',
 'Mitochondria', 'Nucleus', 'Chloroplast', 'Endoplasmic reticulum',
 'C', 'Chloroplasts contain chlorophyll and the thylakoid membranes where the light reactions occur, as well as the stroma where the Calvin cycle fixes carbon dioxide into glucose.'),

('AP Biology', 'easy', 'energy-metabolism',
 'What is the primary role of ATP in cells?',
 'To store genetic information', 'To provide energy for cellular processes', 'To transport oxygen through the bloodstream', 'To catalyze chemical reactions',
 'B', 'ATP (adenosine triphosphate) stores chemical energy in its phosphate bonds. When the terminal phosphate is hydrolyzed, energy is released to power processes such as active transport, muscle contraction, and biosynthesis.'),

-- Medium (energy-metabolism)
('AP Biology', 'medium', 'energy-metabolism',
 'During aerobic cellular respiration, where does the electron transport chain operate?',
 'In the cytoplasm', 'On the outer mitochondrial membrane', 'In the mitochondrial matrix', 'On the inner mitochondrial membrane',
 'D', 'The electron transport chain consists of protein complexes embedded in the inner mitochondrial membrane. Electrons from NADH and FADH2 pass through these complexes, creating a proton gradient that drives ATP synthase.'),

('AP Biology', 'medium', 'energy-metabolism',
 'Which process do yeast cells use to produce ethanol and carbon dioxide in the absence of oxygen?',
 'Alcoholic fermentation', 'Lactic acid fermentation', 'Oxidative phosphorylation', 'The Calvin cycle',
 'A', 'Alcoholic fermentation occurs in yeast and some bacteria under anaerobic conditions. Pyruvate from glycolysis is converted to ethanol and CO2, regenerating NAD+ so glycolysis can continue.'),

-- Hard (energy-metabolism)
('AP Biology', 'hard', 'energy-metabolism',
 'A researcher adds a chemical that makes the inner mitochondrial membrane freely permeable to hydrogen ions. Which of the following is the most direct effect?',
 'Glycolysis will stop producing pyruvate', 'The Krebs cycle will no longer generate NADH', 'Electrons will stop flowing through the transport chain', 'The proton gradient will dissipate, and ATP synthase will stop producing ATP',
 'D', 'ATP synthase is driven by the proton-motive force created by the H+ gradient across the inner mitochondrial membrane. If the membrane becomes freely permeable to H+, the gradient collapses and chemiosmotic ATP production ceases.'),

-- ============================================================
-- ANIMAL PHYSIOLOGY (5 questions)
-- ============================================================

-- Easy (animal-physiology)
('AP Biology', 'easy', 'animal-physiology',
 'Which type of blood vessel carries oxygenated blood away from the heart to the body?',
 'Veins', 'Capillaries', 'Arteries', 'Venules',
 'C', 'Arteries carry blood away from the heart. The aorta and its branches deliver oxygen-rich blood to tissues throughout the body, while pulmonary arteries are the exception, carrying deoxygenated blood to the lungs.'),

('AP Biology', 'easy', 'animal-physiology',
 'What part of the nervous system is responsible for the "fight or flight" response?',
 'Parasympathetic nervous system', 'Sympathetic nervous system', 'Somatic nervous system', 'Central nervous system',
 'B', 'The sympathetic nervous system prepares the body for stressful situations by increasing heart rate, dilating airways, and redirecting blood flow to muscles, collectively known as the fight-or-flight response.'),

-- Medium (animal-physiology)
('AP Biology', 'medium', 'animal-physiology',
 'Which cells of the immune system are directly responsible for destroying virus-infected body cells?',
 'B lymphocytes', 'Macrophages', 'Neutrophils', 'Cytotoxic T lymphocytes',
 'D', 'Cytotoxic T cells (CD8+ T cells) recognize and kill host cells that display foreign antigens on MHC class I molecules, such as cells infected by viruses, by releasing perforin and granzymes that trigger apoptosis.'),

('AP Biology', 'medium', 'animal-physiology',
 'The hormone insulin is secreted by the pancreas in response to elevated blood glucose. What is the primary effect of insulin on target cells?',
 'It stimulates glycogen breakdown in the liver', 'It promotes glucose uptake and storage, lowering blood sugar levels', 'It triggers the release of glucagon from alpha cells', 'It increases the rate of gluconeogenesis in the kidneys',
 'B', 'Insulin binds to receptors on muscle, fat, and liver cells, stimulating the insertion of GLUT4 glucose transporters into the membrane and promoting glycogen synthesis, thereby reducing blood glucose concentration.'),

-- Hard (animal-physiology)
('AP Biology', 'hard', 'animal-physiology',
 'A patient has a disease in which antibodies attack the acetylcholine receptors at neuromuscular junctions. Which of the following symptoms would most likely result?',
 'Uncontrolled muscle spasms and hyperreflexia', 'Loss of sensation in the extremities', 'Excessive secretion of epinephrine from the adrenal glands', 'Progressive muscle weakness and fatigue',
 'D', 'This describes myasthenia gravis. When antibodies block or destroy acetylcholine receptors, fewer receptors are available to bind acetylcholine released by motor neurons, leading to progressive skeletal muscle weakness and rapid fatigue during activity.'),

-- ============================================================
-- DIVERSITY OF LIFE (5 questions)
-- ============================================================

-- Easy (diversity-of-life)
('AP Biology', 'easy', 'diversity-of-life',
 'Which domain of life includes organisms whose cells contain a membrane-bound nucleus?',
 'Eukarya', 'Bacteria', 'Archaea', 'Protista',
 'A', 'Eukarya includes all organisms with eukaryotic cells, which have a true nucleus enclosed by a nuclear envelope. This domain encompasses protists, fungi, plants, and animals.'),

('AP Biology', 'easy', 'diversity-of-life',
 'Fungi obtain nutrients by secreting enzymes that break down organic matter externally and then absorbing the products. This mode of nutrition is called:',
 'Absorptive heterotrophy', 'Photoautotrophy', 'Chemolithotrophy', 'Ingestion',
 'A', 'Fungi are absorptive heterotrophs. They secrete digestive enzymes into their environment to decompose complex organic molecules, then absorb the simpler nutrients through their cell walls and membranes.'),

-- Medium (diversity-of-life)
('AP Biology', 'medium', 'diversity-of-life',
 'Which of the following is a key characteristic that distinguishes bacteria from archaea?',
 'Bacteria have cell walls containing peptidoglycan, while archaea do not', 'Bacteria lack ribosomes, while archaea have 80S ribosomes', 'Bacteria are exclusively anaerobic, while archaea are exclusively aerobic', 'Bacteria have membrane-bound organelles, while archaea do not',
 'A', 'Bacterial cell walls contain peptidoglycan, a polymer of sugars and amino acids unique to bacteria. Archaeal cell walls lack peptidoglycan and instead may contain pseudopeptidoglycan or other molecules.'),

('AP Biology', 'medium', 'diversity-of-life',
 'In the life cycle of a fern, the dominant generation that is visible as the leafy plant is the:',
 'Gametophyte generation', 'Sporophyte generation', 'Seed-bearing generation', 'Prothallus generation',
 'B', 'In ferns, the sporophyte is the large, dominant, diploid generation. The gametophyte (prothallus) is a small, independent, heart-shaped structure that produces gametes but is much less conspicuous.'),

-- Hard (diversity-of-life)
('AP Biology', 'hard', 'diversity-of-life',
 'Plasmodium, the causative agent of malaria, belongs to which group of protists?',
 'Amoebozoans', 'Ciliates', 'Euglenozoans', 'Apicomplexans',
 'D', 'Plasmodium is an apicomplexan, a group of parasitic protists characterized by an apical complex of organelles used to penetrate host cells. All apicomplexans are obligate intracellular parasites with complex life cycles.');
