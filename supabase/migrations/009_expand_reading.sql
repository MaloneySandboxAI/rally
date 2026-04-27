-- 009: Expand Reading Comprehension question bank
-- Adds ~216 new questions across all 4 reading subtopics
-- 54 per subtopic (18 easy + 18 medium + 18 hard)

-- ============================================================
-- SUBTOPIC 1: main-idea (54 questions)
-- ============================================================

-- main-idea: EASY (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Reading Comprehension', 'easy', 'main-idea',
 'Coral reefs support roughly 25% of all marine species despite covering less than 1% of the ocean floor. Scientists refer to them as the "rainforests of the sea" because of their extraordinary biodiversity. \n\nWhat is the passage primarily about?',
 'The size of coral reefs compared to the ocean',
 'The remarkable biodiversity supported by coral reefs',
 'How coral reefs are similar to actual rainforests',
 'The percentage of ocean covered by reefs',
 'B', 'The passage emphasizes that coral reefs support a disproportionately large share of marine life, highlighting their biodiversity.'),

('Reading Comprehension', 'easy', 'main-idea',
 'The printing press, invented by Johannes Gutenberg around 1440, revolutionized the spread of information. Books that once took months to copy by hand could now be produced in large quantities, making knowledge accessible to far more people. \n\nWhat is the central idea of this passage?',
 'Gutenberg was a famous inventor',
 'Hand-copying books was a skilled trade',
 'Books were expensive before the printing press',
 'The printing press transformed how information was shared',
 'D', 'The passage focuses on how the printing press changed information distribution by making books widely available.'),

('Reading Comprehension', 'easy', 'main-idea',
 'Honeybees communicate the location of food sources through a series of movements known as the "waggle dance." By varying the angle and duration of their dance, bees can convey both the direction and distance of nectar-rich flowers. \n\nWhat is this passage mainly about?',
 'How bees make honey from nectar',
 'The diet of honeybees',
 'How honeybees share information about food locations',
 'Why bees prefer certain flowers',
 'C', 'The passage describes the waggle dance as a communication method bees use to share the location of food sources.'),

('Reading Comprehension', 'easy', 'main-idea',
 'The Great Wall of China was not built all at once but over centuries by multiple dynasties. Its primary purpose was to protect Chinese states from invasions by nomadic groups from the north. \n\nWhat is the main idea of this passage?',
 'The Great Wall was constructed over time for defense',
 'The Great Wall was built by one emperor',
 'Nomadic groups built the Great Wall',
 'The Great Wall is the longest structure ever built',
 'A', 'The passage explains that the wall was built gradually across dynasties for the purpose of defense against northern invaders.'),

('Reading Comprehension', 'easy', 'main-idea',
 'Sleep plays a critical role in memory consolidation. During deep sleep stages, the brain replays and strengthens neural connections formed during the day, which is why a good night''s rest improves learning. \n\nWhat is this passage primarily about?',
 'The different stages of sleep',
 'Why people dream at night',
 'How sleep helps the brain retain information',
 'The recommended hours of sleep for students',
 'C', 'The passage centers on sleep''s role in strengthening memories and improving learning through neural consolidation.'),

('Reading Comprehension', 'easy', 'main-idea',
 'In the 1960s, Rachel Carson''s book "Silent Spring" warned the public about the dangers of pesticides like DDT. Her work is widely credited with launching the modern environmental movement in the United States. \n\nWhat is the passage mainly about?',
 'The history of pesticide use in farming',
 'Rachel Carson''s role in starting the environmental movement',
 'How DDT affects bird populations',
 'The publication history of "Silent Spring"',
 'B', 'The passage highlights Carson''s book as a catalyst for the environmental movement, making her influence the central idea.'),

('Reading Comprehension', 'easy', 'main-idea',
 'Water expands when it freezes, unlike most other substances that contract. This unusual property is why ice floats on water and why pipes can burst during winter when water inside them freezes. \n\nWhat is the main point of this passage?',
 'Ice is less dense than liquid water',
 'Most substances contract when cooled',
 'Pipes should be insulated in winter',
 'Water has an unusual property of expanding when frozen, which has practical effects',
 'D', 'The passage explains water''s unusual expansion upon freezing and gives real-world examples of its consequences.'),

('Reading Comprehension', 'easy', 'main-idea',
 'The Rosetta Stone, discovered in 1799, contained the same text written in three scripts: Greek, Demotic, and hieroglyphics. This allowed scholars to finally decode Egyptian hieroglyphics for the first time. \n\nWhat is this passage primarily about?',
 'The history of ancient Egypt',
 'How the Rosetta Stone enabled the decoding of hieroglyphics',
 'The three languages spoken in ancient Egypt',
 'Archaeological discoveries in the 18th century',
 'B', 'The passage focuses on how the Rosetta Stone''s trilingual text made it possible to understand hieroglyphics.'),

('Reading Comprehension', 'easy', 'main-idea',
 'Photosynthesis is the process by which plants convert sunlight, water, and carbon dioxide into glucose and oxygen. This process is fundamental to life on Earth because it produces the oxygen that most organisms need to survive. \n\nWhat is the central idea of this passage?',
 'Plants need water to survive',
 'Photosynthesis is essential to life because it produces oxygen',
 'Carbon dioxide is harmful to the environment',
 'Glucose is a type of sugar',
 'B', 'The passage explains photosynthesis and emphasizes its importance as the source of oxygen for living organisms.'),

('Reading Comprehension', 'easy', 'main-idea',
 'Jazz music originated in New Orleans in the early 20th century, blending African rhythms, blues, and European harmonies. It became one of America''s most significant cultural contributions to the world. \n\nWhat is this passage mainly about?',
 'The history of music in New Orleans',
 'The origins and cultural significance of jazz',
 'How African music influenced European composers',
 'Famous jazz musicians of the 20th century',
 'B', 'The passage discusses where jazz came from and notes its importance as an American cultural contribution.'),

('Reading Comprehension', 'easy', 'main-idea',
 'Vaccines work by introducing a weakened or inactive form of a pathogen into the body, training the immune system to recognize and fight it. This preparation means the body can respond quickly if exposed to the actual disease later. \n\nWhat is this passage primarily about?',
 'The history of vaccine development',
 'How vaccines prepare the immune system to fight diseases',
 'Why some people are afraid of vaccines',
 'The difference between viruses and bacteria',
 'B', 'The passage explains the mechanism by which vaccines train the immune system to defend against future infections.'),

('Reading Comprehension', 'easy', 'main-idea',
 'The Amazon River carries more water than any other river in the world. Its vast basin, which spans nine countries, contains about 10% of all species found on Earth. \n\nWhat is the main idea of this passage?',
 'The Amazon River is located in South America',
 'The Amazon is longer than the Nile',
 'Nine countries share the Amazon basin',
 'The Amazon River is the world''s largest river system and supports enormous biodiversity',
 'D', 'The passage highlights both the Amazon''s volume of water and its extraordinary biodiversity, emphasizing its scale.'),

('Reading Comprehension', 'easy', 'main-idea',
 'The invention of the telephone by Alexander Graham Bell in 1876 transformed communication. For the first time, people could speak to one another across great distances in real time. \n\nWhat is this passage mainly about?',
 'Alexander Graham Bell''s early life',
 'Competition among 19th-century inventors',
 'The technical design of the first telephone',
 'How the telephone changed long-distance communication',
 'D', 'The passage focuses on the telephone''s transformative impact on how people communicate over distances.'),

('Reading Comprehension', 'easy', 'main-idea',
 'Elephants are known for their exceptional memory and complex social structures. Herds are led by the oldest female, called the matriarch, who uses her experience to guide the group to water and food sources. \n\nWhat is this passage primarily about?',
 'Why elephants are endangered',
 'The intelligence and social organization of elephants',
 'How elephants find water in the wild',
 'The difference between male and female elephants',
 'B', 'The passage describes elephants'' memory and social hierarchy, centering on their intelligence and group behavior.'),

('Reading Comprehension', 'easy', 'main-idea',
 'The human body is approximately 60% water. Water regulates body temperature, transports nutrients, and removes waste, making adequate hydration essential for health. \n\nWhat is the central idea of this passage?',
 'People should drink eight glasses of water daily',
 'Water is vital to many essential body functions',
 'The human body contains more water than solids',
 'Dehydration is a common health problem',
 'B', 'The passage explains that water performs several critical functions in the body, emphasizing its importance for health.'),

('Reading Comprehension', 'easy', 'main-idea',
 'The Renaissance, which began in Italy in the 14th century, was a period of renewed interest in art, science, and classical learning. It marked a transition from the medieval world to the modern era. \n\nWhat is this passage mainly about?',
 'Italian art in the 14th century',
 'The Renaissance as a transformative cultural period',
 'Why medieval culture declined',
 'Famous Renaissance scientists',
 'B', 'The passage defines the Renaissance as a period of cultural renewal that bridged the medieval and modern eras.'),

('Reading Comprehension', 'easy', 'main-idea',
 'Gravity is the force that keeps planets in orbit around the Sun and the Moon in orbit around Earth. Without gravity, objects would float away into space with no way to return. \n\nWhat is the main point of this passage?',
 'The Moon orbits the Earth',
 'The Sun is the center of our solar system',
 'Objects in space are weightless',
 'Gravity is essential for keeping celestial bodies in their orbits',
 'D', 'The passage explains gravity''s role in maintaining the orbits of planets and moons.'),

('Reading Comprehension', 'easy', 'main-idea',
 'Public libraries offer free access to books, computers, and educational programs. They serve as vital community resources, especially for people who cannot afford to purchase materials on their own. \n\nWhat is this passage primarily about?',
 'The history of public libraries',
 'The role of libraries as accessible community resources',
 'How libraries are funded by taxes',
 'The decline of print books',
 'B', 'The passage highlights libraries as important resources that provide free access to education and information for all.');

-- main-idea: MEDIUM (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Reading Comprehension', 'medium', 'main-idea',
 'Although many people associate the Sahara Desert with endless sand dunes, only about 25% of it is actually sandy. The rest consists of rocky plateaus, gravel plains, and even mountains, making the Sahara far more geographically diverse than commonly believed. \n\nWhat is the passage primarily about?',
 'The Sahara''s geography is more varied than most people realize',
 'The Sahara is the largest desert in the world',
 'Sand dunes are not common in deserts',
 'Mountains can be found in unexpected places',
 'A', 'The passage corrects the misconception that the Sahara is mostly sand, emphasizing its geographic diversity.'),

('Reading Comprehension', 'medium', 'main-idea',
 'Urban heat islands occur when cities replace natural land cover with pavement and buildings that absorb and retain heat. This effect can raise city temperatures by several degrees compared to surrounding rural areas, increasing energy consumption and health risks during heat waves. \n\nWhat is the central claim of this passage?',
 'Urban development creates localized warming that has practical consequences',
 'Cities are warmer than rural areas because of climate change',
 'Pavement absorbs more heat than natural ground cover',
 'Heat waves are becoming more frequent in cities',
 'A', 'The passage explains how urban development causes heat islands and notes the resulting impacts on energy use and health.'),

('Reading Comprehension', 'medium', 'main-idea',
 'Studies have shown that bilingual individuals often outperform monolinguals on tasks requiring cognitive flexibility, such as switching between different rules or perspectives. Researchers believe that regularly managing two language systems strengthens executive function in the brain. \n\nWhat is this passage mainly about?',
 'Bilingual people are smarter than monolingual people',
 'Learning a second language is easy for children',
 'Executive function is the most important cognitive skill',
 'Managing two languages may enhance certain cognitive abilities',
 'D', 'The passage discusses research linking bilingualism to improved cognitive flexibility, not overall intelligence.'),

('Reading Comprehension', 'medium', 'main-idea',
 'The concept of "rewilding" involves reintroducing native species to ecosystems from which they have disappeared. Proponents argue that restoring keystone species like wolves or beavers can trigger cascading positive effects throughout entire food webs. \n\nWhat is the passage primarily about?',
 'Why wolves are important predators',
 'The practice of rewilding and its potential ecological benefits',
 'How food webs function in natural ecosystems',
 'The decline of native species worldwide',
 'B', 'The passage introduces rewilding as a conservation strategy and explains its potential to restore ecosystems through keystone species.'),

('Reading Comprehension', 'medium', 'main-idea',
 'During the Industrial Revolution, child labor was widespread because factory owners valued children''s small hands for operating machinery. Reform movements in the late 19th century gradually led to laws restricting child labor and mandating public education. \n\nWhat is the main idea of this passage?',
 'The Industrial Revolution was a period of economic growth',
 'Child labor during the Industrial Revolution eventually prompted protective reforms',
 'Children were better suited for factory work than adults',
 'Public education began during the Industrial Revolution',
 'B', 'The passage traces the arc from widespread child labor to the reform movements that addressed it.'),

('Reading Comprehension', 'medium', 'main-idea',
 'Microplastics — tiny plastic fragments less than 5 millimeters long — have been found in oceans, rivers, soil, and even human blood. Their pervasiveness has raised concerns among scientists about potential long-term effects on ecosystems and human health that are not yet fully understood. \n\nWhat is this passage primarily about?',
 'Plastic pollution is the biggest environmental crisis today',
 'Oceans contain more plastic than fish',
 'Scientists have proven microplastics cause disease in humans',
 'Microplastics are widespread and their health effects remain uncertain',
 'D', 'The passage highlights both the ubiquity of microplastics and the scientific uncertainty about their long-term effects.'),

('Reading Comprehension', 'medium', 'main-idea',
 'Unlike traditional maps that represent the Earth''s surface on a flat plane, Geographic Information Systems (GIS) layer multiple types of data — from population density to soil composition — onto digital maps. This technology allows planners to analyze complex spatial relationships that would be invisible on a standard map. \n\nWhat is the central idea of this passage?',
 'GIS maps are more accurate than paper maps',
 'GIS technology enables analysis of complex geographic data through layering',
 'Digital maps have replaced all paper maps',
 'Soil composition data is the most useful GIS layer',
 'B', 'The passage explains how GIS goes beyond traditional mapping by layering diverse data for spatial analysis.'),

('Reading Comprehension', 'medium', 'main-idea',
 'The placebo effect, in which patients improve after receiving an inactive treatment they believe is real, has been documented across numerous medical studies. Some researchers now argue that understanding this effect could help develop new therapeutic approaches that harness the mind-body connection. \n\nWhat is this passage mainly about?',
 'Placebos are used to deceive patients in clinical trials',
 'The placebo effect is real and may have therapeutic applications',
 'Most medications work through the placebo effect',
 'The mind has no measurable impact on physical health',
 'B', 'The passage describes the placebo effect''s documented reality and suggests it could inform new treatment strategies.'),

('Reading Comprehension', 'medium', 'main-idea',
 'Archaeologists recently discovered that ancient Mesopotamian traders used standardized clay tokens as early as 8000 BCE to track goods. These tokens are now believed to be precursors to the earliest writing systems, suggesting that commerce drove the development of literacy. \n\nWhat is the passage primarily about?',
 'Mesopotamia was the first civilization to develop writing',
 'Literacy was uncommon in ancient civilizations',
 'Clay tokens were an early form of currency',
 'Ancient trade practices may have led to the invention of writing',
 'D', 'The passage connects Mesopotamian trade tokens to the origin of writing, arguing that commerce spurred literacy.'),

('Reading Comprehension', 'medium', 'main-idea',
 'While Mars has long captured public imagination as a candidate for human colonization, recent studies highlight significant obstacles including extreme radiation, toxic soil, and the psychological toll of prolonged isolation. These challenges suggest that establishing a permanent settlement will require breakthroughs in multiple fields. \n\nWhat is the central claim of this passage?',
 'Mars colonization is impossible with current technology',
 'Colonizing Mars is appealing but faces serious multidisciplinary challenges',
 'Radiation is the biggest obstacle to living on Mars',
 'Humans will never live on another planet',
 'B', 'The passage balances public enthusiasm for Mars with a realistic assessment of the varied challenges involved.'),

('Reading Comprehension', 'medium', 'main-idea',
 'The "impostor phenomenon," first described in 1978, refers to high-achieving individuals who doubt their accomplishments and fear being exposed as frauds. Research indicates it affects people across professions and demographics, suggesting it is a widespread psychological pattern rather than a personal flaw. \n\nWhat is this passage mainly about?',
 'Impostor syndrome only affects high-achieving people',
 'The impostor phenomenon is a common experience, not an individual deficiency',
 'People with impostor syndrome should seek therapy',
 'The impostor phenomenon was discovered recently',
 'B', 'The passage defines impostor phenomenon and emphasizes that it is widespread, framing it as a common pattern rather than a personal failing.'),

('Reading Comprehension', 'medium', 'main-idea',
 'Deep-sea hydrothermal vents support thriving ecosystems in total darkness, relying on chemosynthesis rather than photosynthesis for energy. The discovery of these communities in 1977 challenged the long-held assumption that all life ultimately depends on sunlight. \n\nWhat is the passage primarily about?',
 'Hydrothermal vents are found at the bottom of the ocean',
 'The discovery of vent ecosystems overturned assumptions about life''s dependence on sunlight',
 'Chemosynthesis is more efficient than photosynthesis',
 'Deep-sea creatures have adapted to extreme pressure',
 'B', 'The passage highlights how vent communities challenged the belief that sunlight is necessary for all life.'),

('Reading Comprehension', 'medium', 'main-idea',
 'In the aftermath of World War I, the Treaty of Versailles imposed heavy reparations on Germany, which many historians argue contributed to the economic instability and resentment that fueled the rise of extremist political movements in the 1930s. \n\nWhat is the main idea of this passage?',
 'The Treaty of Versailles ended World War I',
 'Harsh post-war penalties on Germany may have contributed to later political extremism',
 'Germany refused to pay war reparations',
 'World War I was caused by economic instability',
 'B', 'The passage argues that the Treaty''s reparations created conditions that helped extremist movements gain power.'),

('Reading Comprehension', 'medium', 'main-idea',
 'Citizen science projects, in which volunteers assist with data collection for research, have expanded dramatically with the rise of smartphone technology. Programs tracking bird migrations, water quality, and air pollution now rely on thousands of amateur contributors whose collective efforts rival those of professional research teams. \n\nWhat is this passage primarily about?',
 'Smartphones have replaced professional scientific equipment',
 'Technology has enabled citizen science to become a significant force in research',
 'Bird migration data is the most popular citizen science project',
 'Amateur scientists are replacing professionals',
 'B', 'The passage describes how smartphone technology has amplified citizen science contributions to match professional research.'),

('Reading Comprehension', 'medium', 'main-idea',
 'The Harlem Renaissance of the 1920s was not merely a literary movement but a broad cultural awakening that encompassed music, visual arts, theater, and political thought. It reshaped how African Americans saw themselves and how the wider world perceived Black culture. \n\nWhat is the central idea of this passage?',
 'The Harlem Renaissance produced great literature',
 'The Harlem Renaissance took place only in New York City',
 'Jazz music was the most important product of the Harlem Renaissance',
 'The Harlem Renaissance was a wide-ranging cultural movement with lasting impact',
 'D', 'The passage emphasizes the breadth of the Harlem Renaissance beyond literature, noting its cultural and perceptual impact.'),

('Reading Comprehension', 'medium', 'main-idea',
 'Epigenetics, the study of changes in gene expression that do not alter the DNA sequence itself, has revealed that environmental factors like diet and stress can affect which genes are turned on or off. These changes can sometimes be passed to offspring, complicating the traditional nature-versus-nurture debate. \n\nWhat is this passage mainly about?',
 'DNA determines all inherited traits',
 'Diet has no effect on genetic expression',
 'Stress causes permanent genetic damage',
 'Epigenetics shows that environment can influence gene expression, blurring the nature-nurture boundary',
 'D', 'The passage introduces epigenetics as a field that demonstrates environmental influences on gene expression, complicating simple genetic models.'),

('Reading Comprehension', 'medium', 'main-idea',
 'Autonomous vehicles promise to reduce traffic accidents caused by human error, which account for over 90% of crashes. However, critics point out that these systems introduce new risks, including software failures and ethical dilemmas in unavoidable accident scenarios. \n\nWhat is the passage primarily about?',
 'Autonomous vehicles may reduce crashes but introduce different types of risk',
 'Self-driving cars will eliminate all traffic accidents',
 'Software failures are the biggest danger of self-driving cars',
 'Human drivers are always more dangerous than computers',
 'A', 'The passage presents both the safety promise and the new risks of autonomous vehicles, showing a balanced perspective.'),

('Reading Comprehension', 'medium', 'main-idea',
 'The concept of neuroplasticity — the brain''s ability to reorganize itself by forming new neural connections — has transformed rehabilitation medicine. Stroke patients who were once considered permanently impaired can now regain function through targeted therapy that leverages the brain''s adaptive capacity. \n\nWhat is the central claim of this passage?',
 'The brain cannot repair itself after injury',
 'Understanding neuroplasticity has improved recovery outcomes for brain injury patients',
 'Stroke patients always fully recover with proper therapy',
 'Neuroplasticity only occurs in young brains',
 'B', 'The passage explains how the concept of neuroplasticity has enabled better rehabilitation approaches for stroke patients.');

-- main-idea: HARD (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Reading Comprehension', 'hard', 'main-idea',
 'Recent scholarship has challenged the notion that the Scientific Revolution was a distinctly European phenomenon. Historians now point to contributions from Islamic, Chinese, and Indian scholars whose earlier discoveries laid essential groundwork, suggesting the revolution was built on a global intellectual heritage rather than arising from European genius alone. \n\nWhat is the passage primarily about?',
 'The Scientific Revolution should be understood as drawing on global intellectual traditions',
 'Non-European scholars were more important to science than European ones',
 'European scientists plagiarized non-European discoveries',
 'The Scientific Revolution did not actually occur in Europe',
 'A', 'The passage argues for a broader view of the Scientific Revolution as building on worldwide contributions, not that Europeans were unimportant.'),

('Reading Comprehension', 'hard', 'main-idea',
 'The "resource curse" theory posits that nations rich in natural resources like oil often experience slower economic growth and weaker democratic institutions than resource-poor countries. While the correlation is well-documented, economists debate whether the resources themselves cause these outcomes or merely exacerbate pre-existing institutional weaknesses. \n\nWhat is the central claim of this passage?',
 'Natural resources always harm a country''s economy',
 'Resource wealth correlates with negative outcomes, but the causal mechanism is debated',
 'Poor governance causes the resource curse',
 'Resource-poor countries always develop faster',
 'B', 'The passage presents the resource curse as a documented pattern while highlighting ongoing debate about whether resources directly cause the negative outcomes.'),

('Reading Comprehension', 'hard', 'main-idea',
 'Proponents of universal basic income argue it would reduce poverty and provide a safety net in an era of increasing automation. Critics counter that it could discourage work and prove fiscally unsustainable. Pilot programs in Finland and Kenya have yielded mixed results, with improvements in well-being but limited effects on employment rates. \n\nWhat is this passage mainly about?',
 'Universal basic income is the best solution to automation',
 'UBI would solve poverty if properly funded',
 'Pilot programs have proven that UBI does not work',
 'UBI is a debated policy whose early trials show complex, mixed outcomes',
 'D', 'The passage presents arguments for and against UBI and notes that pilot programs have produced nuanced, not definitive, results.'),

('Reading Comprehension', 'hard', 'main-idea',
 'The "Great Oxidation Event" approximately 2.4 billion years ago, when cyanobacteria began producing oxygen through photosynthesis, was catastrophic for the anaerobic organisms that then dominated Earth. Paradoxically, this mass extinction paved the way for aerobic life and ultimately the complex organisms that exist today. \n\nWhat is the passage primarily about?',
 'Cyanobacteria were the first organisms to perform photosynthesis',
 'Mass extinctions always lead to more advanced life forms',
 'Anaerobic organisms were primitive and destined to go extinct',
 'The oxygenation of Earth''s atmosphere was both destructive and foundational for complex life',
 'D', 'The passage emphasizes the paradox that an event catastrophic for existing life was necessary for the evolution of complex organisms.'),

('Reading Comprehension', 'hard', 'main-idea',
 'Behavioral economists have demonstrated that people consistently make irrational financial decisions — overvaluing losses relative to gains, anchoring to irrelevant numbers, and discounting future rewards too steeply. These findings have prompted some governments to design "nudge" policies that structure choices to guide citizens toward better outcomes without restricting freedom. \n\nWhat is the central idea of this passage?',
 'People are incapable of making good financial decisions',
 'Behavioral economics has replaced traditional economic theory',
 'Nudge policies are a form of government control',
 'Insights into irrational behavior have inspired policy designs that subtly improve decision-making',
 'D', 'The passage connects behavioral economics findings about irrational decisions to the development of nudge policies that improve outcomes.'),

('Reading Comprehension', 'hard', 'main-idea',
 'While CRISPR gene-editing technology offers unprecedented ability to correct genetic diseases, its potential for "enhancement" — such as selecting for intelligence or physical traits — raises profound ethical questions. The line between therapy and enhancement is often blurry, and different cultures draw it in different places. \n\nWhat is this passage mainly about?',
 'CRISPR can cure all genetic diseases',
 'Cultural differences prevent any consensus on CRISPR',
 'Gene editing for enhancement should be banned worldwide',
 'CRISPR''s therapeutic promise is complicated by ethically ambiguous enhancement possibilities',
 'D', 'The passage highlights the tension between CRISPR''s medical benefits and the ethical challenges of using it for enhancement.'),

('Reading Comprehension', 'hard', 'main-idea',
 'The decline of local newspapers across the United States has created "news deserts" where residents lack access to reliable information about local government, schools, and public health. Research suggests this information gap correlates with lower voter turnout and reduced government accountability, though establishing direct causation remains difficult. \n\nWhat is the passage primarily about?',
 'Social media has replaced local newspapers',
 'Voter turnout depends entirely on media access',
 'Local newspapers were never profitable businesses',
 'The loss of local newspapers may weaken civic engagement, though the causal link is uncertain',
 'D', 'The passage connects newspaper decline to civic consequences while acknowledging the difficulty of proving direct causation.'),

('Reading Comprehension', 'hard', 'main-idea',
 'Quantum entanglement, in which particles become correlated so that measuring one instantly affects the other regardless of distance, troubled Einstein so much he called it "spooky action at a distance." Decades of experiments have confirmed entanglement is real, but physicists still debate what it reveals about the fundamental nature of reality. \n\nWhat is the central claim of this passage?',
 'Einstein was wrong about quantum mechanics',
 'Physicists have reached consensus on what entanglement means',
 'Entanglement allows faster-than-light communication',
 'Quantum entanglement is experimentally verified but its deeper implications remain debated',
 'D', 'The passage confirms entanglement''s reality through experiments while noting ongoing philosophical debate about its meaning.'),

('Reading Comprehension', 'hard', 'main-idea',
 'Some linguists argue that the Sapir-Whorf hypothesis — the idea that language shapes thought — is supported by studies showing that speakers of languages with different color terms perceive colors differently. Others maintain these differences are superficial and that core cognition is universal, with language merely providing labels for pre-existing concepts. \n\nWhat is this passage mainly about?',
 'The debate over whether language fundamentally shapes cognition or merely labels universal concepts',
 'Language determines how people think',
 'Color perception varies across cultures',
 'The Sapir-Whorf hypothesis has been definitively proven',
 'A', 'The passage presents both sides of the debate about language''s influence on thought, without endorsing either position.'),

('Reading Comprehension', 'hard', 'main-idea',
 'The "hygiene hypothesis" suggests that reduced childhood exposure to microbes in modern sanitized environments may contribute to the rise in allergies and autoimmune disorders. While epidemiological data supports a correlation, the specific immunological mechanisms remain incompletely understood, and the hypothesis has evolved into the broader "old friends" theory. \n\nWhat is the passage primarily about?',
 'Modern hygiene practices are harmful to children',
 'The hygiene hypothesis links reduced microbial exposure to immune disorders, though the mechanisms are still being clarified',
 'Allergies are caused by excessive cleanliness',
 'The old friends theory has replaced the hygiene hypothesis',
 'B', 'The passage describes the hygiene hypothesis and its evolution while noting that the underlying mechanisms are not fully understood.'),

('Reading Comprehension', 'hard', 'main-idea',
 'Art historians have increasingly questioned the concept of artistic "genius" as an innate, individual quality, arguing instead that major works emerge from specific social, economic, and institutional contexts. This view does not diminish great artists but reframes their achievements as products of both talent and circumstance. \n\nWhat is the central idea of this passage?',
 'Great artists are not truly talented',
 'Artistic achievement is better understood as shaped by context rather than pure individual genius',
 'Social conditions are more important than talent in art',
 'Art historians want to discredit famous artists',
 'B', 'The passage argues for understanding art as emerging from both individual talent and broader contextual factors.'),

('Reading Comprehension', 'hard', 'main-idea',
 'The "demographic transition" model predicts that as nations industrialize, birth rates eventually decline to match falling death rates. However, several sub-Saharan African countries have not followed this pattern, maintaining high birth rates despite decreasing mortality, prompting researchers to question whether the model is universally applicable. \n\nWhat is this passage mainly about?',
 'Sub-Saharan Africa has the highest birth rates in the world',
 'The demographic transition model may not apply universally, as some regions deviate from its predictions',
 'Industrialization always leads to lower birth rates',
 'Death rates are declining worldwide',
 'B', 'The passage presents the demographic transition model and then questions its universality based on evidence from sub-Saharan Africa.'),

('Reading Comprehension', 'hard', 'main-idea',
 'Restorative justice programs, which bring offenders face-to-face with their victims to acknowledge harm and agree on restitution, have shown promise in reducing recidivism rates compared to traditional punitive approaches. Nevertheless, critics argue these programs may inadvertently pressure victims into forgiveness and work best only for certain categories of crime. \n\nWhat is the passage primarily about?',
 'Restorative justice shows promise but faces legitimate criticisms about its limitations and effects on victims',
 'Restorative justice should replace the prison system',
 'Victims benefit more from restorative justice than offenders',
 'Punitive justice systems are ineffective at reducing crime',
 'A', 'The passage presents restorative justice as a promising but imperfect alternative, balancing its benefits against valid concerns.'),

('Reading Comprehension', 'hard', 'main-idea',
 'The concept of "digital sovereignty" — a nation''s ability to govern data generated within its borders — has become a major geopolitical issue as cloud computing concentrates vast amounts of information in servers owned by a handful of multinational corporations. Balancing data sovereignty with the benefits of a global, interconnected internet presents policymakers with a fundamental tension. \n\nWhat is the central claim of this passage?',
 'Digital sovereignty raises a difficult tension between national control and global connectivity',
 'Nations should ban foreign cloud computing companies',
 'Cloud computing threatens national security',
 'Multinational corporations control the internet',
 'A', 'The passage frames digital sovereignty as a tension between national governance and the benefits of global internet connectivity.'),

('Reading Comprehension', 'hard', 'main-idea',
 'While standardized testing has been criticized for cultural bias and narrowing curriculum, proponents argue it remains the most objective and scalable method of measuring student achievement across diverse school systems. The debate ultimately hinges on whether equity is better served by a common benchmark or by assessments tailored to local contexts. \n\nWhat is this passage mainly about?',
 'Standardized testing is inherently biased and should be abolished',
 'The standardized testing debate centers on competing visions of educational equity',
 'Standardized tests are the best way to measure student learning',
 'Local assessments are always more fair than standardized tests',
 'B', 'The passage presents the debate as fundamentally about how to achieve equity, not simply whether tests are good or bad.'),

('Reading Comprehension', 'hard', 'main-idea',
 'Artificial intelligence systems trained on historical data can perpetuate and even amplify existing societal biases. For instance, hiring algorithms trained on past decisions may systematically disadvantage women or minorities, raising the question of whether "objective" algorithmic decision-making is truly possible when the training data itself reflects human prejudice. \n\nWhat is the passage primarily about?',
 'AI hiring tools should be banned',
 'Algorithms are more biased than human decision-makers',
 'Historical data is always biased',
 'AI systems can embed and amplify bias from their training data, questioning claims of algorithmic objectivity',
 'D', 'The passage argues that AI trained on biased data can perpetuate discrimination, challenging the notion of objective algorithmic decisions.'),

('Reading Comprehension', 'hard', 'main-idea',
 'The discovery of extremophiles — organisms that thrive in conditions previously thought inhospitable to life, such as boiling hot springs or highly acidic environments — has expanded the definition of the "habitable zone" in astrobiology. These findings suggest that the search for extraterrestrial life should consider a far wider range of planetary conditions than once assumed. \n\nWhat is this passage mainly about?',
 'Extremophiles have broadened scientific expectations about where life could exist beyond Earth',
 'Life on Earth exists in more environments than previously known',
 'Hot springs contain unique microorganisms',
 'The habitable zone is defined by distance from a star',
 'A', 'The passage connects the discovery of extremophiles on Earth to an expanded view of where extraterrestrial life might be found.'),

('Reading Comprehension', 'hard', 'main-idea',
 'Economic sanctions, while intended to pressure governments into changing behavior without military intervention, often disproportionately harm civilian populations rather than political elites. This has led scholars to debate whether sanctions represent a genuinely humane alternative to war or simply a different form of collective punishment. \n\nWhat is the passage primarily about?',
 'Economic sanctions are always ineffective',
 'Military intervention is preferable to economic sanctions',
 'Sanctions raise ethical questions because they often hurt civilians more than their intended targets',
 'Political elites are immune to economic pressure',
 'C', 'The passage questions whether sanctions are truly humane by highlighting their disproportionate impact on civilians.');

-- ============================================================
-- SUBTOPIC 2: evidence-based (54 questions)
-- ============================================================

-- evidence-based: EASY (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Reading Comprehension', 'easy', 'evidence-based',
 'Monarch butterflies migrate up to 3,000 miles each fall from Canada to central Mexico. Scientists believe they navigate using a combination of the Sun''s position and Earth''s magnetic field. \n\nWhich detail best supports the claim that monarch migration is a remarkable feat?',
 'They travel up to 3,000 miles',
 'They migrate each fall',
 'They go from Canada to Mexico',
 'They use the Sun''s position',
 'A', 'The 3,000-mile distance most directly supports the idea that the migration is remarkable.'),

('Reading Comprehension', 'easy', 'evidence-based',
 'The ancient Romans built aqueducts to transport water over long distances to their cities. Some of these structures still stand today, over 2,000 years after they were constructed. \n\nWhich detail best supports the claim that Roman engineering was exceptionally durable?',
 'Aqueducts transported water over long distances',
 'Romans built aqueducts for their cities',
 'Some aqueducts still stand after 2,000 years',
 'Water was important to Roman cities',
 'C', 'The fact that structures survive after 2,000 years directly demonstrates their durability.'),

('Reading Comprehension', 'easy', 'evidence-based',
 'Dogs have approximately 300 million olfactory receptors in their noses, compared to about 6 million in humans. This is why dogs are commonly used by law enforcement to detect drugs, explosives, and missing persons. \n\nWhich detail best supports the claim that dogs have a superior sense of smell?',
 'Dogs are used by law enforcement',
 'Dogs have 300 million olfactory receptors compared to humans'' 6 million',
 'Dogs can detect explosives',
 'Dogs can find missing persons',
 'B', 'The numerical comparison of olfactory receptors directly demonstrates dogs'' superior smell ability.'),

('Reading Comprehension', 'easy', 'evidence-based',
 'Bamboo is one of the fastest-growing plants on Earth, with some species growing up to 35 inches per day. Its rapid growth rate makes it a highly renewable building material. \n\nWhich detail best supports the claim that bamboo is a renewable resource?',
 'Bamboo is a fast-growing plant',
 'Some species grow up to 35 inches per day',
 'Bamboo can be used as a building material',
 'Bamboo grows on Earth',
 'B', 'The specific growth rate of 35 inches per day provides the strongest evidence of bamboo''s renewability.'),

('Reading Comprehension', 'easy', 'evidence-based',
 'Marie Curie was the first person to win Nobel Prizes in two different scientific fields — physics in 1903 and chemistry in 1911. Her discoveries of radium and polonium transformed the understanding of radioactivity. \n\nWhich detail best supports the claim that Curie made exceptional contributions to science?',
 'She studied radioactivity',
 'She won Nobel Prizes in two different fields',
 'She discovered radium',
 'She lived in France',
 'B', 'Winning Nobel Prizes in two separate fields is the strongest evidence of exceptional scientific achievement.'),

('Reading Comprehension', 'easy', 'evidence-based',
 'The Dead Sea, located between Israel and Jordan, has a salt concentration of about 34%, roughly ten times saltier than the ocean. This extreme salinity allows swimmers to float effortlessly on the surface. \n\nWhich detail best supports the claim that the Dead Sea has unusually high salinity?',
 'It is located between Israel and Jordan',
 'Swimmers can float effortlessly on it',
 'Its salt concentration is about 34%',
 'It is roughly ten times saltier than the ocean',
 'D', 'Comparing the Dead Sea to the ocean (ten times saltier) most directly shows its unusual salt levels.'),

('Reading Comprehension', 'easy', 'evidence-based',
 'The International Space Station orbits Earth at approximately 17,500 miles per hour and completes one full orbit every 90 minutes. Astronauts on board experience 16 sunrises and sunsets every day. \n\nWhich detail best supports the claim that the ISS moves at extraordinary speed?',
 'It orbits Earth',
 'Astronauts see 16 sunrises daily',
 'It travels at approximately 17,500 miles per hour',
 'It completes an orbit every 90 minutes',
 'C', 'The specific speed of 17,500 mph provides the most direct evidence of extraordinary velocity.'),

('Reading Comprehension', 'easy', 'evidence-based',
 'Octopuses have three hearts and blue blood. Two hearts pump blood to the gills, while the third pumps it to the rest of the body, an arrangement that helps them survive in low-oxygen deep-sea environments. \n\nWhich detail best supports the claim that octopuses are adapted to deep-sea conditions?',
 'They have blue blood',
 'They have three hearts',
 'Their circulatory system helps them survive in low-oxygen environments',
 'Two hearts pump blood to the gills',
 'C', 'The explicit connection between their circulatory system and low-oxygen survival directly supports deep-sea adaptation.'),

('Reading Comprehension', 'easy', 'evidence-based',
 'The Atacama Desert in Chile receives less than 0.04 inches of rain per year on average. Some weather stations in the desert have never recorded a single drop of rain. \n\nWhich detail best supports the claim that the Atacama is one of the driest places on Earth?',
 'It is located in Chile',
 'It receives less than 0.04 inches of rain per year',
 'It is a desert',
 'Some stations have never recorded rain',
 'D', 'Never recording any rain is the most extreme evidence of dryness.'),

('Reading Comprehension', 'easy', 'evidence-based', 'Frederick Douglass, who escaped slavery in 1838, became one of the most influential abolitionists in American history. His autobiography, published in 1845, provided a firsthand account of the brutality of slavery and persuaded many Northerners to support abolition.\n\nWhich detail best supports the claim that Douglass''''s writing had a political impact?', 'He escaped slavery in 1838', 'He was an influential abolitionist', 'His autobiography persuaded many Northerners to support abolition', 'His autobiography was published in 1845', 'C', 'Persuading people to support abolition directly demonstrates political impact through writing.'),

('Reading Comprehension', 'easy', 'evidence-based',
 'Cheetahs can accelerate from 0 to 60 miles per hour in just three seconds, making them the fastest land animals. However, they can only maintain this speed for short bursts before overheating. \n\nWhich detail best supports the claim that cheetahs are the fastest land animals?',
 'They can only run in short bursts',
 'They overheat quickly',
 'They accelerate from 0 to 60 mph in three seconds',
 'They are land animals',
 'C', 'The specific acceleration figure directly demonstrates their speed superiority.'),

('Reading Comprehension', 'easy', 'evidence-based',
 'The Great Barrier Reef stretches over 1,400 miles along the coast of Australia and is visible from space. It is home to more than 1,500 species of fish and 400 types of coral. \n\nWhich detail best supports the claim that the Great Barrier Reef has exceptional biodiversity?',
 'It stretches over 1,400 miles',
 'It is visible from space',
 'It is located along Australia''s coast',
 'It contains over 1,500 fish species and 400 coral types',
 'D', 'The large number of species directly supports the claim of exceptional biodiversity.'),

('Reading Comprehension', 'easy', 'evidence-based',
 'Leonardo da Vinci filled thousands of notebook pages with sketches of flying machines, anatomical studies, and engineering designs. Many of his inventions, such as a helicopter-like device, were centuries ahead of their time. \n\nWhich detail best supports the claim that da Vinci was a visionary thinker?',
 'He filled thousands of notebook pages',
 'He made anatomical studies',
 'His inventions were centuries ahead of their time',
 'He sketched engineering designs',
 'C', 'Being centuries ahead of one''s time directly supports the idea of visionary thinking.'),

('Reading Comprehension', 'easy', 'evidence-based',
 'Antarctica is the coldest continent on Earth, with temperatures that can drop below minus 128 degrees Fahrenheit. Despite these conditions, certain microorganisms and insects have adapted to survive there. \n\nWhich detail best supports the claim that Antarctica has extreme temperatures?',
 'It is the coldest continent',
 'Some insects have adapted to survive there',
 'Microorganisms live there',
 'Temperatures can drop below minus 128 degrees Fahrenheit',
 'D', 'The specific temperature reading of minus 128 degrees provides the most direct evidence of extreme cold.'),

('Reading Comprehension', 'easy', 'evidence-based',
 'The ancient Library of Alexandria, founded around 300 BCE, aimed to collect all the world''s knowledge. At its peak, it is estimated to have held between 400,000 and 700,000 scrolls. \n\nWhich detail best supports the claim that the Library of Alexandria was an ambitious project?',
 'It was founded around 300 BCE',
 'It aimed to collect all the world''s knowledge',
 'It held between 400,000 and 700,000 scrolls',
 'It was located in Alexandria',
 'B', 'The goal of collecting all the world''s knowledge most directly reflects the library''s ambitious scope.'),

('Reading Comprehension', 'easy', 'evidence-based',
 'Solar panels convert sunlight directly into electricity with no moving parts and no emissions. In 2023, solar energy became the cheapest source of new electricity generation in most parts of the world. \n\nWhich detail best supports the claim that solar energy is environmentally friendly?',
 'Solar panels have no moving parts',
 'Solar energy became the cheapest source of electricity',
 'Solar panels produce no emissions',
 'Solar panels convert sunlight into electricity',
 'C', 'Producing no emissions directly supports the environmental friendliness of solar energy.'),

('Reading Comprehension', 'easy', 'evidence-based',
 'The human brain contains approximately 86 billion neurons, each connected to thousands of other neurons. This vast network enables complex thought, memory, and consciousness. \n\nWhich detail best supports the claim that the brain is extraordinarily complex?',
 'The brain enables consciousness',
 'Neurons are connected to each other',
 'The brain contains approximately 86 billion neurons, each connected to thousands of others',
 'The brain enables memory',
 'C', 'The specific number of neurons and their connections provides the most direct evidence of the brain''s complexity.'),

('Reading Comprehension', 'easy', 'evidence-based',
 'Mount Everest, the tallest mountain on Earth at 29,032 feet, was first summited by Edmund Hillary and Tenzing Norgay in 1953. Since then, over 6,000 climbers have reached the peak. \n\nWhich detail best supports the claim that climbing Everest has become more accessible over time?',
 'Everest is 29,032 feet tall',
 'Hillary and Norgay summited it in 1953',
 'Over 6,000 climbers have reached the peak since 1953',
 'It is the tallest mountain on Earth',
 'C', 'The large number of successful summits since 1953 shows increased accessibility.');

-- evidence-based: MEDIUM (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Reading Comprehension', 'medium', 'evidence-based',
 'Studies have found that students who take handwritten notes retain information better than those who type their notes on laptops. Researchers hypothesize that the slower pace of handwriting forces students to process and summarize information rather than transcribing it verbatim. \n\nWhich detail best supports the claim that handwriting promotes deeper learning?',
 'Students retain information better with handwritten notes',
 'Handwriting is slower than typing',
 'Handwriting forces students to process and summarize rather than transcribe',
 'Some students prefer laptops for note-taking',
 'C', 'The explanation of how handwriting forces processing and summarizing directly addresses the mechanism of deeper learning.'),

('Reading Comprehension', 'medium', 'evidence-based',
 'Wolves were reintroduced to Yellowstone National Park in 1995 after a 70-year absence. Within a decade, elk populations decreased, which allowed overgrazed vegetation along riverbanks to recover, stabilizing stream channels and reducing erosion. \n\nWhich detail best supports the claim that wolves had cascading ecological effects?',
 'Wolves had been absent for 70 years',
 'Elk populations decreased after wolves returned',
 'Vegetation recovery led to stabilized streams and reduced erosion',
 'Wolves were reintroduced in 1995',
 'C', 'The chain from vegetation recovery to stabilized streams and reduced erosion demonstrates cascading effects beyond simple predator-prey dynamics.'),

('Reading Comprehension', 'medium', 'evidence-based',
 'A 2019 study followed over 500,000 people for a decade and found that those who replaced red meat with plant-based protein sources had a 10% lower risk of cardiovascular disease. However, the researchers noted that participants who ate plant-based diets also tended to exercise more and smoke less. \n\nWhich detail from the passage most complicates the claim that plant-based diets reduce heart disease?',
 'The study followed over 500,000 people',
 'The study lasted a decade',
 'Plant-based eaters also exercised more and smoked less',
 'Red meat was replaced with plant-based protein',
 'C', 'The confounding lifestyle factors (more exercise, less smoking) make it difficult to attribute the health benefit solely to diet.'),

('Reading Comprehension', 'medium', 'evidence-based', 'The Voyager 1 spacecraft, launched in 1977, crossed into interstellar space in 2012, becoming the first human-made object to leave the solar system. It continues to transmit data from over 15 billion miles away using a 23-watt radio transmitter — roughly the power of a refrigerator light bulb.\n\nWhich detail best supports the claim that Voyager 1''''s communication system is remarkably efficient?', 'It was launched in 1977', 'It crossed into interstellar space in 2012', 'It transmits data from 15 billion miles using a 23-watt transmitter', 'It was the first object to leave the solar system', 'C', 'The contrast between the enormous distance and the tiny power output demonstrates the system''''s remarkable efficiency.'),

('Reading Comprehension', 'medium', 'evidence-based',
 'Ancient Egyptian physicians performed brain surgery as early as 2500 BCE, as evidenced by skulls showing healed bone growth around surgical openings. The healing indicates that patients survived the procedures and lived for months or years afterward. \n\nWhich detail best supports the claim that these surgeries were sometimes successful?',
 'The surgeries occurred as early as 2500 BCE',
 'Skulls with surgical openings have been found',
 'Egyptian physicians performed brain surgery',
 'Healed bone growth around openings shows patients survived',
 'D', 'Healed bone growth proves patients lived long enough after surgery for healing to occur, indicating successful procedures.'),

('Reading Comprehension', 'medium', 'evidence-based',
 'Researchers studying the effects of green spaces on mental health found that people living within 300 meters of a park reported 20% lower rates of depression and anxiety. Importantly, the effect persisted even after controlling for income, age, and pre-existing health conditions. \n\nWhich detail best supports the claim that proximity to parks genuinely improves mental health?',
 'People living near parks reported lower depression rates',
 'The study measured distance to parks in meters',
 'The effect persisted after controlling for income, age, and health conditions',
 'Depression and anxiety were the conditions measured',
 'C', 'Controlling for confounding variables strengthens the case that the parks themselves, not other factors, contribute to better mental health.'),

('Reading Comprehension', 'medium', 'evidence-based',
 'The Inca Empire, despite never developing a written language, maintained detailed records of census data, military organization, and tribute payments using knotted strings called quipu. Some quipu contain thousands of individual knots arranged in complex hierarchical patterns. \n\nWhich detail best supports the claim that quipu were a sophisticated record-keeping system?',
 'The Inca never developed written language',
 'Quipu are made of knotted strings',
 'Quipu tracked census data, military, and tribute information',
 'Some quipu contain thousands of knots in complex hierarchical patterns',
 'D', 'The complexity — thousands of knots in hierarchical patterns — directly demonstrates the sophistication of the system.'),

('Reading Comprehension', 'medium', 'evidence-based',
 'Sleep deprivation studies show that after 24 hours without sleep, cognitive performance declines to a level equivalent to having a blood alcohol concentration of 0.10%, which exceeds the legal driving limit in all U.S. states. Yet unlike alcohol impairment, sleep-deprived individuals often do not recognize their diminished abilities. \n\nWhich detail best supports the claim that sleep deprivation is a public safety concern?',
 'Cognitive performance declines after 24 hours without sleep',
 'Sleep-deprived people don''t recognize their impairment',
 'The legal driving limit is exceeded in all states',
 'Performance equals a blood alcohol level of 0.10%',
 'B', 'Not recognizing impairment is especially dangerous because people may continue driving or operating machinery without realizing they are impaired.'),

('Reading Comprehension', 'medium', 'evidence-based',
 'The Marshall Plan, which provided $13.3 billion in U.S. aid to Western Europe after World War II, is often credited with Europe''s rapid economic recovery. By 1952, every participating country had surpassed its pre-war production levels, and trade between European nations had increased by 40%. \n\nWhich detail best supports the claim that the Marshall Plan achieved its economic goals?',
 'The plan provided $13.3 billion in aid',
 'The aid went to Western Europe after World War II',
 'All participating countries surpassed pre-war production by 1952',
 'The plan is often credited with Europe''s recovery',
 'C', 'Countries surpassing pre-war production levels is concrete evidence that the plan''s economic recovery goals were met.'),

('Reading Comprehension', 'medium', 'evidence-based',
 'Trees in urban areas do more than provide shade; a single mature tree can absorb up to 48 pounds of carbon dioxide per year and release enough oxygen for two people. Cities with extensive tree canopies also report lower rates of respiratory illness among residents. \n\nWhich detail best supports the claim that urban trees improve air quality?',
 'A tree absorbs up to 48 pounds of CO2 and releases oxygen for two people',
 'Trees provide shade in cities',
 'Cities with trees report lower respiratory illness',
 'Urban trees are aesthetically pleasing',
 'A', 'The specific figures on CO2 absorption and oxygen production directly quantify trees'' air quality benefits.'),

('Reading Comprehension', 'medium', 'evidence-based',
 'The Dust Bowl of the 1930s displaced over 2.5 million people from the Great Plains. The crisis was largely caused by farming practices that stripped the topsoil of its native grasses, leaving it vulnerable to wind erosion during a prolonged drought. \n\nWhich detail best supports the claim that human activity contributed to the Dust Bowl?',
 'Over 2.5 million people were displaced',
 'A prolonged drought occurred in the 1930s',
 'Farming practices stripped native grasses from topsoil',
 'The crisis affected the Great Plains',
 'C', 'Farming practices that removed protective vegetation directly show human contribution to the soil erosion.'),

('Reading Comprehension', 'medium', 'evidence-based',
 'A longitudinal study tracked 1,000 children from birth to age 30 and found that those who demonstrated high self-control at age 3 had better health outcomes, higher incomes, and fewer criminal convictions as adults — regardless of their IQ or socioeconomic background. \n\nWhich detail best supports the claim that self-control is a powerful predictor of life outcomes?',
 'The study tracked 1,000 children',
 'Outcomes were measured at age 30',
 'High self-control at age 3 predicted adult outcomes regardless of IQ or background',
 'Self-control was measured in children',
 'C', 'The persistence of the effect across IQ and socioeconomic levels demonstrates that self-control independently predicts outcomes.'),

('Reading Comprehension', 'medium', 'evidence-based', 'After Iceland made its geothermal energy available for home heating in the 1970s, the country''''s dependence on imported oil dropped dramatically. Today, over 90% of Icelandic homes are heated with geothermal energy, and the nation has some of the lowest carbon emissions per capita in Europe.\n\nWhich detail best supports the claim that geothermal energy reduced Iceland''''s carbon footprint?', 'Iceland adopted geothermal heating in the 1970s', 'Oil dependence dropped dramatically', 'Over 90% of homes use geothermal heating', 'Iceland has some of the lowest carbon emissions per capita in Europe', 'D', 'Low carbon emissions per capita directly measures the reduced carbon footprint resulting from geothermal adoption.'),

('Reading Comprehension', 'medium', 'evidence-based',
 'Archaeologists found that the ancient city of Mohenjo-daro, built around 2500 BCE, had a grid-like street layout, standardized brick sizes, and an advanced drainage system with covered sewers. No palaces or temples have been identified, suggesting a society organized differently from other ancient civilizations. \n\nWhich detail best supports the claim that Mohenjo-daro had advanced urban planning?',
 'It was built around 2500 BCE',
 'No palaces or temples have been found',
 'It had grid streets, standardized bricks, and covered sewers',
 'It was different from other ancient civilizations',
 'C', 'Grid streets, standardized construction, and covered sewers are direct evidence of sophisticated urban planning.'),

('Reading Comprehension', 'medium', 'evidence-based',
 'During the 1918 influenza pandemic, cities that implemented social distancing measures early — such as closing schools and banning public gatherings — experienced death rates up to 50% lower than cities that delayed action. St. Louis, which acted quickly, had half the mortality rate of Philadelphia, which waited two weeks. \n\nWhich detail best supports the claim that early intervention saved lives during the 1918 pandemic?',
 'The pandemic occurred in 1918',
 'Cities implemented social distancing measures',
 'Early-acting cities had death rates up to 50% lower',
 'St. Louis had half the mortality rate of Philadelphia',
 'D', 'The specific comparison between St. Louis (early action) and Philadelphia (delayed action) provides the most compelling evidence.'),

('Reading Comprehension', 'medium', 'evidence-based', 'The development of GPS technology, originally designed for military navigation, has transformed civilian life in ways its creators never anticipated. Beyond turn-by-turn directions, GPS now underpins precision agriculture, earthquake monitoring, and the timing systems used by financial markets.\n\nWhich detail best supports the claim that GPS''''s impact extends far beyond navigation?', 'GPS was originally designed for military use', 'GPS provides turn-by-turn directions', 'GPS underpins agriculture, earthquake monitoring, and financial timing systems', 'Its creators never anticipated civilian uses', 'C', 'The diverse applications in agriculture, seismology, and finance demonstrate GPS''''s impact well beyond its original navigation purpose.'),

('Reading Comprehension', 'medium', 'evidence-based',
 'Research on identical twins raised apart has provided valuable insights into the nature-versus-nurture debate. In one famous study, twins separated at birth were found to have remarkably similar IQ scores, personality traits, and even hobbies — despite growing up in completely different environments. \n\nWhich detail best supports the claim that genetics strongly influence personality?',
 'The twins were raised apart',
 'The twins were identical',
 'Separated twins had similar IQ, personality, and hobbies despite different environments',
 'The study contributes to the nature-versus-nurture debate',
 'C', 'Similarity despite different environments directly supports a genetic influence on personality and cognition.'),

('Reading Comprehension', 'medium', 'evidence-based',
 'The transition from horse-drawn carriages to automobiles in the early 1900s happened faster than most people expected. In New York City, horses outnumbered cars in 1905, but by 1915, the ratio had completely reversed, with cars outnumbering horses by a wide margin. \n\nWhich detail best supports the claim that the adoption of automobiles was rapid?',
 'Horse-drawn carriages were common in the early 1900s',
 'New York City is a major urban center',
 'Horses outnumbered cars in 1905 but cars dominated by 1915',
 'The transition happened faster than expected',
 'C', 'The complete reversal within just 10 years provides specific evidence of the rapid pace of adoption.');

-- evidence-based: HARD (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Reading Comprehension', 'hard', 'evidence-based',
 'A meta-analysis of 50 studies on the effects of background music on cognitive performance found that music with lyrics impaired reading comprehension and writing tasks but had no significant effect on mathematical problem-solving. Instrumental music, by contrast, showed a slight positive effect on spatial reasoning tasks. \n\nWhich detail best supports the claim that the effect of background music depends on the type of task?',
 'The analysis reviewed 50 studies',
 'Instrumental music had a positive effect on spatial reasoning',
 'Music with lyrics impaired reading but not math performance',
 'Background music affects cognitive performance',
 'C', 'Different effects on different task types (reading vs. math) directly demonstrate that music''s impact is task-dependent.'),

('Reading Comprehension', 'hard', 'evidence-based',
 'Economists studying the impact of immigration on wages have reached conflicting conclusions. A study of Miami after the 1980 Mariel boatlift found no significant wage depression for native workers, while a re-analysis of the same data using different statistical methods found wage drops of up to 30% among low-skilled natives. \n\nWhich detail best supports the claim that methodological choices significantly affect economic research findings?',
 'Economists have reached conflicting conclusions',
 'The Mariel boatlift occurred in 1980',
 'Different statistical methods applied to the same data produced opposite conclusions',
 'Native workers'' wages were the focus of study',
 'C', 'The same dataset producing opposite findings under different methods directly demonstrates methodology''s influence on results.'),

('Reading Comprehension', 'hard', 'evidence-based', 'A clinical trial tested a new Alzheimer''''s drug on 1,800 patients over 18 months. The treatment group showed a 27% slower rate of cognitive decline compared to the placebo group, but also experienced brain swelling in 21% of cases, leading to a heated debate about whether the benefits justify the risks.\n\nWhich detail from the passage would most support critics who argue the drug''''s risks outweigh its benefits?', 'The trial included 1,800 patients', 'The trial lasted 18 months', 'Cognitive decline slowed by 27%', 'Brain swelling occurred in 21% of cases', 'D', 'A 21% rate of brain swelling is a serious adverse effect that critics would cite against the drug.'),

('Reading Comprehension', 'hard', 'evidence-based', 'Paleontologists discovered soft tissue preserved in a 68-million-year-old Tyrannosaurus rex femur, including what appeared to be blood vessels and cells. While some researchers hailed this as evidence that proteins can survive far longer than previously thought, skeptics suggested the tissue might be bacterial biofilm that merely resembled dinosaur cells.\n\nWhich detail best supports the skeptics'''' position?', 'The femur was 68 million years old', 'Soft tissue was found in the bone', 'The tissue might be bacterial biofilm resembling dinosaur cells', 'Blood vessels and cells were identified', 'C', 'The alternative explanation that the tissue could be bacterial biofilm directly supports the skeptical interpretation.'),

('Reading Comprehension', 'hard', 'evidence-based', 'A study of 30 countries found that those with the highest levels of social trust — where citizens believe most people can be trusted — also had the strongest economic growth and lowest corruption rates. However, the researchers acknowledged that the direction of causation is unclear: prosperity may build trust as much as trust builds prosperity.\n\nWhich detail most complicates a straightforward causal interpretation of the study''''s findings?', 'Thirty countries were studied', 'High-trust countries had lower corruption', 'High-trust countries had stronger economic growth', 'The direction of causation between trust and prosperity is unclear', 'D', 'Acknowledging that causation could run in either direction undermines any simple causal claim.'),

('Reading Comprehension', 'hard', 'evidence-based',
 'Forest fires, while destructive, play a crucial ecological role. The 1988 Yellowstone fires, initially seen as catastrophic, led to a 30% increase in plant species diversity within a decade. Fire-adapted species like lodgepole pines require intense heat to release their seeds, and the nutrient-rich ash provided ideal conditions for regrowth. \n\nWhich detail best supports the claim that fire is ecologically beneficial?',
 'Plant species diversity increased by 30% within a decade',
 'The 1988 fires were initially seen as catastrophic',
 'Lodgepole pines require heat to release seeds',
 'Forest fires are destructive',
 'A', 'A measurable 30% increase in species diversity is the strongest quantitative evidence of ecological benefit.'),

('Reading Comprehension', 'hard', 'evidence-based',
 'Researchers studying the gender pay gap found that women in the United States earn approximately 82 cents for every dollar men earn. When controlling for occupation, experience, and hours worked, the gap narrows to about 95 cents per dollar, leading some analysts to argue the remaining 5-cent gap reflects genuine discrimination while others attribute it to unmeasured factors like negotiation behavior. \n\nWhich detail best supports the argument that the raw pay gap is partly explained by factors other than discrimination?',
 'Women earn 82 cents per dollar compared to men',
 'The gap narrows to 95 cents when controlling for occupation, experience, and hours',
 'Some analysts attribute the remaining gap to discrimination',
 'Others cite unmeasured factors like negotiation behavior',
 'B', 'The gap narrowing significantly when legitimate variables are controlled shows those factors partly explain the raw difference.'),

('Reading Comprehension', 'hard', 'evidence-based',
 'A massive replication project attempted to reproduce the results of 100 landmark psychology studies. Only 39% of the replications produced statistically significant results consistent with the original findings, sparking what has been called psychology''s "replication crisis." Critics note, however, that failed replications may reflect differences in sample populations rather than flaws in the original studies. \n\nWhich detail best supports the claim that psychology faces a credibility problem?',
 'One hundred landmark studies were tested',
 'Failed replications may reflect population differences',
 'Only 39% of replications matched original findings',
 'The phenomenon is called a "replication crisis"',
 'C', 'A success rate of only 39% provides the strongest quantitative evidence of a credibility problem in the field.'),

('Reading Comprehension', 'hard', 'evidence-based',
 'The discovery of high concentrations of iridium in a thin geological layer dating to 66 million years ago provided key evidence for the asteroid impact theory of dinosaur extinction. Iridium is rare on Earth''s surface but abundant in asteroids, and this layer has been found on every continent. \n\nWhich detail best supports the claim that the iridium came from an extraterrestrial source?',
 'The layer dates to 66 million years ago',
 'The iridium layer has been found on every continent',
 'Iridium is rare on Earth but abundant in asteroids',
 'The finding supports the asteroid impact theory',
 'C', 'The contrast between iridium''s rarity on Earth and abundance in asteroids directly supports an extraterrestrial origin.'),

('Reading Comprehension', 'hard', 'evidence-based',
 'A randomized controlled trial of a mindfulness meditation program found that participants who meditated for 8 weeks showed reduced activity in the amygdala — the brain''s fear center — when exposed to stressful images, compared to a control group. Notably, the changes persisted even when participants were not actively meditating, suggesting lasting neural rewiring. \n\nWhich detail best supports the claim that meditation produces lasting brain changes?',
 'The trial lasted 8 weeks',
 'Amygdala activity was reduced',
 'The study was a randomized controlled trial',
 'Changes persisted even when participants were not meditating',
 'D', 'Persistence of brain changes outside of meditation sessions demonstrates lasting effects rather than temporary states.'),

('Reading Comprehension', 'hard', 'evidence-based',
 'Economic historians have found that countries colonized by European powers that established extractive institutions — designed to transfer wealth to colonizers — tend to be poorer today than countries where settlers created inclusive institutions. This pattern holds even after accounting for geography, natural resources, and pre-colonial population density. \n\nWhich detail best supports the claim that colonial institutions have long-lasting economic effects?',
 'European powers established extractive institutions',
 'Some colonies had inclusive institutions',
 'The pattern holds after accounting for geography, resources, and pre-colonial density',
 'Extractive institutions transferred wealth to colonizers',
 'C', 'The pattern persisting after controlling for alternative explanations strengthens the case for institutional effects.'),

('Reading Comprehension', 'hard', 'evidence-based',
 'A study comparing organic and conventional farming found that organic farms produced 20% lower yields per acre but required 50% less energy input and maintained significantly higher soil biodiversity. The researchers concluded that neither system was categorically superior, as the optimal approach depends on whether one prioritizes productivity, environmental sustainability, or long-term soil health. \n\nWhich detail best supports the argument that organic farming has environmental advantages?',
 'Organic farms had 20% lower yields',
 'Organic farming required 50% less energy and maintained higher soil biodiversity',
 'Neither system was categorically superior',
 'The optimal approach depends on priorities',
 'B', 'Lower energy use and higher soil biodiversity are direct environmental advantages of organic farming.'),

('Reading Comprehension', 'hard', 'evidence-based',
 'Linguists studying language death project that nearly half of the world''s 7,000 languages will disappear by 2100. In many cases, the final generation of speakers is elderly and has no one to pass the language to, as younger generations adopt dominant national languages for economic opportunity. \n\nWhich detail best supports the claim that economic factors drive language extinction?',
 'Nearly half of all languages may disappear by 2100',
 'The final speakers are often elderly',
 'There are approximately 7,000 languages worldwide',
 'Younger generations adopt dominant languages for economic opportunity',
 'D', 'Younger generations switching languages for economic reasons directly links language loss to economic factors.'),

('Reading Comprehension', 'hard', 'evidence-based', 'A controversial study claimed that exposure to violent video games increased aggression in adolescents. However, a subsequent analysis of the same data revealed that the effect size was extremely small — equivalent to the correlation between eating ice cream and drowning — and that the original authors had selectively reported only their most dramatic findings.\n\nWhich detail most effectively undermines the original study''''s conclusions?', 'The study focused on adolescents', 'Violent video games were the variable tested', 'The effect size was extremely small and findings were selectively reported', 'A subsequent analysis examined the same data', 'C', 'Both the trivial effect size and selective reporting directly undermine the credibility of the original conclusions.'),

('Reading Comprehension', 'hard', 'evidence-based',
 'The introduction of wolves to Isle Royale in the 1940s created one of ecology''s longest-running natural experiments. When the wolf population crashed due to inbreeding in the 2010s, the moose population tripled within five years, leading to severe overgrazing of balsam fir trees and measurable declines in forest density. \n\nWhich detail best supports the claim that predators regulate ecosystem health?',
 'Wolves arrived on Isle Royale in the 1940s',
 'The wolf population crashed due to inbreeding',
 'Moose tripled and forests declined when wolves disappeared',
 'Isle Royale is a long-running natural experiment',
 'C', 'The cascade from wolf loss to moose explosion to forest decline demonstrates predators'' regulatory role.'),

('Reading Comprehension', 'hard', 'evidence-based',
 'Recent brain imaging studies have shown that London taxi drivers, who must memorize the city''s complex street layout to pass "The Knowledge" exam, have significantly larger hippocampi than control subjects. Furthermore, hippocampal volume correlated positively with years of driving experience, suggesting the brain physically adapts to navigational demands. \n\nWhich detail best supports the claim that the brain changes in response to experience?',
 'London taxi drivers must pass "The Knowledge" exam',
 'Taxi drivers have larger hippocampi than control subjects',
 'Hippocampal volume correlated with years of experience',
 'Brain imaging studies were used',
 'C', 'A correlation between brain size and years of experience specifically suggests ongoing, experience-driven adaptation.'),

('Reading Comprehension', 'hard', 'evidence-based', 'Proponents of nuclear energy note that it produces nearly zero carbon emissions during operation and generates more electricity per unit of land than any renewable source. Critics counter that the risks of catastrophic accidents, while statistically rare, carry consequences so severe — as demonstrated by Chernobyl and Fukushima — that probability alone cannot capture the true risk.\n\nWhich detail best supports the critics'''' position that nuclear energy is too risky?', 'Nuclear produces nearly zero carbon emissions', 'Nuclear generates more electricity per unit of land than renewables', 'Catastrophic accidents are statistically rare', 'Chernobyl and Fukushima demonstrate consequences so severe that probability alone is insufficient', 'D', 'Citing real disasters where consequences were catastrophic supports the argument that statistical rarity does not adequately measure nuclear risk.'),

('Reading Comprehension', 'hard', 'evidence-based',
 'An international research team found that ancient DNA from a 40,000-year-old bone in Romania showed that the individual had a Neanderthal ancestor just four to six generations back. This discovery provided the most direct evidence yet that interbreeding between Homo sapiens and Neanderthals was not a rare event but occurred repeatedly across generations. \n\nWhich detail best supports the claim that interbreeding was common rather than exceptional?',
 'The bone was found in Romania',
 'The individual was 40,000 years old',
 'A Neanderthal ancestor was just 4-6 generations back',
 'Ancient DNA was successfully extracted',
 'C', 'Having a Neanderthal ancestor only 4-6 generations back indicates recent and therefore likely frequent interbreeding.');

-- ============================================================
-- SUBTOPIC 3: vocabulary-in-context (54 questions)
-- ============================================================

-- vocabulary-in-context: EASY (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Reading Comprehension', 'easy', 'vocabulary-in-context', 'The new park was a welcome addition to the neighborhood, providing residents with a much-needed green space for recreation and relaxation.\n\nAs used in the passage, "welcome" most nearly means', 'Appreciated', 'Greeted', 'Invited', 'Permitted', 'A', 'In this context, "welcome" means appreciated or gladly received, not the act of greeting someone.'),

('Reading Comprehension', 'easy', 'vocabulary-in-context', 'The scientist conducted a series of trials to determine whether the new fertilizer would boost crop yields under different weather conditions.\n\nAs used in the passage, "trials" most nearly means', 'Legal proceedings', 'Competitions', 'Hardships', 'Experiments', 'D', 'In a scientific context, "trials" refers to experiments or tests, not legal proceedings or difficulties.'),

('Reading Comprehension', 'easy', 'vocabulary-in-context', 'After weeks of negotiations, the two countries reached a settlement that addressed the border dispute and restored diplomatic relations.\n\nAs used in the passage, "settlement" most nearly means', 'A small town', 'A payment of money', 'An agreement resolving a dispute', 'A place where people live', 'C', 'Here "settlement" refers to a negotiated agreement, not a physical community or financial payment.'),

('Reading Comprehension', 'easy', 'vocabulary-in-context', 'The novel''''s plot was so engaging that readers found it difficult to put the book down once they had started the first chapter.\n\nAs used in the passage, "engaging" most nearly means', 'Employing', 'Connecting', 'Promising', 'Captivating', 'D', 'In this context, "engaging" means captivating or holding one''''s attention, not hiring or making a promise.'),

('Reading Comprehension', 'easy', 'vocabulary-in-context', 'The coach stressed the importance of practice, reminding the team that consistent effort was the foundation of success in any sport.\n\nAs used in the passage, "stressed" most nearly means', 'Felt anxious about', 'Put pressure on', 'Emphasized', 'Stretched', 'C', 'Here "stressed" means emphasized or highlighted, not experiencing anxiety or applying physical pressure.'),

('Reading Comprehension', 'easy', 'vocabulary-in-context', 'The charity drive was a huge success, raising enough funds to support the local food bank for an entire year.\n\nAs used in the passage, "drive" most nearly means', 'A road trip', 'An organized campaign', 'A strong motivation', 'A golf shot', 'B', 'In this context, "drive" refers to an organized effort or campaign to collect donations.'),

('Reading Comprehension', 'easy', 'vocabulary-in-context', 'The artist''''s latest exhibit was striking, with bold colors and unusual shapes that immediately captured visitors'''' attention.\n\nAs used in the passage, "striking" most nearly means', 'Hitting', 'Remarkable and eye-catching', 'Surprising', 'Aggressive', 'B', 'Here "striking" describes something visually remarkable and attention-grabbing, not physical hitting.'),

('Reading Comprehension', 'easy', 'vocabulary-in-context', 'The government launched a program to address the growing demand for affordable housing in urban areas.\n\nAs used in the passage, "address" most nearly means', 'Speak to', 'A location', 'Deal with', 'Label', 'C', 'In this context, "address" means to deal with or respond to a problem, not a physical location or speech.'),

('Reading Comprehension', 'easy', 'vocabulary-in-context', 'The company''''s stock took a sharp decline after the CEO unexpectedly resigned, causing investors to worry about the firm''''s future direction.\n\nAs used in the passage, "sharp" most nearly means', 'Having a fine edge', 'Intelligent', 'Sudden and steep', 'Harsh in tone', 'C', 'Here "sharp" describes a sudden, steep decrease in stock value, not a physical edge or intelligence.'),

('Reading Comprehension', 'easy', 'vocabulary-in-context', 'The detective followed a promising lead that ultimately brought her closer to solving the decade-old case.\n\nAs used in the passage, "lead" most nearly means', 'A metal element', 'A position at the front', 'A clue or piece of information', 'A leash for an animal', 'C', 'In this investigative context, "lead" means a clue that guides an investigation.'),

('Reading Comprehension', 'easy', 'vocabulary-in-context', 'The committee decided to table the discussion until more data could be gathered to support either side of the argument.\n\nAs used in the passage, "table" most nearly means', 'A piece of furniture', 'Postpone', 'Organize neatly', 'Present formally', 'B', 'In this context, "table" means to postpone or delay discussion of a topic.'),

('Reading Comprehension', 'easy', 'vocabulary-in-context', 'The teacher noted that the student''''s composition showed a clear grasp of the material and a mature writing style.\n\nAs used in the passage, "composition" most nearly means', 'A musical piece', 'The makeup of something', 'A written essay', 'A chemical compound', 'C', 'In an academic context about student work, "composition" refers to a written essay or paper.'),

('Reading Comprehension', 'easy', 'vocabulary-in-context', 'Heavy rainfall caused the river to swell rapidly, forcing authorities to issue evacuation warnings for communities along its banks.\n\nAs used in the passage, "banks" most nearly means', 'Financial institutions', 'The edges of the river', 'Rows of objects', 'Steep slopes', 'B', 'In this context about a river, "banks" refers to the land along the sides of the river.'),

('Reading Comprehension', 'easy', 'vocabulary-in-context', 'The museum''''s collection spans five centuries of European art, from medieval religious paintings to contemporary abstract works.\n\nAs used in the passage, "spans" most nearly means', 'Covers or extends across', 'Bridges across', 'Short periods of time', 'Measurements of width', 'A', 'Here "spans" means covers or extends across a range of time, not physical bridging.'),

('Reading Comprehension', 'easy', 'vocabulary-in-context', 'The principal acknowledged that the school''''s current policies were outdated and pledged to draft new guidelines by the end of the semester.\n\nAs used in the passage, "draft" most nearly means', 'A preliminary version to write up', 'A gust of air', 'Select for military service', 'A bank payment order', 'A', 'In this context, "draft" means to write or prepare a preliminary version of the new guidelines.'),

('Reading Comprehension', 'easy', 'vocabulary-in-context', 'The volcano had been dormant for over 300 years before it suddenly erupted, catching nearby residents completely off guard.\n\nAs used in the passage, "dormant" most nearly means', 'Inactive', 'Sleeping', 'Dead', 'Calm', 'A', 'Here "dormant" means inactive or not currently erupting, not literally sleeping or permanently dead.'),

('Reading Comprehension', 'easy', 'vocabulary-in-context', 'The candidate''''s platform included proposals for tax reform, improved infrastructure, and expanded access to healthcare.\n\nAs used in the passage, "platform" most nearly means', 'A raised surface', 'A set of policies or positions', 'A train station area', 'A computer operating system', 'B', 'In a political context, "platform" refers to a set of stated policies and positions a candidate runs on.'),

('Reading Comprehension', 'easy', 'vocabulary-in-context', 'The rescue team worked around the clock to recover survivors from the collapsed building, refusing to abandon their efforts despite dangerous conditions.\n\nAs used in the passage, "recover" most nearly means', 'Get better from illness', 'Regain possession of', 'Find and bring back', 'Cover again', 'C', 'Here "recover" means to find and rescue or retrieve survivors from the rubble.');

-- vocabulary-in-context: MEDIUM (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Reading Comprehension', 'medium', 'vocabulary-in-context', 'The diplomat''''s measured response to the crisis helped prevent the situation from escalating into a full-scale conflict between the two nations.\n\nAs used in the passage, "measured" most nearly means', 'Quantified precisely', 'Careful and deliberate', 'Timed accurately', 'Proportional in size', 'B', 'Here "measured" describes a careful, controlled response rather than one that was literally quantified or timed.'),

('Reading Comprehension', 'medium', 'vocabulary-in-context', 'The journalist cultivated relationships with sources across the political spectrum, which allowed her to produce balanced and well-informed reporting.\n\nAs used in the passage, "cultivated" most nearly means', 'Farmed', 'Refined in manners', 'Carefully developed over time', 'Planted seeds for', 'C', 'In this context, "cultivated" means carefully developed and nurtured over time, using the agricultural metaphor figuratively.'),

('Reading Comprehension', 'medium', 'vocabulary-in-context',
 'The architect''s bold design polarized opinion: some critics called it visionary, while others dismissed it as an exercise in vanity that ignored the needs of the community.\n\nAs used in the passage, "exercise" most nearly means',
 'A display or demonstration',
 'Physical activity',
 'A practice drill',
 'The use of a right or power',
 'A', 'Here "exercise" means a display or demonstration of something (vanity), not physical fitness or practice.'),

('Reading Comprehension', 'medium', 'vocabulary-in-context', 'The author''''s prose was economical, conveying complex ideas in remarkably few words without sacrificing clarity or depth.\n\nAs used in the passage, "economical" most nearly means', 'Inexpensive', 'Thrifty with money', 'Related to finances', 'Efficient and concise', 'D', 'Here "economical" describes writing that uses words efficiently, not something related to money or cost.'),

('Reading Comprehension', 'medium', 'vocabulary-in-context', 'The company''''s aggressive expansion into foreign markets was tempered by cautious financial planning that ensured the firm did not overextend its resources.\n\nAs used in the passage, "tempered" most nearly means', 'Heated and cooled metal', 'Made angry', 'Moderated or balanced', 'Adjusted the temperature of', 'C', 'In this context, "tempered" means moderated or balanced, suggesting that caution offset the aggressiveness.'),

('Reading Comprehension', 'medium', 'vocabulary-in-context', 'Critics praised the novel for its arresting opening chapter, which plunged readers into the story''''s central conflict without any preamble.\n\nAs used in the passage, "arresting" most nearly means', 'Related to law enforcement', 'Stopping movement', 'Strikingly attention-grabbing', 'Frightening', 'C', 'Here "arresting" means strikingly attention-grabbing, using the metaphor of stopping someone in their tracks.'),

('Reading Comprehension', 'medium', 'vocabulary-in-context', 'The senator''''s position on healthcare reform has evolved considerably since she first took office, reflecting both changing public sentiment and new research findings.\n\nAs used in the passage, "evolved" most nearly means', 'Undergone biological evolution', 'Become more scientific', 'Improved dramatically', 'Changed gradually over time', 'D', 'Here "evolved" means changed or developed gradually, not biological evolution or necessarily improvement.'),

('Reading Comprehension', 'medium', 'vocabulary-in-context', 'The mountain pass was treacherous in winter, with icy roads and poor visibility making the journey perilous for even the most experienced drivers.\n\nAs used in the passage, "treacherous" most nearly means', 'Dangerously unpredictable', 'Disloyal or betraying trust', 'Deceptive in appearance', 'Difficult to navigate', 'A', 'In this context, "treacherous" describes conditions that are dangerously unpredictable, not personal betrayal.'),

('Reading Comprehension', 'medium', 'vocabulary-in-context', 'The professor''''s lecture on quantum mechanics was dense with technical terminology, but her use of analogies made the material accessible to students with no physics background.\n\nAs used in the passage, "dense" most nearly means', 'Thick in physical consistency', 'Packed with information', 'Difficult to understand', 'Unintelligent', 'B', 'Here "dense" means packed tightly with content, describing the concentration of technical terms in the lecture.'),

('Reading Comprehension', 'medium', 'vocabulary-in-context', 'The documentary cast new light on the controversy surrounding the dam project, revealing that environmental assessments had been deliberately suppressed by local officials.\n\nAs used in the passage, "cast" most nearly means', 'Threw', 'Assigned roles in a play', 'Projected or directed', 'Formed in a mold', 'C', 'Here "cast new light" means projected or shed new understanding, an idiomatic use meaning to reveal new information.'),

('Reading Comprehension', 'medium', 'vocabulary-in-context', 'The startup''''s founder was disarmingly candid about the company''''s early failures, explaining that transparency about mistakes helped build trust with investors.\n\nAs used in the passage, "disarmingly" most nearly means', 'In a way that removes weapons', 'In an overly honest way', 'In a threatening manner', 'In a surprisingly open way that reduces suspicion', 'D', 'Here "disarmingly" means in a way that is so open and genuine that it reduces defensiveness or suspicion in others.'),

('Reading Comprehension', 'medium', 'vocabulary-in-context', 'The orchestra''''s rendering of Beethoven''''s Ninth Symphony was technically flawless but lacked the emotional intensity that distinguishes a good performance from a great one.\n\nAs used in the passage, "rendering" most nearly means', 'A visual drawing or image', 'A computer-generated image', 'The process of extracting fat', 'An interpretation or performance', 'D', 'In this musical context, "rendering" means the orchestra''''s interpretation and performance of the piece.'),

('Reading Comprehension', 'medium', 'vocabulary-in-context', 'The historian argued that the treaty''''s harsh terms sowed the seeds of future conflict, creating resentment that would fester for decades before erupting into war.\n\nAs used in the passage, "sowed" most nearly means', 'Planted crops', 'Stitched fabric', 'Created the conditions for', 'Distributed evenly', 'C', 'Here "sowed the seeds" is a metaphor meaning created the underlying conditions that would eventually lead to conflict.'),

('Reading Comprehension', 'medium', 'vocabulary-in-context', 'The city''''s public transit system, once considered a model of efficiency, has deteriorated markedly in recent years due to budget cuts and deferred maintenance.\n\nAs used in the passage, "model" most nearly means', 'An exemplary standard', 'A small replica', 'A fashion model', 'A theoretical framework', 'A', 'In this context, "model" means an exemplary standard or ideal example that others might emulate.'),

('Reading Comprehension', 'medium', 'vocabulary-in-context', 'The CEO maintained that the company''''s pivot to renewable energy was not merely a strategic calculation but a genuine commitment to environmental responsibility.\n\nAs used in the passage, "pivot" most nearly means', 'A fundamental shift in direction', 'A rotation on a fixed point', 'A basketball move', 'A central or crucial element', 'A', 'In this business context, "pivot" means a fundamental change in strategic direction.'),

('Reading Comprehension', 'medium', 'vocabulary-in-context', 'The poet''''s spare verse conveyed a depth of emotion that more ornate writing often fails to achieve, proving that restraint can be more powerful than excess.\n\nAs used in the passage, "spare" most nearly means', 'Minimal and unadorned', 'Extra or leftover', 'Thin in build', 'To show mercy', 'A', 'Here "spare" describes writing that is minimal and stripped down, contrasted with "ornate" style.'),

('Reading Comprehension', 'medium', 'vocabulary-in-context', 'The activist was known for her galvanizing speeches, which could transform passive audiences into energized participants ready to take action.\n\nAs used in the passage, "galvanizing" most nearly means', 'Coating with zinc', 'Shocking or startling', 'Inspiring to action', 'Electrically charging', 'C', 'In this context, "galvanizing" means inspiring people to take action, derived from but figurative beyond the electrical meaning.'),

('Reading Comprehension', 'medium', 'vocabulary-in-context', 'The author''''s new memoir was notable for its unflinching honesty, sparing neither herself nor her family from critical examination.\n\nAs used in the passage, "unflinching" most nearly means', 'Without physical movement', 'Resolute and unwavering', 'Painless', 'Aggressive and confrontational', 'B', 'Here "unflinching" means resolute and unwavering in the face of difficult truths, showing steadfast honesty.');

-- vocabulary-in-context: HARD (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The professor''''s argument was compelling but ultimately tendentious, as she consistently presented evidence favoring her thesis while downplaying contradictory findings.\n\nAs used in the passage, "tendentious" most nearly means', 'Tending toward a conclusion', 'Controversial and provocative', 'Showing strong bias toward a particular viewpoint', 'Carefully reasoned', 'C', 'Here "tendentious" means exhibiting a strong bias, as evidenced by the selective presentation of evidence.'),

('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The novel''''s protagonist exhibited a studied nonchalance that barely concealed the turmoil roiling beneath her calm exterior.\n\nAs used in the passage, "studied" most nearly means', 'Academically researched', 'Deliberately practiced or affected', 'Carefully observed by others', 'Well-educated', 'B', 'Here "studied" means deliberately practiced or affected rather than natural, suggesting the character is performing calmness.'),

('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The essayist offered a trenchant critique of modern consumer culture, exposing contradictions that most commentators had been content to overlook.\n\nAs used in the passage, "trenchant" most nearly means', 'Incisively sharp and penetrating', 'Digging a trench', 'Lengthy and detailed', 'Bitter and resentful', 'A', '"Trenchant" means keen, incisive, and penetrating in analysis, cutting through superficiality to expose deeper truths.'),

('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The diplomat''''s equivocal response to questions about the treaty left journalists uncertain about whether her government actually supported the agreement.\n\nAs used in the passage, "equivocal" most nearly means', 'Equal in value', 'Carefully diplomatic', 'Clearly negative', 'Ambiguous and open to multiple interpretations', 'D', '"Equivocal" means deliberately ambiguous, allowing different interpretations — as shown by the journalists'''' uncertainty.'),

('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The researcher''''s findings were provisional, based on a small sample size that precluded definitive conclusions but nonetheless pointed toward a promising avenue of inquiry.\n\nAs used in the passage, "provisional" most nearly means', 'Related to a province', 'Preliminary but conclusive', 'Temporary and subject to revision', 'Provided as a condition', 'C', '"Provisional" means tentative and subject to change, appropriate given the small sample size.'),

('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The critic described the filmmaker''''s latest work as a pastiche of earlier genres, combining elements of noir, western, and romantic comedy into something both familiar and strangely original.\n\nAs used in the passage, "pastiche" most nearly means', 'An imitation or homage blending multiple styles', 'A poor-quality copy', 'A random assortment', 'A deliberate parody', 'A', 'Here "pastiche" refers to a work that combines elements from multiple sources or styles, creating something new from familiar parts.'),

('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The philosopher''''s writing was deliberately opaque, requiring readers to wrestle with each sentence before its meaning would yield itself — a style that attracted devoted followers and frustrated everyone else.\n\nAs used in the passage, "opaque" most nearly means', 'Not transparent to light', 'Deliberately deceptive', 'Dark in color', 'Difficult to understand or interpret', 'D', 'Here "opaque" means difficult to understand, using the metaphor of something that cannot be seen through.'),

('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The governor''''s erstwhile allies abandoned her after the scandal, leaving her politically isolated at the very moment she most needed support.\n\nAs used in the passage, "erstwhile" most nearly means', 'Longtime and devoted', 'Former', 'Reluctant', 'Powerful', 'B', '"Erstwhile" means former or previous, indicating these allies no longer support the governor.'),

('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The playwright''''s work was lauded for its verisimilitude: the dialogue sounded so authentic that audiences felt they were eavesdropping on real conversations rather than watching a performance.\n\nAs used in the passage, "verisimilitude" most nearly means', 'The appearance of being true or real', 'Artistic beauty', 'Historical accuracy', 'Emotional depth', 'A', '"Verisimilitude" means the quality of appearing real or true to life, which the authentic-sounding dialogue exemplifies.'),

('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The artist''''s reputation, once seemingly unassailable, was undermined by revelations that several of her most celebrated works had been produced by uncredited assistants.\n\nAs used in the passage, "unassailable" most nearly means', 'Physically impenetrable', 'Impossible to attack or question', 'Extremely popular', 'Morally upright', 'B', '"Unassailable" means unable to be attacked or challenged, describing a reputation that seemed beyond criticism.'),

('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The CEO''''s sanguine forecast of record profits struck many analysts as dangerously overconfident given the deteriorating economic indicators.\n\nAs used in the passage, "sanguine" most nearly means', 'Optimistic and confident', 'Blood-red', 'Realistic and grounded', 'Reckless', 'A', '"Sanguine" means optimistic or positive in outlook, and the passage notes analysts found this optimism excessive.'),

('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The memoir''''s author adopted a wry tone throughout, treating even her most painful experiences with a dry humor that prevented the narrative from becoming maudlin.\n\nAs used in the passage, "maudlin" most nearly means', 'Excessively sentimental', 'Darkly humorous', 'Brutally honest', 'Emotionally detached', 'A', '"Maudlin" means excessively sentimental or tearfully emotional, which the author''''s dry humor avoids.'),

('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The researcher was circumspect in her claims, carefully qualifying each conclusion with acknowledgment of the study''''s limitations and alternative explanations.\n\nAs used in the passage, "circumspect" most nearly means', 'Looking around in all directions', 'Thorough in methodology', 'Suspicious of others', 'Cautious and prudent', 'D', '"Circumspect" means wary and careful about potential consequences, shown here through the researcher''''s careful qualifications.'),

('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The politician''''s speech was laced with specious reasoning that sounded persuasive on the surface but collapsed under even minimal scrutiny.\n\nAs used in the passage, "specious" most nearly means', 'Related to species', 'Obviously false', 'Specifically targeted', 'Misleadingly attractive or plausible', 'D', '"Specious" describes reasoning that appears valid but is actually flawed — superficially plausible but logically unsound.'),

('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The historian''''s magisterial account of the Roman Empire drew on decades of research and offered a sweeping yet nuanced perspective that few scholars could rival.\n\nAs used in the passage, "magisterial" most nearly means', 'Related to a magistrate', 'Pedantic and overbearing', 'Authoritative and commanding in scope', 'Scholarly but dry', 'C', '"Magisterial" here means authoritative, comprehensive, and masterfully executed, reflecting the breadth and depth of the work.'),

('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The negotiations reached an impasse when neither side would countenance any compromise on the distribution of water rights, each claiming historical precedent for its position.\n\nAs used in the passage, "countenance" most nearly means', 'Show a facial expression', 'Physically face', 'Support publicly', 'Tolerate or accept', 'D', 'In this context, "countenance" means to tolerate, accept, or be willing to consider, not a facial expression.'),

('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The novel was remarkable for its protean narrator, who shifted seamlessly between voices, perspectives, and even time periods, defying the reader''''s attempts to pin down a single identity.\n\nAs used in the passage, "protean" most nearly means', 'Related to protein', 'Constantly changing in form or character', 'Protective and defensive', 'Ancient and mythological', 'B', '"Protean" means versatile and constantly changing, derived from the shape-shifting Greek god Proteus.'),

('Reading Comprehension', 'hard', 'vocabulary-in-context', 'The editorial''''s ostensible purpose was to celebrate the new policy, but its sardonic tone and careful selection of damning statistics betrayed the author''''s true intent: a devastating critique.\n\nAs used in the passage, "ostensible" most nearly means', 'Obvious and clear', 'Apparent but not necessarily real', 'Deliberately stated', 'Original and intended', 'B', '"Ostensible" means appearing to be true on the surface but potentially concealing a different reality, as the passage reveals.');

-- ============================================================
-- SUBTOPIC 4: inference (54 questions)
-- ============================================================

-- inference: EASY (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Reading Comprehension', 'easy', 'inference',
 'After the factory closed, many families in the small town began moving to the city in search of work. Within five years, several local businesses had shut down and the school enrollment had dropped by half. \n\nWhat can be reasonably inferred from this passage?',
 'The factory was the town''s primary employer',
 'The factory closed because of poor management',
 'City jobs paid better than factory jobs',
 'The school was poorly managed',
 'A', 'The widespread departure and economic decline after the factory closure suggest it was the main source of employment.'),

('Reading Comprehension', 'easy', 'inference',
 'When Sarah arrived at the restaurant, the tables were decorated with candles and flowers, and a string quartet was playing softly in the corner. She looked down at her jeans and sneakers with dismay. \n\nWhat can be reasonably inferred from this passage?',
 'Sarah does not like restaurants',
 'The restaurant does not have a dress code',
 'Sarah cannot afford a nice restaurant',
 'Sarah felt underdressed for the setting',
 'D', 'Sarah''s dismay at her casual clothing in an elegant setting suggests she felt underdressed.'),

('Reading Comprehension', 'easy', 'inference',
 'The library received a large donation of books last month, but the shelves were already full. The librarian has begun organizing a book sale for community members. \n\nWhat can be reasonably inferred from this passage?',
 'The library needs to make room for the new books',
 'The donated books are not worth keeping',
 'The library is closing down',
 'Community members cannot afford to buy books',
 'A', 'With full shelves and new donations, the book sale is likely a way to create space for the new arrivals.'),

('Reading Comprehension', 'easy', 'inference',
 'The pet store had a large tank of tropical fish near the entrance and several cages of colorful birds along the back wall. A young boy pressed his face against the fish tank while his mother read the price tags nearby. \n\nWhat can be reasonably inferred about the boy?',
 'He wants to buy a bird',
 'He has been to the store before',
 'He is afraid of the birds',
 'He is interested in the tropical fish',
 'D', 'The boy pressing his face against the fish tank suggests he is fascinated by the tropical fish.'),

('Reading Comprehension', 'easy', 'inference', 'After three straight days of rain, the soccer field was covered in puddles and the ground was soft and muddy. The coach sent a message to all parents that evening.\n\nWhat can be reasonably inferred about the coach''''s message?', 'The coach announced a new practice schedule', 'The coach requested new equipment', 'The coach asked parents to volunteer', 'The coach likely canceled or postponed the game', 'D', 'The poor field conditions strongly suggest the coach''''s message was about canceling or postponing the game.'),

('Reading Comprehension', 'easy', 'inference',
 'Maria studied for her biology exam every night for two weeks. On the day of the test, she finished before most of her classmates and walked out of the room smiling. \n\nWhat can be reasonably inferred from this passage?',
 'Maria found the exam easy because she was well-prepared',
 'Maria gave up on the exam early',
 'Maria''s classmates did not study',
 'Biology is Maria''s favorite subject',
 'A', 'Her extensive preparation, quick completion, and smiling suggest she felt confident the exam went well.'),

('Reading Comprehension', 'easy', 'inference',
 'The old lighthouse had not been used for navigation since the 1960s, when electronic instruments replaced it. Now repainted and surrounded by a small garden, it attracts dozens of visitors each weekend. \n\nWhat can be reasonably inferred about the lighthouse?',
 'It has been converted into a tourist attraction',
 'It is still used for navigation at night',
 'It was recently built',
 'It is in a state of disrepair',
 'A', 'The repainting, garden, and regular weekend visitors suggest the lighthouse has become a tourist attraction.'),

('Reading Comprehension', 'easy', 'inference',
 'The grocery store placed signs reading "Limit 2 per customer" on the bottled water display. Outside, the sky was darkening rapidly and the wind had begun to pick up. \n\nWhat can be reasonably inferred from this passage?',
 'A storm is approaching and people are stocking up on supplies',
 'The store is running a sale on water',
 'Bottled water is always in short supply',
 'The store is about to close for the day',
 'A', 'Purchase limits combined with approaching severe weather suggest storm preparation.'),

('Reading Comprehension', 'easy', 'inference', 'The farmer examined the dry, cracked soil and looked up at the cloudless sky. He shook his head slowly and walked back toward the barn.\n\nWhat can be reasonably inferred about the farmer''''s concern?', 'He is worried about a lack of rain for his crops', 'He is planning to sell his farm', 'He is excited about the sunny weather', 'He needs to repair the barn', 'A', 'Dry cracked soil, cloudless skies, and his discouraged reaction suggest worry about drought affecting crops.'),

('Reading Comprehension', 'easy', 'inference',
 'The bookstore on Main Street has been open for 40 years, but last month the owner started a "going out of business" sale. Several longtime customers were seen carrying armfuls of books to their cars. \n\nWhat can be reasonably inferred from this passage?',
 'The bookstore is closing permanently',
 'The owner is remodeling the store',
 'The books are free',
 'The customers are buying gifts',
 'A', 'A "going out of business" sale indicates the store is closing for good.'),

('Reading Comprehension', 'easy', 'inference',
 'The new student sat alone at lunch for the first three days of school. On the fourth day, a girl from his math class invited him to sit with her group. \n\nWhat can be reasonably inferred about the new student before the fourth day?',
 'He preferred eating alone',
 'He had not yet made friends at the school',
 'He did not like the cafeteria food',
 'He was being bullied by other students',
 'B', 'Sitting alone for three days suggests he had not yet connected with other students.'),

('Reading Comprehension', 'easy', 'inference',
 'The concert hall was completely silent after the final note faded. Then, as if a spell had broken, the entire audience rose to its feet in thunderous applause. \n\nWhat can be reasonably inferred about the performance?',
 'The audience found it deeply moving',
 'The audience was confused by the ending',
 'The concert was too loud',
 'Only a few people enjoyed the performance',
 'A', 'The stunned silence followed by a standing ovation indicates the audience was deeply moved.'),

('Reading Comprehension', 'easy', 'inference',
 'The detective noticed that although the room appeared undisturbed, a thin layer of dust covered every surface except the desk drawer handle. \n\nWhat can be reasonably inferred from this observation?',
 'Someone had recently opened the desk drawer',
 'The room had not been cleaned in weeks',
 'The detective was looking for fingerprints',
 'The room was rarely used',
 'A', 'Dust on everything except the drawer handle suggests someone recently touched and opened it.'),

('Reading Comprehension', 'easy', 'inference', 'The town council voted to install speed bumps on Elm Street after receiving dozens of complaints from residents about cars racing through the neighborhood.\n\nWhat can be reasonably inferred about the council''''s decision?', 'It was a response to safety concerns from residents', 'The council wanted to discourage people from using Elm Street', 'Speed bumps are the cheapest traffic solution', 'Residents asked for stop signs instead', 'A', 'The complaints about speeding cars and the installation of speed bumps together indicate a safety response.'),

('Reading Comprehension', 'easy', 'inference',
 'The museum guard noticed that the painting on the east wall was hanging slightly crooked and that a small piece of the frame was chipped. He immediately called his supervisor. \n\nWhat can be reasonably inferred about why the guard called his supervisor?',
 'He suspected the painting may have been tampered with',
 'He wanted the wall repainted',
 'He was going on break',
 'He wanted to straighten the painting himself',
 'A', 'In a museum setting, a crooked painting with frame damage would raise concerns about tampering or damage.'),

('Reading Comprehension', 'easy', 'inference',
 'The flowers in the garden were wilting and the lawn had turned brown, even though it was only mid-July. The homeowner''s neighbor, however, had a lush green yard with vibrant blooms. \n\nWhat can be reasonably inferred from this passage?',
 'The homeowner has not been watering the garden regularly',
 'The neighbor uses artificial grass',
 'It has not rained all summer',
 'The homeowner recently moved in',
 'A', 'The contrast with the neighbor''s healthy yard suggests the issue is the homeowner''s maintenance, not weather.'),

('Reading Comprehension', 'easy', 'inference',
 'The restaurant owner placed a "Help Wanted" sign in the window and began offering a signing bonus to new hires. She also raised the starting wage by two dollars per hour. \n\nWhat can be reasonably inferred about the restaurant?',
 'It is having difficulty finding employees',
 'It recently opened for business',
 'It is the most popular restaurant in town',
 'The owner wants to reduce staff hours',
 'A', 'The sign, signing bonus, and wage increase all suggest the restaurant is struggling to attract workers.'),

('Reading Comprehension', 'easy', 'inference',
 'The eighth-grader''s science project included a detailed hypothesis, carefully recorded data tables, and a section analyzing possible sources of error. Her teacher wrote "Excellent work!" at the top of the rubric. \n\nWhat can be reasonably inferred about the student?',
 'She approached the project with thoroughness and care',
 'She wants to become a scientist',
 'She received help from her parents',
 'She is the best student in the class',
 'A', 'The detailed components and teacher praise suggest the student was thorough and careful in her work.');

-- inference: MEDIUM (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Reading Comprehension', 'medium', 'inference', 'When the pharmaceutical company announced that its new drug had passed Phase III clinical trials, its stock price surged 40% in a single day. However, the CEO sold a significant portion of her personal shares the following week.\n\nWhat can be reasonably inferred about the CEO''''s actions?', 'She needed money for personal expenses', 'She may not have been fully confident in the drug''''s long-term prospects', 'She was forced to sell shares by regulators', 'She wanted to invest in a competitor', 'B', 'Selling shares immediately after positive news suggests the CEO may have had doubts about the drug''''s future success.'),

('Reading Comprehension', 'medium', 'inference',
 'The school district spent millions on new laptops for every student, but standardized test scores remained flat for two consecutive years. Meanwhile, a neighboring district that invested in teacher training saw a 15% improvement in scores. \n\nWhat can be reasonably inferred from this comparison?',
 'Technology alone may not improve academic outcomes as effectively as investing in teachers',
 'Laptops are harmful to student learning',
 'The neighboring district had better students',
 'Standardized tests do not measure real learning',
 'A', 'The contrast suggests that teacher training may be more effective than technology alone at improving outcomes.'),

('Reading Comprehension', 'medium', 'inference', 'The newly elected mayor promised to reduce traffic congestion within her first year. Six months later, she unveiled a plan that focused entirely on expanding highways rather than investing in public transit, cycling infrastructure, or remote work incentives.\n\nWhat can be reasonably inferred about the mayor''''s approach?', 'She believes road expansion is the only solution to congestion', 'She lacks expertise in urban planning', 'She has no interest in reducing congestion', 'She favors a narrow, car-centric approach to transportation', 'D', 'Focusing solely on highway expansion while ignoring alternatives suggests a car-centric philosophy.'),

('Reading Comprehension', 'medium', 'inference', 'The novelist published her first book at age 22 to widespread acclaim. Over the next decade, she published nothing, turning down interviews and avoiding public appearances. When her second novel finally appeared, critics noted its remarkably different style and deeper emotional complexity.\n\nWhat can be reasonably inferred about the author''''s decade of silence?', 'She experienced writer''''s block and could not produce any work', 'She likely spent the time developing as a writer and person', 'She was discouraged by the success of her first book', 'She switched to a different career and then returned', 'B', 'The significant growth in style and emotional complexity suggests the silent decade was a period of maturation.'),

('Reading Comprehension', 'medium', 'inference',
 'A study found that employees who worked from home reported higher job satisfaction but were promoted at half the rate of their in-office colleagues, even when their performance reviews were equivalent. \n\nWhat can be reasonably inferred from this finding?',
 'Remote workers are less competent than office workers',
 'Physical visibility in the workplace may influence promotion decisions beyond job performance',
 'Managers deliberately discriminate against remote workers',
 'Job satisfaction does not matter for career advancement',
 'B', 'Equal performance but lower promotion rates suggest that being physically present and visible plays a role in promotion decisions.'),

('Reading Comprehension', 'medium', 'inference',
 'The ancient city''s ruins show evidence of a sophisticated water management system, including underground channels, settling basins, and distribution points throughout the residential areas. Curiously, the largest and most elaborate channels led not to homes but to the temple complex. \n\nWhat can be reasonably inferred about the role of the temple in this society?',
 'The temple may have held significant political or economic power in addition to religious functions',
 'The temple served only religious purposes',
 'Water was considered sacred and kept away from ordinary people',
 'The temple was built after the water system',
 'A', 'The priority given to the temple in water distribution suggests it held power beyond purely religious functions.'),

('Reading Comprehension', 'medium', 'inference',
 'After the oil spill, the fishing company reported that its catch had dropped by 60%. However, laboratory analysis of fish from the affected waters showed no detectable contamination, and marine biologists noted that fish populations typically migrate away from disturbances and return within months. \n\nWhat can be reasonably inferred about the decline in catch?',
 'The fish were poisoned by the oil spill',
 'The laboratory analysis was flawed',
 'The fishing company exaggerated its losses',
 'The fish likely migrated away temporarily rather than dying',
 'D', 'No contamination and the known migration behavior suggest fish temporarily left the area rather than being killed.'),

('Reading Comprehension', 'medium', 'inference',
 'The artist''s early works, painted in muted browns and grays, depicted scenes of factory workers and urban poverty. After spending a year in the Mediterranean, her palette shifted dramatically to vivid blues, yellows, and greens, and her subjects became landscapes and coastal villages. \n\nWhat can be reasonably inferred about the artist?',
 'Her environment significantly influenced her artistic choices',
 'She abandoned her concern for social issues',
 'She became a better painter after traveling',
 'Mediterranean art is superior to urban art',
 'A', 'The dramatic shift in both color and subject matter after relocating strongly suggests environmental influence on her work.'),

('Reading Comprehension', 'medium', 'inference', 'The country''''s constitution guarantees freedom of the press, yet three journalists were arrested last year for publishing articles critical of the government. International observers noted that all three were charged under broadly worded national security laws.\n\nWhat can be reasonably inferred about the country''''s governance?', 'The constitution is outdated and needs revision', 'The journalists broke legitimate laws', 'National security is more important than press freedom', 'Vague security laws may be used to circumvent press freedom protections', 'D', 'Arresting journalists under vague security laws despite constitutional press protections suggests these laws are tools to suppress criticism.'),

('Reading Comprehension', 'medium', 'inference',
 'The startup''s website prominently featured testimonials from satisfied customers and a counter showing "10,000+ users." However, the company''s annual report, filed with regulators, listed total revenue of only $12,000 for the year. \n\nWhat can be reasonably inferred from this discrepancy?',
 'The company''s user claims may be exaggerated or misleading',
 'The company offers a free product',
 'The annual report contains errors',
 'The testimonials are from real customers',
 'A', 'Extremely low revenue relative to the claimed user base suggests the user numbers may be inflated or misleading.'),

('Reading Comprehension', 'medium', 'inference',
 'In the 1950s, the American suburb grew rapidly as new highways made commuting from outlying areas practical. At the same time, urban centers saw declining populations and increasing vacancy rates in commercial districts. \n\nWhat can be reasonably inferred about the relationship between these trends?',
 'Suburban growth contributed to urban population decline',
 'Urban decline caused suburban growth',
 'Highways were built to solve urban overcrowding',
 'Commercial districts failed because of poor management',
 'A', 'The simultaneous growth of suburbs (enabled by highways) and urban decline suggest that people moved from cities to suburbs.'),

('Reading Comprehension', 'medium', 'inference', 'The museum curated an exhibit of photographs taken by workers during the construction of the Golden Gate Bridge in the 1930s. The images showed men working at dizzying heights without safety harnesses, often smiling or posing for the camera.\n\nWhat can be reasonably inferred from the workers'''' expressions?', 'Workplace safety culture was very different in the 1930s', 'They were unaware of the dangers they faced', 'The photographs were staged by the construction company', 'The workers were professional photographers', 'A', 'Workers casually posing without safety equipment suggests that attitudes toward workplace safety were very different from today.'),

('Reading Comprehension', 'medium', 'inference',
 'The politician''s memoir devoted three chapters to her childhood and education but only a single paragraph to the corruption scandal that dominated her final year in office. The paragraph described the allegations as "politically motivated" without addressing the specific evidence presented against her. \n\nWhat can be reasonably inferred about the memoir?',
 'The politician was innocent of all charges',
 'The memoir presents a selective version of events that minimizes the scandal',
 'The memoir is a work of fiction',
 'The scandal was genuinely politically motivated',
 'B', 'Devoting minimal space to a major scandal and dismissing it without addressing evidence suggests deliberate downplaying.'),

('Reading Comprehension', 'medium', 'inference',
 'The vineyard owner in Napa Valley noticed that the grapes on the hillside vines consistently produced wine with more complex flavors than grapes from the valley floor, even though both areas received the same amount of sunlight and irrigation. \n\nWhat can be reasonably inferred from this observation?',
 'Hillside grapes are a different variety',
 'Valley floor grapes are of lower quality',
 'Factors beyond sunlight and water, such as soil drainage or root stress, likely affect flavor',
 'The winemaking process differs for hillside grapes',
 'C', 'Since sunlight and water are equal, other factors related to the hillside terrain must account for the flavor difference.'),

('Reading Comprehension', 'medium', 'inference',
 'The archaeological team found that the ancient settlement''s earliest buildings were simple wooden structures, but later buildings were made of stone and arranged in planned streets. The most recent layer contained elaborate public buildings with decorative carvings. \n\nWhat can be reasonably inferred about the settlement over time?',
 'It was conquered by a more advanced civilization',
 'The decorative carvings were purely religious',
 'Stone buildings replaced wooden ones due to fire',
 'It grew increasingly complex and organized over time',
 'D', 'The progression from simple wood to planned stone to elaborate public buildings shows increasing complexity.'),

('Reading Comprehension', 'medium', 'inference', 'The bestselling diet book recommended eliminating all carbohydrates for rapid weight loss. Its author, a celebrity fitness trainer, had no formal education in nutrition science, and the book contained no citations to peer-reviewed research.\n\nWhat can be reasonably inferred about the reliability of the book''''s advice?', 'The lack of scientific credentials and citations warrants skepticism about the claims', 'The advice is definitely wrong', 'Celebrity trainers know more about nutrition than scientists', 'Diet books never contain reliable information', 'A', 'The author''''s lack of relevant credentials and absence of research citations are reasons to approach the claims with caution.'),

('Reading Comprehension', 'medium', 'inference',
 'After the new highway bypass was completed, traffic on Main Street dropped by 70%. Several restaurants and shops that had relied on through-traffic closed within a year, though a few businesses that served primarily local customers continued to thrive. \n\nWhat can be reasonably inferred about the businesses that survived?',
 'Their customer base was not dependent on passing motorists',
 'They were better managed than the ones that closed',
 'They offered lower prices than competing businesses',
 'They received government subsidies',
 'A', 'Businesses serving local customers survived because their revenue did not depend on the through-traffic that the bypass diverted.'),

('Reading Comprehension', 'medium', 'inference',
 'The university''s enrollment of international students dropped 35% in the year following the implementation of stricter visa processing requirements. Competing universities in countries with more welcoming immigration policies reported corresponding increases in their international enrollment. \n\nWhat can be reasonably inferred from this passage?',
 'Visa policy changes redirected international students to countries with easier entry requirements',
 'International students are not interested in American universities',
 'The university raised its tuition too high',
 'International students prefer smaller universities',
 'A', 'The inverse relationship between one country''s stricter policies and other countries'' enrollment gains suggests students chose destinations based on visa accessibility.');

-- inference: HARD (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Reading Comprehension', 'hard', 'inference', 'The pharmaceutical company''''s internal emails, released during litigation, revealed that executives had been aware of the drug''''s serious side effects for two years before they were publicly disclosed. During that period, the company increased its marketing budget for the drug by 300%.\n\nWhat can be reasonably inferred about the company''''s priorities?', 'The company prioritized profits over patient safety', 'The marketing increase was unrelated to the safety concerns', 'The side effects were not actually serious', 'The company was preparing to recall the drug', 'A', 'Aggressively marketing a drug while concealing known side effects suggests the company prioritized revenue over patient welfare.'),

('Reading Comprehension', 'hard', 'inference',
 'The anthropologist noted that in the remote community she studied, disputes were resolved through elaborate public storytelling ceremonies rather than through formal legal proceedings. Interestingly, the community had virtually no repeat offenses, while neighboring communities with formal courts had recidivism rates above 40%. \n\nWhat can be reasonably inferred about the storytelling approach to justice?',
 'It is more effective than legal systems because stories are entertaining',
 'Public accountability through narrative may deter repeated offenses more effectively than formal punishment',
 'Formal courts are ineffective in all communities',
 'The community has fewer disputes because it is small',
 'B', 'The near-zero recidivism suggests that public storytelling creates accountability that deters repeat offenses more effectively than punishment.'),

('Reading Comprehension', 'hard', 'inference',
 'A longitudinal study found that children raised in households with more than 500 books scored significantly higher on reading assessments, even when controlling for parental income and education level. Notably, the effect was observed regardless of whether the children actually read the books. \n\nWhat can be reasonably inferred about why books in the home affect reading scores?',
 'Children absorb knowledge from books through osmosis',
 'Having books available encourages children to read independently',
 'Parents who buy books read to their children more often',
 'The presence of books may signal a household culture that values learning, which influences children indirectly',
 'D', 'Since the effect exists even when children don''t read the books, the books likely indicate a broader culture of valuing learning.'),

('Reading Comprehension', 'hard', 'inference',
 'The island nation''s government invested heavily in education and healthcare after independence in the 1960s, despite having almost no natural resources. By the 2000s, it had the highest literacy rate and longest life expectancy in its region, along with a thriving technology sector. \n\nWhat can be reasonably inferred about the relationship between natural resources and development?',
 'Natural resources are necessary for economic development',
 'Technology sectors only develop in resource-poor countries',
 'The nation succeeded because it had no resources to fight over',
 'Strategic investment in human capital can drive development even without natural resource wealth',
 'D', 'The nation''s success through education and healthcare investment, despite lacking resources, shows human capital can drive development.'),

('Reading Comprehension', 'hard', 'inference',
 'The painter''s contemporaries dismissed her work as technically proficient but emotionally cold. A century later, critics re-evaluated her art and proclaimed it a masterful depiction of restrained emotion that perfectly captured the social constraints women faced in her era. \n\nWhat can be reasonably inferred about the shift in critical opinion?',
 'The painter''s technique improved over time',
 'The paintings physically changed over time',
 'Earlier critics were objectively wrong about the paintings',
 'Later critics had greater awareness of how gender constraints shaped women''s artistic expression',
 'D', 'The reinterpretation of "emotional coldness" as "restrained emotion reflecting social constraints" suggests later critics understood gender context better.'),

('Reading Comprehension', 'hard', 'inference',
 'A city banned single-use plastic bags in 2015, but a follow-up study in 2020 found that overall plastic waste had actually increased by 8%. Researchers discovered that sales of thicker, reusable plastic bags — which consumers often used only once — had skyrocketed, and these bags contained four times more plastic per unit than the banned ones. \n\nWhat can be reasonably inferred about the bag ban policy?',
 'The policy had the opposite of its intended effect due to unintended consumer behavior',
 'Plastic bans never work',
 'Consumers deliberately undermined the policy',
 'Thicker bags are better for the environment',
 'A', 'The increase in plastic waste from consumers using thicker "reusable" bags only once shows the policy backfired due to unforeseen behavior.'),

('Reading Comprehension', 'hard', 'inference',
 'Historical records show that during the 1815 eruption of Mount Tambora, global temperatures dropped by an average of 3 degrees Celsius the following year. Crop failures occurred across Europe, food prices doubled, and widespread famine triggered mass migrations. \n\nWhat can be reasonably inferred about the vulnerability of human societies?',
 'Volcanic eruptions are the greatest threat to civilization',
 'Modern societies would be unaffected by similar events',
 'European agriculture was poorly managed in 1815',
 'Even relatively small changes in global temperature can have devastating cascading effects on human societies',
 'D', 'A 3-degree drop causing famine and migration demonstrates how sensitive human systems are to modest temperature changes.'),

('Reading Comprehension', 'hard', 'inference',
 'The tech company''s diversity report showed that women comprised 47% of new hires but only 12% of senior leadership positions. The company''s CEO frequently spoke about the importance of diversity in public forums and industry conferences. \n\nWhat can be reasonably inferred from this data?',
 'The company may face systemic barriers to women''s advancement despite stated commitments to diversity',
 'The company does not value diversity',
 'The CEO is insincere about diversity',
 'Women are not interested in senior leadership roles',
 'A', 'The gap between hiring and leadership representation suggests structural barriers to advancement, regardless of the CEO''s sincerity.'),

('Reading Comprehension', 'hard', 'inference',
 'The translated poem won the National Book Award, and critics praised its lyrical beauty and emotional depth. Interestingly, reviewers who spoke the poem''s original language noted that the translation significantly altered the tone and meaning of several key passages, making them more sentimental than the original. \n\nWhat can be reasonably inferred about literary translation?',
 'Translations are always inferior to originals',
 'The translator intentionally changed the meaning',
 'Translation can create a different work that succeeds on its own terms, even if it diverges from the original',
 'The original poem was not well-written',
 'C', 'The translation won awards despite differing from the original, suggesting it became a successful work in its own right.'),

('Reading Comprehension', 'hard', 'inference',
 'After the government implemented a universal free lunch program in all public schools, academic performance improved most dramatically in the lowest-income districts, while wealthier districts saw negligible changes. \n\nWhat can be reasonably inferred about the relationship between nutrition and academic performance?',
 'Wealthy students do not benefit from free lunches',
 'Free lunch programs waste money in wealthy districts',
 'Hunger was likely a significant barrier to learning for low-income students',
 'Academic performance depends entirely on nutrition',
 'C', 'Dramatic improvement only in low-income districts suggests those students were previously going hungry, and hunger was impairing their learning.'),

('Reading Comprehension', 'hard', 'inference',
 'The historian discovered that the "traditional" folk song, long considered a centuries-old expression of rural life, was actually composed in 1903 by a university-educated poet who had never lived in the countryside. The song had been deliberately written to sound ancient and was first published in a collection marketed as "authentic folk music." \n\nWhat can be reasonably inferred about the concept of cultural authenticity?',
 'Folk music has no value if it is not genuinely old',
 'All folk songs are modern inventions',
 'Perceptions of authenticity can be deliberately constructed and may not reflect actual origins',
 'University-educated people cannot create authentic art',
 'C', 'The manufactured "authenticity" of the song shows that our perceptions of what is genuine can be deliberately constructed.'),

('Reading Comprehension', 'hard', 'inference',
 'A clinical trial showed that a new antidepressant outperformed the placebo in 6 out of 10 studies, but the pharmaceutical company published only the 6 positive studies. When all 10 studies were later analyzed together, the drug''s advantage over placebo shrank to a statistically insignificant margin. \n\nWhat can be reasonably inferred about the practice of selective publication?',
 'Selective publication can create a misleading impression of a treatment''s effectiveness',
 'The drug does not work at all',
 'Negative studies are always more reliable than positive ones',
 'Pharmaceutical companies should never publish individual studies',
 'A', 'Publishing only favorable results distorted the drug''s apparent effectiveness, demonstrating how selective publication misleads.'),

('Reading Comprehension', 'hard', 'inference',
 'The newly independent nation adopted the colonial power''s language as its official language rather than choosing one of its own dozens of indigenous languages. Government leaders argued this was necessary for national unity, though critics noted that only 15% of the population spoke the colonial language fluently. \n\nWhat can be reasonably inferred about the trade-offs of this decision?',
 'The decision definitively solved the language problem',
 'Choosing the colonial language avoided favoring one indigenous group but may have excluded most citizens from full civic participation',
 'Indigenous languages were too simple for government use',
 'The colonial power forced the decision on the new nation',
 'B', 'Using a neutral but foreign language prevents ethnic favoritism but excludes the 85% who don''t speak it fluently.'),

('Reading Comprehension', 'hard', 'inference',
 'Researchers found that people who regularly read literary fiction scored higher on tests of empathy and social perception than those who read primarily nonfiction or genre fiction. However, when non-readers were randomly assigned to read literary fiction for a month, their empathy scores did not significantly change. \n\nWhat can be reasonably inferred from the combined findings?',
 'Literary fiction directly causes increased empathy',
 'The correlation between literary fiction and empathy may reflect pre-existing traits rather than a causal effect of reading',
 'Nonfiction readers lack empathy',
 'One month is not enough time to measure empathy changes',
 'B', 'The failure of the experimental intervention suggests that empathetic people may choose literary fiction, rather than fiction creating empathy.'),

('Reading Comprehension', 'hard', 'inference',
 'The small nation announced it would switch entirely to renewable energy by 2030 and immediately received billions in international investment and favorable trade agreements. Several larger nations that had made similar pledges but set later deadlines received no comparable response. \n\nWhat can be reasonably inferred about international climate commitments?',
 'Small nations are better at fighting climate change',
 'Larger nations cannot transition to renewable energy',
 'The international community does not take climate change seriously',
 'Ambitious and near-term commitments may be rewarded more than distant pledges, regardless of actual impact',
 'D', 'The disparity in response based on timeline ambition, not nation size, suggests that bold near-term targets attract more support.'),

('Reading Comprehension', 'hard', 'inference',
 'The orchestra conductor was known for hiring musicians from unconventional backgrounds — jazz performers, folk musicians, and self-taught players — rather than exclusively from elite conservatories. Critics initially predicted the ensemble would lack polish, but it quickly became one of the most sought-after orchestras in the world. \n\nWhat can be reasonably inferred about the relationship between formal training and musical excellence?',
 'Conservatory training is unnecessary for orchestral musicians',
 'The conductor lowered the orchestra''s standards',
 'Self-taught musicians are better than classically trained ones',
 'Diverse musical backgrounds can contribute to excellence in ways that traditional training alone may not achieve',
 'D', 'The orchestra''s success with diverse backgrounds suggests that varied experience can enhance, not diminish, musical excellence.'),

('Reading Comprehension', 'hard', 'inference',
 'A study of charitable giving found that when donors were told their contribution would be matched dollar-for-dollar by a corporate sponsor, donations increased by 20%. However, when the match ratio was raised to three-to-one, donations did not increase further and actually declined slightly. \n\nWhat can be reasonably inferred about donor psychology?',
 'The existence of a match motivates giving, but higher match ratios may make donors feel their individual contribution matters less',
 'Donors are only motivated by tax deductions',
 'Donors distrust corporate sponsors',
 'Three-to-one matching programs are too complicated for donors to understand',
 'A', 'Declining donations at higher match ratios suggest donors may feel less needed when their contribution is a smaller proportion of the total.'),

('Reading Comprehension', 'hard', 'inference',
 'The government classified documents related to the nuclear incident for 50 years, citing national security. When the files were finally released, they revealed that the contamination zone was three times larger than officials had publicly acknowledged and that evacuation orders had been deliberately delayed by 48 hours to avoid public panic. \n\nWhat can be reasonably inferred about the relationship between government secrecy and public safety?',
 'Government secrecy is always justified for national security',
 'Secrecy ostensibly maintained for public protection may itself endanger the public by delaying critical information',
 'The government successfully prevented panic',
 'Nuclear incidents should never be classified',
 'B', 'The delayed evacuation shows that secrecy meant to "protect" the public actually put them at greater risk from contamination.');
