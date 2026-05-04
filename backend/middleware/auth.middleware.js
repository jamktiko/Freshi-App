/* import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

// Get the JWKS (JSON Web Key Set) from Cognito to verify JWTs
const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`
});

/**
 * Gets the correct public key based on the JWT header

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);

    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

/**
 * Middleware: Validates the Cognito JWT token. 

export function authMiddleware(req, res, next) {
  // Extracts the token from the Authorization header
  const token = req.headers.authorization?.replace("Bearer ", "");

  // If no token is provided, return 401 Unauthorized
  if (!token) {
    return res.status(401).json({
      error: "Missing token"
    });
  }

  // Verifies the token using the JWKS client to get the correct public key
  jwt.verify(token, getKey, {}, (err, decoded) => {
    //If there's an error during verification (e.g., invalid token), return 401 Unauthorized
    if (err) {
      return res.status(401).json({
        error: "Invalid token"
      });
    }

    // Saves the decoded token (which contains user information) to req.user
    req.user = decoded;

    next();
  });
}
*/
export function requireAuth(req, res, next) {
  // First, check if x-user-id is provided (useful for local manual testing)
  let userId = req.headers["x-user-id"];

  // If not provided, extract the 'sub' directly from the Cognito ID token payload 
  // (API Gateway has already validated the signature, so decoding the payload is safe)
  if (!userId) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      const token = authHeader.substring(7);
      try {
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
          const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
          const payload = JSON.parse(payloadJson);
          userId = payload.sub;
        }
      } catch (err) {
        console.error("Failed to decode token payload:", err);
      }
    }
  }

  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }

  req.user = {
    sub: userId
  };

  next();
}

// Function to require API Gateway secret.
// This helps ensure only requests coming through API Gateway are accepted.
export function requireApiGatewaySecret(req, res, next) {
  const secret = req.headers["x-api-gateway-secret"];

  if (secret !== process.env.API_GATEWAY_SECRET) {
    return res.status(403).json({
      success: false,
      error: "Forbidden"
    });
  }

  next();
}