
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
    clear: "Limpiar",
    moreOptions: "Más opciones"
  },
  auth: {
    errors: {
      invalidCredentials: "Correo electrónico o contraseña incorrectos.",
      samePassword: "La nueva contraseña debe ser diferente de la antigua.",
      weakPassword: "La contraseña proporcionada no cumple con los requisitos de complejidad.",
      tooManyRequests: "Demasiados intentos de acceso. Inténtelo de nuevo en unos momentos.",
      unexpected: "Ocurrió un error técnico inesperado.",
      sessionExpired: "Su sesión ha expirado. Por favor, identifíquese de nuevo."
    }
  },
  login: {
    title: "Portal de Calidad",
    subtitle: "SISTEMA DE GESTIÓN DE CALIDAD",
    corpEmail: "Identidad Corporativa",
    accessPassword: "Clave de Acceso",
    forgotPassword: "¿Olvidó su clave?",
    authenticate: "Autenticación Segura",
    authenticateAccess: "Autenticación Segura",
    enterCredentials: "Utilice sus credenciales corporativas autorizadas por Aços Vital.",
    heroSubtitle: "Repositorio central de documentación técnica y certificados. Precisión industrial en cada registro.",
    footerNote: "SISTEMAS MONITORIZADOS • CUMPLIMIENTO DE PRIVACIDAD • © 2026 AÇOS VITAL",
    slogan: "Acero de confianza, calidad certificada",
    certification: "CALIDAD TÉCNICA CERTIFICADA",
    secureData: "ENLACE B2B ENCRIPTADO",
    monitoring: "MONITOREO DE SISTEMAS EN TIEMPO REAL",
    error: "Error de autenticación.",
    restrictedAccess: "Acceso Restringido",
    identifyToAccess: "Identifíquese para acceder al panel de certificados seguro.",
    accessManagedByVital: "Aços Vital gestiona su gobernanza de acceso internamente.",
    successTitle: "¡Acceso Concedido!",
    successSubtitle: "Redireccionando al Gateway de Segurança...",
    connectionError: "Fallo de conexión con el servidor de seguridad."
  },
  signup: {
    passwordPlaceholder: "Mín. 8 caracteres"
  },
  admin: {
    tabs: {
      overview: "Vista General",
      users: "Usuarios",
      logs: "Registros",
      settings: "Configuración"
    },
    stats: {
      totalUsers: "Registros de Identidad",
      organizations: "Entidades Asociadas",
      activities: "Operaciones (24h)",
      activeClientsSummary: "{{count}} empresas en cartera",
      logsLast24hSummary: "{{count}} eventos registrados",
      headers: {
        timestamp: "Fecha/Hora",
        user: "Operador",
        action: "Operación",
        target: "Recurso",
        ip: "IP de Origen",
        severity: "Nivel"
      }
    },
    users: {
      identity: "Identity",
      role: "Privilegios",
      roleLabel: "Nivel de Acceso",
      department: "Unidad",
      createTitle: "Nueva Credencial de Acceso",
      editTitle: "Modificar Perfil",
      name: "Nombre Legal Completo",
      email: "Identidad Corporativa",
      org: "Entidad Asociada",
      filters: "Filtrar por"
    },
    clients: {
      createTitle: "Nueva Identidad Corporativa",
      editTitle: "Modificar Entidad"
    },
    logs: {
      allSeverities: "Todas las Severidades",
      severity: {
        INFO: "Informativo",
        WARNING: "Aviso",
        ERROR: "Error",
        CRITICAL: "Crítico"
      }
    }
  },
  quality: {
    overview: "Centro de Información",
    myAuditLog: "Registro de Auditoría Forense",
    activePortfolio: "Cartera Activa",
    pendingDocs: "Pendientes de Auditoría",
    complianceISO: "Índice de Cumplimiento Técnico",
    searchClient: "Buscar entidad por nombre o ID Fiscal...",
    newClientUser: "Nueva Identidad de Socio",
    newCompany: "Nueva Identidad Corporativa",
    allActivities: "Buscar registros por usuario, acción o IP...",
    errorLoadingClients: "Error al recuperar datos de la cartera.",
    errorLoadingQualityData: "Fallo en la sincronización de indicadores de calidad.",
    noQualityLogsFound: "No se detectaron registros de auditoría técnica.",
    invalidConfirmationCredentials: "Error en la autenticación de confirmación."
  },
  roles: {
    ADMIN: "Administrador del Sistema",
    QUALITY: "Analista de Calidad Técnica",
    CLIENT: "Socio"
  },
  dashboard: {
    status: {
      monitoringActive: "SISTEMAS BAJO MONITOREO"
    },
    kpi: {
      libraryLabel: "Inicio",
      activeDocsSubtext: "Certificados Verificados",
      recent: "Recientes",
      viewedToday: "Vistos Hoy",
      compliance: "Conformidad",
      assured: "VALIDADA",
      qualityAssured: "Gestão Vital"
    },
    exploreAll: "Expandir Cartera",
    fileStatusTimeline: "Ciclo de Vida del Cumplimiento",
    organization: "Razón Social",
    fiscalID: "ID Fiscal (CNPJ)",
    contractDate: "Inicio de Vigencia",
    recentCertificates: "Certificados Recientes",
    complianceStatus: "Estado de Conformidad",
    certifiedOperation: "Operación Certificada",
    vitalStandard: "ESTÁNDAR AÇOS VITAL",
    traceability: "Trazabilidad",
    disclaimer: "Todos los certificados mostrados en este portal han sido validados por el laboratorio técnico de Aços Vital.",
    available: "Disponible",
    noRecentFiles: "No hay archivos recientes.",
    criticalPendencies: "Pendencias Críticas",
    lastAnalysis: "Último Análisis",
    allClients: "Todos los Clientes",
    activeClients: "Clientes Activos"
  },
  cookie: {
    title: "Privacidade y Protección de Datos",
    text: "Utilizamos cookies esenciales para garantizar la seguridad de la sesión y la integridad de los certificados técnicos. Al continuar navegando, acepta nuestra política de gobernanza de datos.",
    accept: "Aceptar y Continuar"
  },
  menu: {
    dashboard: "Inicio",
    library: "Biblioteca de Activos",
    certificates: "Certificados",
    management: "Gobernanza de Acceso",
    qualityManagement: "Cumplimiento de Calidad",
    portalName: "Portal de Calidad",
    brand: "Aços Vital",
    systemMonitoring: "MONITOREO DE INFRAESTRUCTURA",
    settings: "Preferencias de Perfil",
    sections: {
      main: "Navegação Principal",
      documents: "Gestión Documental",
      operational: "Módulos Operacionais",
      governance: "Governança e Segurança"
    }
  },
  files: {
    authenticatingAccess: "Autorizando Solicitud...",
    authenticatingLayers: "Autenticando Capas de Segurança...",
    authenticatedView: "Visor Verificado",
    errorLoadingDocument: "Error al renderizar el recurso técnico.",
    errorLoadingFiles: "Error de sincronización de recursos.",
    openInNewTab: "Ver Recurso Completo",
    pending: "Esperando Auditoría Técnica",
    groups: {
      approved: "Conforme / Aprovado",
      rejected: "No Conforme / Rechazado"
    },
    sort: {
      nameAsc: "Lexicográfico (A-Z)"
    },
    searchPlaceholder: "Buscar certificados, lotes o carpetas...",
    listView: "Lista Estructurada",
    gridView: "Cuadrícula Dinámica",
    itemSelected: "recurso identificado",
    itemsSelected: "recursos identificados",
    processingFiles: "Ejecutando análisis de recursos...",
    upload: {
      title: "Carga Segura",
      button: "Importar",
      selectFile: "Seleccione recurso de origen",
      chooseFile: "Explorar archivos",
      fileName: "Descriptor de recurso",
      fileNamePlaceholder: "Ej: Espec_Material_Lote123.pdf",
      uploadButton: "Iniciar Carga",
      noFileSelected: "Ningún recurso identificado.",
      fileNameRequired: "El descriptor es obligatorio para trazabilidad.",
      success: "¡Recurso sincronizado con éxito!",
      noOrgLinked: "Usuario huérfano. Importación de recursos deshabilitada."
    },
    createFolder: {
      title: "Nuevo Directorio Estructural",
      button: "Nuevo Directorio",
      folderName: "Descriptor de directorio",
      folderNamePlaceholder: "Ej: Registros_Lote_2024",
      createButton: "Inicializar Directorio",
      nameRequired: "El descriptor de directorio é obligatorio.",
      success: "¡Directorio inicializado con éxito!",
      noOrgLinked: "Usuario huérfano. Creación de directorios deshabilitada."
    },
    rename: {
      title: "Modificar Descriptor",
      newName: "Nuevo descriptor",
      newNamePlaceholder: "Ingrese nuevo valor",
      renameButton: "Aplicar Cambios",
      nameRequired: "El valor del descriptor es obligatorio.",
      success: "¡Recurso actualizado con éxito!"
    },
    delete: {
      confirmTitle: "Eliminación de Recurso",
      confirmMessage: "¿Ejecutar eliminación permanente de {{count}} elemento(s)? Esta operación es inmutable y auditada.",
      button: "Ejecutar Eliminación",
      success: "Elementos eliminados permanentemente del clúster."
    },
    downloadButton: "Exportar PDF",
    selectItem: "Objetivo {{name}}",
    noResultsFound: "Ningún activo coincide con la consulta.",
    typeToSearch: "Escriba para filtrar recursos..."
  },
  changePassword: {
    title: "Segurança de Acesso",
    current: "Senha Atual",
    currentError: "A senha atual informada está incorreta.",
    new: "Nova Senha Técnica",
    confirm: "Confirmar Nova Senha",
    matchError: "As senhas não conferem.",
    success: "¡Contraseña actualizada con éxito!",
    errorUpdatingPassword: "Fallo en el servicio de actualización de credenciales.",
    submit: "Aplicar Política de Seguridad",
    requirements: {
      length: "Al menos 8 caracteres",
      upper: "Una letra mayúscula",
      number: "Un número (0-9)",
      special: "Un carácter especial (@#$!*)"
    }
  },
  privacy: {
    title: "Gobernanza de Datos y Privacidad",
    subtitle: "Cumplimiento Regulatorio y Marco de Seguridad",
    close: "Entendido",
    viewPolicy: "Ver Política",
    section1: "Alcance de la Plataforma",
    section1_content: "El Portal de Calidad Aços Vital es una plataforma B2B para la gestión de documentos técnicos y certificados de calidad. Esta política aclara el cumplimiento de las Normas Técnicas y las leyes de protección de datos vigentes.",
    section2: "Datos Recopilados",
    section2_item1: "Identificación: Nombre y correo electrónico corporativo.",
    section2_item2: "Corporativo: Identificación fiscal (CNPJ) e historial contractual.",
    section2_item3: "Auditoria: Registros de IP y acciones de usuario (ver/descargar).",
    section3: "Cifrado y Almacenamiento",
    section3_content: "Utilizamos cifrado TLS 1.2+ y segregación estrita por organização (Multi-tenant). Sus documentos nunca son accesibles para otras empresas del portafolio."
  },
  notifications: {
    title: "Alertas Operativas",
    markAllAsRead: "Archivar todas las alertas",
    markedAsRead: "Alerta archivada.",
    markedAllAsRead: "Cola de alertas despejada.",
    emptyState: "Estado del sistema: Nominal. Sin alertas.",
    loading: "Sincronizando alertas...",
    errorLoading: "Fallo en la sincronización: {{message}}",
    errorMarkingAsRead: "Fallo al archivar alerta: {{message}}",
    errorMarkingAllAsRead: "Fallo al despejar alertas: {{message}}",
  },
  maintenance: {
    title: "Mantenimiento de Sistemas",
    message: "La pasarela de seguridad está experimentando actualizaciones técnicas planificadas para mejorar el rendimiento de la visualización de certificados.",
    returnEstimate: "Estimación de Retorno",
    todayAt: "Hoy a las {{time}}",
    soon: "Pronto",
    retry: "Reintentar Conexión",
    contact: "Contactar Soporte",
    systemId: "Vital Cloud Engine v2.4.0"
  },
  maintenanceSchedule: {
    title: "Programar Mantenimiento",
    eventTitle: "Identificador del Evento",
    eventTitlePlaceholder: "Ej: Actualización del Clúster de Archivos",
    date: "Fecha Prevista",
    time: "Hora de Inicio",
    duration: "Duración Estimada (minutos)",
    customMessage: "Comunicado a los Usuarios",
    scheduleButton: "Confirmar Ventana",
    scheduledSuccess: "Mantenimiento '{{title}}' programado con éxito.",
    scheduledError: "Fallo al programar mantenimiento: {{message}}"
  }
};
