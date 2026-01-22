-- Tighten INSERT policy to satisfy linter (avoid WITH CHECK (true))
DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;
CREATE POLICY "Anyone can submit a review"
ON public.reviews
FOR INSERT
TO public
WITH CHECK (
  rating BETWEEN 1 AND 5
  AND char_length(name) BETWEEN 1 AND 60
  AND char_length(body) BETWEEN 1 AND 800
  AND (design IS NULL OR char_length(design) <= 80)
  AND approved = false
);
