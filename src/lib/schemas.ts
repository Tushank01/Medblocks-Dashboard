
export interface Patient {
  id?: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
  medical_history?: string;
  created_at?: string;
  updated_at?: string;
}

export const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
];

export const validatePatient = (patient: Partial<Patient>): string[] => {
  const errors: string[] = [];
  
  if (!patient.first_name) errors.push('First name is required');
  if (!patient.last_name) errors.push('Last name is required');
  if (!patient.date_of_birth) errors.push('Date of birth is required');
  if (!patient.gender) errors.push('Gender is required');
  
  if (patient.email && !isValidEmail(patient.email)) {
    errors.push('Email is invalid');
  }
  
  if (patient.phone && !isValidPhone(patient.phone)) {
    errors.push('Phone number is invalid');
  }
  
  return errors;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  // Simple validation - adjust as needed
  const phoneRegex = /^\+?\d{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
};

export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString();
};

export const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};
