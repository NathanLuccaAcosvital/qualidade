
export const pt = {
  common: {
    welcome: "Bem-vindo",
    loading: "Carregando...",
    privacy: "Privacidade",
    logout: "Sair",
    edit: "Editar",
    save: "Salvar",
    cancel: "Cancelar",
    back: "Voltar",
    na: "N/A",
    status: "Status",
    statusActive: "Ativo",
    statusInactive: "Inativo",
    uploaded: "Upload Realizado",
    updatingDatabase: "Atualizando base de dados...",
    errorLoadingLogs: "Erro ao carregar logs: {{message}}",
    changePassword: "Alterar Senha",
    showPassword: "Mostrar senha",
    hidePassword: "Ocultar senha",
    close: "Fechar",
    delete: "Excluir",
    language: {
      pt: "Português",
      en: "Inglês",
      es: "Espanhol"
    },
    clear: "Limpar"
  },
  login: {
    title: "Portal da Qualidade",
    subtitle: "SISTEMA DE GESTÃO QUALIDADE",
    corpEmail: "E-mail Corporativo",
    accessPassword: "Senha de Acesso",
    forgotPassword: "Esqueceu a senha?",
    authenticate: "Autenticar Acesso",
    authenticateAccess: "Autenticar Acesso",
    enterCredentials: "Use suas credenciais fornecidas pela Aços Vital.",
    heroSubtitle: "Repositório central de documentos técnicos e certificados. Precisão industrial em cada dado.",
    footerNote: "SISTEMAS MONITORADOS • PRIVACIDADE • © 2026 AÇOS VITAL",
    slogan: "Aço de confiança, Qualidade certificada",
    certification: "ISO 9001:2015 CERTIFICADO",
    secureData: "LINK B2B SEGURO",
    monitoring: "SISTEMAS MONITORADOS",
    error: "Falha na autenticação do portal.",
    restrictedAccess: "Acesso Restrito",
    identifyToAccess: "Identifique-se para acessar o painel de certificados.",
    accessManagedByVital: "A Aços Vital gerencia seu acesso internamente."
  },
  admin: {
    tabs: {
      overview: "Visão Geral",
      users: "Usuários",
      logs: "Logs",
      settings: "Configurações"
    },
    stats: {
      totalUsers: "Total de Usuários",
      organizations: "Empresas Ativas",
      activities: "Atividades (24h)",
      activeClientsSummary: "{{count}} empresas na carteira",
      logsLast24hSummary: "{{count}} eventos registrados",
      headers: {
        timestamp: "Data/Hora",
        user: "Usuário",
        action: "Ação",
        target: "Alvo",
        ip: "IP",
        severity: "Nível"
      }
    },
    users: {
      identity: "Identidade",
      role: "Papel",
      roleLabel: "Nível de Acesso",
      department: "Departamento",
      createTitle: "Novo Acesso",
      editTitle: "Editar Perfil",
      name: "Nome Completo",
      email: "E-mail Corporativo",
      org: "Empresa Vinculada",
      filters: "Filtrar por"
    }
  },
  quality: {
    overview: "Visão Geral",
    myAuditLog: "Meu Log de Auditoria",
    activePortfolio: "Carteira Ativa",
    pendingDocs: "Docs. Pendentes",
    complianceISO: "Conformidade ISO",
    searchClient: "Buscar empresa por nome ou CNPJ...",
    newClientUser: "Novo Usuário Cliente",
    newCompany: "Nova Empresa",
    allActivities: "Pesquisar por usuário, ação ou IP...",
    errorLoadingClients: "Erro ao carregar clientes",
    errorLoadingQualityData: "Falha ao sincronizar indicadores de qualidade.",
    noQualityLogsFound: "Nenhum log de qualidade encontrado.",
    invalidConfirmationCredentials: "Credenciais de confirmação inválidas."
  },
  roles: {
    ADMIN: "Administrador",
    QUALITY: "Analista Qualidade",
    CLIENT: "Cliente B2B"
  },
  dashboard: {
    status: {
      monitoringActive: "SISTEMAS MONITORADOS"
    },
    kpi: {
      libraryLabel: "Minha Biblioteca",
      activeDocsSubtext: "Certificados Ativos"
    },
    exploreAll: "Explorar Tudo",
    fileStatusTimeline: "Linha do Tempo do Certificado",
    organization: "Razão Social",
    fiscalID: "CNPJ",
    contractDate: "Início do Contrato"
  },
  cookie: {
    title: "Privacidade e Segurança",
    text: "Utilizamos cookies essenciais para garantir a segurança da autenticação e a integridade dos certificados técnicos. Ao continuar navegando no portal da Aços Vital, você concorda com nossa política de gestão de dados.",
    accept: "Aceitar e Continuar"
  },
  menu: {
    dashboard: "Início",
    library: "Biblioteca",
    management: "Gestão",
    qualityManagement: "Gestão da Qualidade",
    portalName: "Portal da Qualidade",
    brand: "Aços Vital",
    systemMonitoring: "MONITORAMENTO DO SISTEMA",
    settings: "Configurações",
    // Removed 'recentUploads' and 'complianceReports'
    // recentUploads: "Uploads Recentes", 
    // complianceReports: "Relatórios de Compliance", 
  },
  files: {
    authenticatingAccess: "Autenticando Acesso...",
    authenticatedView: "Visualização Autenticada",
    errorLoadingDocument: "Erro ao carregar documento técnico.",
    errorLoadingFiles: "Erro ao listar arquivos do servidor.",
    openInNewTab: "Abrir em nova aba",
    pending: "Aguardando Inspeção",
    groups: {
      approved: "Aprovado",
      rejected: "Não Conforme"
    },
    sort: {
      nameAsc: "Nome (A-Z)"
    },
    searchPlaceholder: "Pesquisar arquivos e pastas...",
    listView: "Lista",
    gridView: "Grade",
    itemSelected: "item selecionado",
    itemsSelected: "itens selecionados",
    processingFiles: "Processando arquivos...",
    upload: {
      title: "Carregar Arquivo",
      button: "Upload",
      selectFile: "Selecione o arquivo para upload",
      chooseFile: "Escolher arquivo",
      fileName: "Nome do arquivo",
      fileNamePlaceholder: "Ex: Certificado_MateriaPrima_Lote123.pdf",
      uploadButton: "Fazer Upload",
      noFileSelected: "Nenhum arquivo selecionado.",
      fileNameRequired: "O nome do arquivo é obrigatório.",
      success: "Arquivo enviado com sucesso!",
      noOrgLinked: "Usuário sem organização vinculada. Não é possível fazer upload."
    },
    createFolder: {
      title: "Criar Nova Pasta",
      button: "Nova Pasta",
      folderName: "Nome da pasta",
      folderNamePlaceholder: "Ex: Documentos Lote 2024",
      createButton: "Criar Pasta",
      nameRequired: "O nome da pasta é obrigatório.",
      success: "Pasta criada com sucesso!",
      noOrgLinked: "Usuário sem organização vinculada. Não é possível criar pastas."
    },
    rename: {
      title: "Renomear",
      newName: "Novo nome",
      newNamePlaceholder: "Digite o novo nome",
      renameButton: "Renomear",
      nameRequired: "O novo nome é obrigatório.",
      success: "Item renomeado com sucesso!"
    },
    delete: {
      confirmTitle: "Confirmar Exclusão",
      confirmMessage: "Tem certeza que deseja excluir {{count}} item(ns) selecionado(s)? Esta ação não pode ser desfeita.",
      button: "Excluir"
    },
    downloadButton: "Download",
    selectItem: "Selecionar {{name}}",
    noResultsFound: "Nenhum resultado encontrado.",
    typeToSearch: "Digite para buscar arquivos e pastas..."
  },
  changePassword: {
    title: "Alterar Senha",
    current: "Senha Atual",
    new: "Nova Senha",
    confirm: "Confirmar Senha",
    minCharacters: "Mínimo {{count}} caracteres",
    matchError: "As senhas não conferem.",
    success: "Senha alterada com sucesso!",
    errorUpdatingPassword: "Erro ao atualizar a senha.",
    submit: "Confirmar Alteração" 
  },
  privacy: {
    title: "Política de Privacidade",
    subtitle: "Conformidade LGPD e ISO 9001",
    close: "Compreendi",
    section1: "Sobre o Portal",
    section2: "Dados Coletados",
    section3: "Segurança de Dados"
  },
  notifications: {
    title: "Minhas Notificações",
    markAllAsRead: "Marcar todas como lidas",
    markedAsRead: "Notificação marcada como lida.",
    markedAllAsRead: "Todas as notificações marcadas como lidas.",
    emptyState: "Você não possui notificações.",
    loading: "Carregando Notificações...",
    errorLoading: "Erro ao carregar notificações: {{message}}",
    errorMarkingAsRead: "Erro ao marcar notificação como lida: {{message}}",
    errorMarkingAllAsRead: "Erro ao marcar todas como lidas: {{message}}",
  }
};
