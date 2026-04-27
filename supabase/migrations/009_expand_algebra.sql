-- 009: Expand Algebra question bank
-- Adds ~270 new questions across all 5 algebra subtopics
-- 54 per subtopic (18 easy + 18 medium + 18 hard)

-- ===================== LINEAR EQUATIONS =====================

-- Linear Equations: Easy (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Algebra', 'easy', 'linear-equations', 'Solve for x: 4x = 28', 'x = 6', 'x = 7', 'x = 8', 'x = 24', 'B', 'Divide both sides by 4: x = 28/4 = 7.'),
('Algebra', 'easy', 'linear-equations', 'Solve for x: x + 9 = 17', 'x = 6', 'x = 7', 'x = 8', 'x = 26', 'C', 'Subtract 9 from both sides: x = 17 - 9 = 8.'),
('Algebra', 'easy', 'linear-equations', 'Solve for x: x/3 = 5', 'x = 8', 'x = 2', 'x = 15', 'x = 3/5', 'C', 'Multiply both sides by 3: x = 5 × 3 = 15.'),
('Algebra', 'easy', 'linear-equations', 'What is the slope of y = -5x + 2?', '2', '-5', '5', '-2', 'B', 'In y = mx + b, the slope m is -5.'),
('Algebra', 'easy', 'linear-equations', 'Solve for x: 3x - 9 = 0', 'x = 0', 'x = 3', 'x = 9', 'x = -3', 'B', 'Add 9: 3x = 9. Divide by 3: x = 3.'),
('Algebra', 'easy', 'linear-equations', 'What is the y-intercept of y = 7x - 4?', '7', '-7', '-4', '4', 'C', 'In y = mx + b, the y-intercept is b = -4.'),
('Algebra', 'easy', 'linear-equations', 'Solve for x: 2x + 1 = 9', 'x = 3', 'x = 4', 'x = 5', 'x = 10', 'B', 'Subtract 1: 2x = 8. Divide by 2: x = 4.'),
('Algebra', 'easy', 'linear-equations', 'A line has slope 0. What kind of line is it?', 'Vertical', 'Undefined', 'Diagonal', 'Horizontal', 'D', 'A slope of 0 means the line is horizontal (no rise).'),
('Algebra', 'easy', 'linear-equations', 'Solve for x: -x = 6', 'x = 6', 'x = -6', 'x = 1/6', 'x = -1/6', 'B', 'Multiply both sides by -1: x = -6.'),
('Algebra', 'easy', 'linear-equations', 'What is the slope of the line y = 12?', '12', '0', '1', 'Undefined', 'B', 'y = 12 is a horizontal line, so the slope is 0.'),
('Algebra', 'easy', 'linear-equations', 'If y = 2x + 3 and x = 4, what is y?', '8', '10', '11', '14', 'C', 'y = 2(4) + 3 = 8 + 3 = 11.'),
('Algebra', 'easy', 'linear-equations', 'Solve for x: 6x - 12 = 0', 'x = 0', 'x = 12', 'x = 6', 'x = 2', 'D', 'Add 12: 6x = 12. Divide by 6: x = 2.'),
('Algebra', 'easy', 'linear-equations', 'Which equation represents a line with slope 3 and y-intercept 5?', 'y = 5x + 3', 'y = -3x + 5', 'y = 3x - 5', 'y = 3x + 5', 'D', 'Slope-intercept form y = mx + b gives y = 3x + 5.'),
('Algebra', 'easy', 'linear-equations', 'Solve for x: x/4 + 1 = 3', 'x = 4', 'x = 6', 'x = 8', 'x = 16', 'C', 'Subtract 1: x/4 = 2. Multiply by 4: x = 8.'),
('Algebra', 'easy', 'linear-equations', 'What is the value of 3x + 2 when x = 5?', '13', '15', '17', '20', 'C', '3(5) + 2 = 15 + 2 = 17.'),
('Algebra', 'easy', 'linear-equations', 'Solve for x: 10 - x = 3', 'x = 3', 'x = 13', 'x = 10', 'x = 7', 'D', 'Subtract 10 from both sides: -x = -7, so x = 7.'),
('Algebra', 'easy', 'linear-equations', 'Which of these lines is steepest?', 'y = 2x + 1', 'y = 5x - 3', 'y = 3x + 4', 'y = x + 7', 'B', 'The steepest line has the greatest absolute slope. |5| > |3| > |2| > |1|.'),
('Algebra', 'easy', 'linear-equations', 'Solve for x: 7x + 3 = 24', 'x = 2', 'x = 3', 'x = 4', 'x = 27/7', 'B', 'Subtract 3: 7x = 21. Divide by 7: x = 3.');

-- Linear Equations: Medium (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Algebra', 'medium', 'linear-equations', 'Solve for x: 5(x + 2) = 3(x + 8)', 'x = 5', 'x = 14', 'x = 9', 'x = 7', 'D', '5x + 10 = 3x + 24. Subtract 3x: 2x + 10 = 24. Subtract 10: 2x = 14. x = 7.'),
('Algebra', 'medium', 'linear-equations', 'A line passes through (1, 2) and (3, 8). What is its equation?', 'y = 3x - 1', 'y = 3x + 1', 'y = 2x + 1', 'y = 2x - 1', 'A', 'Slope = (8-2)/(3-1) = 3. Using (1,2): y - 2 = 3(x - 1) gives y = 3x - 1.'),
('Algebra', 'medium', 'linear-equations', 'Solve for x: 4(x - 1) + 2 = 3x + 5', 'x = 5', 'x = 7', 'x = 3', 'x = 9', 'B', '4x - 4 + 2 = 3x + 5. Then 4x - 2 = 3x + 5, so x = 7.'),
('Algebra', 'medium', 'linear-equations', 'What is the x-intercept of the line 3x + 4y = 12?', '(3, 0)', '(4, 0)', '(12, 0)', '(0, 3)', 'B', 'Set y = 0: 3x = 12, x = 4. The x-intercept is (4, 0).'),
('Algebra', 'medium', 'linear-equations', 'The line y = mx + 4 passes through the point (2, 10). What is m?', '2', '3', '4', '5', 'B', 'Substitute: 10 = m(2) + 4, so 2m = 6, m = 3.'),
('Algebra', 'medium', 'linear-equations', 'Solve for x: (x + 3)/2 = (x - 1)/4 + 3', 'x = 1', 'x = 3', 'x = 5', 'x = 7', 'C', 'Multiply by 4: 2(x+3) = (x-1) + 12. Then 2x + 6 = x + 11, so x = 5.'),
('Algebra', 'medium', 'linear-equations', 'Two lines are parallel. One is y = 4x - 3. Which could be the other?', 'y = -4x + 1', 'y = (1/4)x + 2', 'y = -(1/4)x - 3', 'y = 4x + 7', 'D', 'Parallel lines have the same slope. y = 4x + 7 has slope 4, same as y = 4x - 3.'),
('Algebra', 'medium', 'linear-equations', 'A phone plan costs $25/month plus $0.10 per text. If the bill is $34, how many texts were sent?', '34', '59', '250', '90', 'D', '25 + 0.10t = 34. Then 0.10t = 9, so t = 90.'),
('Algebra', 'medium', 'linear-equations', 'Solve for x: 4x - 3(2x - 5) = 1', 'x = 7', 'x = -7', 'x = 8', 'x = -8', 'A', '4x - 6x + 15 = 1. Then -2x = -14, so x = 7.'),
('Algebra', 'medium', 'linear-equations', 'What is the slope of the line 6x - 2y = 10?', '-3', '3', '6', '-6', 'B', 'Rewrite: -2y = -6x + 10, so y = 3x - 5. Slope = 3.'),
('Algebra', 'medium', 'linear-equations', 'A line has slope -2 and passes through (3, 1). What is the y-intercept?', '5', '7', '-5', '-7', 'B', 'y - 1 = -2(x - 3) gives y = -2x + 7. The y-intercept is 7.'),
('Algebra', 'medium', 'linear-equations', 'If f(x) = 5x - 8 and f(a) = 22, what is a?', '4', '5', '6', '7', 'C', '5a - 8 = 22. Then 5a = 30, so a = 6.'),
('Algebra', 'medium', 'linear-equations', 'A rental car costs $40/day plus $0.25/mile. The total for one day is $65. How many miles were driven?', '80', '90', '110', '100', 'D', '40 + 0.25m = 65. Then 0.25m = 25, so m = 100.'),
('Algebra', 'medium', 'linear-equations', 'Solve for y: 3(2y + 1) - 4y = 11', 'y = 2', 'y = 3', 'y = 4', 'y = 5', 'C', '6y + 3 - 4y = 11. Then 2y + 3 = 11, 2y = 8, y = 4.'),
('Algebra', 'medium', 'linear-equations', 'The points (0, 3) and (6, 0) lie on a line. What is the slope?', '-2', '-1/2', '1/2', '2', 'B', 'Slope = (0 - 3)/(6 - 0) = -3/6 = -1/2.'),
('Algebra', 'medium', 'linear-equations', 'Which point lies on the line 2x + 5y = 20?', '(5, 2)', '(3, 3)', '(10, 2)', '(0, 5)', 'A', 'Check (5,2): 2(5) + 5(2) = 10 + 10 = 20. Correct.'),
('Algebra', 'medium', 'linear-equations', 'A line is perpendicular to y = (1/2)x + 3. What is its slope?', '1/2', '-1/2', '2', '-2', 'D', 'Perpendicular slope is the negative reciprocal of 1/2, which is -2.'),
('Algebra', 'medium', 'linear-equations', 'Solve for x: 0.5x + 1.5 = 4.5', 'x = 3', 'x = 6', 'x = 9', 'x = 12', 'B', '0.5x = 3, so x = 6.');

-- Linear Equations: Hard (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Algebra', 'hard', 'linear-equations', 'For what value of a does 2x + ay = 6 and 3x - 6y = 9 have the same slope?', '-4', '4', '-3', '3', 'A', 'First line slope = -2/a. Second line: y = (1/2)x - 3/2, slope = 1/2. Set -2/a = 1/2, so a = -4.'),
('Algebra', 'hard', 'linear-equations', 'Line L has equation 4x - 3y = 12. A point on L has x-coordinate 6. What is the y-coordinate?', '2', '8', '6', '4', 'D', '4(6) - 3y = 12 gives 24 - 3y = 12, so 3y = 12 and y = 4.'),
('Algebra', 'hard', 'linear-equations', 'The line y = mx + b passes through (2, 5) and (6, 13). What is b?', '1', '2', '3', '4', 'A', 'Slope = (13-5)/(6-2) = 8/4 = 2. Using (2,5): 5 = 2(2) + b, so b = 1.'),
('Algebra', 'hard', 'linear-equations', 'If 3x + 2y = k and 6x + 4y = 18, for what value of k does the system have infinitely many solutions?', '6', '18', '12', '9', 'D', 'The second equation is 2 times the first, so 2k = 18 and k = 9.'),
('Algebra', 'hard', 'linear-equations', 'A taxi charges $3.50 plus $0.75 per mile. A ride-share charges $1.00 plus $1.25 per mile. After how many miles do they cost the same?', '3', '4', '5', '6', 'C', '3.50 + 0.75m = 1.00 + 1.25m gives 2.50 = 0.50m, so m = 5.'),
('Algebra', 'hard', 'linear-equations', 'Line p passes through (-2, 7) and (4, -5). At what point does p cross the x-axis?', '(3/2, 0)', '(1/2, 0)', '(5/2, 0)', '(7/2, 0)', 'A', 'Slope = (-5-7)/(4+2) = -12/6 = -2. Equation: y - 7 = -2(x+2) gives y = -2x + 3. Set y = 0: x = 3/2.'),
('Algebra', 'hard', 'linear-equations', 'The equation ax + 3y = 12 has an x-intercept at (4, 0). What is a?', '2', '3', '4', '6', 'B', 'Substitute (4, 0): 4a + 0 = 12, so a = 3.'),
('Algebra', 'hard', 'linear-equations', 'If f(x) = 2x + 1 and g(x) = 3x - 5, for what value of x does f(x) = g(x)?', 'x = 4', 'x = 5', 'x = 6', 'x = 7', 'C', '2x + 1 = 3x - 5 gives 6 = x, so x = 6.'),
('Algebra', 'hard', 'linear-equations', 'A gym offers two plans: Plan A costs $50/month, Plan B costs $20/month plus $5/visit. For how many visits per month are the plans equal in cost?', '4', '5', '6', '10', 'C', '50 = 20 + 5v gives 30 = 5v, so v = 6.'),
('Algebra', 'hard', 'linear-equations', 'The line through (a, 1) and (5, 9) has slope 2. What is a?', '0', '1', '2', '3', 'B', 'Slope = (9-1)/(5-a) = 8/(5-a) = 2, so 5-a = 4 and a = 1.'),
('Algebra', 'hard', 'linear-equations', 'If 2x - 3y = 7 and 4x - 6y = c have no solution, which value of c is NOT possible?', '10', '12', '14', '16', 'C', '4x - 6y is 2(2x-3y), so if c = 2(7) = 14, the lines are identical (infinitely many solutions). For no solution, c must not equal 14.'),
('Algebra', 'hard', 'linear-equations', 'A line passes through (0, 4) and is parallel to the line joining (1, 3) and (4, 9). What is the equation?', 'y = 2x + 4', 'y = 3x + 4', 'y = 2x - 4', 'y = 3x - 4', 'A', 'Reference slope = (9-3)/(4-1) = 6/3 = 2. Parallel line through (0,4): y = 2x + 4.'),
('Algebra', 'hard', 'linear-equations', 'For the equation 3(2x - 1) + k = 6x + 2 to have no solution, which value of k does NOT work?', '3', '4', '6', '5', 'D', '6x - 3 + k = 6x + 2 simplifies to k - 3 = 2, or k = 5. When k = 5 there are infinitely many solutions. Any other k gives no solution, so k = 5 does NOT give no solution.'),
('Algebra', 'hard', 'linear-equations', 'The average of 3x + 1 and 5x - 3 equals 2x + 5. What is x?', '1', '2', '3', '5', 'C', 'Average = (3x+1+5x-3)/2 = (8x-2)/2 = 4x-1. Set 4x-1 = 2x+5 gives 2x = 6, so x = 3.'),
('Algebra', 'hard', 'linear-equations', 'A line with equation y = -3x + b passes through the point (2, 1). What is b?', '5', '7', '9', '11', 'B', '1 = -3(2) + b gives 1 = -6 + b, so b = 7.'),
('Algebra', 'hard', 'linear-equations', 'The graph of y = |2x - 6| crosses the line y = 4 at two points. What is the distance between them?', '2', '3', '4', '5', 'C', 'Solve |2x - 6| = 4: either 2x - 6 = 4 (x = 5) or 2x - 6 = -4 (x = 1). Distance = 5 - 1 = 4.'),
('Algebra', 'hard', 'linear-equations', 'If the line 2x + 5y = 10 is reflected over the x-axis, what is the new equation?', '2x - 5y = 10', '2x + 5y = -10', '-2x + 5y = 10', '-2x - 5y = 10', 'A', 'Reflecting over x-axis replaces y with -y: 2x + 5(-y) = 10 gives 2x - 5y = 10.'),
('Algebra', 'hard', 'linear-equations', 'A plumber charges $60 for a house call plus $45 per hour. An electrician charges $90 for a house call plus $30 per hour. After how many hours will they charge the same?', '1', '2', '3', '4', 'B', '60 + 45h = 90 + 30h gives 15h = 30, so h = 2.');

-- ===================== SYSTEMS OF EQUATIONS =====================

-- Systems of Equations: Easy (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Algebra', 'easy', 'systems-of-equations', 'Solve: x + y = 12 and y = 5. What is x?', '5', '17', '12', '7', 'D', 'Substitute y = 5: x + 5 = 12, so x = 7.'),
('Algebra', 'easy', 'systems-of-equations', 'Solve: x + y = 10 and x = 4. What is y?', '4', '14', '10', '6', 'D', 'Substitute x = 4: 4 + y = 10, so y = 6.'),
('Algebra', 'easy', 'systems-of-equations', 'If x - y = 3 and y = 2, what is x?', '1', '3', '5', '6', 'C', 'x - 2 = 3, so x = 5.'),
('Algebra', 'easy', 'systems-of-equations', 'Solve: 2x + y = 11 and y = 3. What is x?', '3', '7', '5', '4', 'D', '2x + 3 = 11 gives 2x = 8, so x = 4.'),
('Algebra', 'easy', 'systems-of-equations', 'Which ordered pair satisfies y = x and y = 4?', '(0, 4)', '(8, 4)', '(4, 0)', '(4, 4)', 'D', 'If y = 4 and y = x, then x = 4. The point is (4, 4).'),
('Algebra', 'easy', 'systems-of-equations', 'Solve: x + y = 9 and x - y = 1. What is y?', '3', '4', '5', '6', 'B', 'Add equations: 2x = 10, x = 5. Then 5 + y = 9, y = 4.'),
('Algebra', 'easy', 'systems-of-equations', 'Solve: x + y = 15 and x - y = 5. What is x?', '5', '8', '10', '15', 'C', 'Add equations: 2x = 20, so x = 10.'),
('Algebra', 'easy', 'systems-of-equations', 'If y = 2x and x = 3, what is x + y?', '6', '8', '9', '12', 'C', 'y = 2(3) = 6. x + y = 3 + 6 = 9.'),
('Algebra', 'easy', 'systems-of-equations', 'Solve: x + 2y = 10 and y = 2. What is x?', '4', '10', '8', '6', 'D', 'x + 2(2) = 10 gives x + 4 = 10, so x = 6.'),
('Algebra', 'easy', 'systems-of-equations', 'If x = 5 and 3x + y = 20, what is y?', '3', '5', '10', '15', 'B', '3(5) + y = 20 gives 15 + y = 20, so y = 5.'),
('Algebra', 'easy', 'systems-of-equations', 'Which point satisfies both y = x + 2 and y = 6?', '(4, 6)', '(6, 4)', '(2, 6)', '(8, 6)', 'A', 'If y = 6, then 6 = x + 2, so x = 4. Point is (4, 6).'),
('Algebra', 'easy', 'systems-of-equations', 'Solve: x + y = 7 and x - y = 3. What is y?', '1', '2', '3', '5', 'B', 'Add: 2x = 10, x = 5. Then y = 7 - 5 = 2.'),
('Algebra', 'easy', 'systems-of-equations', 'If y = 3x and y = 12, what is x?', '2', '3', '4', '6', 'C', '12 = 3x gives x = 4.'),
('Algebra', 'easy', 'systems-of-equations', 'Solve: 2x + y = 8 and y = 2. What is x?', '2', '5', '4', '3', 'D', '2x + 2 = 8 gives 2x = 6, so x = 3.'),
('Algebra', 'easy', 'systems-of-equations', 'If x + y = 20 and x = y, what is x?', '5', '20', '15', '10', 'D', 'Since x = y: 2x = 20, x = 10.'),
('Algebra', 'easy', 'systems-of-equations', 'Solve: x + 3y = 13 and y = 3. What is x?', '1', '2', '3', '4', 'D', 'x + 3(3) = 13 gives x + 9 = 13, so x = 4.'),
('Algebra', 'easy', 'systems-of-equations', 'If x + y = 6 and x - y = 2, what is 2x?', '6', '8', '10', '12', 'B', 'Add the equations: 2x = 8.'),
('Algebra', 'easy', 'systems-of-equations', 'Solve: y = x - 1 and y = 5. What is x?', '4', '5', '6', '7', 'C', '5 = x - 1, so x = 6.');

-- Systems of Equations: Medium (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Algebra', 'medium', 'systems-of-equations', 'Solve: 3x + 2y = 16 and x - y = 2. What is y?', '1', '2', '3', '4', 'B', 'From x - y = 2: x = y + 2. Substitute: 3(y+2) + 2y = 16 gives 5y + 6 = 16, so y = 2.'),
('Algebra', 'medium', 'systems-of-equations', 'Solve: 2x + 3y = 19 and x + y = 7. What is x?', '2', '3', '4', '5', 'A', 'From x + y = 7: x = 7 - y. Substitute: 2(7-y) + 3y = 19 gives 14 + y = 19, y = 5. Then x = 2.'),
('Algebra', 'medium', 'systems-of-equations', 'A movie ticket costs $10 for adults and $6 for children. A group of 8 people pays $60. How many adults are in the group?', '2', '3', '4', '5', 'B', 'a + c = 8 and 10a + 6c = 60. Substituting c = 8-a: 10a + 48 - 6a = 60, so 4a = 12 and a = 3.'),
('Algebra', 'medium', 'systems-of-equations', 'What type of system has exactly one solution?', 'Consistent and independent', 'Consistent and dependent', 'Inconsistent', 'Overdetermined', 'A', 'A consistent and independent system has exactly one intersection point.'),
('Algebra', 'medium', 'systems-of-equations', 'Solve: 4x - y = 5 and 2x + y = 13. What is x?', '2', '3', '4', '5', 'B', 'Add equations: 6x = 18, x = 3.'),
('Algebra', 'medium', 'systems-of-equations', 'Solve: x + 4y = 22 and 3x + 4y = 30. What is x?', '2', '3', '4', '5', 'C', 'Subtract first from second: 2x = 8, x = 4.'),
('Algebra', 'medium', 'systems-of-equations', 'A store sells apples for $2 each and bananas for $1 each. Sam buys 10 fruits for $14. How many apples did he buy?', '2', '3', '4', '6', 'C', 'a + b = 10, 2a + b = 14. Subtract: a = 4.'),
('Algebra', 'medium', 'systems-of-equations', 'Solve: 5x + 2y = 24 and 3x + 2y = 16. What is y?', '1', '4', '3', '2', 'D', 'Subtract: 2x = 8, x = 4. Then 20 + 2y = 24 gives 2y = 4, y = 2.'),
('Algebra', 'medium', 'systems-of-equations', 'The lines y = 2x + 1 and y = -x + 7 intersect at which point?', '(1, 3)', '(4, 9)', '(3, 7)', '(2, 5)', 'D', '2x + 1 = -x + 7 gives 3x = 6, x = 2. Then y = 2(2) + 1 = 5. Point is (2, 5).'),
('Algebra', 'medium', 'systems-of-equations', 'Solve: y = 3x - 4 and y = x + 2. What is y?', '5', '7', '8', '10', 'A', '3x - 4 = x + 2 gives 2x = 6, x = 3. Then y = 3 + 2 = 5.'),
('Algebra', 'medium', 'systems-of-equations', 'A concert sold 200 tickets: $15 for general and $25 for VIP. Total revenue was $3,500. How many VIP tickets were sold?', '40', '50', '60', '75', 'B', 'g + v = 200, 15g + 25v = 3500. Substituting: 15(200-v) + 25v = 3500 gives 3000 + 10v = 3500, v = 50.'),
('Algebra', 'medium', 'systems-of-equations', 'If 2x + y = 10 and 3x - y = 5, what is x?', '2', '3', '4', '5', 'B', 'Add: 5x = 15, x = 3.'),
('Algebra', 'medium', 'systems-of-equations', 'Solve: 2x + 5y = 1 and x + 3y = 2. What is x?', '-7', '-5', '5', '7', 'A', 'From eq2: x = 2 - 3y. Substitute: 2(2-3y) + 5y = 1 gives 4 - y = 1, y = 3. Then x = 2 - 9 = -7.'),
('Algebra', 'medium', 'systems-of-equations', 'How many solutions does the system y = 2x + 3 and y = 2x - 1 have?', '0', '1', '2', 'Infinitely many', 'A', 'Same slope (2), different y-intercepts, so the lines are parallel with no solutions.'),
('Algebra', 'medium', 'systems-of-equations', 'Solve: x - 2y = 3 and 2x + y = 11. What is y?', '1', '2', '3', '4', 'A', 'From eq1: x = 2y + 3. Substitute: 2(2y+3) + y = 11 gives 5y + 6 = 11, y = 1.'),
('Algebra', 'medium', 'systems-of-equations', 'Two numbers sum to 30 and their difference is 12. What is the larger number?', '18', '20', '21', '24', 'C', 'x + y = 30, x - y = 12. Add: 2x = 42, x = 21.'),
('Algebra', 'medium', 'systems-of-equations', 'Solve: 3x + y = 14 and x + y = 6. What is x?', '2', '3', '4', '5', 'C', 'Subtract eq2 from eq1: 2x = 8, x = 4.'),
('Algebra', 'medium', 'systems-of-equations', 'If y = 4x and x + y = 15, what is y?', '3', '9', '12', '15', 'C', 'x + 4x = 15 gives 5x = 15, x = 3. Then y = 12.');

-- Systems of Equations: Hard (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Algebra', 'hard', 'systems-of-equations', 'For the system 3x + ky = 9 and kx + 3y = 9, what value of k gives infinitely many solutions?', '1', '3', '9', '-3', 'B', 'For infinitely many solutions the equations must be proportional: 3/k = k/3 = 9/9 = 1. So 3/k = 1 gives k = 3.'),
('Algebra', 'hard', 'systems-of-equations', 'A farmer has chickens and cows. There are 30 heads and 80 legs total. How many cows are there?', '5', '8', '10', '12', 'C', 'c + w = 30 and 2c + 4w = 80. Substituting c = 30-w: 60-2w+4w = 80, 2w = 20, w = 10.'),
('Algebra', 'hard', 'systems-of-equations', 'Solve: 2x + 3y = 12 and 4x + 6y = 30. How many solutions exist?', '0', '1', '2', 'Infinitely many', 'A', 'The second equation is 2 times the first in variable terms, but 2(12) = 24 not 30. Parallel lines, no solutions.'),
('Algebra', 'hard', 'systems-of-equations', 'If 2x + y = a and x - y = 3, and x = 5, what is a?', '9', '17', '15', '12', 'D', 'From x - y = 3 with x = 5: y = 2. Then a = 2(5) + 2 = 12.'),
('Algebra', 'hard', 'systems-of-equations', 'A test has 25 questions. Correct answers earn 4 points, wrong answers lose 1 point. A student scores 60 points. How many correct answers?', '15', '16', '18', '17', 'D', '4c - (25-c) = 60 gives 5c - 25 = 60, so 5c = 85 and c = 17.'),
('Algebra', 'hard', 'systems-of-equations', 'Solve: x + y + z = 10, x + y = 7, and y + z = 6. What is y?', '3', '2', '4', '5', 'A', 'From x+y+z = 10 and x+y = 7: z = 3. From y+z = 6: y = 3.'),
('Algebra', 'hard', 'systems-of-equations', 'For what value of c does the system x + 2y = 5 and 3x + 6y = c have infinitely many solutions?', '5', '10', '15', '20', 'C', 'The second equation is 3 times the first, so c = 3(5) = 15.'),
('Algebra', 'hard', 'systems-of-equations', 'A cashier has 50 coins: quarters and dimes. The total value is $8.60. How many quarters are there?', '20', '22', '24', '26', 'C', '0.25q + 0.10(50-q) = 8.60 gives 0.15q + 5 = 8.60, so 0.15q = 3.60 and q = 24.'),
('Algebra', 'hard', 'systems-of-equations', 'If 3x - 2y = 7 and 5x + 2y = 25, what is xy?', '8', '16', '12', '10', 'D', 'Add: 8x = 32, x = 4. Then 12 - 2y = 7 gives 2y = 5, y = 5/2. So xy = 4(5/2) = 10.'),
('Algebra', 'hard', 'systems-of-equations', 'The sum of two numbers is 40. Twice the larger minus the smaller equals 44. What is the larger number?', '24', '26', '28', '30', 'C', 'x + y = 40, 2x - y = 44. Add: 3x = 84, x = 28.'),
('Algebra', 'hard', 'systems-of-equations', 'A store mixes $8/lb coffee with $5/lb coffee to make 60 lbs of a $6/lb blend. How many pounds of the $8 coffee are needed?', '15', '30', '25', '20', 'D', '8a + 5(60-a) = 360 gives 3a + 300 = 360, so a = 20.'),
('Algebra', 'hard', 'systems-of-equations', 'Solve: 2x + 3y = 1 and 5x + 7y = 3. What is x + y?', '0', '1', '2', '3', 'B', 'Multiply eq1 by 7 and eq2 by 3: 14x+21y = 7 and 15x+21y = 9. Subtract: x = 2. Then 4+3y = 1 gives y = -1. x+y = 1.'),
('Algebra', 'hard', 'systems-of-equations', 'Three pens and two notebooks cost $11. Two pens and three notebooks cost $14. What is the cost of one pen and one notebook together?', '$4', '$7', '$6', '$5', 'D', '3p + 2n = 11, 2p + 3n = 14. Add: 5p + 5n = 25, so p + n = 5.'),
('Algebra', 'hard', 'systems-of-equations', 'If ax + by = 10 and bx + ay = 8, what is (a+b)(x+y)?', '14', '16', '18', '20', 'C', 'Add equations: (a+b)x + (a+b)y = 18, so (a+b)(x+y) = 18.'),
('Algebra', 'hard', 'systems-of-equations', 'A boat goes 24 miles downstream in 2 hours and 24 miles upstream in 3 hours. What is the speed of the current?', '1 mph', '4 mph', '3 mph', '2 mph', 'D', 'Downstream: b+c = 12. Upstream: b-c = 8. Subtract: 2c = 4, c = 2 mph.'),
('Algebra', 'hard', 'systems-of-equations', 'Solve: |x| + y = 5 and x + y = 3. If x < 0, what is x?', '-2', '-1', '-3', '-4', 'B', 'Since x < 0, |x| = -x. So -x + y = 5 and x + y = 3. Add: 2y = 8, y = 4. Then x = 3-4 = -1.'),
('Algebra', 'hard', 'systems-of-equations', 'A piggy bank contains nickels and dimes totaling $3.75. There are 50 coins in all. How many dimes are there?', '20', '25', '30', '35', 'B', '0.05(50-d) + 0.10d = 3.75 gives 2.50 + 0.05d = 3.75, so d = 25.'),
('Algebra', 'hard', 'systems-of-equations', 'If x - y = 5 and x² - y² = 35, what is x + y?', '5', '6', '7', '8', 'C', 'x² - y² = (x+y)(x-y) = 35. Since x-y = 5: 5(x+y) = 35, so x+y = 7.');

-- ===================== QUADRATICS =====================

-- Quadratics: Easy (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Algebra', 'easy', 'quadratics', 'What is the vertex of y = (x - 2)² + 5?', '(2, 5)', '(-2, 5)', '(5, 2)', '(2, -5)', 'A', 'In vertex form y = (x-h)² + k, the vertex is (h, k) = (2, 5).'),
('Algebra', 'easy', 'quadratics', 'Solve: x² = 25', 'x = 5 only', 'x = -5 only', 'x = 5 or x = -5', 'x = 25', 'C', 'Take the square root of both sides: x = ±5.'),
('Algebra', 'easy', 'quadratics', 'Factor: x² - 4', '(x - 2)(x + 2)', '(x - 4)(x + 1)', '(x - 2)(x - 2)', '(x + 4)(x - 1)', 'A', 'This is a difference of squares: x² - 4 = (x-2)(x+2).'),
('Algebra', 'easy', 'quadratics', 'What is the axis of symmetry of y = (x + 3)² - 1?', 'x = 3', 'x = -3', 'x = 1', 'x = -1', 'B', 'In vertex form y = (x-h)² + k, the axis of symmetry is x = h. Here h = -3.'),
('Algebra', 'easy', 'quadratics', 'If y = x² and x = 4, what is y?', '4', '8', '12', '16', 'D', 'y = 4² = 16.'),
('Algebra', 'easy', 'quadratics', 'Factor: x² + 7x + 12', '(x + 3)(x + 4)', '(x + 2)(x + 6)', '(x + 1)(x + 12)', '(x + 3)(x + 3)', 'A', '3 and 4 multiply to 12 and add to 7, so (x+3)(x+4).'),
('Algebra', 'easy', 'quadratics', 'Does the parabola y = x² - 3 open upward or downward?', 'Upward', 'Downward', 'Left', 'Right', 'A', 'The coefficient of x² is positive (1), so the parabola opens upward.'),
('Algebra', 'easy', 'quadratics', 'Solve: x² - 1 = 0', 'x = 1 only', 'x = -1 only', 'x = 1 or x = -1', 'x = 0', 'C', 'x² = 1, so x = ±1.'),
('Algebra', 'easy', 'quadratics', 'What is the y-intercept of y = x² + 3x - 10?', '3', '-10', '10', '-3', 'B', 'Set x = 0: y = 0 + 0 - 10 = -10.'),
('Algebra', 'easy', 'quadratics', 'Factor: x² - 6x + 9', '(x - 3)(x - 3)', '(x - 9)(x + 1)', '(x + 3)(x + 3)', '(x - 3)(x + 3)', 'A', 'This is a perfect square trinomial: x² - 6x + 9 = (x-3)².'),
('Algebra', 'easy', 'quadratics', 'What are the zeros of y = x(x - 5)?', 'x = 0 and x = 5', 'x = 0 and x = -5', 'x = 5 only', 'x = -5 only', 'A', 'Set y = 0: x = 0 or x - 5 = 0, so x = 0 and x = 5.'),
('Algebra', 'easy', 'quadratics', 'In y = -2x² + 4, does the parabola open up or down?', 'Up', 'Down', 'Left', 'Right', 'B', 'The coefficient of x² is -2 (negative), so it opens downward.'),
('Algebra', 'easy', 'quadratics', 'Solve: (x - 4)(x + 1) = 0', 'x = 4 or x = 1', 'x = -4 or x = 1', 'x = 4 or x = -1', 'x = -4 or x = -1', 'C', 'Set each factor to 0: x - 4 = 0 gives x = 4, and x + 1 = 0 gives x = -1.'),
('Algebra', 'easy', 'quadratics', 'What is the vertex of y = x² - 4?', '(0, -4)', '(0, 4)', '(4, 0)', '(-4, 0)', 'A', 'y = (x-0)² - 4, so the vertex is (0, -4).'),
('Algebra', 'easy', 'quadratics', 'Factor: x² + 2x - 8', '(x + 4)(x - 2)', '(x - 4)(x + 2)', '(x + 8)(x - 1)', '(x - 8)(x + 1)', 'A', '4 and -2 multiply to -8 and add to 2, so (x+4)(x-2).'),
('Algebra', 'easy', 'quadratics', 'Solve: x² = 49', 'x = 7 only', 'x = -7 only', 'x = 7 or x = -7', 'x = 49', 'C', 'x = ±√49 = ±7.'),
('Algebra', 'easy', 'quadratics', 'What is the maximum value of y = -(x - 1)² + 8?', '1', '8', '-8', '-1', 'B', 'The vertex is (1, 8) and the parabola opens down, so the maximum y-value is 8.'),
('Algebra', 'easy', 'quadratics', 'How many x-intercepts does y = x² + 4 have?', '0', '1', '2', '4', 'A', 'Set x² + 4 = 0: x² = -4, which has no real solutions. Zero x-intercepts.');

-- Quadratics: Medium (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Algebra', 'medium', 'quadratics', 'Solve: x² - 7x + 10 = 0', 'x = 1 and x = 10', 'x = -1 and x = -10', 'x = -2 and x = -5', 'x = 2 and x = 5', 'D', 'Factor: (x-2)(x-5) = 0, so x = 2 or x = 5.'),
('Algebra', 'medium', 'quadratics', 'What is the sum of the solutions of x² - 8x + 15 = 0?', '6', '7', '8', '15', 'C', 'By Vieta''s formulas, sum of roots = 8. Or factor: (x-3)(x-5) = 0, sum = 3 + 5 = 8.'),
('Algebra', 'medium', 'quadratics', 'Convert y = x² - 6x + 5 to vertex form.', 'y = (x - 3)² - 4', 'y = (x - 3)² + 5', 'y = (x + 3)² - 4', 'y = (x - 6)² + 5', 'A', 'Complete the square: x² - 6x + 9 - 9 + 5 = (x-3)² - 4.'),
('Algebra', 'medium', 'quadratics', 'The product of the solutions of x² + 3x - 18 = 0 is:', '-18', '18', '-3', '3', 'A', 'By Vieta''s formulas, the product of roots = c/a = -18.'),
('Algebra', 'medium', 'quadratics', 'Solve using the quadratic formula: x² + 4x + 3 = 0', 'x = -1 and x = -3', 'x = 1 and x = 3', 'x = -1 and x = 3', 'x = 1 and x = -3', 'A', 'x = (-4 ± √(16-12))/2 = (-4 ± 2)/2, giving x = -1 or x = -3.'),
('Algebra', 'medium', 'quadratics', 'What is the discriminant of 2x² - 3x + 1 = 0?', '1', '5', '-1', '17', 'A', 'Discriminant = b² - 4ac = 9 - 8 = 1.'),
('Algebra', 'medium', 'quadratics', 'A ball is thrown upward with height h = -16t² + 48t. At what time does it reach maximum height?', 't = 1', 't = 3', 't = 2', 't = 1.5', 'D', 'Max at t = -b/(2a) = -48/(2(-16)) = 48/32 = 1.5 seconds.'),
('Algebra', 'medium', 'quadratics', 'Solve: 2x² - 8x = 0', 'x = 0 and x = 4', 'x = 0 and x = -4', 'x = 2 and x = 4', 'x = 4 only', 'A', 'Factor: 2x(x - 4) = 0, so x = 0 or x = 4.'),
('Algebra', 'medium', 'quadratics', 'If x² - 5x + 6 = 0, what is x² + 1/x² when x = 2?', '17/4', '4', '5', '13/4', 'A', 'When x = 2: x² + 1/x² = 4 + 1/4 = 17/4.'),
('Algebra', 'medium', 'quadratics', 'What is the vertex of y = 2x² - 12x + 20?', '(3, 2)', '(3, 20)', '(6, 2)', '(-3, 2)', 'A', 'x = 12/(2·2) = 3. y = 2(9) - 36 + 20 = 2. Vertex is (3, 2).'),
('Algebra', 'medium', 'quadratics', 'If a quadratic has discriminant 0, how many real solutions does it have?', '0', '1', '2', 'Cannot determine', 'B', 'Discriminant = 0 means exactly one repeated real solution.'),
('Algebra', 'medium', 'quadratics', 'Solve: x² + 2x - 15 = 0', 'x = 3 and x = -5', 'x = -3 and x = 5', 'x = 3 and x = 5', 'x = -3 and x = -5', 'A', 'Factor: (x+5)(x-3) = 0, so x = -5 or x = 3.'),
('Algebra', 'medium', 'quadratics', 'A rectangle has length (x + 3) and width (x - 1). Its area is 21. What is x?', '3', '4', '5', '6', 'B', '(x+3)(x-1) = 21 gives x² + 2x - 24 = 0, so (x+6)(x-4) = 0. Since x > 1, x = 4.'),
('Algebra', 'medium', 'quadratics', 'What is the range of y = (x - 1)² + 3?', 'y ≥ 1', 'y ≥ 3', 'y ≤ 3', 'All real numbers', 'B', 'The minimum is 3 at x = 1, and the parabola opens up, so y ≥ 3.'),
('Algebra', 'medium', 'quadratics', 'Factor completely: 3x² - 12', '3(x - 2)(x + 2)', '3(x - 4)(x + 1)', '(3x - 6)(x + 2)', '3(x² - 4)', 'A', 'Factor out 3: 3(x² - 4) = 3(x-2)(x+2).'),
('Algebra', 'medium', 'quadratics', 'If one root of x² - 9x + k = 0 is 4, what is k?', '16', '36', '24', '20', 'D', 'Substitute x = 4: 16 - 36 + k = 0 gives k = 20.'),
('Algebra', 'medium', 'quadratics', 'The height of a ball is h = -5t² + 20t + 1. What is the maximum height?', '16', '19', '20', '21', 'D', 'Max at t = 20/10 = 2. h = -5(4) + 40 + 1 = 21.'),
('Algebra', 'medium', 'quadratics', 'Solve: (2x - 1)² = 9', 'x = -1 and x = 2', 'x = 1 and x = -2', 'x = 2 and x = -4', 'x = 5 and x = -2', 'A', '2x - 1 = ±3. If 2x-1 = 3, x = 2. If 2x-1 = -3, x = -1.');

-- Quadratics: Hard (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Algebra', 'hard', 'quadratics', 'If x² + bx + 16 = 0 has exactly one real solution, what are the possible values of b?', '±4', '±8', '±16', '±32', 'B', 'One solution means discriminant = 0: b² - 64 = 0, so b = ±8.'),
('Algebra', 'hard', 'quadratics', 'The roots of 2x² - 10x + c = 0 are r and s. If r + s = 5 and rs = 6, what is c?', '6', '10', '12', '15', 'C', 'By Vieta''s formulas: rs = c/2 = 6, so c = 12.'),
('Algebra', 'hard', 'quadratics', 'A projectile''s height is h = -4t² + 24t. For how many seconds is h > 20?', '2', '3', '4', '5', 'C', '-4t² + 24t > 20 gives t² - 6t + 5 < 0, or (t-1)(t-5) < 0. So 1 < t < 5, a duration of 4 seconds.'),
('Algebra', 'hard', 'quadratics', 'If f(x) = x² - 4x + 3 and g(x) = x - 1, for what values of x does f(x) = g(x)?', 'x = 1 and x = 4', 'x = 0 and x = 5', 'x = 2 and x = 3', 'x = -1 and x = 4', 'A', 'x² - 4x + 3 = x - 1 gives x² - 5x + 4 = 0, so (x-1)(x-4) = 0.'),
('Algebra', 'hard', 'quadratics', 'What is the minimum value of 3x² - 12x + 17?', '2', '3', '5', '8', 'C', 'Min at x = 12/6 = 2. f(2) = 12 - 24 + 17 = 5.'),
('Algebra', 'hard', 'quadratics', 'The equation x² + kx + 9 = 0 has two distinct real roots. Which could be k?', '4', '6', '-6', '7', 'D', 'Need discriminant > 0: k² - 36 > 0, so |k| > 6. Only k = 7 works.'),
('Algebra', 'hard', 'quadratics', 'If one root of x² - 6x + m = 0 is twice the other, what is m?', '6', '8', '9', '12', 'B', 'Let roots be r and 2r. Sum: 3r = 6, r = 2. Product: m = 2(4) = 8.'),
('Algebra', 'hard', 'quadratics', 'Solve: x⁴ - 5x² + 4 = 0', 'x = ±1 and x = ±2', 'x = 1 and x = 4', 'x = ±1 and x = ±4', 'x = ±2 only', 'A', 'Let u = x²: u² - 5u + 4 = 0 gives (u-1)(u-4) = 0. So x² = 1 or x² = 4, meaning x = ±1 or ±2.'),
('Algebra', 'hard', 'quadratics', 'The graph of y = ax² + bx + c has vertex (2, -3) and passes through (0, 5). What is a?', '1', '2', '3', '4', 'B', 'Vertex form: y = a(x-2)² - 3. At (0,5): 5 = 4a - 3 gives a = 2.'),
('Algebra', 'hard', 'quadratics', 'For what value of k does the line y = 3x + k intersect y = x² at exactly one point?', '9/4', '-9/4', '3/4', '-3/4', 'B', 'Set x² = 3x + k: x²-3x-k = 0. One intersection means discriminant = 0: 9+4k = 0, so k = -9/4.'),
('Algebra', 'hard', 'quadratics', 'If a and b are roots of x² - 5x + 3 = 0, what is a² + b²?', '15', '17', '19', '22', 'C', 'a² + b² = (a+b)² - 2ab = 25 - 6 = 19.'),
('Algebra', 'hard', 'quadratics', 'A farmer uses 80 m of fencing for a rectangular pen along a barn wall (3 sides only). What is the maximum area?', '600 m²', '700 m²', '800 m²', '1000 m²', 'C', 'Width = x, length = 80-2x. A = x(80-2x) = -2x²+80x. Max at x = 20: A = 20(40) = 800 m².'),
('Algebra', 'hard', 'quadratics', 'How many integer values of k make x² + kx + 36 = 0 have two positive integer roots?', '3', '4', '5', '6', 'C', 'Need rs = 36 and r+s = -k with r,s positive integers. Pairs: (1,36),(2,18),(3,12),(4,9),(6,6). That gives 5 values of k.'),
('Algebra', 'hard', 'quadratics', 'Solve: √(2x + 1) = x - 1', 'x = 0', 'x = 4', 'x = 0 and x = 4', 'x = 4 only', 'D', 'Square: 2x+1 = x²-2x+1 gives x²-4x = 0, x(x-4) = 0. Check x=0: √1 = -1 (false). Check x=4: √9 = 3 (true). Only x = 4.'),
('Algebra', 'hard', 'quadratics', 'The quadratic y = -x² + 6x - 5 is positive for which values of x?', '1 < x < 5', 'x < 1 or x > 5', '-5 < x < -1', '-1 < x < 5', 'A', 'Set equal to 0: x² - 6x + 5 = 0, (x-1)(x-5) = 0. Opens down, so positive between roots: 1 < x < 5.'),
('Algebra', 'hard', 'quadratics', 'If f(x) = 2x² - 8x + 5, what is f(1) + f(3)?', '-4', '2', '0', '-2', 'D', 'f(1) = 2 - 8 + 5 = -1. f(3) = 18 - 24 + 5 = -1. Sum = -2.'),
('Algebra', 'hard', 'quadratics', 'What is the distance between the x-intercepts of y = x² - 8x + 12?', '2', '4', '6', '8', 'B', 'Factor: (x-2)(x-6) = 0. Intercepts at x = 2 and x = 6. Distance = 4.'),
('Algebra', 'hard', 'quadratics', 'If x² - 2x - 3 < 0, what is the solution set?', 'x < -1 or x > 3', '-1 < x < 3', 'x < -3 or x > 1', '-3 < x < 1', 'B', 'Factor: (x-3)(x+1) < 0. Opens up, negative between roots: -1 < x < 3.');

-- ===================== FUNCTIONS =====================

-- Functions: Easy (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Algebra', 'easy', 'functions', 'If f(x) = 3x + 1, what is f(2)?', '5', '6', '7', '8', 'C', 'f(2) = 3(2) + 1 = 7.'),
('Algebra', 'easy', 'functions', 'If f(x) = x², what is f(5)?', '10', '15', '20', '25', 'D', 'f(5) = 5² = 25.'),
('Algebra', 'easy', 'functions', 'If f(x) = 2x - 3, what is f(0)?', '0', '2', '3', '-3', 'D', 'f(0) = 2(0) - 3 = -3.'),
('Algebra', 'easy', 'functions', 'What is the domain of f(x) = x + 5?', 'x ≥ 0', 'x ≥ -5', 'x ≠ 0', 'All real numbers', 'D', 'A linear function has domain of all real numbers.'),
('Algebra', 'easy', 'functions', 'If g(x) = x/2 + 4, what is g(6)?', '5', '6', '7', '8', 'C', 'g(6) = 6/2 + 4 = 3 + 4 = 7.'),
('Algebra', 'easy', 'functions', 'If f(x) = 10 - x, what is f(3)?', '3', '13', '10', '7', 'D', 'f(3) = 10 - 3 = 7.'),
('Algebra', 'easy', 'functions', 'Which of the following is NOT a function?', 'y = 2x', 'y = x²', 'x² + y² = 9', 'y = |x|', 'C', 'x² + y² = 9 is a circle, which fails the vertical line test.'),
('Algebra', 'easy', 'functions', 'If f(x) = 4x, what is f(3) + f(2)?', '14', '18', '20', '24', 'C', 'f(3) = 12, f(2) = 8. Sum = 20.'),
('Algebra', 'easy', 'functions', 'If h(x) = x² + 1, what is h(-2)?', '3', '-5', '-3', '5', 'D', 'h(-2) = (-2)² + 1 = 4 + 1 = 5.'),
('Algebra', 'easy', 'functions', 'If f(x) = 5x - 10, for what value of x is f(x) = 0?', '0', '2', '5', '10', 'B', '5x - 10 = 0 gives x = 2.'),
('Algebra', 'easy', 'functions', 'If f(x) = x + 7, what is f(-3)?', '-10', '-4', '4', '10', 'C', 'f(-3) = -3 + 7 = 4.'),
('Algebra', 'easy', 'functions', 'What is the range of f(x) = x² for all real x?', 'All real numbers', 'y ≥ 0', 'y > 0', 'y ≤ 0', 'B', 'x² is always ≥ 0, so the range is y ≥ 0.'),
('Algebra', 'easy', 'functions', 'If f(x) = 3x and g(x) = x + 2, what is f(g(1))?', '5', '6', '9', '12', 'C', 'g(1) = 3. f(3) = 9.'),
('Algebra', 'easy', 'functions', 'If f(x) = -2x + 8, what is f(4)?', '-4', '0', '4', '16', 'B', 'f(4) = -2(4) + 8 = 0.'),
('Algebra', 'easy', 'functions', 'If f(x) = |x - 3|, what is f(1)?', '-2', '1', '2', '4', 'C', 'f(1) = |1 - 3| = |-2| = 2.'),
('Algebra', 'easy', 'functions', 'If g(x) = 2x² - 1, what is g(3)?', '11', '15', '17', '19', 'C', 'g(3) = 2(9) - 1 = 17.'),
('Algebra', 'easy', 'functions', 'The graph of f passes through (3, 7). What is f(3)?', '3', '21', '10', '7', 'D', 'If the graph passes through (3, 7), then f(3) = 7.'),
('Algebra', 'easy', 'functions', 'If f(x) = x³, what is f(2)?', '4', '6', '8', '16', 'C', 'f(2) = 2³ = 8.');

-- Functions: Medium (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Algebra', 'medium', 'functions', 'If f(x) = 2x + 1 and g(x) = x², what is f(g(3))?', '13', '17', '19', '37', 'C', 'g(3) = 9. f(9) = 2(9) + 1 = 19.'),
('Algebra', 'medium', 'functions', 'What is the domain of f(x) = 1/(x - 3)?', 'x ≠ 0', 'x ≠ 3', 'x > 3', 'x ≥ 3', 'B', 'The denominator cannot be 0, so x ≠ 3.'),
('Algebra', 'medium', 'functions', 'If f(x) = x² - 4x, what is f(5) - f(2)?', '1', '3', '5', '9', 'D', 'f(5) = 25 - 20 = 5. f(2) = 4 - 8 = -4. Difference = 5 - (-4) = 9.'),
('Algebra', 'medium', 'functions', 'If f(x) = 3x - 2, what is f(f(2))?', '8', '10', '12', '14', 'B', 'f(2) = 4. f(4) = 10.'),
('Algebra', 'medium', 'functions', 'What is the domain of f(x) = √(x - 2)?', 'x ≥ 0', 'x > 2', 'x ≥ 2', 'All real numbers', 'C', 'Need x - 2 ≥ 0, so x ≥ 2.'),
('Algebra', 'medium', 'functions', 'If f(x) = 2x + 3 and f(a) = 13, what is a?', '4', '5', '6', '8', 'B', '2a + 3 = 13 gives a = 5.'),
('Algebra', 'medium', 'functions', 'The function f(x) = x² - 1 is defined for x ≥ 0. What is the range?', 'y ≥ -1', 'y ≥ 0', 'y > -1', 'All real numbers', 'A', 'At x = 0, f(0) = -1 (minimum). Range is y ≥ -1.'),
('Algebra', 'medium', 'functions', 'If g(x) = |2x - 6|, for what value of x does g(x) = 0?', 'x = 0', 'x = -3', 'x = 6', 'x = 3', 'D', '|2x - 6| = 0 gives 2x = 6, x = 3.'),
('Algebra', 'medium', 'functions', 'If f(x) = x + 1 and g(x) = 2x - 3, what is g(f(4))?', '5', '11', '9', '7', 'D', 'f(4) = 5. g(5) = 7.'),
('Algebra', 'medium', 'functions', 'A function f satisfies f(x) = f(-x) for all x. The function is:', 'Linear', 'Even', 'Odd', 'Neither', 'B', 'f(x) = f(-x) is the definition of an even function.'),
('Algebra', 'medium', 'functions', 'If f(x) = 2x² - 3x + 1, what is f(-1)?', '2', '4', '6', '8', 'C', 'f(-1) = 2(1) + 3 + 1 = 6.'),
('Algebra', 'medium', 'functions', 'What is the range of f(x) = -|x| + 5?', 'y ≤ 5', 'y ≥ 5', 'y ≤ 0', 'All real numbers', 'A', 'Maximum is 5 at x = 0. Since -|x| decreases, range is y ≤ 5.'),
('Algebra', 'medium', 'functions', 'If f(x) = 4x - 7 and g(x) = (x + 7)/4, what is f(g(x))?', 'x', '4x', 'x + 7', '4x - 7', 'A', 'f(g(x)) = 4((x+7)/4) - 7 = (x+7) - 7 = x. They are inverses.'),
('Algebra', 'medium', 'functions', 'If h(x) = x² and h(a) = 36, what are all possible values of a?', '6 only', '-6 only', '6 or -6', '18', 'C', 'a² = 36 gives a = ±6.'),
('Algebra', 'medium', 'functions', 'The function f(x) = 3(2)^x. What is f(0) + f(1)?', '6', '9', '12', '15', 'B', 'f(0) = 3 and f(1) = 6. Sum = 9.'),
('Algebra', 'medium', 'functions', 'If f(x) = √(16 - x²), what is the domain?', '-4 ≤ x ≤ 4', 'x ≤ 4', 'x ≥ -4', 'x ≠ ±4', 'A', '16 - x² ≥ 0 gives x² ≤ 16, so -4 ≤ x ≤ 4.'),
('Algebra', 'medium', 'functions', 'If f(x) = x² + 2x, what is f(3) - f(-3)?', '0', '6', '12', '18', 'C', 'f(3) = 15. f(-3) = 3. Difference = 12.'),
('Algebra', 'medium', 'functions', 'If f(x) = 5 - 3x, what value of x makes f(x) = -10?', '3', '4', '5', '6', 'C', '5 - 3x = -10 gives x = 5.');

-- Functions: Hard (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Algebra', 'hard', 'functions', 'If f(x) = 2x - 1 and g(x) = x² + 3, what is g(f(2))?', '6', '28', '22', '12', 'D', 'f(2) = 2(2)-1 = 3. g(3) = 9 + 3 = 12.'),
('Algebra', 'hard', 'functions', 'If f(x) = (x+1)/(x-1) and f(a) = 3, what is a?', '1', '2', '3', '4', 'B', '(a+1)/(a-1) = 3 gives a+1 = 3a-3, so 4 = 2a and a = 2.'),
('Algebra', 'hard', 'functions', 'What is the domain of f(x) = √(x+3)/(x-2)?', 'x ≥ -3 and x ≠ 2', 'x > 2', 'x ≥ -3', 'x ≠ 2', 'A', 'Need x+3 ≥ 0 (so x ≥ -3) and denominator x-2 ≠ 0 (so x ≠ 2).'),
('Algebra', 'hard', 'functions', 'If f(x) = x² - 4x + 3 and g(x) = 2x + 1, what is f(g(1))?', '0', '1', '2', '3', 'A', 'g(1) = 3. f(3) = 9 - 12 + 3 = 0.'),
('Algebra', 'hard', 'functions', 'The function f(x) = ax + b satisfies f(2) = 7 and f(5) = 16. What is f(0)?', '1', '2', '3', '-1', 'A', 'Slope = (16-7)/(5-2) = 3. Then 7 = 3(2)+b gives b = 1. So f(0) = 1.'),
('Algebra', 'hard', 'functions', 'If f(x) = 2^x, what is f(3) · f(2)?', '16', '20', '64', '32', 'D', 'f(3) = 8, f(2) = 4. Product = 32. Equivalently, 2^3 · 2^2 = 2^5 = 32.'),
('Algebra', 'hard', 'functions', 'If f is a linear function with f(1) = 4 and f(4) = 13, what is f(10)?', '28', '37', '34', '31', 'D', 'Slope = (13-4)/(4-1) = 3. f(x) = 3x+1. f(10) = 31.'),
('Algebra', 'hard', 'functions', 'If f(x) = |x² - 9|, how many values of x satisfy f(x) = 7?', '1', '2', '3', '4', 'D', '|x²-9| = 7: either x²-9 = 7 (x² = 16, x = ±4) or x²-9 = -7 (x² = 2, x = ±√2). Four values total.'),
('Algebra', 'hard', 'functions', 'If f(x) = x/(x+2), what is f(6)?', '1/4', '1/2', '3/4', '6/8', 'C', 'f(6) = 6/(6+2) = 6/8 = 3/4.'),
('Algebra', 'hard', 'functions', 'If f(x) = 3x - 5, what is f⁻¹(x)?', '(x - 5)/3', '(x + 5)/3', '3x + 5', '(5 - x)/3', 'B', 'Set y = 3x-5. Swap: x = 3y-5. Solve: y = (x+5)/3.'),
('Algebra', 'hard', 'functions', 'If f(x) = x² - 2x and g(x) = -x + 2, for what values of x does f(x) = g(x)?', 'x = -2 and x = 1', 'x = 1 and x = 2', 'x = -2 and x = -1', 'x = 2 and x = -1', 'D', 'x²-2x = -x+2 gives x²-x-2 = 0, (x-2)(x+1) = 0, so x = 2 or x = -1.'),
('Algebra', 'hard', 'functions', 'The function f(x) = a·b^x passes through (0, 3) and (2, 48). What is b?', '2', '3', '4', '8', 'C', 'f(0) = a = 3. f(2) = 3b² = 48 gives b² = 16, b = 4.'),
('Algebra', 'hard', 'functions', 'If f(x) = 3x + 1, for what value of x does f(2x) = f(x) + 9?', '2', '3', '4', '5', 'B', 'f(2x) = 6x + 1. f(x) + 9 = 3x + 10. Set equal: 6x + 1 = 3x + 10, so 3x = 9 and x = 3.'),
('Algebra', 'hard', 'functions', 'If f(x) = x² + 1 and g(x) = 2x, solve f(g(x)) = 17.', 'x = ±2', 'x = 2 only', 'x = ±4', 'x = 4 only', 'A', 'f(g(x)) = f(2x) = 4x² + 1 = 17 gives 4x² = 16, x² = 4, x = ±2.'),
('Algebra', 'hard', 'functions', 'If f(x) = 3x + 2 and g(x) = x² - 1, what is g(f(0))?', '1', '3', '5', '8', 'B', 'f(0) = 2. g(2) = 4 - 1 = 3.'),
('Algebra', 'hard', 'functions', 'A bacteria population doubles every hour. Starting at 500, after how many hours will it first exceed 4000?', '2', '3', '4', '5', 'C', 'P = 500·2^t. At t=3: 4000 (not exceeded). At t=4: 8000 (exceeded). First exceeds at t = 4.'),
('Algebra', 'hard', 'functions', 'If f(x) = x² - 6x + 10, what is the minimum value of f?', '0', '4', '2', '1', 'D', 'Complete the square: f(x) = (x-3)² + 1. Minimum is 1.'),
('Algebra', 'hard', 'functions', 'If f(x) = kx + 3 and f(f(1)) = 21, what is k?', '2', '5', '4', '3', 'D', 'f(1) = k + 3. f(k + 3) = k(k + 3) + 3 = k² + 3k + 3. Set equal to 21: k² + 3k - 18 = 0, (k + 6)(k - 3) = 0, so k = 3.');

-- ===================== INEQUALITIES =====================

-- Inequalities: Easy (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Algebra', 'easy', 'inequalities', 'Solve: x + 3 > 7', 'x > 3', 'x > 4', 'x > 7', 'x > 10', 'B', 'Subtract 3: x > 4.'),
('Algebra', 'easy', 'inequalities', 'Solve: 2x < 10', 'x < 2', 'x < 5', 'x < 10', 'x < 20', 'B', 'Divide by 2: x < 5.'),
('Algebra', 'easy', 'inequalities', 'Solve: x - 5 ≥ 3', 'x ≥ 3', 'x ≥ 5', 'x ≥ 8', 'x ≥ 15', 'C', 'Add 5: x ≥ 8.'),
('Algebra', 'easy', 'inequalities', 'Which value satisfies x > -2?', '-3', '-2', '0', '-5', 'C', '0 > -2 is true.'),
('Algebra', 'easy', 'inequalities', 'Solve: 3x ≤ 18', 'x ≤ 3', 'x ≤ 6', 'x ≤ 9', 'x ≤ 18', 'B', 'Divide by 3: x ≤ 6.'),
('Algebra', 'easy', 'inequalities', 'Solve: -x > 4', 'x > 4', 'x > -4', 'x < 4', 'x < -4', 'D', 'Multiply by -1 and flip: x < -4.'),
('Algebra', 'easy', 'inequalities', 'Which inequality represents "x is at most 10"?', 'x < 10', 'x > 10', 'x ≥ 10', 'x ≤ 10', 'D', '"At most" means ≤, so x ≤ 10.'),
('Algebra', 'easy', 'inequalities', 'Solve: x/2 > 3', 'x > 1.5', 'x > 3', 'x > 6', 'x > 9', 'C', 'Multiply by 2: x > 6.'),
('Algebra', 'easy', 'inequalities', 'Solve: 5x - 10 > 0', 'x > 0', 'x > 2', 'x > 5', 'x > 10', 'B', '5x > 10 gives x > 2.'),
('Algebra', 'easy', 'inequalities', 'Which number is NOT in the solution set of x ≤ 5?', '0', '3', '5', '6', 'D', '6 is not ≤ 5.'),
('Algebra', 'easy', 'inequalities', 'Solve: 4x + 1 ≤ 13', 'x ≤ 3', 'x ≤ 2', 'x ≤ 4', 'x ≤ 14', 'A', '4x ≤ 12 gives x ≤ 3.'),
('Algebra', 'easy', 'inequalities', 'Solve: -2x ≥ 8', 'x ≥ -4', 'x ≤ 4', 'x ≥ 4', 'x ≤ -4', 'D', 'Divide by -2 and flip: x ≤ -4.'),
('Algebra', 'easy', 'inequalities', 'Which inequality means "y is at least 7"?', 'y < 7', 'y > 7', 'y ≤ 7', 'y ≥ 7', 'D', '"At least" means ≥, so y ≥ 7.'),
('Algebra', 'easy', 'inequalities', 'Solve: x + 8 ≤ 12', 'x ≤ 4', 'x ≤ 8', 'x ≤ 12', 'x ≤ 20', 'A', 'Subtract 8: x ≤ 4.'),
('Algebra', 'easy', 'inequalities', 'Is x = 3 a solution to 2x + 1 < 8?', 'Yes', 'No', 'Cannot determine', 'Only if x > 0', 'A', '2(3) + 1 = 7, and 7 < 8 is true.'),
('Algebra', 'easy', 'inequalities', 'Solve: 10 - x < 4', 'x < 6', 'x > 6', 'x < 14', 'x > 14', 'B', '-x < -6 gives x > 6.'),
('Algebra', 'easy', 'inequalities', 'Solve: 3x + 2 > 11', 'x > 2', 'x > 3', 'x > 4', 'x > 13', 'B', '3x > 9 gives x > 3.'),
('Algebra', 'easy', 'inequalities', 'Which graph represents x > 2?', 'Open circle at 2, arrow right', 'Closed circle at 2, arrow right', 'Open circle at 2, arrow left', 'Closed circle at 2, arrow left', 'A', 'x > 2 uses an open circle (not included) with arrow pointing right.');

-- Inequalities: Medium (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Algebra', 'medium', 'inequalities', 'Solve: 3x - 5 > 2x + 4', 'x > 1', 'x > 9', 'x > -9', 'x > -1', 'B', 'Subtract 2x: x - 5 > 4. Add 5: x > 9.'),
('Algebra', 'medium', 'inequalities', 'Solve: -3(x - 2) ≤ 9', 'x ≥ -1', 'x ≤ -1', 'x ≥ 5', 'x ≤ 5', 'A', '-3x + 6 ≤ 9 gives -3x ≤ 3, so x ≥ -1.'),
('Algebra', 'medium', 'inequalities', 'Solve: 2 < x + 5 < 9', '-3 < x < 4', '2 < x < 9', '7 < x < 14', '-3 < x < 9', 'A', 'Subtract 5 from all parts: -3 < x < 4.'),
('Algebra', 'medium', 'inequalities', 'A store requires a minimum purchase of $25 for free shipping. Each item costs $4. What is the minimum number of items for free shipping?', '5', '6', '7', '8', 'C', '4n ≥ 25 gives n ≥ 6.25. Must be whole number, so n ≥ 7.'),
('Algebra', 'medium', 'inequalities', 'Solve: |x| < 5', '-5 < x < 5', 'x < 5', 'x > -5', 'x < -5 or x > 5', 'A', '|x| < 5 means -5 < x < 5.'),
('Algebra', 'medium', 'inequalities', 'Solve: |x| ≥ 3', 'x ≥ 3', 'x ≤ -3', '-3 ≤ x ≤ 3', 'x ≤ -3 or x ≥ 3', 'D', '|x| ≥ 3 means x ≤ -3 or x ≥ 3.'),
('Algebra', 'medium', 'inequalities', 'Solve: 4(x + 1) > 2(x + 5)', 'x > 2', 'x > 5', 'x > 4', 'x > 3', 'D', '4x + 4 > 2x + 10 gives 2x > 6, so x > 3.'),
('Algebra', 'medium', 'inequalities', 'Which ordered pair is in the solution set of y > 2x + 1?', '(1, 2)', '(0, 3)', '(2, 4)', '(1, 3)', 'B', 'Check (0,3): 3 > 2(0)+1 = 1. Yes, 3 > 1 is true.'),
('Algebra', 'medium', 'inequalities', 'Solve: 5 - 2x ≥ 11', 'x ≥ 3', 'x ≤ 3', 'x ≥ -3', 'x ≤ -3', 'D', '-2x ≥ 6 gives x ≤ -3.'),
('Algebra', 'medium', 'inequalities', 'Solve: -1 ≤ 2x - 3 ≤ 7', '1 ≤ x ≤ 5', '-1 ≤ x ≤ 7', '2 ≤ x ≤ 5', '1 ≤ x ≤ 7', 'A', 'Add 3: 2 ≤ 2x ≤ 10. Divide by 2: 1 ≤ x ≤ 5.'),
('Algebra', 'medium', 'inequalities', 'A student needs at least 80 average on 4 tests. The first 3 scores are 75, 82, and 88. What is the minimum 4th score?', '71', '73', '77', '75', 'D', '(75+82+88+s)/4 ≥ 80 gives 245+s ≥ 320, so s ≥ 75.'),
('Algebra', 'medium', 'inequalities', 'Solve: x² - 4 > 0', 'x > 2', '-2 < x < 2', 'x < -2 or x > 2', 'x < -2', 'C', '(x-2)(x+2) > 0 is positive when x < -2 or x > 2.'),
('Algebra', 'medium', 'inequalities', 'Solve: |2x - 1| ≤ 5', '-2 ≤ x ≤ 3', '-3 ≤ x ≤ 2', '0 ≤ x ≤ 3', '-2 ≤ x ≤ 2', 'A', '-5 ≤ 2x-1 ≤ 5 gives -4 ≤ 2x ≤ 6, so -2 ≤ x ≤ 3.'),
('Algebra', 'medium', 'inequalities', 'How many integer solutions does -3 < x ≤ 4 have?', '6', '9', '8', '7', 'D', 'Integers: -2, -1, 0, 1, 2, 3, 4 = 7.'),
('Algebra', 'medium', 'inequalities', 'Solve: 3(x - 1) + 2 > x + 5', 'x > 2', 'x > 3', 'x > 4', 'x > 5', 'B', '3x - 3 + 2 > x + 5 gives 2x > 6, so x > 3.'),
('Algebra', 'medium', 'inequalities', 'Which inequality has a number line shaded left of 5 with a closed circle at 5?', 'x < 5', 'x ≥ 5', 'x > 5', 'x ≤ 5', 'D', 'Closed circle = included (≤), shaded left = less than.'),
('Algebra', 'medium', 'inequalities', 'Solve: (x + 2)/3 < 4', 'x < 6', 'x < 14', 'x < 12', 'x < 10', 'D', 'x + 2 < 12 gives x < 10.'),
('Algebra', 'medium', 'inequalities', 'If -4 < a < 2, what is the range of 2a + 1?', '-7 < 2a + 1 < 5', '-8 < 2a + 1 < 4', '-9 < 2a + 1 < 3', '-7 < 2a + 1 < 3', 'A', 'Multiply by 2: -8 < 2a < 4. Add 1: -7 < 2a+1 < 5.');

-- Inequalities: Hard (18)
INSERT INTO sat_questions (category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
('Algebra', 'hard', 'inequalities', 'Solve: |3x - 6| > 9', 'x < -1 or x > 5', '-1 < x < 5', 'x > 5 only', 'x < -1 only', 'A', '3x-6 > 9 gives x > 5. 3x-6 < -9 gives x < -1. Solution: x < -1 or x > 5.'),
('Algebra', 'hard', 'inequalities', 'How many integer solutions satisfy |x - 4| ≤ 3?', '5', '6', '8', '7', 'D', '1 ≤ x ≤ 7. Integers: 1,2,3,4,5,6,7 = 7.'),
('Algebra', 'hard', 'inequalities', 'Solve: x² - 5x + 6 ≤ 0', '2 ≤ x ≤ 3', 'x ≤ 2 or x ≥ 3', 'x ≤ -2 or x ≥ -3', '-3 ≤ x ≤ -2', 'A', '(x-2)(x-3) ≤ 0. Opens up, so ≤ 0 between roots: 2 ≤ x ≤ 3.'),
('Algebra', 'hard', 'inequalities', 'If 0 < a < 1, which is greatest?', 'a', 'a²', '√a', '1/a', 'D', 'For 0 < a < 1: 1/a > 1 > √a > a > a². So 1/a is greatest.'),
('Algebra', 'hard', 'inequalities', 'Solve the system: x + y ≤ 10 and x ≥ 3 and y ≥ 2. What is the maximum value of x?', '5', '6', '7', '8', 'D', 'With y ≥ 2: x ≤ 10 - 2 = 8. So max x = 8.'),
('Algebra', 'hard', 'inequalities', 'For what values of k does kx² + 4x + 1 > 0 for all real x?', 'k > 4', 'k ≥ 4', 'k > 0', '0 < k < 4', 'A', 'Need k > 0 and discriminant < 0: 16 - 4k < 0 gives k > 4.'),
('Algebra', 'hard', 'inequalities', 'Solve: (x - 1)(x + 3) > 0', 'x < -3 or x > 1', '-3 < x < 1', 'x > 1 only', 'x < -3 only', 'A', 'Product is positive when both same sign: x < -3 or x > 1.'),
('Algebra', 'hard', 'inequalities', 'If |x - 2| + |x - 8| = 6, what are the possible values of x?', '2 ≤ x ≤ 8', 'x = 2 or x = 8', 'x = 5 only', 'All real numbers', 'A', 'The sum of distances from 2 and 8 equals 6 (the gap between them). True for all x in [2, 8].'),
('Algebra', 'hard', 'inequalities', 'Solve: 2x² + 3x - 5 < 0', '-5/2 < x < 1', 'x < -5/2 or x > 1', '-1 < x < 5/2', 'x < -1 or x > 5/2', 'A', 'Factor: (2x+5)(x-1) < 0. Roots at x = -5/2 and x = 1. Negative between: -5/2 < x < 1.'),
('Algebra', 'hard', 'inequalities', 'A company''s profit P (in thousands) is P = -2x² + 16x - 24. For what values of x is P > 0?', '2 < x < 6', 'x > 6', '0 < x < 8', '4 < x < 12', 'A', '-2x²+16x-24 > 0 gives x²-8x+12 < 0, (x-2)(x-6) < 0, so 2 < x < 6.'),
('Algebra', 'hard', 'inequalities', 'If a > b > 0, which must be true?', 'a² > b²', '1/a > 1/b', 'a - b < 0', 'ab < 0', 'A', 'Both positive and a > b, so squaring preserves inequality: a² > b².'),
('Algebra', 'hard', 'inequalities', 'Solve: |x + 1| > |x - 3|', 'x > 1', 'x < 1', 'x > 3', 'x < -1', 'A', 'Square both sides: (x+1)² > (x-3)² gives x²+2x+1 > x²-6x+9, so 8x > 8, x > 1.'),
('Algebra', 'hard', 'inequalities', 'How many integer values of x satisfy both x² < 20 and x > -3?', '5', '6', '7', '8', 'C', 'x² < 20 means roughly -4.47 < x < 4.47. With x > -3: integers -2,-1,0,1,2,3,4 = 7.'),
('Algebra', 'hard', 'inequalities', 'If 2x + 3y ≤ 12, x ≥ 0, and y ≥ 0, what is the maximum value of y?', '2', '3', '4', '6', 'C', 'Set x = 0: 3y ≤ 12 gives y ≤ 4. Maximum y = 4.'),
('Algebra', 'hard', 'inequalities', 'Solve: x/(x - 2) ≥ 0', 'x ≤ 0 or x > 2', 'x < 0 or x > 2', '0 < x < 2', '0 ≤ x ≤ 2', 'A', 'Critical points at x=0 and x=2. Positive for x<0 and x>2. Include x=0 (equals 0), exclude x=2 (undefined).'),
('Algebra', 'hard', 'inequalities', 'If -2 ≤ x ≤ 3 and -1 ≤ y ≤ 4, what is the maximum value of x - y?', '1', '3', '4', '5', 'C', 'Max x - y: max x = 3, min y = -1. So 3 - (-1) = 4.'),
('Algebra', 'hard', 'inequalities', 'Solve: (x - 1)²(x + 2) < 0', 'x < -2', 'x < 1', '-2 < x < 1', 'x > 1', 'A', '(x-1)² ≥ 0 always. For product < 0, need (x-1)² > 0 (x ≠ 1) and (x+2) < 0 (x < -2).'),
('Algebra', 'hard', 'inequalities', 'If x² + 2x - 8 ≤ 0, what is the solution set?', 'x ≤ -4 or x ≥ 2', '-4 ≤ x ≤ 2', 'x ≤ 2', '-2 ≤ x ≤ 4', 'B', 'Factor: (x+4)(x-2) ≤ 0. Opens up, so ≤ 0 between roots: -4 ≤ x ≤ 2.');
