import { Eye, Frown, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Heading } from "../../layout/Heading";
import { useEffect, useState } from "react";
import { apiError } from "../../../types/types";
import { deleteParty } from "../../../api";
import { getAllParties, fetchPartyDetails } from "../../../api";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../Table/data-table";

import { DataTableColumnHeader } from "../Table/data-table-column-header";
import { Badge } from "../../ui/badge";
import { LoadingButton } from "../../ui/LoadingButton";
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

// import { Checkbox } from "../../ui/checkbox";
import CustomToast from "../../../showToast";
import { DialogProvider } from "../DialogProvider";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
const Party: React.FC = () => {
  const navigate = useNavigate();
  const [partyData, setPartyData] = useState([]);
  const [selectedPartyDetails, setSelectedPartyDetails] = useState({
    party_name: "",
    billing_address: "",
    state: "",
    city: "",
    email: "",
    party_phone_no: "",
    gst_no: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  type Party = {
    id: number;
    party_name: string;
    email: string;
    party_phone_no: string;
    state: string;
    city: string;
    status: string;
  };


  // Columns for Party List Table
  const partyTableColumns: ColumnDef<Party>[] = [
    {
      accessorKey: "party_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: "party_phone_no",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
    },
    {
      id: "state_city",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="State/City" />
      ),
      accessorFn: (row) => `${row.state}/${row.city}`,
      cell: ({ row }) => (
        <span>
          {row.original.state.split(" ")[0]}/{row.original.city}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");

        if (status === "active") {
          return <Badge variant={"success"}>Active</Badge>;
        }

        if (status === "deactivated") {
          return <Badge variant={"destructive"}>Deactivated</Badge>;
        }
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const party = row.original;
        return (
          <div className="flex items-center gap-3">
            <div>
              <Pencil
                onClick={() => navigate(`/party/edit/${party.id}`)}
                className="cursor-pointer  px-[3px] rounded-sm stroke-current hover:border hover:bg-secondary-foreground  hover:text-background"
              />
            </div>

            <div>
              <Eye
                onClick={() => getPartyDetails(party.id)}
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
                    the party and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <LoadingButton
                    className="bg-red-500"
                    variant="delete"
                    loading={loading}
                    content="Delete"
                    handleClick={() => handleDeleteParty(party)}
                  />
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  // fetch all parties
  useEffect(() => {
    fetchParties();
  }, []);
  
  const handleAddPartyNavigate = () => {
    navigate("/party/create");
  };

  const fetchParties = async () => {
    try {
      setLoading(true);
      const response = await getAllParties();
      if (response.statusCode === 200) {
        setPartyData(response.data);
      }
    } catch (error) {
      console.error("No data found");
    } finally {
      setLoading(false);
    }
  };

  // get detail of a specific party
  const getPartyDetails = async (id: number) => {
    try {
      setLoading(true);
      setOpen(true);
      const response = await fetchPartyDetails({ id });
      if (response.statusCode === 200) {
        setSelectedPartyDetails(response.data);
      }
    } catch (error) {
      setOpen(false);
      const apiError = error as apiError;
      if (apiError.statusCode === 400) {
        CustomToast(400, "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete Party
  const handleDeleteParty = async (party: Party) => {
    try {
      setLoading(true);
      const response = await deleteParty({ id: party.id });
      if (response.statusCode === 200) {
        CustomToast(response.statusCode, "Party Deleted");
        await fetchParties();
      }
    } catch (error) {
      const apiError = error as apiError;
      if (apiError.errors.partyNotFound) {
        CustomToast(apiError.statusCode, apiError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const partyDialogContent = () => {
    return (
      <>
        {selectedPartyDetails && Object.keys(selectedPartyDetails).length ? (
          <div className="flex flex-col gap-3">
            <div className="input-wrapper">
              <Label>Party Name</Label>
              <Input
                className="dark:text-white  text-black"
                disabled
                type="text"
                value={selectedPartyDetails?.party_name}
              />
            </div>

            <div className="input-wrapper">
              <Label>GST Number</Label>
              <Input
                className="dark:text-white  text-black"
                disabled
                value={
                  selectedPartyDetails?.gst_no?.trim().length
                    ? selectedPartyDetails.gst_no
                    : "--"
                }
              ></Input>
            </div>

            <div className="input-wrapper">
              <Label>Party Address</Label>
              <Textarea
                className="dark:text-white  text-black"
                disabled
                value={selectedPartyDetails.billing_address}
              ></Textarea>
            </div>

            <div className="input-wrapper">
              <Label>State/City</Label>
              <Input
                className="dark:text-white text-black"
                disabled
                type="text"
                value={`${selectedPartyDetails.state}/${selectedPartyDetails.city}`}
              />
            </div>

            <div className="input-wrapper">
              <Label>Email</Label>
              <Input
                disabled
                className="dark:text-white  text-black"
                type="text"
                value={selectedPartyDetails.email}
              />
            </div>

            <div className="input-wrapper">
              <Label>Phone No</Label>
              <Input
                disabled
                className="dark:text-white  text-black"
                type="text"
                value={selectedPartyDetails.party_phone_no}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full justify-center items-center">
            <Frown />
            <span>No data found</span>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="main-wrapper">
        <div className="content-wrapper flex flex-col gap-3">

          {/* Table  */}
          <div className="p-2">
            {/* Heading */}
            <Heading title="Party List" content={
              <LoadingButton
              loading={loading}
              content="Add Party"
              handleClick={handleAddPartyNavigate}
            />
            }/>

            <DataTable columns={partyTableColumns} data={partyData} />
          </div>

          {/* View Party Dialog */}
          <div>
            <DialogProvider
              loading={loading}
              title="Party Details"
              isOpen={open}
              onOpenChange={setOpen}
              content={partyDialogContent}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Party;
