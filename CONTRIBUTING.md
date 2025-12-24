# 🤝 Guía de Contribución - APUNTES UDA

¡Gracias por tu interés en contribuir a **APUNTES UDA**! Este proyecto es **por y para los estudiantes**, y tu colaboración es fundamental para hacer crecer esta comunidad de aprendizaje.

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#sobre-el-proyecto)
- [Cómo Contribuir](#cómo-contribuir)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Guías de Desarrollo](#guías-de-desarrollo)
- [Proceso de Revisión](#proceso-de-revisión)
- [Código de Conducta](#código-de-conducta)
- [Contacto](#contacto)

## 🎯 Sobre el Proyecto

**APUNTES UDA** es una plataforma web moderna diseñada para facilitar el acceso y organización de material de estudio universitario. El objetivo principal es crear una comunidad colaborativa donde los estudiantes puedan compartir y acceder a apuntes de manera eficiente.

### Características Principales

- **Explorador de Archivos Interactivo**: Navegación intuitiva por carreras, años y materias
- **Sistema de Ranking**: Visualización de carreras más populares y activas
- **Autenticación Segura**: Integración con Clerk para gestión de usuarios
- **Almacenamiento en la Nube**: Integración con Google Drive y Cloudflare R2
- **Upload con Drag & Drop**: Carga de archivos fácil y rápida
- **Sistema de Favoritos**: Marca y guarda tus carpetas favoritas
- **Diseño Responsivo**: Optimizado para móvil, tablet y escritorio

### Stack Tecnológico

#### Frontend
- **React 19** - Biblioteca principal de UI
- **React Router DOM** - Navegación SPA
- **Tailwind CSS** - Framework de estilos utility-first
- **Vite** - Build tool y servidor de desarrollo
- **Heroicons & Lucide React** - Iconografía

#### Backend
- **Express.js** - Framework del servidor
- **Cloudflare R2** - Almacenamiento de archivos
- **Google Drive API** - Integración con Drive
- **Clerk** - Autenticación y gestión de usuarios
- **Multer** - Manejo de uploads

## 🚀 Cómo Contribuir

### 1. Solicita Unirte al Proyecto

Si tienes una idea para mejorar el proyecto o quieres contribuir:

1. **Envía un correo a**: **apuntesuda@gmail.com**
2. **Incluye en tu mensaje**:
   - Tu nombre y carrera (si aplica)
   - Descripción de la idea o mejora que quieres implementar
   - Tu experiencia técnica (opcional pero útil)
   - Enlaces a tu GitHub u otros proyectos (opcional)

3. **Espera nuestra respuesta**: Revisaremos tu solicitud y te daremos acceso al repositorio

### 2. Tipos de Contribuciones que Buscamos

- 📝 **Contenido**: Subir apuntes, guías y material de estudio
- 🐛 **Reportar Bugs**: Identificar y documentar problemas
- ✨ **Nuevas Funcionalidades**: Proponer e implementar features
- 🎨 **Mejoras de UI/UX**: Optimizar la experiencia de usuario
- 📚 **Documentación**: Mejorar README, guías y comentarios
- 🧪 **Testing**: Escribir y mejorar tests
- ♿ **Accesibilidad**: Hacer el sitio más inclusivo
- 🌐 **Internacionalización**: Agregar soporte para otros idiomas

### 3. Proceso de Desarrollo

1. **Fork y Clone**
   ```bash
   git clone https://github.com/tu-usuario/uda-apuntes.git
   cd uda-apuntes
   ```

2. **Instala Dependencias**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd server
   npm install
   cd ..
   ```

3. **Configura Variables de Entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   # Clerk (Autenticación)
   VITE_CLERK_PUBLISHABLE_KEY=tu_clave_clerk
   
   # Google Drive API
   VITE_GOOGLE_API_KEY=tu_api_key
   VITE_GOOGLE_CLIENT_ID=tu_client_id
   ```
   
   Crea un archivo `.env.local` en `/server`:
   ```env
   # Cloudflare R2
   R2_ACCOUNT_ID=tu_account_id
   R2_ACCESS_KEY_ID=tu_access_key
   R2_SECRET_ACCESS_KEY=tu_secret_key
   R2_BUCKET_NAME=tu_bucket_name
   R2_PUBLIC_URL=tu_public_url
   
   # Google Drive
   GOOGLE_CLIENT_ID=tu_client_id
   GOOGLE_CLIENT_SECRET=tu_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/drive/callback
   ```

4. **Crea una Rama de Trabajo**
   ```bash
   git checkout -b feature/nombre-de-tu-feature
   # o
   git checkout -b fix/nombre-del-bug
   ```

5. **Desarrolla y Prueba**
   ```bash
   # Terminal 1 - Frontend
   npm run dev
   
   # Terminal 2 - Backend
   cd server
   node server.js
   ```

6. **Commit con Mensajes Descriptivos**
   ```bash
   git add .
   git commit -m "feat: descripción clara de la funcionalidad"
   # o
   git commit -m "fix: descripción del bug corregido"
   ```

7. **Push y Pull Request**
   ```bash
   git push origin feature/nombre-de-tu-feature
   ```
   
   Luego crea un Pull Request en GitHub con:
   - Título descriptivo
   - Descripción detallada de los cambios
   - Screenshots (si hay cambios visuales)
   - Lista de verificación completada

## 📁 Estructura del Proyecto

### Arquitectura General

```
uda-apuntes/
├── 📂 public/                  # Archivos públicos estáticos
│   ├── ranking-snapshot.json   # Snapshot del ranking para carga rápida
│   └── assets/                 # Imágenes y recursos estáticos
│
├── 📂 src/                     # Código fuente del frontend
│   ├── 📂 components/          # Componentes reutilizables de React
│   ├── 📂 pages/               # Páginas principales de la aplicación
│   ├── 📂 services/            # Servicios de API y lógica de negocio
│   ├── 📂 context/             # Contextos de React (estado global)
│   ├── 📂 contexts/            # Contextos adicionales
│   ├── App.jsx                 # Componente raíz de la aplicación
│   ├── main.jsx                # Punto de entrada de React
│   └── index.css               # Estilos globales y configuración de Tailwind
│
├── 📂 server/                  # Backend Express.js
│   ├── 📂 routes/              # Endpoints de la API
│   ├── 📂 services/            # Lógica de negocio del backend
│   ├── 📂 migrations/          # Migraciones de base de datos (si aplica)
│   ├── server.js               # Servidor principal
│   ├── config.js               # Configuración del servidor
│   └── .env.local              # Variables de entorno del backend
│
├── 📂 api/                     # Funciones serverless (Vercel)
│
├── package.json                # Dependencias del frontend
├── vite.config.js              # Configuración de Vite
├── tailwind.config.js          # Configuración de Tailwind CSS
├── vercel.json                 # Configuración de deployment en Vercel
├── README.md                   # Documentación principal
└── CONTRIBUTING.md             # Esta guía de contribución
```

### 📂 Detalle de Carpetas Principales

#### `/src/components/` - Componentes Reutilizables

Contiene todos los componentes React que se reutilizan en múltiples páginas:

```
components/
├── Header.jsx                  # Barra de navegación principal con menú responsivo
├── Footer.jsx                  # Pie de página con enlaces e información
├── LoadingSpinner.jsx          # Indicador de carga animado
├── SkeletonLoader.jsx          # Loading skeleton para mejor UX
├── FileIcon.jsx                # Iconos para diferentes tipos de archivo
├── FilePreviewModal.jsx        # Modal para previsualizar archivos
├── FavoritesBar.jsx            # Barra lateral de favoritos
├── TopCareerWidget.jsx         # Widget de carreras más populares
├── GoogleDriveAuth.jsx         # Componente de autenticación de Google
├── GoogleDriveExplorer.jsx     # Explorador básico de Google Drive
├── PublicDriveExplorer.jsx     # Explorador público (sin autenticación)
└── SecureDriveExplorer.jsx     # Explorador completo con autenticación y upload
```

**Convenciones**:
- Usa componentes funcionales con hooks
- Cada componente debe tener props tipadas con PropTypes o comentarios
- Mantén los componentes pequeños y con una sola responsabilidad
- Usa Tailwind CSS para estilos

#### `/src/pages/` - Páginas de la Aplicación

Contiene las páginas principales que corresponden a rutas:

```
pages/
├── Home.jsx                    # Página de inicio con bienvenida
├── Archivos.jsx                # Vista principal del explorador de archivos
├── ProgramView.jsx             # Vista de carreras universitarias
├── SubjectView.jsx             # Vista de materias por carrera
├── Ranking.jsx                 # Ranking de carreras más activas
├── Dashboard.jsx               # Panel de administración (requiere auth)
├── GenerateRanking.jsx         # Generador de ranking (admin)
├── SearchResults.jsx           # Resultados de búsqueda
├── Information.jsx             # Información sobre el proyecto
├── Contact.jsx                 # Página de contacto
└── RankingTest.jsx             # Página de pruebas del ranking
```

**Convenciones**:
- Una página = una ruta en React Router
- Usa lazy loading para optimizar carga: `const Home = lazy(() => import('./pages/Home'))`
- Incluye SEO metadata en cada página

#### `/src/services/` - Servicios y APIs

Lógica de comunicación con APIs externas y manejo de datos:

```
services/
├── api.js                      # Cliente HTTP base (Axios)
├── driveService.js             # Integración con Google Drive API
├── uploadService.js            # Servicio de upload de archivos
├── rankingService.js           # Lógica del sistema de ranking
├── favoritesService.js         # Gestión de favoritos del usuario
├── searchService.js            # Búsqueda y filtrado
├── authService.js              # Gestión de autenticación
└── ...
```

**Convenciones**:
- Separa la lógica de negocio de los componentes
- Usa async/await para operaciones asíncronas
- Maneja errores apropiadamente
- Documenta las funciones con JSDoc

#### `/src/context/` y `/src/contexts/` - Estado Global

Contextos de React para estado compartido:

```
context/
└── SearchContext.jsx           # Contexto de búsqueda global

contexts/
└── FavoritesContext.jsx        # Contexto de favoritos del usuario
```

**Convenciones**:
- Usa Context API para estado global simple
- Para estado más complejo, considera usar Zustand o Redux
- Provee hooks personalizados: `useFavorites()`, `useSearch()`

#### `/server/routes/` - Rutas del Backend

Endpoints de la API REST:

```
routes/
├── apuntes.js                  # CRUD de apuntes y archivos
├── drive.js                    # Integración con Google Drive
├── upload.js                   # Manejo de uploads con Multer
├── favorites.js                # Endpoints de favoritos
└── rankingAutoUpdate.js        # Sistema de auto-actualización del ranking
```

**Estructura de un endpoint**:
```javascript
// Ejemplo: /server/routes/apuntes.js
router.get('/api/apuntes/:id', async (req, res) => {
  try {
    // Lógica
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Convenciones**:
- Usa Express Router para organizar rutas
- Valida inputs del usuario
- Retorna JSON con estructura consistente
- Maneja errores con middleware

#### `/server/services/` - Lógica de Negocio Backend

```
services/
└── rankingService.js           # Cálculo y generación del ranking
```

**Convenciones**:
- Separa la lógica de las rutas
- Funciones puras y reutilizables
- Testing unitario

## 🎨 Guías de Desarrollo

### Estilo de Código

#### JavaScript/React

```javascript
// ✅ BIEN - Componente funcional con hooks
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function MiComponente({ titulo, onAction }) {
  const [estado, setEstado] = useState(false);
  
  useEffect(() => {
    // Efecto
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold">{titulo}</h2>
    </div>
  );
}

MiComponente.propTypes = {
  titulo: PropTypes.string.isRequired,
  onAction: PropTypes.func
};
```

#### Tailwind CSS

```javascript
// ✅ BIEN - Clases ordenadas: layout -> spacing -> sizing -> typography -> colors -> effects
<div className="flex flex-col gap-4 p-6 w-full max-w-md text-lg font-semibold text-gray-800 bg-white rounded-lg shadow-lg">
  {/* Contenido */}
</div>

// ❌ MAL - Clases desordenadas
<div className="text-gray-800 shadow-lg w-full bg-white gap-4 p-6 rounded-lg flex flex-col">
  {/* Contenido */}
</div>
```

### Convenciones de Nombres

- **Componentes**: PascalCase - `MiComponente.jsx`
- **Funciones**: camelCase - `obtenerDatos()`
- **Constantes**: UPPER_SNAKE_CASE - `API_BASE_URL`
- **Archivos de servicio**: camelCase - `driveService.js`
- **CSS Classes**: kebab-case - `my-custom-class`

### Commits Semánticos

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: agregar sistema de notificaciones
fix: corregir error en carga de favoritos
docs: actualizar README con nuevas instrucciones
style: formatear código con prettier
refactor: reorganizar estructura de carpetas
test: agregar tests para uploadService
chore: actualizar dependencias
perf: optimizar carga de imágenes
```

### Testing

```javascript
// Ejemplo de test (si implementamos testing)
import { render, screen } from '@testing-library/react';
import MiComponente from './MiComponente';

describe('MiComponente', () => {
  it('renderiza el título correctamente', () => {
    render(<MiComponente titulo="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## 🔍 Proceso de Revisión

### Checklist para Pull Requests

Antes de enviar tu PR, asegúrate de:

- [ ] El código sigue las convenciones del proyecto
- [ ] Has probado localmente todos los cambios
- [ ] No hay errores en la consola
- [ ] Los estilos son responsivos (móvil, tablet, desktop)
- [ ] Has agregado comentarios donde sea necesario
- [ ] Actualizaste la documentación si agregaste features
- [ ] Las variables de entorno están documentadas
- [ ] No incluiste credenciales o información sensible
- [ ] El código está limpio (sin console.logs innecesarios)
- [ ] Los archivos siguen la estructura del proyecto

### Qué Esperar

1. **Revisión Inicial**: 2-5 días hábiles
2. **Feedback**: Recibirás comentarios constructivos
3. **Iteración**: Puedes hacer cambios basados en el feedback
4. **Aprobación**: Una vez aprobado, se hará merge
5. **Deploy**: Los cambios se desplegarán a producción

## 📜 Código de Conducta

### Nuestros Valores

- **Respeto**: Trata a todos con cortesía y profesionalismo
- **Inclusión**: Valoramos la diversidad de ideas y backgrounds
- **Colaboración**: Trabajamos juntos para mejorar
- **Aprendizaje**: Todos estamos aprendiendo, sé paciente
- **Transparencia**: Comunica abiertamente problemas y soluciones

### Comportamiento Esperado

✅ **SÍ**:
- Sé respetuoso y constructivo
- Da crédito a otros por su trabajo
- Acepta críticas constructivas
- Enfócate en lo mejor para la comunidad
- Ayuda a nuevos contribuidores

❌ **NO**:
- Lenguaje ofensivo o discriminatorio
- Acoso de cualquier tipo
- Ataques personales
- Publicar información privada de otros
- Spam o contenido irrelevante

## 📞 Contacto

### Para Contribuciones y Nuevas Ideas

📧 **Email**: **apuntesuda@gmail.com**

**Incluye en tu mensaje**:
- Asunto claro: "Contribución: [descripción breve]"
- Tu propuesta o idea detallada
- Por qué crees que mejorará el proyecto
- Tu disponibilidad para trabajar en ello

### Para Reportar Bugs

Abre un issue en GitHub con:
- Título descriptivo
- Pasos para reproducir el bug
- Comportamiento esperado vs. actual
- Screenshots si es relevante
- Información del navegador/dispositivo

### Para Preguntas Generales

- Revisa primero el [README.md](README.md)
- Busca en issues existentes
- Si no encuentras respuesta, abre un nuevo issue

## 🙏 Reconocimientos

Todos los contribuidores serán reconocidos en nuestro README y en la página de "Información" del sitio.

Gracias por ayudar a hacer de **APUNTES UDA** una mejor plataforma para todos los estudiantes. 🎓

---

*Última actualización: Diciembre 2024*
*Versión del documento: 1.0*
