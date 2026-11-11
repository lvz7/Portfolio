DROP POLICY IF EXISTS "All reviews are viewable" ON public.reviews;
CREATE POLICY "Approved reviews are viewable" ON public.reviews FOR SELECT USING (approved = true);
DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;
CREATE POLICY "Anyone can submit a review" ON public.reviews FOR INSERT WITH CHECK ((rating >= 1) AND (rating <= 5) AND (char_length(name) >= 1) AND (char_length(name) <= 60) AND (char_length(body) >= 1) AND (char_length(body) <= 800) AND ((design IS NULL) OR (char_length(design) <= 80)) AND (approved = false));