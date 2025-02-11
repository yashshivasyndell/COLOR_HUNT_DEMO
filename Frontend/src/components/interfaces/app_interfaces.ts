export interface CreateProductFormData {
  product_name: string;
  product_unit: any;
  hsn_code?: string; 
  product_description?: string;
  batch_info: Array<
  {
    batch_number: string;
    rate: number;
    manufacture_date: Date;
    expiry_date: Date;
  }>;
}

export type OptionType = {
  value: number;
  label: string;
};
