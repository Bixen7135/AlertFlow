import type { Language } from './types';

/**
 * Translation schema
 */
export interface Translations {
  // Navigation
  nav: {
    feed: string;
    map: string;
    admin: string;
    home: string;
  };
  // Filters
  filters: {
    title: string;
    type: string;
    severity: string;
    status: string;
    district: string;
    dateRange: string;
    apply: string;
    clear: string;
    all: string;
  };
  // Event types
  eventTypes: {
    weather: string;
    traffic: string;
    public_safety: string;
    health: string;
    utility: string;
    other: string;
  };
  // Severity levels
  severities: {
    low: string;
    medium: string;
    high: string;
    critical: string;
  };
  // Event status
  statuses: {
    active: string;
    updated: string;
    resolved: string;
    cancelled: string;
  };
  // Event card
  eventCard: {
    viewDetails: string;
    unknownLocation: string;
    updated: string;
    created: string;
    source: string;
  };
  // Feed page
  feed: {
    title: string;
    noEvents: string;
    noEventsFiltered: string;
    loadMore: string;
    loading: string;
    error: string;
    retry: string;
    eventsCount: string;
  };
  // Event detail page
  eventDetail: {
    title: string;
    backToFeed: string;
    updateHistory: string;
    noHistory: string;
    details: string;
    metadata: string;
    relatedEvents: string;
  };
  // Map page
  map: {
    title: string;
    loading: string;
    error: string;
    retry: string;
    showFilters: string;
    hideFilters: string;
    viewEvent: string;
  };
  // Admin page
  admin: {
    title: string;
    sources: string;
    status: string;
    lastFetch: string;
    failureCount: string;
    enabled: string;
    disabled: string;
    enable: string;
    disable: string;
    type: string;
    interval: string;
    url: string;
    noSources: string;
    loading: string;
    error: string;
  };
  // Common
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    confirm: string;
    close: string;
    save: string;
    delete: string;
    edit: string;
    search: string;
    language: string;
  };
  // Date formats
  dates: {
    format: string;
    short: string;
    long: string;
    relative: string;
  };
}

/**
 * Translations for all languages
 */
export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      feed: 'Feed',
      map: 'Map',
      admin: 'Admin',
      home: 'AlertFlow',
    },
    filters: {
      title: 'Filters',
      type: 'Type',
      severity: 'Severity',
      status: 'Status',
      district: 'District',
      dateRange: 'Date Range',
      apply: 'Apply',
      clear: 'Clear',
      all: 'All',
    },
    eventTypes: {
      weather: 'Weather',
      traffic: 'Traffic',
      public_safety: 'Public Safety',
      health: 'Health',
      utility: 'Utility',
      other: 'Other',
    },
    severities: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    },
    statuses: {
      active: 'Active',
      updated: 'Updated',
      resolved: 'Resolved',
      cancelled: 'Cancelled',
    },
    eventCard: {
      viewDetails: 'View Details',
      unknownLocation: 'Unknown location',
      updated: 'Updated',
      created: 'Created',
      source: 'Source',
    },
    feed: {
      title: 'Alert Feed',
      noEvents: 'No events found',
      noEventsFiltered: 'No events match your filters',
      loadMore: 'Load More',
      loading: 'Loading events...',
      error: 'Failed to load events',
      retry: 'Retry',
      eventsCount: '{count} events',
    },
    eventDetail: {
      title: 'Event Details',
      backToFeed: 'Back to Feed',
      updateHistory: 'Update History',
      noHistory: 'No update history available',
      details: 'Details',
      metadata: 'Metadata',
      relatedEvents: 'Related Events',
    },
    map: {
      title: 'Event Map',
      loading: 'Loading map...',
      error: 'Failed to load map',
      retry: 'Retry',
      showFilters: 'Show Filters',
      hideFilters: 'Hide Filters',
      viewEvent: 'View Event',
    },
    admin: {
      title: 'Source Management',
      sources: 'Sources',
      status: 'Status',
      lastFetch: 'Last Fetch',
      failureCount: 'Failures',
      enabled: 'Enabled',
      disabled: 'Disabled',
      enable: 'Enable',
      disable: 'Disable',
      type: 'Type',
      interval: 'Interval',
      url: 'URL',
      noSources: 'No sources configured',
      loading: 'Loading sources...',
      error: 'Failed to load sources',
    },
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      language: 'Language',
    },
    dates: {
      format: 'MMM d, yyyy HH:mm',
      short: 'MMM d',
      long: 'MMMM d, yyyy \'at\' HH:mm',
      relative: 'ago',
    },
  },
  ru: {
    nav: {
      feed: 'Лента',
      map: 'Карта',
      admin: 'Админ',
      home: 'AlertFlow',
    },
    filters: {
      title: 'Фильтры',
      type: 'Тип',
      severity: 'Срочность',
      status: 'Статус',
      district: 'Район',
      dateRange: 'Диапазон дат',
      apply: 'Применить',
      clear: 'Очистить',
      all: 'Все',
    },
    eventTypes: {
      weather: 'Погода',
      traffic: 'Трафик',
      public_safety: 'Общественная безопасность',
      health: 'Здоровье',
      utility: 'Коммунальные службы',
      other: 'Другое',
    },
    severities: {
      low: 'Низкий',
      medium: 'Средний',
      high: 'Высокий',
      critical: 'Критический',
    },
    statuses: {
      active: 'Активный',
      updated: 'Обновлен',
      resolved: 'Решен',
      cancelled: 'Отменен',
    },
    eventCard: {
      viewDetails: 'Подробнее',
      unknownLocation: 'Местоположение неизвестно',
      updated: 'Обновлено',
      created: 'Создано',
      source: 'Источник',
    },
    feed: {
      title: 'Лента оповещений',
      noEvents: 'Событий не найдено',
      noEventsFiltered: 'Нет событий, соответствующих фильтрам',
      loadMore: 'Загрузить еще',
      loading: 'Загрузка событий...',
      error: 'Не удалось загрузить события',
      retry: 'Повторить',
      eventsCount: '{count} событий',
    },
    eventDetail: {
      title: 'Детали события',
      backToFeed: 'Назад к ленте',
      updateHistory: 'История обновлений',
      noHistory: 'История обновлений недоступна',
      details: 'Детали',
      metadata: 'Метаданные',
      relatedEvents: 'Связанные события',
    },
    map: {
      title: 'Карта событий',
      loading: 'Загрузка карты...',
      error: 'Не удалось загрузить карту',
      retry: 'Повторить',
      showFilters: 'Показать фильтры',
      hideFilters: 'Скрыть фильтры',
      viewEvent: 'Просмотреть событие',
    },
    admin: {
      title: 'Управление источниками',
      sources: 'Источники',
      status: 'Статус',
      lastFetch: 'Последний запрос',
      failureCount: 'Сбои',
      enabled: 'Включен',
      disabled: 'Отключен',
      enable: 'Включить',
      disable: 'Отключить',
      type: 'Тип',
      interval: 'Интервал',
      url: 'URL',
      noSources: 'Нет настроенных источников',
      loading: 'Загрузка источников...',
      error: 'Не удалось загрузить источники',
    },
    common: {
      loading: 'Загрузка...',
      error: 'Произошла ошибка',
      retry: 'Повторить',
      cancel: 'Отмена',
      confirm: 'Подтвердить',
      close: 'Закрыть',
      save: 'Сохранить',
      delete: 'Удалить',
      edit: 'Изменить',
      search: 'Поиск',
      language: 'Язык',
    },
    dates: {
      format: 'd MMM yyyy \'в\' HH:mm',
      short: 'd MMM',
      long: 'd MMMM yyyy \'в\' HH:mm',
      relative: 'назад',
    },
  },
  kk: {
    nav: {
      feed: 'Ақпараттар',
      map: 'Карта',
      admin: 'Әкімші',
      home: 'AlertFlow',
    },
    filters: {
      title: 'Сүзгілер',
      type: 'Түрі',
      severity: 'Маңыздығ',
      status: 'Күйі',
      district: 'Аймақ',
      dateRange: 'Күн аралығы',
      apply: 'Қолдану',
      clear: 'Тазала',
      all: 'Барлығы',
    },
    eventTypes: {
      weather: 'Ауа райы',
      traffic: 'Кілік қауызы',
      public_safety: 'Жағылық қауіпсызы',
      health: 'Денсаулық',
      utility: 'Коммуналдық қызметтер',
      other: 'Басқа',
    },
    severities: {
      low: 'Төмен',
      medium: 'Орташа',
      high: 'Жоары',
      critical: 'Сынирлы',
    },
    statuses: {
      active: 'Белсенді',
      updated: 'Жаңартылды',
      resolved: 'Шешілді',
      cancelled: 'Бас тартылды',
    },
    eventCard: {
      viewDetails: 'Егжей көру',
      unknownLocation: 'Орын белгісіз',
      updated: 'Жаңартылды',
      created: 'Құрылды',
      source: 'Қайнар көзі',
    },
    feed: {
      title: 'Ескерту хабарламы',
      noEvents: 'Оқиғалар табылмады',
      noEventsFiltered: 'Сіздің сүзгілеріне сәйкес оқиғалар жоқ',
      loadMore: 'Көбірек жүктеу',
      loading: 'Оқиғалар жүктелу...',
      error: 'Оқиғаларды жүктеу мүмкін болмады',
      retry: 'Қайталау',
      eventsCount: '{count} оқиға',
    },
    eventDetail: {
      title: 'Оқиға егжейлері',
      backToFeed: 'Хабарлама оралу',
      updateHistory: 'Жаңарту тарихы',
      noHistory: 'Жаңарту тарихы жоқ',
      details: 'Егжейлері',
      metadata: 'Мета-деректер',
      relatedEvents: 'Байланысты оқиғалар',
    },
    map: {
      title: 'Оқиға картасы',
      loading: 'Карта жүктелу...',
      error: 'Картаны жүктеу мүмкін болмады',
      retry: 'Қайталау',
      showFilters: 'Сүзгілерді көрсету',
      hideFilters: 'Сүзгілерді жасыру',
      viewEvent: 'Оқиғаны қарау',
    },
    admin: {
      title: 'Қайнарларды басқару',
      sources: 'Қайнарлар',
      status: 'Күйі',
      lastFetch: 'Соңғы сұрау',
      failureCount: 'Сәтсіздер',
      enabled: 'Қосулы',
      disabled: 'Өшірілген',
      enable: 'Қосу',
      disable: 'Өшіру',
      type: 'Түрі',
      interval: 'Аралық',
      url: 'URL',
      noSources: 'Қайнарлар конфигурацияланбаған',
      loading: 'Қайнарларды жүктелу...',
      error: 'Қайнарларды жүктеу мүмкін болмады',
    },
    common: {
      loading: 'Жүктелу...',
      error: 'Қате орынды',
      retry: 'Қайталау',
      cancel: 'Бас тарту',
      confirm: 'Растау',
      close: 'Жабу',
      save: 'Сақтау',
      delete: 'Жою',
      edit: 'Өзгерту',
      search: 'Іздеу',
      language: 'Тіл',
    },
    dates: {
      format: 'yyyy ж.MMM d. HH:mm',
      short: 'MMM d',
      long: 'yyyy ж. MMMM d. HH:mm',
      relative: 'бұрын',
    },
  },
};

/**
 * Get translation for a key path
 * Example: getTranslation(translations, 'nav.feed')
 */
export function getTranslation<T extends Translations>(
  obj: T,
  path: string
): string | undefined {
  return path.split('.').reduce((current: any, key) => {
    return current?.[key];
  }, obj);
}
