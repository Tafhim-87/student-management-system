'use client';

import { useState, useEffect } from 'react';
import { 
  User, LogOut, Menu, X, Users, GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CreateTeacherDialog from './CreateTeacherDialog';
import CreateStudentDialog from './CreateStudentDialog';

// Extend the Window interface to include showToast
declare global {
  interface Window {
    showToast?: (message: string, type: string) => void;
  }
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  adminCode?: string;
  assignedClasses?: Array<{ class: string; section: string }>;
}

interface StudentFormData {
  name: string;
  userName: string;
  password: string;
  roll: string;
  class: string;
  section: string;
}

export default function DashboardNav() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [showTeacherDialog, setShowTeacherDialog] = useState<boolean>(false);
  const [showStudentDialog, setShowStudentDialog] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  });
  
  // Safely get user data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userDataString = localStorage.getItem('user') || '{}';
      const parsedUserData: UserData = JSON.parse(userDataString);
      setUserData(parsedUserData);
    }
  }, []);

  const handleLogout = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/signin';
  };

  const handleTeacherCreated = (teacher: { firstName: string; lastName: string; email: string; password: string; }) => {
    console.log('Teacher created:', teacher);
    // You can add a toast notification here
    if (window.showToast) {
      window.showToast('Teacher created successfully!', 'success');
    }
  };

  const handleStudentCreated = (student: StudentFormData) => {
    console.log('Student created:', student);
    // You can add a toast notification here
    if (window.showToast) {
      window.showToast('Student created successfully!', 'success');
    }
  };

  // Check if user can create teachers (admin or super_admin)
  const canCreateTeachers = ['admin', 'super_admin'].includes(userData.role);
  
  // Check if user can create students (admin or super_admin)
  const canCreateStudents = ['admin', 'super_admin'].includes(userData.role);

  // Get user display name
  const getUserDisplayName = () => {
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    return userData.email || 'User';
  };

  // Get user role display text
  const getUserRoleDisplay = () => {
    const roleMap: { [key: string]: string } = {
      'super_admin': 'Super Admin',
      'admin': 'Administrator',
      'teacher': 'Teacher',
      'student': 'Student'
    };
    return roleMap[userData.role] || userData.role;
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b rounded-lg">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo/Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">School Management</h1>
              </div>
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Create buttons for admin users */}
              {canCreateTeachers && (
                <Button
                  onClick={() => setShowTeacherDialog(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  Add Teacher
                </Button>
              )}
              
              {canCreateStudents && (
                <Button
                  onClick={() => setShowStudentDialog(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <GraduationCap className="h-4 w-4" />
                  Add Student
                </Button>
              )}

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 hover:bg-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left hidden sm:block">
                        <div className="text-sm font-medium text-gray-900">
                          {getUserDisplayName()}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {getUserRoleDisplay()}
                        </div>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs leading-none text-gray-500">
                        {userData.email}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 capitalize">
                          {getUserRoleDisplay()}
                        </span>
                        {userData.adminCode && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {userData.adminCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-red-600 cursor-pointer focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hover:bg-gray-100"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-3 space-y-3">
              {/* User info */}
              <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userData.email}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500 capitalize">
                      {getUserRoleDisplay()}
                    </span>
                    {userData.adminCode && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {userData.adminCode}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                {canCreateTeachers && (
                  <Button 
                    onClick={() => {
                      setShowTeacherDialog(true);
                      setIsMenuOpen(false);
                    }} 
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Add Teacher
                  </Button>
                )}
                
                {canCreateStudents && (
                  <Button 
                    onClick={() => {
                      setShowStudentDialog(true);
                      setIsMenuOpen(false);
                    }} 
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Add Student
                  </Button>
                )}
              </div>

              {/* Logout button */}
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Dialogs */}
      {canCreateTeachers && (
        <CreateTeacherDialog 
          open={showTeacherDialog} 
          onOpenChange={setShowTeacherDialog}
          onTeacherCreated={handleTeacherCreated}
        />
      )}
      
      {canCreateStudents && (
        <CreateStudentDialog 
          open={showStudentDialog} 
          onOpenChange={setShowStudentDialog}
          onStudentCreated={handleStudentCreated}
        />
      )}
    </>
  );
}