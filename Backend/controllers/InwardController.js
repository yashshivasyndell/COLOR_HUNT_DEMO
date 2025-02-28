const { cli } = require("winston/lib/winston/config");
const { pool } = require("../db/dbConnect");
const { asyncHandler, ApiError, ApiResponse } = require("../utils");
const { error } = require("winston");

const generateGrnNo = async () => {
  const client = await pool.connect();
  try {
    const { rows: finyear } =await client.query(
      `SELECT ID, CONCAT(START_YEAR, '-', END_YEAR) AS CURRENT_FINYEAR 
       FROM FINANCIAL_YEAR 
       ORDER BY ID DESC 
      LIMIT 1 `
    )
    const { rows: inwardgrn } = await client.query(
      "SELECT id, grn, financial_year_id FROM inward_grn WHERE financial_year_id = $1 ORDER BY id DESC LIMIT 1",
      [finyear[0]?.id]
    );
   
    if (inwardgrn.length) {
      return {
        inward_grn_no_id: inwardgrn[0].id,
        inward_grn: Number(inwardgrn[0].grn) + 1,
        financial_year_id: inwardgrn[0].financial_year_id,
        financial_year: finyear[0].current_finyear,
      };
    } else {
      return {
        inward_grn: 1,
        financial_year_id: finyear[0].id,
        financial_year: finyear[0].current_finyear,
      };
    }
  } catch (error) {
    console.log("Error in generating GRN no",error);
  } finally {
    await client.release();
  }
};

//ADDING INWARD
const addInward = async (req, res) => {
  const client = await pool.connect();
  try {
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
    
    //If add_inward is sent in payload add grn no
    if (grn_number === "Add_inward" && typeof grn_number === "string") {
      const { rows: articleInfo } = await client.query(
        "SELECT c.colorflag FROM articles a JOIN category c ON c.id = a.category_id WHERE a.id = $1",
        [article_id]
      );

      const grnDetails = await generateGrnNo();
      
      const grnNumber = grnDetails.inward_grn + "/" + grnDetails.financial_year;
      await client.query("BEGIN");

      const getRatio = ratio.split(",");
      //Colors
      if (color_list && color_list.length) {
        color_list.map(async (val) => {
          await client.query(
            "INSERT INTO INWARD_ARTICLE_COLOR (ARTICLE_ID,COLOR_ID,COLOR_NAME) VALUES ($1,$2,$3) RETURNING *",
            [article_id, val.id, val.name]
          );
        });
      }
      // Size and ratio
      if (size_list && size_list.length) {
        size_list.map(async (val, idx) => {
          await client.query(
            "INSERT INTO INWARD_ARTICLE_SIZE (ARTICLE_ID,SIZE_ID,SIZE_NAME) VALUES ($1,$2,$3) RETURNING *",
            [article_id, val.id, val.name]
          );
          await client.query(
            "INSERT INTO INWARD_ARTICLE_RATIO (ARTICLE_ID,ARTICLE_SIZE_ID,ARTICLE_RATIO) VALUES($1,$2,$3) RETURNING *",
            [article_id, val.id, getRatio[idx]]
          );
        });
      }

      const { rows: inwardGrn } = await client.query(
        "INSERT INTO INWARD_GRN (grn, financial_year_id, vendor_id,inward_date, remarks) VALUES ($1, $2, $3, $4, $5) RETURNING id, grn, financial_year_id",
        [
          grnDetails.inward_grn,
          grnDetails.financial_year_id,
          vendor_id,
          inward_date,
          remarks,
        ]
      );

      if (inwardGrn.length) {
        const { rows: inwardArticle } = await client.query(
          "INSERT INTO INWARD_ARTICLE (po_number_id, article_id) VALUES ($1, $2) RETURNING *",
          [po_id, article_id]
        );
      }
      //total set quantity calculation
      const rationSum = ratio
        .split(",")
        .reduce((acc, val) => acc + Number(val), 0);
      const packsSum = num_packs
        .split(",")
        .reduce((acc, val) => acc + Number(val), 0);
      const colorSum = color_list.length;

      let final_total_set_quantity = 0;
      if (articleInfo.length) {
        if (articleInfo[0].colorflag === 0) {
          final_total_set_quantity = packsSum * (rationSum * colorSum);
        } else {
          final_total_set_quantity = packsSum * rationSum;
        }
      }

      const { rows: inward } = await client.query(
        "INSERT INTO inward (inward_date, article_id, num_packs, inward_grn_id, weight, sales_num_packs,final_total_set_quantity,stock_ratio_mob) VALUES ($1, $2, $3, $4, $5, $6,$7,$8) RETURNING *",
        [
          inward_date,
          article_id,
          num_packs,
          inwardGrn[0].id,
          weight,
          num_packs,
          final_total_set_quantity,
          stock_ratio_mobile
        ]
      );
       
      if (inward.length) {
        await client.query("COMMIT");
        return res.status(200).json(
          new ApiResponse(
            200,
            {
              whole_iwnard_number: grnNumber,
              inward_grn_number: grnDetails.inward_grn,
              inward_grn_number_id: inwardGrn[0].id,
            },
            "Successfully Created Inward"
          )
        );
      }
    }else{
     //if article is same its time to update inward
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
        inward_id
      } = req.body;
         
         const { rows: articleInfo } = await client.query(
          "SELECT c.colorflag FROM articles a JOIN category c ON c.id = a.category_id WHERE a.id = $1",
          [article_id]
        );
         //Checking if same article is sent again if yes update else add new article in grn no.
         const {rows:existingArticle} = await client.query(`
          SELECT ARTICLE_ID FROM INWARD WHERE INWARD_GRN_ID = $1
          `,[inward_id])

          
          const articleId = existingArticle[0].article_id;
          //Updating Inward Date ,Remarks, supplier,stock ratio mobile,weight and num_packs
          //total set quantity calculation
          const rationSum = ratio
            .split(",")
            .reduce((acc, val) => acc + Number(val), 0);
          const packsSum = num_packs
            .split(",")
            .reduce((acc, val) => acc + Number(val), 0);
          const colorSum = color_list.length;

          let final_total_set_quantity = 0;
          if (articleInfo.length) {
            if (articleInfo[0].colorflag === 0) {
              final_total_set_quantity = packsSum * (rationSum * colorSum);
            } else {
              final_total_set_quantity = packsSum * rationSum;
            }
          }
          const { rows: updatedInward } = await client.query(
            `
               UPDATE INWARD SET INWARD_DATE = $1,NUM_PACKS=$2,WEIGHT = $3,SALES_NUM_PACKS=$4,
               FINAL_TOTAL_SET_QUANTITY=$5,STOCK_RATIO_MOB=$6
               WHERE ARTICLE_ID = $7 RETURNING *
            `,
            [inward_date, num_packs, weight,num_packs,final_total_set_quantity,
              stock_ratio_mobile,article_id]
          );
          console.log('col_list',color_list);
          // H E R E    A R T I C L E   I S  S A M E    SO   UPDATE INWARD
          if(existingArticle.length > 0){
            //Update Color
            color_list.map(async (val)=>{
              const {rows:updatedColors} = await client.query(`
                UPDATE INWARD_ARTICLE_COLOR 
                SET COLOR_ID = $1,COLOR_NAME=$2
                WHERE ARTICLE_ID = $3 AND COLOR_ID = $4
                `,[val.id,val.name,articleId,val.id])
            })
            //Update size and Ratio
            const getUpdateRatio = ratio.split(",");
            if (size_list && size_list.length) {
              size_list.map(async (val, idx) => {
                await client.query(
                  `UPDATE INWARD_ARTICLE_SIZE SET SIZE_ID = $1 ,SIZE_NAME = $2
                  WHERE ARTICLE_ID = $3 AND SIZE_ID = $4`,[val.id,val.name,articleId,val.id]
                );
                await client.query(
                  `UPDATE INWARD_ARTICLE_RATIO SET ARTICLE_SIZE_ID = $1,ARTICLE_RATIO = $2
                  WHERE ARTICLE_ID = $3 AND ARTICLE_SIZE_ID = $4`,
                  [val.id,getUpdateRatio[idx],articleId,val.id]
                );
              });
            }
            
            //If all updated without error 
            return res.status(200).json(new ApiResponse(200,'Successfully updated inward'))

          }else{
            //Adding Multiple article in same INWARD
            try{
              //Adding C O L O R S
              color_list.map(async(val)=>{
                const {rows:updateColor} = await client.query(`
                  INSERT INTO INWARD_ARTICLE_COLOR ARTICLE_ID,COLOR_ID,COLOR_NAME VALUES ($1,$2,$3)
                  RETURNING *
                  `,[val.id,val.name,article_id])
              })
              // adding  S I Z E   &&   R A T I O
              const getUpdateRatio = ratio.split(",");
            if (size_list && size_list.length) {
              size_list.map(async (val, idx) => {
                await client.query(
                  `INSERT INTO INWARD_ARTICLE_SIZE ARTICLE_ID, SIZE_ID,
                  SIZE_NAME VALUES ($1,$2,$3)
                  `,[val.id,val.name,articleId]
                );
                await client.query(
                  `INSERT INTO INWARD_ARTICLE_RATIO ARTICLE_ID,ARTICLE_SIZE_ID,ARTICLE_RATIO
                  VALUES ($1,$2,$3)
                  `,
                  [articleId,val.id,getUpdateRatio[idx]]
                );
              });
            }
            
              const {rows:addNewArticleInInward} = await client.query(`
                 INSERT INTO INWARD INWARD_DATE,ARTICLE_ID,
                 NUM_PACKS,INWARD_GRN_ID,WEIGHT,SALES_NUM_PACKS,
                 FINAL_TOTAL_SET_QUANTITY,STOCK_RATIO_MOB
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
              `,[inward_date,article_id,num_packs,inward_id,weight,
                num_packs,final_total_set_quantity,stock_ratio_mobile])

                if(addNewArticleInInward.length > 0){
                  return res.status(200).json(new ApiResponse(200,addNewArticleInInward,'Successfully added new article in same inward'))
                }}catch(error){
                  console.log('Error in add article in same inward api',error);
                  return res.status(500).json(new ApiError(500,'Error in add article in same inward api',error))
                }
          }
    }catch(error){
      console.log("Error in adding color and all things in adding article in inward",error);
           return res.status(500).json(new ApiError(500,'Error in updating inward of existing article',error))
    }
    //if article is also changed then add new article in this inward in put a new entry in database
    }
   
    return res
        .status(400)
        .json(new ApiError(400, "Failed to insert Inward GRN Number",error?.message));

  } catch (error) {
    console.log("Error: ", error);
    await client.query("ROLLBACK");
    return res
      .status(error?.statusCode || 500)
      .json(
        new ApiError(
          error.statusCode,
          error.message,
          error?.errors,
          error?.stack
        )
      );
  } finally {
    client.release();
  }
};
//FETCH ARTICLE DETAILS
const fetchArticleDetails = async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  try {
    const { rows: articleDetails } = await client.query(
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
      `,
      [id]
    );
    if (!id || id === undefined) {
      return res.status(400).ApiError(400, "Article Id not found");
    }
    if (articleDetails.length > 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, articleDetails, "Article details success"));
    } else {
      return res
        .status(400)
        .json(
          new ApiError(400, articleDetails, "No data found by this Article_id")
        );
    }
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error.error, "Error in fetch article Api"));
  } finally {
    await client.release();
  }
};

//Fetch Inward Table
const fetchInwardTable = async(req,res)=>{
  const client = await pool.connect()
  try{
    const {rows:fetchRes} =await client.query(
      `SELECT DISTINCT ON (I.ID) I.ID, CONCAT(IG.GRN,'/',FY.START_YEAR,'-',FY.END_YEAR) AS GRN_NO,I.INWARD_DATE,
       V.NAME AS PARTY_NAME,C.NAME AS CATEGORY,
      I.NUM_PACKS AS PEICES,PN.PO_FY AS PO_NUMBER
      FROM INWARD I
      JOIN INWARD_GRN IG ON IG.ID = I.INWARD_GRN_ID
      JOIN VENDOR V ON V.ID = IG.VENDOR_ID
      JOIN ARTICLES A ON A.ID = I.ARTICLE_ID
      JOIN CATEGORY C ON C.ID = A.CATEGORY_ID
      JOIN FINANCIAL_YEAR FY ON FY.ID = IG.FINANCIAL_YEAR_ID
      JOIN PURCHASE_ORDER_DETAILS POD ON POD.ARTICLE_ID = I.ARTICLE_ID
      JOIN PURCHASE_NUMBER PN ON PN.ID = POD.PO_NUMBER_ID`
    )
    if(fetchRes && fetchRes.length > 0){
      return res.status(200).json(new ApiResponse(200,fetchRes,'successfully fetched table'))
    }else{
      return res.status(404).json(new ApiError(404,'No inwards found'))
    }

  }catch(error){
     return res.status(500).json(new ApiError(500,"Error in fetching table",error))
  }finally{
    client.release()
  }
}

//Delete whole Inward
const deleteWholeInward = async (req, res) => {
  const { id } = req.params;
  
  const client = await pool.connect();

  try {
    console.log('Fetching ARTICLE_ID...');
    const { rows: articleId } = await client.query(
      `SELECT ARTICLE_ID FROM INWARD WHERE ID = $1`,
      [id]
    );

    

    if (!articleId.length) {
      
      return res.status(404).json(new ApiError(404, null, 'Inward not found'));
    }

    const a_id = articleId[0].article_id;

    // Delete operations
    
    await client.query('DELETE FROM INWARD_ARTICLE_COLOR WHERE ARTICLE_ID = $1', [a_id]);

  
    await client.query('DELETE FROM INWARD_ARTICLE_SIZE WHERE ARTICLE_ID = $1', [a_id]);

    
    await client.query('DELETE FROM INWARD_ARTICLE_RATIO WHERE ARTICLE_ID = $1', [a_id]);

    
    await client.query(`DELETE FROM INWARD_ARTICLE WHERE ARTICLE_ID = $1`, [a_id]);

    
    const { rowCount: deletedRows } = await client.query(
      `DELETE FROM INWARD WHERE ID = $1`,
      [id]
    );

    

    if (deletedRows > 0) {
      
      return res.status(200).json(new ApiResponse(200, null, 'Successfully deleted whole inward'));
    } else {
      
      return res.status(404).json(new ApiError(404, null, 'Inward not found or already deleted'));
    }
  } catch (error) {
    
    res.status(500).json(new ApiError(500, error, 'Error in deleting whole inward'));
  } finally {
    
    client.release();
  }
};

//Get single Inward Details
const getSingleInwardTable = async (req,res) =>{

const client = await pool.connect()
try{
  const {id} = req.body
  const {rows:singleInwardTable} =await client.query(`
     SELECT I.ID,CONCAT(IG.GRN,'/',FY.START_YEAR,'-',FY.END_YEAR) AS
     PO_NUMBER,I.INWARD_GRN_ID AS GRN_ID,A.ARTICLE_NUMBER,
     V.NAME AS VENDOR,
     I.NUM_PACKS AS PEICES
     FROM INWARD I
     JOIN INWARD_GRN IG ON IG.ID = I.INWARD_GRN_ID
     JOIN VENDOR V ON V.ID = IG.VENDOR_ID
     JOIN ARTICLES A ON A.ID = I.ARTICLE_ID
     JOIN FINANCIAL_YEAR FY ON FY.ID = IG.FINANCIAL_YEAR_ID
     WHERE I.ID = $1
  `,[id])
  
  if(singleInwardTable.length > 0){
    return res.status(200).json(new ApiResponse(200,singleInwardTable,'successfully fetched single inw table'))
  }else{
    return res.status(404).json(new ApiError(404,'No data found in this inward'))
  }
}catch(error){
    console.log('object',error);
    return res.status(500).json(new ApiError(500,error,'Error in fetch single inw api'))
}finally{
  client.release()
}
}

//Get single inward
const getSingleInwardDetails = async(req,res)=>{
  const client = await pool.connect()
  const {id} = req.body
  try{
    const {rows:details} = await client.query(`
      SELECT DISTINCT ON (I.ID) 
    I.ID, 
    I.INWARD_DATE,
    I.STOCK_RATIO_MOB,
    IG.REMARKS,
    V1.id AS INWARD_VENDOR_NAME,  
    A.ID AS ARTICLE_ID,
    PN.PO_FY,
    POD.NUM_PACKS,
    C.COLORFLAG,
    C.NAME AS CATEGORY,
    V2.id AS PO_VENDOR_NAME,  
	  B.NAME AS BRAND_NAME,
	  SB.NAME AS SUBCATEGORY,
	  RS.SERIES_NAME SERIES_NAME,
    COALESCE(COLOR_DETAILS.COLOR_LIST, '[]') AS COLOR_DETAILS,
    COALESCE(SIZE_DETAILS.SIZE_LIST, '[]') AS SIZE_DETAILS,
    COALESCE(RATIO_DETAILS.RATIO_LIST, '[]') AS RATIO_DETAILS,
    I.WEIGHT,
    A.STYLE_DESCRIPTION
    
    FROM INWARD I
    LEFT JOIN ARTICLES A ON I.ARTICLE_ID = A.ID
    LEFT JOIN INWARD_GRN IG ON I.INWARD_GRN_ID = IG.ID
    LEFT JOIN VENDOR V1 ON IG.VENDOR_ID = V1.ID  
    LEFT JOIN INWARD_ARTICLE IA ON I.ARTICLE_ID = IA.ARTICLE_ID
    LEFT JOIN PURCHASE_ORDER_DETAILS POD ON I.ARTICLE_ID = POD.ARTICLE_ID
    LEFT JOIN PURCHASE_NUMBER PN ON PN.ID = POD.PO_NUMBER_ID  
    LEFT JOIN VENDOR V2 ON PN.VENDOR_ID = V2.ID  
    LEFT JOIN CATEGORY C ON A.CATEGORY_ID = C.ID
    LEFT JOIN BRAND B ON B.ID = A.BRAND_ID
    LEFT JOIN RANGESERIES RS ON RS.ID = A.SERIES_ID
    LEFT JOIN SUBCATEGORY SB ON SB.ID = A.SUBCATEGORY_ID

    LEFT JOIN (
    SELECT 
        AC.ARTICLE_ID, 
        jsonb_agg(jsonb_build_object('id', AC.COLOR_ID, 'name', AC.COLOR_NAME)) AS COLOR_LIST
    FROM INWARD_ARTICLE_COLOR AC
    GROUP BY AC.ARTICLE_ID
) COLOR_DETAILS ON COLOR_DETAILS.ARTICLE_ID = I.ARTICLE_ID

LEFT JOIN (
    SELECT 
        ARS.ARTICLE_ID, 
        jsonb_agg(jsonb_build_object('id', ARS.SIZE_ID, 'name', ARS.SIZE_NAME)) AS SIZE_LIST
    FROM INWARD_ARTICLE_SIZE ARS
    GROUP BY ARS.ARTICLE_ID
) SIZE_DETAILS ON SIZE_DETAILS.ARTICLE_ID = I.ARTICLE_ID

LEFT JOIN (
    SELECT 
        AR.ARTICLE_ID, 
        jsonb_agg(AR.ARTICLE_RATIO) AS RATIO_LIST
    FROM INWARD_ARTICLE_RATIO AR
    GROUP BY AR.ARTICLE_ID
) RATIO_DETAILS ON RATIO_DETAILS.ARTICLE_ID = I.ARTICLE_ID
           where I.ID = $1`,[id])
           
    return res.status(200).json(new ApiResponse(200,details,'Successfully fetched SingleInward details'))
  }catch(error){
      console.log('Error in single inw',error);
      return res.status(500).json(new ApiError(500,'Error in catch of singleInward',error))
  }finally{
    client.release()
  }
}

// Update Inward 
// const udateInward = async(req,res) =>{
//   const client = await pool.connect()
//   try{
//       const {id} = req.body
//       const {row:updateInw} = await client.query(`
        
//         `)
//   }catch(error){

//   }finally{
//     client.release()
//   }
// }

module.exports = {
  fetchArticleDetails,
  addInward,
  fetchInwardTable,
  deleteWholeInward,
  getSingleInwardTable,
  getSingleInwardDetails
};
