# Document Upload API Guide

## 🎯 Document Summarizer Endpoint

**URL:** `POST /api/documents/summarize`
**Content-Type:** `multipart/form-data`
**Authentication:** Required (JWT token)

## 📋 Requirements

### File Upload Field
- **Field name:** `file` (exactly this name)
- **Max size:** 10MB
- **Allowed types:** PDF, DOC, DOCX, TXT, JPEG, JPG, PNG, GIF, MP3, WAV, MP4

### Supported File Types
- ✅ **Text files:** `.txt`
- ⚠️ **PDF files:** `.pdf` (basic support - extraction not fully implemented)
- ⚠️ **Word documents:** `.doc`, `.docx` (extraction not fully implemented)
- ✅ **Images:** `.jpg`, `.jpeg`, `.png`, `.gif`
- ✅ **Audio:** `.mp3`, `.wav`
- ✅ **Video:** `.mp4`

## 🔧 Frontend Implementation

### JavaScript/Fetch Example
```javascript
const uploadAndSummarize = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file); // Field name MUST be 'file'

  const response = await fetch('https://ai-assistant-backend-oqpp.onrender.com/api/documents/summarize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type - let browser set it with boundary
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return await response.json();
};
```

### React Example
```jsx
const DocumentUploader = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    
    // Validate file size
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file); // Critical: field name must be 'file'
      
      const response = await fetch('/api/documents/summarize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      const result = await response.json();
      console.log('Summary:', result.summary);
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
      />
      <button onClick={handleUpload} disabled={!file || loading}>
        {loading ? 'Processing...' : 'Upload & Summarize'}
      </button>
    </div>
  );
};
```

### Axios Example
```javascript
const uploadDocument = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post('/api/documents/summarize', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
    throw error;
  }
};
```

## 📤 Response Format

### Success Response (201)
```json
{
  "summary": {
    "id": "uuid",
    "user_id": "uuid",
    "filename": "document.pdf",
    "original_url": "https://...",
    "summary": "AI-generated summary text...",
    "key_points": ["Point 1", "Point 2", "Point 3"],
    "word_count": 1500,
    "file_type": "application/pdf",
    "processing_status": "completed",
    "created_at": "2025-12-24T...",
    "updated_at": "2025-12-24T..."
  },
  "message": "Document summarized successfully"
}
```

### Error Responses
```json
// 400 - No file uploaded
{
  "error": "No file uploaded"
}

// 400 - Invalid file type
{
  "error": "Invalid file type. Only images, documents, and audio files are allowed."
}

// 400 - File too large
{
  "error": "File too large"
}

// 401 - Authentication required
{
  "success": false,
  "error": {
    "message": "Invalid token",
    "code": "INVALID_TOKEN",
    "statusCode": 401
  }
}

// 503 - AI service unavailable
{
  "error": "AI service not available"
}
```

## 🚨 Common Issues & Solutions

### 1. 400 Bad Request - "No file uploaded"
**Cause:** Field name is not 'file' or no file in request
**Solution:** 
```javascript
// ❌ Wrong
formData.append('document', file);
formData.append('upload', file);

// ✅ Correct
formData.append('file', file);
```

### 2. 400 Bad Request - "Invalid file type"
**Cause:** File extension or MIME type not allowed
**Solution:** Check file type before upload
```javascript
const allowedTypes = ['application/pdf', 'text/plain', 'application/msword'];
if (!allowedTypes.includes(file.type)) {
  throw new Error('File type not supported');
}
```

### 3. 413 Payload Too Large
**Cause:** File exceeds 10MB limit
**Solution:** Compress or split large files

### 4. Headers Issue
**Cause:** Manually setting Content-Type for multipart/form-data
**Solution:** Let browser set Content-Type automatically
```javascript
// ❌ Wrong - don't set Content-Type manually
headers: {
  'Content-Type': 'multipart/form-data',
  'Authorization': `Bearer ${token}`
}

// ✅ Correct - let browser set it
headers: {
  'Authorization': `Bearer ${token}`
}
```

## 🧪 Test Your Upload

Use this test function to verify your upload works:

```javascript
const testDocumentUpload = async () => {
  // Create a test text file
  const testContent = "This is a test document for summarization.";
  const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
  
  const formData = new FormData();
  formData.append('file', testFile);
  
  try {
    const response = await fetch('/api/documents/summarize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${yourToken}`
      },
      body: formData
    });
    
    const result = await response.json();
    console.log('Test result:', result);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};
```

## 🎯 Quick Fix Checklist

- [ ] Field name is exactly `'file'`
- [ ] File size under 10MB
- [ ] File type is supported
- [ ] JWT token included in Authorization header
- [ ] Content-Type header NOT manually set
- [ ] Using FormData for multipart upload
- [ ] Error handling implemented

The backend is ready - make sure your frontend follows this exact format! 🚀