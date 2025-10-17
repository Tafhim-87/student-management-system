'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer } from 'lucide-react';
import useApi from '@/hooks/useApi';

interface Student {
  id: string;
  name: string;
  userName: string;
  roll: string;
  class: string;
  section?: string;
  role: string;
}

interface Result {
  semester: string;
  examType: string;
  marks: Array<{
    subject: string;
    mcqScore: number;
    mcqTotal: number;
    cqScore: number;
    cqTotal: number;
  }>;
  totalMcqMarks: number;
  totalCqMarks: number;
  totalMarks: number;
  averageGPA: number;
}

interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  user: Student;
}

interface ResultResponse {
  student: Student;
  results: Result;
}

export default function StudentDashboard() {
  const { post, get, data, error } = useApi<SignInResponse | ResultResponse>();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [examType, setExamType] = useState('combined');
  const [student, setStudent] = useState<Student | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const studentId = localStorage.getItem('studentId');
    const storedStudent = localStorage.getItem('student');
    if (accessToken && studentId && storedStudent) {
      setIsAuthenticated(true);
      setStudent(JSON.parse(storedStudent));
    }
  }, []);

  const handleLogin = useCallback(async () => {
    if (!userName || !password) {
      return;
    }

    const response = await post('/signin', { email: userName, password });
    if (response && 'user' in response && response.user.role === 'student') {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('studentId', response.user.id);
      localStorage.setItem('student', JSON.stringify(response.user));
      setIsAuthenticated(true);
      setStudent(response.user);
      setUserName('');
      setPassword('');
    }
  }, [userName, password, post]);

  const handleFetchResults = useCallback(async () => {
    const studentId = localStorage.getItem('studentId');
    if (studentId) {
      await get(`/results/${studentId}/${examType}`);
      setShowResults(true);
    }
  }, [get, examType]);

  const handleLogout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await post('/logout', { refreshToken });
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('studentId');
    localStorage.removeItem('student');
    setIsAuthenticated(false);
    setStudent(null);
    setShowResults(false);
  }, [post]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Student Login</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="userName">Username</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Welcome, {student?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-muted-foreground">Username: {student?.userName}</p>
            <p className="text-muted-foreground">Roll: {student?.roll}</p>
            <p className="text-muted-foreground">
              Class: {student?.class}
              {student?.section && ` - ${student.section}`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={examType} onValueChange={setExamType} className="space-y-4">
        <div className="flex items-center gap-4">
          <TabsList>
            <TabsTrigger value="combined">Result</TabsTrigger>
          </TabsList>
          <Button onClick={handleFetchResults}>View Results</Button>
          {showResults && data && 'results' in data && (
            <Button
              variant="outline"
              onClick={() => router.push(`/result/${student?.id}?examType=${examType}`)}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Result
            </Button>
          )}
        </div>

        <TabsContent value={examType}>
          {showResults && data && 'results' in data ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {data.student.name}&apos;s {examType.toUpperCase()} Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Student Details</p>
                    <p className="text-muted-foreground">
                      Roll: {data.student.roll}
                    </p>
                    <p className="text-muted-foreground">
                      Class: {data.student.class}
                      {data.student.section && ` - ${data.student.section}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Exam Details</p>
                    <p className="text-muted-foreground">
                      Semester: {data.results.semester}
                    </p>
                    <p className="text-muted-foreground">
                      Exam Type: {data.results.examType.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Marks</p>
                    <div className="mt-2 grid gap-2">
                      {data.results.marks.map((mark, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span>{mark.subject}</span>
                          <Badge variant="secondary">
                            {mark.mcqScore}/{mark.mcqTotal} (MCQ), {mark.cqScore}/
                            {mark.cqTotal} (CQ)
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Summary</p>
                    <p className="text-muted-foreground">
                      Total MCQ Marks: {data.results.totalMcqMarks}
                    </p>
                    <p className="text-muted-foreground">
                      Total CQ Marks: {data.results.totalCqMarks}
                    </p>
                    <p className="text-muted-foreground">
                      Total Marks: {data.results.totalMarks}
                    </p>
                    <p className="text-muted-foreground">
                      Average GPA: {data.results.averageGPA}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  {error ? error : 'Click "View Results" to see your results'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}