"use client";

import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
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
  GraduationCap,
  X
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

interface Student {
  _id: string;
  name: string;
  userName: string;
  roll: string | number;
  class: string;
  section?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

interface StudentFormData {
  name: string;
  userName: string;
  password: string;
  roll: string;
  class: string;
  section: string;
}

interface Filters {
  class: string;
  section: string;
  status: string;
}

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    userName: "",
    password: "",
    roll: "",
    class: "",
    section: ""
  });
  const [filters, setFilters] = useState<Filters>({
    class: "",
    section: "",
    status: ""
  });
  const [loading, setLoading] = useState(true);
  
  const api = useApi();

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await api.get("/student") as {
            students: Student[];
        }
        if (response && response.students) {
          setStudents(response.students);
          setFilteredStudents(response.students);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter students based on search term and filters
  useEffect(() => {
    const filtered = students.filter(student => {
      // Convert all values to string for safe comparison
      const searchTermLower = searchTerm.toLowerCase();
      const name = student.name?.toLowerCase() || "";
      const userName = student.userName?.toLowerCase() || "";
      const roll = student.roll?.toString().toLowerCase() || "";
      const studentClass = student.class?.toLowerCase() || "";
      const section = student.section?.toLowerCase() || "";
      const createdByName = student.createdBy 
        ? `${student.createdBy.firstName} ${student.createdBy.lastName}`.toLowerCase()
        : "";

      // Search term filter
      const matchesSearch = 
        name.includes(searchTermLower) ||
        userName.includes(searchTermLower) ||
        roll.includes(searchTermLower) ||
        studentClass.includes(searchTermLower) ||
        section.includes(searchTermLower) ||
        createdByName.includes(searchTermLower);

      // Additional filters
      const matchesClass = !filters.class || student.class === filters.class;
      const matchesSection = !filters.section || student.section === filters.section;
      const matchesStatus = !filters.status || student.status === filters.status;

      return matchesSearch && matchesClass && matchesSection && matchesStatus;
    });
    
    setFilteredStudents(filtered);
  }, [searchTerm, students, filters]);

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;

    try {
      const response = await api.put(`/student/${selectedStudent._id}`, formData) as {
        student: Student;
      }

      if (response) {
        setStudents(prev =>
          prev.map(student =>
            student._id === selectedStudent._id ? response.student : student
          )
        );
        setIsEditDialogOpen(false);
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;

    try {
      const response = await api.del(`/student/${selectedStudent._id}`);

      if (response) {
        setStudents(prev => prev.filter(student => student._id !== selectedStudent._id));
        setIsDeleteDialogOpen(false);
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      userName: student.userName,
      password: "", // Don't prefill password for security
      roll: student.roll.toString(), // Convert to string for input
      class: student.class,
      section: student.section || ""
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      class: "",
      section: "",
      status: ""
    });
  };

  const hasActiveFilters = filters.class || filters.section || filters.status;

  // Get unique classes and sections for filter dropdowns
  const uniqueClasses = [...new Set(students.map(student => student.class))].filter(Boolean);
  const uniqueSections = [...new Set(students.map(student => student.section).filter(Boolean))];

  // Custom delete confirmation component
  const DeleteConfirmation = () => (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the student
            account and remove their data from our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteStudent}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  const columns = [
    {
      name: "Name",
      selector: (row: Student) => row.name,
      sortable: true,
      grow: 2,
    },
    {
      name: "Username",
      selector: (row: Student) => row.userName,
      sortable: true,
      grow: 1.5,
    },
    {
      name: "Roll No",
      selector: (row: Student) => row.roll.toString(), // Convert to string for display
      sortable: true,
      grow: 1,
    },
    {
      name: "Class",
      selector: (row: Student) => row.class,
      sortable: true,
      grow: 1,
    },
    {
      name: "Section",
      selector: (row: Student) => row.section || "N/A",
      sortable: true,
      grow: 1,
    },
    {
      name: "Status",
      cell: (row: Student) => (
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
      name: "Created By",
      cell: (row: Student) => (
        row.createdBy ? (
          <div className="text-sm">
            <div>{row.createdBy.firstName} {row.createdBy.lastName}</div>
            <div className="text-xs text-gray-500">{row.createdBy.role}</div>
          </div>
        ) : "N/A"
      ),
      sortable: false,
      grow: 2,
    },
    {
      name: "Joined Date",
      selector: (row: Student) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      grow: 1.5,
    },
    {
      name: "Actions",
      cell: (row: Student) => (
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
      grow: 1,
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f8fafc',
        fontWeight: 'bold',
        fontSize: '14px',
      },
    },
    rows: {
      style: {
        fontSize: '14px',
        minHeight: '60px',
      },
    },
  };

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
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Students Management
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                Filtered: {filteredStudents.length} of {students.length}
              </Badge>
            )}
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
                  Import Students
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name, username, roll, class, section..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center">
                      !
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter Students</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="px-2 py-1.5">
                  <label className="text-xs font-medium text-gray-500">Class</label>
                  <select
                    className="w-full p-2 border rounded-md text-sm"
                    value={filters.class}
                    onChange={(e) => setFilters({...filters, class: e.target.value})}
                  >
                    <option value="">All Classes</option>
                    {uniqueClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div className="px-2 py-1.5">
                  <label className="text-xs font-medium text-gray-500">Section</label>
                  <select
                    className="w-full p-2 border rounded-md text-sm"
                    value={filters.section}
                    onChange={(e) => setFilters({...filters, section: e.target.value})}
                  >
                    <option value="">All Sections</option>
                    {uniqueSections.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                <div className="px-2 py-1.5">
                  <label className="text-xs font-medium text-gray-500">Status</label>
                  <select
                    className="w-full p-2 border rounded-md text-sm"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.class && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Class: {filters.class}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilters({...filters, class: ""})}
                  />
                </Badge>
              )}
              {filters.section && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Section: {filters.section}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilters({...filters, section: ""})}
                  />
                </Badge>
              )}
              {filters.status && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {filters.status}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilters({...filters, status: ""})}
                  />
                </Badge>
              )}
            </div>
          )}

          <DataTable
            columns={columns}
            data={filteredStudents}
            customStyles={customStyles}
            pagination
            highlightOnHover
            responsive
            striped
            persistTableHead
          />
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the student&apos;s information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <Input
              placeholder="Username"
              value={formData.userName}
              onChange={(e) => setFormData({...formData, userName: e.target.value})}
            />
            <Input
              type="password"
              placeholder="New Password (leave empty to keep current)"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Roll Number"
                value={formData.roll}
                onChange={(e) => setFormData({...formData, roll: e.target.value})}
              />
              <Input
                placeholder="Class"
                value={formData.class}
                onChange={(e) => setFormData({...formData, class: e.target.value})}
              />
            </div>
            <Input
              placeholder="Section (Optional)"
              value={formData.section}
              onChange={(e) => setFormData({...formData, section: e.target.value})}
            />
          </div>
          <Button onClick={handleUpdateStudent}>Update Student</Button>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation />
    </div>
  );
};

export default StudentsPage;