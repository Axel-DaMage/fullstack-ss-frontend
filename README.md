# Frontend Sanos y Salvos

Aplicacion frontend del proyecto **Sanos y Salvos**, enfocada en la gestion y visualizacion de mascotas perdidas, encontradas y posibles coincidencias entre registros. La interfaz esta pensada como una SPA con secciones principales para explorar el dashboard, listar mascotas y revisar matches.

## Objetivo

El proposito de este frontend es centralizar la informacion de mascotas reportadas y facilitar el seguimiento del estado de cada caso. La aplicacion consume una API backend y organiza la experiencia en bloques claros para consultar metricas, navegar listados y revisar coincidencias.

## Funcionalidades principales

- **Dashboard**: muestra un resumen general con metricas del sistema y datos clave para entender el estado de los registros.
- **Listado de mascotas**: permite navegar entre mascotas reportadas, crear nuevas, editar y eliminar.
- **Coincidencias (Matches)**: presenta coincidencias potenciales entre mascotas con acciones para confirmar, rechazar o eliminarlas.
- **Ubicaciones**: visualiza las ubicaciones registradas con filtro por zona y enlace a Google Maps.
- **Validacion de formularios**: validacion manual sin librerias externas para nombre, raza, color y email.
- **Carga de datos demo**: boton "Cargar datos demo" que pobla el sistema con datos de ejemplo.

## Arquitectura

### Patrones de diseno implementados

- **Observer (Pub/Sub)**: La aplicacion utiliza un sistema de eventos interno (`EventEmitter`) que permite la comunicacion desacoplada entre componentes. Las vistas se suscriben a eventos y reaccionan cuando se crean, actualizan o eliminan registros sin necesidad de recarga manual.
- **Component-based**: La UI esta organizada en componentes React reutilizables (Dashboard, PetForm, tablas, etc.) con estado y propiedades bien definidos. Cada componente es autocontenido y responsable de su propia logica de presentacion.
- **State-based view switching**: La navegacion entre secciones (Dashboard, Mascotas, Coincidencias, Ubicaciones) se maneja mediante un estado centralizado `section` en el componente `App`, sin necesidad de React Router.

## Tecnologias

- React 18
- TypeScript
- Vite 5
- Vitest (pruebas unitarias + cobertura)
- ESLint
- CSS (Catppuccin Mocha theme)

## Estructura del proyecto

```text
src/
    components/
        Dashboard/
        MatchesList/
        PetCard/
        PetsList/
        styles.css
    lib/
    App.tsx
    main.tsx
    index.css
```

## Requisitos

- Node.js 18 o superior
- npm
- Backend disponible en `http://localhost:8080/api`

## Instalacion

```bash
npm install
```

## Uso local

```bash
npm run dev
```

## Pruebas

```bash
# Ejecutar pruebas unitarias
npx vitest run

# Ejecutar pruebas con reporte de cobertura
npx vitest run --coverage
# Reporte: coverage/index.html
```

## Validacion de formularios

El formulario de mascotas (`PetForm`) implementa validacion manual:
- **Nombre**: obligatorio (no puede estar vacio)
- **Raza**: obligatoria (no puede estar vacia)
- **Color**: obligatorio (no puede estar vacio)
- **Email**: validacion de formato si se ingresa (regex basico)
- Los errores se muestran debajo de cada campo con estilo `.error` en rojo

## Integracion con la API

La interfaz consume endpoints del backend a traves de `/api/*` que pasa por Nginx -> API Gateway -> BFF/Microservicios:
- `GET /api/dashboard` - metricas del sistema
- `GET/POST /api/pets` - CRUD de mascotas
- `GET/PUT/DELETE /api/pets/{id}` - operaciones individuales
- `GET/POST /api/locations` - CRUD de ubicaciones
- `GET/POST /api/matches` - CRUD de coincidencias
- `PUT /api/matches/{id}/confirm` - confirmar coincidencia
- `PUT /api/matches/{id}/reject` - rechazar coincidencia
- `POST /api/matches/run-automatic` - matching automatico

## Notas

- La aplicacion esta pensada para trabajar en conjunto con el backend del proyecto.
- El sistema de eventos internos ayuda a mantener sincronizadas las secciones sin depender de recargas manuales.
- Diseño responsivo con sidebar colapsable en dispositivos moviles.

---

## Despliegue

Este servicio se despliega automaticamente como parte del repositorio **api-gateway** a la instancia **Edge (t3.small)**.

Ver [Setup Guide](../fullstack-ss-api-gateway/README.md#despliegue-en-aws-ec2) para detalles completos de la infraestructura.
