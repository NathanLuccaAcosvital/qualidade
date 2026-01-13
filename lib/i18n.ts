
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
        priority: "Prioridade",
        user: "Usuário", // NOVO
        dateToday: "{{date}}", // NOVO
        goodMorning: "Bom dia", // NOVO
        goodAfternoon: "Boa tarde", // NOVO
        goodEvening: "Boa noite", // NOVO
        filterByStatus: "Filtrar por status" // NOVO
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
          ungrouped: "Sem grupo",
          rejected: "Recusados" // NOVO
        },
        sort: {
          nameAsc: "Nome (A-Z)",
          nameDesc: "Nome (Z-A)",
          dateNew: "Data (Mais recente)",
          dateOld: "Data (Mais antigo)",
          status: "Status"
        },
        toggleFavorite: "Desfavoritar", // NOVO
        addFavorite: "Adicionar aos favoritos" // NOVO
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
        system: "Sistema",
        portalNameShort: "Vital Link", // NOVO
        qualityManagement: "Gestão da Qualidade", // NOVO
        clientPortfolio: "Carteira de Clientes", // NOVO
        masterLibrary: "Biblioteca Mestra", // NOVO
        serviceDesk: "Service Desk", // NOVO
        systemMonitoring: "Sistemas Monitorados", // NOVO
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
        ticketsTitle: "Central de Suporte",
        heroDescription: "Centralize seus certificados de qualidade e garanta a rastreabilidade total de seus materiais.", // NOVO
        status: { // NOVO
          scheduled: "Manutenção Agendada",
          normal: "Operação Normal",
          scheduledDefaultMessage: "Sistema em atualização programada.",
          monitoringActive: "Monitoramento Vital Ativo"
        },
        kpi: { // NOVO
          libraryLabel: "Biblioteca",
          activeDocsSubtext: "Docs. Ativos",
          pendingLabel: "Pendências",
          awaitingSubtext: "Aguardando",
          ticketsLabel: "Chamados",
          openTicketsSubtext: "Em aberto"
        },
        noTicketsRegistered: "Nenhum chamado registrado.", // NOVO
        exploreAll: "Explorar Tudo", // NOVO
        emptyFlatView: { // NOVO
            message: "Nenhum documento aqui ainda.",
            subtextFavorites: "Marque documentos com estrela para encontrá-los rapidamente.",
            subtextRecent: "Seus documentos mais recentes aparecerão aqui."
        },
        supportCenter: "Central de Suporte", // NOVO
        myTickets: "Meus Chamados", // NOVO
        noSupportTickets: "Nenhum chamado registrado.", // NOVO
        openNewTicket: "Abrir Novo Chamado", // NOVO
        ticket: { // NOVO
          id: "ID",
          subject: "Assunto",
          priority: "Prioridade",
          status: "Status",
          createdAt: "Criado em",
          resolutionNote: "Nota de Resolução", // NOVO
          details: "Detalhes do Chamado", // NOVO
          requester: "Solicitante", // NOVO
          user: "Usuário", // NOVO
          company: "Empresa", // NOVO
          history: "Histórico", // NOVO
          updatedStatus: "Atualizar Status", // NOVO
          saveChanges: "Salvar Alterações", // NOVO
          requiredResolutionNote: "É necessário adicionar uma nota de resolução para fechar o chamado.", // NOVO
        },
        accessingAuditRecords: "Acessando registros de auditoria...", // NOVO
        noRecordsFound: "Nenhum registro encontrado para auditoria.", // NOVO
        auditMoreClients: "Auditar mais clientes", // NOVO
        auditedRecords: "Auditado • {{count}} Registros", // NOVO
        pendingStatus: "{{count}} Pendências", // NOVO
        complianceHealth: "Saúde Compliance", // NOVO
        lastAnalysis: "Última Análise", // NOVO
        criticalPendencies: "Críticas", // NOVO
        upToDate: "Em Dia", // NOVO
        organization: "Organização / Razão Social", // NOVO
        fiscalID: "ID Fiscal", // NOVO
        activeClients: "Ativos", // NOVO
        allClients: "Todos" // NOVO
      },
      login: {
        welcomeBack: "Acesso Restrito",
        enterCredentials: "Use suas credenciais fornecidas pela TI Aços Vital.",
        emailLabel: "E-mail Profissional",
        passwordLabel: "Senha de Acesso",
        forgotPassword: "Esqueceu?", // NOVO
        accessPortal: "Entrar no Portal",
        sloganTitle: "Conformidade e Rastreabilidade Industrial.",
        sloganText: "Plataforma centralizada para gestão de certificados de qualidade e laudos técnicos Aços Vital S.A.",
        authenticateAccess: "Autenticar Acesso", // NOVO
        newUser: "Novo por aqui?", // NOVO
        requestRegister: "Solicitar Registro", // NOVO
        corpEmail: "E-mail Corporativo", // NOVO
        accessPassword: "Senha de Acesso", // NOVO
        connectionError: "Erro de conexão com o servidor." // NOVO
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
      },
      maintenance: { // NOVO: Para MaintenanceScreen
        title: "Sistema em Manutenção",
        message: "Estamos realizando atualizações críticas de segurança e infraestrutura. O acesso está temporariamente suspenso para garantir a integridade dos dados.",
        returnEstimate: "Previsão de Retorno",
        soon: "Em breve",
        todayAt: "Hoje às {{time}}",
        retry: "Tentar Novamente",
        contact: "Contato",
        systemId: "ID do Sistema: AV-SYS-LOCKDOWN-001"
      },
      signup: { // NOVO
        newRegister: "Novo Registro",
        fillFields: "Preencha os campos abaixo com seus dados profissionais.",
        fullName: "Nome Completo",
        corpEmail: "E-mail Corporativo",
        password: "Senha de Acesso",
        confirmPassword: "Confirmar Senha",
        organization: "Organização",
        department: "Departamento",
        select: "Selecione...",
        companyNotListed: "Minha empresa não está listada",
        requestAccess: "Solicitar acesso corporativo.",
        joinNetwork: "Junte-se à rede de conformidade Aços Vital.",
        requestSent: "Solicitação Enviada!",
        validationPending: "Seu pedido está sendo validado pela equipe técnica.",
        alreadyHaveAccount: "Já possui uma conta?",
        login: "Fazer Login"
      },
      quality: { // NOVO
        overview: "Visão Geral",
        activePortfolio: "Carteira Ativa",
        pendingDocs: "Docs. Pendentes",
        openTickets: "Chamados Abertos",
        masterRepository: "Repositório Mestre",
        accessFiles: "Acessar Arquivos",
        recentActivity: "Atividade Recente",
        activityHistory: "Histórico de análise carregado em tempo real.",
        systemAlerts: "Alertas do Sistema",
        complianceISO: "Conformidade ISO 9001",
        biannualCheck: "Verificação semestral agendada para o próximo mês.",
        b2bPortfolio: "Carteira B2B",
        masterLibrary: "Biblioteca Mestra",
        masterLibrarySubtitle: "Modelos de certificados e especificações técnicas globais.",
        sendNewCertificate: "Enviar Novo Certificado",
        pdfImageFile: "Arquivo PDF/Imagem",
        product: "Produto",
        batchNumber: "Nº Corrida/Lote",
        invoiceNumber: "Nota Fiscal vinculada",
        currentStatus: "Estado Atual",
        approve: "Aprovar",
        reject: "Recusar",
        justification: "Justificativa",
        rejectionReasonPlaceholder: "Descreva o motivo da não conformidade...",
        confirmRejection: "Confirmar Recusa",
        batchData: "Dados do Lote",
        productLabel: "Produto",
        batchLabel: "Nº Corrida",
        invoiceLabel: "Nota Fiscal",
        lastAnalysis: "Última Análise",
        viewPDF: "Visualizar PDF",
        uploadFile: "Realizar Upload",
        uploading: "Enviando...",
        documentApprovedSuccess: "Documento {{fileName}} aprovado com sucesso!",
        documentRejectedSuccess: "Documento {{fileName}} recusado com sucesso!",
        errorProcessingInspection: "Erro ao processar inspeção.",
        reasonRequired: "Por favor, informe o motivo da rejeição.",
        documentUploadedSuccess: "Arquivo enviado com sucesso!",
        errorUploadingFile: "Erro no upload do arquivo.",
        myClients: "Meus Clientes", // NOVO
        searchClient: "Auditar cliente por nome ou CNPJ...", // NOVO
        healthCompliance: "Saúde Compliance", // NOVO
        critical: "Críticas", // NOVO
        upToDate: "Em Dia", // NOVO
        lastUpdate: "Última atualização", // NOVO
        escalateToAdmin: "Escalonar para Administração", // NOVO
        escalateReason: "Motivo do escalonamento para Admin...", // NOVO
        escalateWarning: "Se o chamado exige intervenção administrativa ou técnica de nível 3, você pode escalá-lo. Um motivo é obrigatório.", // NOVO
        escalateTicket: "Escalar Chamado", // NOVO
        serviceDeskLoading: "Carregando Service Desk...", // NOVO
        noTicketsFoundQuality: "Nenhum chamado pendente ou registrado." // NOVO
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
        priority: "Priority",
        user: "User", // NOVO
        dateToday: "{{date}}", // NOVO
        goodMorning: "Good morning", // NOVO
        goodAfternoon: "Good afternoon", // NOVO
        goodEvening: "Good evening", // NOVO
        filterByStatus: "Filter by status" // NOVO
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
          ungrouped: "Ungrouped",
          rejected: "Rejected" // NOVO
        },
        sort: {
          nameAsc: "Name (A-Z)",
          nameDesc: "Name (Z-A)",
          dateNew: "Date (Newest)",
          dateOld: "Date (Oldest)",
          status: "Status"
        },
        toggleFavorite: "Unfavorite", // NOVO
        addFavorite: "Add to favorites" // NOVO
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
        system: "System",
        portalNameShort: "Vital Link", // NOVO
        qualityManagement: "Quality Management", // NOVO
        clientPortfolio: "Client Portfolio", // NOVO
        masterLibrary: "Master Library", // NOVO
        serviceDesk: "Service Desk", // NOVO
        systemMonitoring: "Systems Monitored", // NOVO
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
        ticketsTitle: "Support Center",
        heroDescription: "Centralize your quality certificates and ensure total traceability of your materials.", // NOVO
        status: { // NOVO
          scheduled: "Scheduled Maintenance",
          normal: "Normal Operation",
          scheduledDefaultMessage: "System undergoing scheduled update.",
          monitoringActive: "Vital Monitoring Active"
        },
        kpi: { // NOVO
          libraryLabel: "Library",
          activeDocsSubtext: "Active Docs",
          pendingLabel: "Pending",
          awaitingSubtext: "Awaiting",
          ticketsLabel: "Tickets",
          openTicketsSubtext: "Open"
        },
        noTicketsRegistered: "No tickets registered.", // NOVO
        exploreAll: "Explore All", // NOVO
        emptyFlatView: { // NOVO
            message: "No documents here yet.",
            subtextFavorites: "Star documents to find them quickly.",
            subtextRecent: "Your most recent documents will appear here."
        },
        supportCenter: "Support Center", // NOVO
        myTickets: "My Tickets", // NOVO
        noSupportTickets: "No tickets registered.", // NOVO
        openNewTicket: "Open New Ticket", // NOVO
        ticket: { // NOVO
          id: "ID",
          subject: "Subject",
          priority: "Priority",
          status: "Status",
          createdAt: "Created At",
          resolutionNote: "Resolution Note", // NOVO
          details: "Ticket Details", // NOVO
          requester: "Requester", // NOVO
          user: "User", // NOVO
          company: "Company", // NOVO
          history: "History", // NOVO
          updatedStatus: "Update Status", // NOVO
          saveChanges: "Save Changes", // NOVO
          requiredResolutionNote: "A resolution note is required to close the ticket.", // NOVO
        },
        accessingAuditRecords: "Accessing audit records...", // NOVO
        noRecordsFound: "No audit records found.", // NOVO
        auditMoreClients: "Audit more clients", // NOVO
        auditedRecords: "Audited • {{count}} Records", // NOVO
        pendingStatus: "{{count}} Pending", // NOVO
        complianceHealth: "Compliance Health", // NOVO
        lastAnalysis: "Last Analysis", // NOVO
        criticalPendencies: "Critical", // NOVO
        upToDate: "Up to Date", // NOVO
        organization: "Organization / Company Name", // NOVO
        fiscalID: "Fiscal ID", // NOVO
        activeClients: "Active", // NOVO
        allClients: "All" // NOVO
      },
      login: {
        welcomeBack: "Restricted Access",
        enterCredentials: "Use your credentials provided by Vital IT.",
        emailLabel: "Work Email",
        passwordLabel: "Access Password",
        forgotPassword: "Forgot?", // NOVO
        accessPortal: "Enter Portal",
        sloganTitle: "Industrial Compliance and Traceability.",
        sloganText: "Centralized platform for managing quality certificates and technical reports for Vital Steels S.A.",
        authenticateAccess: "Authenticate Access", // NOVO
        newUser: "New here?", // NOVO
        requestRegister: "Request Registration", // NOVO
        corpEmail: "Corporate Email", // NOVO
        accessPassword: "Access Password", // NOVO
        connectionError: "Connection error with the server." // NOVO
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
      },
      maintenance: { // NOVO: Para MaintenanceScreen
        title: "System Under Maintenance",
        message: "We are performing critical security and infrastructure updates. Access is temporarily suspended to ensure data integrity.",
        returnEstimate: "Return Estimate",
        soon: "Soon",
        todayAt: "Today at {{time}}",
        retry: "Try Again",
        contact: "Contact",
        systemId: "System ID: AV-SYS-LOCKDOWN-001"
      },
      signup: { // NOVO
        newRegister: "New Registration",
        fillFields: "Fill in the fields below with your professional data.",
        fullName: "Full Name",
        corpEmail: "Corporate Email",
        password: "Access Password",
        confirmPassword: "Confirm Password",
        organization: "Organization",
        department: "Department",
        select: "Select...",
        companyNotListed: "My company is not listed",
        requestAccess: "Request your corporate access.",
        joinNetwork: "Join the Vital Steels compliance network.",
        requestSent: "Request Sent!",
        validationPending: "Your request is being validated by the technical team.",
        alreadyHaveAccount: "Already have an account?",
        login: "Login"
      },
      quality: { // NOVO
        overview: "Overview",
        activePortfolio: "Active Portfolio",
        pendingDocs: "Pending Docs.",
        openTickets: "Open Tickets",
        masterRepository: "Master Repository",
        accessFiles: "Access Files",
        recentActivity: "Recent Activity",
        activityHistory: "Analysis history loaded in real-time.",
        systemAlerts: "System Alerts",
        complianceISO: "ISO 9001 Compliance",
        biannualCheck: "Biannual verification scheduled for next month.",
        b2bPortfolio: "B2B Portfolio",
        masterLibrary: "Master Library",
        masterLibrarySubtitle: "Global certificate templates and technical specifications.",
        sendNewCertificate: "Send New Certificate",
        pdfImageFile: "PDF/Image File",
        product: "Product",
        batchNumber: "Batch/Lot No.",
        invoiceNumber: "Linked Invoice No.",
        currentStatus: "Current Status",
        approve: "Approve",
        reject: "Reject",
        justification: "Justification",
        rejectionReasonPlaceholder: "Describe the reason for non-conformity...",
        confirmRejection: "Confirm Rejection",
        batchData: "Batch Data",
        productLabel: "Product",
        batchLabel: "Batch No.",
        invoiceLabel: "Invoice No.",
        lastAnalysis: "Last Analysis",
        viewPDF: "View PDF",
        uploadFile: "Perform Upload",
        uploading: "Uploading...",
        documentApprovedSuccess: "Document {{fileName}} approved successfully!",
        documentRejectedSuccess: "Document {{fileName}} rejected successfully!",
        errorProcessingInspection: "Error processing inspection.",
        reasonRequired: "Please state the reason for rejection.",
        documentUploadedSuccess: "File uploaded successfully!",
        errorUploadingFile: "Error uploading file.",
        myClients: "My Clients", // NOVO
        searchClient: "Audit client by name or CNPJ...", // NOVO
        healthCompliance: "Compliance Health", // NOVO
        critical: "Critical", // NOVO
        upToDate: "Up to Date", // NOVO
        lastUpdate: "Last update", // NOVO
        escalateToAdmin: "Escalate to Admin", // NOVO
        escalateReason: "Reason for escalation to Admin...", // NOVO
        escalateWarning: "If the ticket requires administrative or level 3 technical intervention, you can escalate it. A reason is mandatory.", // NOVO
        escalateTicket: "Escalate Ticket", // NOVO
        serviceDeskLoading: "Loading Service Desk...", // NOVO
        noTicketsFoundQuality: "No pending or registered tickets." // NOVO
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
        confirm: "Confirm",
        required: "Obligatorio",
        expand: "Expandir",
        collapse: "Contraer",
        menu: "Menú",
        all: "Todos",
        filter: "Filtrar",
        description: "Descripción",
        priority: "Prioridade",
        user: "Usuario", // NOVO
        dateToday: "{{date}}", // NOVO
        goodMorning: "Buenos días", // NOVO
        goodAfternoon: "Buenas tardes", // NOVO
        goodEvening: "Buenas noches", // NOVO
        filterByStatus: "Filtrar por estado" // NOVO
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
          ungrouped: "Sin grupo",
          rejected: "Rechazados" // NOVO
        },
        sort: {
          nameAsc: "Nombre (A-Z)",
          nameDesc: "Nombre (Z-A)",
          dateNew: "Fecha (Más reciente)",
          dateOld: "Fecha (Más antiguo)",
          status: "Estado"
        },
        toggleFavorite: "Quitar de favoritos", // NOVO
        addFavorite: "Agregar a favoritos" // NOVO
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
        system: "Sistema",
        portalNameShort: "Vital Link", // NOVO
        qualityManagement: "Gestión de Calidad", // NOVO
        clientPortfolio: "Cartera de Clientes", // NOVO
        masterLibrary: "Biblioteca Maestra", // NOVO
        serviceDesk: "Mesa de Servicio", // NOVO
        systemMonitoring: "Sistemas Monitorizados", // NOVO
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
        filters: "Filtros Avanzados",
        period: "Período",
        clear: "Limpar Filtros",
        openTicket: "Abrir Nuevo Ticket",
        noTickets: "Sin tickets activos en este momento.",
        regular: "Operación Normal",
        homeTitle: "Dashboard",
        filesTitle: "Mi Biblioteca",
        favoritesTitle: "Mis Favoritos",
        recentTitle: "Archivos Recentes",
        ticketsTitle: "Centro de Soporte",
        heroDescription: "Centralice sus certificados de calidad y garantice la trazabilidad total de sus materiales.", // NOVO
        status: { // NOVO
          scheduled: "Mantenimiento Programado",
          normal: "Operación Normal",
          scheduledDefaultMessage: "Sistema en actualización programada.",
          monitoringActive: "Monitoreo Vital Activo"
        },
        kpi: { // NOVO
          libraryLabel: "Biblioteca",
          activeDocsSubtext: "Docs. Activos",
          pendingLabel: "Pendientes",
          awaitingSubtext: "Esperando",
          ticketsLabel: "Tickets",
          openTicketsSubtext: "Abiertos"
        },
        noTicketsRegistered: "Ningún ticket registrado.", // NOVO
        exploreAll: "Explorar Todo", // NOVO
        emptyFlatView: { // NOVO
            message: "Ningún documento aquí todavía.",
            subtextFavorites: "Marque documentos con estrella para encontrarlos rápidamente.",
            subtextRecent: "Sus documentos más recientes aparecerán aquí."
        },
        supportCenter: "Centro de Soporte", // NOVO
        myTickets: "Mis Tickets", // NOVO
        noSupportTickets: "Ningún ticket registrado.", // NOVO
        openNewTicket: "Abrir Nuevo Ticket", // NOVO
        ticket: { // NOVO
          id: "ID",
          subject: "Asunto",
          priority: "Prioridad",
          status: "Estado",
          createdAt: "Creado En",
          resolutionNote: "Nota de Resolución", // NOVO
          details: "Detalles del Ticket", // NOVO
          requester: "Solicitante", // NOVO
          user: "Usuario", // NOVO
          company: "Empresa", // NOVO
          history: "Historial", // NOVO
          updatedStatus: "Actualizar Estado", // NOVO
          saveChanges: "Guardar Cambios", // NOVO
          requiredResolutionNote: "Se requiere una nota de resolución para cerrar el ticket.", // NOVO
        },
        accessingAuditRecords: "Accediendo a los registros de auditoría...", // NOVO
        noRecordsFound: "No se encontraron registros de auditoría.", // NOVO
        auditMoreClients: "Auditar más clientes", // NOVO
        auditedRecords: "Auditado • {{count}} Registros", // NOVO
        pendingStatus: "{{count}} Pendientes", // NOVO
        complianceHealth: "Salud de Cumplimiento", // NOVO
        lastAnalysis: "Último Análisis", // NOVO
        criticalPendencies: "Críticos", // NOVO
        upToDate: "Al Día", // NOVO
        organization: "Organización / Razón Social", // NOVO
        fiscalID: "ID Fiscal", // NOVO
        activeClients: "Activos", // NOVO
        allClients: "Todos" // NOVO
      },
      login: {
        welcomeBack: "Acceso Restringido",
        enterCredentials: "Use sus credenciales proporcionadas por IT de Vital.",
        emailLabel: "Correo Profesional",
        passwordLabel: "Contraseña de Acceso",
        forgotPassword: "¿Olvidó?", // NOVO
        accessPortal: "Entrar al Portal",
        sloganTitle: "Cumplimiento y Trazabilidad Industrial.",
        sloganText: "Plataforma centralizada para la gestión de certificados de calidad e informes técnicos de Aceros Vital S.A.",
        authenticateAccess: "Autenticar Acceso", // NOVO
        newUser: "¿Nuevo aquí?", // NOVO
        requestRegister: "Solicitar Registro", // NOVO
        corpEmail: "Correo Corporativo", // NOVO
        accessPassword: "Contraseña de Acceso", // NOVO
        connectionError: "Error de conexión con el servidor." // NOVO
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
        section5: "Dereitos do Titular",
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
      },
      maintenance: { // NOVO: Para MaintenanceScreen
        title: "Sistema en Mantenimiento",
        message: "Estamos realizando actualizaciones críticas de seguridad e infraestructura. El acceso está temporalmente suspendido para garantizar la integridad de los datos.",
        returnEstimate: "Estimación de Regreso",
        soon: "Pronto",
        todayAt: "Hoy a las {{time}}",
        retry: "Intentar de Nuevo",
        contact: "Contacto",
        systemId: "ID del Sistema: AV-SYS-LOCKDOWN-001"
      },
      signup: { // NOVO
        newRegister: "Nuevo Registro",
        fillFields: "Rellene los campos a continuación con sus datos profesionales.",
        fullName: "Nombre Completo",
        corpEmail: "Correo Corporativo",
        password: "Contraseña de Acceso",
        confirmPassword: "Confirmar Contraseña",
        organization: "Organización",
        department: "Departamento",
        select: "Seleccione...",
        companyNotListed: "Mi empresa no está en la lista",
        requestAccess: "Solicite su acceso corporativo.",
        joinNetwork: "Únase a la red de cumplimiento de Aceros Vital.",
        requestSent: "¡Solicitud Enviada!",
        validationPending: "Su solicitud está siendo validada por el equipo técnico.",
        alreadyHaveAccount: "¿Ya tienes una cuenta?",
        login: "Iniciar Sesión"
      },
      quality: { // NOVO
        overview: "Resumen",
        activePortfolio: "Cartera Activa",
        pendingDocs: "Docs. Pendientes",
        openTickets: "Tickets Abiertos",
        masterRepository: "Repositorio Maestro",
        accessFiles: "Acceder a Archivos",
        recentActivity: "Actividad Reciente",
        activityHistory: "Historial de análisis cargado en tiempo real.",
        systemAlerts: "Alertas del Sistema",
        complianceISO: "Cumplimiento ISO 9001",
        biannualCheck: "Verificación semestral programada para el próximo mes.",
        b2bPortfolio: "Cartera B2B",
        masterLibrary: "Biblioteca Maestra",
        masterLibrarySubtitle: "Plantillas de certificados y especificaciones técnicas globales.",
        sendNewCertificate: "Enviar Nuevo Certificado",
        pdfImageFile: "Archivo PDF/Imagen",
        product: "Producto",
        batchNumber: "No. Lote/Colada",
        invoiceNumber: "No. Factura vinculada",
        currentStatus: "Estado Actual",
        approve: "Aprobar",
        reject: "Rechazar",
        justification: "Justificación",
        rejectionReasonPlaceholder: "Describa el motivo de la no conformidad...",
        confirmRejection: "Confirmar Rechazo",
        batchData: "Datos del Lote",
        productLabel: "Producto",
        batchLabel: "No. Lote",
        invoiceLabel: "No. Factura",
        lastAnalysis: "Último Análisis",
        viewPDF: "Ver PDF",
        uploadFile: "Realizar Carga",
        uploading: "Subiendo...",
        documentApprovedSuccess: "¡Documento {{fileName}} aprobado con éxito!",
        documentRejectedSuccess: "¡Documento {{fileName}} rechazado con éxito!",
        errorProcessingInspection: "Error al procesar la inspección.",
        reasonRequired: "Por favor, indique el motivo del rechazo.",
        documentUploadedSuccess: "¡Archivo subido con éxito!",
        errorUploadingFile: "Error al subir el archivo.",
        myClients: "Mis Clientes", // NOVO
        searchClient: "Auditar cliente por nombre o CNPJ...", // NOVO
        healthCompliance: "Salud de Cumplimiento", // NOVO
        critical: "Críticos", // NOVO
        upToDate: "Al Día", // NOVO
        lastUpdate: "Última actualización", // NOVO
        escalateToAdmin: "Escalar a Administrador", // NOVO
        escalateReason: "Motivo de la escalada al Administrador...", // NOVO
        escalateWarning: "Si el ticket requiere intervención administrativa o técnica de nivel 3, puede escalarlo. Es obligatorio un motivo.", // NOVO
        escalateTicket: "Escalar Ticket", // NOVO
        serviceDeskLoading: "Cargando Mesa de Servicio...", // NOVO
        noTicketsFoundQuality: "No hay tickets pendientes o registrados." // NOVO
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