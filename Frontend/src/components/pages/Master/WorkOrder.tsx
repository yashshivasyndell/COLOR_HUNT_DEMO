import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { FilePenLine } from 'lucide-react';
import { Button } from '../../ui/button';
import { deleteWorkorder, getworkorderList } from '../../../api';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../Table/data-table-column-header';
import { DataTable } from '../Table/data-table';
import CustomToast from '../../../showToast';

const WorkOrder = () => {
  const [table, setTable] = useState([]);
  const navigate = useNavigate();

  interface Order {
    id: number;
    name: string;
    sno: number;
  }

  const workOrderCols: ColumnDef<Order>[] = [
    {
      accessorKey: "sno",
      header: ({ column }) => <DataTableColumnHeader column={column} title="S No" />,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="flex gap-3">
            <div onClick={() => handleDelete(data.id)}>
              <span>
                <Trash2 />
              </span>
            </div>
            <div onClick={() => navigate(`/addworkorder/${data.id}`)}>
              <span>
                <FilePenLine />
              </span>
            </div>
          </div>
        );
      },
    },
  ];

  const fetchTable = async () => {
    try {
      const resp = await getworkorderList();
      const array = resp.data.map((item: any, index: number) => ({
        ...item,
        sno: index + 1, 
      }));
      setTable(array);
    } catch (error) {
      console.error("Error fetching work orders:", error);
    }
  };

  const handleDelete = async(id:number)=>{
    const delRes = await deleteWorkorder(id)
    console.log("del res",delRes);
    CustomToast(200,"Successfully deleted")
    fetchTable()
    
  }
  useEffect(() => {
    fetchTable();
  }, []);

  return (
    <div>
      <div className="text-right p-5">
        <Button onClick={() => navigate('/addworkorder')}>Add Work Order</Button>
      </div>
      <DataTable columns={workOrderCols} data={table} />
    </div>
  );
};

export default WorkOrder;
