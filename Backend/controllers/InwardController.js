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