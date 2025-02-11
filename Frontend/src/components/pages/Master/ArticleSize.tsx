import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { FilePenLine } from 'lucide-react';
import { Button } from '../../ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../Table/data-table-column-header';
import { DataTable } from '../Table/data-table';
import CustomToast from '../../../showToast';
import { deleteSize, getSize } from '../../../api';

const ArticleSize = () => {
  const [table,setTable] = useState([])
   const navigate = useNavigate()

  interface Size{
    
    name:string,
    id:number
  }

  const fetchData = async ()=>{
    const sizes = await getSize()
    console.log('sizes',sizes);
    setTable(sizes.data)
  }
  const handleDelete =async (id:number)=>{
       const resDel = await deleteSize(id)
       fetchData()
       if(resDel.statusCode === 200){
        CustomToast(200,'Size delted succesfully')
       }
  }

  useEffect(()=>{
    fetchData()
  },[])

  const SizeColumns : ColumnDef<Size>[]=[
    {
      accessorKey:'id',
      header:({column})=><DataTableColumnHeader column={column} title='No' />
    },{
      accessorKey:'name',
      header:({column})=><DataTableColumnHeader column={column} title='Size Name' />
    },{
      header:"Action",
      cell:({row})=>{
        const data = row.original;
        return(
            <div className='flex gap-3'>
              <div onClick={()=>handleDelete(data.id)}><span><Trash2/></span></div>
              <div onClick={()=>navigate(`/addarticlesize/${data.id}`)}><span><FilePenLine/></span></div>
            </div>
        )
      }
    }
  ]
  return (
    <div>
      <div><Button onClick={()=>navigate('/addarticlesize')}>Add Size</Button></div>
      <div>
        <DataTable columns={SizeColumns} data={table}/>
      </div>
    </div>
  )
}

export default ArticleSize