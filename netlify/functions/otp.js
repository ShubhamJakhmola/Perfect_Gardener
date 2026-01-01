import { queryDb, createResponse } from './utils/db.js';

// In-memory OTP storage (for development)
// In production, consider using Redis or database table
const otpStore = new Map();

// Clean up expired OTPs every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { action, email, otp, username, password } = body;

    // Generate OTP
    if (action === 'generate') {
      if (!email) {
        return createResponse(400, { error: 'Email is required' });
      }

      const generatedOTP = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store OTP with email as key
      otpStore.set(email.toLowerCase(), {
        otp: generatedOTP,
        expiresAt,
        username: username || null,
        password: password || null, // Only for new user creation
        type: body.type || 'reset' // 'reset' or 'create'
      });

      return createResponse(200, {
        success: true,
        otp: generatedOTP, // Return OTP for testing (remove in production)
        message: 'OTP generated successfully'
      });
    }

    // Verify OTP
    if (action === 'verify') {
      if (!email || !otp) {
        return createResponse(400, { error: 'Email and OTP are required' });
      }

      const stored = otpStore.get(email.toLowerCase());

      if (!stored) {
        return createResponse(400, { error: 'OTP not found or expired' });
      }

      if (stored.expiresAt < Date.now()) {
        otpStore.delete(email.toLowerCase());
        return createResponse(400, { error: 'OTP has expired' });
      }

      if (stored.otp !== otp) {
        return createResponse(400, { error: 'Invalid OTP' });
      }

      // OTP is valid
      const result = {
        success: true,
        type: stored.type,
        username: stored.username,
        password: stored.password
      };

      // Delete OTP after successful verification
      otpStore.delete(email.toLowerCase());

      return createResponse(200, result);
    }

    return createResponse(400, { error: 'Invalid action' });
  } catch (error) {
    console.error('OTP API error:', error);
    return createResponse(500, { error: 'Internal server error', message: error.message });
  }
};

