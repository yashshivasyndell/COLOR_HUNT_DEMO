import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { FilePenLine } from 'lucide-react';
import { Button } from '../../ui/button';
import { deleteRangeSeries, getRangeSeriesList } from '../../../api';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../Table/data-table-column-header';
import { DataTable } from '../Table/data-table';
import CustomToast from '../../../showToast';
const RangeSeries = () => {
  const navigate = useNavigate()
  const [loading,setLoading] = useState<boolean>(false)
  const [rangeSeries,setrangeSeries] = useState<any>([])
  interface Ranges {
      rangeseries_id:number,
      Category_Name:string,
      Sub_Category_name:string,
      Series_name:string,
      Series:string,
  }

  const getRangeTable = async ()=>{
    const tableRes = await getRangeSeriesList()
    console.log("table res",tableRes);
    setrangeSeries(tableRes.data)
    console.log("table res",tableRes);
  }

  const EraseRange = async (id:number)=>{
    try{
      const delRes =await deleteRangeSeries(id)
    if(delRes.statusCode === 200){
      CustomToast(200,'Successfully deleted')
      getRangeTable();
    }
  }catch(error){
    CustomToast(500,"Error in deleting")
  }
  }

  useEffect(()=>{
    setLoading(true)
      getRangeTable()
  },[])

  const RangeSeriesCols : ColumnDef<Ranges>[] = [
    {
         accessorKey:"category_name",
         header:({column})=>(
          <DataTableColumnHeader column={column} title='Category Name'/>
         )
    },
    {
      accessorKey:"subcategory_name",
      header:({column})=>(
        <DataTableColumnHeader column={column} title='SubCategory'/>
      )
    },
    {
      accessorKey:"rangeseries_name",
      header:({column})=>(
        <DataTableColumnHeader column={column} title='Series Name'/>
      )
    },
    {
      accessorKey:"series",
      header:({column})=>(
        <DataTableColumnHeader column={column} title='Series'/>
      )
    },
    {
      header:"Actions",
      cell:({row})=>{
        const data = row.original;
        return(
          <div className='flex gap-3'>
            <div onClick={()=>EraseRange(data.rangeseries_id)}>
              <span><Trash2/></span>
            </div>
            <div onClick={()=>navigate(`/addrangeseries/${data.rangeseries_id}`)}>
              <span><FilePenLine /></span>
            </div>
          </div>
        )
      }
    }
  ]

  return (
    <div className="main-div p-5">
      <div className='flex justify-between mb-10'>
        <span className='text-3xl font-bold'>Range Series</span>
           <Button onClick={()=>navigate('/addrangeseries')}>Add Range Series</Button>
      </div>
          <DataTable columns={RangeSeriesCols} data={rangeSeries} />
    </div>
  );
};

export default RangeSeries;