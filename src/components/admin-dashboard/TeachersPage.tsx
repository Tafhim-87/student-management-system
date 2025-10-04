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
  Users,
  Mail,
  Calendar,
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
  DialogFooter,
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
  role: string;
  assignedClasses?: Array<{
    class: string;
    section: string;
  }>;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TeacherFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  assignedClasses: Array<{
    class: string;
    section: string;
  }>;
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  adminCode?: string;
}

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TeacherFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    assignedClasses: [{ class: "", section: "" }],
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  const api = useApi();

  // Available classes and sections for editing
  const availableClasses = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];
  const availableSections = ["A", "B", "C", "D", "E"];

  // Get current user from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        const userData: UserData = JSON.parse(userDataString);
        setCurrentUser(userData);
      }
    }
  }, []);

  // Fetch teachers based on user role
  useEffect(() => {
    const fetchTeachers = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        let response;

        if (currentUser.role === "super_admin") {
          // Super admin can see all teachers
          response = (await api.get("/teachers")) as {
            teachers: Teacher[];
          };
        } else {
          // Regular admin can only see teachers they created
          response = (await api.get("/users")) as {
            users: Teacher[];
          };

          let teachersList: Teacher[] = [];
          if (response && response.users) {
            // Filter to only show teachers created by current admin
            teachersList = response.users.filter(
              (user) =>
                user.role === "teacher" &&
                user.createdBy &&
                user.createdBy._id === currentUser.id
            );
          }

          if (teachersList.length > 0) {
            setTeachers(teachersList);
            setFilteredTeachers(teachersList);
          } else {
            setTeachers([]);
            setFilteredTeachers([]);
          }
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [currentUser]);

  // Filter teachers based on search term
  useEffect(() => {
    const filtered = teachers.filter(
      (teacher) =>
        teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.assignedClasses &&
          teacher.assignedClasses.some(
            (cls) =>
              cls.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
              cls.section.toLowerCase().includes(searchTerm.toLowerCase())
          ))
    );
    setFilteredTeachers(filtered);
  }, [searchTerm, teachers]);

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      setActionLoading(true);
      const response = await api.del(`/users/${selectedTeacher._id}`);

      if (response) {
        setTeachers((prev) =>
          prev.filter((teacher) => teacher._id !== selectedTeacher._id)
        );
        setIsDeleteDialogOpen(false);
        setSelectedTeacher(null);
        // Show success message
        if (window.showToast) {
          window.showToast("Teacher deleted successfully!", "success");
        }
      }
    } catch (error) {
      console.error("Error deleting teacher:", error);
      if (window.showToast) {
        window.showToast("Failed to delete teacher", "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      password: "", // Don't pre-fill password for security
      assignedClasses: teacher.assignedClasses || [{ class: "", section: "" }],
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsViewDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClassChange = (
    index: number,
    field: "class" | "section",
    value: string
  ) => {
    const updatedClasses = [...formData.assignedClasses];
    updatedClasses[index] = { ...updatedClasses[index], [field]: value };
    setFormData({
      ...formData,
      assignedClasses: updatedClasses,
    });
  };

  const addClassAssignment = () => {
    setFormData({
      ...formData,
      assignedClasses: [
        ...formData.assignedClasses,
        { class: "", section: "" },
      ],
    });
  };

  const removeClassAssignment = (index: number) => {
    if (formData.assignedClasses.length > 1) {
      const updatedClasses = formData.assignedClasses.filter(
        (_, i) => i !== index
      );
      setFormData({
        ...formData,
        assignedClasses: updatedClasses,
      });
    }
  };

  const handleUpdateTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      setActionLoading(true);
      const response = await api.put(`/user/${selectedTeacher._id}`, formData);  

      if (response) {
        // Update teacher in local state
        setTeachers((prev) =>
          prev.map((teacher) =>
            teacher._id === selectedTeacher._id
              ? { ...teacher, ...formData, updatedAt: new Date().toISOString() }
              : teacher
          )
        );
        setIsEditDialogOpen(false);
        setSelectedTeacher(null);
        // Show success message
        if (window.showToast) {
          window.showToast("Teacher updated successfully!", "success");
        }
      }
    } catch (error) {
      console.error("Error updating teacher:", error);
      if (window.showToast) {
        window.showToast("Failed to update teacher", "error");
      }
    } finally {
      setActionLoading(false);
    }
  }

  // Format assigned classes for display
  const formatAssignedClasses = (teacher: Teacher) => {
    if (!teacher.assignedClasses || teacher.assignedClasses.length === 0) {
      return "Not assigned";
    }
    return teacher.assignedClasses
      .map((cls) => `${cls.class}-${cls.section}`)
      .join(", ");
  };

  // Check if current user can edit/delete this teacher
  const canModifyTeacher = (teacher: Teacher) => {
    if (!currentUser) return false;

    // Super admin can modify all teachers
    if (currentUser.role === "super_admin") return true;

    // Regular admin can only modify teachers they created
    return teacher.createdBy && teacher.createdBy._id === currentUser.id;
  };

  const columns = [
    {
      name: "Teacher",
      selector: (row: Teacher) => `${row.firstName} ${row.lastName}`,
      sortable: true,
      grow: 2,
      cell: (row: Teacher) => (
        <div
          className="cursor-pointer hover:text-blue-600 hover:underline"
          onClick={() => openViewDialog(row)}
        >
          {row.firstName} {row.lastName}
        </div>
      ),
    },
    {
      name: "Contact",
      selector: (row: Teacher) => row.email,
      sortable: true,
      grow: 2,
      cell: (row: Teacher) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500" />
          {row.email}
        </div>
      ),
    },
    {
      name: "Assigned Classes",
      selector: (row: Teacher) => formatAssignedClasses(row),
      sortable: true,
      grow: 2,
      cell: (row: Teacher) => (
        <div className="flex flex-wrap gap-1">
          {row.assignedClasses?.map((cls, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {cls.class}-{cls.section}
            </Badge>
          )) || "Not assigned"}
        </div>
      ),
    },
    {
      name: "Created By",
      selector: (row: Teacher) =>
        row.createdBy
          ? `${row.createdBy.firstName} ${row.createdBy.lastName}`
          : "System",
      sortable: true,
      grow: 1.5,
    },
    {
      name: "Joined Date",
      selector: (row: Teacher) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      grow: 1.5,
      cell: (row: Teacher) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row: Teacher) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openViewDialog(row)}
            title="View Details"
          >
            <Users className="h-4 w-4" />
          </Button>
          {canModifyTeacher(row) && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(row)}
                title="Edit Teacher"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => openDeleteDialog(row)}
                title="Delete Teacher"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
      grow: 1.5,
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#f8fafc",
        fontWeight: "bold",
        fontSize: "14px",
        borderBottom: "2px solid #e2e8f0",
      },
    },
    rows: {
      style: {
        fontSize: "14px",
        minHeight: "60px",
        "&:not(:last-of-type)": {
          borderBottom: "1px solid #e2e8f0",
        },
      },
    },
  };

  createTheme(
    "solarized",
    {
      text: {
        primary: "#1e293b",
        secondary: "#64748b",
      },
      background: {
        default: "#ffffff",
      },
      context: {
        background: "#f8fafc",
        text: "#1e293b",
      },
      divider: {
        default: "#e2e8f0",
      },
      action: {
        button: "rgba(0,0,0,.54)",
        hover: "rgba(0,0,0,.08)",
        disabled: "rgba(0,0,0,.12)",
      },
    },
    "light"
  );

  // Show user role in header
  const getUserRoleDisplay = () => {
    if (!currentUser) return "";

    const roleMap: { [key: string]: string } = {
      super_admin: "Super Admin",
      admin: "Administrator",
      teacher: "Teacher",
      student: "Student",
    };
    return roleMap[currentUser.role] || currentUser.role;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="p-6">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="p-6">
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                Teachers Management
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500">
                  {currentUser?.role === "super_admin"
                    ? "All teachers in the system"
                    : "Teachers created by you"}
                </p>
                <Badge variant="outline" className="text-xs">
                  {getUserRoleDisplay()}
                </Badge>
              </div>
            </div>
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
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teachers by name, email, or class..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Badge variant="secondary" className="ml-4">
                {filteredTeachers.length} teachers
              </Badge>
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
              noDataComponent={
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No teachers found</p>
                  <p className="text-sm">
                    {currentUser?.role === "super_admin"
                      ? "No teachers in the system yet"
                      : "You haven't created any teachers yet"}
                  </p>
                </div>
              }
            />
          </CardContent>
        </Card>

        {/* View Teacher Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Teacher Details</DialogTitle>
            </DialogHeader>
            {selectedTeacher && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-500 text-sm">
                        Personal Information
                      </h3>
                      <div className="mt-2 space-y-3">
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {selectedTeacher.firstName}{" "}
                              {selectedTeacher.lastName}
                            </p>
                            <p className="text-sm text-gray-500">Full Name</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {selectedTeacher.email}
                            </p>
                            <p className="text-sm text-gray-500">
                              Email Address
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-500 text-sm">
                        Class Assignments
                      </h3>
                      <div className="mt-2 space-y-2">
                        {selectedTeacher.assignedClasses &&
                        selectedTeacher.assignedClasses.length > 0 ? (
                          selectedTeacher.assignedClasses.map((cls, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="mr-2 mb-2"
                            >
                              Class {cls.class} - Section {cls.section}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            No classes assigned
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-500 text-sm">
                        Account Information
                      </h3>
                      <div className="mt-2 space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {new Date(
                                selectedTeacher.createdAt
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">Joined Date</p>
                          </div>
                        </div>
                        {selectedTeacher.createdBy && (
                          <div>
                            <p className="text-sm">
                              Created by: {selectedTeacher.createdBy.firstName}{" "}
                              {selectedTeacher.createdBy.lastName}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Teacher Dialog - Only show if user can modify */}
        {selectedTeacher && canModifyTeacher(selectedTeacher) && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Teacher</DialogTitle>
                <DialogDescription>
                  Update teacher information and class assignments.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    placeholder="Leave blank to keep current password"
                  />
                  <p className="text-xs text-gray-500">
                    Only enter if you want to change the password
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">
                      Class Assignments
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addClassAssignment}
                    >
                      + Add Class
                    </Button>
                  </div>

                  {formData.assignedClasses.map((classItem, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <select
                          value={classItem.class}
                          onChange={(e) =>
                            handleClassChange(index, "class", e.target.value)
                          }
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Select Class</option>
                          {availableClasses.map((cls) => (
                            <option key={cls} value={cls}>
                              Class {cls}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <select
                          value={classItem.section}
                          onChange={(e) =>
                            handleClassChange(index, "section", e.target.value)
                          }
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Select Section</option>
                          {availableSections.map((section) => (
                            <option key={section} value={section}>
                              Section {section}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formData.assignedClasses.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeClassAssignment(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateTeacher}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Updating..." : "Update Teacher"}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Teacher</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the
                teacher account
                {selectedTeacher &&
                  ` for ${selectedTeacher.firstName} ${selectedTeacher.lastName}`}
                .
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteTeacher}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete Teacher"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TeachersPage;
