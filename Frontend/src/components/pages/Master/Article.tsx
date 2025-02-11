import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { FilePenLine } from 'lucide-react';
import { Eye } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../Table/data-table-column-header';
import { DataTable } from '../Table/data-table';
import CustomToast from '../../../showToast';
import { Button } from '../../ui/button'
import { useNavigate } from 'react-router-dom'
import { deletearticles, fetcharticles } from '../../../api';

const Article = () => {
  const [table,settable] = useState([])

  interface Article{
    articleid:number,
    article_number:string,
    category_name:string,
    subcatgory_name:string,
    style_description:string,
    brand_name:string,
    series_id:number,
  }


  const handleDelete = async(id:any)=>{
     try{ 
      const deleted = await deletearticles(id)
      console.log(deleted);
      if(deleted.statusCode===200){
        fetchData()
        CustomToast(200,'deleted successfully')
        console.log(deleted);
      }
      }catch(error){
         CustomToast(500,'Error in deleting')
         console.log(error);
      }
  }
  const artilceColumns :ColumnDef<Article> []=[
       {
        accessorKey:"articleid",
        header:({column})=>(<DataTableColumnHeader column={column} title='No'/>)
       },
       {
        accessorKey:"article_number",
        header:({column})=>(<DataTableColumnHeader column={column} title='Article No'/>)
       },
       {
        accessorKey:"category_name",
        header:({column})=>(<DataTableColumnHeader column={column} title='Category Id'/>)
       },
       {
        accessorKey:"subcategory_name",
        header:({column})=>(<DataTableColumnHeader column={column} title='Subcategory Id'/>)
       },
       {
        accessorKey:"brand_name",
        header:({column})=>(<DataTableColumnHeader column={column} title='brand Name'/>)
       },
       {
        accessorKey:"style_description",
        header:({column})=>(<DataTableColumnHeader column={column} title='Style description'/>)
       },
       {
        accessorKey:"series_id",
        header:({column})=>(<DataTableColumnHeader column={column} title='Series'/>)
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
            <div onClick={()=>handleDelete(data.articleid)}>
              <span>
                <Trash2 />
              </span>
            </div>
            <div >
              <span>
                <FilePenLine onClick={()=>navigate(`/add-article/${data.articleid}`)}/>
              </span>
            </div>
          </div>
          )
        }
       }
  ]

  const fetchData = async()=>{
    const data = await fetcharticles()
    console.log("data",data);
    settable(data.data)
  }

  useEffect(()=>{
    fetchData()
  },[])
  const navigate = useNavigate()
  return (
    <div>
      <div className='flex justify-end p-3'>
      <Button onClick={()=>navigate('/add-article')}>Add-Article</Button>
      </div>
      <div>
        <DataTable columns={artilceColumns} data={table}/>
      </div>
      </div>
  )
}

export default Article