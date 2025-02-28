const joi = require("joi");

const addOrUpdateCategorySchema = joi.object({
  name: joi.string().required().trim().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),

  colorflag: joi.number().integer().required().messages({
    "number.base": "Colorflag must be a number",
    "any.required": "Colorflag is required",
  }),

  article_open_flag: joi.number().integer().required().messages({
    "number.base": "Article open flag must be a number",
    "any.required": "Article open flag is required",
  }),

  image: joi.string().allow("", null).optional().messages({
    "string.base": "Image must be a string",
  }),

  isactive: joi.number().integer().required().messages({
    "number.base": "Isactive must be a number",
    "any.required": "Isactive is required",
  }),

  mobile_status: joi.number().integer().required().messages({
    "number.base": "Mobile status must be a number",
    "any.required": "Mobile status is required",
  }),
});

const addOrUpdateParty = joi.object({
  name: joi.string().trim().required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
  address: joi.string().trim().required().messages({
    "string.empty": "Address is required",
    "any.required": "Address is required",
  }),
  email: joi.string().email().required().messages({
    "string.email": "Please enter a valid email",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  phone_no: joi.string().pattern(/^[0-9]{10}$/).required().messages({
    "string.empty": "Phone no is required",
    "string.pattern.base": "Phone no must be 10 digits",
    "any.required": "Phone no is required",
  }),
  additional_phone_no: joi.string().optional().allow(null,"").messages({
    "string.empty": "Phone no is required",
    "string.pattern.base": "Phone no must be 10 digits",
    "any.required": "Phone no is required",
  }),
  contact_person: joi.string().required().trim().messages({
    "string.empty": "Contact person cannot be empty",
    "any.required": "Contact person is required",
  }),
  discount: joi.number().required().messages({
    "string.empty": "discount person cannot be empty",
    "any.required": "discount person is required",
  }),
  state: joi.string().required().trim().messages({
    "string.empty": "State cannot be empty",
    "any.required": "State cannot be empty",
  }),
  pan_no: joi.string().allow(null,"").messages({
    "string.empty": "pan_no cannot be empty",
    "any.required": "pan_no cannot be empty",
  }),
  additional_rate: joi.string().optional().allow(null, '').messages({
    "string.base": "Additional rate must be a string",
  }),
  city: joi.string().required().trim().messages({
    "string.empty": "City cannot be empty",
    "any.required": "City cannot be empty",
  }),
  outlet_assign: joi.alternatives().try(
    joi.boolean(),
    joi.number()
  ).messages({
    "alternatives.match": "outlet must be a boolean or a number",
    "any.required": "outlet cannot be empty",
  }),
  pincode: joi.string().required().pattern(/^[1-9][0-9]{5}$/).messages({
    "string.empty": "Pincode cannot be empty",
    "string.pattern.base": "Pincode must be a valid 6-digit number",
    "any.required": "Pincode cannot be empty",
  }),
  country: joi.string().trim().required().messages({
    "string.empty": "Country cannot be empty",
    "any.required": "Country cannot be empty",
  }),
  gst_no: joi.string().allow(null,'')
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/)
    .messages({
      "string.pattern.base": "Enter a valid GST number",
      "string.empty": "GST number cannot be empty",
      "any.required": "GST number cannot be empty",
    }),
    gst_type: joi.string().valid("GST", "IGST").default("GST").required().messages({
      "string.empty": "gst_type can't be empty",
      "any.required": "gst_type can't be empty",
      "string.valid": "gst_type must be either 'GST' or 'IGST'",
    }),
    user_id: joi.alternatives()
    .try(joi.string(), joi.number())
    .required()
    .messages({
      "alternatives.types": "Sales person must be a string or number",
      "any.required": "Sales person is required",
      "string.empty": "Sales person is required",
    }),
  source: joi.string().trim().messages({
    "string.empty": "Source cannot be empty",
    "any.required": "Source cannot be empty",
  }),
});

const addOrUpdateArticle = joi.object({
  article_number:joi.string().required().trim().empty().messages({
    "string.empty":"Article cant be empty",
    "string.base":"Article must be a string",
    "any.required":"Article is a must"
  }),
  category_id:joi.number().required().messages({
    "number.integer":"category must be a number",
    "any.required":"category is a must"
  }),
  subcategory_id:joi.number().required().messages({
    "number.integer":"subcategory must be a number",
    "any.required":"subcategory is a must"
  }),
  series_id:joi.number().required().messages({
    "number.integer":"series must be a number",
    "any.required":"series is a must"
  }),
  style_description:joi.string().trim().empty().required().messages({
    "string.empty":"style_description must be a string",
    "string.base":"style_description must be string",
    "any.required":"style_description is a must"
  }),
  brand_id:joi.number().required().messages({
    "number.integer":"brand must be a number",
    "number.base":"brand must be a number",
    "any.required":"brand is a must"
  }),
  fabric_name:joi.string().trim().empty().required().messages({
    "string.empty":"fabric name cant be empty",
    "any.required":"fabric name cant be empty"
  }),
  fabric_composition:joi.string().trim().empty().required().messages({
    "string.empty":"fabric description name cant be empty",
    "any.required":"fabric description name cant be empty"
  })
})

const addOrUpdatePO = joi.object({

  po_date:joi.date().required().messages({
    "date.base":"po_date must be in date format",
    "any.require":"po_date is a must",
    "date.require":"po_date cant be empty",
  }),
  purchase_number:joi.number().required().messages({
    "number.base":"purchase_number must be a number",
    "any.require":"purchase_number is must",
    "number.empty":"purchase_number cant be empty"
  }),
  user_id:joi.number().required().messages({
    "number.base":"user_id must be a number",
    "any.require":"user_id is must",
    "number.empty":"user_id cant be empty"
  }),
  vendor_id:joi.number().required().messages({
    "number.base":"vendor_id must be a number",
    "any.require":"vendor_id is must",
    "number.empty":"vendor_id cant be empty"
  }),
  financial_year_id:joi.number().required().messages({
    "number.base":"financial_year_id must be a string",
    "any.require":"financial_year_id is must",
    "number.empty":"financial_year_id cant be empty"
  }),
  remarks:joi.string().required().messages({
    "string.base":"remarks must be a string",
    "any.require":"remarks is must",
    "string.empty":"financial_year_id cant be empty"
  })
  
})

const addOrUpdateUser = joi.object({
  // Name validation
  role:joi.number().integer().valid(1,2,3,4,5,6,7,8,9,10,11,12,13).required().messages({
    "number.base": "Role must be a valid number",
    "number.integer": "Role must be an integer",
    "any.only": "Invalid role provided",
    "any.required": "Role is required",
  }),
  name: joi.string().required().trim().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
 
  email: joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  phone_no: joi
    .string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "any.required": "Phone number is required",
      "string.pattern.base": "Phone number must be exactly 10 digits",
    }),

  
  password: joi
    .string()
    .required()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .messages({
      "string.empty": "Password is required",
      "any.required": "Password is required",
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base":
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
  
  age: joi.number().integer().min(18).max(100).messages({
    "number.base": "Age must be a number",
    "number.min": "Age must be at least 18",
    "number.max": "Age must not exceed 100",
  }),


  address: joi.string().optional().max(200).messages({
    "string.max": "Address must not exceed 200 characters",
  }),
});


const addOrUpdateSubCategory = joi.object({
  category_id: joi.number().integer().required().messages({
    "number.base": "Category id must be a number",
    "any.required": "Category id is required",
  }),
  name: joi.string().required().trim().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
});

const addOrUpdateRangeSeries = joi.object({
  category_id: joi.number().integer().required().messages({
    "number.base": "Category id must be a number",
    "any.required": "Category id is required",
  }),
  subcategory_id: joi.number().integer().required().messages({
    "number.base": "Sub Category id must be a number",
    "any.required": "Sub Category id is required",
  }),
  series_name: joi.string().required().trim().messages({
    "string.empty": "Series Name is required",
    "any.required": "Series Name is required",
  }),
  series: joi.string().required().trim().messages({
    "string.empty": "Series is required",
    "any.required": "Series is required",
  }),
});

const addOrUpdateBrand = joi.object({
  name: joi.string().required().trim().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
  description: joi.string().required().trim().messages({
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),
});

const addOrUpdateVendor = joi.object({
  name: joi.string().required().trim().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
  address: joi.string().required().trim().messages({
    "string.empty": "Address is required",
    "any.required": "Address is required",
  }),
  phone_no: joi.string().required().trim().max(10).messages({
    "string.empty": "Phone no is required",
    "any.required": "Phone no is required",
    "string.max": "Maximum 10 characters allowed",
  }),
  contact_person: joi.string().required().trim().messages({
    "string.empty": "Contact person is required",
    "any.required": "Contact person is required",
  }),
  gst_no: joi.string().required().trim().messages({
    "string.empty": "GST Number  is required",
    "any.required": "GST Number is required",
  }),
});

module.exports = {
  addOrUpdateCategorySchema,
  addOrUpdateSubCategory,
  addOrUpdateRangeSeries,
  addOrUpdateBrand,
  addOrUpdateVendor,
  addOrUpdateUser,
  addOrUpdateParty,
  addOrUpdateArticle,
  addOrUpdatePO
};
