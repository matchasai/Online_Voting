import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const FAST2SMS_BASE_URL = "https://www.fast2sms.com/dev/bulkV2";

// Check if API key is configured
if (!FAST2SMS_API_KEY) {
  console.error("FAST2SMS_API_KEY is not configured in environment variables");
}

export const sendOTP = async (mobile, otp) => {
  try {
    const message = `Your OTP for password reset is: ${otp}. This OTP is valid for 10 minutes. Do not share this OTP with anyone. - DeshkaVote`;
    
    const response = await axios.post(FAST2SMS_BASE_URL, {
      authorization: FAST2SMS_API_KEY,
      variables_values: otp,
      route: "otp",
      numbers: mobile,
    }, {
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log("FAST2SMS Response:", response.data);
    
    if (response.data.return && response.data.return === true) {
      return {
        success: true,
        message: "OTP sent successfully"
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to send OTP"
      };
    }
  } catch (error) {
    console.error("FAST2SMS Error:", error.response?.data || error.message);
    return {
      success: false,
      message: "SMS service unavailable"
    };
  }
};

// Alternative method for simple text SMS
export const sendSMS = async (mobile, message) => {
  try {
    const response = await axios.post(FAST2SMS_BASE_URL, {
      authorization: FAST2SMS_API_KEY,
      message: message,
      language: "english",
      route: "q",
      numbers: mobile,
    }, {
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log("FAST2SMS SMS Response:", response.data);
    
    if (response.data.return && response.data.return === true) {
      return {
        success: true,
        message: "SMS sent successfully"
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to send SMS"
      };
    }
  } catch (error) {
    console.error("FAST2SMS SMS Error:", error.response?.data || error.message);
    return {
      success: false,
      message: "SMS service unavailable"
    };
  }
};
