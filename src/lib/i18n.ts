/**
 * Internationalization (i18n) System
 * 
 * This module provides internationalization support for the MSA Properties application.
 * Currently supports English with infrastructure for additional languages.
 */

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de';

export interface Translations {
  // Common UI Elements
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    confirm: string;
    loading: string;
    error: string;
    success: string;
  };

  // Property Management
  properties: {
    title: string;
    address: string;
    rent: string;
    bedrooms: string;
    bathrooms: string;
    availability: string;
    available: string;
    occupied: string;
    maintenance: string;
    sold: string;
  };

  // Admin Panel
  admin: {
    dashboard: string;
    addProperty: string;
    editProperty: string;
    deleteProperty: string;
    markAsSold: string;
    markAsAvailable: string;
    propertyStatistics: string;
    totalProperties: string;
    availableProperties: string;
    soldProperties: string;
  };

  // Actions & Confirmations
  actions: {
    confirmMarkSold: string;
    confirmMarkAvailable: string;
    statusUpdated: string;
    markedAsSold: string;
    markedAsAvailable: string;
    updateError: string;
  };

  // Tooltips
  tooltips: {
    editProperty: string;
    deleteProperty: string;
    markPropertySold: string;
    markPropertyAvailable: string;
    dragToReorder: string;
  };
}

// English translations (default)
const enTranslations: Translations = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },

  properties: {
    title: 'Property Title',
    address: 'Address',
    rent: 'Monthly Rent',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    availability: 'Availability',
    available: 'Available',
    occupied: 'Occupied',
    maintenance: 'Under Maintenance',
    sold: 'Sold',
  },

  admin: {
    dashboard: 'Admin Dashboard',
    addProperty: 'Add New Property',
    editProperty: 'Edit Property',
    deleteProperty: 'Delete Property',
    markAsSold: 'Mark as Sold',
    markAsAvailable: 'Mark as Available',
    propertyStatistics: 'Property Statistics',
    totalProperties: 'Total Properties',
    availableProperties: 'Available',
    soldProperties: 'Sold',
  },

  actions: {
    confirmMarkSold: 'Are you sure you want to mark as sold "{title}"?\n\nThis will update the property status on the live website immediately.',
    confirmMarkAvailable: 'Are you sure you want to mark as available "{title}"?\n\nThis will update the property status on the live website immediately.',
    statusUpdated: 'Status Updated!',
    markedAsSold: '"{title}" has been marked as SOLD and the change is now live on the website.',
    markedAsAvailable: '"{title}" has been marked as Available and the change is now live on the website.',
    updateError: 'Error updating property status: {error}\n\nPlease try again.',
  },

  tooltips: {
    editProperty: 'Edit Property',
    deleteProperty: 'Delete Property',
    markPropertySold: 'Mark as Sold',
    markPropertyAvailable: 'Mark as Available',
    dragToReorder: 'Drag to reorder',
  },
};

// Spanish translations
const esTranslations: Translations = {
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    confirm: 'Confirmar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
  },

  properties: {
    title: 'Título de la Propiedad',
    address: 'Dirección',
    rent: 'Renta Mensual',
    bedrooms: 'Dormitorios',
    bathrooms: 'Baños',
    availability: 'Disponibilidad',
    available: 'Disponible',
    occupied: 'Ocupado',
    maintenance: 'En Mantenimiento',
    sold: 'Vendido',
  },

  admin: {
    dashboard: 'Panel de Administración',
    addProperty: 'Agregar Nueva Propiedad',
    editProperty: 'Editar Propiedad',
    deleteProperty: 'Eliminar Propiedad',
    markAsSold: 'Marcar como Vendido',
    markAsAvailable: 'Marcar como Disponible',
    propertyStatistics: 'Estadísticas de Propiedades',
    totalProperties: 'Total de Propiedades',
    availableProperties: 'Disponibles',
    soldProperties: 'Vendidas',
  },

  actions: {
    confirmMarkSold: '¿Está seguro de que quiere marcar como vendido "{title}"?\n\nEsto actualizará el estado de la propiedad en el sitio web inmediatamente.',
    confirmMarkAvailable: '¿Está seguro de que quiere marcar como disponible "{title}"?\n\nEsto actualizará el estado de la propiedad en el sitio web inmediatamente.',
    statusUpdated: '¡Estado Actualizado!',
    markedAsSold: '"{title}" ha sido marcado como VENDIDO y el cambio ya está en vivo en el sitio web.',
    markedAsAvailable: '"{title}" ha sido marcado como Disponible y el cambio ya está en vivo en el sitio web.',
    updateError: 'Error al actualizar el estado de la propiedad: {error}\n\nPor favor, inténtelo de nuevo.',
  },

  tooltips: {
    editProperty: 'Editar Propiedad',
    deleteProperty: 'Eliminar Propiedad',
    markPropertySold: 'Marcar como Vendido',
    markPropertyAvailable: 'Marcar como Disponible',
    dragToReorder: 'Arrastrar para reordenar',
  },
};

// French translations
const frTranslations: Translations = {
  common: {
    save: 'Sauvegarder',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    confirm: 'Confirmer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
  },

  properties: {
    title: 'Titre de la Propriété',
    address: 'Adresse',
    rent: 'Loyer Mensuel',
    bedrooms: 'Chambres',
    bathrooms: 'Salles de Bain',
    availability: 'Disponibilité',
    available: 'Disponible',
    occupied: 'Occupé',
    maintenance: 'En Maintenance',
    sold: 'Vendu',
  },

  admin: {
    dashboard: 'Tableau de Bord Admin',
    addProperty: 'Ajouter une Nouvelle Propriété',
    editProperty: 'Modifier la Propriété',
    deleteProperty: 'Supprimer la Propriété',
    markAsSold: 'Marquer comme Vendu',
    markAsAvailable: 'Marquer comme Disponible',
    propertyStatistics: 'Statistiques des Propriétés',
    totalProperties: 'Total des Propriétés',
    availableProperties: 'Disponibles',
    soldProperties: 'Vendues',
  },

  actions: {
    confirmMarkSold: 'Êtes-vous sûr de vouloir marquer comme vendu "{title}"?\n\nCela mettra à jour le statut de la propriété sur le site web immédiatement.',
    confirmMarkAvailable: 'Êtes-vous sûr de vouloir marquer comme disponible "{title}"?\n\nCela mettra à jour le statut de la propriété sur le site web immédiatement.',
    statusUpdated: 'Statut Mis à Jour!',
    markedAsSold: '"{title}" a été marqué comme VENDU et le changement est maintenant en direct sur le site web.',
    markedAsAvailable: '"{title}" a été marqué comme Disponible et le changement est maintenant en direct sur le site web.',
    updateError: 'Erreur lors de la mise à jour du statut de la propriété: {error}\n\nVeuillez réessayer.',
  },

  tooltips: {
    editProperty: 'Modifier la Propriété',
    deleteProperty: 'Supprimer la Propriété',
    markPropertySold: 'Marquer comme Vendu',
    markPropertyAvailable: 'Marquer comme Disponible',
    dragToReorder: 'Glisser pour réorganiser',
  },
};

// German translations
const deTranslations: Translations = {
  common: {
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    confirm: 'Bestätigen',
    loading: 'Laden...',
    error: 'Fehler',
    success: 'Erfolg',
  },

  properties: {
    title: 'Immobilientitel',
    address: 'Adresse',
    rent: 'Monatsmiete',
    bedrooms: 'Schlafzimmer',
    bathrooms: 'Badezimmer',
    availability: 'Verfügbarkeit',
    available: 'Verfügbar',
    occupied: 'Besetzt',
    maintenance: 'In Wartung',
    sold: 'Verkauft',
  },

  admin: {
    dashboard: 'Admin-Dashboard',
    addProperty: 'Neue Immobilie Hinzufügen',
    editProperty: 'Immobilie Bearbeiten',
    deleteProperty: 'Immobilie Löschen',
    markAsSold: 'Als Verkauft Markieren',
    markAsAvailable: 'Als Verfügbar Markieren',
    propertyStatistics: 'Immobilienstatistiken',
    totalProperties: 'Gesamte Immobilien',
    availableProperties: 'Verfügbar',
    soldProperties: 'Verkauft',
  },

  actions: {
    confirmMarkSold: 'Sind Sie sicher, dass Sie "{title}" als verkauft markieren möchten?\n\nDies wird den Immobilienstatus auf der Website sofort aktualisieren.',
    confirmMarkAvailable: 'Sind Sie sicher, dass Sie "{title}" als verfügbar markieren möchten?\n\nDies wird den Immobilienstatus auf der Website sofort aktualisieren.',
    statusUpdated: 'Status Aktualisiert!',
    markedAsSold: '"{title}" wurde als VERKAUFT markiert und die Änderung ist jetzt live auf der Website.',
    markedAsAvailable: '"{title}" wurde als Verfügbar markiert und die Änderung ist jetzt live auf der Website.',
    updateError: 'Fehler beim Aktualisieren des Immobilienstatus: {error}\n\nBitte versuchen Sie es erneut.',
  },

  tooltips: {
    editProperty: 'Immobilie Bearbeiten',
    deleteProperty: 'Immobilie Löschen',
    markPropertySold: 'Als Verkauft Markieren',
    markPropertyAvailable: 'Als Verfügbar Markieren',
    dragToReorder: 'Ziehen zum Neuordnen',
  },
};

// Translation map
const translations: Record<SupportedLanguage, Translations> = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations,
};

// Current language state
let currentLanguage: SupportedLanguage = 'en';

/**
 * Get the current language
 */
export const getCurrentLanguage = (): SupportedLanguage => {
  return currentLanguage;
};

/**
 * Set the current language
 */
export const setLanguage = (language: SupportedLanguage): void => {
  currentLanguage = language;
};

/**
 * Get translations for the current language
 */
export const getTranslations = (): Translations => {
  return translations[currentLanguage] || translations.en;
};

/**
 * Get a specific translation by key path
 */
export const t = (keyPath: string, replacements?: Record<string, string>): string => {
  const keys = keyPath.split('.');
  const currentTranslations = getTranslations();
  
  let value: any = currentTranslations;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      console.warn(`Translation key not found: ${keyPath}`);
      return keyPath; // Return the key path as fallback
    }
  }
  
  if (typeof value !== 'string') {
    console.warn(`Translation value is not a string: ${keyPath}`);
    return keyPath;
  }
  
  // Replace placeholders if provided
  if (replacements) {
    return Object.entries(replacements).reduce((text, [key, replacement]) => {
      return text.replace(new RegExp(`\\{${key}\\}`, 'g'), replacement);
    }, value);
  }
  
  return value;
};

/**
 * Detect browser language and set if supported
 */
export const detectAndSetLanguage = (): void => {
  if (typeof window === 'undefined') return;
  
  const browserLanguage = navigator.language.split('-')[0] as SupportedLanguage;
  
  if (Object.keys(translations).includes(browserLanguage)) {
    setLanguage(browserLanguage);
    console.log(`🌍 Language set to: ${browserLanguage}`);
  } else {
    console.log(`🌍 Browser language ${browserLanguage} not supported, using English`);
  }
};

/**
 * Initialize i18n system
 */
export const initializeI18n = (): void => {
  // Try to get language from localStorage
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem('msa-language') as SupportedLanguage;
    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      setLanguage(savedLanguage);
      return;
    }
  }
  
  // Fall back to browser detection
  detectAndSetLanguage();
};

/**
 * Save language preference
 */
export const saveLanguagePreference = (language: SupportedLanguage): void => {
  setLanguage(language);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('msa-language', language);
  }
};

// Export utilities
export default {
  getCurrentLanguage,
  setLanguage,
  getTranslations,
  t,
  detectAndSetLanguage,
  initializeI18n,
  saveLanguagePreference,
};
