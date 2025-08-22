import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Add this import for the protect middleware

dotenv.config();

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");

        // Check if Authorization header exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Access Denied. No Token Provided." });
        }

        // Extract the token from the Authorization header
        const token = authHeader.split(" ")[1]; // Removes "Bearer " and gets the token

        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to the request object
        req.user = decoded;

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        // Differentiate error messages
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid Token" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired, please log in again" });
        } else {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
};

export const protect = async (req, res, next) => {
    try {
        let token;
        
        // Check if token exists in Authorization header first, then cookies
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            // Get token from Authorization header
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies && req.cookies.token) {
            // Get token from cookies as fallback
            token = req.cookies.token;
        }
        
        // If no token found
        if (!token) {
            return res.status(401).json({ message: "Not authorized, please log in" });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by id from token
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        
        // Add user data to request object
        req.user = {
            id: user._id,
            isAdmin: user.isAdmin
        };
        
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token, please log in again" });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired, please log in again" });
        }
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export { authMiddleware };
export default authMiddleware;