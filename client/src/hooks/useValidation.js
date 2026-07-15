import { useMemo } from 'react';
import { EMAIL_REGEX, validatePassword } from './useRegisterForm';

export const useValidation = () => {
  // Validate email
  const isValidEmail = (email) => {
    if (!email) return { valid: false, error: 'Email is required' };
    if (!EMAIL_REGEX.test(email)) return { valid: false, error: 'Please enter a valid email address' };
    return { valid: true };
  };

  // Validate password
  const isValidPassword = (password, confirmPassword) => {
    if (!password) return { valid: false, error: 'Password is required' };

    const strength = validatePassword(password);

    if (strength.score < 0.5) {
      return { valid: false, error: 'Password is too weak' };
    }

    if (confirmPassword && password !== confirmPassword) {
      return { valid: false, error: 'Passwords do not match' };
    }

    return { valid: true };
  };

  // Validate name
  const isValidName = (name) => {
    if (!name) return { valid: false, error: 'Name is required' };
    if (name.trim().length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
    if (name.trim().length > 50) return { valid: false, error: 'Name must be less than 50 characters' };
    return { valid: true };
  };

  // Validate graduation year
  const isValidGraduationYear = (year) => {
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 10;
    const maxYear = currentYear + 10;

    if (!year) return { valid: false, error: 'Graduation year is required' };

    const parsedYear = parseInt(year, 10);
    if (isNaN(parsedYear)) return { valid: false, error: 'Please enter a valid year' };
    if (parsedYear < minYear || parsedYear > maxYear) {
      return { valid: false, error: 'Please enter a valid graduation year' };
    }

    return { valid: true };
  };

  // Validate that at least one item is selected in an array
  const hasAtLeastOne = (items, fieldName = 'item') => {
    if (!Array.isArray(items) || items.length === 0) {
      return { valid: false, error: `Please select at least one ${fieldName}` };
    }
    return { valid: true };
  };

  // Build password strength UI data
  const getPasswordStrengthData = (password) => {
    if (!password) {
      return {
        score: 0,
        label: 'Enter a password',
        color: 'bg-gray-200',
        requirements: [
          { met: false, text: 'At least 8 characters' },
          { met: false, text: 'One uppercase letter' },
          { met: false, text: 'One lowercase letter' },
          { met: false, text: 'One number' },
        ],
      };
    }

    const strength = validatePassword(password);

    const label =
      strength.score === 1
        ? 'Strong password'
        : strength.score > 0.6
          ? 'Good password'
          : strength.score > 0.3
            ? 'Weak password'
            : 'Weak password';

    const color =
      strength.score === 1
        ? 'bg-emerald-500'
        : strength.score > 0.6
          ? 'bg-indigo-500'
          : 'bg-rose-500';

    const requirements = [
      { met: password.length >= 8, text: 'At least 8 characters' },
      { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
      { met: /[a-z]/.test(password), text: 'One lowercase letter' },
      { met: /[0-9]/.test(password), text: 'One number' },
      { met: /[^A-Za-z0-9]/.test(password), text: 'One special character' },
    ];

    return { score: strength.score, label, color, requirements };
  };

  return {
    isValidEmail,
    isValidPassword,
    isValidName,
    isValidGraduationYear,
    hasAtLeastOne,
    getPasswordStrengthData,
  };
};
