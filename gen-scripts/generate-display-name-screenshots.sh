#!/bin/bash

# Navigate to User-Documentation directory
cd "$(dirname "$0")/.."

# Create display-name images directory if it doesn't exist
mkdir -p img/display-name

# Run the display name screenshots test
echo "Attempting to generate display name screenshots..."
npx cypress run --spec "cypress/e2e/documentation/change_display_name.cy.js"

# Check if at least some screenshots were generated
if ls img/display-name/*.png 1> /dev/null 2>&1; then
  echo "Screenshots successfully generated in img/display-name/"
  echo "The following screenshots were created:"
  ls -la img/display-name/*.png 2>/dev/null
else
  echo "No screenshots were generated."
fi

# Create annotation file to explain the screenshots
cat > "img/display-name/README.md" << EOF
# Screenshots for Display Name Change Documentation

The images in this directory are used in the [Changing Display Name Documentation](../../docs/changing-display-name.md).

## About the Screenshots

- If you're seeing placeholder images, it means the automatic screenshot generation couldn't capture the actual UI.
- To replace these with actual screenshots, login to your Disciple.Tools instance and capture the relevant screens manually.
- For each placeholder, see the corresponding descriptions of what should be captured.

## Screenshot Checklist

- [ ] settings-menu.png - The top navigation bar showing the Settings link
- [ ] profile-information.png - The profile information section on the Settings page
- [ ] display-name-field.png - The nickname/display name field in the form
- [ ] update-button.png - The update button at the bottom of the form
- [ ] updated-display-name.png - The profile after updating the display name

EOF

echo "Created README.md in img/display-name/"
echo "Done!" 