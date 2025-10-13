/**
 * Re-export useAuth from AuthContext
 * This maintains backward compatibility with existing imports
 */
export { useAuth } from "../contexts/AuthContext"

/**
 * Re-export auth utility functions
 * These are standalone and don't depend on React context
 */
export { signInWithGoogle, signInWithEmail, signOut, getIdToken } from "../utils/auth"
