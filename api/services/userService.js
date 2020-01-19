import firebase from "firebase";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";

class UserService {
    constructor() {
        this.getUserById = this.getUserById.bind(this);
    }

    async getUserById(id) {
        let user;
        try {
            const snapshot = await firebase.database().ref("users").child(id).once("value");
            const value = snapshot.val();
            if (!value) {
                throw new ErrorWithHttpCode(404, `User with id ${id} not found`);
            }
            user = {
                id: id,
                email: value.email,
                favorites: value.favorites || [],
                reading: value.reading || [],
                toread: value.toread || [],
                stopped: value.stopped || [],
                finished: value.finished || [],
            }
            return user;
        } catch (error) {
            throw {
                message: error.message,
                httpCode: error.httpCode || 500
            };
        }
    }
}

export default UserService;
