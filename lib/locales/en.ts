
import { pt } from './pt.ts';

export const en: typeof pt = {
  common: {
    welcome: "Welcome",
    loading: "Loading...",
    privacy: "Privacy",
    logout: "Logout",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    back: "Back",
    na: "N/A",
    status: "Status",
    statusActive: "Active",
    statusInactive: "Inactive",
    uploaded: "Upload Completed",
    updatingDatabase: "Updating database...",
    errorLoadingLogs: "Error loading logs: {{message}}",
    changePassword: "Change Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    close: "Close",
    delete: "Delete",
    language: {
      pt: "Portuguese",
      en: "English",
      es: "Spanish"
    },
    clear: "Clear",
    moreOptions: "More options"
  },
  auth: {
    errors: {
      invalidCredentials: "Invalid email or password.",
      samePassword: "New password should be different from the old password.",
      weakPassword: "The provided password does not meet complexity requirements.",
      tooManyRequests: "Too many login attempts. Please try again in a few moments.",
      unexpected: "An unexpected technical error occurred.",
      sessionExpired: "Your session has expired. Please authenticate again."
    }
  },
  login: {
    title: "Quality Portal",
    subtitle: "QUALITY MANAGEMENT SYSTEM",
    corpEmail: "Corporate Email",
    accessPassword: "Access Password",
    forgotPassword: "Forgot password?",
    authenticate: "Secure Authentication",
    authenticateAccess: "Secure Authentication",
    enterCredentials: "Use your corporate credentials authorized by Aços Vital.",
    heroSubtitle: "Centralized repository for technical documentation and quality certificates. Industrial precision in every record.",
    footerNote: "MONITORED SYSTEMS • PRIVACY COMPLIANCE • © 2026 AÇOS VITAL",
    slogan: "Steel you can trust, certified quality",
    certification: "TECHNICAL QUALITY CERTIFIED",
    secureData: "ENCRYPTED B2B LINK",
    monitoring: "REAL-TIME SYSTEM MONITORING",
    error: "Portal authentication failed.",
    restrictedAccess: "Restricted Access",
    identifyToAccess: "Identify yourself to access the secure certificate panel.",
    accessManagedByVital: "Aços Vital manages your access governance internally.",
    successTitle: "Access Granted!",
    successSubtitle: "Redirecting to Security Gateway...",
    connectionError: "Security server connection failure."
  },
  signup: {
    passwordPlaceholder: "Min. 8 characters"
  },
  admin: {
    tabs: {
      overview: "Overview",
      users: "Users",
      logs: "Logs",
      settings: "Settings"
    },
    stats: {
      totalUsers: "Identity Records",
      organizations: "Active Partners",
      activities: "Operations (24h)",
      activeClientsSummary: "{{count}} companies in portfolio",
      logsLast24hSummary: "{{count}} registered events",
      headers: {
        timestamp: "Date/Time",
        user: "Operator",
        action: "Operation",
        target: "Resource",
        ip: "Source IP",
        severity: "Level"
      }
    },
    users: {
      identity: "Identity",
      role: "Privileges",
      roleLabel: "Access Tier",
      department: "Unit",
      createTitle: "New Access Credentials",
      editTitle: "Modify Profile",
      name: "Full Legal Name",
      email: "Corporate Identity",
      org: "Partner Entity",
      filters: "Filter by"
    },
    clients: {
      createTitle: "New Partner Identity",
      editTitle: "Modify Partner"
    },
    logs: {
      allSeverities: "All Severities",
      severity: {
        INFO: "Informational",
        WARNING: "Warning",
        ERROR: "Error",
        CRITICAL: "Critical"
      }
    }
  },
  quality: {
    overview: "Insight Center",
    myAuditLog: "Forensic Audit Log",
    activePortfolio: "Active Portfolio",
    pendingDocs: "Pending Inspection",
    complianceISO: "Technical Compliance Index",
    searchClient: "Search entity by name or Tax ID...",
    newClientUser: "New Partner Identity",
    newCompany: "New Partner Entity",
    allActivities: "Search logs by user, action or IP...",
    errorLoadingClients: "Failed to retrieve portfolio data.",
    errorLoadingQualityData: "Quality indicator synchronization failed.",
    noQualityLogsFound: "No technical audit logs detected.",
    invalidConfirmationCredentials: "Authentication for confirmation failed."
  },
  roles: {
    ADMIN: "System Administrator",
    QUALITY: "Technical Quality Analyst",
    CLIENT: "Partner"
  },
  dashboard: {
    status: {
      monitoringActive: "SYSTEMS UNDER MONITORING"
    },
    kpi: {
      libraryLabel: "Home",
      activeDocsSubtext: "Verified Certificates",
      recent: "Recent",
      viewedToday: "Viewed Today",
      compliance: "Compliance",
      assured: "VALIDATED",
      qualityAssured: "Vital Management"
    },
    exploreAll: "Expand Portfolio",
    fileStatusTimeline: "Asset Compliance Lifecycle",
    organization: "Corporate Entity",
    fiscalID: "Tax Identification",
    contractDate: "Lifecycle Start",
    recentCertificates: "Recent Certificates",
    complianceStatus: "Compliance Status",
    certifiedOperation: "Certified Operation",
    vitalStandard: "AÇOS VITAL STANDARD",
    traceability: "Traceability",
    disclaimer: "All certificates displayed on this portal have been validated by Aços Vital's technical laboratory.",
    available: "Available",
    noRecentFiles: "No recent files found.",
    criticalPendencies: "Critical Pendencies",
    lastAnalysis: "Last Analysis",
    allClients: "All Clients",
    activeClients: "Active Clients"
  },
  cookie: {
    title: "Privacy & Data Protection",
    text: "We utilize essential cookies to ensure session security and the integrity of technical certificates. By continuing to navigate the Aços Vital portal, you acknowledge our data governance policy.",
    accept: "Acknowledge & Continue"
  },
  menu: {
    dashboard: "Home",
    library: "Asset Library",
    certificates: "Certificates",
    management: "Access Governance",
    qualityManagement: "Quality Compliance",
    portalName: "Quality Portal",
    brand: "Aços Vital",
    systemMonitoring: "INFRASTRUCTURE MONITORING",
    settings: "Profile Preferences",
    sections: {
      main: "Main Navigation",
      documents: "Document Management",
      operational: "Operational Modules",
      governance: "Security & Governance"
    }
  },
  files: {
    authenticatingAccess: "Authorizing Request...",
    authenticatingLayers: "Validating Security Layers...",
    authenticatedView: "Verified Viewport",
    errorLoadingDocument: "Failed to render technical resource.",
    errorLoadingFiles: "Resource synchronization error.",
    openInNewTab: "View Full Resource",
    pending: "Awaiting Technical Audit",
    groups: {
      approved: "Compliant / Approved",
      rejected: "Non-Compliant / Rejected"
    },
    sort: {
      nameAsc: "Lexicographical (A-Z)"
    },
    searchPlaceholder: "Search certificates, batches or folders...",
    listView: "Detailed List",
    gridView: "Icon Grid",
    itemSelected: "resource identified",
    itemsSelected: "resources identified",
    processingFiles: "Executing resource analysis...",
    upload: {
      title: "Secure Upload",
      button: "Import",
      selectFile: "Select technical resource",
      chooseFile: "Browse files",
      fileName: "Resource descriptor",
      fileNamePlaceholder: "Ex: Material_Spec_Batch123.pdf",
      uploadButton: "Initialize Upload",
      noFileSelected: "No resource identified.",
      fileNameRequired: "Descriptor is mandatory for traceability.",
      success: "Resource successfully synchronized!",
      noOrgLinked: "Orphaned user. Resource import disabled."
    },
    createFolder: {
      title: "New Structural Directory",
      button: "New Directory",
      folderName: "Directory descriptor",
      folderNamePlaceholder: "Ex: Batch_Records_2024",
      createButton: "Initialize Directory",
      nameRequired: "Directory descriptor is mandatory.",
      success: "Directory successfully initialized!",
      noOrgLinked: "Orphaned user. Directory creation disabled."
    },
    rename: {
      title: "Modify Descriptor",
      newName: "New descriptor",
      newNamePlaceholder: "Enter new value",
      renameButton: "Apply Changes",
      nameRequired: "Descriptor value is mandatory.",
      success: "Resource successfully updated!"
    },
    delete: {
      confirmTitle: "Resource Removal",
      confirmMessage: "Execute permanent removal of {{count}} selected item(s)? This operation is immutable and audited.",
      button: "Execute Removal",
      success: "Items permanently deleted from cluster."
    },
    downloadButton: "Export PDF",
    selectItem: "Target {{name}}",
    noResultsFound: "No assets matched the query.",
    typeToSearch: "Start typing to filter resources..."
  },
  changePassword: {
    title: "Access Security",
    current: "Existing Credential",
    currentError: "The provided current password is incorrect.",
    new: "New Technical Secret",
    confirm: "Validate New Secret",
    matchError: "Credentials do not match.",
    success: "Password successfully updated!",
    errorUpdatingPassword: "Fault in credential update service.",
    submit: "Apply Security Policy",
    requirements: {
      length: "At least 8 characters",
      upper: "One uppercase letter",
      number: "One number (0-9)",
      special: "One special character (@#$!*)"
    }
  },
  privacy: {
    title: "Data Governance & Privacy",
    subtitle: "Regulatory Compliance & Security Framework",
    close: "Acknowledged",
    viewPolicy: "View Policy",
    section1: "Platform Scope",
    section1_content: "The Aços Vital Quality Portal is a B2B platform for technical document and quality certificate management. This policy clarifies compliance with Technical Standards and current data protection laws (LGPD/GDPR).",
    section2: "Collected Data",
    section2_item1: "Identification: Name and corporate email.",
    section2_item2: "Corporate: Tax ID (CNPJ) and contract history.",
    section2_item3: "Audit: IP logs and user actions (view/download).",
    section3: "Encryption & Storage",
    section3_content: "We use TLS 1.2+ encryption and strict organization-level segregation (Multi-tenant). Your documents are never accessible to other companies in the portfolio."
  },
  notifications: {
    title: "Operational Alerts",
    markAllAsRead: "Flush all alerts",
    markedAsRead: "Alert archived.",
    markedAllAsRead: "Alert queue cleared.",
    emptyState: "System status: Nominal. No alerts.",
    loading: "Synchronizing alerts...",
    errorLoading: "Alert synchronization failure: {{message}}",
    errorMarkingAsRead: "Failure to archive alert: {{message}}",
    errorMarkingAllAsRead: "Failure to flush alerts: {{message}}",
  },
  maintenance: {
    title: "System Maintenance",
    message: "Security gateway is undergoing planned technical updates to improve certificate viewing performance.",
    returnEstimate: "Estimated Return",
    todayAt: "Today at {{time}}",
    soon: "Soon",
    retry: "Retry Connection",
    contact: "Contact Support",
    systemId: "Vital Cloud Engine v2.4.0"
  },
  maintenanceSchedule: {
    title: "Schedule Maintenance",
    eventTitle: "Event Description",
    eventTitlePlaceholder: "Ex: File Cluster Upgrade",
    date: "Target Date",
    time: "Start Time",
    duration: "Estimated Downtime (mins)",
    customMessage: "User Announcement",
    scheduleButton: "Confirm Window",
    scheduledSuccess: "Maintenance '{{title}}' scheduled successfully.",
    scheduledError: "Scheduling failure: {{message}}"
  }
};
