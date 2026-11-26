# KONTIVA — Panel Web de Monitoreo y Análisis de Ventas

Aplicación web (React + TypeScript + Vite + Tailwind CSS) para consultar, visualizar y analizar las ventas de KONTIVA.

## Características

- Inicio de sesión (modo demostración incluido).
- Dashboard con indicadores y gráficas interactivas.
- Módulo de ventas con filtros, paginación, ordenamiento y detalle.
- Cajas y máquinas: estado de sincronización y comparativas.
- Productos: catálogo, más/menos vendidos, bajo inventario.
- Empleados y cajeros: rendimiento comparativo.
- Reportes con exportación a CSV, Excel y PDF.
- Análisis comercial: tendencias, horarios, participación.
- Modo claro/oscuro, menú lateral colapsable, diseño responsive.

## Desarrollo

```bash
npm install
npm run dev
```

## Producción

```bash
npm run build
npm run preview
```

## Integración con datos reales

El panel incluye un adaptador de datos demo (`src/lib/data/demoSource.ts`). Para conectar la infraestructura existente (servidor / Google Sheets) sin modificarla:

1. Exponga endpoints HTTPS seguros en el servidor existente o en un servicio intermedio autorizado.
2. Configure la URL base en **Configuración**.
3. Reemplace el adaptador en `src/lib/data/provider.ts` por una implementación que consuma esos endpoints.
4. Implemente autenticación real (JWT/sesión) en `src/store/auth.ts`.

No se modifican las bases SQLite, el POS, el servidor, Google Sheets ni la app Android.

## Despliegue en GitHub Pages

El proyecto usa `base: './'` para funcionar en subrutas. Ejecute `npm run build` y publique la carpeta `dist`.

## Credenciales demo

- `admin` / `admin123`
- `supervisor` / `supervisor123`
- `cajero` / `cajero123`

> Los datos mostrados en modo demostración son generados localmente y se identifican como DEMO.
PY