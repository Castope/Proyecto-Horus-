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

export interface AdminMessage {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
  estado: 'nuevo' | 'en_proceso' | 'atendido';
  createdAt?: string;
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
