import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { FilePenLine } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Button } from '../../ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../Table/data-table-column-header';
import { DataTable } from '../Table/data-table';
import CustomToast from '../../../showToast';
import { deleteparty, fetchPartyList } from '../../../api';

const PartyMaster = () => {
  const navigate = useNavigate()
  const [table,setTable] = useState([])

  interface Party {
    party_id:number,
    partyname:string,
    phone_no:number,
    email:string,
    contact_person:string,
    state:string,
    city:string,
    pincode:number,
    country:string,
    gst_no:number,
    sales_person:string,
    source:string,

  }


  const handleDelete =async (id:any)=>{
      
      try{const delRes = await deleteparty(id)

      if(delRes.statusCode === 200){
        fetechData()
        CustomToast(200,"Deleted successfully")
      }}catch(error){
        CustomToast(500,"Error in deleting")
      }
      
  }
  const partyColumn :ColumnDef<Party>[]=[
    {
      accessorKey:"party_id",
      header:({column})=>(<DataTableColumnHeader column={column} title='No'/>)
    },
    {
      accessorKey:"partyname",
      header:({column})=>(<DataTableColumnHeader column={column} title='Name'/>)
    },
    {
      accessorKey:"phone_no",
      header:({column})=>(<DataTableColumnHeader column={column} title='Phone_no'/>)
    },
    {
      accessorKey:"email",
      header:({column})=>(<DataTableColumnHeader column={column} title='Email'/>)
    },
    {
      accessorKey:"contact_person",
      header:({column})=>(<DataTableColumnHeader column={column} title='ContactPerson'/>)
    },
    {
      accessorKey:"state",
      header:({column})=>(<DataTableColumnHeader column={column} title='State'/>)
    },
    {
      accessorKey:"city",
      header:({column})=>(<DataTableColumnHeader column={column} title='City'/>)
    },
    {
      accessorKey:"pincode",
      header:({column})=>(<DataTableColumnHeader column={column} title='Pincode'/>)
    },
    {
      accessorKey:"country",
      header:({column})=>(<DataTableColumnHeader column={column} title='Country'/>)
    },
    {
      accessorKey:"gst_no",
      header:({column})=>(<DataTableColumnHeader column={column} title='GST Number'/>)
    },
    {
      accessorKey:"sales_person",
      header:({column})=>(<DataTableColumnHeader column={column} title='Sales person'/>)
    },
    {
      accessorKey:"source",
      header:({column})=>(<DataTableColumnHeader column={column} title='Source'/>)
    },
     
    {
      header:"Action",
      cell:({row})=>{
        const data = row.original;
        return (
          <div className="flex gap-3">
            <div >
              <span>
                <Eye />
              </span>
            </div>
            <div onClick={()=>handleDelete(data.party_id)}>
              <span>
                <Trash2 />
              </span>
            </div>
            <div >
              <span>
                <FilePenLine onClick={()=>navigate(`/addparty-master/${data.party_id}`)}/>
              </span>
            </div>
          </div>
        );
      }
    }
  ]
  const fetechData = async ()=>{
    const data = await fetchPartyList()
    setTable(data.data)

    console.log("party karo",data); 
  }
  
  useEffect(()=>{
    fetechData()
  },[])
  return (
    <div>
      <div className='text-right m-5'>
      <Button onClick={()=>navigate('/addparty-master')}>Add Party</Button>
      </div>
      <div className='p-5'>
        <DataTable columns={partyColumn} data={table}/>
      </div>
    </div>
  )
}

export default PartyMaster