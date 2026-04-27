-- 011_ap_ushistory.sql
-- 20 AP US History questions across 4 subtopics
-- Subtopics: colonial-founding, civil-war-reconstruction, industrialization-progressive, modern-america
-- Difficulty spread per subtopic: 2 easy, 2 medium, 1 hard
-- Answer balance: 5A, 5B, 5C, 5D

INSERT INTO sat_questions
  (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation)
VALUES

-- ============================================================
-- SUBTOPIC: colonial-founding (5 questions)
-- ============================================================

('AP US History', 'easy', 'colonial-founding',
 'Which document, adopted on July 4, 1776, formally declared the American colonies'' independence from Britain?',
 'The Declaration of Independence',
 'The Articles of Confederation',
 'The Constitution',
 'The Mayflower Compact',
 'A',
 'The Declaration of Independence, primarily authored by Thomas Jefferson, announced the colonies'' separation from Britain and articulated natural rights philosophy.'),

('AP US History', 'easy', 'colonial-founding',
 'What was the primary cash crop that drove the economy of the Jamestown colony in Virginia?',
 'Cotton',
 'Tobacco',
 'Indigo',
 'Rice',
 'B',
 'John Rolfe introduced a profitable strain of tobacco around 1612, which became Jamestown''s economic lifeline and shaped Virginia''s plantation economy.'),

('AP US History', 'medium', 'colonial-founding',
 'The Great Awakening of the 1730s–1740s most directly contributed to which of the following developments in colonial America?',
 'The establishment of a national currency',
 'The expansion of royal governors'' authority',
 'A growing sense of shared identity across the colonies through common religious experiences',
 'The elimination of slavery in northern colonies',
 'C',
 'The Great Awakening fostered intercolonial communication and a shared cultural experience, helping to create a sense of American identity that transcended colonial boundaries.'),

('AP US History', 'medium', 'colonial-founding',
 'Which compromise at the Constitutional Convention resolved the dispute between large and small states over representation in Congress?',
 'The Three-Fifths Compromise',
 'The Missouri Compromise',
 'The Compromise of 1850',
 'The Great (Connecticut) Compromise',
 'D',
 'The Great Compromise created a bicameral legislature with proportional representation in the House and equal representation in the Senate, satisfying both large and small states.'),

('AP US History', 'hard', 'colonial-founding',
 'In Federalist No. 10, James Madison argued that a large republic would be better than a small one primarily because it would:',
 'Concentrate power in a strong executive to prevent tyranny',
 'Allow the federal government to abolish state legislatures',
 'Contain so many competing factions that no single one could dominate',
 'Guarantee direct democratic participation by all citizens',
 'C',
 'Madison reasoned that an extended republic would encompass a greater variety of interests and factions, making it difficult for any one group to form an oppressive majority.'),

-- ============================================================
-- SUBTOPIC: civil-war-reconstruction (5 questions)
-- ============================================================

('AP US History', 'easy', 'civil-war-reconstruction',
 'The Emancipation Proclamation of 1863 declared freedom for enslaved people in which areas?',
 'All U.S. states and territories',
 'Only the border states that remained in the Union',
 'Only the Confederate states in rebellion',
 'Only Washington, D.C.',
 'C',
 'Lincoln''s Emancipation Proclamation strategically freed enslaved people only in Confederate-held territory, reframing the war as a fight against slavery while keeping border states loyal.'),

('AP US History', 'easy', 'civil-war-reconstruction',
 'Which amendment to the U.S. Constitution, ratified in 1865, formally abolished slavery throughout the United States?',
 'The 13th Amendment',
 'The 14th Amendment',
 'The 15th Amendment',
 'The 19th Amendment',
 'A',
 'The 13th Amendment permanently abolished slavery and involuntary servitude everywhere in the United States, completing what the Emancipation Proclamation had begun.'),

('AP US History', 'medium', 'civil-war-reconstruction',
 'What were Black Codes, enacted by southern state legislatures in 1865–1866?',
 'Federal laws granting formerly enslaved people the right to vote',
 'Laws designed to restrict the freedoms of Black Americans and ensure a cheap labor supply',
 'Military orders that established Freedmen''s Bureau schools',
 'Constitutional amendments protecting civil rights',
 'B',
 'Black Codes imposed harsh labor contracts, vagrancy laws, and other restrictions on freedpeople, effectively recreating many conditions of slavery and prompting Congressional Reconstruction.'),

('AP US History', 'medium', 'civil-war-reconstruction',
 'The Compromise of 1877 effectively ended Reconstruction by:',
 'Granting statehood to western territories',
 'Passing the Civil Rights Act of 1875',
 'Establishing Jim Crow laws nationwide',
 'Withdrawing federal troops from the South in exchange for Rutherford B. Hayes''s presidency',
 'D',
 'The disputed 1876 election was resolved when Democrats accepted Hayes as president in return for the removal of federal troops, ending federal enforcement of Reconstruction-era protections.'),

('AP US History', 'hard', 'civil-war-reconstruction',
 'Which of the following best describes the significance of the Supreme Court''s ruling in Plessy v. Ferguson (1896)?',
 'It established the "separate but equal" doctrine, legally sanctioning racial segregation for decades',
 'It struck down the Fugitive Slave Act as unconstitutional',
 'It guaranteed voting rights for all male citizens regardless of race',
 'It outlawed the use of literacy tests at polling places',
 'A',
 'Plessy v. Ferguson upheld Louisiana''s segregation law and established the "separate but equal" precedent that legitimized Jim Crow segregation until Brown v. Board of Education overturned it in 1954.'),

-- ============================================================
-- SUBTOPIC: industrialization-progressive (5 questions)
-- ============================================================

('AP US History', 'easy', 'industrialization-progressive',
 'Which term describes the period of rapid industrial growth in the late 19th century, marked by the rise of powerful businessmen like Andrew Carnegie and John D. Rockefeller?',
 'The Era of Good Feelings',
 'The Gilded Age',
 'The Progressive Era',
 'The New Deal',
 'B',
 'The Gilded Age, a term coined by Mark Twain, refers to the period of immense economic growth, wealth inequality, and political corruption roughly spanning the 1870s–1890s.'),

('AP US History', 'easy', 'industrialization-progressive',
 'The Sherman Antitrust Act of 1890 was designed to:',
 'Establish a federal income tax',
 'Regulate immigration from Asia',
 'Prohibit monopolies and business practices that restrained trade',
 'Create the Federal Reserve banking system',
 'C',
 'The Sherman Antitrust Act was the first federal law to outlaw monopolistic business practices, though it was weakly enforced until the Progressive Era.'),

('AP US History', 'medium', 'industrialization-progressive',
 'Upton Sinclair''s 1906 novel The Jungle primarily exposed:',
 'Dangerous and unsanitary conditions in the meatpacking industry',
 'Corruption in urban political machines',
 'Child labor in textile mills',
 'Racial violence in the post-Reconstruction South',
 'A',
 'While Sinclair intended to highlight the exploitation of immigrant workers, the novel''s graphic depictions of filthy meatpacking plants shocked the public and led directly to the Meat Inspection Act and Pure Food and Drug Act.'),

('AP US History', 'medium', 'industrialization-progressive',
 'President Theodore Roosevelt''s "Square Deal" domestic program focused on which three areas?',
 'Tariff reduction, immigration restriction, and gold standard maintenance',
 'Consumer protection, conservation of natural resources, and control of corporations',
 'Civil rights legislation, women''s suffrage, and prohibition of alcohol',
 'Military expansion, overseas colonization, and naval supremacy',
 'B',
 'Roosevelt''s Square Deal aimed to balance the interests of business, consumers, and workers through trust-busting, food and drug regulation, and landmark conservation efforts.'),

('AP US History', 'hard', 'industrialization-progressive',
 'The 1911 Triangle Shirtwaist Factory fire was historically significant because it:',
 'Led to the creation of the American Federation of Labor',
 'Prompted the passage of the Sherman Antitrust Act',
 'Resulted in the 19th Amendment granting women''s suffrage',
 'Catalyzed major workplace safety reforms and strengthened the labor movement',
 'D',
 'The fire killed 146 garment workers, mostly young immigrant women, and exposed the dangers of unregulated factories. It spurred New York and other states to pass sweeping workplace safety legislation.'),

-- ============================================================
-- SUBTOPIC: modern-america (5 questions)
-- ============================================================

('AP US History', 'easy', 'modern-america',
 'The Supreme Court''s 1954 ruling in Brown v. Board of Education declared that:',
 'Prayer in public schools was unconstitutional',
 'Racial segregation in public schools was unconstitutional',
 'States could set their own voting age requirements',
 'The federal government could draft soldiers without congressional approval',
 'B',
 'Brown v. Board of Education unanimously overturned the "separate but equal" doctrine from Plessy v. Ferguson, ruling that segregated schools were inherently unequal and violated the 14th Amendment.'),

('AP US History', 'easy', 'modern-america',
 'Which legislation, signed by President Lyndon B. Johnson in 1964, prohibited discrimination based on race, color, religion, sex, or national origin?',
 'The Voting Rights Act',
 'The Fair Housing Act',
 'The Civil Rights Act of 1964',
 'The Equal Pay Act',
 'C',
 'The Civil Rights Act of 1964 was landmark legislation that banned discrimination in employment and public accommodations, becoming a cornerstone of the civil rights movement''s legal achievements.'),

('AP US History', 'medium', 'modern-america',
 'The policy of containment, which guided U.S. foreign policy during the Cold War, was first articulated by:',
 'George F. Kennan in his 1947 "Long Telegram" and subsequent writings',
 'President Dwight D. Eisenhower in his farewell address',
 'Secretary of State John Foster Dulles at the Geneva Conference',
 'General Douglas MacArthur during the Korean War',
 'A',
 'George Kennan, a diplomat stationed in Moscow, outlined the strategy of containing Soviet expansion through firm resistance, which became the foundation of U.S. Cold War foreign policy.'),

('AP US History', 'medium', 'modern-america',
 'The War Powers Resolution of 1973 was passed primarily in response to:',
 'The Cuban Missile Crisis',
 'The Korean War',
 'The invasion of Grenada',
 'Executive overreach during the Vietnam War',
 'D',
 'Congress passed the War Powers Resolution to reassert its constitutional authority over military commitments after presidents escalated U.S. involvement in Vietnam without formal declarations of war.'),

('AP US History', 'hard', 'modern-america',
 'Which of the following best characterizes the economic policy approach known as "Reaganomics" in the 1980s?',
 'Massive expansion of federal welfare programs and increased regulation of industry',
 'Nationalization of key industries and centralized economic planning',
 'Balanced-budget amendments and elimination of the federal deficit through tax increases',
 'Supply-side tax cuts, deregulation, and reduced domestic spending aimed at stimulating economic growth',
 'D',
 'Reaganomics emphasized supply-side economics, including significant tax cuts, deregulation, and reductions in non-defense spending, based on the theory that benefits would "trickle down" from businesses and investors to the broader economy.');
