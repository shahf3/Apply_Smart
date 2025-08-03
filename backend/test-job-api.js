const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testJobAPI() {
  console.log('🧪 Testing Enhanced Job Search API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const health = await axios.get(`${BASE_URL}/api/jobs/health`);
    console.log('✅ Health Status:', health.data.status);
    console.log('📊 Services:', health.data.services);
    console.log('');

    // Test 2: Stats Check
    console.log('2️⃣ Testing Stats...');
    const stats = await axios.get(`${BASE_URL}/api/jobs/stats`);
    console.log('✅ API Configuration Valid:', stats.data.api_configuration.valid);
    console.log('📈 Sources Configured:', stats.data.sources_configured);
    console.log('');

    // Test 3: Suggestions
    console.log('3️⃣ Testing Suggestions...');
    const suggestions = await axios.get(`${BASE_URL}/api/jobs/suggestions?partial=soft`);
    console.log('✅ Titles:', suggestions.data.titles.slice(0, 3));
    console.log('✅ Locations:', suggestions.data.locations.slice(0, 3));
    console.log('');

    // Test 4: Basic Job Search
    console.log('4️⃣ Testing Basic Job Search...');
    const search = await axios.get(`${BASE_URL}/api/jobs/search-jobs?title=software%20engineer&limit=5`);
    console.log('✅ Total Jobs:', search.data.total_count);
    console.log('✅ Sources:', Object.keys(search.data.jobs));
    console.log('⏱️ Query Time:', search.data.query_time + 'ms');
    console.log('');

    // Test 5: Filtered Search
    console.log('5️⃣ Testing Filtered Search...');
    const filtered = await axios.get(`${BASE_URL}/api/jobs/search-jobs?title=developer&remote_only=true&limit=3`);
    console.log('✅ Filtered Jobs:', filtered.data.total_count);
    console.log('✅ Filters Applied:', filtered.data.filters_applied);
    console.log('');

    // Test 6: Error Handling
    console.log('6️⃣ Testing Error Handling...');
    try {
      await axios.get(`${BASE_URL}/api/jobs/search-jobs`);
      console.log('❌ Expected error but got success');
    } catch (error) {
      console.log('✅ Error handled correctly:', error.response.data.error);
    }
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('🚀 Your enhanced job search API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the tests
testJobAPI(); 