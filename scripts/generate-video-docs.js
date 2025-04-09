/**
 * Video Documentation Generator
 * 
 * This script processes Cypress videos with narration to create
 * comprehensive video documentation.
 */

const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Configuration
const config = {
  scriptDir: path.join(__dirname, '../video-docs/scripts'),
  audioDir: path.join(__dirname, '../video-docs/audio'),
  videoDir: path.join(__dirname, '../cypress/videos'),
  outputDir: path.join(__dirname, '../video-docs/output')
};

// Ensure directories exist
Object.values(config).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Check if we're on macOS
 * @returns {boolean}
 */
function isMacOS() {
  return process.platform === 'darwin';
}

/**
 * Generate audio narration from a script using the appropriate system TTS
 * @param {string} text - The text to convert to speech
 * @param {string} outputPath - Where to save the audio file
 * @returns {Promise<string>} - Path to the generated audio file
 */
async function generateNarration(text, outputPath) {
  try {
    console.log(`Generating narration: "${text.substring(0, 30)}..."`);
    
    // Save text version for reference
    fs.writeFileSync(outputPath + '.txt', text, 'utf8');
    
    // Use AIFF format for macOS (better supported by 'say' command)
    const outputPathAiff = outputPath.replace(/\.wav$/, '') + '.aiff';
    
    let success = false;
    
    // Use macOS built-in say command if available
    if (isMacOS()) {
      try {
        console.log('Using macOS say command with AIFF format');
        // Quote the text to handle special characters
        const quotedText = text.replace(/"/g, '\\"');
        
        // Use a better voice for narration and output to AIFF format
        const sayCmd = `say -v Samantha -o "${outputPathAiff}" "${quotedText}"`;
        console.log(`Executing: ${sayCmd}`);
        
        await execPromise(sayCmd);
        success = fs.existsSync(outputPathAiff);
        
        if (success) {
          console.log(`Audio file generated with macOS say command: ${outputPathAiff}`);
          
          // Convert AIFF to WAV using ffmpeg if needed
          if (outputPathAiff !== outputPath && outputPath.endsWith('.wav')) {
            const wavPath = outputPath;
            await new Promise((resolve, reject) => {
              ffmpeg(outputPathAiff)
                .audioCodec('pcm_s16le')  // Standard WAV codec
                .format('wav')
                .on('end', () => {
                  console.log(`Converted AIFF to WAV: ${wavPath}`);
                  resolve();
                })
                .on('error', (err) => {
                  console.error('Error converting AIFF to WAV:', err);
                  reject(err);
                })
                .save(wavPath);
            });
            return wavPath;
          }
          
          return outputPathAiff;
        } else {
          console.log('Failed to generate audio with macOS say command');
        }
      } catch (error) {
        console.error('Error using macOS say command:', error.message);
      }
    }
    
    // If we reach here, no method worked
    console.log('No suitable TTS method available, falling back to text-only narration');
    return outputPath + '.txt';
  } catch (error) {
    console.error('Error generating narration:', error);
    console.log('Falling back to text-only narration');
    return outputPath + '.txt';
  }
}

/**
 * Extract narration segments from a markdown script
 * @param {string} scriptPath - Path to the markdown script file
 * @returns {Array<{section: string, text: string, duration: number}>}
 */
function parseScript(scriptPath) {
  try {
    const content = fs.readFileSync(scriptPath, 'utf8');
    const lines = content.split('\n');
    const segments = [];
    
    let currentSection = '';
    let currentText = '';
    let currentDuration = 0;
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        // Save previous section if exists
        if (currentSection && currentText) {
          segments.push({
            section: currentSection,
            text: currentText.trim(),
            duration: currentDuration
          });
        }
        
        // Parse new section with duration
        const match = line.match(/## (.*) \((\d+) seconds\)/);
        if (match) {
          currentSection = match[1];
          currentDuration = parseInt(match[2], 10);
          currentText = '';
        }
      } else if (line.trim() && !line.startsWith('#')) {
        // Add to current text if not empty and not a heading
        currentText += line + ' ';
      }
    }
    
    // Add the last section
    if (currentSection && currentText) {
      segments.push({
        section: currentSection,
        text: currentText.trim(),
        duration: currentDuration
      });
    }
    
    return segments;
  } catch (error) {
    console.error(`Error parsing script ${scriptPath}:`, error);
    return [];
  }
}

/**
 * Generate audio files for all script segments
 * @param {Array} segments - Script segments
 * @param {string} audioDir - Directory to save audio files
 * @returns {Promise<Array<{section: string, audioPath: string, duration: number}>>}
 */
async function generateAudioSegments(segments, audioDir) {
  const audioSegments = [];
  
  console.log(`Generating ${segments.length} audio segments...`);
  
  for (const [index, segment] of segments.entries()) {
    const fileName = `segment_${index + 1}_${segment.section.toLowerCase().replace(/\s+/g, '_')}.wav`;
    const outputPath = path.join(audioDir, fileName);
    
    try {
      console.log(`\nProcessing segment ${index + 1}/${segments.length}: ${segment.section}`);
      const audioPath = await generateNarration(segment.text, outputPath);
      audioSegments.push({
        section: segment.section,
        audioPath: audioPath,
        duration: segment.duration
      });
    } catch (error) {
      console.error(`Failed to generate audio for segment ${segment.section}:`, error);
    }
  }
  
  return audioSegments;
}

/**
 * Process a specific documentation module
 * @param {string} moduleName - Name of the documentation module (e.g., 'contacts')
 */
async function processModule(moduleName) {
  try {
    console.log(`\nProcessing documentation module: ${moduleName}`);
    
    // Paths
    const scriptPath = path.join(config.scriptDir, `${moduleName}-script.md`);
    let videoPath = path.join(config.videoDir, `${moduleName}_video.cy.js.mp4`);
    const outputPath = path.join(config.outputDir, `${moduleName}-video.mp4`);
    const moduleAudioDir = path.join(config.audioDir, moduleName);
    
    // Ensure module audio directory exists
    if (!fs.existsSync(moduleAudioDir)) {
      fs.mkdirSync(moduleAudioDir, { recursive: true });
    }
    
    // Look for the video file
    if (!fs.existsSync(videoPath)) {
      // Check for alternative paths
      const altPath = path.join(config.videoDir, 'video-docs', `${moduleName}_video.cy.js.mp4`);
      if (fs.existsSync(altPath)) {
        videoPath = altPath;
        console.log(`Found video at alternate path: ${videoPath}`);
      } else {
        // List all videos in the directory
        console.log("Looking for video files...");
        const files = fs.readdirSync(config.videoDir);
        console.log("Available video files:", files);
        
        // Try to find a matching video
        const videoFile = files.find(file => file.endsWith('.mp4') && file.includes(moduleName));
        if (videoFile) {
          videoPath = path.join(config.videoDir, videoFile);
          console.log(`Found fallback video: ${videoPath}`);
        } else {
          throw new Error(`Video not found at ${videoPath} or any alternate location`);
        }
      }
    }
    
    // Check for script file
    if (!fs.existsSync(scriptPath)) {
      console.log(`Script not found at ${scriptPath}, creating simple placeholder script`);
      // Create a basic script if not found
      const basicScript = `# ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Video Documentation\n\n## Introduction (10 seconds)\nThis is a placeholder script for the ${moduleName} video documentation.\n`;
      fs.writeFileSync(scriptPath, basicScript, 'utf8');
    }
    
    // Parse script
    console.log(`Parsing script: ${scriptPath}`);
    const segments = parseScript(scriptPath);
    console.log(`Found ${segments.length} script segments`);
    
    if (segments.length === 0) {
      console.log("No script segments found. Using a simple copy approach.");
      fs.copyFileSync(videoPath, outputPath);
      console.log(`Video copied to: ${outputPath}`);
    } else {
      // Generate audio
      console.log('Generating audio narration...');
      const audioSegments = await generateAudioSegments(segments, moduleAudioDir);
      console.log(`Generated ${audioSegments.length} audio segments`);
      
      // Check if we're ready for ffmpeg processing
      const audioFiles = audioSegments.filter(segment => 
        !segment.audioPath.endsWith('.txt') && fs.existsSync(segment.audioPath)
      );
      
      if (audioFiles.length > 0) {
        // For a real implementation, we would use FFmpeg to combine the video with audio segments
        console.log(`Ready to combine video with ${audioFiles.length} audio segments using FFmpeg`);
        
        try {
          // First, check if the video has an audio stream
          const videoInfo = await new Promise((resolve, reject) => {
            let info = {};
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
              if (err) {
                reject(err);
                return;
              }
              
              // Check for audio streams
              info.hasAudio = metadata.streams.some(stream => stream.codec_type === 'audio');
              info.streams = metadata.streams.length;
              info.duration = parseFloat(metadata.format.duration || 0);
              resolve(info);
            });
          });
          
          console.log(`Video info: Has audio: ${videoInfo.hasAudio}, Total streams: ${videoInfo.streams}, Duration: ${videoInfo.duration}s`);
          
          // Concatenate all audio segments into one file
          const concatAudioPath = path.join(moduleAudioDir, 'combined_narration.wav');
          
          // Sort audio segments by their index in the original array
          audioFiles.sort((a, b) => {
            const indexA = parseInt(path.basename(a.audioPath).split('_')[1]) || 0;
            const indexB = parseInt(path.basename(b.audioPath).split('_')[1]) || 0;
            return indexA - indexB;
          });
          
          console.log('Concatenating audio segments into a single narration track...');
          await new Promise((resolve, reject) => {
            const command = ffmpeg();
            
            // Add all audio files as inputs
            audioFiles.forEach(segment => {
              command.input(segment.audioPath);
            });
            
            // Create filter complex for concatenating audio
            const filterInputs = audioFiles.map((_, i) => `[${i}:0]`).join('');
            const concatFilter = `${filterInputs}concat=n=${audioFiles.length}:v=0:a=1[aout]`;
            
            command
              .complexFilter(concatFilter)
              .outputOptions(['-map [aout]'])
              .on('start', cmdline => {
                console.log('FFmpeg concat started with command:', cmdline);
              })
              .on('end', () => {
                console.log(`Combined audio saved to: ${concatAudioPath}`);
                resolve();
              })
              .on('error', (err) => {
                console.error('Error concatenating audio:', err);
                reject(err);
              })
              .save(concatAudioPath);
          });
          
          // Now combine the video with the concatenated audio
          console.log('Combining video with narration track...');
          
          // Use fluent-ffmpeg instead of exec for more reliable cross-platform operation
          await new Promise((resolve, reject) => {
            // Create a new ffmpeg command
            const command = ffmpeg(videoPath)
              .input(concatAudioPath)
            //   .videoFilters([
            //     // Crop 150px from the top to remove the browser chrome/navbar
            //     'crop=in_w:in_h-150:0:150'
            //   ])
              .outputOptions([
                '-map 0:v',       // Use video from first input
                '-map 1:a',       // Use audio from second input
                '-y'              // Overwrite output file
              ])
              .on('start', cmdline => {
                console.log('FFmpeg processing started with command:', cmdline);
              })
              .on('end', () => {
                console.log('Processing finished successfully');
                resolve();
              })
              .on('error', (err) => {
                console.error('Error processing video:', err);
                reject(err);
              })
              .save(outputPath);
          });
          
          console.log(`\n✅ Video with narration saved to: ${outputPath}`);
        } catch (error) {
          console.error('Error combining video and audio:', error);
          // Fallback to simple copy
          fs.copyFileSync(videoPath, outputPath);
          console.log(`Fallback: Video copied to: ${outputPath}`);
        }
      } else {
        // Simple copy if no audio segments are ready
        fs.copyFileSync(videoPath, outputPath);
        console.log(`\n✅ Video copied to: ${outputPath}`);
        console.log("No audio files were generated for combining with video.");
      }
    }
    
  } catch (error) {
    console.error(`\n❌ Failed to process module ${moduleName}:`, error);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Get module name from command line arguments
    const args = process.argv.slice(2);
    const moduleName = args[0] || 'contacts'; // Default to contacts if not specified
    
    await processModule(moduleName);
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 
