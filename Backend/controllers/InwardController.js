const { pool } = require("../db/dbConnect");
const { asyncHandler, ApiError, ApiResponse } = require("../utils");

const generateGrnNo = async()=>{
      const client = await pool.connect()
      try{
        const {rows:finyear} = 'SELECT ID, CONCAT(START_YEAR,'-',END_YEAR) AS CURRENT_FINYEAR FROM FINANCIAL_YEAR ORDER BY DESC LIMIT 1'
      const { rows: inwardgrn } = await client.query(
        "SELECT id, grn, financial_year_id FROM inward_grn WHERE financial_year_id = $1 ORDER BY id DESC LIMIT 1",
        [finyear[0]?.id]
      );
      if(finyear.length){
        return {
            inward_grn_no_id : finyear[0].id,
            inward_grn : finyear[0].grn + 1,
            financial_year_id : finyear[0].financial_year_id,
            financial_year : finyear[0].finyear,
        }
      }else{
        return{
            inward_grn : 1,
            financial_year_id : finyear[0].financial_year_id,
            financial_year : finyear[0].finyear,
        }
      }
    }catch(error){
        console.log('Error in generating GRN no');
    }finally{
        await client.release()
    }
}

//ADDING INWARD

const addInward = async(req,res)=>{
    const client = await pool.connect()
    try{
        const {
            grn_number,
            inward_date,
            remarks,
            vendor_id,
            article_id,
            po_id,
            color_list,
            size_list,
            ratio,
            stock_ratio_mobile,
            weight,
            num_packs,
          } = req.body;
          const grnDetails = await generateGrnNo()
          const grnNumber = grnDetails.grn_number +"/"+grnDetails.financial_year;
          await client.query('BEGIN')
          
    }catch(error){

    }finally{
        client.release()
    }
}
//FETCH ARTICLE DETAILS
const fetchArticleDetails = async(req,res)=>{
  const client = await pool.connect()
  const {id} = req.params
  try{
    const {rows:articleDetails} = await client.query(

      `
        SELECT 
        A.ID AS ARTICLE_ID, A.ARTICLE_NUMBER,
        PN.PO_FY, PN.ID AS PN_ID, POD.NUM_PACKS,
        C.COLORFLAG, V.NAME AS VENDOR_NAME,
        A.Style_Description, B.Name AS BRAND_NAME,
        C.name AS CATEGORY_NAME, RS.Series, SC.NAME AS SUB_CAT_NAME
        FROM ARTICLES A
        LEFT JOIN PURCHASE_ORDER_DETAILS POD ON POD.ARTICLE_ID = A.ID
        LEFT JOIN CATEGORY C ON C.ID = A.CATEGORY_ID
        LEFT JOIN PURCHASE_NUMBER PN ON PN.ID = POD.PO_NUMBER_ID
        LEFT JOIN BRAND B ON B.ID = A.BRAND_ID
        LEFT JOIN SUBCATEGORY SC ON SC.ID = A.SUBCATEGORY_ID
        LEFT JOIN RANGESERIES RS ON RS.ID = A.SERIES_ID  
        LEFT JOIN VENDOR V ON V.ID = PN.VENDOR_ID
        WHERE A.ID = $1;
      `,[id]
    )
    if(!id || id === undefined){
      return res.status(400).ApiError(400,"Article Id not found")
    }
    if(articleDetails.length > 0){
      return res.status(200).json(new ApiResponse(200,articleDetails,'Article details success'))
    }else{
      return res.status(400).json(new ApiError(400,articleDetails,"No data found by this Article_id"))
    }
  }catch(error){
    
      return res.status(500).json(new ApiResponse(500,error.error,"Error in fetch article Api"))
  }finally{
     await client.release()
  }
}
//Add Inward 
const AddInward= async(req,res)=>{
    const client = await pool.connect()
    const {
      grn_number,
      inward_date,
      remarks,
      vendor_id,
      article_id,
      po_id,
      color_list,
      size_list,
      ratio,
      stock_ratio_mobile,
      weight,
      num_packs,
    } = req.body;
      
    const {rows:addInward} = await client.query('')
}


module.exports = {
  fetchArticleDetails
}