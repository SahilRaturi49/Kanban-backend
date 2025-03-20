import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"; 
import mongoose from "mongoose";
// import express from "express";

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshtoken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforSave: false});
        return { accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerUser = asyncHandler(async(req, res) => {
    const { username, email, password} = req.body;

    if(!username || !email || !password){
        throw new ApiError(400, "All fields are required");
    };

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    });

    if(!existedUser){
        throw new ApiError(409, "User with email and username already exists");
    }

    const user = await User.create({
        username,
        email,
        password,
    });

    const createdUser = await User.findById(user._id).select("-password, -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    };

    return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async(req, res) => {
    const { username, email, password } = req.body;

    if(!username && !email){
        throw new ApiError(400, "Username or email is required");
    };

    const user = await user.findOne({$or:[{username}, {email}]});

    if(!user){
        throw new ApiError(404, "User does not exists");
    };

    const isPasswordValid = await user.isPasswordValid(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials");
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password, -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(201, {user: loggedInUser, accessToken, refreshToken}, "User logged in successfully"))

});

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {$unset:{ refreshToken: 1}},
        {new: true},
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
    .status(201)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(201, {}, "User logged out successfully"));

});

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshtoken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshtoken){
        throw new ApiError(401, "Unauthorized request");
    };

    try {
        const decodedToken = jwt.verify(
            incomingRefreshtoken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken._id);

        if(!user){
            throw new ApiError(401, "Invalid refresh token");
        }

        const { accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id);

        const options = {
            httpOnly: true,
            secure: true,
        }

        return res 
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, 
            "Accessed token refreshed"
        ));
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
        
    }

});

const updateUserProfile = asyncHandler(async(req, res) => {
    const {username, email} = req.body;

    if(!username && !email){
        throw new ApiError(400, "At least one field (username or email) is required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {$set: {username, email}},
        {new: true}
    ).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile updated successfully"));
});


const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
  
    if (!oldPassword || !newPassword) {
      throw new ApiError(400, "Both old and new passwords are required");
    }
  
    const user = await User.findById(req.user._id);
  
    const isPasswordValid = await user.isPasswordValid(oldPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid old password");
    }
  
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
  
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password changed successfully"));
});


export {
    generateAccessAndRefreshToken,
    registerUser,
    loginUser,
    logoutUser,
    updateUserProfile,
    changePassword,   
}