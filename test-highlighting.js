// Simple test script to validate course highlighting functionality
// Run with: node test-highlighting.js

const BASE_URL = 'http://localhost:3002';

async function testHighlightingAPI() {
  console.log('🧪 Testing Course Highlighting Functionality\n');

  try {
    // Test 1: Get highlighted courses
    console.log('1. Testing highlighted courses endpoint...');
    const highlightedResponse = await fetch(`${BASE_URL}/api/courses/highlighted`);
    
    if (highlightedResponse.ok) {
      const highlightedCourses = await highlightedResponse.json();
      console.log(`✅ Highlighted courses endpoint working. Found ${highlightedCourses.length} highlighted courses`);
      
      if (highlightedCourses.length > 0) {
        console.log('   Sample highlighted course:', {
          title: highlightedCourses[0].title,
          course_code: highlightedCourses[0].course_code,
          is_highlighted: highlightedCourses[0].is_highlighted
        });
      }
    } else {
      console.log('❌ Highlighted courses endpoint failed:', highlightedResponse.status);
    }

    // Test 2: Get all courses (should include is_highlighted field)
    console.log('\n2. Testing admin courses endpoint...');
    const adminCoursesResponse = await fetch(`${BASE_URL}/api/admin/courses`);
    
    if (adminCoursesResponse.ok) {
      const adminCourses = await adminCoursesResponse.json();
      console.log(`✅ Admin courses endpoint working. Found ${adminCourses.length} courses`);
      
      if (adminCourses.length > 0) {
        const hasHighlightField = adminCourses[0].hasOwnProperty('is_highlighted');
        console.log(`   is_highlighted field present: ${hasHighlightField ? '✅' : '❌'}`);
        
        if (hasHighlightField) {
          const highlightedCount = adminCourses.filter(course => course.is_highlighted).length;
          console.log(`   Highlighted courses in admin view: ${highlightedCount}`);
        }
      }
    } else {
      console.log('❌ Admin courses endpoint failed:', adminCoursesResponse.status);
    }

    // Test 3: Test toggle endpoint (if we have courses)
    console.log('\n3. Testing course highlight toggle...');
    const coursesResponse = await fetch(`${BASE_URL}/api/admin/courses`);
    
    if (coursesResponse.ok) {
      const courses = await coursesResponse.json();
      
      if (courses.length > 0) {
        const testCourse = courses[0];
        console.log(`   Testing with course: ${testCourse.title} (${testCourse.course_code})`);
        
        // Try to toggle highlighting
        const toggleResponse = await fetch(`${BASE_URL}/api/admin/courses/${testCourse.id}/toggle-highlight`, {
          method: 'PATCH'
        });
        
        if (toggleResponse.ok) {
          const toggleResult = await toggleResponse.json();
          console.log('✅ Toggle endpoint working');
          console.log(`   Result: ${toggleResult.data.message}`);
          console.log(`   New highlight status: ${toggleResult.data.is_highlighted}`);
          
          // Toggle back to original state
          const toggleBackResponse = await fetch(`${BASE_URL}/api/admin/courses/${testCourse.id}/toggle-highlight`, {
            method: 'PATCH'
          });
          
          if (toggleBackResponse.ok) {
            const toggleBackResult = await toggleBackResponse.json();
            console.log(`   Toggled back: ${toggleBackResult.data.is_highlighted}`);
          }
        } else {
          console.log('❌ Toggle endpoint failed:', toggleResponse.status);
          const errorText = await toggleResponse.text();
          console.log('   Error:', errorText);
        }
      } else {
        console.log('   No courses available for testing toggle functionality');
      }
    }

    console.log('\n🎉 Testing completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the tests
testHighlightingAPI();
