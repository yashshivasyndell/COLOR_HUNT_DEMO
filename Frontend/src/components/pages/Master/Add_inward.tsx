import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardHeader } from '../../ui/card'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form'
import { Calendar } from '../../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover'
import { Button } from '../../ui/button'
import { CalendarIcon } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { format } from "date-fns";
import { Input } from '../../ui/input'
import { Select } from '../../ui/select'
import { SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../ui/select"

const Add_inward = () => {
// Zod schema
  const inwardSchema = z.object({
      inward_date: z.date(),
      remark : z.string().optional(),
      supplier : z.union([z.string(),z.number()]),
      article_no : z.union([z.string(),z.number()]),
      po_number : z.string(),
      quantity : z.number(),
      color_flag : z.union([z.string(),z.number()]),
      vendor : z.string(),
      color : z.array(
        z.object({id:z.number(),name:z.string()})
      ),
      size : z.array(
        z.object({id:z.number(),name:z.string()})
      ),
      ratio : z.string().refine((val)=>
         {
          const selectedSizeLen = selectedSizes.length;
          const value = val.split(',')
          const isValidSizeList = value.every((v)=>/^[0-9]+$/.test(v))
          return isValidSizeList && selectedSizeLen === selectedSizeLen;
         }
      ),
      stock_ratio : z.number(),
      color_quantity : z.array(
        z.object({
          quantity : z.number()
        })
      ),
      weight:z.number(),
      style_desc : z.string(),
      brand_name : z.string(),
      category : z.string(),
      series : z.number(),
      sub_category : z.string()
  })

  const form = useForm<z.infer<typeof inwardSchema>>({resolver:zodResolver(inwardSchema),
    defaultValues : {
      inward_date : new Date(),
      remark : "",
      supplier : "",
      artilce_no : "",
      po_number : "",
      quantity : 0,
      color_flag : "",
      vendor : "",
      color : [],
      size : [],
      ratio : "",
      stock_ratio : 0,
      weight : 0,
      style_desc : "",
      category : '',
      series : 0,
      sub_category : "",
      color_quantity : [],
    },
    mode:"onBlur"
  })

  //Submit function
  const submit = ()=>{
    console.log('submit');
  }
  return (
    <div>
      <Card>
        <CardHeader className='flex flex-row justify-between'>
          <span className='text-3xl'>INWARD</span>
          <span className='text-3xl'>GRN:453/89</span>
        </CardHeader>
        <hr />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)}>
              {/*first row*/}
              <div className='grid gap-3 lg:flex lg:gap-14 p-5 bg-gray-700'>
                {/*inward date*/}
                <FormField
                control={form.control}
                name='inward_date'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='block text-center mb-1'>INWARD-DATE <span className='text-red-600'>*</span></FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "h-9 w-full px-5 py-5 text-lg",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto" align="start">
                          <Calendar
                          
                            mode="single"
                            onSelect={field.onChange}
                            selected={field.value}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                  </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name='remark'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='block text-center mb-1'>REMARKS <span className='text-red-500'>*</span></FormLabel>
                    <FormControl>
                      <Input {...field} className='p-5'></Input>
                    </FormControl>
                  </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name='supplier'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='text-center block mb-1'>Supplier <span className='text-red-500'>*</span></FormLabel>
                    <Select onValueChange={field.onChange}>
                       <SelectTrigger className='w-full lg:w-52 p-5 text-lg'>
                        <SelectValue placeholder="Supplier"/>
                       </SelectTrigger>
                       <SelectContent>
                        <SelectGroup>
                          <SelectLabel>SUPPLIER</SelectLabel>
                          <SelectItem value='2'>TEST SUPPLIER</SelectItem>
                          <SelectItem value='3'>YASH SHIVA</SelectItem>
                          <SelectItem value='4'>SYNDELL</SelectItem>
                        </SelectGroup>
                       </SelectContent>
                    </Select>
                    <FormMessage/>
                  </FormItem>
                )}
                />
              </div>
              {/*Second row*/}
              <div className='grid gap-3 lg:flex lg:gap-14 p-5'>
                {/*Article*/}
                <FormField
                control={form.control}
                name='article_no'
                render={({field})=>(
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <FormLabel className='block text-center'>ARTICLE <span className='text-red-500'>*</span></FormLabel>
                        <SelectTrigger className='w-full lg:w-60 p-5 text-lg'>
                          <SelectValue placeholder="Select article"/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>ARTICLES</SelectLabel>
                            <SelectItem value='1'>TEST ARTICLE</SelectItem>
                            <SelectItem value='2'>TEST ARTICLE 2</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name='po_number'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='block text-center mb-1'>PO NUMBER <span className='text-red-500'>*</span></FormLabel>
                    <Input {...field} disabled className='bg-gray-300 cursor-not-allowed p-5'></Input>
                    <FormMessage/>
                  </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name='quantity'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='block text-center mb-1'>QUANTITY <span className='text-red-500'>*</span></FormLabel>
                    <Input {...field} disabled className='p-5 cursor-not-allowed bg-gray-300'></Input>
                    <FormMessage/>
                  </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name='color_flag'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='block text-center mb-1'>COLOR FLAG <span className='text-red-500'>*</span></FormLabel>
                    <Input {...field} disabled className='p-5 cursor-not-allowed bg-gray-300'></Input>
                    <FormMessage/>
                  </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name='vendor'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='block text-center mb-1'>VENDOR <span className='text-red-500'>*</span></FormLabel>
                    <Input {...field} disabled className='p-5 bg-gray-300 cursor-not-allowed'></Input>
                    <FormMessage/>
                  </FormItem>
                )}
                />
              </div>
              {/*Third row*/}
              <div className='grid gap-3 lg:flex lg:gap-14 p-5'>
                {/*Color*/}
                <FormField
                control={form.control}
                name='color'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='block text-center mb-1'>COLOR <span className='text-red-500'>*</span></FormLabel>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className='w-full lg:w-60 p-5 text-lg'>
                        <SelectValue placeholder="SELECT COLOR"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>colors</SelectLabel>
                          <SelectItem value='1'>BLUE</SelectItem>
                          <SelectItem value='2'>GREEN</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage/>
                  </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name='size'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='block text-center mb-1'>SIZE <span className='text-red-500'>*</span></FormLabel>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className='w-full lg:w-56 p-5 text-lg'>
                        <SelectValue placeholder="SELECT SIZE"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>size</SelectLabel>
                          <SelectItem value='1'>28</SelectItem>
                          <SelectItem value='2'>32</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage/>
                  </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name='ratio'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='block mb-1 text-center'>RATIO <span className='text-red-500'>*</span></FormLabel>
                    <Input {...field} className='p-5'></Input>
                  </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name='stock_ratio'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='block mb-1 text-center'>STOCK RATIO (MOBILE APP) <span className='text-red-500'>*</span></FormLabel>
                    <Input {...field} className='p-5'></Input>
                  </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name='weight'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='block mb-1 text-center'>WEIGHT <span className='text-red-500'>*</span></FormLabel>
                    <Input {...field} className='p-5'></Input>
                  </FormItem>
                )}
                />
              </div>
               {/*fourth row*/}
               <div className='grid gap-3 lg:flex lg:gap-14 p-5'>
               <FormField
                control={form.control}
                name='style_desc'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='block text-center mb-1'>STYLE DESCRIPTION <span className='text-red-500'>*</span></FormLabel>
                    <Input {...field} disabled className='bg-gray-300 cursor-not-allowed p-5 lg:w-60'></Input>
                    <FormMessage/>
                  </FormItem>
                )}
                />
               <FormField
                control={form.control}
                name='brand_name'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='block text-center mb-1'>BRAND <span className='text-red-500'>*</span></FormLabel>
                    <Input {...field} disabled className='bg-gray-300 cursor-not-allowed p-5 lg:w-56'></Input>
                    <FormMessage/>
                  </FormItem>
                )}
                />
               <FormField
                control={form.control}
                name='category'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='block text-center mb-1'>CATEGORY <span className='text-red-500'>*</span></FormLabel>
                    <Input {...field} disabled className='bg-gray-300 cursor-not-allowed p-5 lg:w-56'></Input>
                    <FormMessage/>
                  </FormItem>
                )}
                />
               <FormField
                control={form.control}
                name='series'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='block text-center mb-1'>SERIES <span className='text-red-500'>*</span></FormLabel>
                    <Input {...field} disabled className='bg-gray-300 cursor-not-allowed p-5 lg:w-56'></Input>
                    <FormMessage/>
                  </FormItem>
                )}
                />
               <FormField
                control={form.control}
                name='sub_category'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='block text-center mb-1'>SUB CATEGORY <span className='text-red-500'>*</span></FormLabel>
                    <Input {...field} disabled className='bg-gray-300 cursor-not-allowed p-5 lg:w-52'></Input>
                    <FormMessage/>
                  </FormItem>
                )}
                />
               </div>
               {/*fifth row*/}
               <div className='grid gap-3 lg:flex lg:gap-14 p-5'>
               <FormField
                control={form.control}
                name='style_desc'
                render={({field})=>(
                  <FormItem>
                    <FormLabel className='block text-center mb-1'>NO OF PEICES <span className='text-red-500'>*</span></FormLabel>
                    <Input {...field} className='p-5 lg:w-60'></Input>
                    <FormMessage/>
                  </FormItem>
                )}
                />
               </div>
               {/*BUTTONS row*/}
               <div className=' lg:flex  lg:justify-between p-5'>
                <div>
                  <Button className='mb-5 lg:mb-0 w-20 px-20 bg-green-500 py-5 text-lg'>Submit</Button>
                </div>
                <div className='flex gap-5'>
                  <Button className='w-20 px-20 bg-green-500 py-5 text-lg'>Back</Button>
                  <Button className='w-20 px-20 bg-green-500 py-5 text-lg'>Cancel</Button>
                </div>
               </div>
          </form>
        </Form>
        
      </Card>
    </div>
  )
}

export default Add_inward