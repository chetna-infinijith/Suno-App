import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logError } from '../index';

export const DeviceVariables = {
  AUTH_HEADER: 'Token aad872f8172e4f7934daa43881149810f0738ffb',
  __env__: 'Development',
};
export const AppVariables = {
  API_BASE_URL: 'https://prod.suno.tech/api', //'https://prod.suno.tech/api', // https://master.suno.tech/api
  API_WSS_URL: 'wss://prod.suno.tech/ws',
  API_BOX_URL: 'https://api.box.com/2.0',
  assigned_tags: '',
  authHeader: 'Token a08079c14e7e3878c17d765a6028318d125659de',
  business_name: '',
  chatdoc: true,
  clinic_display_name: '',
  clinic_name: '',
  clinic_pk_id: 0,
  communication_method: [
    { label: 'Text/SMS', value: '1' },
    { label: 'Email', value: '2' },
    { label: 'Voice Call', value: '3' },
    { label: 'Direct Mail', value: '4' },
    { label: 'Do Not Contact', value: '5' },
  ],
  crm_segment: [
    { label: 'Prospect', value: '1' },
    { label: 'Not Converted', value: '2' },
    { label: 'HA User', value: '3' },
    { label: 'End of Warranty', value: '4' },
  ],
  DateUploadedArray: ['some DateUploadedArray'],
  EditProfile: false,
  ERROR_MESSAGE: '',
  groups: [],
  is_active_patient: true,
  isApplyFilter: false,
  last_outcome: [
    { label: 'Converted', value: '1' },
    { label: 'Not Converted', value: '2' },
    { label: 'Excluded', value: '3' },
    { label: 'Rescheduled', value: '4' },
    { label: 'Declined', value: '5' },
    { label: 'Not Answer', value: '6' },
  ],
  MessageId: 0,
  msgOffsetFilter: 0,
  patientOffsetFilter: 0,
  payment_source_type: [
    { label: 'Private Pay', value: '1' },
    { label: 'Insurance', value: '2' },
    { label: 'Managed Care', value: '3' },
  ],
  PopularCategories: ['some PopularCategory'],
  productStatus: [
    { color: '#f87171', label: 'To be Ordered', value: '1', textColor: '#000000', },
    { color: '#bfc2c1', label: 'Order Submitted to manufacturer', value: '2', textColor: '#000000',},
    { color: '#bfc2c1', label: 'Shipped from manufacturer', value: '3',textColor: '#000000', },
    { color: '#f87171', label: 'Accepted by Clinic', value: '4',textColor: '#000000', },
    { color: '#f87171', label: 'Ready for Delivery', value: '5',textColor: '#000000', },
    { color: '#059669', label: 'Delivered to Patient', value: '6',textColor: '#ffffff', },
    { color: '#bfc2c1', label: 'Sent for Repair', value: '7' ,textColor: '#000000',},
    { color: '#f87171', label: 'Accepted for Repair', value: '8',textColor: '#000000', },
    { color: '#bfc2c1', label: 'Canceled', value: '9',textColor: '#000000', },
    { color: '#bfc2c1', label: 'Exchanged', value: '10' ,textColor: '#000000',},
    { color: '#bfc2c1', label: 'Returned', value: '11',textColor: '#000000', },
    { color: '#fcc02a', label: 'On Loan', value: '1000',textColor: '#000000', },
  ],
  ProfilePicture: 'some ProfilePicture',
  regionId: 0,
  ResetError: '',
  searchQuery: '',
  selectedAppointments: '',
  selectedInsurance: '',
  selectedProvider: '',
  senderID: 0,
  speciaities: ['All', 'Heart', 'Cardiology', 'Neurologist', 'dermatologist'],
  Tags: ['some Tag'],
  taskAssignStatus: [
    { color: 'rgba(130, 94, 235, 0.3)', label: 'To Do', value: '1' },
    { color: '#fdaaaa80', label: 'In Progress', value: '2' },
    { color: 'rgba(0, 100, 0, 0.4)', label: 'Completed', value: '3' },
    { color: '#393939', label: 'Cancelled', value: '4' },
  ],
  billingStatus: [
    { color: '#505f7a', bgColor : '#465c841a' , label: 'Draft', value: '1' },
    { color: '#f87171' , bgColor : '#ff6a6a1a' , label: 'Ready To Bill', value: '2' },
    { color: '#fcc02a', bgColor : '#ffc1271a', label: 'In Billing', value: '3' },
    { color: '#059669', bgColor : '#009b6b1a', label: 'Completed', value: '999' },
    { color: '#bfc2c1', bgColor : '#b9c8c31a', label: 'Cancelled', value: '1000' },
  ],
  taskOffsetFilter: 0,
  taskStatus: [
    { color: '#f44336', label: 'Urgent', value: '1' },
    { color: '#ff7043', label: 'High', value: '2' },
    { color: '#fbc02d', label: 'Medium', value: '3' },
    { color: '#4caf50', label: 'Low', value: '4' },
    { color: '#bfc2c1', label: 'Not Set', value: '5' },
  ],
  typeId: 0,
  UnreadNotifyCount: 0,
  UserInfo: '',
};
const GlobalVariableContext = React.createContext();
const GlobalVariableUpdater = React.createContext();
const keySuffix = '';

// Attempt to parse a string as JSON. If the parse fails, return the string as-is.
// This is necessary to account for variables which are already present in local
// storage, but were not stored in JSON syntax (e.g. 'hello' instead of '"hello"').
function tryParseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

class GlobalVariable {
  /**
   *  Filters an object of key-value pairs for those that should be
   *  persisted to storage, and persists them.
   *
   *  @param values Record<string, string>
   */
  static async syncToLocalStorage(values) {
    const update = Object.entries(values)
      .filter(([key]) => key in DeviceVariables)
      .map(([key, value]) => [key + keySuffix, JSON.stringify(value)]);

    if (update.length > 0) {
      await AsyncStorage.multiSet(update);
    }

    return update;
  }

  static async loadLocalStorage() {
    const keys = Object.keys(DeviceVariables);
    const entries = await AsyncStorage.multiGet(
      keySuffix ? keys.map(k => k + keySuffix) : keys
    );

    // If values isn't set, use the default. These will be written back to
    // storage on the next render.
    const withDefaults = entries.map(([key_, value]) => {
      // Keys only have the suffix appended in storage; strip the key
      // after they are retrieved
      const key = keySuffix ? key_.replace(keySuffix, '') : key_;
      return [key, value ? tryParseJson(value) : DeviceVariables[key]];
    });

    return Object.fromEntries(withDefaults);
  }
}

class State {
  static defaultValues = {
    ...AppVariables,
    ...DeviceVariables,
  };

  static reducer(state, { type, payload }) {
    switch (type) {
      case 'RESET':
        return { values: State.defaultValues, __loaded: true };
      case 'LOAD_FROM_ASYNC_STORAGE':
        return { values: { ...state.values, ...payload }, __loaded: true };
      case 'UPDATE':
        return state.__loaded
          ? {
              ...state,
              values: {
                ...state.values,
                [payload.key]: payload.value,
              },
            }
          : state;
      case 'ADD_CALLBACK':
        payload();
        return state;
      default:
        return state;
    }
  }

  static initialState = {
    __loaded: false,
    values: State.defaultValues,
  };
}

export function GlobalVariableProvider({ children }) {
  const [state, dispatch] = React.useReducer(State.reducer, State.initialState);

  React.useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }

    prepare();
  }, []);

  // This effect runs on mount to overwrite the default value of any
  // key that has a local value.
  React.useEffect(() => {
    async function initialStorageLoader() {
      try {
        const payload = await GlobalVariable.loadLocalStorage();
        if (
          payload?.__env__ &&
          DeviceVariables.__env__ &&
          payload.__env__ !== DeviceVariables.__env__
        ) {
          console.log(
            `Publication Environment changed from ${payload.__env__} to ${DeviceVariables.__env__}. Refreshing variables`
          );
          dispatch({
            type: 'LOAD_FROM_ASYNC_STORAGE',
            payload: DeviceVariables,
          });
        } else {
          dispatch({ type: 'LOAD_FROM_ASYNC_STORAGE', payload });
        }
      } catch (err) {
        logError(err);
        logError("Fail to load local variable from local storage :", err)

      }
    }
    initialStorageLoader();
  }, []);

  // This effect runs on every state update after the initial load. Gives us
  // best of both worlds: React state updates sync, but current state made
  // durable next async tick.
  React.useEffect(() => {
    async function syncToAsyncStorage() {
      try {
        await GlobalVariable.syncToLocalStorage(state.values);
      } catch (err) {
        logError(err);
        logError("sync To Local Storage Fail:", err)

      }
    }
    if (state.__loaded) {
      syncToAsyncStorage();
    }
  }, [state]);

  const onLayoutRootView = React.useCallback(async () => {
    if (state.__loaded) {
      await SplashScreen.hideAsync();
    }
  }, [state.__loaded]);

  // We won't want an app to read a default state when there might be one
  // incoming from storage.
  if (!state.__loaded) {
    return null;
  }

  return (
    <GlobalVariableUpdater.Provider
      value={dispatch}
      onLayout={onLayoutRootView}
    >
      <GlobalVariableContext.Provider value={state.values}>
        {children}
      </GlobalVariableContext.Provider>
    </GlobalVariableUpdater.Provider>
  );
}

// Hooks
export function useSetValue() {
  const dispatch = React.useContext(GlobalVariableUpdater);
  return ({ key, value }) => {
    return new Promise(resolve => {
      dispatch({ type: 'UPDATE', payload: { key, value } });

      // Add a callback to the dispatch 'queue'
      // This guarantees that the promise is only resolved after the initial dispatch
      // has completed and allows 'awaiting' the global variable update
      const dispatchCompleteCallback = () => {
        resolve(value);
      };
      dispatch({ type: 'ADD_CALLBACK', payload: dispatchCompleteCallback });
    });
  };
}

export function useValues() {
  return React.useContext(GlobalVariableContext);
}
