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
                books: value.books || [],
            }
            return user;
        } catch (error) {
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
        }
    }
}

export default UserService;
