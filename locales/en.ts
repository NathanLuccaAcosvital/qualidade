
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
    clear: "Clear"
  },
  login: {
    title: "Quality Portal",
    subtitle: "QUALITY MANAGEMENT SYSTEM",
    corpEmail: "Corporate Email",
    accessPassword: "Access Password",
    forgotPassword: "Forgot password?",
    authenticate: "Authenticate Access",
    authenticateAccess: "Authenticate Access",
    enterCredentials: "Use your credentials provided by Aços Vital.",
    heroSubtitle: "Central repository for technical documents and certificates. Industrial precision in every data point.",
    footerNote: "MONITORED SYSTEMS • PRIVACY • © 2026 AÇOS VITAL",
    slogan: "Steel you can trust, Certified quality",
    certification: "ISO 9001:2015 CERTIFIED",
    secureData: "SECURE B2B LINK",
    monitoring: "MONITORED SYSTEMS",
    error: "Portal authentication failed.",
    restrictedAccess: "Restricted Access",
    identifyToAccess: "Identify yourself to access the certificate panel.",
    accessManagedByVital: "Aços Vital manages your access internally."
  },
  admin: {
    tabs: {
      overview: "Overview",
      users: "Users",
      logs: "Logs",
      settings: "Settings"
    },
    stats: {
      totalUsers: "Total Users",
      organizations: "Active Companies",
      activities: "Activities (24h)",
      activeClientsSummary: "{{count}} companies in portfolio",
      logsLast24hSummary: "{{count}} registered events",
      headers: {
        timestamp: "Date/Time",
        user: "User",
        action: "Action",
        target: "Target",
        ip: "IP",
        severity: "Level"
      }
    },
    users: {
      identity: "Identity",
      role: "Role",
      roleLabel: "Access Level",
      department: "Department",
      createTitle: "New Access",
      editTitle: "Edit Profile",
      name: "Full Name",
      email: "Corporate Email",
      org: "Linked Company",
      filters: "Filter by"
    }
  },
  quality: {
    overview: "Overview",
    myAuditLog: "My Audit Log",
    activePortfolio: "Active Portfolio",
    pendingDocs: "Pending Docs",
    complianceISO: "ISO Compliance",
    searchClient: "Search by company name or CNPJ...",
    newClientUser: "New Client User",
    newCompany: "New Company",
    allActivities: "Search user, action or IP...",
    errorLoadingClients: "Error loading clients",
    errorLoadingQualityData: "Failed to sync quality indicators.",
    noQualityLogsFound: "No quality logs found.",
    invalidConfirmationCredentials: "Invalid confirmation credentials."
  },
  roles: {
    ADMIN: "Administrator",
    QUALITY: "Quality Analyst",
    CLIENT: "B2B Client"
  },
  dashboard: {
    status: {
      monitoringActive: "SYSTEMS MONITORED"
    },
    kpi: {
      libraryLabel: "My Library",
      activeDocsSubtext: "Active Certificates"
    },
    exploreAll: "Explore All",
    fileStatusTimeline: "Certificate Timeline",
    organization: "Company Name",
    fiscalID: "Tax ID",
    contractDate: "Contract Start"
  },
  cookie: {
    title: "Privacy & Security",
    text: "We use essential cookies to ensure authentication security and the integrity of technical certificates. By continuing to browse the Vital Steels portal, you agree to our data management policy.",
    accept: "Accept and Continue"
  },
  menu: {
    dashboard: "Home",
    library: "Library",
    management: "Management",
    qualityManagement: "Quality Management",
    portalName: "Quality Portal",
    brand: "Aços Vital",
    systemMonitoring: "SYSTEM MONITORING",
    settings: "Settings", 
  },
  files: {
    authenticatingAccess: "Authenticating Access...",
    authenticatedView: "Authenticated View",
    errorLoadingDocument: "Error loading technical document.",
    errorLoadingFiles: "Error listing files from server.",
    openInNewTab: "Open in new tab",
    pending: "Awaiting Inspection",
    groups: {
      approved: "Approved",
      rejected: "Non-Compliant"
    },
    sort: {
      nameAsc: "Name (A-Z)"
    },
    searchPlaceholder: "Search files and folders...",
    listView: "List View",
    gridView: "Grid View",
    itemSelected: "item selected",
    itemsSelected: "items selected",
    processingFiles: "Processing files...",
    upload: {
      title: "Upload File",
      button: "Upload",
      selectFile: "Select file to upload",
      chooseFile: "Choose file",
      fileName: "File name",
      fileNamePlaceholder: "Ex: RawMaterial_Cert_Batch123.pdf",
      uploadButton: "Upload",
      noFileSelected: "No file selected.",
      fileNameRequired: "File name is required.",
      success: "File uploaded successfully!",
      noOrgLinked: "User not linked to an organization. Cannot upload files."
    },
    createFolder: {
      title: "Create New Folder",
      button: "New Folder",
      folderName: "Folder name",
      folderNamePlaceholder: "Ex: Batch 2024 Documents",
      createButton: "Create Folder",
      nameRequired: "Folder name is required.",
      success: "Folder created successfully!",
      noOrgLinked: "User not linked to an organization. Cannot create folders."
    },
    rename: {
      title: "Rename",
      newName: "New name",
      newNamePlaceholder: "Enter new name",
      renameButton: "Rename",
      nameRequired: "New name is required.",
      success: "Item renamed successfully!"
    },
    delete: {
      confirmTitle: "Confirm Deletion",
      confirmMessage: "Are you sure you want to delete {{count}} selected item(s)? This action cannot be undone.",
      button: "Delete"
    },
    downloadButton: "Download",
    selectItem: "Select {{name}}",
    noResultsFound: "No results found.",
    typeToSearch: "Type to search files and folders..."
  },
  changePassword: {
    title: "Change Password",
    current: "Current Password",
    new: "New Password",
    confirm: "Confirm Password",
    minCharacters: "Minimum {{count}} characters",
    matchError: "Passwords do not match.",
    success: "Password changed successfully!",
    errorUpdatingPassword: "Error updating password.",
    submit: "Confirm Changes" 
  },
  privacy: {
    title: "Privacy Policy",
    subtitle: "LGPD and ISO 9001 Compliance",
    close: "Understood",
    section1: "About the Portal",
    section2: "Data Collected",
    section3: "Data Security"
  },
  notifications: {
    title: "My Notifications",
    markAllAsRead: "Mark all as read",
    markedAsRead: "Notification marked as read.",
    markedAllAsRead: "All notifications marked as read.",
    emptyState: "You have no notifications.",
    loading: "Loading Notifications...",
    errorLoading: "Error loading notifications: {{message}}",
    errorMarkingAsRead: "Error marking notification as read: {{message}}",
    errorMarkingAllAsRead: "Error marking all as read: {{message}}",
  }
};
