"use client";

import { useState, useEffect } from "react";
import DataTable, { createTheme } from "react-data-table-component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Edit,
  Trash2,
  Filter,
  Download,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import useApi from "@/hooks/useApi";
import DashboardNav from "@/components/admin-dashboard/DashboardNav";

interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface TeacherFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
}

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [, setFormData] = useState<TeacherFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
  });
  const [loading, setLoading] = useState(true);

  const api = useApi();

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/users?role=teacher") as {
          users: Teacher[];
        };
        if (response && response.users) {
          setTeachers(response.users);
          setFilteredTeachers(response.users);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Filter teachers based on search term
  useEffect(() => {
    const filtered = teachers.filter(
      (teacher) =>
        teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.subject &&
          teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredTeachers(filtered);
  }, [searchTerm, teachers]);

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      const response = await api.del(`/users/${selectedTeacher._id}`);

      if (response) {
        setTeachers((prev) =>
          prev.filter((teacher) => teacher._id !== selectedTeacher._id)
        );
        setIsDeleteDialogOpen(false);
        setSelectedTeacher(null);
      }
    } catch (error) {
      console.error("Error deleting teacher:", error);
    }
  };

  const openEditDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone || "",
      subject: teacher.subject || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteDialogOpen(true);
  };

  // Custom delete confirmation component
  const DeleteConfirmation = () => (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            teacher account and remove their data from our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteTeacher}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  const columns = [
    {
      name: "Name",
      selector: (row: Teacher) => `${row.firstName} ${row.lastName}`,
      sortable: true,
      grow: 2,
    },
    {
      name: "Email",
      selector: (row: Teacher) => row.email,
      sortable: true,
      grow: 2,
    },
    {
      name: "Phone",
      selector: (row: Teacher) => row.phone || "N/A",
      sortable: true,
      grow: 1.5,
    },
    {
      name: "Subject",
      selector: (row: Teacher) => row.subject || "N/A",
      sortable: true,
      grow: 1.5,
    },
    {
      name: "Status",
      cell: (row: Teacher) => (
        <Badge
          variant={row.status === "active" ? "default" : "secondary"}
          className={row.status === "active" ? "bg-green-500" : "bg-gray-500"}
        >
          {row.status}
        </Badge>
      ),
      sortable: true,
      grow: 1,
    },
    {
      name: "Joined Date",
      selector: (row: Teacher) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      grow: 1.5,
    },
    {
      name: "Actions",
      cell: (row: Teacher) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditDialog(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openDeleteDialog(row)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      // Removed the problematic props
      grow: 1,
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#f8fafc",
        fontWeight: "bold",
        fontSize: "14px",
      },
    },
    rows: {
      style: {
        fontSize: "14px",
        minHeight: "60px",
      },
    },
  };

  createTheme(
    "solarized",
    {
      text: {
        primary: "#000000",
        secondary: "#000000",
      },
      background: {
        default: "#f8fafc",
      },
      context: {
        background: "#f8fafc",
        text: "#000000",
      },
      divider: {
        default: "#f8fafc",
      },
      action: {
        button: {
          disabled: "#f8fafc",
          default: "#f8fafc",
          hover: "#f8fafc",
          active: "#f8fafc",
        },
      },
    },
    "light"
  );

  if (loading) {
    return (
      <div className="p-6">
        <DashboardNav />
        <Card className="mt-6">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DashboardNav />

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">
            Teachers Management
          </CardTitle>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Teachers
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredTeachers}
            customStyles={customStyles}
            theme="solarized"
            pagination
            highlightOnHover
            responsive
            striped
            persistTableHead
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation />
    </div>
  );
};

export default TeachersPage;
