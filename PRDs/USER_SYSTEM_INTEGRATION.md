# PRD: Sistema de Gestión de Usuarios - Frontend

## 📋 Resumen Ejecutivo

### Objetivo

Implementar un sistema completo de gestión de usuarios en el frontend que incluya registro, verificación de email, gestión de contraseñas, perfil de usuario y panel de administración, integrándose con el backend ya existente.

### Alcance

- **Páginas nuevas**: 6 páginas principales con sus componentes
- **Integración**: Con sistema de autenticación existente (AuthContext)
- **Consistencia**: Con arquitectura actual y librería HeroUI
- **Flujos completos**: Desde registro hasta gestión administrativa

---

## 🎯 Páginas a Implementar

### 1. `/auth/register` - Registro de Usuario

**Propósito**: Permitir registro de nuevos usuarios con validación frontend
**Ubicación**: `app/auth/register/page.tsx`

#### Funcionalidades

- Formulario con campos: email, password, first_name, last_name, username
- Validación en tiempo real según reglas definidas
- Mensaje de confirmación post-registro
- Manejo de errores de dominio no autorizado

#### Componentes requeridos

- `RegistrationForm` - Formulario principal
- `PasswordStrengthIndicator` - Indicador visual de fortaleza de contraseña
- `SuccessMessage` - Mensaje de confirmación

#### Integración API

- **Endpoint**: `POST /user-registration/register`
- **Headers**: Content-Type, X-CSRF-Token
- **Response**: Mensaje de éxito + manejo de errores

### 2. `/auth/verify-email` - Verificación de Email

**Propósito**: Procesar token de verificación automáticamente
**Ubicación**: `app/auth/verify-email/page.tsx`

#### Funcionalidades

- Procesamiento automático del token al cargar la página
- Estados: loading, success, error
- Redirección automática tras éxito
- Manejo de tokens inválidos/expirados

#### Componentes requeridos

- `EmailVerificationHandler` - Procesador principal
- `VerificationStatus` - Estados visuales
- `RedirectCountdown` - Contador de redirección

#### Integración API

- **Endpoint**: `GET /user-registration/verify-email?token={token}`
- **Query params**: token extraído de URL
- **Response**: Confirmación de verificación

### 3. `/auth/forgot-password` - Solicitud de Reset

**Propósito**: Solicitar reset de contraseña via email
**Ubicación**: `app/auth/forgot-password/page.tsx`

#### Funcionalidades

- Formulario simple con campo email
- Validación de formato de email
- Mensaje genérico de confirmación (seguridad)
- Rate limiting visual

#### Componentes requeridos

- `ForgotPasswordForm` - Formulario principal
- `EmailSubmitConfirmation` - Mensaje de confirmación
- `RateLimitIndicator` - Indicador de límite de intentos

#### Integración API

- **Endpoint**: `POST /user-registration/forgot-password`
- **Body**: {email}
- **Response**: Mensaje genérico

### 4. `/auth/reset-password` - Nueva Contraseña

**Propósito**: Establecer nueva contraseña con token válido
**Ubicación**: `app/auth/reset-password/page.tsx`

#### Funcionalidades

- Formulario con new_password y confirm_password
- Validación de coincidencia en tiempo real
- Verificación de token automática
- Redirección a login tras éxito

#### Componentes requeridos

- `ResetPasswordForm` - Formulario principal
- `PasswordMatchValidator` - Validador de coincidencia
- `TokenValidator` - Validador de token

#### Integración API

- **Endpoint**: `POST /user-registration/reset-password`
- **Body**: {token, new_password, confirm_password}
- **Response**: Confirmación + redirección

### 5. `/profile` - Perfil de Usuario

**Propósito**: Gestión de datos personales y cambio de contraseña
**Ubicación**: `app/profile/page.tsx`

#### Funcionalidades

- Visualización de datos actuales del usuario
- Edición de: first_name, last_name, username
- Cambio de contraseña (actual + nueva)
- Guards de autenticación

#### Componentes requeridos

- `ProfileView` - Vista de información actual
- `ProfileEditForm` - Formulario de edición
- `PasswordChangeForm` - Formulario cambio contraseña
- `ProfileTabs` - Navegación entre secciones

#### Integración API

- **GET**: `/auth/me` - Obtener datos actuales
- **PUT**: `/user-registration/profile` - Actualizar perfil
- **Headers**: Autenticación requerida

### 6. `/admin` - Panel de Administración

**Propósito**: Gestión completa de usuarios y solicitudes pendientes
**Ubicación**: `app/admin/page.tsx`

#### Funcionalidades

- Lista de usuarios pendientes de aprobación
- Tabla de usuarios activos con filtros
- Acciones: aprobar, rechazar, desactivar, cambiar rol
- Confirmaciones para acciones destructivas
- Búsqueda y paginación

#### Componentes requeridos

- `PendingUsersSection` - Sección usuarios pendientes
- `UsersManagementTable` - Tabla principal de usuarios
- `UserActionModal` - Modal de confirmación
- `UserFilters` - Filtros y búsqueda
- `UserStatusBadge` - Badge de estado
- `UserRoleBadge` - Badge de rol

#### Integración API

- **GET**: `/user-management/admin/users` - Lista usuarios
- **POST**: `/user-management/admin/approve/{id}` - Aprobar usuario
- **POST**: `/user-management/admin/reject/{id}` - Rechazar usuario
- **PUT**: `/user-management/admin/manage-user/{id}` - Gestionar usuario
- **POST**: `/user-management/admin/revoke-access/{id}` - Revocar acceso

---

## 🏗️ Arquitectura Técnica

### Estructura de Archivos

```
app/
├── auth/
│   ├── register/
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── RegistrationForm.tsx
│   │       ├── PasswordStrengthIndicator.tsx
│   │       └── SuccessMessage.tsx
│   ├── verify-email/
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── EmailVerificationHandler.tsx
│   │       ├── VerificationStatus.tsx
│   │       └── RedirectCountdown.tsx
│   ├── forgot-password/
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── ForgotPasswordForm.tsx
│   │       ├── EmailSubmitConfirmation.tsx
│   │       └── RateLimitIndicator.tsx
│   └── reset-password/
│       ├── page.tsx
│       └── components/
│           ├── ResetPasswordForm.tsx
│           ├── PasswordMatchValidator.tsx
│           └── TokenValidator.tsx
├── profile/
│   ├── page.tsx
│   └── components/
│       ├── ProfileView.tsx
│       ├── ProfileEditForm.tsx
│       ├── PasswordChangeForm.tsx
│       └── ProfileTabs.tsx
└── admin/
    ├── page.tsx
    └── components/
        ├── PendingUsersSection.tsx
        ├── UsersManagementTable.tsx
        ├── UserActionModal.tsx
        ├── UserFilters.tsx
        ├── UserStatusBadge.tsx
        └── UserRoleBadge.tsx
```

### Hooks Personalizados

```
app/auth/hooks/
├── useRegistration.ts
├── useEmailVerification.ts
├── useForgotPassword.ts
├── useResetPassword.ts
├── useProfile.ts
└── useUserManagement.ts
```

### Utilidades

```
app/auth/utils/
├── validations.ts
├── authHelpers.ts
├── userHelpers.ts
└── constants.ts
```

---

## 🔧 Integración con Arquitectura Existente

### AuthContext Enhancement

**Archivo**: `app/context/AuthContext.tsx`

#### Extensiones necesarias

- Actualizar `UserProfile` interface con campos completos
- Agregar métodos para refresh de datos post-actualización
- Mantener compatibilidad con sistema actual

```typescript
interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "user" | "admin" | "superadmin";
  status: "active" | "inactive" | "pending_approval";
  created_at?: string;
  last_login?: string;
}
```

### ApiClient Enhancement

**Archivo**: `app/lib/apiClient.ts`

#### Funcionalidades adicionales requeridas

- Manejo específico de errores 429 (rate limiting)
- Interceptores para redirección automática en 401
- Helpers para extracción de query parameters
- Utilitarios para manejo de tokens en URL

```typescript
// Nuevas utilidades requeridas
export const urlUtils = {
  getQueryParam: (name: string) => string | null,
  removeQueryParam: (name: string) => void,
};

export const errorHandlers = {
  handleRateLimit: (error: ApiError) => void,
  handleUnauthorized: (error: ApiError) => void,
  handleValidationError: (error: ApiError) => Record<string, string>,
};
```

---

## 🎨 Diseño y UX

### Librería de Componentes

**HeroUI**: https://www.heroui.com/docs

#### Componentes principales a utilizar

- **Forms**: Input, Button, Checkbox, Select
- **Feedback**: Alert, Modal, Skeleton, Spinner
- **Navigation**: Breadcrumbs, Tabs, Pagination
- **Data Display**: Table, Card, Badge, Chip
- **Layout**: Divider, Spacer, Grid

### Temas y Consistencia

- Mantener paleta de colores actual
- Usar tokens de diseño existentes
- Seguir patrones de layout establecidos

### Estados de Carga

- **Skeleton loaders** para tablas y formularios
- **Spinners** para acciones puntuales
- **Progress indicators** para procesos multi-paso

---

## ✅ Validaciones Frontend

### Reglas de Validación

```typescript
// Validación en tiempo real
const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Ingresa un email válido",
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    message: "La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 dígito",
  },
  username: {
    pattern: /^[a-zA-Z0-9_]{3,20}$/,
    message: "Username debe tener 3-20 caracteres, solo letras, números y underscore",
  },
  names: {
    pattern: /^[a-zA-ZÀ-ÿ\s]{2,50}$/,
    message: "Debe tener 2-50 caracteres, solo letras y espacios",
  },
};
```

### Validación Progresiva

- **Tiempo real**: Durante escritura para UX inmediata
- **On blur**: Validación completa al salir del campo
- **Pre-submit**: Validación final antes de envío

---

## 🚨 Manejo de Errores

### Tipos de Error

```typescript
interface ErrorHandling {
  400: "Mostrar errores de validación por campo";
  401: "Redirección automática a login";
  403: "Mensaje de permisos insuficientes";
  404: "Recurso no encontrado";
  409: "Conflicto - email/username existente";
  429: "Rate limit - mostrar tiempo de espera";
  500: "Error del servidor - mensaje genérico";
}
```

### Estrategias de Recovery

- **Retry automático** para errores de red
- **Fallback messages** para errores inesperados
- **Persistencia de datos** en formularios tras error

---

## 🔐 Seguridad

### CSRF Protection

- Headers `X-CSRF-Token` en todas las requests POST/PUT/DELETE
- Obtención automática de token desde cookies
- Refresh de token en caso de expiración

### Rate Limiting

- Indicadores visuales de límites alcanzados
- Timers de espera para próximo intento
- Almacenamiento local de timestamps para persistencia

### Validación de Tokens

- Verificación automática en páginas con token
- Manejo de tokens expirados o inválidos
- Limpieza de URLs post-procesamiento

---

## 🎯 Flujos de Usuario

### Flujo de Registro Completo

1. **Usuario accede** `/auth/register`
2. **Completa formulario** con validación en tiempo real
3. **Recibe confirmación** de email enviado
4. **Accede a email** y hace clic en link de verificación
5. **Llega a** `/auth/verify-email?token=xxx`
6. **Ve confirmación** de email verificado + cuenta pendiente
7. **Admin aprueba** desde `/admin`
8. **Usuario puede** hacer login normalmente

### Flujo de Reset de Contraseña

1. **Usuario accede** `/auth/forgot-password`
2. **Ingresa email** y recibe confirmación genérica
3. **Accede a email** y hace clic en link de reset
4. **Llega a** `/auth/reset-password?token=xxx`
5. **Establece nueva contraseña** con validación
6. **Ve confirmación** y es redirigido a login

### Flujo de Gestión de Perfil

1. **Usuario autenticado** accede `/profile`
2. **Ve información actual** cargada desde API
3. **Edita campos** con validación en tiempo real
4. **Guarda cambios** con confirmación
5. **Actualiza contexto** de autenticación

---

## 📊 Métricas y Monitoreo

### KPIs a Trackear

- **Tasa de conversión** de registro a verificación
- **Tiempo promedio** de aprobación por admin
- **Errores de validación** más frecuentes
- **Abandono** en formularios

### Logging

- Errores de API con contexto completo
- Intentos de rate limiting
- Flujos de autenticación fallidos

---

## 🚀 Plan de Implementación

### Fase 1: Fundamentos (Semana 1)

- [ ] Extensión de AuthContext y ApiClient
- [ ] Utilidades de validación y helpers
- [ ] Componentes base reutilizables

### Fase 2: Autenticación (Semana 2)

- [ ] Página de registro con validaciones
- [ ] Verificación de email automática
- [ ] Sistema de forgot/reset password

### Fase 3: Gestión de Usuario (Semana 3)

- [ ] Página de perfil completa
- [ ] Cambio de contraseña integrado
- [ ] Testing de flujos de usuario

### Fase 4: Administración (Semana 4)

- [ ] Panel de admin con todas las funcionalidades
- [ ] Sistema de filtros y búsqueda
- [ ] Confirmaciones y acciones masivas

### Fase 5: Pulimiento (Semana 5)

- [ ] Optimizaciones de performance
- [ ] Accesibilidad y responsive design
- [ ] Testing integral y documentación

---

## 🔗 Referencias Técnicas

### Documentación Externa

- **HeroUI Components**: https://www.heroui.com/docs/components
- **HeroUI Input & Form**: https://www.heroui.com/docs/components/input, https://www.heroui.com/docs/components/form
- **HeroUI Tables**: https://www.heroui.com/docs/components/table
- **HeroUI Modals**: https://www.heroui.com/docs/components/modal
- **HeroUI Feedback**: https://www.heroui.com/docs/components/alert

### Arquitectura Interna

- **AuthContext**: Sistema de autenticación existente
- **ApiClient**: Cliente HTTP con CSRF y manejo de errores
- **Estructura**: App Router de Next.js 13+
- **Estilos**: Tailwind CSS + HeroUI tokens

---

## ✅ Criterios de Aceptación

### Funcionales

- [ ] Todos los flujos de usuario funcionan end-to-end
- [ ] Validaciones frontend funcionan correctamente
- [ ] Manejo de errores es robusto y user-friendly
- [ ] Integración con backend es completa

### No Funcionales

- [ ] Performance: páginas cargan en <2s
- [ ] Accesibilidad: WCAG 2.1 AA compliance
- [ ] Responsive: funciona en mobile y desktop
- [ ] SEO: meta tags apropiados para páginas públicas

### Seguridad

- [ ] CSRF protection en todas las requests
- [ ] Rate limiting manejado apropiadamente
- [ ] Tokens de URL son procesados de forma segura
- [ ] No se expone información sensible en logs

### Mantenibilidad

- [ ] Código sigue patrones establecidos
- [ ] Componentes son reutilizables
- [ ] Tests unitarios para lógica crítica
- [ ] Documentación técnica completa

---

_Este PRD define la implementación completa del sistema de gestión de usuarios para el frontend, manteniendo consistencia con la arquitectura existente y proporcionando una experiencia de usuario robusta y segura._
