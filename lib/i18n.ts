
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const savedLanguage = localStorage.getItem('i18nextLng') || 'pt';

const resources = {
  pt: {
    translation: {
      common: {
        welcome: "Bem-vindo",
        search: "Pesquisar...",
        loading: "Carregando...",
        save: "Salvar",
        cancel: "Cancelar",
        delete: "Excluir",
        edit: "Editar",
        download: "Baixar",
        upload: "Upload",
        import: "Importar",
        create: "Criar",
        status: "Status",
        date: "Data",
        actions: "Ações",
        privacy: "Privacidade e Termos",
        changePassword: "Alterar Senha",
        logout: "Sair do Sistema",
        back: "Voltar",
        close: "Fechar",
        confirm: "Confirmar",
        required: "Obrigatório",
        expand: "Expandir",
        collapse: "Recolher",
        menu: "Menu",
        all: "Todos",
        filter: "Filtrar",
        description: "Descrição",
        priority: "Prioridade"
      },
      files: {
        name: "Nome do Arquivo",
        productBatch: "Produto / Lote",
        date: "Data",
        status: "Status",
        pending: "Pendente",
        size: "Tamanho",
        download: "Baixar",
        bulkDownload: "Baixar Selecionados",
        noItems: "Nenhum documento encontrado.",
        dropZone: "Solte os arquivos aqui",
        docsFound: "documentos encontrados",
        selected: "selecionados",
        downloading: "Preparando download seguro...",
        zipGenerating: "Gerando arquivo compactado para",
        permissionError: "Erro de permissão ou arquivo não encontrado.",
        fileDetected: "Arquivo detectado",
        viewOptions: "Opções de Visualização",
        sortBy: "Ordenar por",
        groupBy: "Agrupar por",
        groups: {
          folders: "Pastas",
          approved: "Aprovados",
          pending: "Pendentes",
          ungrouped: "Sem grupo"
        },
        sort: {
          nameAsc: "Nome (A-Z)",
          nameDesc: "Nome (Z-A)",
          dateNew: "Data (Mais recente)",
          dateOld: "Data (Mais antigo)",
          status: "Status"
        }
      },
      cookie: {
        title: "Segurança e Dados",
        text: "Utilizamos cookies e tecnologias de autenticação para garantir a proteção dos seus dados industriais e conformidade com a ISO 9001 e LGPD.",
        accept: "Aceitar e Entrar"
      },
      menu: {
        main: "Principal",
        home: "Início",
        library: "Biblioteca",
        quickAccess: "Acesso Rápido",
        recent: "Recentes",
        favorites: "Favoritos",
        tickets: "Suporte Técnico",
        dashboard: "Dashboard",
        documents: "Documentos",
        management: "Gestão Corporativa",
        portalName: "Portal da Qualidade",
        brand: "Aços Vital",
        support: "Suporte",
        system: "Sistema"
      },
      dashboard: {
        hello: "Olá",
        whatLookingFor: "Gerenciamento de Documentos Técnicos",
        searchPlaceholder: "Lote, Corrida ou Nota Fiscal...",
        accountStatus: "Status da Conta",
        verified: "VERIFICADO",
        statusDesc: "Sua conta está ativa e em conformidade documental.",
        libraryHeader: "Repositório de Documentos",
        favoritesHeader: "Acesso Rápido",
        historyHeader: "Histórico",
        ticketsHeader: "Central de Suporte",
        filters: "Filtros Avançados",
        period: "Período",
        clear: "Limpar Filtros",
        openTicket: "Abrir Novo Chamado",
        noTickets: "Sem chamados ativos no momento.",
        regular: "Operação Normal",
        homeTitle: "Dashboard",
        filesTitle: "Minha Biblioteca",
        favoritesTitle: "Meus Favoritos",
        recentTitle: "Arquivos Recentes",
        ticketsTitle: "Central de Suporte"
      },
      login: {
        welcomeBack: "Acesso Restrito",
        enterCredentials: "Use suas credenciais fornecidas pela TI Aços Vital.",
        emailLabel: "E-mail Profissional",
        passwordLabel: "Senha de Acesso",
        forgotPassword: "Redefinir Senha",
        accessPortal: "Entrar no Portal",
        sloganTitle: "Conformidade e Rastreabilidade Industrial.",
        sloganText: "Plataforma centralizada para gestão de certificados de qualidade e laudos técnicos Aços Vital S.A."
      },
      roles: {
        ADMIN: "Administrador",
        QUALITY: "Analista de Qualidade",
        CLIENT: "Cliente B2B"
      },
      admin: {
        tabs: {
          overview: "Visão Geral",
          users: "Usuários",
          clients: "Clientes",
          tickets: "Chamados",
          logs: "Logs de Auditoria",
          settings: "Configurações"
        },
        settings: {
          techSupport: "Suporte N3 Infra"
        },
        users: {
          createTitle: "Novo Acesso",
          editTitle: "Editar Usuário",
          newAccess: "Criar Acesso",
          identity: "Identidade",
          role: "Perfil",
          org: "Organização",
          name: "Nome Completo",
          email: "E-mail",
          roleLabel: "Nível de Acesso",
          department: "Departamento",
          orgLink: "Vincular Organização",
          filters: "Filtros de Lista"
        },
        stats: {
          totalUsers: "Total de Usuários",
          organizations: "Empresas",
          activities: "Atividades 24h",
          b2bContracts: "Contratos B2B",
          loggedActions: "Ações Registradas",
          allOperational: "Todos os sistemas operacionais",
          headers: {
            timestamp: "Horário",
            user: "Usuário",
            action: "Ação",
            target: "Alvo",
            ip: "Endereço IP",
            severity: "Severidade"
          }
        },
        n3Support: {
          title: "Suporte N3 - Infraestrutura",
          subtitle: "Solicitação direta para equipe técnica externa",
          component: "Componente Afetado",
          impact: "Impacto no Negócio",
          context: "Contexto",
          module: "Módulo",
          steps: "Passos para Reproduzir",
          submit: "Enviar para N3",
          success: "Solicitação enviada com sucesso ID:",
          components: {
            INFRA_UP: "Infraestrutura / Cloud",
            DB_MOD: "Banco de Dados",
            SECURITY_INC: "Incidente de Segurança",
            BACKUP_RESTORE: "Backup / Restauração",
            CUSTOM_DEV: "Desenvolvimento Customizado"
          },
          contexts: {
            SYSTEM: "Global (Sistema Inteiro)",
            CLIENT: "Específico por Cliente",
            INTERNAL: "Uso Interno Vital"
          },
          modules: {
            AUTH: "Autenticação / Login",
            DASHBOARD: "Dashboard / Home",
            FILES: "Storage / Arquivos",
            API: "Conectividade API"
          }
        },
        tickets: {
          newTicket: "Novo Chamado",
          subject: "Assunto",
          status: {
            OPEN: "Aberto",
            IN_PROGRESS: "Em Atendimento",
            RESOLVED: "Resolvido"
          },
          priority: {
            LOW: "Baixa",
            MEDIUM: "Média",
            HIGH: "Alta",
            CRITICAL: "Crítica"
          }
        }
      },
      notifications: {
        title: "Notificações",
        empty: "Nenhuma notificação nova",
        markAll: "Ler Todas"
      },
      privacy: {
        title: "Políticas e Privacidade",
        subtitle: "Termos de uso do Portal Vital Link",
        section1: "Introdução",
        section2: "Coleta de Dados",
        section3: "Segurança",
        section4: "Uso de Cookies",
        section5: "Direitos do Titular",
        close: "Li e Aceito"
      },
      changePassword: {
        title: "Segurança da Conta",
        current: "Senha Atual",
        new: "Nova Senha",
        confirm: "Confirmar Nova Senha",
        submit: "Atualizar Senha",
        matchError: "As senhas não coincidem.",
        success: "Senha alterada com sucesso."
      }
    }
  },
  en: {
    translation: {
      common: {
        welcome: "Welcome",
        search: "Search...",
        loading: "Loading...",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        download: "Download",
        upload: "Upload",
        import: "Import",
        create: "Create",
        status: "Status",
        date: "Date",
        actions: "Actions",
        privacy: "Privacy & Terms",
        changePassword: "Change Password",
        logout: "Logout",
        back: "Back",
        close: "Close",
        confirm: "Confirm",
        required: "Required",
        expand: "Expand",
        collapse: "Collapse",
        menu: "Menu",
        all: "All",
        filter: "Filter",
        description: "Description",
        priority: "Priority"
      },
      files: {
        name: "File Name",
        productBatch: "Product / Batch",
        date: "Date",
        status: "Status",
        pending: "Pending",
        size: "Size",
        download: "Download",
        bulkDownload: "Download Selected",
        noItems: "No documents found.",
        dropZone: "Drop files here",
        docsFound: "documents found",
        selected: "selected",
        downloading: "Preparing secure download...",
        zipGenerating: "Generating zip file for",
        permissionError: "Permission error or file not found.",
        fileDetected: "File detected",
        viewOptions: "View Options",
        sortBy: "Sort by",
        groupBy: "Group by",
        groups: {
          folders: "Folders",
          approved: "Approved",
          pending: "Pending",
          ungrouped: "Ungrouped"
        },
        sort: {
          nameAsc: "Name (A-Z)",
          nameDesc: "Name (Z-A)",
          dateNew: "Date (Newest)",
          dateOld: "Date (Oldest)",
          status: "Status"
        }
      },
      cookie: {
        title: "Security & Data",
        text: "We use cookies and authentication technologies to ensure the protection of your industrial data and compliance with ISO 9001 and LGPD/GDPR.",
        accept: "Accept and Enter"
      },
      menu: {
        main: "Main",
        home: "Home",
        library: "Library",
        quickAccess: "Quick Access",
        recent: "Recent",
        favorites: "Favorites",
        tickets: "Support",
        dashboard: "Dashboard",
        documents: "Documents",
        management: "Management",
        portalName: "Quality Portal",
        brand: "Vital Steels",
        support: "Support",
        system: "System"
      },
      dashboard: {
        hello: "Hello",
        whatLookingFor: "Technical Document Management",
        searchPlaceholder: "Batch, Heat or Invoice...",
        accountStatus: "Account Status",
        verified: "VERIFIED",
        statusDesc: "Your account is active and document compliant.",
        libraryHeader: "Document Repository",
        favoritesHeader: "Quick Access",
        historyHeader: "History",
        ticketsHeader: "Support Center",
        filters: "Advanced Filters",
        period: "Period",
        clear: "Clear Filters",
        openTicket: "Open New Ticket",
        noTickets: "No active tickets at the moment.",
        regular: "Normal Operation",
        homeTitle: "Dashboard",
        filesTitle: "My Library",
        favoritesTitle: "My Favorites",
        recentTitle: "Recent Files",
        ticketsTitle: "Support Center"
      },
      login: {
        welcomeBack: "Restricted Access",
        enterCredentials: "Use your credentials provided by Vital IT.",
        emailLabel: "Work Email",
        passwordLabel: "Access Password",
        forgotPassword: "Reset Password",
        accessPortal: "Enter Portal",
        sloganTitle: "Industrial Compliance and Traceability.",
        sloganText: "Centralized platform for managing quality certificates and technical reports for Vital Steels S.A."
      },
      roles: {
        ADMIN: "Administrator",
        QUALITY: "Quality Analyst",
        CLIENT: "B2B Client"
      },
      admin: {
        tabs: {
          overview: "Overview",
          users: "Users",
          clients: "Clients",
          tickets: "Tickets",
          logs: "Audit Logs",
          settings: "Settings"
        },
        settings: {
          techSupport: "L3 Infra Support"
        },
        users: {
          createTitle: "New Access",
          editTitle: "Edit User",
          newAccess: "Create Access",
          identity: "Identity",
          role: "Role",
          org: "Organization",
          name: "Full Name",
          email: "Email",
          roleLabel: "Access Level",
          department: "Department",
          orgLink: "Link Organization",
          filters: "List Filters"
        },
        stats: {
          totalUsers: "Total Users",
          organizations: "Companies",
          activities: "24h Activities",
          b2bContracts: "B2B Contracts",
          loggedActions: "Logged Actions",
          allOperational: "All systems operational",
          headers: {
            timestamp: "Timestamp",
            user: "User",
            action: "Action",
            target: "Target",
            ip: "IP Address",
            severity: "Severity"
          }
        },
        n3Support: {
          title: "L3 Support - Infrastructure",
          subtitle: "Direct request to external technical team",
          component: "Affected Component",
          impact: "Impact on the Business",
          context: "Context",
          module: "Module",
          steps: "Steps to Reproduce",
          submit: "Send to L3",
          success: "Request sent successfully ID:",
          components: {
            INFRA_UP: "Infrastructure / Cloud",
            DB_MOD: "Database",
            SECURITY_INC: "Security Incident",
            BACKUP_RESTORE: "Backup / Restore",
            CUSTOM_DEV: "Custom Development"
          },
          contexts: {
            SYSTEM: "Global (Entire System)",
            CLIENT: "Client Specific",
            INTERNAL: "Vital Internal Use"
          },
          modules: {
            AUTH: "Authentication / Login",
            DASHBOARD: "Dashboard / Home",
            FILES: "Storage / Files",
            API: "API Connectivity"
          }
        },
        tickets: {
          newTicket: "New Ticket",
          subject: "Subject",
          status: {
            OPEN: "Open",
            IN_PROGRESS: "In Progress",
            RESOLVED: "Resolved"
          },
          priority: {
            LOW: "Low",
            MEDIUM: "Medium",
            HIGH: "High",
            CRITICAL: "Critical"
          }
        }
      },
      notifications: {
        title: "Notifications",
        empty: "No new notifications",
        markAll: "Mark All Read"
      },
      privacy: {
        title: "Privacy & Policies",
        subtitle: "Vital Link Portal Terms of Use",
        section1: "Introduction",
        section2: "Data Collection",
        section3: "Security",
        section4: "Cookies Usage",
        section5: "Subject Rights",
        close: "I Read and Accept"
      },
      changePassword: {
        title: "Account Security",
        current: "Current Password",
        new: "New Password",
        confirm: "Confirm New Password",
        submit: "Update Password",
        matchError: "Passwords do not match.",
        success: "Password updated successfully."
      }
    }
  },
  es: {
    translation: {
      common: {
        welcome: "Bienvenido",
        search: "Buscar...",
        loading: "Cargando...",
        save: "Guardar",
        cancel: "Cancelar",
        delete: "Eliminar",
        edit: "Editar",
        download: "Descargar",
        upload: "Subir",
        import: "Importar",
        create: "Crear",
        status: "Estado",
        date: "Fecha",
        actions: "Acciones",
        privacy: "Privacidad y Términos",
        changePassword: "Cambiar Contraseña",
        logout: "Cerrar Sesión",
        back: "Volver",
        close: "Cerrar",
        confirm: "Confirmar",
        required: "Obligatorio",
        expand: "Expandir",
        collapse: "Contraer",
        menu: "Menú",
        all: "Todos",
        filter: "Filtrar",
        description: "Descripción",
        priority: "Prioridade"
      },
      files: {
        name: "Nombre del Archivo",
        productBatch: "Producto / Lote",
        date: "Fecha",
        status: "Estado",
        pending: "Pendiente",
        size: "Tamaño",
        download: "Descargar",
        bulkDownload: "Descargar Seleccionados",
        noItems: "No se encontraron documentos.",
        dropZone: "Suelte los archivos aquí",
        docsFound: "documentos encontrados",
        selected: "seleccionados",
        downloading: "Preparando descarga segura...",
        zipGenerating: "Generando archivo zip para",
        permissionError: "Error de permiso o archivo no encontrado.",
        fileDetected: "Archivo detectado",
        viewOptions: "Opciones de Vista",
        sortBy: "Ordenar por",
        groupBy: "Agrupar por",
        groups: {
          folders: "Carpetas",
          approved: "Aprobados",
          pending: "Pendientes",
          ungrouped: "Sin grupo"
        },
        sort: {
          nameAsc: "Nombre (A-Z)",
          nameDesc: "Nombre (Z-A)",
          dateNew: "Fecha (Más reciente)",
          dateOld: "Fecha (Más antiguo)",
          status: "Estado"
        }
      },
      cookie: {
        title: "Seguridad y Datos",
        text: "Utilizamos cookies y tecnologías de autenticación para garantizar la protección de sus datos industriales y el cumplimiento con ISO 9001 y LGPD/GDPR.",
        accept: "Aceptar y Entrar"
      },
      menu: {
        main: "Principal",
        home: "Inicio",
        library: "Biblioteca",
        quickAccess: "Acceso Rápido",
        recent: "Recientes",
        favorites: "Favoritos",
        tickets: "Soporte",
        dashboard: "Dashboard",
        documents: "Documentos",
        management: "Gestión",
        portalName: "Portal de Calidad",
        brand: "Aceros Vital",
        support: "Soporte",
        system: "Sistema"
      },
      dashboard: {
        hello: "Hola",
        whatLookingFor: "Gestión de Documentos Técnicos",
        searchPlaceholder: "Lote, Colada o Factura...",
        accountStatus: "Estado de la Cuenta",
        verified: "VERIFICADO",
        statusDesc: "Su cuenta está activa y en cumplimiento documental.",
        libraryHeader: "Repositorio de Documentos",
        favoritesHeader: "Acceso Rápido",
        historyHeader: "Historial",
        ticketsHeader: "Centro de Soporte",
        filters: "Filtros Avançados",
        period: "Período",
        clear: "Limpar Filtros",
        openTicket: "Abrir Nuevo Ticket",
        noTickets: "Sin tickets activos en este momento.",
        regular: "Operación Normal",
        homeTitle: "Dashboard",
        filesTitle: "Mi Biblioteca",
        favoritesTitle: "Mis Favoritos",
        recentTitle: "Archivos Recentes",
        ticketsTitle: "Centro de Soporte"
      },
      login: {
        welcomeBack: "Acceso Restringido",
        enterCredentials: "Use sus credenciales proporcionadas por IT de Vital.",
        emailLabel: "Correo Profesional",
        passwordLabel: "Contraseña de Acceso",
        forgotPassword: "Restablecer Contraseña",
        accessPortal: "Entrar al Portal",
        sloganTitle: "Cumplimiento y Trazabilidad Industrial.",
        sloganText: "Plataforma centralizada para la gestión de certificados de calidad e informes técnicos de Aceros Vital S.A."
      },
      roles: {
        ADMIN: "Administrador",
        QUALITY: "Analista de Calidad",
        CLIENT: "Cliente B2B"
      },
      admin: {
        tabs: {
          overview: "Resumen",
          users: "Usuarios",
          clients: "Clientes",
          tickets: "Tickets",
          logs: "Logs de Auditoría",
          settings: "Configuración"
        },
        settings: {
          techSupport: "Soporte L3 Infra"
        },
        users: {
          createTitle: "Nuevo Acceso",
          editTitle: "Editar Usuario",
          newAccess: "Crear Acceso",
          identity: "Identidad",
          role: "Perfil",
          org: "Organización",
          name: "Nombre Completo",
          email: "Correo",
          roleLabel: "Nivel de Acceso",
          department: "Departamento",
          orgLink: "Vincular Organización",
          filters: "Filtros de Lista"
        },
        stats: {
          totalUsers: "Total Usuarios",
          organizations: "Empresas",
          activities: "Actividades 24h",
          b2bContracts: "Contratos B2B",
          loggedActions: "Acciones Registradas",
          allOperational: "Sistemas operando normalmente",
          headers: {
            timestamp: "Horario",
            user: "Usuario",
            action: "Ación",
            target: "Objetivo",
            ip: "Dirección IP",
            severity: "Severidad"
          }
        },
        n3Support: {
          title: "Soporte L3 - Infraestructura",
          subtitle: "Solicitud directa al equipo técnico externo",
          component: "Componente Afectado",
          impact: "Impacto en el Negocio",
          context: "Contexto",
          module: "Módulo",
          steps: "Pasos para Reproducir",
          submit: "Enviar a L3",
          success: "Solicitud enviada con éxito ID:",
          components: {
            INFRA_UP: "Infraestructura / Cloud",
            DB_MOD: "Base de Datos",
            SECURITY_INC: "Incidente de Seguridad",
            BACKUP_RESTORE: "Backup / Restauración",
            CUSTOM_DEV: "Desarrollo Personalizado"
          },
          contexts: {
            SYSTEM: "Global (Todo el sistema)",
            CLIENT: "Específico por Cliente",
            INTERNAL: "Uso Interno Vital"
          },
          modules: {
            AUTH: "Autenticación / Login",
            DASHBOARD: "Dashboard / Home",
            FILES: "Almacenamiento / Archivos",
            API: "Conectividad API"
          }
        },
        tickets: {
          newTicket: "Nuevo Ticket",
          subject: "Asunto",
          status: {
            OPEN: "Abierto",
            IN_PROGRESS: "En Proceso",
            RESOLVED: "Resuelto"
          },
          priority: {
            LOW: "Baja",
            MEDIUM: "Media",
            HIGH: "Alta",
            CRITICAL: "Crítica"
          }
        }
      },
      notifications: {
        title: "Notificaciones",
        empty: "Sin notificaciones nuevas",
        markAll: "Leer Todas"
      },
      privacy: {
        title: "Políticas y Privacidad",
        subtitle: "Términos de uso del Portal Vital Link",
        section1: "Introducción",
        section2: "Recolección de Datos",
        section3: "Seguridad",
        section4: "Uso de Cookies",
        section5: "Direitos do Titular",
        close: "He Leído y Acepto"
      },
      changePassword: {
        title: "Seguridad de la Cuenta",
        current: "Contraseña Actual",
        new: "Nueva Contraseña",
        confirm: "Confirmar Nueva Contraseña",
        submit: "Actualizar Contraseña",
        matchError: "Las contraseñas no coinciden.",
        success: "Contraseña cambiada con éxito."
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: "pt",
    interpolation: { escapeValue: false }
  });

export default i18n;
