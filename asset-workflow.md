# Asset Workflow

Recommended workflow for creating and adding assets to the DotBros Painting Co. website:

1. Create artwork in Photoshop, Illustrator or Blender.
2. Save the editable source into `assets-source`.
3. Export a working version into `assets-source/exports`.
4. Optimize the image for the web (`.webp`, `.png` or `.svg` as appropriate).
5. Move the optimized version into the correct folder inside `public/assets`.
6. Reference only files inside `public/assets` from the website code.

Important reminders:
- Editable source files should always remain in `assets-source`.
- Website code should never reference files from `assets-source`.
- Only optimized production assets should be stored inside `public/assets`.
