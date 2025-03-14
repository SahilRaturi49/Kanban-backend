import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
    {
        username: {
            type: String,
            require: true,
            unique: true,
        },

        email: {
            type: String,
            require: true,
            unique: true,
        },

        password: {
            type: String,
            require: true,
        },
    }, {timestamps:true}
);

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.method.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);