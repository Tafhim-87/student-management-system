export interface Students {
  _id: string;
  name: string;
  userName: string;
  roll: string;
  class: string;
  section?: string;
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  createdAt: string;
}
