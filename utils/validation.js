// Shared validation utilities for both frontend and backend

export const validationRules = {
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format'
  },
  contact: {
    regex: /^\d{10}$/,
    message: 'Contact must be 10 digits'
  },
  required: {
    message: 'This field is required'
  }
};

export const validateEmail = (email) => {
  return validationRules.email.regex.test(email);
};

export const validateContact = (contact) => {
  return validationRules.contact.regex.test(contact.toString());
};

export const validateRequiredFields = (data, requiredFields) => {
  const missing = requiredFields.filter(field => !data[field] || data[field].toString().trim() === '');
  return {
    isValid: missing.length === 0,
    missing
  };
};

export const validateSchoolData = (data) => {
  const requiredFields = ['name', 'address', 'city', 'state', 'contact', 'email_id'];
  
  // Check required fields
  const requiredValidation = validateRequiredFields(data, requiredFields);
  if (!requiredValidation.isValid) {
    return {
      isValid: false,
      message: 'All fields are required'
    };
  }

  // Validate email
  if (!validateEmail(data.email_id)) {
    return {
      isValid: false,
      message: validationRules.email.message
    };
  }

  // Validate contact
  if (!validateContact(data.contact)) {
    return {
      isValid: false,
      message: validationRules.contact.message
    };
  }

  return { isValid: true };
};
