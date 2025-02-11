const { pool } = require("../db/dbConnect");
const jwt = require("jsonwebtoken");
const { ApiError } = require("../utils");

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// get All User Rights
const getUserRights = async (req, res, next) => {
  const client = await pool.connect();
  const userRole = req;

  if (!userRole) {
    return null;
  }
  try {
    const query = `
        SELECT r.*,p.id as pageId, p.name as name
        FROM userrights r 
        JOIN pages p ON r.pageId = p.id 
        WHERE r.roleId = $1
      `;
    const { rows } = await client.query(query, [userRole]);
    return rows;
  } finally {
    client.release();
  }
};

// Middleware to check page access rights
const checkPageAccess = (requiredRight) => {
  return async (req, res, next) => {
    try {
      const userRights = await getUserRights(req.user.role);
      if (userRights && userRights.length) {
        const hasRight = userRights.some((right) => {
          const hasRequiredRight = right[requiredRight] === true;
          return hasRequiredRight;
        });

        if (!hasRight) {
          throw new ApiError(403, "Access denied. Insufficient permissions.");
        }
      }

      next();
    } catch (error) {
      console.error("Error checking page access:", error);
      res
        .status(error.statusCode || 500)
        .json(new ApiError(error.statusCode, error.message));
    }
  };
};

// Create rights verification functions for different operations
const canAdd = checkPageAccess("addrights");
const canEdit = checkPageAccess("editrights");
const canList = checkPageAccess("listrights");
const canDelete = checkPageAccess("deleterights");
const canPrint = checkPageAccess("printrights");
const canView = checkPageAccess("viewrights");

module.exports = {
  verifyToken,
  canView,
  canAdd,
  canEdit,
  canDelete,
  canList,
  canPrint,
};
