import firebase from "firebase";

class AuthService {
    constructor() {
        this.getUser = this.getUser.bind(this);
        this.createUser = this.createUser.bind(this);
    }

    async getUser(email, password) {
        let existingUser = {};
        try {
            const user = await firebase.auth().signInWithEmailAndPassword(email, password);
            existingUser.email = user.user.email;
            const snapshot = await firebase.database().ref("users").orderByChild("email").equalTo(existingUser.email).once("value")

            let key;
            snapshot.forEach(e => key = e.key);
            const dbUser = snapshot.val()[key];
            existingUser.id = key;
            existingUser.favorites = dbUser.favorites || [];
            existingUser.reading = dbUser.reading || [];
            existingUser.toread = dbUser.toread || [];
            existingUser.stopped = dbUser.stopped || [];
            existingUser.finished = dbUser.finished || [];
            console.log("result user: ", existingUser);
            return existingUser;
        } catch (error) {
            return error;
        }
    }

    async createUser(email, password) {
        let newUser;
        try {
            const user = await firebase.auth().createUserWithEmailAndPassword(email, password);
            newUser = {
                email: user.user.email,
                favorites: [],
                reading: [],
                toread: [],
                stopped: [],
                finished: []
            };
            const data = await firebase.database().ref("users").push(newUser);
            newUser.id = data.key;
            return newUser;
        }
        catch (error) {
            return error;
        }
    }


}

export default AuthService;