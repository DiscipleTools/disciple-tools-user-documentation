#!/bin/bash

# Navigate to User-Documentation directory
cd "$(dirname "$0")/.."

# Create video directories if they don't exist
mkdir -p video-docs/audio/contacts
mkdir -p video-docs/output

# Install dependencies if needed
if [ ! -d "node_modules/fluent-ffmpeg" ]; then
  echo "Installing required dependencies..."
  npm install
fi

# Set environment variables to completely hide browser UI
export CYPRESS_NO_COMMAND_LOG=1
export CYPRESS_BROWSER_FRAME_SHOWN=false
export CYPRESS_BROWSER_UI_SHOWN=false
export CYPRESS_FORCE_HEADLESS=true
export CYPRESS_VIEW_MODE=no-header
export CYPRESS_CHROME_HEADLESS=true

# First run the Cypress test to generate the video - in headless mode
echo "Running Cypress test to record contacts video..."

# Run Cypress with explicit headless mode and additional flags to hide UI
npx cypress run \
  --spec "cypress/e2e/video-docs/contacts_video.cy.js" \
  --browser chrome \
  --headless \
  --config "videoCompression=32,experimentalWebKitSupport=true,numTestsKeptInMemory=0,viewportWidth=1280,viewportHeight=800,autoHideMenuBar=true"

# Check if video was generated - look for the video file in the right location
if [ ! -f "cypress/videos/contacts_video.cy.js.mp4" ]; then
  # Also check for video in subdirectory
  if [ ! -f "cypress/videos/video-docs/contacts_video.cy.js.mp4" ]; then
    echo "ERROR: Cypress failed to generate video. Checking for video files..."
    find cypress/videos -type f -name "*.mp4" -print
    echo "Check Cypress logs for details."
    exit 1
  else
    echo "Video found in subdirectory."
    # Copy to expected location
    mkdir -p "$(dirname "cypress/videos/contacts_video.cy.js.mp4")"
    cp "cypress/videos/video-docs/contacts_video.cy.js.mp4" "cypress/videos/contacts_video.cy.js.mp4"
  fi
fi

# Process the video with narration
echo "Processing video with narration..."
node scripts/generate-video-docs.js contacts

# Run additional post-processing to completely remove Electron UI
echo "Running final post-processing to remove any browser UI..."
node scripts/post-process-video.js "video-docs/output/contacts-video.mp4" "video-docs/output/contacts-video.mp4"

# Clean up temporary files
echo "Cleaning up temporary files..."
rm -f video-docs/audio/contacts/*.wav
rm -f video-docs/audio/contacts/*.aiff
rm -f video-docs/audio/contacts/*.txt

# Check if final video was generated
if [ -f "video-docs/output/contacts-video.mp4" ]; then
  echo "✅ Video documentation successfully generated!"
  echo "Output: video-docs/output/contacts-video.mp4"
else
  echo "❌ Failed to generate final video. Check logs for details."
  exit 1
fi

echo "Done!"
