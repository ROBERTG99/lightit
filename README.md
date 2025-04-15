# Patient Registration App

Una aplicación full-stack para el registro de pacientes. El backend está construido en Go utilizando Gin y GORM, y el frontend se ha desarrollado con React.

## Requisitos

- **Backend**
  - Go 1.20
  - PostgreSQL
  - (Opcional) Docker

- **Frontend**
  - Node.js y npm

## Instalación

### Backend


1. **Base de Datos**  
   Asegúrese de tener un servidor PostgreSQL en funcionamiento y actualice la configuración de conexión conforme a su entorno.

2. **Ejecutar el Backend**

   - **Con Go**
     ```bash
     cd backend
     go run main.go
     ```

   - **Con Docker**
     ```bash
     cd backend
     docker build -t patient-api -f DOCKERFILE .
     docker run -p 8080:8080 --env-file .env patient-api
     ```

### Frontend

1. **Instalar Dependencias**
   ```bash
   cd frontend
   npm install
