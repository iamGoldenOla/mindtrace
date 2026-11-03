-- SYNTHETIC DATA. NOT REAL CHILDREN.
-- MINDTRACE seed: two teachers, four synthetic learners, Forms A/B/C.
-- Auth users for these profiles must exist (created via Supabase Auth);
-- the UUIDs below are placeholders to be replaced with the real auth user ids.

-- Placeholder teacher ids (replace with real auth.users ids):
-- teacher.a@example.test -> 11111111-1111-1111-1111-111111111111
-- teacher.b@example.test -> 22222222-2222-2222-2222-222222222222

insert into profiles (id, display_name, email, role) values
  ('11111111-1111-1111-1111-111111111111', 'Teacher A', 'teacher.a@example.test', 'teacher'),
  ('22222222-2222-2222-2222-222222222222', 'Teacher B', 'teacher.b@example.test', 'teacher')
on conflict (id) do nothing;

insert into learners (code, pseudonym, stage, preferred_language, assessment_language, created_by) values
  ('L-0001', 'Ade', 'Year 2', 'en', 'en', '11111111-1111-1111-1111-111111111111'),
  ('L-0002', 'Bola', 'Year 2', 'yo', 'en', '11111111-1111-1111-1111-111111111111'),
  ('L-0003', 'Chidi', 'Year 2', 'en', 'en', '11111111-1111-1111-1111-111111111111'),
  ('L-0004', 'Dara', 'Year 2', 'en', 'en', '22222222-2222-2222-2222-222222222222')
on conflict (code) do nothing;

-- Teacher A owns L-0001..L-0003; Teacher B owns L-0004 (proves isolation).
insert into learner_access (user_id, learner_id, access_role)
select '11111111-1111-1111-1111-111111111111', id, 'owner' from learners where code in ('L-0001','L-0002','L-0003')
on conflict do nothing;
insert into learner_access (user_id, learner_id, access_role)
select '22222222-2222-2222-2222-222222222222', id, 'owner' from learners where code = 'L-0004'
on conflict do nothing;

insert into assessment_definitions (slug, name, skill, form, language, instructions, scoring, target) values
  ('read-aloud-a', 'Read-Aloud Form A', 'oral_reading', 'A', 'en',
   '{"note": "Baseline passage. Adult supervises."}'::jsonb, '{"method": "word_alignment"}'::jsonb,
   '{"words": ["Sam","has","a","red","hat","The","hat","is","on","the","bed","A","dog","sits","on","the","mat","by","the","shed","Then","the","dog","digs","in","the","sand","and","finds","a","shell"], "sentences": ["Sam has a red hat.", "The hat is on the bed.", "A dog sits on the mat by the shed.", "Then the dog digs in the sand and finds a shell."]}'::jsonb),
  ('read-aloud-b', 'Read-Aloud Form B', 'oral_reading', 'B', 'en',
   '{"note": "Matched follow-up passage. Adult supervises."}'::jsonb, '{"method": "word_alignment"}'::jsonb,
   '{"words": ["Tom","has","a","tan","cap","The","cap","is","in","the","bag","A","cat","naps","on","the","rug","by","the","bench","Then","the","cat","hops","up","the","steps","and","finds","a","fish"], "sentences": ["Tom has a tan cap.", "The cap is in the bag.", "A cat naps on the rug by the bench.", "Then the cat hops up the steps and finds a fish."]}'::jsonb),
  ('read-aloud-c', 'Read-Aloud Form C', 'oral_reading', 'C', 'en',
   '{"note": "Spare matched form. Adult supervises."}'::jsonb, '{"method": "word_alignment"}'::jsonb,
   '{"words": ["Ben","has","a","pink","bib","The","bib","is","on","the","chair","A","pup","sits","on","the","log","by","the","chest","Then","the","pup","digs","in","the","grass","and","finds","a","shell"], "sentences": ["Ben has a pink bib.", "The bib is on the chair.", "A pup sits on the log by the chest.", "Then the pup digs in the grass and finds a shell."]}'::jsonb)
on conflict (slug) do nothing;

-- Resource candidates: UNREVIEWED (a person must review before use in reports).
insert into resources (title, publisher, url, type, language, topics, audience, summary, practical_action, review_status, region) values
  ('Inclusive education foundations', 'UNICEF', 'https://www.unicef.org/education/inclusive-education', 'guide', 'en', '{inclusive_education}', '{teacher}', 'Our summary pending human review.', 'Read the guide and note one classroom change to try.', 'unreviewed', '{global}'),
  ('Teaching for neurodiversity: training videos', 'British Dyslexia Association', 'https://www.bdadyslexia.org.uk/advice/educators/teaching-for-neurodiversity/webinar-training-teaching-for-neurodiversity', 'video', 'en', '{reading,classroom_adjustments}', '{teacher}', 'Our summary pending human review.', 'Watch one video and note one strategy to try.', 'unreviewed', '{global}'),
  ('Inclusive classroom example (hearing loss)', 'UNICEF Nigeria', 'https://www.unicef.org/nigeria/stories/how-one-teacher-opens-classroom-children-hearing-loss', 'article', 'en', '{inclusive_education,hearing_vision}', '{teacher}', 'Our summary pending human review.', 'Note one seating or visual-aid change to try.', 'unreviewed', '{global}'),
  ('Classroom guidance for reading difficulties', 'International Dyslexia Association', 'https://dyslexiaida.org/dyslexia-in-the-classroom/', 'guide', 'en', '{reading}', '{teacher}', 'Our summary pending human review.', 'Pick one decoding routine and try it for a week.', 'unreviewed', '{global}')
on conflict do nothing;
