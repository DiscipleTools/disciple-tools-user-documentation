# Disciple.Tools User Documentation

This directory contains the user documentation for Disciple.Tools generated from code.

## User Guides

- [Customizations (D.T) BETA](docs/customizations.md) - Learn how to customize record types, tiles, and fields in Disciple.Tools
- [Creating and Managing Contacts](docs/contacts.md) - Learn how to create and manage contacts in Disciple.Tools
- [Changing Your Display Name](docs/changing-display-name.md) - Learn how to change your display name in the Settings page

## Contributing to Documentation

If you'd like to contribute to this documentation, please:

1. Fork the repository
2. Make your changes
3. Submit a pull request

When adding new documentation:
- Use markdown format
- Include a table of contents for longer documents
- Add the file to this README.md
- Place screenshots in the `img/` directory, organized in subdirectories by topic 

## Generating Screenshots

Each documentation section has a corresponding script in the `gen-scripts/` directory:

```bash
# To generate screenshots for the contacts documentation
./gen-scripts/generate-contacts-screenshots.sh

# To generate screenshots for the display name documentation
./gen-scripts/generate-display-name-screenshots.sh
```

## Starter prompt for new documentation
Based on the existing structure and format generate new user documentation for "x".

Use cypress to captures screenshots. Do not create placeholder images or descriptions files. Makes sure all selectors point to valid elements.

Put the new documentation .md fil is the /docs folder. 
The script to generate the screenshots in the /gen-scripts folder. Make it executable.
The images in the /img folders under the correct subfolder.

All the project code is available in the wp-content/themes/disciple-tools-theme folder.
In the end Prompt the user to run the script to generate the screenshots.