import firebase from "firebase";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";

class UserBooksService {
    constructor(userService) {
        this.userService = userService;
        this.getUserReading = this.getUserReading.bind(this);
        this.addToUserReading = this.addToUserReading.bind(this);
    }

    async getUserReading(id) {
        try {
            const user = await this.userService.getUserById(id)
            console.log(user.reading);
            return user.reading;
        } catch (error) {
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
        }
    }

    async addToUserReading(id, book) {
        try {
            const user = await this.userService.getUserById(id);
            if (!user.reading.every(item => item.id !== book.id)) {
                console.log("same ID!");
            } else {
                user.reading.push(book);
                await firebase.database().ref("users").child(id).update({ reading: user.reading }, error => {
                    if (error) {
                        throw new ErrorWithHttpCode(400, error.message);
                    }
                });
            }
            return user;
        } catch (error) {
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
        }
    }
}

export default UserBooksService;
