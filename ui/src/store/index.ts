import { Store } from '@tanstack/react-store';

type StoreState = {
  activeOutlookTab: 'severeWeatherOutlook' | 'thunderstormOutlook';
  activeAlertReference?: {
    alertIds: string[];
    date: string;
  };
  activeSevereWeatherOutlookReference?: {
    date: string;
    quotes: string[];
    keywords: string[];
  };
  activeThunderstormOutlookReference?: {
    date: string;
    quotes: string[];
    keywords: string[];
  };
};

export const store = new Store<StoreState>({
  activeOutlookTab: 'severeWeatherOutlook',
});

export const setActiveOutlookTab = (
  activeOutlookTab: StoreState['activeOutlookTab'],
) => {
  store.setState((state) => {
    return {
      ...state,
      activeOutlookTab,
    };
  });
};

export const setActiveAlertReference = (
  activeAlertReference: StoreState['activeAlertReference'],
) => {
  store.setState((state) => {
    return {
      ...state,
      activeAlertReference,
      activeThunderstormOutlookReference: undefined,
      activeSevereWeatherOutlookReference: undefined,
    };
  });
};

export const setActiveSevereWeatherOutlookReference = (
  activeSevereWeatherOutlookReference: StoreState['activeSevereWeatherOutlookReference'],
) => {
  store.setState((state) => {
    return {
      ...state,
      activeOutlookTab: 'severeWeatherOutlook',
      activeSevereWeatherOutlookReference,
      activeThunderstormOutlookReference: undefined,
      activeAlertReference: undefined,
    };
  });
};

export const setActiveThunderstormOutlookReference = (
  activeThunderstormOutlookReference: StoreState['activeThunderstormOutlookReference'],
) => {
  store.setState((state) => {
    return {
      ...state,
      activeOutlookTab: 'thunderstormOutlook',
      activeThunderstormOutlookReference,
      activeSevereWeatherOutlookReference: undefined,
      activeAlertReference: undefined,
    };
  });
};

export const removeActiveAlertReference = () => {
  store.setState((state) => {
    return {
      ...state,
      activeAlertReference: undefined,
    };
  });
};

export const removeactiveSevereWeatherOutlookReference = () => {
  store.setState((state) => {
    return {
      ...state,
      activeSevereWeatherOutlookReference: undefined,
    };
  });
};

export const removeActiveThunderstormOutlookReference = () => {
  store.setState((state) => {
    return {
      ...state,
      activeThunderstormOutlookReference: undefined,
    };
  });
};
