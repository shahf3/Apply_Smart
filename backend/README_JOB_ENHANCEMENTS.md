# Enhanced Multi-Source Job Search API

## Overview

This enhanced job search system provides a comprehensive, production-ready solution for aggregating and filtering job listings from multiple third-party APIs. The system includes advanced features like location normalization, relevance scoring, dynamic filtering, and source-aware ranking.

## 🚀 Key Features

### ✅ Standardized Location & Country Codes
- **OpenCage API Integration**: Normalizes job locations and extracts ISO country codes
- **Consistent Formatting**: All locations are standardized to a consistent format
- **Country Code Extraction**: Each job includes a `country_code` field for filtering

### ✅ Improved Relevance Matching with Weighted Scoring
- **Cosine Similarity**: Calculates semantic similarity between query and job content
- **Weighted Scoring**: Combines title relevance (50%), description relevance (30%), and location match (20%)
- **Keyword Overlap**: Identifies matched keywords for frontend highlighting

### ✅ Dynamic Country Code Injection
- **API-Specific Parameters**: Injects country codes into API queries where supported
- **Targeted Results**: Improves result relevance by filtering at the API level
- **Fallback Handling**: Gracefully handles APIs that don't support country filtering

### ✅ Highlighted Matched Keywords
- **Tokenized Analysis**: Extracts relevant keywords from job titles and descriptions
- **Frontend Integration**: Returns `matched_keywords` array for UI highlighting
- **Smart Filtering**: Limits to top 5 most relevant keywords per job

### ✅ Centralized Job Normalization
- **Standard Format**: All jobs normalized to consistent structure
- **Multi-Source Support**: Handles different API response formats
- **Error Handling**: Graceful fallbacks for missing or malformed data

### ✅ Accurate & Dynamic Filtering Logic
- **Remote Job Detection**: Identifies remote jobs using keyword analysis
- **Salary Range Filtering**: Supports min/max salary filtering
- **Employment Type Filtering**: Normalizes and filters by job type
- **Experience Level Filtering**: Uses keyword matching for experience levels

### ✅ Smart Pagination Handling
- **Source-Aware Pagination**: Tracks pagination per API source
- **Duplicate Prevention**: Removes duplicate jobs across sources
- **Consistent Interface**: Unified pagination regardless of source capabilities

### ✅ Source-Aware Ranking Boosting
- **Configurable Boosts**: Different weights for different job sources
- **Quality Prioritization**: Prioritizes results from trusted sources
- **Flexible Configuration**: Easy to adjust source rankings

### ✅ Filter Suggestions
- **Popular Terms**: Suggests common job titles and locations
- **Dynamic Filtering**: Filters suggestions based on partial input
- **Fallback Support**: Provides suggestions even when API fails

### ✅ Logging and Monitoring Hooks
- **Performance Tracking**: Monitors query times and API response times
- **Error Logging**: Tracks API failures and slow responses
- **Metrics Collection**: Provides insights for optimization

## 📁 File Structure

```
backend/utils/
├── jobNormalizer.js    # Location normalization and job data standardization
├── jobFilter.js        # Filtering logic and relevance scoring
└── jobAggregator.js    # Multi-source job aggregation and API management

backend/routes/
└── jobRoutes.js        # Enhanced API endpoints with new features
```

## 🔧 API Endpoints

### GET `/api/jobs/search-jobs`
Enhanced job search with all new features.

**Query Parameters:**
- `title` (required): Job title to search for
- `location` (optional): Location for filtering
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 12)
- `remote_only` (optional): Filter for remote jobs only
- `min_salary` (optional): Minimum salary filter
- `max_salary` (optional): Maximum salary filter
- `employment_type` (optional): Job type filter
- `experience_level` (optional): Experience level filter

**Response Format:**
```json
{
  "jobs": {
    "Adzuna": [...],
    "Jooble": [...],
    "TheirStack": [...]
  },
  "total_count": 45,
  "page": 1,
  "limit": 12,
  "has_more": true,
  "query_time": 1250,
  "sources": {
    "Adzuna": { "count": 15, "success": true },
    "Jooble": { "count": 20, "success": true },
    "TheirStack": { "count": 10, "success": false, "error": "..." }
  },
  "errors": [],
  "filters_applied": 2
}
```

### GET `/api/jobs/suggestions`
Get job title and location suggestions.

**Query Parameters:**
- `partial` (optional): Partial input for filtering suggestions

**Response Format:**
```json
{
  "titles": ["Software Engineer", "Data Scientist", ...],
  "locations": ["United States", "Remote", "London", ...]
}
```

### GET `/api/jobs/stats`
Get job search service statistics.

**Response Format:**
```json
{
  "api_configuration": {
    "valid": true,
    "errors": []
  },
  "sources_configured": 3,
  "source_boosts": {
    "Adzuna": 1.1,
    "Jooble": 1.0,
    "TheirStack": 1.05
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET `/api/jobs/health`
Health check endpoint.

**Response Format:**
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

## 🛠️ Job Data Structure

All jobs are normalized to this standard format:

```json
{
  "title": "Software Engineer",
  "company": "Tech Corp",
  "location": "San Francisco, CA, United States",
  "apply_link": "https://example.com/apply",
  "salary": 120000,
  "employment_type": "full-time",
  "description": "Job description...",
  "country_code": "US",
  "source": "Adzuna",
  "original_id": "12345",
  "created_at": "2024-01-15T10:30:00.000Z",
  "matched_keywords": ["software", "engineer", "development"],
  "relevance_score": 0.85
}
```

## 🔍 Filtering Options

### Remote Job Detection
Automatically identifies remote jobs using keywords:
- `remote`, `work from home`, `wfh`, `virtual`, `telecommute`
- `distributed`, `anywhere`, `worldwide`, `global`

### Employment Types
- `full-time`, `part-time`, `contract`, `freelance`, `internship`

### Experience Levels
- `entry`, `junior`, `mid`, `senior`, `lead`, `principal`
- `intern`, `trainee`, `apprentice`, `associate`, `graduate`, `fresher`

## 🚀 Performance Features

### Caching
- Location normalization results are cached
- Reduces API calls to OpenCage
- Improves response times for repeated locations

### Parallel Processing
- Multiple API sources queried simultaneously
- Reduces total query time
- Graceful handling of API failures

### Smart Pagination
- Tracks pagination per source
- Prevents duplicate results
- Maintains consistent interface

## 🔧 Configuration

### Environment Variables
```env
# API Keys
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
JOOBLE_KEY=your_jooble_key
THEIRSTACK_KEY=your_theirstack_key
OPENCAGE_API_KEY=your_opencage_api_key

# Optional: RapidAPI for additional sources
RAPIDAPI_KEY=your_rapidapi_key
```

### Source Ranking Boosts
Configure source priorities in `jobAggregator.js`:
```javascript
this.sourceBoosts = {
  'Adzuna': 1.1,      // 10% boost
  'Jooble': 1.0,      // No boost
  'TheirStack': 1.05, // 5% boost
  'Remotive': 1.15    // 15% boost
};
```

## 📊 Monitoring & Logging

### Performance Metrics
- Query execution time
- API response times per source
- Success/failure rates
- Filter application statistics

### Error Tracking
- API failures with detailed error messages
- Configuration validation errors
- Slow query detection (>5 seconds)

### Health Monitoring
- API key validation
- Service availability checks
- Configuration status reporting

## 🔄 Frontend Integration

### Enhanced Job Cards
The frontend can now display:
- **Matched Keywords**: Highlighted relevant terms
- **Relevance Score**: Confidence level for the match
- **Source Information**: Job board attribution
- **Country Code**: For location-based filtering

### Filter Integration
- **Dynamic Filters**: Real-time filter application
- **Filter Count**: Number of active filters
- **Filter Validation**: Client-side validation
- **Clear Filters**: One-click filter reset

### Performance Indicators
- **Query Time**: Display search performance
- **Source Status**: Show which APIs are working
- **Error Handling**: Graceful error display
- **Loading States**: Enhanced loading indicators

## 🎯 Future Enhancements

### Planned Features
1. **Machine Learning Integration**: Improve relevance scoring
2. **User Preference Learning**: Personalized job recommendations
3. **Advanced Analytics**: Detailed search analytics
4. **Webhook Support**: Real-time job notifications
5. **Rate Limiting**: API rate limit management
6. **Caching Layer**: Redis-based result caching

### Scalability Considerations
- **Horizontal Scaling**: Load balancer support
- **Database Integration**: Job storage and indexing
- **Microservice Architecture**: Service decomposition
- **API Gateway**: Centralized API management

## 🐛 Troubleshooting

### Common Issues

1. **API Key Errors**
   - Check environment variables
   - Validate API key permissions
   - Verify API quotas

2. **Slow Response Times**
   - Check network connectivity
   - Monitor API rate limits
   - Review parallel processing

3. **Missing Results**
   - Verify API configurations
   - Check filter parameters
   - Review error logs

### Debug Endpoints
- `/api/jobs/health`: Service health check
- `/api/jobs/stats`: Configuration validation
- Console logs: Detailed error information

## 📝 Changelog

### v2.0.0 - Enhanced Job Search
- ✅ Added location normalization with OpenCage API
- ✅ Implemented weighted relevance scoring
- ✅ Added dynamic country code injection
- ✅ Enhanced filtering with multiple criteria
- ✅ Added source-aware ranking boosts
- ✅ Implemented matched keyword highlighting
- ✅ Added comprehensive logging and monitoring
- ✅ Created modular utility architecture
- ✅ Enhanced error handling and validation
- ✅ Added performance metrics and health checks 