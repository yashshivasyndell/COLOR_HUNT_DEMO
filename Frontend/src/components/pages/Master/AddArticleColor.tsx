import React, { useEffect } from 'react'
import { Card } from '../../ui/card'
import { Button } from '../../ui/button'
import { useForm } from 'react-hook-form'
import {z} from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { addArticleColor, getSingleArticleColor, updateArticleColor } from '../../../api'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import CustomToast from '../../../showToast'

const AddArticleColor = () => {
    const {id} = useParams() 
    const editId = Number(id)

    const navigate = useNavigate()
    const articleSchema = z.object({
        name:z.string().nonempty({message:'Name cant be empty'}).min(3,{message:'Name cant be less than 3 characters'})
    })

    const {handleSubmit,register,setValue,formState:{errors}} = useForm({resolver:zodResolver(articleSchema)})

    const submit = async (data:object)=>{
        console.log("iam run");
        if(editId){
            try{
                const updated = await updateArticleColor(editId,data)
                console.log(updated);
            if(updated.statusCode === 200){
                CustomToast(200,'Updated successfully')
            }}catch(error){
                CustomToast(500,'Item already exists')
            }
        }else{
            try{
                const res = await addArticleColor(data)
                console.log(res);
            if(res.statusCode === 200){
                CustomToast(200,'Color added successfully')
            }
            }catch(error){
                CustomToast(500,'Color already exists')
            }
        }
        
    }
    
    const fillDetail = async () =>{
        const respo = await getSingleArticleColor(editId)
        respo.data.map((item:any)=>{
             setValue('name',item.name)
        })
    }

    useEffect(()=>{
        if(editId){
            fillDetail()
        }
    },[])
  return (
    <div className='p-5'>
        <Card className='lg:w-[40%]'>
            <form action="" onSubmit={handleSubmit(submit)}>
            <div className='ml-7 p-3'>
            Article Color - Add
            </div>
            <hr />
            <div className='w-[100%] p-2'>
                <div className='mb-4 grid gap-2'>
                    <label htmlFor="" className='ml-10'>Name</label>
                    <input {...register('name')} type="text" className='pl-2 mx-10 outline text-black focus:ring-2 ring-green-600 transition duration-300 rounded'/>
                    {errors.name && (
                        <span className='ml-10 text-red-500'>{typeof errors.name.message === 'string' ? errors.name.message : "invalid message"}</span>
                    )}
                </div>
                 <div className='flex justify-between gap-3 mx-7 p-2'>
                    <Button type='button' onClick={()=>navigate('/articlecolor')}>Back</Button>
                    <Button type='submit' >Submit</Button>
                 </div>
            </div>
            </form>
        </Card>
    </div>
  )
}

export default AddArticleColor