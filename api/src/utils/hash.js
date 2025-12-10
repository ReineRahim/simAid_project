import bcrypt from 'bcrypt';

/**
 * Hash a plain text password using bcrypt.
 *
 * This function applies bcrypt hashing with a salt round of 12,
 * making it secure against brute-force attacks.  
 * Commonly used during user registration or password updates.
 *
 * @async
 * @function hashPassword
 * @param {string} plain - The plain text password to hash.
 * @returns {Promise<string>} The securely hashed password.
 * @example
 * const hashed = await hashPassword("mySecret123");
 * console.log(hashed); // "$2b$12$..."
 */
export const hashPassword = async (plain) => await bcrypt.hash(plain, 12);

/**
 * Compare a plain text password with a hashed password.
 *
 * Verifies whether a provided plain text password matches
 * a previously hashed value using bcrypt’s comparison algorithm.
 *
 * @async
 * @function comparePassword
 * @param {string} plain - The plain text password to verify.
 * @param {string} hashed - The hashed password from the database.
 * @returns {Promise<boolean>} True if passwords match, otherwise false.
 * @example
 * const isValid = await comparePassword("mySecret123", hashedPassword);
 * if (isValid) console.log("Password is correct!");
 */
export const comparePassword = async (plain, hashed) => await bcrypt.compare(plain, hashed);
