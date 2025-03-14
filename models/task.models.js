import mongoose, {Schema} from "mongoose";

const taskSchema = new Schema(
    {
        title: {
            type: String,
            require: true,
        },
        description: {
            type: String,
        },
        column: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Column",
            require: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true,
        }
    }, {timestamps: true}
);

export const Task = mongoose.model("Task", taskSchema);
