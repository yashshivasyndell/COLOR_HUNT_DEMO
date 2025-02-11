import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { FilePenLine } from 'lucide-react';
import { Button } from '../../ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../Table/data-table-column-header';
import { DataTable } from '../Table/data-table';
import CustomToast from '../../../showToast';
import { deleteArticleColor, getArticleColorLists } from '../../../api';


const ArticleColor = () => {
  const [tableData,setTable] = useState([])
  interface Colors {
    id:number,
    name:string,
    No:number
  }

  const fetchArticle = async ()=>{
      const articleData = await getArticleColorLists()
      const array = articleData.data.map((item:object,idx:any)=>({
              ...item,
              "No":idx+1
      }))
      setTable(array)
  }
  const handleDelete = async (id:number)=>{
    try{
      const delRes = await deleteArticleColor(id)
      if(delRes.statusCode === 200){
        fetchArticle()
        CustomToast(200,"Deleted successfully")

      }
    }catch(error){
       CustomToast(500,"Error in deleting")
    }
  }

  useEffect(()=>{
    fetchArticle()
  },[])
  const ArticleColumns: ColumnDef<Colors>[]=[
    {
      accessorKey:'No',
      header:({column})=><DataTableColumnHeader column={column} title='No'/>
    },
    {
      accessorKey:'name',
      header:({column}) => <DataTableColumnHeader column={column} title='Name'/>
    },{
      header:"Action",
      cell:({row}) =>{
        const data = row.original;
        return(
          <div className='flex gap-3'>
            <div onClick={()=>handleDelete(data.id)}>
              <span>
                <Trash2 />
              </span>
            </div>
            <div onClick={()=>navigate(`/addarticlecolor/${data.id}`)}>
              <span>
               <FilePenLine />
               </span>
            </div>
          </div>
        )
      }
    }
  ]

  const navigate = useNavigate()
  return (
    <div>
      <div className='text-right mr-10'>
  <Button className='' onClick={()=>navigate('/addarticlecolor')}>Add Article color</Button>
      </div> 
  <div className='p-10'>
    <DataTable columns={ArticleColumns} data={tableData}/>
  </div>
    </div>
  )
}

export default ArticleColor