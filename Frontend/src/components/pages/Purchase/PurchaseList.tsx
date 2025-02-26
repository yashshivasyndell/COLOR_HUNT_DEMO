import { useEffect, useState } from "react";
import { PenBox, Trash2 } from "lucide-react";
import { Eye } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../Table/data-table-column-header";
import { DataTable } from "../Table/data-table";
import CustomToast from "../../../showToast";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";
import {
  deletePO,
  deleteWholePO,
  fetchpurchaseList,
  fetchPurchaseNumberTable,
} from "../../../api";
import moment from "moment";

const PurchaseList = () => {
  const [table, settable] = useState<any>([]);

  interface PoNumber {
    id:number,
    po_date:Date,
    po_fy: string,
    purchase_number_id:string,
    total_num_packs:string,
    vendor_name:string
  }

  const PoNumberColumns : ColumnDef<PoNumber> [] = [
      {
        accessorKey:'id',
        header:({column})=>(<DataTableColumnHeader column={column} title="S.No"/> ),
        cell:({row})=>{
          const data = row.original
          return(
            <span>{row.index+1}</span>
          )
        }
      },
      {
        accessorKey:'po_date',
        header:({column})=>(<DataTableColumnHeader column={column} title="PO_DATE"/> ),
       cell:({row})=>{
         const formatted = dateFormater(row.original.po_date)
        return(
          <span className="py-3">{formatted}</span>
        )
       }
      },
      
      {
        accessorKey:'po_fy',
        header:({column})=>(<DataTableColumnHeader column={column} title="PO_NUMBER"/> ),
        cell:({row})=>{
          return <span className="py-3">{row.original.po_fy}</span>
        }
      },
      {
        accessorKey:'total_num_packs',
        header:({column})=>(<DataTableColumnHeader column={column} title="PEICES"/> ),
        cell:({row})=>{
          return <span className="py-3">{row.original.total_num_packs}</span>
        }
      },
      {
        accessorKey:'vendor_name',
        header:({column})=>(<DataTableColumnHeader column={column} title="VENDOR"/> ),
        cell:({row})=>{
          return <span className="py-3">{row.original.vendor_name}</span>
        }
      },
      {
        header:"Action",
        cell:({row})=>{
          const data = row.original;
          return(
            <div className="flex gap-3">
              <div>
                <span>
                  <Eye/>
                </span>
              </div>
              <div>
                <span>
                  <Trash2 onClick={()=>handleDelete(data.id)}/>
                </span>
              </div>
              <div>
                <span>
                  <PenBox onClick={()=>navigate(`/editPO/${data.id}`)}/>
                </span>
              </div>
            </div>
          )
        }
      } 
      
  ]

  const dateFormater = (date: Date) => {
    return moment(date).format("DD/YY/YYYY");
  };

  const handleDelete = async (id: number) => {
    const res = await deleteWholePO(id);
    fetchTable();
    if (table.length === 1) {
      settable([]);
    }
    if (table.length === 0) {
      fetchTable();
    }
    if (res.statusCode === 200) {
      try {
        CustomToast(200, "PO deleted successfully");
      } catch (error) {
        CustomToast(500, "Error occured in deleting");
      }
    }
  
  };

   const fetchTable = async ()=>{
    const data = await fetchPurchaseNumberTable()
    settable(data.Data)
   }

   useEffect(()=>{
    fetchTable()
   },[])
  const navigate = useNavigate();
  return (
    <div className="p-2">
      <Button onClick={() => navigate("/add")}>Add PO</Button>
      <div className=""></div>
      <DataTable columns={PoNumberColumns} data={table}/>
    </div>
  );
};

export default PurchaseList;
