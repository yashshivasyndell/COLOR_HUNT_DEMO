const { pool } = require("../db/dbConnect");
const bcrypt = require("bcrypt");
const { asyncHandler, ApiResponse, ApiError } = require("../utils");
const {
  addOrUpdateCategorySchema,
  addOrUpdateSubCategory,
  addOrUpdateRangeSeries,
  addOrUpdateBrand,
  addOrUpdateVendor,
  addOrUpdateUser,
  addOrUpdateParty,
  addOrUpdateArticle,
  addOrUpdatePO,
} = require("../validations/masterValidation");
const { error } = require("winston");
const { cli } = require("winston/lib/winston/config");
const { Client } = require("pg");
const { json } = require("express");
const { date, number } = require("joi");

// <!-- Category -->
const getCategoryList = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT * FROM category");

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched categories"));
    }

    return res.status(400).json(new ApiError(400, "No categories found"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});


const getSingleCategoryDetails = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    const { rows } = await client.query(
      "SELECT * FROM category WHERE id = $1",
      [id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched categories"));
    }

    return res.status(400).json(new ApiError(400, "No categories found"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const addCategory = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();

  try {
    const {
      name,
      colorflag,
      article_open_flag,
      image,
      isactive,
      mobile_status,
    } = req.body;

    const { error } = addOrUpdateCategorySchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((err) => err.message);
      throw new ApiError(400, "Validation failed", errors);
    }

    const categoryExists = await client.query(
      `SELECT name FROM category WHERE name = '${name}' AND colorflag = ${colorflag} AND article_open_flag = ${article_open_flag}`
    );

    if (categoryExists.rows && categoryExists.rows.length) {
      throw new ApiError(400, "Category already exists", {
        alreadyExists: true,
      });
    }

    const { rows } = await client.query(
      "INSERT INTO category (name, colorflag, article_open_flag, image, isactive, mobile_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, colorflag, article_open_flag, image, isactive, mobile_status]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully added category"));
    }
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message, error?.errors));
  } finally {
    await client.release();
  }
});

const deleteCategory = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query("BEGIN");

    if (!id) {
      return res.status(400).json(new ApiError(400, "Category id is required"));
    }

    const deleteSubCategories = await client.query(
      "DELETE FROM subcategory WHERE category_id = $1",
      [id]
    );

    const deleteRangeSeries = await client.query(
      "DELETE FROM rangeseries WHERE category_id = $1",
      [id]
    );

    const { rows } = await client.query(
      "DELETE FROM category WHERE id = $1 RETURNING *",
      [id]
    );

    if (rows.length) {
      await client.query("COMMIT");
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully deleted category"));
    }

    return res.json(
      new ApiError(400, "Category not found", "Category not found")
    );
  } catch (error) {
    await client.query("ROLLBACK");
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const updateCategory = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      name,
      colorflag,
      article_open_flag,
      image,
      isactive,
      mobile_status,
    } = req.body;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Category id is required"));
    }

    const { error } = addOrUpdateCategorySchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((err) => err.message);
      throw new ApiError(400, "Validation failed", errors);
    }

    const { rows } = await client.query(
      "UPDATE category SET name = $1, colorflag = $2, article_open_flag = $3, image = $4, isactive = $5, mobile_status = $6 WHERE id = $7 RETURNING *",
      [name, colorflag, article_open_flag, image, isactive, mobile_status, id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully updated category"));
    }

    return res.status(400).json(new ApiError(400, "Category not found"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message, error?.errors));
  } finally {
    await client.release();
  }
});

const updateMobileStatus = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { mobile_status } = req.body;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Category id is required"));
    }

    const { rows } = await client.query(
      "UPDATE category SET mobile_status = $1 WHERE id = $2 RETURNING *",
      [mobile_status, id]
    );
    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully updated category"));
    }

    return res
      .status(400)
      .json(new ApiError(400, "Category not found", { notFound: true }));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

// <!-- Subcategory -->
const getSubCategoryList = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      "SELECT c.id AS category_id, c.name as category_name, sc.id as subcategory_id, sc.name as subcategory_name FROM subcategory sc JOIN category c ON c.id = sc.category_id"
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched subcategories"));
    }

    return res.status(400).json(new ApiError(400, "No subcategories found"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const getSingleSubCategoryDetails = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json(new ApiError(400, "Subcategory id is required"));
    }

    const { rows } = await client.query(
      "SELECT c.id AS category_id, c.name as category_name, sc.id as subcategory_id, sc.name as subcategory_name FROM subcategory sc JOIN category c ON c.id = sc.category_id WHERE sc.id = $1",
      [id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched subcategories"));
    }

    return res
      .status(400)
      .json(
        new ApiError(400, "No single subcategories found", { notFound: true })
      );
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message, error?.errors));
  } finally {
    await client.release();
  }
});

const addSubCategory = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { category_id, name } = req.body;

    const { error } = addOrUpdateSubCategory.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((err) => err.message);
      throw new ApiError(400, "Validation failed", errors);
    }

    const subCategoryExists = await client.query(
      `SELECT name FROM subcategory WHERE name LIKE '%${name}%' AND category_id = ${category_id} `
    );

    if (subCategoryExists.rows && subCategoryExists.rows.length) {
      return res.status(400).json(
        new ApiError(400, "Subcategory already exists", {
          alreadyExists: true,
        })
      );
    }

    const { rows } = await client.query(
      "INSERT INTO subcategory (category_id, name) VALUES ($1, $2) RETURNING *",
      [category_id, name]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully added subcategories"));
    }
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message, error?.errors));
  } finally {
    await client.release();
  }
});

const deleteSubCategory = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    console.log("subcat id", id);
    if (!id) {
      return res
        .status(400)
        .json(new ApiError(400, "Subcategory id is required"));
    }

    const { rows } = await client.query(
      "DELETE FROM subcategory WHERE id = $1 RETURNING *",
      [id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully deleted subcategory"));
    }

    return res.status(400).json(new ApiError(400, "Subcategory not found"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const updateSubCategory = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { category_id, name } = req.body;

    if (!id) {
      return res
        .status(400)
        .json(new ApiError(400, "Subcategory id is required"));
    }

    const { error } = addOrUpdateSubCategory.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((err) => err.message);
      throw new ApiError(400, "Validation of form failed", errors);
    }

    const subCategoryExists = await client.query(
      `SELECT name FROM subcategory WHERE name = '${name}' AND category_id = ${category_id} `
    );

    if (subCategoryExists.rows && subCategoryExists.rows.length) {
      return res.status(400).json(
        new ApiError(400, "Subcategory already exists", {
          alreadyExists: true,
        })
      );
    }

    const { rows } = await client.query(
      "UPDATE subcategory SET category_id = $1, name = $2 WHERE id = $3 RETURNING *",
      [category_id, name, id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully updated subcategory"));
    }

    return res.status(400).json(new ApiError(400, "Subcategory not found"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiError(error.statusCode, error.message, error?.errors, error.stac)
      );
  } finally {
    await client.release();
  }
});

const getSubcatOfCategory = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    const { rows } = await client.query(
      "SELECT * FROM subcategory WHERE category_id = $1",
      [id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched subcategories"));
    }

    return res.status(400).json(new ApiError(400, "No subcategories found"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiError(error.statusCode, error.message, error?.errors, error.stac)
      );
  } finally {
    await client.release();
  }
});

// <!-- Work Order -->
const getWorkOrderList = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT * FROM workorder");

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched workorders"));
    }

    return res.status(400).json(new ApiError(400, "No workorders found"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message, error?.errors));
  } finally {
    await client.release();
  }
});

const getSingleWorkOrderDetails = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json(new ApiError(400, "Work order id is required"));
    }

    const { rows } = await client.query(
      "SELECT * FROM workorder WHERE id = $1",
      [id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, rows, "Successfully fetched workorder details")
        );
    }

    return res.status(400).json(new ApiError(400, "Work order not found"));
  } catch (error) {
  } finally {
    await client.release();
  }
});

const addWorkOrder = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { name } = req.body;

    if (!name || !name.trim().length) {
      return res
        .status(400)
        .json(new ApiError(400, "Work order name is required"));
    }

    const workOrderExists = await client.query(
      `SELECT name FROM workorder WHERE name LIKE '%${name}%'`
    );

    if (workOrderExists.rows && workOrderExists.rows.length) {
      return res.status(400).json(
        new ApiError(400, "Work order already exists", {
          alreadyExists: true,
        })
      );
    }

    const { rows } = await client.query(
      "INSERT INTO workorder (name) VALUES ($1) RETURNING *",
      [name]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully added workorder"));
    }

    return res.status(400).json(new ApiError(400, "Failed to add workorder"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message, error.stack));
  } finally {
    await client.release();
  }
});

const deleteWorkOrder = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return req
        .status(400)
        .json(new ApiError(400, "Work order id is required"));
    }

    const { rows } = await client.query(
      "DELETE FROM workorder WHERE id = $1 RETURNING *",
      [id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully deleted workorder"));
    }

    return res.status(400).json(new ApiError(400, "Work order not found"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const updateWorkOrder = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id) {
      return res
        .status(400)
        .json(new ApiError(400, "Work order id is required"));
    }

    if (!name || !name.trim().length) {
      return res
        .status(400)
        .json(new ApiError(400, "Work order name is required"));
    }

    const workOrderExists = await client.query(
      `SELECT name FROM workorder WHERE name LIKE '%${name}%'`
    );

    if (workOrderExists.rows && workOrderExists.rows.length) {
      return res.status(400).json(
        new ApiError(400, "Work order already exists", {
          alreadyExists: true,
        })
      );
    }

    const { rows } = await client.query(
      "UPDATE workorder SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully updated workorder"));
    }
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

// <!-- Range Series -->
const getRangeSeriesList = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      "SELECT rs.id as rangeseries_id, rs.series_name as rangeseries_name, rs.series, sc.id as subcategory_id, sc.name as subcategory_name, c.id as category_id, c.name as category_name FROM rangeseries rs INNER JOIN subcategory sc ON sc.id = rs.subcategory_id INNER JOIN category c ON c.id = rs.category_id"
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched range series"));
    }

    return res
      .status(400)
      .json(new ApiError(400, "Failed to fetch range series"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const addRangeSeries = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { category_id, subcategory_id, series_name, series } = req.body;

    const { error } = addOrUpdateRangeSeries.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((err) => err.message);
      throw new ApiError(400, "Validation failed", errors);
    }

    const rangeSeriesExists = await client.query(
      `SELECT series_name FROM rangeseries WHERE series_name LIKE '%${series_name}%' AND category_id = ${category_id} AND subcategory_id = ${subcategory_id} AND series = '${series}'`
    );

    if (rangeSeriesExists.rows && rangeSeriesExists.rows.length) {
      return res.status(400).json(
        new ApiError(400, "Range series already exists", {
          alreadyExists: true,
        })
      );
    }

    const { rows } = await client.query(
      "INSERT INTO rangeseries (category_id, subcategory_id, series_name, series) VALUES ($1, $2, $3, $4) RETURNING *",
      [category_id, subcategory_id, series_name, series]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully added range series"));
    }

    return res
      .status(400)
      .json(new ApiError(400, "Failed to add range series"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message, error?.errors));
  } finally {
    await client.release();
  }
});

const deleteRangeSeries = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json(new ApiError(400, "Range series id is required"));
    }

    const { rows } = await client.query(
      "DELETE FROM rangeseries WHERE id = $1 RETURNING *",
      [id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully deleted range series"));
    }

    return res.status(400).json(new ApiError(400, "Range series not found"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message, error?.errors));
  } finally {
    await client.release();
  }
});

const updateRangeSeries = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { category_id, subcategory_id, series_name, series } = req.body;

    const { error } = addOrUpdateRangeSeries.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((err) => err.message);
      throw new ApiError(400, "Validation failed", errors);
    }

    const rangeSeriesExists = await client.query(
      `SELECT series_name FROM rangeseries WHERE series_name = '${series_name}' AND category_id = ${category_id} AND subcategory_id = ${subcategory_id} AND series = '${series}'`
    );

    if (rangeSeriesExists.rows && rangeSeriesExists.rows.length) {
      return res.status(400).json(
        new ApiError(400, "Range series already exists", {
          alreadyExists: true,
        })
      );
    }

    const { rows } = await client.query(
      "UPDATE rangeseries SET category_id = $1, subcategory_id = $2, series_name = $3, series = $4 WHERE id = $5 RETURNING *",
      [category_id, subcategory_id, series_name, series, id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully updated range series"));
    }
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message, error?.errors));
  } finally {
    await client.release();
  }
});

const getSingleRangeSeriesDetails = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json(new ApiError(400, "Range series id is required"));
    }

    const { rows } = await client.query(
      "SELECT * FROM rangeseries rs WHERE id = $1",
      [id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            rows,
            "Successfully fetched range series details"
          )
        );
    }

    return res.status(400).json(new ApiError(400, "Range series not found"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message, error?.errors));
  } finally {
    await client.release();
  }
});

// <!-- Brand -->
const getBrandList = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT * FROM brand");

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched brand list"));
    }

    return res
      .status(400)
      .json(new ApiError(400, "Failed to fetch brand list"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const getSingleBrandDetails = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Brand id is required"));
    }

    const { rows } = await client.query("SELECT * FROM brand WHERE id = $1", [
      id,
    ]);

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched brand details"));
    }

    return res.status(400).json(new ApiError(400, "Brand not found"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const addBrand = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { name, description } = req.body;

    const { error } = addOrUpdateBrand.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((err) => err.message);
      throw new ApiError(400, "Validation failed", errors);
    }

    const brandExists = await client.query(
      "SELECT name FROM brand WHERE name = $1",
      [name]
    );

    console.log("Brand Exists: ", brandExists);

    if (brandExists.rows && brandExists.rows.length) {
      return res.status(400).json(
        new ApiError(400, "Brand already exists", {
          alreadyExists: true,
        })
      );
    }

    const { rows } = await client.query(
      "INSERT INTO brand (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully added brand"));
    }

    return res.status(400).json(new ApiError(400, "Failed to add brand"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message, error?.errors));
  } finally {
    await client.release();
  }
});

const deleteBrand = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Brand id is required"));
    }

    const { rows } = await client.query(
      "DELETE FROM brand WHERE id = $1 RETURNING *",
      [id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully deleted brand"));
    }

    return res.status(400).json(new ApiError(400, "Brand not found"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const updateBrand = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const { error } = addOrUpdateBrand.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((err) => err.message);
      throw new ApiError(400, "Validation failed", errors);
    }

    // FIXED: Use parameterized query with proper quotes
    const brandExists = await client.query(
      "SELECT * FROM brand WHERE name = $1 AND id != $2",
      [name, id]
    );

    if (brandExists.rows && brandExists.rows.length) {
      return res.status(400).json(
        new ApiError(400, "Brand already exists", {
          alreadyExists: true,
        })
      );
    }

    const { rows } = await client.query(
      "UPDATE brand SET name = $1, description = $2 WHERE id = $3 RETURNING *",
      [name, description, id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully updated brand"));
    }

    return res.status(400).json(new ApiError(400, "Failed to update brand"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiError(error.statusCode || 500, error.message, error?.errors)
      );
  } finally {
    await client.release();
  }
});

// <!-- Color -->
const getColorList = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT * FROM colors");

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched colors"));
    }

    return res.status(400).json(new ApiError(400, "Failed to fetch colors"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const getSingleColorDetails = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Color id is required"));
    }

    const { rows } = await client.query("SELECT * FROM colors WHERE id = $1", [
      id,
    ]);

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched color"));
    }

    return res.status(400).json(
      new ApiError(400, "Color not found", {
        notFound: true,
      })
    );
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const addColor = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { name } = req.body;

    if (!name || !name.trim().length) {
      return res.status(400).json(new ApiError(400, "Color name is required"));
    }

    const colorExists = await client.query(
      "SELECT name FROM colors WHERE name = $1",
      [name]
    );

    if (colorExists.rows && colorExists.rows.length) {
      return res.status(400).json(
        new ApiError(400, "Color already exists", {
          alreadyExists: true,
        })
      );
    }

    const { rows } = await client.query(
      "INSERT INTO colors (name) VALUES ($1) RETURNING *",
      [name]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully added color"));
    }

    return res.status(400).json(new ApiError(400, "Failed to add color"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const deleteColor = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Color id is required"));
    }

    const { rows } = await client.query(
      "DELETE FROM colors WHERE id = $1 RETURNING *",
      [id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully deleted color"));
    }

    return res.status(400).json(new ApiError(400, "Failed to delete color"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const updateColor = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Color id is required"));
    }

    const { name } = req.body;

    if (!name || !name.trim().length) {
      return res.status(400).json(new ApiError(400, "Color name is required"));
    }

    const colorExists = await client.query(
      "SELECT name FROM colors WHERE name = $1",
      [name]
    );

    if (colorExists.rows && colorExists.rows.length) {
      return res.status(400).json(
        new ApiError(400, "Color already exists", {
          alreadyExists: true,
        })
      );
    }

    const { rows } = await client.query(
      "UPDATE colors SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully updated color"));
    }

    return res.status(400).json(new ApiError(400, "Failed to update color"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

// <!-- Size -->
const getSizeList = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT * FROM sizes");

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched sizes"));
    }

    return res
      .status(400)
      .json(new ApiError(400, "Failed to fetch sizes no Data"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const getSingleSizeDetails = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Size id is required"));
    }

    const { rows } = await client.query("SELECT * FROM sizes WHERE id = $1", [
      id,
    ]);

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched size"));
    }

    return res.status(400).json(new ApiError(400, "Failed to fetch size"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const addSize = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { name } = req.body;

    if (!name || !name.trim().length) {
      return res.status(400).json(new ApiError(400, "Size name is required"));
    }

    const colorExists = await client.query(
      "SELECT name FROM sizes WHERE name = $1",
      [name]
    );

    if (colorExists.rows && colorExists.rows.length) {
      return res.status(400).json(
        new ApiError(400, "Color already exists", {
          alreadyExists: true,
        })
      );
    }

    const { rows } = await client.query(
      "INSERT INTO sizes (name) VALUES ($1) RETURNING *",
      [name]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully added size"));
    }

    return res.status(400).json(new ApiError(400, "Failed to add color"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const deleteSize = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Size id is required"));
    }

    const { rows } = await client.query(
      "DELETE FROM sizes WHERE id = $1 RETURNING *",
      [id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully deleted color"));
    }

    return res.status(400).json(new ApiError(400, "Failed to delete color"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const updateSize = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Color id is required"));
    }

    const { name } = req.body;

    if (!name || !name.trim().length) {
      return res.status(400).json(new ApiError(400, "Color name is required"));
    }

    const sizeExists = await client.query(
      "SELECT name FROM sizes WHERE name = $1",
      [name]
    );

    if (sizeExists.rows && sizeExists.rows.length) {
      return res.status(400).json(
        new ApiError(400, "Size already exists", {
          alreadyExists: true,
        })
      );
    }

    const { rows } = await client.query(
      "UPDATE sizes SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully updated size"));
    }

    return res.status(400).json(new ApiError(400, "Failed to update size"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

// <!-- Vendor -->
const getVendorList = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT * FROM vendor");

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched vendors"));
    }

    return res.status(400).json(new ApiError(400, "Failed to fetch vendors"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const getSingleVendorDetails = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Vendor id is required"));
    }

    const { rows } = await client.query("SELECT * FROM vendor WHERE id = $1", [
      id,
    ]);

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched vendor"));
    }

    return res.status(400).json(new ApiError(400, "Failed to fetch vendor"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const addVendor = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { name, address, phone_no, contact_person, gst_no } = req.body;

    const { error } = addOrUpdateVendor.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const errors = error.details.map((err) => err.message);
      throw new ApiError(400, "Validation failed", errors);
    }

    const vendorExists = await client.query(
      "SELECT name FROM vendor where name  = $1",
      [name]
    );

    if (vendorExists.rows && vendorExists.rows.length) {
      return res
        .status(400)
        .json(
          new ApiError(400, "Vendor already exists", { alreadyExists: true })
        );
    }

    const { rows } = await client.query(
      "INSERT INTO vendor (name, address, phone_no, contact_person, gst_no) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, address, phone_no, contact_person, gst_no]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully added vendor"));
    }

    return res.status(400).json(new ApiError(400, "Failed to add vendor"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message, error?.errors));
  } finally {
    await client.release();
  }
});

const deleteVendor = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Vendor id is required"));
    }

    const { rows } = await client.query(
      "DELETE FROM vendor WHERE id = $1 RETURNING *",
      [id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully deleted vendor"));
    }

    return res.status(400).json(new ApiError(400, "Failed to delete vendor"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const updateVendor = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Vendor id is required"));
    }

    // TODO: Check if vendor already exist (Remaining)

    const { name, address, phone_no, contact_person, gst_no } = req.body;

    const { error } = addOrUpdateVendor.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const errors = error.details.map((err) => err.message);
      throw new ApiError(400, "Validation failed", errors);
    }

    const { rows } = await client.query(
      "UPDATE vendor SET name = $1, address  = $2, phone_no = $3,contact_person = $4 ,gst_no = $5 RETURNING *",
      [name, address, phone_no, contact_person, gst_no]
    );

    if (rows.length) {
      return res.status(200).json(new ApiResponse(200, rows, "Successfully "));
    }

    return res.status(400).json(new ApiError(400, "Failed to update vendor"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message, error?.errors));
  } finally {
    await client.release();
  }
});

// <!-- User Role -->
const getUserRoleList = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT * FROM userrole");

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched user roles"));
    }

    return res
      .status(400)
      .json(new ApiError(400, "Failed to fetch user roles"));
  } catch (error) {
  } finally {
    await client.release();
  }
});

const addUserRole = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { role } = req.body;

    if (!role || !role.trim().length) {
      return res.status(400).json(new ApiError(400, "User Role is required"));
    }

    const roleExists = await client.query(
      "SELECT role FROM userrole WHERE role = $1",
      [role]
    );

    if (roleExists.rows && roleExists.rows.length) {
      return res
        .status(400)
        .json(
          new ApiError(400, "User Role already exists", { alreadyExists: true })
        );
    }

    const { rows } = await client.query(
      "INSERT INTO userrole (role) VALUES ($1) RETURNING *",
      [role]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully added user role"));
    }

    return res.status(400).json(new ApiError(400, "Failed to add user role"));
  } catch (error) {
  } finally {
    await client.release();
  }
});

const updateUserRole = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    if (!id || !role) {
      return res.status(400).json(new ApiError(400, "Role id is required"));
    }

    if (!role) {
      return res.status(400).json(new ApiError(400, "Role name is required"));
    }

    const { rows } = await client.query(
      "UPDATE userrole SET role = $1 WHERE id = $2 RETURNING *",
      [role, id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully updated the user role"));
    }

    return res
      .status(400)
      .json(new ApiError(400, "Failed to update user role"));
  } catch (error) {
    return res
      .status(error.statusCode)
      .json(new ApiError(error.statusCode, error.message, error?.errors));
  } finally {
    await client.release();
  }
});

const deleteUserRole = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Role id is required"));
    }

    const { rows } = await client.query(
      "DELETE FROM userrole WHERE id = $1 RETURNING *",
      [id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully deleted the user role"));
    }

    return res
      .status(400)
      .json(new ApiError(400, "Failed to delete User Role"));
  } catch (error) {
    res
      .status(error.statusCode)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const getSalesPersons = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      "SELECT *, u.id as user_id FROM users u JOIN userrole ur ON ur.id = u.role_id WHERE ur.role IN ('Sales','Super Marketing', 'Outlet', 'Admin')"
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched sales person"));
    }

    return res
      .status(400)
      .json(new ApiError(400, "Failed to fetch sales person"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

// <!-- User Management -->
const getUserList = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      "SELECT u.id, u.name, u.email, ur.role AS role, u.isactive, u.mobile_status FROM users u JOIN userrole ur ON ur.id = u.role_id"
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched users"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, [], "Failed to fetch users"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

// update user status (isactive or mobile status)
const updateUserStatus = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { isactive, mobile_status } = req.body;

    if (!id) {
      return res.status(400).json(new ApiError(400, "User ID is required"));
    }

    if (isactive === undefined && mobile_status === undefined) {
      return res
        .status(400)
        .json(new ApiError(400, "At least one status is required"));
    }

    // Build dynamic query
    const fieldsToUpdate = [];
    const values = [];
    let query = "UPDATE users SET ";

    if (mobile_status !== undefined) {
      fieldsToUpdate.push(`mobile_status = $${fieldsToUpdate.length + 1}`);
      values.push(mobile_status);
    }

    if (isactive !== undefined) {
      fieldsToUpdate.push(`isactive = $${fieldsToUpdate.length + 1}`);
      values.push(isactive);
    }

    query += fieldsToUpdate.join(", ");
    query += ` WHERE id = $${fieldsToUpdate.length + 1} RETURNING *`;
    values.push(id);

    const { rows } = await client.query(query, values);

    if (rows.length) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, rows[0], "Successfully updated user status")
        );
    }

    return res.status(404).json(new ApiError(404, "User not found"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  } finally {
    await client.release();
  }
});

const addUser = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { name, email, role, password, phone_no } = req.body;

    const { error } = addOrUpdateUser.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((err) => err.message);
      throw new ApiError(400, "Validation failed", errors);
    }

    const userExists = await client.query(
      "SELECT * FROM users WHERE email = $1 OR name = $2",
      [email, name]
    );

    if (userExists.rows && userExists.rows.length) {
      throw new ApiError(400, "User already exists", { alreadyExists: true });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await client.query(
      "INSERT INTO users (role_id, name, email, password, phone_no) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [role, name, email, hashedPassword, phone_no]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "Successfully added user"));
    }

    return res.status(400).json(new ApiError(400, "Failed to add user"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message, error?.errors));
  } finally {
    await client.release();
  }
});

const getSingleUserDetails = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "User id is required"));
    }

    const { rows } = await client.query(
      "SELECT id, name, email, phone_no, role_id, phone_no FROM users WHERE id = $1",
      [id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched user details"));
    }

    return res
      .status(400)
      .json(new ApiError(400, "Failed to fetch user details"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const updateUser = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "User id is required"));
    }

    const { name, email, role, password, phone_no = "" } = req.body;

    const existingUser = await client.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );

    if (existingUser.rows && existingUser.rows.length) {
      let query = `UPDATE users SET name = '${name}', email = '${email}', role_id = ${role}, phone_no = '${phone_no}' WHERE id = ${id} RETURNING *`;

      if (password !== "" && password !== undefined && password !== null) {
        passwordUpdate = true;
        const hashedPassword = await bcrypt.hash(password, 10);
        query = `UPDATE users SET name = '${name}', email = '${email}', role_id = ${role}, password = '${hashedPassword}', phone_no = '${phone_no}' WHERE id = ${id} RETURNING *`;
      }

      const { rows } = await client.query(query);

      if (rows.length) {
        return res
          .status(200)
          .json(new ApiResponse(200, {}, "Successfully updated user"));
      }
    }

    return res.status(400).json(new ApiError(400, "Failed to update user"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const deleteUser = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = await req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "User id is required"));
    }

    const { rows } = await client.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Successfully deleted user"));
    }

    return res.status(400).json(new ApiError(400, "Failed to delete user"));
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

// Party master
const getPartyList = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      "SELECT *,p.name AS Partyname, u.name AS sales_person, p.id AS party_id FROM party p INNER JOIN users u ON p.user_id = u.id WHERE p.user_id IS NOT NULL"
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched parties"));
    }

    return res.status(200).json(new ApiResponse(200, [], "No parties found"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const getSinglePartyDetails = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError());
    }
    const { rows } = await client.query("SELECT * FROM party WHERE id = $1", [
      id,
    ]);

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully fetched party"));
    }

    return res.status(400).json(new ApiError(400, "No party found"));
  } catch (error) {
    return res
      .status(error.statusCode)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const addParty = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { error } = addOrUpdateParty.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((err) => err.message);
      throw new ApiError(400, "Validation failed", errors);
    }

    const {
      name,
      address,
      phone_no,
      state,
      city,
      pincode,
      country,
      contact_person,
      gst_no,
      pan_no,
      gst_type,
      discount,
      outlet_assign,
      source,
      additional_phone_no,
      email,
      user_id,
      additional_rate,
    } = req.body;

    let outletAssign;

    if (outlet_assign === true) {
      outletAssign = 1;
    } else {
      outletAssign = 0;
    }

    const sales_person = user_id;
    const partyExist = await client.query(
      "SELECT name FROM party WHERE name = $1 AND user_id = $2",
      [name, sales_person]
    );

    if (partyExist.rows && partyExist.rows.length) {
      return res
        .status(400)
        .json(
          new ApiError(400, "Party Already Exists", { alreadyExists: true })
        );
    }

    const { rows } = await client.query(
      "INSERT INTO party (name, address, email, phone_no, state, city, pincode, country, contact_person, gst_no, pan_no, gst_type, discount, outlet_assign, source, additional_phone_no, additional_rate, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *",
      [
        name,
        address,
        email,
        phone_no,
        state,
        city,
        pincode,
        country,
        contact_person,
        gst_no,
        pan_no,
        gst_type,
        discount,
        outletAssign,
        source,
        additional_phone_no,
        additional_rate,
        sales_person,
      ]
    );

    if (rows.length) {
      // activityLogger({
      //   user_id: req.user.id,
      //   module: "PARTY",
      //   operation: "CREATE",
      //   description: `${req.user.name} added party ${name}`,
      // });
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully added party"));
    }

    return res
      .status(400)
      .json(new ApiError(400, "Failed to add party", error));
  } catch (error) {
    console.log("Error: ", error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message, error));
  } finally {
    await client.release();
  }
});

const deleteParty = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Party id is required"));
    }

    const { rows } = await client.query(
      "UPDATE party SET user_id = null WHERE user_id = $1 RETURNING *",
      [id]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully deleted party"));
    }

    return res.status(400).json(new ApiError(400, "Failed to delete party"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

const updateParty = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Party id is required"));
    }

    const { error } = addOrUpdateParty.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((err) => err.message);
      throw new ApiError(400, "Validation failed", errors);
    }

    const {
      name,
      address,
      phone_no,
      state,
      city,
      pincode,
      country,
      contact_person,
      gst_no,
      pan_no,
      gst_type,
      discount,
      outlet_assign,
      source,
      additional_phone_no,
      email,
      user_id,
      additional_rate,
    } = req.body;

    let outletAssign;
    if (outlet_assign === true) {
      outletAssign = 1;
    } else {
      outletAssign = 0;
    }

    const oldParty = await client.query("SELECT * FROM party WHERE id = $1", [
      id,
    ]);

    const { rows } = await client.query(
      "UPDATE party SET user_id = $1, name = $2, address = $3, email = $4, phone_no = $5, state = $6, city = $7, pincode = $8, country = $9, contact_person = $10, gst_no = $11, pan_no = $12, gst_type = $13, discount = $14, outlet_assign = $15, source = $16, additional_phone_no = $17, additional_rate = $18  WHERE id = $19 RETURNING *",
      [
        user_id,
        name,
        address,
        email,
        phone_no,
        state,
        city,
        pincode,
        country,
        contact_person,
        gst_no,
        pan_no,
        gst_type,
        discount,
        outletAssign,
        source,
        additional_phone_no,
        additional_rate,
        id,
      ]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully updated party"));
    }

    return res.status(400).json(new ApiError(400, "Failed to update party"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message, error?.errors));
  } finally {
    await client.release();
  }
});

// update status of party
const updateStatusOfParty = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { isactive } = req.body;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Party id is required"));
    }

    const { rows } = await client.query(
      "UPDATE party SET isactive = $1 WHERE id = $2 RETURNING *",
      [isactive, id]
    );
    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Successfully updated party status"));
    }

    return res
      .status(400)
      .json(
        new ApiError(400, "Failed to update party status", { notFound: true })
      );
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode, error.message));
  } finally {
    await client.release();
  }
});

//Article apis
const addArticle = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      category_id,
      subcategory_id,
      series_id,
      article_number,
      style_description,
      brand_id,
      fabric_name,
      fabric_composition,
    } = req.body;
    const { error } = addOrUpdateArticle.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((err) => err.message);
      throw new ApiError(400, "Validation failed", errors);
    }

    const articleExist = await client.query(
      "SELECT * FROM ARTICLES WHERE article_number = $1",
      [article_number]
    );

    if (articleExist.rows && articleExist.rows.length) {
      throw new ApiError(400, "Article already exists", {
        alreadyExists: true,
      });
    }

    const { rows } = await client.query(
      "INSERT INTO ARTICLES (ARTICLE_NUMBER, CATEGORY_ID, SUBCATEGORY_ID, SERIES_ID, STYLE_DESCRIPTION, BRAND_ID, FABRIC_NAME, FABRIC_COMPOSITION) " +
        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        article_number,
        category_id,
        subcategory_id,
        series_id,
        style_description,
        brand_id,
        fabric_name,
        fabric_composition,
      ]
    );

    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows[0], "Successfully added article"));
    }

    return res.status(400).json(new ApiResponse(400, "Failed to add article"));
  } catch (error) {
    console.log("error catch ", error.message);
    return res
      .status(500)
      .json({
        message: "error in api catch",
        cause: error.message,
        stack: error.stack,
      });
  } finally {
    client.release();
  }
};

// Fetch articles

const fetchArticles = async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      "SELECT articles.id as articleId, articles.CATEGORY_ID, articles.ARTICLE_NUMBER, articles.STYLE_DESCRIPTION, articles.SUBCATEGORY_ID, articles.BRAND_ID, articles.SERIES_ID, " +
        "category.name AS category_name, subcategory.name AS subcategory_name, brand.name AS brand_name " +
        "FROM articles " +
        "INNER JOIN category ON articles.CATEGORY_ID = category.id " +
        "INNER JOIN brand ON articles.BRAND_ID = brand.id " +
        "INNER JOIN subcategory ON articles.SUBCATEGORY_ID = subcategory.id"
    );
    if (rows.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, rows, "Articles fetched successfully"));
    }
    return res.status(200).json(new ApiResponse(200, [], "No Articles found"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  } finally {
    client.release();
  }
};

//Delete article
const deleteArticle = async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }
    const deletequery = "DELETE FROM ARTICLES WHERE ID = $1";

    const { rows } = await client.query(deletequery, [id]);
    if (rows) {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Article deleted succesfully"));
    }
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error in deleting api", error.message));
  }
};

//Single article
const getSingleArticle = async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  try {
    if (!id) {
      return res
        .status(404)
        .json(new ApiError(404, "Article not found by this id"));
    }

    const singleArticleQuery = `
      SELECT 
        articles.id AS articleId, 
        articles.CATEGORY_ID, 
        articles.ARTICLE_NUMBER, 
        articles.STYLE_DESCRIPTION, 
        articles.SUBCATEGORY_ID, 
        articles.BRAND_ID, 
        articles.SERIES_ID, 
        category.name AS category_name, 
        subcategory.name AS subcategory_name, 
        brand.name AS brand_name, 
        articles.fabric_name AS fabric_name, 
        articles.fabric_composition AS fabric_composition
      FROM 
        articles 
      INNER JOIN 
        category ON articles.CATEGORY_ID = category.id 
      INNER JOIN 
        brand ON articles.BRAND_ID = brand.id 
      INNER JOIN 
        subcategory ON articles.SUBCATEGORY_ID = subcategory.id 
      WHERE 
        articles.ID = $1
    `;

    const { rows } = await client.query(singleArticleQuery, [id]);
    if (rows) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, { rows }, "Single article feteched success")
        );
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "No single articles found in DB"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

const updatearticle = async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  const {
    category_id,
    article_number,
    style_description,
    subcategory_id,
    brand_id,
    series_id,
    fabric_name,
    fabric_composition,
  } = req.body;

  if (!id) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Article not found by this id"));
  }
  try {
    const updatequery =
      "UPDATE ARTICLES SET CATEGORY_ID = $1, ARTICLE_NUMBER = $2, STYLE_DESCRIPTION = $3, SUBCATEGORY_ID=$4,BRAND_ID=$5,SERIES_ID=$6 ,FABRIC_NAME=$7, FABRIC_COMPOSITION=$8 WHERE ID = $9 RETURNING *";
    const values = [
      category_id,
      article_number,
      style_description,
      subcategory_id,
      brand_id,
      series_id,
      fabric_name,
      fabric_composition,
      id,
    ];
    const { rows } = await client.query(updatequery, values);
    if (rows) {
      return res.status(200).json(new ApiResponse(200, { rows }));
    }
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error in api", error.message));
  } finally {
    client.release();
  }
};

//Financial year
const getfinancialYear = async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT * FROM FINANCIAL_YEAR");

    if (rows.length > 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, "Years fetched successfully", rows));
    } else {
      return res.status(404).json(new ApiError(404, "No financial year found"));
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error in Financial year", error: error.message });
  } finally {
    client.release();
  }
};

const getPurchaseOrderNumber = async () => {
  const client = await pool.connect();
  try {
    const { rows: LatestfyID } = await client.query(
      "SELECT id, CONCAT(start_year, '-', end_year) AS currentFinancialYear FROM financial_year ORDER BY id DESC LIMIT 1"
    );
    console.log("latest ", LatestfyID);
    if (!LatestfyID.length) {
      throw new Error("No financial year found");
    }
    const { rows: purchaseNumber } = await client.query(
      "SELECT id, purchase_number, financial_year_id FROM purchase_number WHERE financial_year_id = $1 ORDER BY id DESC LIMIT 1",
      [LatestfyID[0].id]
    );
    console.log("fy year", purchaseNumber);
    if (purchaseNumber.length) {
      return {
        purchase_number_id: purchaseNumber[0].id,
        purchaseNumber: parseInt(purchaseNumber[0].purchase_number, 10) + 1,
        financial_year_id: purchaseNumber[0].financial_year_id,
        financial_year: LatestfyID[0].currentfinancialyear,
      };
    } else {
      return {
        purchaseNumber: 1,
        financial_year_id: LatestfyID[0].id,
        financial_year: LatestfyID[0].currentfinancialyear,
      };
    }
  } catch (error) {
    console.log("Failed to create PO number", error);
  } finally {
    client.release();
  }
};

//Adding in purchase number

const addPurchaseOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    let {
      po_number,
      Id,
      article_id,
      po_num_id,
      article_no_id,
      color,
      size,
      po_date,
      num_packs,
      size_ratio,
      remarks,
      vendor_id,
      workorder_id,
      workorder_date,
    } = req.body;

    // Handling empty strings or invalid values
    po_number = po_number === "" ? null : po_number;
    po_num_id = po_num_id === "" ? null : po_num_id;
    article_no_id = article_no_id === "" ? null : article_no_id;
    article_id = article_id === "" ? null : article_id;
    num_packs = num_packs === "" ? null : num_packs;
    workorder_id = isNaN(workorder_id) ? null : workorder_id;
    workorder_date = workorder_date === "" ? null : workorder_date;

    if (po_number === "ADD") {
      const Generated_po_num = await getPurchaseOrderNumber();

      if (Generated_po_num.error) {
        return res
          .status(500)
          .json({
            message: "Error fetching PO number",
            cause: Generated_po_num.error,
          });
      }

      const poNumber =
        Generated_po_num.purchaseNumber + "/" + Generated_po_num.financial_year;
      const rightPo = Generated_po_num.purchaseNumber;

      //INSERT INTO COLOR AND SIZE TABLE
      if (color && color.length) {
        color.map(async (color) => {
          await client.query(
            "INSERT INTO article_color (article_id, color_id, color_name) VALUES ($1, $2, $3) RETURNING *",
            [article_id, color.id, color.name]
          );
        });
      }

      const getRatio = size_ratio.split(",");
      if (size && size.length) {
        size.map(async (size, idx) => {
          await client.query(
            "INSERT INTO ARTICLE_SIZE (ARTICLE_ID,SIZE_ID,SIZE_NAME) VALUES ($1,$2,$3) RETURNING *",
            [article_id, size.id, size.name]
          );

          await client.query(
            "INSERT INTO ARTICLE_RATIO (ARTICLE_ID,ARTICLE_SIZE_ID,ARTICLE_RATIO) VALUES ($1,$2,$3) RETURNING *",
            [article_id, size.id, getRatio[idx]]
          );
        });
      }
      // Insert into purchase_number table
      const adQuery = `
        INSERT INTO purchase_number 
        (purchase_number, po_fy, financial_year_id, vendor_id, po_date, remarks) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
      `;
      const addParam = [
        rightPo,
        poNumber,
        Generated_po_num.financial_year_id,
        vendor_id,
        po_date,
        remarks,
      ];
      const { rows } = await client.query(adQuery, addParam);

      if (rows.length === 0) {
        return res
          .status(400)
          .json({ message: "Error inserting data into PO_number table" });
      }

      // Insert into purchase_order_details
      const { rows: po_details } = await client.query(
        `INSERT INTO purchase_order_details 
        (po_number_id, article_id, num_packs, size_ratio, work_order_status_id, work_order_date) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`,
        [
          rows[0].id,
          article_id,
          num_packs,
          size_ratio,
          workorder_id,
          workorder_date,
        ]
      );

      if (po_details.length === 0) {
        return res
          .status(400)
          .json({ message: "Error inserting data into PO_detail table" });
      }

      return res
        .status(200)
        .json({ message: "Successfully added data in pod", data: 200, rows });
    } else {
      //Update colors acc to artiles
      if (color && color.length) {
        color.map(async (color) => {
          await client.query(
            "DELETE FROM ARTICLE_COLOR WHERE ARTICLE_ID = $1",
            [article_id]
          );
          await client.query(
            "INSERT INTO article_color (article_id, color_id, color_name) VALUES ($1, $2, $3) RETURNING *",
            [article_id, color.id, color.name]
          );
        });
      }

      const getRatio = size_ratio.split(",");

      if (size && size.length) {
        size.map(async (size, idx) => {
          await client.query("DELETE FROM ARTICLE_size WHERE ARTICLE_ID = $1", [
            article_id,
          ]);
          await client.query(
            "INSERT INTO ARTICLE_SIZE (ARTICLE_ID,SIZE_ID,SIZE_NAME) VALUES ($1,$2,$3) RETURNING *",
            [article_id, size.id, size.name]
          );
        });
      }
      if (size_ratio && size_ratio.length) {
        size.map(async (s_ratio, idx) => {
          await client.query(
            "DELETE FROM ARTICLE_ratio WHERE ARTICLE_ID = $1",
            [article_id]
          );
          await client.query(
            "INSERT INTO ARTICLE_RATIO (ARTICLE_ID,ARTICLE_SIZE_ID,ARTICLE_RATIO) VALUES ($1,$2,$3) RETURNING *",
            [article_id, s_ratio.id, getRatio[idx]]
          );
        });
      }
      const { rows: currentPO } = await client.query(
        "SELECT * FROM purchase_number ORDER BY id DESC LIMIT 1"
      );
      if (Id) {
        const { rows: byPODid } = await client.query(
          "SELECT id,po_number_id,article_id FROM PURCHASE_ORDER_DETAILS WHERE ID = $1 AND ARTICLE_ID = $2",
          [Id, article_id]
        );
        if (byPODid.length > 0) {
          const { rows: directUpdate } = await client.query(
            "UPDATE purchase_order_details SET num_packs = $1, size_ratio = $2 WHERE id = $3 RETURNING po_number_id as id",
            [num_packs, size_ratio, Id]
          );
          if (directUpdate.length > 0) {
            return res
              .status(200)
              .json({ message: "Successfully added data in pod", data: 200, rows:directUpdate });
          }
        } else {
          const { rows: existingArticle } = await client.query(
            "SELECT ID , ARTICLE_ID FROM PURCHASE_ORDER_DETAILS WHERE PO_NUMBER_ID = $1 AND ARTICLE_ID = $2",
            [Id, article_id]
          );

          if (existingArticle.length > 0) {
            const { rows: PODid } = await client.query(
              "SELECT ID FROM purchase_order_details WHERE PO_NUMBER_ID = $1 AND ARTICLE_ID = $2",
              [Id, article_id]
            );

            const id = PODid[0].id;

            const { rows: updatePO } = await client.query(
              "UPDATE purchase_order_details SET num_packs = $1, size_ratio = $2 WHERE id = $3 RETURNING *",
              [num_packs, size_ratio, id]
            );

            if (updatePO.length > 0) {
              return res
                .status(200)
                .json(new ApiResponse(200, updatePO, "Data Updated success"));
            }
          }
        }
      }
      const { rows } = await client.query(
        `WITH inserted AS (
  INSERT INTO purchase_order_details
    (po_number_id, article_id, num_packs, work_order_status_id, work_order_date, size_ratio)
  VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT (po_number_id, article_id)
  DO UPDATE SET
    num_packs = EXCLUDED.num_packs,
    size_ratio = EXCLUDED.size_ratio
  RETURNING po_number_id AS id
)
SELECT 
  i.id, 
  pn.po_fy
FROM inserted i
JOIN purchase_number pn ON pn.id = i.id`,
        [
          currentPO[0].id,
          article_id,
          num_packs,
          workorder_id,
          workorder_date,
          size_ratio,
        ]
      );

      if (rows.length === 0) {
        return res
          .status(400)
          .json({ message: "Error inserting data into PO_detail table" });
      }

      return res
        .status(200)
        .json({ message: "Successfully added data ", data: 200, rows });
    }
  } catch (error) {
    console.error("This is error", error);
    return res
      .status(500)
      .json({ message: "Error in API", cause: error.message });
  } finally {
    client.release();
  }
};

const editPODtable = async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  try {
    if (id) {
      const { rows: editPODelem } = await client.query(
        "SELECT ID,PO_NUMBER_ID,ARTICLE_ID ,NUM_PACKS,SIZE_RATIO FROM PURCHASE_ORDER_DETAILS WHERE ID = $1 RETURNING *",
        [id]
      );
      console.log("from pod table ", editPODelem);
      if (editPODelem.length > 0) {
        const { rows: edited } = await client.query(
          "UPDATE PURCHASE_ORDER_DETAILS SET NUM_PACKS = $1, SIZE_RATIO = $2 WHERE ID = $3",
          [num_packs, size_ratio, id]
        );
        if (edited.length > 0) {
          return res
            .statusCode(200)
            .ApiResponse(200, "Successfully updated From pod table", {
              data: rows,
            });
        }
        return res
          .statusCode(400)
          .ApiError(400, "Element for this id not found");
      }
      return res.statusCode(404).ApiError(404, "Not found by this id");
    } else {
      return res.statusCode(404).ApiError(404, "Id not found");
    }
  } catch (error) {
    return res
      .statusCode(500)
      .ApiError(500, "Error in catch blk", { cause: error.message });
  } finally {
    client.release();
  }
};

const getPurchaseOrderList = async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  try {
    const { rows } = await client.query(`
      SELECT 
      po_fy,
      po_date, 
      purchase_order_details.id,
      po_number_id, 
      purchase_number,
      num_packs, 
      name AS v_name, 
      vendor.id AS v_id
      FROM 
        purchase_number 
      JOIN 
        purchase_order_details ON purchase_number.id = purchase_order_details.po_number_id
      JOIN 
        vendor ON purchase_number.vendor_id = vendor.id
    `);

    if (rows.length > 0) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Purchase number table fetched successfully",
            rows
          )
        );
    } else {
      return res
        .status(404)
        .json(new ApiResponse(404, "No data found in purchase number table"));
    }
  } catch (error) {
    console.error("Error in getPurchaseOrderList:", error);
    return res
      .status(500)
      .json({
        message: "Error fetching purchase order list",
        error: error.message,
      });
  } finally {
    client.release();
  }
};

const getPurchaseNumberTable = async (req, res) => {
  const client = await pool.connect();
  try {
    const query = `
    WITH split_values AS (
      SELECT 
        po_number_id,
        unnest(string_to_array(NUM_PACKS, ','))::INTEGER AS value
      FROM 
        purchase_order_details
    )
    SELECT 
      pn.id,
      pn.purchase_number AS purchase_number_id,
      pn.po_fy,
      pn.po_date,
      v.name AS vendor_name,
      COALESCE(SUM(sv.value), 0) AS total_num_packs
    FROM 
      purchase_number pn
    JOIN 
      vendor v ON pn.vendor_id = v.id
    LEFT JOIN
      (SELECT po_number_id, SUM(value) AS value FROM split_values GROUP BY po_number_id) sv 
    ON pn.id = sv.po_number_id
    GROUP BY
      pn.id, pn.po_fy, v.name
    ORDER BY
      pn.id;
    `;

    const { rows: Table } = await client.query(query);
    if (Table.length > 0) {
      return res
        .status(200)
        .json({ message: "P_number Table fetched", Data: Table });
    }
    return res.status(500).json({ message: "Error in fetching table " });
  } catch (error) {
    return res.status(500).json({ message: "Error in api gone in catch" });
  }
};
//Delete frm POD table
const deletePurchaseOrder = async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  console.log("del id", id);
  try {
    const { rows: getId } = await client.query(
      "SELECT ARTICLE_ID FROM PURCHASE_ORDER_DETAILS WHERE ID = $1",
      [id]
    );
    const articleId = getId[0].article_id;
    console.log(getId);
    const { rows: delCol } = await client.query(
      "DELETE FROM ARTICLE_COLOR WHERE ARTICLE_ID = $1",
      [articleId]
    );

    const { rows: delSize } = await client.query(
      "DELETE FROM ARTICLE_SIZE WHERE ARTICLE_ID = $1",
      [articleId]
    );

    const { rows: delRatio } = await client.query(
      "DELETE FROM ARTICLE_RATIO WHERE ARTICLE_ID = $1",
      [articleId]
    );

    const { rows } = await client.query(
      "DELETE FROM PURCHASE_ORDER_DETAILS WHERE id = $1 RETURNING *",
      [id]
    );
    if (rows.length > 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, "Deleted successfully", rows));
    } else {
      return res
        .status(400)
        .json(new ApiResponse(400, "Error in deleting api"));
    }
    // if(rows.length > 0){
    //   const deletequery = 'DELETE FROM PURCHASE_NUMBER WHERE ID = $1 RETURNING *'
    //   const deleteParams = [id]

    //   try{
    //     const {rows} = await client.query(deletequery,deleteParams)
    //   if(rows.length > 0){
    //     return res.status(200).json(new ApiResponse(200,rows,'PO deleted successfully'))
    //   }else{
    //     return res.status(400).json(new ApiError(400,'Cant delete PO'))
    //   }}catch(error){
    //     return res.status(500).json(new ApiError(500,'Error in delete api',error.message))
    //   }
    // }else{
    //   return res.status(400).json(new ApiError(400,'PO number not found by this ID'))
    // }
  } catch (error) {
    console.log("Error");
    return (
      res.status(500),
      json(new ApiError(500, "Error in delete api", error.message))
    );
  }
};

//DELETE WHOLE PURCHASE NUMBER

const deletePoNumber = async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  console.log("PO Number ID:", id);

  try {

    const { rows: deleteColor } = await client.query(
      "DELETE FROM ARTICLE_COLOR WHERE ARTICLE_ID IN (SELECT ARTICLE_ID FROM PURCHASE_ORDER_DETAILS WHERE PO_NUMBER_ID = $1)",
      [id]
    );
    
    const { rows: deleteSize } = await client.query(
      "DELETE FROM ARTICLE_SIZE WHERE ARTICLE_ID IN (SELECT ARTICLE_ID FROM PURCHASE_ORDER_DETAILS WHERE PO_NUMBER_ID = $1)",
      [id]
    );
    const { rows: deleteRatio } = await client.query(
      "DELETE FROM ARTICLE_RATIO WHERE ARTICLE_ID IN (SELECT ARTICLE_ID FROM PURCHASE_ORDER_DETAILS WHERE PO_NUMBER_ID = $1)",
      [id]
    );
    // Delete from PURCHASE_ORDER_DETAILS first
    const {rows:deletePOD} = await client.query(
      "DELETE FROM PURCHASE_ORDER_DETAILS WHERE PO_NUMBER_ID = $1",
      [id]
    );

    if(deletePOD)
    if (deletePOD.rowCount > 0) {
      // Now delete from PURCHASE_NUMBER
      const deleteQ = await client.query(
        "DELETE FROM PURCHASE_NUMBER WHERE ID = $1 RETURNING *",
        [id]
      );

      if (deleteQ.rowCount > 0) {
        return res
          .status(200)
          .json(
            new ApiResponse(200, {
              message: "Deleted successfully",
              data: deleteQ.rows,
            })
          );
      }
    } else {
      const deleteQ = await client.query(
        "DELETE FROM PURCHASE_NUMBER WHERE ID = $1 RETURNING *",
        [id]
      );

      if (deleteQ.rowCount > 0) {
        return res
          .status(200)
          .json(
            new ApiResponse(200, {
              message: "Deleted successfully",
              data: deleteQ.rows,
            })
          );
      }
    }

    return res
      .status(400)
      .json(new ApiResponse(400, { message: "PO not found by this ID" }));
  } catch (error) {
    console.error("Error in deletePoNumber:", error.message);
    return res
      .status(500)
      .json(new ApiError(500, "Error in deleting PO Number", error.message));
  } finally {
    client.release();
  }
};

//VENDORS FETCH
const fetchvendors = async (req, res) => {
  const client = await pool.connect();
  const fetchQuery = "SELECT * FROM VENDOR";
  try {
    const { rows } = await client.query(fetchQuery);
    if (rows.length > 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, "Vendors fetched success", rows));
    }
    return res.status(400).json(new ApiError(400, "No vendors found"));
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error in vendor api", cause: error.message });
  } finally {
    await client.release();
  }
};

const fetchSinglePo = async (req, res) => {
  const { id } = req.params;
  console.log("Fetching PO with ID:", id);

  const client = await pool.connect();

  try {
    // Fetch from purchase_order_details to check if ID exists
    const { rows: fetchFromPOD } = await client.query(
      "SELECT * FROM purchase_order_details WHERE id = $1",
      [id]
    );

    console.log("POD Data:", fetchFromPOD);

    if (fetchFromPOD.length > 0) {
      // Fetch detailed PO data with joined tables
      const { rows: podData } = await client.query(
        `
        SELECT 
          PURCHASE_NUMBER.PURCHASE_NUMBER,
          PURCHASE_NUMBER.PO_FY,
          PURCHASE_NUMBER.VENDOR_ID,
          PURCHASE_NUMBER.PO_DATE,
          PURCHASE_NUMBER.REMARKS,
          PURCHASE_ORDER_DETAILS.WORK_ORDER_STATUS_ID,
          PURCHASE_ORDER_DETAILS.WORK_ORDER_DATE,
          ARTICLES.ID AS articleID,
          ARTICLES.ARTICLE_NUMBER AS ARTICLE_NUM,
          STRING_AGG(DISTINCT ARTICLE_COLOR.COLOR_ID::TEXT, ',') AS COLOR_IDS,
          STRING_AGG(DISTINCT ARTICLE_COLOR.COLOR_NAME, ',') AS COLOR_NAMES,
          STRING_AGG(DISTINCT ARTICLE_SIZE.SIZE_ID::TEXT, ',') AS SIZE_IDS,
          STRING_AGG(DISTINCT ARTICLE_SIZE.SIZE_NAME, ',') AS SIZE_NAMES,
          STRING_AGG(DISTINCT PURCHASE_ORDER_DETAILS.NUM_PACKS, ',') AS NUM_PACKS,
          STRING_AGG(DISTINCT ARTICLE_RATIO.ARTICLE_RATIO::TEXT, ',') AS ARTICLE_RATIOS
        FROM PURCHASE_ORDER_DETAILS
        JOIN PURCHASE_NUMBER 
          ON PURCHASE_ORDER_DETAILS.PO_NUMBER_ID = PURCHASE_NUMBER.ID
        JOIN ARTICLES 
          ON PURCHASE_ORDER_DETAILS.ARTICLE_ID = ARTICLES.ID
        JOIN ARTICLE_COLOR 
          ON ARTICLES.ID = ARTICLE_COLOR.ARTICLE_ID
        JOIN ARTICLE_SIZE 
          ON ARTICLES.ID = ARTICLE_SIZE.ARTICLE_ID
        JOIN ARTICLE_RATIO 
          ON ARTICLES.ID = ARTICLE_RATIO.ARTICLE_ID
        WHERE PURCHASE_ORDER_DETAILS.ID = $1
        GROUP BY 
          PURCHASE_NUMBER.PURCHASE_NUMBER,
          PURCHASE_NUMBER.PO_FY,
          PURCHASE_NUMBER.VENDOR_ID,
          PURCHASE_NUMBER.PO_DATE,
          PURCHASE_NUMBER.REMARKS,
          ARTICLES.ID,
          PURCHASE_ORDER_DETAILS.WORK_ORDER_STATUS_ID,
          PURCHASE_ORDER_DETAILS.WORK_ORDER_DATE,
          ARTICLES.ARTICLE_NUMBER;
        `,
        [id]
      );
      console.log('details',podData);
      if (podData.length > 0) {
        // Format response for frontend
        const formattedData = podData.map((row) => ({
          purchase_number: row.purchase_number,
          po_fy: row.po_fy,
          vendor_id: row.vendor_id,
          po_date: row.po_date,
          remarks: row.remarks,
          article_id: row.articleid,
          article_number: row.article_num,
          workorder_id:row.work_order_status_id,
         workorder_date:row.work_order_date,
          color: row.color_ids
            ? row.color_ids.split(",").map((id, index) => ({
                id: parseInt(id, 10),
                name: row.color_names.split(",")[index] || "",
              }))
            : [],
          size: row.size_ids
            ? row.size_ids.split(",").map((id, index) => ({
                id: parseInt(id, 10),
                name: row.size_names.split(",")[index] || "",
              }))
            : [],
          num_packs: row.num_packs ? row.num_packs.split(",").map(Number) : [],
          article_ratios: row.article_ratios
            ? row.article_ratios.split(",").join(",")
            : "",
        }));

        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              "Successfully fetched single POD item",
              formattedData[0]
            )
          );
      }
    }

    // If no matching POD found, fetch basic PO details
    const fetchQuery =
      "SELECT PURCHASE_NUMBER, PO_FY, PO_DATE, REMARKS, VENDOR_ID FROM PURCHASE_NUMBER WHERE id = $1";
    const { rows } = await client.query(fetchQuery, [id]);

    if (rows.length > 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, "Single PO fetched successfully", rows[0]));
    } else {
      return res
        .status(400)
        .json(new ApiError(400, "No PO found with this ID"));
    }
  } catch (error) {
    console.error("Error in fetchSinglePo:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Error fetching single PO", error.message));
  } finally {
    client.release();
  }
};

const fetchPO_details = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  const query = `
      SELECT 
        PURCHASE_ORDER_DETAILS.id as id,
        CATEGORY.NAME AS CATEGORY_NAME,
        SUBCATEGORY.NAME AS SUBCATEGORY_NAME,
        VENDOR.NAME AS VENDOR_NAME,
        ARTICLES.ARTICLE_NUMBER,
        ARTICLES.SERIES_ID AS SERIAL,
        NUM_PACKS AS PIECES,
      BRAND.NAME AS BRAND_NAME
      FROM PURCHASE_ORDER_DETAILS
      JOIN ARTICLES ON PURCHASE_ORDER_DETAILS.ARTICLE_ID = ARTICLES.ID
      JOIN CATEGORY ON ARTICLES.CATEGORY_ID = CATEGORY.ID
      JOIN SUBCATEGORY ON ARTICLES.SUBCATEGORY_ID = SUBCATEGORY.ID
      JOIN PURCHASE_NUMBER ON PURCHASE_ORDER_DETAILS.PO_NUMBER_ID = PURCHASE_NUMBER.ID
      JOIN VENDOR ON PURCHASE_NUMBER.VENDOR_ID = VENDOR.ID
      JOIN BRAND ON ARTICLES.BRAND_ID = BRAND.ID
      WHERE PURCHASE_NUMBER.ID = $1;
    `;

  try {
    const { rows } = await client.query(query, [id]);
    console.log("id", id);
    if (rows.length > 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, "POD table fetched successfully", rows));
    } else {
      return res
        .status(400)
        .json(new ApiResponse(400, "Exception case"));
    }
  } catch (error) {
    console.log("err", error);
    return res.status(500).json(new ApiError(500, "Error in api catch block"));
  } finally {
    client.release();
  }
};

module.exports = {
  getSalesPersons,
  getCategoryList,
  getSingleCategoryDetails,
  addCategory,
  deleteCategory,
  updateCategory,
  updateMobileStatus,
  getSubCategoryList,
  getSubcatOfCategory,
  getSingleSubCategoryDetails,
  addSubCategory,
  deleteSubCategory,
  updateSubCategory,
  getWorkOrderList,
  getSingleWorkOrderDetails,
  addWorkOrder,
  deleteWorkOrder,
  updateWorkOrder,
  getRangeSeriesList,
  getSingleRangeSeriesDetails,
  addRangeSeries,
  deleteRangeSeries,
  updateRangeSeries,
  getBrandList,
  getSingleBrandDetails,
  addBrand,
  deleteBrand,
  updateBrand,
  getColorList,
  getSingleColorDetails,
  addColor,
  deleteColor,
  updateColor,
  getSizeList,
  getSingleSizeDetails,
  addSize,
  deleteSize,
  updateSize,
  getVendorList,
  getSingleVendorDetails,
  addVendor,
  deleteVendor,
  updateVendor,
  getUserRoleList,
  addUserRole,
  updateUserRole,
  deleteUserRole,
  getUserList,
  addUser,
  updateUser,
  deleteUser,
  getSingleUserDetails,
  getPurchaseOrderList,
  addParty,
  deleteParty,
  getSinglePartyDetails,
  getPartyList,
  updateParty,
  updateStatusOfParty,

  addArticle,
  fetchArticles,
  deleteArticle,
  getSingleArticle,
  updatearticle,
  addPurchaseOrder,
  getfinancialYear,
  fetchvendors,
  getPurchaseOrderNumber,
  deletePurchaseOrder,
  fetchSinglePo,
  fetchPO_details,
  getPurchaseNumberTable,
  deletePoNumber,
  editPODtable,
};
