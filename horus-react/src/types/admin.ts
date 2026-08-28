export interface AdminUser {
  id: number;
  nombre: string;
  email: string;
}

export interface AdminItem {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  nombre: string;
  email: string;
  password: string;
}
