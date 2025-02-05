import bcrypt from "bcrypt"; // Importing the bcrypt library for hashing and comparing passwords

/**
 * Hashes a plain text password using bcrypt.
 * 
 * @param {string} password - The plain text password to be hashed.
 * @returns {Promise<string>} - A promise that resolves to the hashed password.
 * @throws {Error} - Throws an error if hashing fails.
 */
export const hashPassword = async (password) => {
  try {
    const saltRounds = 10; // The number of rounds of salting to apply (higher is more secure but slower)
    const hashedPassword = await bcrypt.hash(password, saltRounds); // Hash the password
    return hashedPassword; // Return the hashed password
  } 
  catch (error) {
    // Throw a new error if hashing fails, providing the original error message
    throw new Error(`Error hashing password: ${error.message}`);
  }
};

/**
 * Compares a plain text password with a hashed password to check if they match.
 * 
 * @param {string} password - The plain text password to compare.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {Promise<boolean>} - A promise that resolves to true if the passwords match, otherwise false.
 * @throws {Error} - Throws an error if comparison fails.
 */
export const comparePassword = async (password, hashedPassword) => {
  try {
    const isValid = await bcrypt.compare(password, hashedPassword); // Compare the passwords
    return isValid; // Return the result of the comparison (true or false)
  } 
  catch (error) {
    // Throw a new error if comparison fails, providing the original error message
    throw new Error(`Error comparing password: ${error.message}`);
  }
};