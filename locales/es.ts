
import { pt } from './pt.ts';

export const es: typeof pt = {
  common: {
    welcome: "Bienvenido",
    loading: "Cargando...",
    privacy: "Privacidad",
    logout: "Cerrar sesión",
    edit: "Editar",
    save: "Guardar",
    cancel: "Cancelar",
    back: "Atrás",
    na: "N/D",
    status: "Estado",
    statusActive: "Activo",
    statusInactive: "Inactivo",
    uploaded: "Subida completada",
    updatingDatabase: "Actualizando base de datos...",
    errorLoadingLogs: "Error al cargar registros: {{message}}",
    changePassword: "Cambiar contraseña",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    close: "Cerrar",
    delete: "Eliminar",
    language: {
    pt: "Portugués",
    en: "Inglés",
    es: "Español"
  },
    clear: "Limpiar"
  },
  login: {
    title: "Portal de Calidad",
    subtitle: "SISTEMA DE GESTIÓN DE CALIDAD",
    corpEmail: "Correo electrónico corporativo",
    accessPassword: "Contraseña de acceso",
    forgotPassword: "¿Olvidó su contraseña?",
    authenticate: "Autenticar acceso",
    authenticateAccess: "Autenticar acceso",
    enterCredentials: "Utilice sus credenciales proporcionadas por Aços Vital.",
    heroSubtitle: "Repositorio central de documentos técnicos y certificados. Precisión industrial en cada dato.",
    footerNote: "SISTEMAS MONITORIZADOS • PRIVACIDAD • © 2026 AÇOS VITAL",
    slogan: "Acero de confianza, Calidad Certificada",
    certification: "ISO 9001:2015 CERTIFICADO",
    secureData: "ENLACE B2B SEGURO",
    monitoring: "SISTEMAS MONITORIZADOS",
    error: "Error de autenticación del portal.",
    restrictedAccess: "Acceso Restringido",
    identifyToAccess: "Identifíquese para acceder al panel de certificados.",
    accessManagedByVital: "Aços Vital gestiona su acceso internamente."
},
  admin: {
    tabs: {
      overview: "Vista general",
      users: "Usuarios",
      logs: "Registros",
      settings: "Configuración"
    },
    stats: {
      totalUsers: "Total Usuarios",
      organizations: "Empresas Activas",
      activities: "Atividades (24h)",
      activeClientsSummary: "{{count}} empresas en cartera",
      logsLast24hSummary: "{{count}} eventos registrados",
      headers: {
        timestamp: "Fecha/Hora",
        user: "Usuario",
        action: "Acción",
        target: "Objetivo",
        ip: "IP",
        severity: "Nivel"
      }
    },
    users: {
      identity: "Identidad",
      role: "Rol",
      roleLabel: "Nivel de Acceso",
      department: "Departamento",
      createTitle: "Nuevo Acceso",
      editTitle: "Editar Perfil",
      name: "Nombre Completo",
      email: "Correo Corporativo",
      org: "Empresa Vinculada",
      filters: "Filtrar por"
    }
  },
  quality: {
    overview: "Resumen",
    myAuditLog: "Mi Registro de Auditoría",
    activePortfolio: "Cartera Activa",
    pendingDocs: "Docs. Pendientes",
    complianceISO: "Cumplimiento ISO",
    searchClient: "Buscar por nombre o CNPJ...",
    newClientUser: "Nuevo Usuario Cliente",
    newCompany: "Nueva Empresa",
    allActivities: "Buscar usuario, acción o IP...",
    errorLoadingClients: "Error al cargar clientes",
    errorLoadingQualityData: "Error al sincronizar indicadores de calidad.",
    noQualityLogsFound: "No se encontraron registros de calidad.",
    invalidConfirmationCredentials: "Credenciais de confirmação no válidas."
  },
  roles: {
    ADMIN: "Administrador",
    QUALITY: "Analista de Calidad",
    CLIENT: "Cliente B2B"
  },
  dashboard: {
    status: {
      monitoringActive: "SISTEMAS MONITORIZADOS"
    },
    kpi: {
      libraryLabel: "Mi Biblioteca",
      activeDocsSubtext: "Certificados Activos"
    },
    exploreAll: "Explorar Todo",
    fileStatusTimeline: "Línea de Tiempo del Certificado",
    organization: "Razón Social",
    fiscalID: "CNPJ",
    contractDate: "Inicio del Contrato"
  },
  cookie: {
    title: "Privacidad y Seguridad",
    text: "Utilizamos cookies esenciales para garantizar la seguridad de la autenticación e la integridad de los certificados técnicos. Al continuar navegando por el portal de Aceros Vital, acepta nuestra política de gestión de datos.",
    accept: "Aceptar y Continue"
  },
  menu: {
    dashboard: "Inicio",
    library: "Biblioteca",
    management: "Gestión",
    qualityManagement: "Gestión de Calidad",
    portalName: "Portal de Calidad",
    brand: "Aços Vital",
    systemMonitoring: "MONITOREO DEL SISTEMA",
    settings: "Configuración", 
  },
  files: {
    authenticatingAccess: "Autenticando Acceso...",
    authenticatedView: "Vista Autenticada",
    errorLoadingDocument: "Error al cargar documento técnico.",
    errorLoadingFiles: "Error al listar archivos del servidor.",
    openInNewTab: "Abrir en nueva pestaña",
    pending: "Esperando Inspección",
    groups: {
      approved: "Aprovado",
      rejected: "No Conforme"
    },
    sort: {
      nameAsc: "Nombre (A-Z)"
    },
    searchPlaceholder: "Buscar archivos y carpetas...",
    listView: "Vista de lista",
    gridView: "Vista de cuadrícula",
    itemSelected: "elemento seleccionado",
    itemsSelected: "elementos seleccionados",
    processingFiles: "Procesando archivos...",
    upload: {
      title: "Subir archivo",
      button: "Subir",
      selectFile: "Seleccione el archivo para subir",
      chooseFile: "Elegir archivo",
      fileName: "Nombre del archivo",
      fileNamePlaceholder: "Ej: Certificado_MateriaPrima_Lote123.pdf",
      uploadButton: "Subir",
      noFileSelected: "Ningún archivo seleccionado.",
      fileNameRequired: "El nombre del archivo es obligatorio.",
      success: "¡Archivo subido exitosamente!",
      noOrgLinked: "Usuario no vinculado a una organización. No se pueden subir archivos."
    },
    createFolder: {
      title: "Crear nueva carpeta",
      button: "Nueva carpeta",
      folderName: "Nombre de la carpeta",
      folderNamePlaceholder: "Ej: Documentos Lote 2024",
      createButton: "Crear carpeta",
      nameRequired: "El nombre de la carpeta es obligatorio.",
      success: "¡Carpeta creada exitosamente!",
      noOrgLinked: "Usuario no vinculado a una organización. No se pueden crear carpetas."
    },
    rename: {
      title: "Renombrar",
      newName: "Nuevo nombre",
      newNamePlaceholder: "Ingrese el nuevo nombre",
      renameButton: "Renombrar",
      nameRequired: "El nuevo nombre es obligatorio.",
      success: "¡Elemento renombrado exitosamente!"
    },
    delete: {
      confirmTitle: "Confirmar Eliminación",
      confirmMessage: "¿Está seguro de que desea eliminar {{count}} elemento(s) seleccionado(s)? Esta acción no se puede deshacer.",
      button: "Eliminar"
    },
    downloadButton: "Descargar",
    selectItem: "Seleccionar {{name}}",
    noResultsFound: "No se encontraron resultados.",
    typeToSearch: "Escriba para buscar archivos y carpetas..."
  },
  changePassword: {
    title: "Cambiar Contraseña",
    current: "Contraseña Actual",
    new: "Nueva Contraseña",
    confirm: "Confirmar Contraseña",
    minCharacters: "Mínimo {{count}} caracteres",
    matchError: "Las contraseñas no coinciden.",
    success: "¡Contraseña cambiada exitosamente!",
    errorUpdatingPassword: "Error al actualizar la contraseña.",
    submit: "Confirmar Cambios" 
  },
  privacy: {
    title: "Política de Privacidad",
    subtitle: "Cumplimiento de LGPD e ISO 9001",
    close: "Entendido",
    section1: "Sobre el Portal",
    section2: "Datos Recopilados",
    section3: "Seguridad de Datos"
  },
  notifications: {
    title: "Mis Notificaciones",
    markAllAsRead: "Marcar todas como leídas",
    markedAsRead: "Notificación marcada como leída.",
    markedAllAsRead: "Todas las notificaciones marcadas como leídas.",
    emptyState: "No tiene notificaciones.",
    loading: "Cargando Notificaciones...",
    errorLoading: "Error al cargar notificaciones: {{message}}",
    errorMarkingAsRead: "Error al marcar notificación como leída: {{message}}",
    errorMarkingAllAsRead: "Error al marcar todas como leídas: {{message}}",
  }
};
