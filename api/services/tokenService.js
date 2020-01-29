import "dotenv/config";
import jwt from "jsonwebtoken";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";

class TokenService {
    constructor() {
        this.createToken = this.createToken.bind(this);
        this.validateToken = this.validateToken.bind(this);
    }

    createToken(user, expire) {
        if (!user || expire <= 0) throw new ErrorWithHttpCode(400, "Error creating a token");
        return jwt.sign(user, process.env.JWT_KEY, { expiresIn: expire });
    }

    validateToken(token) {
        if (!token) throw new ErrorWithHttpCode(400, "Token is invalid");
        return jwt.verify(token, process.env.JWT_KEY, (error, decoded) => {
            if (error) throw new ErrorWithHttpCode(500, "Failed to authenticate token");
            console.log("decoded", decoded);
            return decoded;
        })
    }
}

export default TokenService;
