import { useEffect, useState } from "react";
import { AwardIcon, PenBox, Trash2 } from "lucide-react";
import { Eye } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../Table/data-table-column-header";
import { DataTable } from "../Table/data-table";
import CustomToast from "../../../showToast";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";
import { deleteWholeInward, fetchinwardTable, fetchSingleInwardTable } from "../../../api";
import moment from "moment";
import { json } from "stream/consumers";

const Inward = () => {
  interface inward {
    no:number,
    id:number,
    grn_no:string,
    party_name:string,
    category:string,
    peices:number,
    inward_date:Date,
    po_number:string,
  }

  const [table,setTable] = useState([])

  const fetchTable = async()=>{
    const table = await fetchinwardTable()
    setTable(table.data)
  }
  useEffect(()=>{
    fetchTable()
  },[])

  const dateFormatter = (date:Date)=>{
    return moment(date).format("DD/YY/YYYY")
  }

  //DELETE WHOLE INWARD
  const handleDelete = async(id:number)=>{
    const DeleteResp =await deleteWholeInward(id)
    if(DeleteResp.statusCode === 200){
      fetchTable()
      if(table.length === 1){
        setTable([])
      }
      if(table.length === 0){
        fetchTable()
      }
      CustomToast(200,"Inward Deleted")
    }
  }

  const handleUpdateInward = async (id:any)=>{
    const strId = JSON.stringify({id:id})
    const UpdateInward = await fetchSingleInwardTable(strId)
    console.log('object',UpdateInward);
    localStorage.setItem("inwardData", JSON.stringify(UpdateInward));
    navigate('/add-inward')
  }

  const inwardColumns: ColumnDef<inward>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title="S.No" />,
      cell: ({ row }) => {
        return <span className="px-4 block">{row.index + 1}</span>; 
      }
    },
    {
      accessorKey: 'grn_no',
      header: ({ column }) => <DataTableColumnHeader column={column} title="GRN NO" />,
      cell: ({ row }) => {
        return <span className="px-4 block">{row.original.grn_no}</span>;
      }
    },
    {
      accessorKey: 'inward_date',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => {
        return <span className="px-4 block">{dateFormatter(row.original.inward_date)}</span>;
      }
    },
    {
      accessorKey: 'party_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Party name" />,
      cell: ({ row }) => {
        return <span className="px-4 block">{row.original.party_name}</span>;
      }
    },
    {
      accessorKey: 'category',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      cell: ({ row }) => {
        return <span className="px-4 block">{row.original.category}</span>;
      }
    },
    {
      accessorKey: 'peices',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Peices" />,
      cell: ({ row }) => {
        return <span className="px-4 block">{row.original.peices}</span>;
      }
    },
    {
      accessorKey: 'po_number',
      header: ({ column }) => <DataTableColumnHeader column={column} title="PO Number" />,
      cell: ({ row }) => {
        return <span className="px-4 block">{row.original.po_number}</span>;
      }
    },
    {
      header: 'Action',
      cell: ({ row }) => {
        const data = row.original
        return (
          <div className="flex gap-3 p-2"> 
            <div className="p-1 cursor-pointer"> 
              <Eye />
            </div>
            <div className="p-1 cursor-pointer">
              <Trash2 onClick={()=>handleDelete(data.id)}/>
            </div>
            <div className="p-1 cursor-pointer">
              <PenBox onClick={() => handleUpdateInward(data.id)} />
            </div>
          </div>
        );
      }
    }
  ];
  
  const navigate = useNavigate()
  return (
    <div>
      <Button onClick={()=>navigate('/add-inward')}>Add-inward</Button>
      <DataTable columns={inwardColumns} data={table}/>
    </div>
  )
}

export default Inward