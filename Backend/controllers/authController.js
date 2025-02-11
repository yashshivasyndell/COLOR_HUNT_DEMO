const { pool } = require("../db/dbConnect");
const { ApiError, ApiResponse, asyncHandler } = require("../utils");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const login = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(new ApiError(400, "Email and Passwor are required"));
    }

    const userExists = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length) {
      const user = userExists.rows[0];

      const isMatched = await bcrypt.compare(password, user.password);

      if (isMatched) {
        const token = jwt.sign(
          {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role_id,
          },
          process.env.JWT_SECRET
        );

        res.cookie("token", token, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
          secure: process.env.NODE_ENV === "production",
        });

        return res
          .status(200)
          .json(new ApiResponse(200, "Successfully logged in"));
      } else {
        return res.status(400).json(
          new ApiError(400, "Invalid credentials", {
            invalidCredentials: true,
          })
        );
      }
    } else {
      return res
        .status(400)
        .json(new ApiError(400, "User does not exist", { userExists: false }));
    }
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const register = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { role, name, email, password, phone_no } = req.body;

    if (!role || !name || !email || !password || !phone_no) {
      return res.status(400).json(new ApiError(400, "All fields are required"));
    }

    const userExists = await client.query(
      "SELECT email FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length) {
      return res.status(400).json(new ApiError(400, "User already exists"));
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const { rows } = await client.query(
      "INSERT INTO users (id, role_id, name, email, password, phone_no) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [1, role, name, email, hashedPassword, phone_no]
    );

    if (rows.length) {
      const user = rows[0];
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role_id },
        process.env.JWT_SECRET
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
      });

      return res
        .status(200)
        .json(new ApiResponse(200, "Successfully registered"));
    }
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const loadUser = asyncHandler(async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(400).json(new ApiError(400, "Unauthorized"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Successfully fetched user"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  }
});

const logout = asyncHandler(async (req, res, next) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      maxAge: new Date(Date.now()),
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Successfully logged out"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } 
});

module.exports = {
  login,
  register,
  loadUser,
  logout
};
