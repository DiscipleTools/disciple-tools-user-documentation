/**
 * Post-Process Video to Remove Electron Nav Bar
 * 
 * This script takes a completed video and performs additional cropping
 * to ensure no browser chrome is visible in the final output.
 */

const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Configuration
const args = process.argv.slice(2);
const inputVideo = args[0] || path.join(__dirname, '../video-docs/output/contacts-video.mp4');

// Create a temp output path if input and output paths are the same
let outputVideo = args[1] || path.join(__dirname, '../video-docs/output/contacts-video-final.mp4');
const useTemp = inputVideo === outputVideo;
const tempVideo = useTemp 
  ? path.join(path.dirname(outputVideo), `temp-${Date.now()}-${path.basename(outputVideo)}`) 
  : outputVideo;

// Ensure output directory exists
const outputDir = path.dirname(tempVideo);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Post-processing video: ${inputVideo}`);
console.log(`Final output destination: ${outputVideo}`);
if (useTemp) {
  console.log(`Using temporary file: ${tempVideo}`);
}

// Process the video to remove Electron UI
async function processVideo() {
  try {
    // Get video information first to determine actual dimensions
    const videoInfo = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputVideo, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Find video stream
        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }
        
        resolve({
          width: videoStream.width,
          height: videoStream.height,
          duration: parseFloat(metadata.format.duration || 0)
        });
      });
    });
    
    console.log(`Video dimensions: ${videoInfo.width}x${videoInfo.height}, Duration: ${videoInfo.duration}s`);
    
    // Calculate crop values (remove top 150px where navbar is)
    const cropTop = 75;
    const newHeight = videoInfo.height - cropTop;
    
    console.log(`Cropping: Removing ${cropTop}px from top, new height: ${newHeight}px`);
    
    // Process video with ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(inputVideo)
        .videoFilters([
          // Crop the top portion of the video to remove the Electron navbar
          `crop=${videoInfo.width}:${newHeight}:0:${cropTop}`
        ])
        .outputOptions([
          // Maintain quality
          '-c:v libx264',
          '-preset slow',
          '-crf 22',
          // Copy audio stream without re-encoding
          '-c:a copy'
        ])
        .on('start', cmdline => {
          console.log('FFmpeg started with command:', cmdline);
        })
        .on('progress', progress => {
          // Calculate percentage
          const percent = Math.floor((progress.percent || 0));
          process.stdout.write(`Processing: ${percent}% complete\r`);
        })
        .on('end', () => {
          console.log('\nVideo processing completed successfully');
          resolve();
        })
        .on('error', (err) => {
          console.error('\nError processing video:', err);
          reject(err);
        })
        .save(tempVideo);
    });
    
    // If the original and output paths are different, replace the original
    if (inputVideo !== tempVideo && fs.existsSync(tempVideo)) {
      fs.copyFileSync(tempVideo, inputVideo);
      console.log(`Replaced original video with processed version`);
    }
    
    // Handle the temp file and final output
    if (useTemp && fs.existsSync(tempVideo)) {
      // For safety, delete the destination first if it exists
      if (fs.existsSync(outputVideo)) {
        fs.unlinkSync(outputVideo);
      }
      
      // Move the temp file to the final destination
      fs.renameSync(tempVideo, outputVideo);
      console.log(`Moved processed video from temp location to final destination`);
    }
    
    console.log(`✅ Final video saved to: ${outputVideo}`);
    
  } catch (error) {
    console.error('❌ Error processing video:', error);
    process.exit(1);
  }
}

// Run the main function
processVideo(); 