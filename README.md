# Frontend Sanos y Salvos

Aplicación frontend del proyecto **Sanos y Salvos**, enfocada en la gestión y visualización de mascotas perdidas, encontradas y posibles coincidencias entre registros. La interfaz está pensada como una SPA con secciones principales para explorar el dashboard, listar mascotas y revisar matches.

## Objetivo

El propósito de este frontend es centralizar la información de mascotas reportadas y facilitar el seguimiento del estado de cada caso. La aplicación consume una API backend y organiza la experiencia en bloques claros para consultar métricas, navegar listados y revisar coincidencias.

## Funcionalidades principales

- **Dashboard**: muestra un resumen general con métricas del sistema y datos clave para entender el estado de los registros.
- **Listado de mascotas**: permite navegar entre mascotas reportadas y aplicar filtros por estado.
- **Matches**: presenta coincidencias potenciales entre mascotas con información útil para priorizar revisiones.
- **Tarjetas reutilizables**: los datos de cada mascota se renderizan en componentes consistentes para mantener una interfaz uniforme.
- **Sistema de eventos interno**: la app utiliza un patrón pub/sub para sincronizar cambios entre vistas cuando se crean, actualizan o eliminan registros.
- **Registro de eventos**: incluye soporte de logging para facilitar depuración y seguimiento del ciclo de vida de los eventos.

## Arquitectura

El proyecto está organizado como una aplicación React con TypeScript y Vite. La estructura separa la lógica de presentación en componentes reutilizables y la lógica transversal en una capa de utilidades basada en eventos.

### Componentes destacados

- [Dashboard](src/components/Dashboard/Dashboard.tsx): vista principal con indicadores y resumen del sistema.
- [PetsList](src/components/PetsList/PetsList.tsx): listado de mascotas con capacidad de filtrado.
- [MatchesList](src/components/MatchesList/MatchesList.tsx): listado de posibles coincidencias entre mascotas.
- [PetCard](src/components/PetCard/PetCard.tsx): tarjeta reutilizable para mostrar la información de una mascota.

### Utilidades internas

- [EventEmitter](src/lib/EventEmitter.ts): implementación ligera de eventos para comunicar acciones entre partes de la app.
- [events](src/lib/events.ts): catálogo de eventos compartidos por la aplicación.
- [useEvent](src/lib/useEvent.ts): hook auxiliar para suscribirse a eventos desde React.
- [EventLogger](src/lib/EventLogger.tsx): componente o utilidad orientada al monitoreo de eventos durante el uso de la interfaz.

## Tecnologías

- React 18
- TypeScript
- Vite
- Vitest
- ESLint
- CSS

## Estructura del proyecto

```text
src/
	components/
		Dashboard/
		MatchesList/
		PetCard/
		PetsList/
	lib/
	assets/
	App.tsx
	main.jsx
	index.css
```

## Requisitos

- Node.js 18 o superior
- npm
- Backend disponible en `http://localhost:8081/api`

## Instalación

```bash
npm install
```

## Uso local

La aplicación se ejecuta como un frontend Vite. Si tu entorno usa scripts estándar de desarrollo, el flujo habitual es:

```bash
npm run dev
```

## Pruebas

Para ejecutar la batería de pruebas, usa el script correspondiente de tu entorno de trabajo. En este proyecto hay tests para componentes y utilidades, incluyendo:

- `App.test.jsx`
- `src/lib/EventEmitter.test.js`
- `src/components/PetCard/PetCard.test.jsx`

## Integración con la API

La interfaz consume endpoints del backend para:

- consultar el dashboard
- obtener y filtrar mascotas
- revisar coincidencias
- reflejar cambios sobre los registros

## Notas

- La aplicación está pensada para trabajar en conjunto con el backend del proyecto.
- El sistema de eventos ayuda a mantener sincronizadas las secciones sin depender de recargas manuales.
- Si agregas nuevas vistas o entidades, conviene reutilizar el patrón de componentes y eventos ya existente.

