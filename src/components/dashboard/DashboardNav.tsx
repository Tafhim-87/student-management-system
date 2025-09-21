// components/dashboard/DashboardNav.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateAdminDialog from "@/components/dashboard/CreateAdminDialog";
import CreateTeacherDialog from "@/components/dashboard/CreateTeacherDialog";
import { useRouter } from "next/navigation";
import { Menu, LogOut, User, UserCog } from "lucide-react";

export default function DashboardNav() {
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showTeacherDialog, setShowTeacherDialog] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/signin");
  };

  return (
    <>
      <nav className="bg-card border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowAdminDialog(true)}>
                <UserCog className="mr-2 h-4 w-4" />
                Create Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowTeacherDialog(true)}>
                <User className="mr-2 h-4 w-4" />
                Create Teacher
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <CreateAdminDialog 
        open={showAdminDialog}
        onOpenChange={setShowAdminDialog}
      />
      
      <CreateTeacherDialog 
        open={showTeacherDialog}
        onOpenChange={setShowTeacherDialog}
      />
    </>
  );
}