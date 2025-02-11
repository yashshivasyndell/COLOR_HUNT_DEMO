import { useEffect, useState } from 'react'
import { Card } from '../../ui/card'
import z from 'zod'
import { useForm } from "react-hook-form";
import { Button } from '../../ui/button'
import { useNavigate } from 'react-router-dom'
import { fetchCategoryList, addSubCategory, updateSubCategory, getSingleSubCat } from '../../../api'
import { zodResolver } from '@hookform/resolvers/zod';
import CustomToast from '../../../showToast';
import { useParams } from 'react-router-dom';

const AddSubCategory = () => {
  const [subcat, setSubCat] = useState([])
  const [loading, setLoading] = useState(true);
  const subCategoryListSchema = z.object({
    select: z.union([
        z.string().min(1, { message: 'Please select a category' }).refine(value => value !== 'select', { message: 'Please select a valid category' }),
        z.number().min(1, { message: 'Please select a valid category' })
    ]),
    input: z.union([
        z.string().min(1, { message: 'This field is required' }),
        z.number().min(1, { message: 'This field is required' })
    ])
});


    type AddsubCategoryFormData = z.infer<typeof subCategoryListSchema>;

    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm<AddsubCategoryFormData>({
        resolver: zodResolver(subCategoryListSchema),
    });

    const fetchSubCat = async () => {
        try {
          const response = await fetchCategoryList();
          setSubCat(response.data);
        } catch (error) {
          console.error('Error fetching categories:', error);
        } finally {
          setLoading(false);
        }
      };
    const {id} = useParams()
    const editId = Number(id)
    console.log('this is subcat id',editId);
    const fetchSubCatDetail = async (Id:number)=>{
     try{
      const response = await getSingleSubCat(Id)
      console.log("this is singlesubcat response",response.data);
      response.data.map((t:any)=>{
            setValue('select',t.category_id)
            setValue('input',t.subcategory_name) 
      })
     }catch(error){
      console.log("this",error);
     }
    }

    
    // Posting subcategory
    const onSubmit = async (data: AddsubCategoryFormData) => {
        
        const body = {
            category_id : data.select,
            name : data.input
        }
        console.log("this is body",body.category_id,body.name);
        if(editId){
            try{
               const updateSub = await updateSubCategory(editId,body)
               console.log("this is update sub ",updateSub);

            if(updateSub.statusCode === 200){
            CustomToast(200,'Sub category updated successfully')
           }else if(updateSub.statusCode === 400){
            CustomToast(400, "Sub category already exists");
           }else{
            CustomToast(500, "Error in updating subcategory");
           }
        }catch(error:any){
            if(error.statusCode === 400){
                CustomToast(400,"sub category already exist")
            }
            
            
           }
        }else{
            try {
            const response = await addSubCategory({
                category_id: data.select,
                name: data.input,
            });
            console.log('Subcategory successfully added', response);
            if (response.statusCode === 400) {
                CustomToast(500, "Please select Category")
            } 
            if (response) {
                CustomToast(200, 'Successfully Added subcategory')
            } else {
                CustomToast(500, 'Error in Adding Sub Category')
            }
        } catch (error:any) {
          console.error('alasrgjfisgfis to add subcategory :', error.message);
          if(error.message === 'Subcategory already exists'){
            CustomToast(500,"category already exists")
          }
        }
    }
};

    useEffect(() => {
      if (id) {
        fetchSubCatDetail(editId);  
      }
      fetchSubCat();
    }, [editId]);

    
    const navigate = useNavigate()

    if (loading) {
        return (
          <div className="flex justify-center items-center h-screen">
            <p>Loading...</p>
          </div>
        );
      }
    return (
        <form action="" onSubmit={handleSubmit(onSubmit)}>
            <Card className=' w-[100%] lg:w-[50%] lg:m-10 h-[370px]'>
                <div className='mx-4 m-2'>Subcategory - Add</div>
                <hr />
                <div className='px-5 pt-2'>
                    <span className=''>Category *</span>
                    <select {...register('select')} className='p-1 w-[100%] h-10 text-black border-[1px] mt-3 focus:ring-4 focus:ring-blue-300 focus: border-black rounded-sm transition duration-300'>
                        <option value="select">Select</option>
                        {subcat.length > 0 && subcat.map((item: any, key: any) =>
                            <option value={item.id} key={key}>{item.name}</option> 
                        )}
                    </select>
                    {errors.select && (
                        <p className='text-red-400 text-sm ml-1 mt-1'>{errors.select.message}</p>
                    )}
                </div>
                <div className='p-5'>
                    <span className=''>Sub-Category Name *</span>
                    <input {...register('input')} className=" mt-3 w-full text-black rounded-md p-2 shadow-md border-[1px] border-black focus:ring-4  focus:ring-blue-300 focus:outline-none transition duration-300 ease-in-out " />
                    {errors.input && (
                        <p className="text-red-500 text-sm ml-1 mt-1">{errors.input.message}</p>)}
                </div>
                <div className='flex justify-between p-5'>
                    <Button onClick={() => navigate('/subcategory')}>back</Button>
                    <Button type='submit'>Submit</Button>
                </div>
            </Card>
        </form>
    )
}

export default AddSubCategory
