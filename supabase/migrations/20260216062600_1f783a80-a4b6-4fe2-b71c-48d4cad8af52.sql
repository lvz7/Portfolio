
-- Drop old restrictive policies
DROP POLICY "Anyone can submit a review" ON public.reviews;
DROP POLICY "Approved reviews are viewable by everyone" ON public.reviews;

-- Allow inserting with approved = true
CREATE POLICY "Anyone can submit a review"
ON public.reviews FOR INSERT
WITH CHECK (
  rating >= 1 AND rating <= 5
  AND char_length(name) >= 1 AND char_length(name) <= 60
  AND char_length(body) >= 1 AND char_length(body) <= 800
  AND (design IS NULL OR char_length(design) <= 80)
  AND approved = true
);

-- All reviews are now visible
CREATE POLICY "All reviews are viewable"
ON public.reviews FOR SELECT
USING (true);
