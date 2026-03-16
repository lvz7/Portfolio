
-- Allow anyone to upload to review-images bucket
CREATE POLICY "Anyone can upload review images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'review-images' AND octet_length(name) < 200);

-- Allow anyone to view review images
CREATE POLICY "Anyone can view review images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'review-images');
