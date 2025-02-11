import { Menu } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { FilePenLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteSubCategory, getSubCategoryList } from '../../../api';
import CustomToast from '../../../showToast';
const SubcategoryList = () => {
  const [tableData, settableData] = useState<SubCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currPage, setCurrPage] = useState(1);
  const [noOfRows, setNoOfRows] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' }); 
  const navigate = useNavigate();

  type SubCategory = {
    subcategory_id: number;
    category_id: number;
    category_name: string;
    subcategory_name: string;
  };

  const getSubCatTable = async () => {
    const TableRes = await getSubCategoryList();
    const array = TableRes.data;
    settableData(array);
  };

  // Delete Subcategory
  const deleteSubcat = async (id: number) => {
    try {
      const deleteRes = await deleteSubCategory(id);
      if (deleteRes.statusCode === 400) {
        settableData([]);
      }
      CustomToast(200, 'Sub category deleted successfully');
      getSubCatTable();
    } catch (error) {
      console.log("Error in delete:", error);
    }
  };

  // Edit Subcategory
  const editSubCategory = async (id: number) => {
    navigate(`/addsubcategory/edit/${id}`);
  };

  // Handle Search Query Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrPage(1); 
  };

  // Handle Column Sorting
  const handleSort = (key: 'category_name' | 'subcategory_name') => {
    let direction = 'asc'; // Default direction is ascending
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'; // Toggle direction if the same column is clicked
    }
    setSortConfig({ key, direction });
  };

  // Sort Data
  const sortData = (data: SubCategory[]) => {
    const sortedData = [...data];
    const { key, direction } = sortConfig;

    if (key) {
      sortedData.sort((a:any, b:any) => {
        if (direction === 'asc') {
          return a[key].toString().localeCompare(b[key].toString());
        } else {
          return b[key].toString().localeCompare(a[key].toString());
        }
      });
    }

    return sortedData;
  };

  // Filter data based on search query
  const filteredData = tableData.filter(item => {
    return (
      item.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subcategory_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });


  const sortedData = sortData(filteredData);


  const indexOfLastRow = currPage * noOfRows;
  const indexOfFirstRow = indexOfLastRow - noOfRows;
  const paginatedData = sortedData.slice(indexOfFirstRow, indexOfLastRow);

  
  const totalPages = Math.ceil(sortedData.length / noOfRows);

 
  const handlePageChange = (newPage: number) => {
    setCurrPage(newPage);
  };

  useEffect(() => {
    getSubCatTable();
  }, []);

  return (
    <>
      <Card className='m-2 w-[95%]'>
        <div className='flex justify-between px-10 p-3'>
          <div className='flex gap-3'>
            <Menu /> Subcategory List
          </div>
          <Button onClick={() => navigate('/addsubcategory')} className='bg-blue-400 mr-12'>
            Add subcategory
          </Button>
        </div>
        <hr />
        <div className='flex justify-between px-10 pt-5'>
          <div className=''>
            <span className='pr-3'>Show</span>
            <select className='pr-3 text-black' value={noOfRows} onChange={(e) => setNoOfRows(Number(e.target.value))}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className='pl-3'>entries</span>
          </div>
          <div>
            <span className='mr-2'>Search:</span>
            <Input className='inline-block w-[50%] mr-0' value={searchQuery} onChange={handleSearchChange} />
          </div>
        </div>

        {/* Table starts */}
        <div className='px-10 text-center w-[100%]'>
          <Table>
            <TableHeader>
              <TableRow className='text-center'>
                <TableHead className='text-center'>No</TableHead>
                <TableHead className='text-center' onClick={() => handleSort('category_name')}>
                  Category Name {sortConfig.key === 'category_name' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
                </TableHead>
                <TableHead className='text-center' onClick={() => handleSort('subcategory_name')}>
                  Sub Category Name {sortConfig.key === 'subcategory_name' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
                </TableHead>
                <TableHead className='text-center'>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((data, i) => (
                <TableRow key={data.subcategory_id} className='text-center'>
                  <TableCell>{indexOfFirstRow + i + 1}</TableCell>
                  <TableCell>{data.category_name}</TableCell>
                  <TableCell>{data.subcategory_name}</TableCell>
                  <TableCell className='flex gap-5 justify-center'>
                    <Trash2 onClick={() => deleteSubcat(data.subcategory_id)} />
                    <FilePenLine onClick={() => editSubCategory(data.subcategory_id)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className='flex justify-between mt-4 ml-10 mr-20'>
          <div>
            Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, sortedData.length)} of {sortedData.length} entries
          </div>

          <div className='flex gap-2'>
            <Button onClick={() => handlePageChange(currPage - 1)} disabled={currPage === 1}>
              Previous
            </Button>

            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`${
                  currPage === index + 1 ? 'bg-blue-200 text-black' : 'bg-white text-black'
                } border border-gray-300 px-2 py-1 hover:bg-blue-200`}
              >
                {index + 1}
              </Button>
            ))}
            <Button onClick={() => handlePageChange(currPage + 1)} disabled={currPage === totalPages}>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default SubcategoryList;