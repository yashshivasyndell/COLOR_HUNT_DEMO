/* eslint-disable @typescript-eslint/no-unused-vars */
import { Eye, Frown, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import moment from 'moment'

import { useNavigate } from "react-router-dom";
import { fetchProductDetails, fetchProducts } from "../../../api";
import { apiError } from "../../../types/types";
import { ColumnDef } from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/alert-dialog";
import { LoadingButton } from "../../ui/LoadingButton";
import { Heading } from "../../layout/Heading";
import { DataTable } from "../Table/data-table";
import CustomToast from "../../../showToast";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { DialogProvider } from "../DialogProvider";
import { DataTableColumnHeader } from "../Table/data-table-column-header";

const Product: React.FC = () => {
  type Products = {
    id: number;
    name: string;
    description: string;
    hsn_code: string;
  };

  const productColumns: ColumnDef<Products>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div >{data.description.trim().length ? data.description : "--"}</div>
        );
      },
    },
    {
      accessorKey: "hsn_code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="HSN Code" />
      ),
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div>{data.hsn_code.trim().length ? data.hsn_code : "--"}</div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-3">
            <div>
              <Pencil
                onClick={() => navigate(`/products/edit/${product.id}`)}
                className="cursor-pointer  px-[3px] rounded-sm stroke-current hover:border hover:bg-secondary-foreground  hover:text-background"
              />
            </div>

            <div>
              <Eye
                onClick={() => getProductDetails(product.id)}
                className="cursor-pointer  px-[3px] rounded-sm stroke-current hover:border hover:bg-secondary-foreground  hover:text-background"
              />
            </div>

            <AlertDialog>
              <AlertDialogTrigger>
                <Trash2 className="cursor-pointer  px-[3px] rounded-sm stroke-current hover:border hover:bg-secondary-foreground  hover:text-background" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the record and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <LoadingButton
                    className="bg-red-500"
                    variant="delete"
                    loading={loading}
                    content="Delete"
                    handleClick={() => ""}
                  />
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState({
    name: '',
    description: '',
    hsn_code: '',
    batches: [],
  })

  const handleAddProductNavigate = () => {
    navigate("/products/create");
  };
  // fetch all products
  const getProducts = async () => {
    try {
      setLoading(true);
      const response = await fetchProducts();
      setProducts(response.data);
    } catch (error) {
      const apiError = error as apiError;
      if (apiError.statusCode === 400) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };




  // get product information
  const getProductDetails = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetchProductDetails({ id });

      if (response.statusCode === 200) {
        const details = response?.data?.[0];
        setSelectedProduct((prev) => ({
          ...prev,
          name: details.product_name,
          hsn_code: details.hsn_code,
          description: details.description,
          batches: details.batches,
        }));
        setOpen(true);
      }


    } catch (error) {
      const apiError = error as apiError;
      console.error(apiError);

      if (apiError.statusCode >= 400 && apiError.statusCode <= 500) {
        return CustomToast(500, 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);


  const productDetailsContent = () => {
    return (
      <>
        {
          selectedProduct && Object.keys(selectedProduct).length ? (
            <div className="flex flex-col gap-3">
              <div className="input-wrapper">
                <Label>Product Name</Label>
                <Input
                  className="dark:text-white  text-black"
                  disabled
                  type="text"
                  value={selectedProduct.name}
                />
              </div>

              <div className="input-wrapper">
                <Label>Product Description</Label>
                <Input
                  className="dark:text-white  text-black"
                  disabled
                  value={selectedProduct.description || "--"}
                ></Input>
              </div>

              <div className="input-wrapper">
                <Label>HSN Code</Label>
                <Input
                  className="dark:text-white text-black"
                  disabled
                  type="text"
                  value={selectedProduct.hsn_code}
                />
              </div>

              <div>Batches</div>
              <div className="flex flex-col gap-7">
                {
                  selectedProduct && selectedProduct.batches.length &&
                  selectedProduct.batches.map((batch: { batch_number: string, rate: number, manufacture_date: string | Date, expiry_date: string | Date }, index) => (
                    <>
                      <div className="flex flex-col gap-2">
                        <div className="input-wrapper">
                          <Label>Batch Number</Label>
                          <Input
                            className="dark:text-white text-black"
                            disabled
                            type="text"
                            value={batch.batch_number}
                          />
                        </div>

                        <div className="input-wrapper">
                          <Label>Rate</Label>
                          <Input
                            className="dark:text-white text-black"
                            disabled
                            type="text"
                            value={batch.rate}
                          />
                        </div>

                        <div className="input-wrapper">
                          <Label>Manufacture Date</Label>
                          <Input
                            className="dark:text-white text-black"
                            disabled
                            type="text"
                            value={moment(batch.manufacture_date).format('DD-MM-YYYY') || "--"}
                          />
                        </div>

                        <div className="input-wrapper">
                          <Label>Expiry Date</Label>
                          <Input
                            className="dark:text-white text-black"
                            disabled
                            type="text"
                            value={moment(batch.expiry_date).format('DD-MM-YYYY') || "--"}
                          />
                        </div>
                      </div>

                      {index !== selectedProduct.batches.length - 1 && <hr className="border border-secondary-foreground"></hr>}
                    </>
                  ))

                }
              </div>

            </div>
          ) : (
            <div className="flex flex-col w-full justify-center items-center">
              <Frown />
              <span>No data found</span>
            </div>
          )
        }
      </>
    )
  }

  return (
    <div className="main-wrapper w-full">
      {/* Content */}
      <div className="content-wrapper">
        <div className="p-2">
          {/* Heading */}
          <Heading title="Product List" content={
            <LoadingButton
              loading={loading}
              content="Add Product"
              handleClick={handleAddProductNavigate}
            />
          } />

          <DataTable columns={productColumns} data={products} />
        </div>
        {/* View Product Dialog */}
        <div>
          <DialogProvider
            loading={loading}
            isOpen={open}
            title="Product Details"
            content={productDetailsContent}
            onOpenChange={setOpen}
          />
        </div>
      </div>
    </div>
  );
};

export default Product;
