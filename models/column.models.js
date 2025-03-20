import mongoose, {Schema} from "mongoose";

const columnSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
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