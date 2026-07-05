import { User } from "../schema/schema";
class USER {
    username: string;
    email: string;
    password: string;
    constructor(username: string, email: string, password: string) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
    async save() {
        const user = new User({
            name: this.username,
            email: this.email,
            password: this.password
        })
        return await user.save()
    }
    static async find(email: string) {
        const user = await User.findOne({ email: email })
        return user;
    }
    async delete() {
        const user = await User.findByIdAndDelete(this.username)
        return user;
    }
    async update() {
        const user = await User.findByIdAndUpdate(this.username)
        return user;
    }

}

export default USER;