
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
    clear: "Limpar",
    moreOptions: "Mais opções"
  },
  auth: {
    errors: {
      invalidCredentials: "E-mail ou senha incorretos.",
      samePassword: "A nova senha deve ser diferente da senha antiga.",
      weakPassword: "A senha fornecida não atende aos requisitos de complexidade.",
      tooManyRequests: "Muitas tentativas de acesso. Tente novamente em instantes.",
      unexpected: "Ocorreu um erro técnico inesperado.",
      sessionExpired: "Sua sessão expirou. Por favor, autentique-se novamente."
    }
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
    certification: "QUALIDADE TÉCNICA CERTIFICADA",
    secureData: "LINK B2B SEGURO",
    monitoring: "SISTEMAS MONITORADOS",
    error: "Falha na autenticação do portal.",
    restrictedAccess: "Acesso Restrito",
    identifyToAccess: "Identifique-se para acessar o painel de certificados.",
    accessManagedByVital: "Aços Vital gerencia seu acesso internamente.",
    successTitle: "Acesso Concedido!",
    successSubtitle: "Redirecionando ao Gateway de Segurança...",
    connectionError: "Erro de conexão com o servidor de segurança."
  },
  signup: {
    passwordPlaceholder: "Mínimo de 8 caracteres"
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
    },
    clients: {
      createTitle: "Nova Empresa Cliente",
      editTitle: "Editar Empresa"
    },
    logs: {
      allSeverities: "Todas Severidades",
      severity: {
        INFO: "Informativo",
        WARNING: "Aviso",
        ERROR: "Erro",
        CRITICAL: "Crítico"
      }
    }
  },
  quality: {
    overview: "Visão Geral",
    myAuditLog: "Meu Log de Auditoria",
    activePortfolio: "Carteira Ativa",
    pendingDocs: "Docs. Pendentes",
    complianceISO: "Conformidade Técnica",
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
    CLIENT: "Parceiro"
  },
  dashboard: {
    status: {
      monitoringActive: "SISTEMAS MONITORADOS"
    },
    kpi: {
      libraryLabel: "Início",
      activeDocsSubtext: "Certificados Ativos",
      recent: "Recentes",
      viewedToday: "Visualizados Hoje",
      compliance: "Conformidade",
      assured: "VALIDADA",
      qualityAssured: "Gestão Vital"
    },
    exploreAll: "Explorar Tudo",
    fileStatusTimeline: "Linha do Tempo do Certificado",
    organization: "Razão Social",
    fiscalID: "CNPJ",
    contractDate: "Início do Contrato",
    recentCertificates: "Certificados Recentes",
    complianceStatus: "Status de Conformidade",
    certifiedOperation: "Operação Certificada",
    vitalStandard: "PADRÃO AÇOS VITAL",
    traceability: "Rastreabilidade",
    disclaimer: "Todos os certificados exibidos neste portal foram validados pelo laboratório técnico da Aços Vital.",
    available: "Disponível",
    noRecentFiles: "Nenhum arquivo recente.",
    criticalPendencies: "Pendências Críticas",
    lastAnalysis: "Última Análise",
    allClients: "Todos os Clientes",
    activeClients: "Clientes Ativos"
  },
  cookie: {
    title: "Privacidade e Segurança",
    text: "Utilizamos cookies essenciais para garantir a segurança da autenticação e a integridade dos certificados técnicos. Ao continuar navegando no portal da Aços Vital, você concorda com nossa política de gestão de dados.",
    accept: "Aceitar e Continuar"
  },
  menu: {
    dashboard: "Início",
    library: "Biblioteca de Arquivos",
    certificates: "Certificados",
    management: "Gestão de Acessos",
    qualityManagement: "Gestão da Qualidade",
    portalName: "Portal da Qualidade",
    brand: "Aços Vital",
    systemMonitoring: "MONITOREO DO SISTEMA",
    settings: "Configurações do Perfil",
    sections: {
      main: "Navegação Principal",
      documents: "Gestão Documental",
      operational: "Módulos Operacionais",
      governance: "Governança e Segurança"
    }
  },
  files: {
    authenticatingAccess: "Autenticando Accesso...",
    authenticatingLayers: "Validando Camadas de Segurança...",
    authenticatedView: "Visualização Autenticada",
    errorLoadingDocument: "Erro ao carregar documento técnico.",
    errorLoadingFiles: "Erro ao listar arquivos do servidor.",
    openInNewTab: "Abrir em nova aba",
    pending: "Aguardando Inspeção Técnica",
    groups: {
      approved: "Conforme / Aprovado",
      rejected: "Não Conforme / Recusado"
    },
    sort: {
      nameAsc: "Nome (A-Z)"
    },
    searchPlaceholder: "Pesquisar certificados, lotes ou pastas...",
    listView: "Lista Detalhada",
    gridView: "Grade de Ícones",
    itemSelected: "item selecionado",
    itemsSelected: "itens selecionados",
    processingFiles: "Processando estrutura de arquivos...",
    upload: {
      title: "Carregar Novo Documento",
      button: "Fazer Upload",
      selectFile: "Selecione o arquivo técnico",
      chooseFile: "Procurar Arquivo",
      fileName: "Nome do Documento",
      fileNamePlaceholder: "Ex: Certificado_MateriaPrima_Lote123.pdf",
      uploadButton: "Iniciar Transmissão",
      noFileSelected: "Nenhum arquivo selecionado.",
      fileNameRequired: "O nome do arquivo é obrigatório para rastreabilidade.",
      success: "Arquivo transmitido com sucesso!",
      noOrgLinked: "Usuário órfão. Upload desativado."
    },
    createFolder: {
      title: "Nova Pasta Estrutural",
      button: "Criar Pasta",
      folderName: "Nome do Diretório",
      folderNamePlaceholder: "Ex: Lote_Janeiro_2024",
      createButton: "Confirmar Criação",
      nameRequired: "O nome da pasta é obrigatório.",
      success: "Pasta criada com sucesso!",
      noOrgLinked: "Usuário órfão. Criação de pastas desativada."
    },
    rename: {
      title: "Renomear Recurso",
      newName: "Novo Identificador",
      newNamePlaceholder: "Digite o novo nome",
      renameButton: "Confirmar Alteração",
      nameRequired: "O novo nome é obrigatório.",
      success: "Recurso renomeado com sucesso!"
    },
    delete: {
      confirmTitle: "Confirmar Exclusão de Dados",
      confirmMessage: "Tem certeza que deseja excluir {{count}} item(ns) permanentemente? Esta ação é irreversível e será auditada.",
      button: "Confirmar Exclusão",
      success: "Dados removidos do cluster com sucesso."
    },
    downloadButton: "Baixar PDF",
    selectItem: "Selecionar {{name}}",
    noResultsFound: "Nenhum documento localizado para esta busca.",
    typeToSearch: "Refine sua busca por nome ou lote..."
  },
  changePassword: {
    title: "Segurança de Acesso",
    current: "Senha Atual",
    currentError: "A senha atual informada está incorreta.",
    new: "Nova Senha Técnica",
    confirm: "Confirmar Nova Senha",
    matchError: "As senhas não conferem.",
    success: "Senha alterada com sucesso!",
    errorUpdatingPassword: "Erro técnico ao processar troca de senha.",
    submit: "Salvar Alterações",
    requirements: {
      length: "Pelo menos 8 caracteres",
      upper: "Uma letra maiúscula",
      number: "Um número (0-9)",
      special: "Um caractere especial (@#$!*)"
    }
  },
  privacy: {
    title: "Governança de Dados e Privacidade",
    subtitle: "Conformidade LGPD e Protocolos Industriais",
    close: "Compreendi os Termos",
    viewPolicy: "Ver Política",
    section1: "Escopo da Plataforma",
    section1_content: "O Portal da Qualidade Aços Vital é uma plataforma B2B destinada ao gerenciamento de documentos técnicos e certificados de qualidade. Esta política visa esclarecer a conformidade com as Normas Técnicas e a legislação LGPD vigente.",
    section2: "Dados Coletados",
    section2_item1: "Identificação: Nome e e-mail corporativo.",
    section2_item2: "Corporativo: CNPJ e histórico contratual.",
    section2_item3: "Auditoria: Logs de IP e ações (visualização/download).",
    section3: "Criptografia e Armazenamento",
    section3_content: "Utilizamos criptografia TLS 1.2+ e segregação estrita por organização (Multi-tenant). Seus documentos nunca são acessíveis por outras empresas do portfólio."
  },
  notifications: {
    title: "Alertas do Sistema",
    markAllAsRead: "Limpar todos os alertas",
    markedAsRead: "Alerta arquivado.",
    markedAllAsRead: "Fila de notificações limpa.",
    emptyState: "Sistema operando em normalidade. Sem alertas.",
    loading: "Sincronizando fila de notificações...",
    errorLoading: "Erro ao carregar alertas: {{message}}",
    errorMarkingAsRead: "Erro ao arquivar alerta: {{message}}",
    errorMarkingAllAsRead: "Erro ao limpar alertas: {{message}}",
  },
  maintenance: {
    title: "Manutenção de Infraestrutura",
    message: "Nossos servidores de arquivos estão passando por uma atualização de segurança planejada para garantir a integridade dos seus certificados.",
    returnEstimate: "Previsão de Restabelecimento",
    todayAt: "Hoje às {{time}}",
    soon: "Em breve",
    retry: "Verificar Novamente",
    contact: "Suporte Técnico Vital",
    systemId: "Vital Cloud Engine v2.4.0"
  },
  maintenanceSchedule: {
    title: "Agendar Janela Técnica",
    eventTitle: "Identificador do Evento",
    eventTitlePlaceholder: "Ex: Migração de Cluster S3",
    date: "Data de Execução",
    time: "Horário de Início",
    duration: "Duração Estimada (minutos)",
    customMessage: "Comunicado aos Parceiros",
    scheduleButton: "Confirmar Agendamento",
    scheduledSuccess: "Janela '{{title}}' agendada no calendário global.",
    scheduledError: "Falha ao registrar agendamento: {{message}}"
  }
};
