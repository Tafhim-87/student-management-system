'use client';

import { useState, useEffect } from 'react';
import { 
  User, LogOut, PlusCircle, Menu, X 
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

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function DashboardNav() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [showTeacherDialog, setShowTeacherDialog] = useState<boolean>(false);
  const [showStudentDialog, setShowStudentDialog] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>({
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

  return (
    <>
      <nav className="bg-white shadow-sm rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Dialogs */}
      <CreateTeacherDialog 
        open={showTeacherDialog} 
        onOpenChange={setShowTeacherDialog} 
      />
      <CreateStudentDialog 
        open={showStudentDialog} 
        onOpenChange={setShowStudentDialog} 
      />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  <span>{userData.firstName} {userData.lastName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{userData.firstName} {userData.lastName}</span>
                    <span className="text-sm text-gray-500 capitalize">{userData.role}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4">
            <Button 
              onClick={() => setShowTeacherDialog(true)} 
              className="w-full gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Teacher
            </Button>
            <Button 
              onClick={() => setShowStudentDialog(true)} 
              className="w-full gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Student
            </Button>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">{userData.firstName} {userData.lastName}</span>
                <span className="text-sm text-gray-500 capitalize">{userData.role}</span>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="w-full gap-2 text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}