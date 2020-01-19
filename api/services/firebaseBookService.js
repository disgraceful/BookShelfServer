import firebase from "firebase"

class firebaseBookService {
    constructor() {
        this.findBookById = this.findBookById.bind(this);
    }

    findBookById(id) {
        const ref = firebase.database().ref("books");
        //ref.push({ id: 11111 }).then(data => console.log(data));
        ref.once("value").then((result) => {
            let snap = result.val();
            console.log("snap", snap);
        }).catch((err) => {

        });
    }
}
export default firebaseBookService