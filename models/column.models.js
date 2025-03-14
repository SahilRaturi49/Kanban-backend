import mongoose, {Schema} from "mongoose";

const columnSchema = new Schema(
    {
        title: {
            type: String,
            require: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true,
        },
        tasks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Task",
            }
        ]
    }, {
        timestamps: true,
    }
);

export const Column = mongoose.model("Column", columnSchema);