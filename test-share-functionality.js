// Test script to verify share functionality
const { generateShareUrl, parseShareUrl } = require('./lib/share-utils.ts');

// Test URL generation
console.log('Testing URL generation:');
console.log('Video URL:', generateShareUrl('video', 'test-video-id'));
console.log('Slide URL:', generateShareUrl('slide', 'test-slide-id'));
console.log('Study Tool URL:', generateShareUrl('study-tool', 'test-study-tool-id'));

// Test URL parsing
console.log('\nTesting URL parsing:');
console.log('Parse video URL:', parseShareUrl('http://localhost:3000/video/test-video-id'));
console.log('Parse slide URL:', parseShareUrl('http://localhost:3000/slide/test-slide-id'));
console.log('Parse study tool URL:', parseShareUrl('http://localhost:3000/study-tool/test-study-tool-id'));
