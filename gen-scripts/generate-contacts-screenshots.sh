#!/bin/bash

# Navigate to User-Documentation directory
cd "$(dirname "$0")/.."

# Create contacts images directory if it doesn't exist
mkdir -p img/contacts

# Then try to run the contacts screenshots test
echo "Attempting to generate contacts screenshots..."
npx cypress run --spec "cypress/e2e/contacts/create_new_contact.cy.js"

# Check if at least some screenshots were generated
if ls img/contacts/*.png 1> /dev/null 2>&1; then
  echo "Screenshots successfully generated in img/contacts/"
  echo "The following screenshots were created:"
  ls -la img/contacts/*.png 2>/dev/null
else
  echo "No screenshots were generated."
fi

# Create annotation file to explain the screenshots
cat > "img/contacts/README.md" << EOF
# Screenshots for Contacts Documentation

The images in this directory are used in the [Contacts Documentation](../../docs/contacts.md).

## About the Screenshots

- If you're seeing placeholder images, it means the automatic screenshot generation couldn't capture the actual UI.
- To replace these with actual screenshots, login to your Disciple.Tools instance and capture the relevant screens manually.
- For each placeholder, see the corresponding .html and .txt files for descriptions of what should be captured.

## Screenshot Checklist

- [ ] contacts-menu.png - The Contacts menu in the sidebar
- [ ] new-contact-button.png - The button to create a new contact
- [ ] create-contact-form.png - The form for creating a new contact
- [ ] contact-details.png - The details page of a newly created contact
- [ ] contact-tiles.png - Example of contact tiles with fields
- [ ] contact-communication.png - Communication channels for a contact
- [ ] contact-connections.png - Connections to other records
- [ ] contact-filters.png - Filtering contacts in the list view

EOF

echo "Created README.md in img/contacts/"
echo "Done!" 