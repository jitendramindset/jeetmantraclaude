# Complete Feature Implementation Guide
**Project**: JeetMantra LMS  
**Status**: In Progress  
**Last Updated**: May 21, 2026

---

## Table of Contents
1. [Live Classes with Document Sharing](#live-classes-with-document-sharing)
2. [Tests & Quizzes](#tests--quizzes)
3. [Homework Submission](#homework-submission)
4. [Course Creation (Teacher)](#course-creation-teacher)
5. [Class Scheduling (Teacher)](#class-scheduling-teacher)
6. [Partner Services](#partner-services)
7. [Backend Endpoints Reference](#backend-endpoints-reference)

---

## Live Classes with Document Sharing

### Frontend Implementation

#### 1. Live Class Join Component
```javascript
async function handleJoinClass(classId) {
  try {
    // Call backend to register join
    const response = await fetch('http://localhost:5000/api/live-classes/' + classId + '/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      },
      body: JSON.stringify({
        joinedAt: new Date().toISOString(),
        userId: JSON.parse(localStorage.getItem('user')).id
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      // Open video call in new tab/modal
      window.open(data.roomUrl, '_blank');
      
      // Store class session ID
      sessionStorage.setItem('activeClassId', classId);
    } else {
      alert('Failed to join class: ' + data.error);
    }
  } catch (error) {
    console.error('Error joining class:', error);
  }
}
```

#### 2. Document Sharing in Live Class
```javascript
async function shareDocumentInClass(file, classId) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('classId', classId);
    formData.append('uploadedBy', JSON.parse(localStorage.getItem('user')).id);

    const response = await fetch('http://localhost:5000/api/live-classes/share-document', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      },
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Document shared:', data.document.filename);
      
      // Notify other participants
      broadcastDocumentShare(data.document);
    }
  } catch (error) {
    console.error('Failed to share document:', error);
  }
}

function broadcastDocumentShare(document) {
  // Send via WebSocket or polling if supported
  console.log('📄 Document available to class:', document.filename);
  
  // Update document list UI
  const docList = document.getElementById('class-documents');
  if (docList) {
    const item = document.createElement('div');
    item.innerHTML = `
      <a href="${document.downloadUrl}" target="_blank">
        📄 ${document.filename}
      </a>
    `;
    docList.appendChild(item);
  }
}
```

### Backend Implementation

#### 1. Live Class Join Endpoint
```javascript
// backend/routes/liveClasses.js
app.post('/api/live-classes/:classId/join', auth, async (req, res) => {
  try {
    const { classId } = req.params;
    const { joinedAt } = req.body;
    const userId = req.user.id;

    // Record join event
    await supabase
      .from('live_class_attendance')
      .insert({
        class_id: classId,
        user_id: userId,
        joined_at: joinedAt
      });

    // Get video room URL (Agora, Jitsi, etc.)
    const roomUrl = generateVideoRoomUrl(classId);

    // Get class documents
    const { data: docs } = await supabase
      .from('class_documents')
      .select('*')
      .eq('class_id', classId);

    res.json({
      success: true,
      roomUrl,
      documents: docs || [],
      participantCount: await getParticipantCount(classId)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 2. Document Share Endpoint
```javascript
// backend/routes/liveClasses.js
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/live-classes/share-document', auth, upload.single('file'), async (req, res) => {
  try {
    const { classId } = req.body;
    const userId = req.user.id;
    const file = req.file;

    // Save file metadata to database
    const { data: document, error } = await supabase
      .from('class_documents')
      .insert({
        class_id: classId,
        filename: file.originalname,
        file_path: file.path,
        file_size: file.size,
        uploaded_by: userId,
        uploaded_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      document: {
        ...document,
        downloadUrl: `http://localhost:5000/api/documents/${document.id}/download`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Document download endpoint
app.get('/api/documents/:docId/download', auth, async (req, res) => {
  try {
    const { docId } = req.params;
    
    const { data: doc } = await supabase
      .from('class_documents')
      .select('*')
      .eq('id', docId)
      .single();

    if (!doc) return res.status(404).json({ error: 'Document not found' });

    res.download(doc.file_path, doc.filename);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Tests & Quizzes

### Frontend Implementation

#### 1. Quiz Taking Component
```javascript
function QuizScreen({ quizId, setScreen }) {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
      });
      const data = await response.json();
      setQuiz(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load quiz:', error);
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId, optionId) => {
    setAnswers(ans => ({
      ...ans,
      [questionId]: optionId
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        },
        body: JSON.stringify({
          answers,
          submittedAt: new Date().toISOString()
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setScore(result.score);
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  if (loading) return <div>Loading quiz...</div>;

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, fontWeight: 800, color: '#22c55e', marginBottom: 20 }}>
          {score}%
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
          Quiz Completed!
        </div>
        <div style={{ fontSize: 14, color: '#64748b', marginBottom: 30 }}>
          You scored {Math.round((score/100) * quiz.questions.length)} out of {quiz.questions.length}
        </div>
        <button 
          onClick={() => setScreen('home')}
          style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div>
      <Topbar title={quiz.title} subtitle={`Question ${currentQuestion + 1} of ${quiz.questions.length}`} />
      
      <div style={{ maxWidth: 800, margin: '0 auto', background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ background: '#f1f5f9', borderRadius: 9999, height: 8 }}>
            <div style={{ 
              background: '#f97316', 
              borderRadius: 9999, 
              height: '100%', 
              width: ((currentQuestion + 1) / quiz.questions.length) * 100 + '%',
              transition: 'width 300ms'
            }}></div>
          </div>
        </div>

        {/* Question */}
        <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>
          {question.text}
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelectAnswer(question.id, option.id)}
              style={{
                padding: 16,
                borderRadius: 10,
                border: answers[question.id] === option.id ? '2px solid #f97316' : '1px solid #e5e7eb',
                background: answers[question.id] === option.id ? '#fef7f0' : 'white',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: 'inherit',
                transition: 'all 150ms'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: '2px solid ' + (answers[question.id] === option.id ? '#f97316' : '#ccc'),
                  background: answers[question.id] === option.id ? '#f97316' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {answers[question.id] === option.id && '✓'}
                </div>
                <span style={{ color: '#0f172a', fontWeight: 500 }}>{option.text}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: 'white',
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
              opacity: currentQuestion === 0 ? 0.5 : 1,
              fontFamily: 'inherit'
            }}
          >
            ← Previous
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={!answers[question.id]}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                background: '#22c55e',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontFamily: 'inherit'
              }}
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!answers[question.id]}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                background: '#f97316',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontFamily: 'inherit',
                opacity: answers[question.id] ? 1 : 0.5
              }}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Backend Implementation

#### 1. Quiz Endpoints
```javascript
// backend/routes/quizzes.js

// Get quiz
app.get('/api/quizzes/:quizId', auth, async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    // Get quiz with questions and options
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions (
          *,
          options (*)
        )
      `)
      .eq('id', quizId)
      .single();

    if (error) throw error;

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit quiz
app.post('/api/quizzes/:quizId/submit', auth, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, submittedAt } = req.body;
    const userId = req.user.id;

    // Get correct answers
    const { data: quiz } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions (
          *,
          options (*)
        )
      `)
      .eq('id', quizId)
      .single();

    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach(q => {
      const userAnswer = answers[q.id];
      const correctOption = q.options.find(o => o.is_correct);
      if (userAnswer === correctOption.id) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    // Save submission
    await supabase
      .from('quiz_submissions')
      .insert({
        quiz_id: quizId,
        user_id: userId,
        answers: JSON.stringify(answers),
        score,
        submitted_at: submittedAt
      });

    res.json({
      success: true,
      score,
      correctCount,
      totalQuestions: quiz.questions.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Homework Submission

### Frontend Implementation

```javascript
function HomeworkSubmissionModal({ homework, onClose, onSubmit }) {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('homeworkId', homework.id);
      formData.append('file', file);
      formData.append('notes', notes);
      formData.append('submittedAt', new Date().toISOString());

      const response = await fetch('http://localhost:5000/api/homework/submit', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Homework submitted');
        onSubmit(data);
        onClose();
      } else {
        alert('Failed to submit homework');
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 16, width: '90%', maxWidth: 500, padding: 32 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
          Submit Homework
        </div>
        <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
          {homework.subject} · {homework.task}
        </div>

        {/* File upload */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            Upload File
          </label>
          <div style={{
            borderRadius: 10,
            border: '2px dashed #e5e7eb',
            padding: 20,
            textAlign: 'center',
            cursor: 'pointer',
            background: '#f8fafc'
          }}>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
              {file ? (
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>✓ {file.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{(file.size / 1024).toFixed(2)} KB</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>📎</div>
                  <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>Click to upload</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>or drag and drop</div>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            Add Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              width: '100%',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              padding: 12,
              fontSize: 13,
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: 100
            }}
            placeholder="Add any comments or notes about your submission..."
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: 'white',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 700
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || submitting}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 8,
              border: 'none',
              background: file && !submitting ? '#22c55e' : '#ccc',
              color: 'white',
              cursor: file && !submitting ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              fontWeight: 700
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Homework'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Backend Implementation

```javascript
// backend/routes/homework.js
const multer = require('multer');
const upload = multer({ dest: 'uploads/homework/' });

app.post('/api/homework/submit', auth, upload.single('file'), async (req, res) => {
  try {
    const { homeworkId, notes, submittedAt } = req.body;
    const userId = req.user.id;
    const file = req.file;

    // Save submission
    const { data: submission, error } = await supabase
      .from('homework_submissions')
      .insert({
        homework_id: homeworkId,
        user_id: userId,
        file_path: file.path,
        file_name: file.originalname,
        file_size: file.size,
        notes,
        submitted_at: submittedAt,
        status: 'submitted'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      submission,
      message: 'Homework submitted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get homework submissions for grading
app.get('/api/homework/:homeworkId/submissions', auth, async (req, res) => {
  try {
    const { homeworkId } = req.params;
    const userId = req.user.id;

    // Verify teacher owns this homework
    const { data: homework } = await supabase
      .from('homework')
      .select('teacher_id')
      .eq('id', homeworkId)
      .single();

    if (homework.teacher_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get all submissions
    const { data: submissions } = await supabase
      .from('homework_submissions')
      .select('*')
      .eq('homework_id', homeworkId);

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Grade homework
app.post('/api/homework/:submissionId/grade', auth, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;

    // Update submission
    const { data: submission, error } = await supabase
      .from('homework_submissions')
      .update({
        score,
        feedback,
        graded_at: new Date(),
        status: 'graded'
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      submission
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Course Creation (Teacher)

### Frontend Implementation

```javascript
function TeacherCreateCourse() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    level: 'beginner',
    price: '0',
    thumbnail: null,
    tags: []
  });
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateCourse = async () => {
    try {
      setCreating(true);

      const fData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          fData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'thumbnail' && formData[key]) {
          fData.append(key, formData[key]);
        } else {
          fData.append(key, formData[key]);
        }
      });

      const response = await fetch('http://localhost:5000/api/teacher/courses/create', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        },
        body: fData
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/dashboard.html?role=teacher&courseId=' + data.courseId;
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to create course:', error);
    } finally {
      setCreating(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>✅</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Course Created!</div>
        <div style={{ fontSize: 14, color: '#64748b', marginTop: 10 }}>Redirecting...</div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Create Course" subtitle="Set up your new course" />

      <div style={{ maxWidth: 600, margin: '0 auto', background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        {/* Course Title */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
            Course Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Advanced Mathematics — Calculus"
            style={{
              width: '100%',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              padding: '12px 14px',
              fontSize: 13,
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe what students will learn..."
            style={{
              width: '100%',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              padding: '12px 14px',
              fontSize: 13,
              fontFamily: 'inherit',
              minHeight: 120,
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Category & Level */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                padding: '12px 14px',
                fontSize: 13,
                fontFamily: 'inherit'
              }}
            >
              <option value="">Select category</option>
              <option value="math">Mathematics</option>
              <option value="science">Science</option>
              <option value="english">English</option>
              <option value="coding">Coding</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              Level
            </label>
            <select
              value={formData.level}
              onChange={(e) => handleChange('level', e.target.value)}
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                padding: '12px 14px',
                fontSize: 13,
                fontFamily: 'inherit'
              }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Duration & Price */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              Duration (hours)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              placeholder="e.g., 20"
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                padding: '12px 14px',
                fontSize: 13,
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              Price (₹)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="0 for free"
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                padding: '12px 14px',
                fontSize: 13,
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Thumbnail */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
            Course Thumbnail
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleChange('thumbnail', e.target.files[0])}
            style={{
              width: '100%',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              padding: '12px 14px',
              fontSize: 13,
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreateCourse}
          disabled={!formData.title || !formData.description || creating}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 10,
            border: 'none',
            background: formData.title && formData.description && !creating ? '#f97316' : '#ccc',
            color: 'white',
            fontWeight: 700,
            fontSize: 14,
            cursor: formData.title && formData.description && !creating ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit'
          }}
        >
          {creating ? 'Creating...' : 'Create Course'}
        </button>
      </div>
    </div>
  );
}
```

### Backend Endpoint

```javascript
// backend/routes/teacher.js
app.post('/api/teacher/courses/create', auth, upload.single('thumbnail'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, category, duration, level, price } = req.body;

    // Create course
    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        title,
        description,
        category,
        duration: parseInt(duration),
        level,
        price: parseInt(price),
        teacher_id: userId,
        thumbnail_path: req.file ? req.file.path : null,
        status: 'draft',
        created_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      courseId: course.id,
      message: 'Course created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Class Scheduling (Teacher)

### Frontend Implementation

```javascript
function TeacherScheduleClass({ courseId }) {
  const [schedule, setSchedule] = useState({
    date: '',
    time: '',
    duration: '60',
    title: '',
    description: '',
    meetingUrl: '',
    recordSession: false
  });

  const handleSchedule = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/teacher/classes/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        },
        body: JSON.stringify({
          ...schedule,
          courseId
        })
      });

      if (response.ok) {
        alert('✅ Class scheduled successfully');
        setSchedule({
          date: '', time: '', duration: '60', title: '',
          description: '', meetingUrl: '', recordSession: false
        });
      }
    } catch (error) {
      console.error('Failed to schedule class:', error);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', background: 'white', borderRadius: 16, padding: 32 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>
        Schedule Live Class
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <input
          type="date"
          value={schedule.date}
          onChange={(e) => setSchedule({ ...schedule, date: e.target.value })}
          style={{
            borderRadius: 10,
            border: '1px solid #e5e7eb',
            padding: '12px 14px',
            fontSize: 13,
            fontFamily: 'inherit'
          }}
        />
        <input
          type="time"
          value={schedule.time}
          onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
          style={{
            borderRadius: 10,
            border: '1px solid #e5e7eb',
            padding: '12px 14px',
            fontSize: 13,
            fontFamily: 'inherit'
          }}
        />
      </div>

      <input
        type="text"
        placeholder="Class Title"
        value={schedule.title}
        onChange={(e) => setSchedule({ ...schedule, title: e.target.value })}
        style={{
          width: '100%',
          borderRadius: 10,
          border: '1px solid #e5e7eb',
          padding: '12px 14px',
          fontSize: 13,
          fontFamily: 'inherit',
          marginBottom: 16,
          boxSizing: 'border-box'
        }}
      />

      <textarea
        placeholder="Class Description"
        value={schedule.description}
        onChange={(e) => setSchedule({ ...schedule, description: e.target.value })}
        style={{
          width: '100%',
          borderRadius: 10,
          border: '1px solid #e5e7eb',
          padding: '12px 14px',
          fontSize: 13,
          fontFamily: 'inherit',
          marginBottom: 16,
          minHeight: 100,
          boxSizing: 'border-box'
        }}
      />

      <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={schedule.recordSession}
          onChange={(e) => setSchedule({ ...schedule, recordSession: e.target.checked })}
        />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Record this session</span>
      </label>

      <button
        onClick={handleSchedule}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 10,
          border: 'none',
          background: '#22c55e',
          color: 'white',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          fontFamily: 'inherit'
        }}
      >
        Schedule Class
      </button>
    </div>
  );
}
```

### Backend Endpoint

```javascript
app.post('/api/teacher/classes/schedule', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, date, time, duration, title, description, recordSession } = req.body;

    // Create live class
    const { data: liveClass, error } = await supabase
      .from('live_classes')
      .insert({
        course_id: courseId,
        teacher_id: userId,
        title,
        description,
        scheduled_date: date,
        scheduled_time: time,
        duration: parseInt(duration),
        record_session: recordSession,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) throw error;

    // Send notifications to enrolled students
    await supabase.rpc('notify_enrolled_students', {
      course_id: courseId,
      message: `New class scheduled: ${title}`
    });

    res.json({
      success: true,
      classId: liveClass.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Backend Endpoints Reference

### Complete List of Required Endpoints

#### Authentication
```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/verify
POST   /api/auth/refresh-token
POST   /api/auth/send-otp
POST   /api/auth/verify-otp
POST   /api/auth/google-login
```

#### Dashboard & User
```
GET    /api/dashboard
GET    /api/user/profile
PUT    /api/user/profile
GET    /api/user/skills
GET    /api/wallet
GET    /api/notifications
```

#### Courses
```
GET    /api/courses
GET    /api/courses/:id
GET    /api/courses/recorded
POST   /api/courses
POST   /api/courses/:id/enroll
GET    /api/user/courses
PUT    /api/courses/:id/progress
```

#### Live Classes
```
GET    /api/live-classes
POST   /api/live-classes/:id/join
POST   /api/live-classes/share-document
GET    /api/live-classes/:id/documents
POST   /api/teacher/classes/schedule
GET    /api/teacher/classes
```

#### Homework & Tests
```
GET    /api/dashboard/homework
PUT    /api/dashboard/homework/:id
POST   /api/homework/submit
GET    /api/quizzes/:id
POST   /api/quizzes/:id/submit
GET    /api/tests/:id
POST   /api/tests/:id/submit
```

#### Feedback
```
POST   /api/feedback
GET    /api/feedback/my
```

#### Payments & Wallet
```
GET    /api/payments
POST   /api/payments/webhook/payment
POST   /api/wallet/withdraw
```

#### Admin
```
GET    /api/admin/stats
GET    /api/admin/users
PUT    /api/admin/users/:id/toggle-status
POST   /api/admin/courses
```

#### Partner
```
GET    /api/partners/services
POST   /api/bookings
GET    /api/bookings
PUT    /api/bookings/:id
```

---

## Testing Checklist

- [ ] Live class join works
- [ ] Document sharing in class works
- [ ] Download documents works
- [ ] Quiz submission works
- [ ] Score calculation correct
- [ ] Homework file upload works
- [ ] Teacher can create courses
- [ ] Teacher can schedule classes
- [ ] Students receive notifications
- [ ] Class attendance recorded
- [ ] Full e2e test for each role

---

**Status**: Documentation Complete - Ready for Full Implementation

