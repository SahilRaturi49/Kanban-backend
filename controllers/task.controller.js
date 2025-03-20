import { Task } from "../models/task.models.js";
import { Column } from "../models/column.models.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler";


const createTask = asyncHandler(async (req, res) => {
    const { title, description, column } = req.body;

    if(!title || !column) {
        throw new ApiError(400, "Title and Column are required");
    };

    const columnExists = await Column.findById(column);
    if(!columnExists){
        throw new ApiError(404, "Column not found");
    };


    // create the task
    const task = await Task.create({
        title,
        description,
        column,
        createdBy: req.user._id,
    });

    columnExists.tasks.push(task._id);
    await columnExists.save();

    return res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
});

const updateTask = asyncHandler(async(req, res) => {
    const { taskId } = req.params;
    const { title , description, column} = req.body;

    if(!title && !description && !column) {
        throw new ApiError(400, "At least one field is required");
    };

    const task = await Task.findById(taskId);
    if(!task){
        throw new ApiError(404, "Task not found");
    };

    if(column){
        const newColumn = await Column.findById(column);
        if(!newColumn){
            throw new ApiError(404, "New column not found")
        };

        const oldColumn = await Column.findById(task.column);
        if(oldColumn) {
            oldColumn.tasks = oldColumn.tasks.filter((id) => id.toString() !== taskId);
            await oldColumn.save();
        };

        newColumn.tasks.push(task._id);
        await newColumn.save();
    }

    const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        {
            title,
            description,
            column,

        },
        {new: true},
    );

    return res.status(200)
    .json(new ApiResponse(200, updatedTask, "Task updated Successfully"));
});


const deleteTask = asyncHandler(async(req, res) => {
    const {taskId} = req.params;
    const task = await Task.findById(taskId);
    if(!task) {
        throw new ApiError(404, "Task not found");
    }

    const column = await Column.findById(task.column);
    if(column){
        column.tasks = column.tasks.filter((id) => id.toString !== taskId );
        await column.save();
    }

    await Task.findByIdAndDelete(taskId);

    return res.status(200)
    .json(new ApiResponse(200, null, "Task deleted successfully"));
})

export {
    createTask,
    updateTask,
    deleteTask,
}