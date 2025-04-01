
# Proyecto Brando Carquin

Este proyecto es una plataforma que consta de un frontend y un backend, ambos construidos con tecnologías modernas. Aquí encontrarás cómo configurar, ejecutar y probar ambos componentes del proyecto.

## Estructura del Proyecto

```
brando_carquin/
├── backend/
├── frontend/
└── README.md
```

### Backend
El backend es la parte del servidor, donde se gestionan las APIs y el procesamiento de datos.

### Frontend
El frontend es la interfaz de usuario que interactúa con el backend para mostrar los datos y realizar operaciones.

## Requisitos

Antes de empezar, asegúrate de tener instalado lo siguiente:

- [Docker](https://www.docker.com/get-started) (para ejecutar los contenedores)
- [Node.js 20](https://nodejs.org/en/) (para la instalación de dependencias)
- [npm](https://www.npmjs.com/) (gestor de paquetes)

## Instalación y Ejecución

### 1. Clonar el repositorio

Si aún no tienes el proyecto, clónalo desde el repositorio:

```bash
git clone https://github.com/development-voycelink/code-challenge-fs.git
cd brando_carquin
```

### 2. Ingresar a las carpetas del Frontend y Backend

#### Backend
Primero, accede a la carpeta del backend:

```bash
cd backend
```

#### Frontend
Luego, accede a la carpeta del frontend:

```bash
cd frontend
```

### 3. Instalar las dependencias

#### Backend

En la carpeta del backend, instala las dependencias usando `Node.js 20`:

```bash
npm install
```

#### Frontend

En la carpeta del frontend, instala las dependencias también:

```bash
npm install
```

### 4. Ejecutar el Backend

Ahora puedes ejecutar el backend utilizando Docker Compose para construir y levantar el servicio:

```bash
docker-compose up --build 
```

Esto iniciará los contenedores necesarios para ejecutar el backend. Asegúrate de que todos los servicios estén corriendo correctamente.

Puedes ejecutar tambien
```bash
npm run start
```
El backend estará disponible en `http://localhost:3000` (o el puerto configurado).

### 5. Ejecutar el Frontend

Después de que el backend esté corriendo, puedes iniciar el frontend con:

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:4000` (o el puerto configurado).

### 6. Ejecutar Pruebas en el Backend

Si necesitas ejecutar pruebas para asegurarte de que todo está funcionando correctamente en el backend, puedes ejecutar:

```bash
npm run test
```

Esto ejecutará todas las pruebas configuradas en el proyecto de backend.

## Licencia

Este proyecto está licenciado bajo la MIT License - mira el archivo [LICENSE](LICENSE) para más detalles.


