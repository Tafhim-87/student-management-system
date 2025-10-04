// components/CreateTeacherDialog.jsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, Plus } from 'lucide-react';
import useApi from '@/hooks/useApi';

export default function CreateTeacherDialog({ open, onOpenChange, onTeacherCreated }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [assignedClasses, setAssignedClasses] = useState([{ class: '', section: '' }]);
  const [loading, setLoading] = useState(false);
  
  const api = useApi();

  // Available classes and sections
  const availableClasses = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const availableSections = ['A', 'B', 'C', 'D', 'E'];

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({ firstName: '', lastName: '', email: '', password: '' });
      setAssignedClasses([{ class: '', section: '' }]);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate assigned classes
      const validClasses = assignedClasses.filter(cls => cls.class && cls.section);
      
      if (validClasses.length === 0) {
        alert('Please add at least one class assignment');
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        assignedClasses: validClasses
      };

      const result = await api.post('/teacher/create', payload);
      if (result) {
        onOpenChange(false);
        setFormData({ firstName: '', lastName: '', email: '', password: '' });
        setAssignedClasses([{ class: '', section: '' }]);
        
        if (onTeacherCreated) {
          onTeacherCreated(result.user);
        }
        
        // Optional: Show success message instead of reloading
        if (window.showToast) {
          window.showToast('Teacher created successfully!', 'success');
        } else {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error creating teacher:', error);
      if (window.showToast) {
        window.showToast('Failed to create teacher', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleClassChange = (index, field, value) => {
    const updatedClasses = [...assignedClasses];
    updatedClasses[index] = { ...updatedClasses[index], [field]: value };
    setAssignedClasses(updatedClasses);
  };

  const addClassAssignment = () => {
    setAssignedClasses([...assignedClasses, { class: '', section: '' }]);
  };

  const removeClassAssignment = (index) => {
    if (assignedClasses.length > 1) {
      const updatedClasses = assignedClasses.filter((_, i) => i !== index);
      setAssignedClasses(updatedClasses);
    }
  };

  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.password.length >= 6 &&
      assignedClasses.some(cls => cls.class && cls.section)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Teache
        </Button>
      </DialogTrigger> */}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Teacher</DialogTitle>
          <p className="text-sm text-gray-500">
            Add a new teacher and assign them to classes and sections
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Enter last name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="teacher@school.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="At least 6 characters"
              />
              <p className="text-xs text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>
          </div>

          {/* Class Assignments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Class Assignments *</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addClassAssignment}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Class
              </Button>
            </div>
            
            <div className="space-y-3">
              {assignedClasses.map((classItem, index) => (
                <div key={index} className="flex items-end gap-3 p-3 border rounded-lg bg-gray-50">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm">Class</Label>
                      <Select
                        value={classItem.class}
                        onValueChange={(value) => handleClassChange(index, 'class', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableClasses.map((cls) => (
                            <SelectItem key={cls} value={cls}>
                              Class {cls}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Section</Label>
                      <Select
                        value={classItem.section}
                        onValueChange={(value) => handleClassChange(index, 'section', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSections.map((section) => (
                            <SelectItem key={section} value={section}>
                              Section {section}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {assignedClasses.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeClassAssignment(index)}
                      className="mb-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-500">
              Teacher will be able to view and manage students in the assigned classes
            </p>
          </div>

          {/* Error Display */}
          {api.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{api.error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !isFormValid()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Teacher'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}