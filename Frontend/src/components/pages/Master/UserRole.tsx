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
import { deleteUser, getUsers } from '../../../api';

const UserRole = () => {
  const navigate = useNavigate()
  const [table,setTable] = useState([])

  const fetch = async ()=>{
    const data = await getUsers()
    setTable(data.data)
    console.log("this are users",data);
  }
  useEffect(()=>{
    fetch()
  },[])

  const handleDelete =async (id:number)=>{
    try{
      const delRes = await deleteUser(id)
      console.log('delete res',delRes);
      fetch()
    if(delRes.statusCode===200){
      CustomToast(200,'User deleted success')
    }}catch(error){
      CustomToast(500,'Error in deleting user')
    }
  }

  interface Users {
    id:number,
    name:string,
    email:string,
    role:string,
    status:number,
    mobile_status:number,
  }

  const userColumns : ColumnDef<Users>[] = [
    {
      accessorKey:"id",
      header:({column})=>(<DataTableColumnHeader column={column} title='No'/>)
    },
    {
       accessorKey:"name",
       header:({column})=>(<DataTableColumnHeader column={column} title='First Name'/>)
    },
    {
      accessorKey:"email",
      header:({column})=>(<DataTableColumnHeader column={column} title='Email'/>)
    },
    {
      accessorKey:"role",
      header:({column})=>(<DataTableColumnHeader column={column} title='Role'/>)
    },
    {
      accessorKey:"status",
      header:({column})=>(<DataTableColumnHeader column={column} title='Status'/>),
      cell:({row})=>{
        const data = row.original
        return <span>{data.status ? "Yes":"No"}</span>
      }

    },
    {
      accessorKey:"mobile_status",
      header:({column})=>(<DataTableColumnHeader column={column} title='Mobile Status'/>),
      cell:({row})=>{
        const data = row.original;
        return <span>{data.mobile_status?"Yes":"No"}</span>
      }
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="flex gap-3">
            <div >
              <span>
                <Eye />
              </span>
            </div>
            <div onClick={()=>handleDelete(data.id)}>
              <span>
                <Trash2 />
              </span>
            </div>
            <div >
              <span>
                <FilePenLine onClick={()=>navigate(`/adduser/${data.id}`)}/>
              </span>
            </div>
          </div>
        );
      },
    },
  ]
  return <div className="">
    <div className='text-right'>
      <Button type='button' onClick={()=>navigate('/adduser')}>Add Users</Button>
    </div>
    <DataTable columns={userColumns} data={table}/>
  </div>;
};

export default UserRole;
