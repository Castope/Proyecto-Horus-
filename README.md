# 🦅 Horus Group — Plataforma Web Full Stack

Plataforma web desarrollada para **Horus Group SRL**, orientada a la presentación y administración de servicios tecnológicos, cursos, capacitaciones y atención a clientes.

El proyecto integra un sitio web público, un panel administrativo, una API REST, persistencia de datos en MySQL y un asistente virtual conectado al catálogo de información de la empresa.

---

## 📌 Descripción

**Proyecto Horus** es una aplicación Full Stack diseñada para centralizar la información y servicios de Horus Group.

La plataforma permite presentar públicamente los servicios y cursos de la empresa, mientras que desde un panel administrativo se puede gestionar el contenido almacenado en la base de datos.

El sistema cuenta además con un chatbot que puede consultar información publicada sobre cursos, servicios y preguntas frecuentes para responder consultas de los visitantes.

---

## ✨ Características principales

* 🌐 Sitio web público
* 🔐 Sistema de autenticación para administradores
* 📊 Panel administrativo
* 🎓 Gestión de cursos y capacitaciones
* 🛠️ Gestión de servicios tecnológicos
* 🖼️ Gestión de galería
* ❓ Gestión de preguntas frecuentes
* 📩 Formulario de contacto
* 📋 Libro de reclamaciones
* 📧 Sistema de newsletter
* ⚙️ Configuración de información de la empresa
* 💬 Chatbot para consultas sobre Horus
* 🤖 Integración opcional con OpenAI
* 🔑 Autenticación mediante JWT
* 📚 Documentación automática de API con Swagger
* 🗄️ Persistencia de información mediante MySQL

---

# 🛠️ Tecnologías utilizadas

## Frontend

| Tecnología   | Uso                                 |
| ------------ | ----------------------------------- |
| React        | Desarrollo de interfaces            |
| TypeScript   | Tipado y desarrollo                 |
| Vite         | Entorno de desarrollo y compilación |
| React Router | Navegación de la aplicación         |
| Tailwind CSS | Estilos                             |
| Sonner       | Notificaciones                      |

## Backend

| Tecnología | Uso                             |
| ---------- | ------------------------------- |
| NestJS     | Framework principal del backend |
| TypeScript | Lenguaje principal              |
| Sequelize  | ORM                             |
| MySQL      | Base de datos                   |
| JWT        | Autenticación                   |
| Passport   | Manejo de autenticación         |
| bcryptjs   | Hash de contraseñas             |
| Swagger    | Documentación de la API         |
| Nodemailer | Envío de correos                |
| OpenAI API | Respuestas del chatbot          |

---

# 🏗️ Arquitectura

El proyecto está dividido principalmente en dos aplicaciones:

```text
Proyecto-Horus-
│
├── backend/
│   ├── src/
│   │   ├── admin/
│   │   ├── catalogo/
│   │   ├── chatbot/
│   │   ├── contacto/
│   │   ├── cotizaciones/
│   │   ├── database/
│   │   ├── galeria/
│   │   ├── mail/
│   │   ├── newsletter/
│   │   ├── reclamaciones/
│   │   └── settings/
│   │
│   ├── scripts/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── panel/
│   │
│   └── package.json
│
├── DEPLOY_VERCEL.md
├── PLAN_PANEL_Y_CHATBOT.md
└── tsconfig.json
```

---

# 🌐 Sitio público

La aplicación cuenta con diferentes páginas para presentar la información de Horus Group.

Entre ellas:

* Inicio
* ¿Quiénes somos?
* Galería
* Market
* Contacto
* Cableado estructurado
* Cámaras de seguridad
* Soporte y mantenimiento
* Asesoramiento
* Capacitaciones
* Cursos
* Preguntas frecuentes
* Libro de reclamaciones
* Políticas de privacidad
* Políticas de cookies
* Políticas de devolución

---

# 👨‍💻 Panel administrativo

El proyecto incluye un panel destinado a la administración del contenido de la plataforma.

El acceso al panel utiliza autenticación mediante **JWT**.

Principales rutas:

```text
/admin/login
/admin/register
/admin/dashboard
/admin/messages
```

El objetivo del panel es permitir que los administradores puedan actualizar información sin modificar directamente el código fuente de la página.

---

# 🤖 Chatbot

Horus incluye un módulo de chatbot integrado al backend.

El asistente puede buscar información publicada relacionada con:

* Cursos
* Capacitaciones
* Servicios
* Preguntas frecuentes

Endpoints principales:

```http
POST /api/chatbot/message
POST /api/chatbot/contact
```

El chatbot utiliza primero la información almacenada en el catálogo de Horus.

Cuando la integración con inteligencia artificial está habilitada, el backend puede utilizar la **OpenAI API** para generar respuestas basándose exclusivamente en la información recuperada del sistema.

Si la IA no está disponible, el sistema puede responder utilizando directamente la información encontrada en el catálogo.

---

# 📚 API REST

El backend utiliza **NestJS** y expone una API REST bajo el prefijo:

```text
/api
```

Durante el desarrollo local:

```text
http://localhost:3000/api
```

La documentación interactiva de Swagger está disponible en:

```text
http://localhost:3000/api/docs
```

Desde Swagger es posible consultar y probar los diferentes endpoints de la aplicación.

---

# ⚙️ Instalación

## 1. Clonar el repositorio

```bash
git clone https://github.com/Castope/Proyecto-Horus-.git
```

Entrar al proyecto:

```bash
cd Proyecto-Horus-
```

---

# 🖥️ Configurar Backend

Entrar a la carpeta:

```bash
cd backend
```

Instalar dependencias:

```bash
npm install
```

Crear un archivo:

```text
.env
```

Puedes utilizar como referencia:

```text
.env.example
```

Ejemplo de configuración:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=horus_db
DB_USER=root
DB_PASS=tu_password

JWT_SECRET=tu_clave_secreta_de_minimo_32_caracteres

MAIL_USER=correo@gmail.com
MAIL_PASS=contraseña_de_aplicacion

DB_SYNC=false
NODE_ENV=development

CORS_ORIGINS=

DB_SSL=false
```

---

# 🗄️ Configurar base de datos

Crear previamente una base de datos MySQL.

Por defecto:

```text
horus_db
```

Inicializar las tablas:

```bash
npm run db:init
```

Ejecutar migraciones:

```bash
npm run db:migrate
```

Crear el administrador inicial:

```bash
npm run admin:create
```

---

# ▶️ Ejecutar Backend

Modo desarrollo:

```bash
npm run start:dev
```

Servidor:

```text
http://localhost:3000
```

API:

```text
http://localhost:3000/api
```

Swagger:

```text
http://localhost:3000/api/docs
```

---

# 🎨 Configurar Frontend

Abrir otra terminal y entrar a:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Ejecutar el servidor de desarrollo:

```bash
npm run dev
```

Vite mostrará la dirección local de la aplicación, normalmente:

```text
http://localhost:5173
```

---

# 🤖 Configuración de OpenAI

La integración con inteligencia artificial del chatbot puede configurarse mediante variables de entorno del backend.

Ejemplo:

```env
OPENAI_API_KEY=tu_openai_api_key
CHATBOT_AI_ENABLED=true
CHATBOT_MODEL=tu_modelo
```

> ⚠️ Nunca publiques tu `OPENAI_API_KEY` en GitHub.

Cuando la IA está deshabilitada o no está disponible, el chatbot continúa funcionando mediante consultas al catálogo de Horus.

---

# 📧 Configuración de correo

Para las funciones relacionadas con correo electrónico se utilizan:

```env
MAIL_USER=correo@gmail.com
MAIL_PASS=contraseña_de_aplicacion
```

Si se utiliza Gmail se recomienda generar una **contraseña de aplicación** y no utilizar directamente la contraseña de la cuenta.

---

# 🔐 Seguridad

La aplicación implementa diferentes mecanismos de seguridad:

* Autenticación JWT
* Hash de contraseñas
* Validación de DTOs
* Restricción de propiedades no permitidas
* Configuración CORS
* Variables de entorno
* Protección de rutas administrativas
* Límites de información utilizada por el chatbot

Las contraseñas, claves JWT y API Keys no deben almacenarse directamente dentro del repositorio.

---

# 📦 Scripts disponibles

## Backend

```bash
npm run start
npm run start:dev
npm run build
npm run start:prod
npm run test
npm run db:init
npm run db:migrate
npm run admin:create
```

## Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
npm run check
npm run test:deploy
```

---

# 🚀 Despliegue

El proyecto está preparado para utilizar una arquitectura separada en Vercel:

```text
Frontend
   │
   ▼
React + Vite
   │
   │ HTTP / REST
   ▼
NestJS API
   │
   ▼
MySQL
```

Se pueden crear dos proyectos dentro de Vercel utilizando el mismo repositorio:

| Proyecto | Root Directory |
| -------- | -------------- |
| Frontend | `frontend`     |
| Backend  | `backend`      |

El frontend utiliza:

```text
VITE_API_BASE_URL
```

para indicar la URL del backend.

Ejemplo:

```env
VITE_API_BASE_URL=https://tu-backend.vercel.app/api
```

Para más detalles consultar:

```text
DEPLOY_VERCEL.md
```

---

# 🗺️ Estado del proyecto

El proyecto continúa en desarrollo.

Actualmente existe una base funcional que incluye:

* Frontend público
* API REST
* Base de datos
* Panel administrativo
* Autenticación
* Gestión de diferentes módulos
* Swagger
* Chatbot
* Integración opcional con OpenAI

También se continúa trabajando en la conexión completa entre el contenido administrado desde el panel y todas las secciones públicas de la página.

---

# 🎯 Objetivo

El objetivo principal del proyecto es proporcionar a **Horus Group SRL** una plataforma digital centralizada que permita:

> Presentar sus servicios y capacitaciones, administrar su contenido, recibir consultas de clientes y facilitar el acceso a información mediante herramientas modernas de desarrollo web e inteligencia artificial.

---

# 👥 Equipo

Proyecto desarrollado como parte de un proyecto académico de **Ingeniería de Software**.

### Desarrolladores

* Anderson Vásquez
* Cristopher Pulache
* Carlos Castope

---

# 📄 Documentación adicional

El repositorio contiene documentación adicional relacionada con el proyecto:

```text
DEPLOY_VERCEL.md
PLAN_PANEL_Y_CHATBOT.md
```

Estos documentos incluyen información sobre despliegue, arquitectura y evolución del panel administrativo y chatbot.

---

# 📌 Repositorio

GitHub:

https://github.com/Castope/Proyecto-Horus-

---

<p align="center">
  <b>🦅 Horus Group</b><br>
  Plataforma Web Full Stack
</p>

<p align="center">
  React · NestJS · MySQL · TypeScript · OpenAI
</p>
