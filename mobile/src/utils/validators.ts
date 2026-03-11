export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateLoginForm = (email: string, password: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!validateEmail(email)) {
    return { isValid: false, error: 'Please enter a valid email' };
  }
  
  if (!password.trim()) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  
  return { isValid: true };
};

export const validateRegisterForm = (
  fullName: string,
  email: string,
  phone: string,
  password: string
): ValidationResult => {
  if (!fullName.trim()) {
    return { isValid: false, error: 'Full name is required' };
  }
  
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!validateEmail(email)) {
    return { isValid: false, error: 'Please enter a valid email' };
  }
  
  if (!phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  if (!validatePhone(phone)) {
    return { isValid: false, error: 'Please enter a valid Indian phone number' };
  }
  
  if (!password.trim()) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  
  return { isValid: true };
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};
