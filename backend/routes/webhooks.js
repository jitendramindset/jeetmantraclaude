const express = require('express');
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Unified webhook endpoint
router.post('/', async (req, res) => {
  try {
    const { action, data, source } = req.body;

    console.log(`📨 Webhook received: ${action} from ${source}`);

    let response = {};

    switch (action) {
      case 'user-signup':
        response = await handleUserSignup(data);
        break;

      case 'user-login':
        response = await handleUserLogin(data);
        break;

      case 'course-create':
        response = await handleCourseCreate(data);
        break;

      case 'course-enroll':
        response = await handleCourseEnroll(data);
        break;

      case 'payment-complete':
        response = await handlePaymentComplete(data);
        break;

      case 'attendance-record':
        response = await handleAttendanceRecord(data);
        break;

      case 'feedback-submit':
        response = await handleFeedbackSubmit(data);
        break;

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    res.json({
      message: `Action '${action}' completed successfully`,
      action,
      response
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed', details: error.message });
  }
});

// Handler functions
async function handleUserSignup(data) {
  const { email, fullName, role, phone } = data;
  const userId = uuidv4();

  const placeholderHash = crypto.createHash('sha256').update(`${email}-${Date.now()}`).digest('hex');
  const { data: user, error } = await supabaseAdmin
    .from('jeetmantra_users')
    .insert({
      id: userId,
      email,
      full_name: fullName,
      user_type: role,
      phone,
      email_verified: true,
      password_hash: placeholderHash,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return { userId, email };
}

async function handleUserLogin(data) {
  const { email } = data;
  const { data: user } = await supabaseAdmin
    .from('jeetmantra_users')
    .select('*')
    .eq('email', email)
    .single();

  if (!user) throw new Error('User not found');
  return { userId: user.id, role: user.user_type || user.role };
}

async function handleCourseCreate(data) {
  const { teacherId, title, description, category, price, startDate, endDate } = data;
  const courseId = uuidv4();

  const { data: course, error } = await supabaseAdmin
    .from('courses')
    .insert({
      id: courseId,
      teacher_id: teacherId,
      title,
      description,
      category,
      price,
      start_date: startDate,
      end_date: endDate,
      is_active: true,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return { courseId, title };
}

async function handleCourseEnroll(data) {
  const { studentId, courseId } = data;
  const enrollmentId = uuidv4();

  const { data: enrollment, error } = await supabaseAdmin
    .from('enrollments')
    .insert({
      id: enrollmentId,
      course_id: courseId,
      student_id: studentId,
      enrollment_date: new Date().toISOString(),
      status: 'active'
    })
    .select()
    .single();

  if (error) throw error;
  return { enrollmentId, courseId, studentId };
}

async function handlePaymentComplete(data) {
  const { paymentId, status, transactionId } = data;

  const { data: payment, error } = await supabaseAdmin
    .from('payments')
    .update({
      status,
      transaction_id: transactionId,
      updated_at: new Date().toISOString()
    })
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw error;
  return { paymentId, status };
}

async function handleAttendanceRecord(data) {
  const { enrollmentId, status, classDate } = data;
  const attendanceId = uuidv4();

  const { data: enrollment } = await supabaseAdmin
    .from('enrollments')
    .select('*')
    .eq('id', enrollmentId)
    .single();

  if (!enrollment) throw new Error('Enrollment not found');

  const { data: attendance, error } = await supabaseAdmin
    .from('attendance')
    .insert({
      id: attendanceId,
      enrollment_id: enrollmentId,
      student_id: enrollment.student_id,
      course_id: enrollment.course_id,
      status,
      date: classDate,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return { attendanceId, status };
}

async function handleFeedbackSubmit(data) {
  const { userId, courseId, rating, comment } = data;
  const feedbackId = uuidv4();

  const { data: feedback, error } = await supabaseAdmin
    .from('feedback')
    .insert({
      id: feedbackId,
      from_user_id: userId,
      course_id: courseId,
      rating,
      comment,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return { feedbackId, rating };
}

module.exports = router;
