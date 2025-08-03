# Testing Guide for Enhanced Job Search API

## 🚀 Quick Start Testing

### 1. **Install Dependencies**
```bash
cd backend
npm install natural fuzzball
```

### 2. **Verify Environment Variables**
Make sure these are in your `.env` file:
```env
# Required API Keys
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
JOOBLE_KEY=your_jooble_key
THEIRSTACK_KEY=your_theirstack_key
OPENCAGE_API_KEY=your_opencage_api_key

# Optional
RAPIDAPI_KEY=your_rapidapi_key
```

### 3. **Start the Backend**
```bash
cd backend
node index.js
```

## 🧪 API Testing

### **Test 1: Basic Job Search**
```bash
curl "http://localhost:5000/api/jobs/search-jobs?title=software%20engineer&location=San%20Francisco"
```

**Expected Response:**
```json
{
  "jobs": {
    "Adzuna": [...],
    "Jooble": [...],
    "TheirStack": [...],
    "Remotive": [...],
    "Internships": [...],
    "Y Combinator": [...],
    "Rise": [...]
  },
  "total_count": 45,
  "page": 1,
  "limit": 12,
  "has_more": true,
  "query_time": 1250,
  "sources": {
    "Adzuna": {"count": 10, "success": true},
    "Jooble": {"count": 8, "success": true},
    "TheirStack": {"count": 7, "success": true},
    "Remotive": {"count": 5, "success": true},
    "Internships": {"count": 3, "success": true},
    "Y Combinator": {"count": 6, "success": true},
    "Rise": {"count": 6, "success": true}
  },
  "errors": [],
  "filters_applied": 0
}
```

### **Test 2: Filtered Search**
```bash
curl "http://localhost:5000/api/jobs/search-jobs?title=data%20scientist&remote_only=true&min_salary=80000&employment_type=full-time"
```

### **Test 3: Get Suggestions**
```bash
curl "http://localhost:5000/api/jobs/suggestions?partial=soft"
```

**Expected Response:**
```json
{
  "titles": ["Software Engineer", "Software Developer", "Software Architect"],
  "locations": ["San Francisco", "Software Valley"]
}
```

### **Test 4: Health Check**
```bash
curl "http://localhost:5000/api/jobs/health"
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "configuration_errors": 0,
  "services": {
    "normalizer": "ok",
    "filter": "ok",
    "aggregator": "ok"
  }
}
```

### **Test 5: Statistics**
```bash
curl "http://localhost:5000/api/jobs/stats"
```

## 🎯 Frontend Testing

### **1. Test Job Search Component**
1. Navigate to your frontend: `http://localhost:3000`
2. Go to Dashboard → Job Search
3. Enter a job title (e.g., "Software Engineer")
4. Add a location (e.g., "San Francisco")
5. Apply filters and test search

### **2. Test Filtering Features**
- ✅ **Remote Only**: Toggle remote job filter
- ✅ **Salary Range**: Set min/max salary
- ✅ **Employment Type**: Select full-time, part-time, etc.
- ✅ **Experience Level**: Choose entry, senior, etc.

### **3. Test Suggestions**
- Type in job title field and check for suggestions
- Type in location field and check for suggestions

## 🔍 Manual Testing Scenarios

### **Scenario 1: Basic Search**
```javascript
// Test basic job search
const response = await fetch('http://localhost:5000/api/jobs/search-jobs?title=developer&location=London');
const data = await response.json();
console.log('Jobs found:', data.total_count);
console.log('Sources:', Object.keys(data.jobs));
```

### **Scenario 2: Filtered Search**
```javascript
// Test with filters
const response = await fetch('http://localhost:5000/api/jobs/search-jobs?title=engineer&remote_only=true&min_salary=50000');
const data = await response.json();
console.log('Filtered jobs:', data.total_count);
```

### **Scenario 3: Error Handling**
```javascript
// Test missing title (should return error)
const response = await fetch('http://localhost:5000/api/jobs/search-jobs');
const data = await response.json();
console.log('Error:', data.error);
```

## 🛠️ Unit Testing

### **Test Job Normalizer**
```javascript
const JobNormalizer = require('./utils/jobNormalizer');
const normalizer = new JobNormalizer();

// Test location normalization
const location = await normalizer.normalizeLocation('San Francisco, CA');
console.log('Normalized:', location);

// Test job normalization
const rawJob = {
  title: 'Software Engineer',
  company: 'Tech Corp',
  location: 'San Francisco'
};
const normalized = await normalizer.normalizeJob('TestSource', rawJob);
console.log('Normalized job:', normalized);
```

### **Test Job Filter**
```javascript
const JobFilter = require('./utils/jobFilter');
const filter = new JobFilter();

const jobs = [
  { title: 'Software Engineer', location: 'San Francisco', salary: 100000 },
  { title: 'Data Scientist', location: 'Remote', salary: 80000 }
];

const filters = { remote_only: true, min_salary: 75000 };
const filtered = filter.filterJobs(jobs, filters);
console.log('Filtered jobs:', filtered.length);
```

## 📊 Performance Testing

### **Test Query Performance**
```javascript
const startTime = Date.now();
const response = await fetch('http://localhost:5000/api/jobs/search-jobs?title=engineer');
const data = await response.json();
const queryTime = Date.now() - startTime;

console.log(`Query time: ${queryTime}ms`);
console.log(`API reported time: ${data.query_time}ms`);
```

### **Test Multiple Concurrent Requests**
```javascript
const requests = Array(5).fill().map(() => 
  fetch('http://localhost:5000/api/jobs/search-jobs?title=developer')
);

const responses = await Promise.all(requests);
const data = await Promise.all(responses.map(r => r.json()));

console.log('All requests completed');
data.forEach((d, i) => console.log(`Request ${i}: ${d.total_count} jobs`));
```

## 🐛 Debugging

### **Check API Configuration**
```bash
curl "http://localhost:5000/api/jobs/stats"
```
Look for configuration errors in the response.

### **Check Health Status**
```bash
curl "http://localhost:5000/api/jobs/health"
```
Verify all services are running properly.

### **Monitor Console Logs**
Watch your backend console for:
- API call logs
- Performance metrics
- Error messages
- Cache hits/misses

## 🎯 Expected Behaviors

### **✅ Success Cases**
1. **Job Search**: Returns grouped jobs from multiple sources
2. **Filtering**: Correctly filters by remote, salary, type, experience
3. **Pagination**: Returns `has_more` flag and handles pagination
4. **Suggestions**: Returns relevant job titles and locations
5. **Performance**: Query times under 5 seconds
6. **Error Handling**: Graceful handling of API failures

### **❌ Error Cases**
1. **Missing Title**: Returns 400 error with clear message
2. **Invalid Filters**: Returns 400 error with validation details
3. **API Failures**: Continues with available sources
4. **Network Issues**: Proper timeout and retry handling

## 🔧 Troubleshooting

### **Common Issues**

1. **"API keys not configured"**
   - Check your `.env` file
   - Verify all required API keys are set

2. **"No jobs returned"**
   - Check API quotas
   - Verify API keys are valid
   - Test with different job titles

3. **"Slow response times"**
   - Check network connectivity
   - Monitor API rate limits
   - Review parallel processing

4. **"Filter not working"**
   - Check filter parameter names
   - Verify filter values are correct
   - Test with simpler filters first

### **Debug Commands**
```bash
# Check if backend is running
curl http://localhost:5000/api/jobs/health

# Test with minimal parameters
curl "http://localhost:5000/api/jobs/search-jobs?title=test"

# Check API configuration
curl http://localhost:5000/api/jobs/stats
```

## 📈 Performance Benchmarks

### **Expected Performance**
- **Query Time**: < 3 seconds for most searches
- **Success Rate**: > 90% of API calls successful
- **Filter Accuracy**: > 95% of filtered results match criteria
- **Cache Hit Rate**: > 80% for location normalization

### **Load Testing**
```javascript
// Test with multiple concurrent users
const users = 10;
const requestsPerUser = 5;

for (let user = 0; user < users; user++) {
  for (let req = 0; req < requestsPerUser; req++) {
    fetch('http://localhost:5000/api/jobs/search-jobs?title=engineer')
      .then(response => response.json())
      .then(data => console.log(`User ${user}, Request ${req}: ${data.total_count} jobs`));
  }
}
```

## 🎉 Success Criteria

Your enhanced job search API is working correctly when:

1. ✅ **Basic Search**: Returns jobs from multiple sources
2. ✅ **Filtering**: All filters work correctly
3. ✅ **Performance**: Query times are reasonable
4. ✅ **Error Handling**: Graceful failure handling
5. ✅ **Frontend Integration**: Works with your React app
6. ✅ **Monitoring**: Health and stats endpoints work
7. ✅ **Suggestions**: Auto-complete works properly

## 🚀 Next Steps

After successful testing:

1. **Deploy to Production**: Update your production environment
2. **Monitor Performance**: Set up monitoring for the new endpoints
3. **Gather Feedback**: Test with real users
4. **Optimize**: Based on usage patterns and performance data
5. **Scale**: Add more job sources as needed

Happy testing! 🎯 