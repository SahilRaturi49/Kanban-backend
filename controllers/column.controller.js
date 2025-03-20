import { Column } from "../models/column.model.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js"; 
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createColumn = asyncHandler(async(req, res) => {
    const { title } = req.body;

    if(!title){
        throw new ApiError(400, "Title required");
    }

    const user = await User.findById(req.user._id);
    if(!user){
        throw new ApiError(404, "User not found");
    }

    const column = await Column.create({
        title,
        createdBy: req.user._id
    });


    return res
    .status(201)
    .json(new ApiResponse(201, column, "Column created successfully"))

});

const getColumns = asyncHandler(async(req, res) => {
    const columns = await Column.find({createdBy: req.user._id}).populate("tasks");

    if(!columns || columns.length === 0){
        throw new ApiError(404, "No columns found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, columns, "Columns fetched successfully"));
});


const deleteColumn = asyncHandler(async(req, res) => {
    const {columnId} = req.params;

    const column = await Column.findById(columnId);

    if(!column) {
        throw new ApiError(404, "Column not found");
    }

    if(column.createdBy.toString() !== req.user._id.toString()){
        throw new ApiError(403, "you are not authorized to delete this column");
    }

    await Task.deleteMany({column: columnId});

    await Column.findByIdAndDelete(columnId);


    return res
    .status(201)
    .json(new ApiResponse(201, null, "Column deleted succefully"));

})




export{
    createColumn,
    getColumns,
    deleteColumn,
}
