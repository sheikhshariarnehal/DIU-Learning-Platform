// Test the complete highlighting flow
const BASE_URL = 'http://localhost:3002';

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Course Highlighting Flow\n');

  try {
    // Step 1: Get all courses
    console.log('1. Getting all courses...');
    const coursesResponse = await fetch(`${BASE_URL}/api/admin/courses`);
    const courses = await coursesResponse.json();
    console.log(`   Found ${courses.length} courses`);

    if (courses.length === 0) {
      console.log('❌ No courses available for testing');
      return;
    }

    const testCourse = courses[0];
    console.log(`   Using test course: ${testCourse.title} (${testCourse.course_code})`);

    // Step 2: Check initial highlighted courses count
    console.log('\n2. Checking initial highlighted courses...');
    let highlightedResponse = await fetch(`${BASE_URL}/api/courses/highlighted`);
    let highlightedCourses = await highlightedResponse.json();
    const initialCount = highlightedCourses.length;
    console.log(`   Initial highlighted courses: ${initialCount}`);

    // Step 3: Highlight the test course
    console.log('\n3. Highlighting test course...');
    const highlightResponse = await fetch(`${BASE_URL}/api/admin/courses/${testCourse.id}/toggle-highlight`, {
      method: 'PATCH'
    });
    const highlightResult = await highlightResponse.json();
    console.log(`   ${highlightResult.data.message}`);
    console.log(`   Course is now highlighted: ${highlightResult.data.is_highlighted}`);

    // Step 4: Verify the course appears in highlighted courses
    console.log('\n4. Verifying course appears in highlighted list...');
    highlightedResponse = await fetch(`${BASE_URL}/api/courses/highlighted`);
    highlightedCourses = await highlightedResponse.json();
    const newCount = highlightedCourses.length;
    console.log(`   Highlighted courses now: ${newCount}`);

    const foundHighlighted = highlightedCourses.find(course => course.id === testCourse.id);
    if (foundHighlighted) {
      console.log('✅ Course successfully appears in highlighted list');
      console.log(`   Course details: ${foundHighlighted.title} (${foundHighlighted.course_code})`);
      console.log(`   Semester: ${foundHighlighted.semester.title} (${foundHighlighted.semester.section})`);
    } else {
      console.log('❌ Course not found in highlighted list');
    }

    // Step 5: Test sorting (highlighted courses should appear first)
    console.log('\n5. Testing course sorting...');
    const semesterCoursesResponse = await fetch(`${BASE_URL}/api/semesters/${testCourse.semester.id}/courses`);
    if (semesterCoursesResponse.ok) {
      const semesterCourses = await semesterCoursesResponse.json();
      const highlightedInSemester = semesterCourses.filter(course => course.is_highlighted);
      console.log(`   Highlighted courses in semester: ${highlightedInSemester.length}`);
      
      if (highlightedInSemester.length > 0) {
        const firstCourse = semesterCourses[0];
        if (firstCourse.is_highlighted) {
          console.log('✅ Highlighted courses appear first in sorting');
        } else {
          console.log('⚠️  Highlighted courses may not be sorted first');
        }
      }
    }

    // Step 6: Clean up - unhighlight the course
    console.log('\n6. Cleaning up - unhighlighting test course...');
    const unhighlightResponse = await fetch(`${BASE_URL}/api/admin/courses/${testCourse.id}/toggle-highlight`, {
      method: 'PATCH'
    });
    const unhighlightResult = await unhighlightResponse.json();
    console.log(`   ${unhighlightResult.data.message}`);

    // Step 7: Final verification
    console.log('\n7. Final verification...');
    highlightedResponse = await fetch(`${BASE_URL}/api/courses/highlighted`);
    highlightedCourses = await highlightedResponse.json();
    const finalCount = highlightedCourses.length;
    console.log(`   Final highlighted courses: ${finalCount}`);

    if (finalCount === initialCount) {
      console.log('✅ Course successfully removed from highlighted list');
    } else {
      console.log('⚠️  Highlighted count mismatch');
    }

    console.log('\n🎉 Complete flow test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testCompleteFlow();
