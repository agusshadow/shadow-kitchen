# Shadow Kitchen

PWA para buscar recetas, guardar favoritas y armar la lista de compras. Solo front: usa la API pública de [TheMealDB](https://www.themealdb.com/api.php) y guarda favoritos y lista en `localStorage`.

## Qué hace

- Buscar recetas por **nombre** o por **ingrediente**, o explorar por categoría. Se puede escribir en español: se traducen los ingredientes más comunes (`src/lib/translate.ts`).
- "Sorprendeme": una receta al azar.
- Detalle con ingredientes, preparación paso a paso, video y fuente original.
- **Favoritas** guardadas en el dispositivo (también disponibles sin conexión).
- **Lista de compras:** agrega todos los ingredientes de una receta, junta duplicados, se marcan como comprados y se pueden enviar por WhatsApp.
- Instalable como app. Las respuestas de la API y las imágenes se guardan en caché para uso offline.

## Stack

Vite + React + TypeScript + Tailwind CSS v4 + vite-plugin-pwa. Tests con Vitest.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm test         # tests de la lógica y del cliente de la API
npm run build    # type-check + build de producción
```

Los íconos de la PWA se generan desde `public/chef.svg` con `node scripts/generate-icons.mjs`.

## Sobre la API

TheMealDB ofrece una clave de prueba pública (`1`), indicada para desarrollo y uso educativo; publicar una app en una tienda de aplicaciones requiere ser *supporter*. Las recetas están en inglés. Este proyecto es una demo personal sin fines comerciales.

## Estructura

- `src/api/mealdb.ts`: cliente de la API con caché y errores legibles.
- `src/lib/`: parseo de recetas, traducción de búsquedas, lógica de la lista de compras y router por hash.
- `src/store/`: favoritos y lista de compras persistidos.
- `src/views/` y `src/components/`: pantallas y piezas de la interfaz.
- `design-system/shadow-kitchen/MASTER.md`: sistema de diseño (skill ui-ux-pro-max).
