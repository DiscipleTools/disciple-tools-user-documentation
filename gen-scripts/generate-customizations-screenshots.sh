#!/bin/bash

# Navigate to User-Documentation directory
cd "$(dirname "$0")/.."

# Create placeholder images directory if it doesn't exist
mkdir -p img/customizations

# Then try to run the customizations screenshots test
echo "Attempting to generate customizations screenshots..."
npx cypress run --spec "cypress/e2e/documentation/customizations_screenshots.cy.js"

# Check if at least some screenshots were generated
if ls img/customizations/*.png 1> /dev/null 2>&1; then
  echo "Screenshots successfully generated in img/customizations/"
  echo "The following screenshots were created:"
  ls -la img/customizations/*.png 2>/dev/null
else
  echo "No screenshots were generated."
fi

# Create annotation file to explain the screenshots
cat > "img/customizations/README.md" << EOF
# Screenshots for Customizations Documentation

The images in this directory are used in the [Customizations Documentation](../../customizations.md).

## About the Screenshots

- If you're seeing placeholder images, it means the automatic screenshot generation couldn't capture the actual UI.
- To replace these with actual screenshots, login to your Disciple.Tools instance and capture the relevant screens manually.
- For each placeholder, see the corresponding .html and .txt files for descriptions of what should be captured.

## Screenshot Checklist

- [ ] customizations-menu.png - The Customizations menu in the admin sidebar
- [ ] new-record-type.png - Dialog for creating a new record type 
- [ ] record-type-settings.png - Settings page for a record type
- [ ] tiles-example.png - Example of a tile with fields
- [ ] new-tile.png - Dialog for creating a new tile
- [ ] new-field.png - Dialog for creating a new field
- [ ] field-options.png - Options for a Key Select or Multi-Select field
- [ ] role-permissions.png - Permissions page for roles

EOF

echo "Created README.md in img/customizations/"
echo "Done!" 