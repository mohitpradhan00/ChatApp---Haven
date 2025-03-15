import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { compare } from "bcrypt";
import { renameSync, unlinkSync } from "fs";

const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const user = await User.create({ email, password });
      res.cookie("jwt", createToken(email, user.id), {
        maxAge,
        secure: true,
        sameSite: "None",
      });

      return res.status(201).json({
        user: {
          id: user?.id,
          email: user?.email,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image,
          profileSetup: user.profileSetup,
        },
      });
    } else {
      return res.status(400).send("Email and Password Required");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const login = async (req, res, next) => {
  try {
    console.log("Request Body:", req.body);
    const { email, password } = req.body;

    console.log("Login attempt with:", email, password);
    if (email && password) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).send("User not found");
      }

      console.log("Stored Password in DB:", user.password);

      const auth = await compare(password, user.password);
      console.log("Password match:", auth);
      if (!auth) {
        return res.status(400).send("Invalid Password");
      }

      console.log("JWT_KEY:", process.env.JWT_KEY);
      res.cookie("jwt", createToken(email, user.id), {
        maxAge,
        secure: true,
        sameSite: "None",
      });
      return res.status(200).json({
        user: {
          id: user?.id,
          email: user?.email,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image,
          profileSetup: user.profileSetup,
        },
      });
    } else {
      return res.status(400).send("Email and Password Required");
    }
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).send("Internal Server Error");
  }
};

export const getUserInfo = async (req, res, next) => {
  try {
    const userData = await User.findById(req.userId);
    if (!userData) {
      return res.status(404).send("User with the given id not found.");
    }
    return res.status(200).json({
      id: userData?.id,
      email: userData?.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      profileSetup: userData.profileSetup,
      color: userData.color,
    });
  } catch (err) {
    console.log({ err });
    return res.status(500).send("Internal Server Error");
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req;

    const { firstName, lastName, color } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).send("Firstname,lastname and color are required");
    }

    const userData = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, color, profileSetup: true },
      { new: true, runValidators: true }
    );
    return res.status(200).json({
      id: userData?.id,
      email: userData?.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      profileSetup: userData.profileSetup,
    });
  } catch (err) {
    console.log({ err });
    return res.status(500).send("Internal Server Error");
  }
};

export const addProfileImage = async (req, res, next) => {
  try {
    if (req.file) {
      const date = Date.now();
      let fileName = "uploads/profiles/" + date + req.file.originalname;
      renameSync(req.file.path, fileName);
      const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { image: fileName },
        {
          new: true,
          runValidators: true,
        }
      );
      return res.status(200).json({ image: updatedUser.image });
    } else {
      return res.status(404).send("File is required.");
    }
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error.");
  }
};

export const removeProfileImage = async (req, res, next) => {
  try {
    const { userId } = req;

    if (!userId) {
      return res.status(400).send("User ID is required.");
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found.");
    }

    if (user.image) {
      unlinkSync(user.image);
    }

    user.image = null;
    await user.save();

    return res
      .status(200)
      .json({ message: "Profile image removed successfully." });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error.");
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });

    return res.status(200).send("Logout successfull.");
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error.");
  }
};
