import * as React from 'react';
import {
  useQuery,
  useMutation,
  useIsFetching,
  useQueryClient,
} from 'react-query';
import useFetch from 'react-fetch-hook';
import useIsFocused from '../utils/useIsFocused';
import { handleResponse, isOkStatus } from '../utils/handleRestApiResponse';
import usePrevious from '../utils/usePrevious';
import {
  encodeQueryParam,
  renderParam,
  renderQueryString,
} from '../utils/encodeQueryParam';
import * as GlobalVariables from '../config/GlobalVariableContext';

const cleanHeaders = headers =>
  Object.fromEntries(Object.entries(headers).filter(kv => kv[1] != null));

export const dELETE$api$adjustments$$id$$DELETE = async (
  Constants,
  { format, id },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  const url = `${Constants.API_BASE_URL}/adjustments/${encodeQueryParam(
    id
  )}/${renderQueryString(paramsDict)}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'DELETE',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useDELETE$api$adjustments$$id$$DELETE = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      dELETE$api$adjustments$$id$$DELETE(
        Constants,
        { ...initialArgs, ...args },
        handlers
      ),
    {
      onError: (err, variables, { previousValue }) => {
        if (previousValue) {
          return queryClient.setQueryData('adjustments', previousValue);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries('adjustment');
        queryClient.invalidateQueries('adjustments');
      },
    }
  );
};

export const dELETE$api$appointments$bulkDelete$DELETE = async (
  Constants,
  { format },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  const url = `${Constants.API_BASE_URL}/appointments/bulk-delete/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'DELETE',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useDELETE$api$appointments$bulkDelete$DELETE = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      dELETE$api$appointments$bulkDelete$DELETE(
        Constants,
        { ...initialArgs, ...args },
        handlers
      ),
    {
      onError: (err, variables, { previousValue }) => {
        if (previousValue) {
          return queryClient.setQueryData('appointments', previousValue);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries('appointment');
        queryClient.invalidateQueries('appointments');
      },
    }
  );
};

export const dELETE$api$appointments$$id$$DELETE = async (
  Constants,
  { format, id },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  const url = `${Constants.API_BASE_URL}/appointments/${encodeQueryParam(
    id
  )}/${renderQueryString(paramsDict)}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'DELETE',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useDELETE$api$appointments$$id$$DELETE = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      dELETE$api$appointments$$id$$DELETE(
        Constants,
        { ...initialArgs, ...args },
        handlers
      ),
    {
      onError: (err, variables, { previousValue }) => {
        if (previousValue) {
          return queryClient.setQueryData('appointments', previousValue);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries('appointment');
        queryClient.invalidateQueries('appointments');
      },
    }
  );
};

export const dELETE$api$assignedTags$$id$$DELETE = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/assigned-tags/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'DELETE',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useDELETE$api$assignedTags$$id$$DELETE = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      dELETE$api$assignedTags$$id$$DELETE(
        Constants,
        { ...initialArgs, ...args },
        handlers
      ),
    {
      onError: (err, variables, { previousValue }) => {
        if (previousValue) {
          return queryClient.setQueryData('assigned-tags', previousValue);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries('assigned-tag');
        queryClient.invalidateQueries('assigned-tags');
      },
    }
  );
};

export const dELETE$api$audiometerConfiguration$$id$$DELETE = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/audiometer-configuration/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'DELETE',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useDELETE$api$audiometerConfiguration$$id$$DELETE = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      dELETE$api$audiometerConfiguration$$id$$DELETE(
        Constants,
        { ...initialArgs, ...args },
        handlers
      ),
    {
      onError: (err, variables, { previousValue }) => {
        if (previousValue) {
          return queryClient.setQueryData(
            'audiometer-configuration',
            previousValue
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries('audiometer-configuration');
        queryClient.invalidateQueries('audiometer-configurations');
      },
    }
  );
};

export const dELETE$api$auth$users$me$DELETE = async (
  Constants,
  _args,
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/me/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'DELETE',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useDELETE$api$auth$users$me$DELETE = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      dELETE$api$auth$users$me$DELETE(
        Constants,
        { ...initialArgs, ...args },
        handlers
      ),
    {
      onError: (err, variables, { previousValue }) => {
        if (previousValue) {
          return queryClient.setQueryData('auth', previousValue);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries('auth');
        queryClient.invalidateQueries('auths');
      },
    }
  );
};

export const dELETE$api$auth$users$$id$$DELETE = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'DELETE',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useDELETE$api$auth$users$$id$$DELETE = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      dELETE$api$auth$users$$id$$DELETE(
        Constants,
        { ...initialArgs, ...args },
        handlers
      ),
    {
      onError: (err, variables, { previousValue }) => {
        if (previousValue) {
          return queryClient.setQueryData('auth', previousValue);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries('auth');
        queryClient.invalidateQueries('auths');
      },
    }
  );
};

export const dELETE$api$chartNotes$$id$$DELETE = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/chart-notes/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'DELETE',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useDELETE$api$chartNotes$$id$$DELETE = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      dELETE$api$chartNotes$$id$$DELETE(
        Constants,
        { ...initialArgs, ...args },
        handlers
      ),
    {
      onError: (err, variables, { previousValue }) => {
        if (previousValue) {
          return queryClient.setQueryData('chart-notes', previousValue);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries('chart-note');
        queryClient.invalidateQueries('chart-notes');
      },
    }
  );
};

export const dELETE$api$clinics$$clinicPk$$taxes$$id$$DELETE = async (
  Constants,
  { clinic_pk, id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/taxes/${encodeQueryParam(id)}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'DELETE',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useDELETE$api$clinics$$clinicPk$$taxes$$id$$DELETE = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      dELETE$api$clinics$$clinicPk$$taxes$$id$$DELETE(
        Constants,
        { ...initialArgs, ...args },
        handlers
      ),
    {
      onError: (err, variables, { previousValue }) => {
        if (previousValue) {
          return queryClient.setQueryData('clinics', previousValue);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries('clinic');
        queryClient.invalidateQueries('clinics');
      },
    }
  );
};

export const dELETE$api$credits$$id$$DELETE = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/credits/${encodeQueryParam(id)}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'DELETE',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useDELETE$api$credits$$id$$DELETE = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      dELETE$api$credits$$id$$DELETE(
        Constants,
        { ...initialArgs, ...args },
        handlers
      ),
    {
      onError: (err, variables, { previousValue }) => {
        if (previousValue) {
          return queryClient.setQueryData('credits', previousValue);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries('credit');
        queryClient.invalidateQueries('credits');
      },
    }
  );
};

export const gET$api$accountsReceivableReport$GET = async (
  Constants,
  { format, ordering },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  const url = `${Constants.API_BASE_URL}/accounts-receivable-report/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$accountsReceivableReport$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  return useQuery(
    ['accounts-receivable-reports', args],
    () =>
      gET$api$accountsReceivableReport$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
    }
  );
};

export const FetchGET$api$accountsReceivableReport$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  format,
  ordering,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$accountsReceivableReport$GET(
    { format, ordering },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$accountsReceivableReport$: refetch,
  });
};

export const gET$api$accountsReceivableReport$total$GET = async (
  Constants,
  { format },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  const url = `${Constants.API_BASE_URL}/accounts-receivable-report/total/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$accountsReceivableReport$total$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIGET$api$accountsReceivableReport$total$GET',
      args,
    ],
    () =>
      gET$api$accountsReceivableReport$total$GET(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$accountsReceivableReport$total$GETS',
        ]),
    }
  );
};

export const FetchGET$api$accountsReceivableReport$total$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  format,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$accountsReceivableReport$total$GET(
    { format },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$accountsReceivableReport$total$: refetch,
  });
};

export const gET$api$accounts$GET = async (
  Constants,
  {
    clinic,
    limit,
    offset,
    ordering,
    product_type,
    quickbooks_is_active,
    quickbooks_type,
    search,
    type,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (clinic !== undefined) {
    paramsDict['clinic'] = renderParam(clinic);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (product_type !== undefined) {
    paramsDict['product_type'] = renderParam(product_type);
  }
  if (quickbooks_is_active !== undefined) {
    paramsDict['quickbooks_is_active'] = renderParam(quickbooks_is_active);
  }
  if (quickbooks_type !== undefined) {
    paramsDict['quickbooks_type'] = renderParam(quickbooks_type);
  }
  if (search !== undefined) {
    paramsDict['search'] = renderParam(search);
  }
  if (type !== undefined) {
    paramsDict['type'] = renderParam(type);
  }
  const url = `${Constants.API_BASE_URL}/accounts/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$accounts$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIGET$api$accounts$GET', args],
    () => gET$api$accounts$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$accounts$GETS',
        ]),
    }
  );
};

export const FetchGET$api$accounts$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  clinic,
  limit,
  offset,
  ordering,
  product_type,
  quickbooks_is_active,
  quickbooks_type,
  search,
  type,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$accounts$GET(
    {
      clinic,
      limit,
      offset,
      ordering,
      product_type,
      quickbooks_is_active,
      quickbooks_type,
      search,
      type,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGET$api$accounts$: refetch });
};

export const gET$api$accounts$$id$$GET = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/accounts/${encodeQueryParam(id)}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$accounts$$id$$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIGET$api$accounts$$id$$GET', args],
    () => gET$api$accounts$$id$$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$accounts$$id$$GETS',
        ]),
    }
  );
};

export const FetchGET$api$accounts$$id$$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$accounts$$id$$GET(
    { id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$accounts$$id$$: refetch,
  });
};

export const gET$api$adjustments$GET = async (
  Constants,
  {
    after_adjustment_date,
    before_adjustment_date,
    clinic,
    format,
    insurer,
    limit,
    managed_care_plan,
    offset,
    ordering,
    payer_type,
    provider,
    region,
    sale,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (after_adjustment_date !== undefined) {
    paramsDict['after_adjustment_date'] = renderParam(after_adjustment_date);
  }
  if (before_adjustment_date !== undefined) {
    paramsDict['before_adjustment_date'] = renderParam(before_adjustment_date);
  }
  if (clinic !== undefined) {
    paramsDict['clinic'] = renderParam(clinic);
  }
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  if (insurer !== undefined) {
    paramsDict['insurer'] = renderParam(insurer);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (managed_care_plan !== undefined) {
    paramsDict['managed_care_plan'] = renderParam(managed_care_plan);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (payer_type !== undefined) {
    paramsDict['payer_type'] = renderParam(payer_type);
  }
  if (provider !== undefined) {
    paramsDict['provider'] = renderParam(provider);
  }
  if (region !== undefined) {
    paramsDict['region'] = renderParam(region);
  }
  if (sale !== undefined) {
    paramsDict['sale'] = renderParam(sale);
  }
  const url = `${Constants.API_BASE_URL}/adjustments/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$adjustments$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  return useQuery(
    ['adjustments', args],
    () => gET$api$adjustments$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
    }
  );
};

export const FetchGET$api$adjustments$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  after_adjustment_date,
  before_adjustment_date,
  clinic,
  format,
  insurer,
  limit,
  managed_care_plan,
  offset,
  ordering,
  payer_type,
  provider,
  region,
  sale,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$adjustments$GET(
    {
      after_adjustment_date,
      before_adjustment_date,
      clinic,
      format,
      insurer,
      limit,
      managed_care_plan,
      offset,
      ordering,
      payer_type,
      provider,
      region,
      sale,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$adjustments$: refetch,
  });
};

export const gET$api$adjustments$$id$$GET = async (
  Constants,
  { format, id },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  const url = `${Constants.API_BASE_URL}/adjustments/${encodeQueryParam(
    id
  )}/${renderQueryString(paramsDict)}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$adjustments$$id$$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIGET$api$adjustments$$id$$GET', args],
    () => gET$api$adjustments$$id$$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$adjustments$$id$$GETS',
        ]),
    }
  );
};

export const FetchGET$api$adjustments$$id$$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  format,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$adjustments$$id$$GET(
    { format, id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$adjustments$$id$$: refetch,
  });
};

export const gET$api$appointmentCompletionReport$GET = async (
  Constants,
  {
    after_moment,
    audiology_report_status,
    before_moment,
    chart_note_status,
    clinic,
    format,
    limit,
    offset,
    ordering,
    sale_status,
    staff_member,
    status,
    type,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (after_moment !== undefined) {
    paramsDict['after_moment'] = renderParam(after_moment);
  }
  if (audiology_report_status !== undefined) {
    paramsDict['audiology_report_status'] = renderParam(
      audiology_report_status
    );
  }
  if (before_moment !== undefined) {
    paramsDict['before_moment'] = renderParam(before_moment);
  }
  if (chart_note_status !== undefined) {
    paramsDict['chart_note_status'] = renderParam(chart_note_status);
  }
  if (clinic !== undefined) {
    paramsDict['clinic'] = renderParam(clinic);
  }
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (sale_status !== undefined) {
    paramsDict['sale_status'] = renderParam(sale_status);
  }
  if (staff_member !== undefined) {
    paramsDict['staff_member'] = renderParam(staff_member);
  }
  if (status !== undefined) {
    paramsDict['status'] = renderParam(status);
  }
  if (type !== undefined) {
    paramsDict['type'] = renderParam(type);
  }
  const url = `${Constants.API_BASE_URL}/appointment-completion-report/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$appointmentCompletionReport$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  return useQuery(
    ['appointment-completion-reports', args],
    () =>
      gET$api$appointmentCompletionReport$GET(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
    }
  );
};

export const FetchGET$api$appointmentCompletionReport$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  after_moment,
  audiology_report_status,
  before_moment,
  chart_note_status,
  clinic,
  format,
  limit,
  offset,
  ordering,
  sale_status,
  staff_member,
  status,
  type,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$appointmentCompletionReport$GET(
    {
      after_moment,
      audiology_report_status,
      before_moment,
      chart_note_status,
      clinic,
      format,
      limit,
      offset,
      ordering,
      sale_status,
      staff_member,
      status,
      type,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$appointmentCompletionReport$: refetch,
  });
};

export const gET$api$appointmentOutcomeReasons$GET = async (
  Constants,
  { ordering, outcome },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (outcome !== undefined) {
    paramsDict['outcome'] = renderParam(outcome);
  }
  const url = `${Constants.API_BASE_URL}/appointment-outcome-reasons/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$appointmentOutcomeReasons$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  return useQuery(
    ['appointment-outcome-reasons', args],
    () =>
      gET$api$appointmentOutcomeReasons$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
    }
  );
};

export const FetchGET$api$appointmentOutcomeReasons$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  ordering,
  outcome,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$appointmentOutcomeReasons$GET(
    { ordering, outcome },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$appointmentOutcomeReasons$: refetch,
  });
};

export const gET$api$appointmentOutcomeReasons$$id$$GET = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/appointment-outcome-reasons/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$appointmentOutcomeReasons$$id$$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIGET$api$appointmentOutcomeReasons$$id$$GET',
      args,
    ],
    () =>
      gET$api$appointmentOutcomeReasons$$id$$GET(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$appointmentOutcomeReasons$$id$$GETS',
        ]),
    }
  );
};

export const FetchGET$api$appointmentOutcomeReasons$$id$$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$appointmentOutcomeReasons$$id$$GET(
    { id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$appointmentOutcomeReasons$$id$$: refetch,
  });
};

export const gET$api$appointmentStatusReport$GET = async (
  Constants,
  {
    after_created_date,
    after_date,
    appointment_type,
    appointment_type_is_active,
    before_created_date,
    before_date,
    clinic,
    created_by,
    format,
    limit,
    offset,
    region,
    search,
    staff_member,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (after_created_date !== undefined) {
    paramsDict['after_created_date'] = renderParam(after_created_date);
  }
  if (after_date !== undefined) {
    paramsDict['after_date'] = renderParam(after_date);
  }
  if (appointment_type !== undefined) {
    paramsDict['appointment_type'] = renderParam(appointment_type);
  }
  if (appointment_type_is_active !== undefined) {
    paramsDict['appointment_type_is_active'] = renderParam(
      appointment_type_is_active
    );
  }
  if (before_created_date !== undefined) {
    paramsDict['before_created_date'] = renderParam(before_created_date);
  }
  if (before_date !== undefined) {
    paramsDict['before_date'] = renderParam(before_date);
  }
  if (clinic !== undefined) {
    paramsDict['clinic'] = renderParam(clinic);
  }
  if (created_by !== undefined) {
    paramsDict['created_by'] = renderParam(created_by);
  }
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (region !== undefined) {
    paramsDict['region'] = renderParam(region);
  }
  if (search !== undefined) {
    paramsDict['search'] = renderParam(search);
  }
  if (staff_member !== undefined) {
    paramsDict['staff_member'] = renderParam(staff_member);
  }
  const url = `${Constants.API_BASE_URL}/appointment-status-report/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$appointmentStatusReport$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  return useQuery(
    ['appointment-status-reports', args],
    () =>
      gET$api$appointmentStatusReport$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
    }
  );
};

export const FetchGET$api$appointmentStatusReport$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  after_created_date,
  after_date,
  appointment_type,
  appointment_type_is_active,
  before_created_date,
  before_date,
  clinic,
  created_by,
  format,
  limit,
  offset,
  region,
  search,
  staff_member,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$appointmentStatusReport$GET(
    {
      after_created_date,
      after_date,
      appointment_type,
      appointment_type_is_active,
      before_created_date,
      before_date,
      clinic,
      created_by,
      format,
      limit,
      offset,
      region,
      search,
      staff_member,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$appointmentStatusReport$: refetch,
  });
};

export const gET$api$appointmentTypes$GET = async (
  Constants,
  _args,
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/appointment-types/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$appointmentTypes$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIGET$api$appointmentTypes$GET', args],
    () => gET$api$appointmentTypes$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$appointmentTypes$GETS',
        ]),
    }
  );
};

export const FetchGET$api$appointmentTypes$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$appointmentTypes$GET(
    {},
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$appointmentTypes$: refetch,
  });
};

export const gET$api$appointmentTypes$$id$$GET = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/appointment-types/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$appointmentTypes$$id$$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIGET$api$appointmentTypes$$id$$GET', args],
    () => gET$api$appointmentTypes$$id$$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$appointmentTypes$$id$$GETS',
        ]),
    }
  );
};

export const FetchGET$api$appointmentTypes$$id$$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$appointmentTypes$$id$$GET(
    { id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$appointmentTypes$$id$$: refetch,
  });
};

export const gET$api$appointmentsReport$GET = async (
  Constants,
  {
    after_created_at,
    after_moment,
    appointment_type_general_type,
    assigned_tags,
    before_created_at,
    before_moment,
    clinic,
    format,
    hearing_test_conducted,
    is_completed,
    is_opportunity,
    limit,
    managed_care_plan,
    offset,
    ordering,
    outcome,
    outcome_reason,
    patient,
    patient_assigned_tags,
    referral_source,
    referring_physician,
    region,
    staff_member,
    status,
    sub_referral_source,
    type,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (after_created_at !== undefined) {
    paramsDict['after_created_at'] = renderParam(after_created_at);
  }
  if (after_moment !== undefined) {
    paramsDict['after_moment'] = renderParam(after_moment);
  }
  if (appointment_type_general_type !== undefined) {
    paramsDict['appointment_type_general_type'] = renderParam(
      appointment_type_general_type
    );
  }
  if (assigned_tags !== undefined) {
    paramsDict['assigned_tags'] = renderParam(assigned_tags);
  }
  if (before_created_at !== undefined) {
    paramsDict['before_created_at'] = renderParam(before_created_at);
  }
  if (before_moment !== undefined) {
    paramsDict['before_moment'] = renderParam(before_moment);
  }
  if (clinic !== undefined) {
    paramsDict['clinic'] = renderParam(clinic);
  }
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  if (hearing_test_conducted !== undefined) {
    paramsDict['hearing_test_conducted'] = renderParam(hearing_test_conducted);
  }
  if (is_completed !== undefined) {
    paramsDict['is_completed'] = renderParam(is_completed);
  }
  if (is_opportunity !== undefined) {
    paramsDict['is_opportunity'] = renderParam(is_opportunity);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (managed_care_plan !== undefined) {
    paramsDict['managed_care_plan'] = renderParam(managed_care_plan);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (outcome !== undefined) {
    paramsDict['outcome'] = renderParam(outcome);
  }
  if (outcome_reason !== undefined) {
    paramsDict['outcome_reason'] = renderParam(outcome_reason);
  }
  if (patient !== undefined) {
    paramsDict['patient'] = renderParam(patient);
  }
  if (patient_assigned_tags !== undefined) {
    paramsDict['patient_assigned_tags'] = renderParam(patient_assigned_tags);
  }
  if (referral_source !== undefined) {
    paramsDict['referral_source'] = renderParam(referral_source);
  }
  if (referring_physician !== undefined) {
    paramsDict['referring_physician'] = renderParam(referring_physician);
  }
  if (region !== undefined) {
    paramsDict['region'] = renderParam(region);
  }
  if (staff_member !== undefined) {
    paramsDict['staff_member'] = renderParam(staff_member);
  }
  if (status !== undefined) {
    paramsDict['status'] = renderParam(status);
  }
  if (sub_referral_source !== undefined) {
    paramsDict['sub_referral_source'] = renderParam(sub_referral_source);
  }
  if (type !== undefined) {
    paramsDict['type'] = renderParam(type);
  }
  const url = `${Constants.API_BASE_URL}/appointments-report/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$appointmentsReport$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIGET$api$appointmentsReport$GET', args],
    () => gET$api$appointmentsReport$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$appointmentsReport$GETS',
        ]),
    }
  );
};

export const FetchGET$api$appointmentsReport$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  after_created_at,
  after_moment,
  appointment_type_general_type,
  assigned_tags,
  before_created_at,
  before_moment,
  clinic,
  format,
  hearing_test_conducted,
  is_completed,
  is_opportunity,
  limit,
  managed_care_plan,
  offset,
  ordering,
  outcome,
  outcome_reason,
  patient,
  patient_assigned_tags,
  referral_source,
  referring_physician,
  region,
  staff_member,
  status,
  sub_referral_source,
  type,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$appointmentsReport$GET(
    {
      after_created_at,
      after_moment,
      appointment_type_general_type,
      assigned_tags,
      before_created_at,
      before_moment,
      clinic,
      format,
      hearing_test_conducted,
      is_completed,
      is_opportunity,
      limit,
      managed_care_plan,
      offset,
      ordering,
      outcome,
      outcome_reason,
      patient,
      patient_assigned_tags,
      referral_source,
      referring_physician,
      region,
      staff_member,
      status,
      sub_referral_source,
      type,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$appointmentsReport$: refetch,
  });
};

export const gET$api$appointments$GET = async (
  Constants,
  {
    after_created_at,
    after_moment,
    appointment_type_general_type,
    assigned_tags,
    before_created_at,
    before_moment,
    clinic,
    format,
    hearing_test_conducted,
    is_completed,
    is_opportunity,
    limit,
    managed_care_plan,
    offset,
    ordering,
    outcome,
    outcome_reason,
    patient,
    patient_assigned_tags,
    referral_source,
    referring_physician,
    region,
    staff_member,
    status,
    sub_referral_source,
    type,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (after_created_at !== undefined) {
    paramsDict['after_created_at'] = renderParam(after_created_at);
  }
  if (after_moment !== undefined) {
    paramsDict['after_moment'] = renderParam(after_moment);
  }
  if (appointment_type_general_type !== undefined) {
    paramsDict['appointment_type_general_type'] = renderParam(
      appointment_type_general_type
    );
  }
  if (assigned_tags !== undefined) {
    paramsDict['assigned_tags'] = renderParam(assigned_tags);
  }
  if (before_created_at !== undefined) {
    paramsDict['before_created_at'] = renderParam(before_created_at);
  }
  if (before_moment !== undefined) {
    paramsDict['before_moment'] = renderParam(before_moment);
  }
  if (clinic !== undefined) {
    paramsDict['clinic'] = renderParam(clinic);
  }
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  if (hearing_test_conducted !== undefined) {
    paramsDict['hearing_test_conducted'] = renderParam(hearing_test_conducted);
  }
  if (is_completed !== undefined) {
    paramsDict['is_completed'] = renderParam(is_completed);
  }
  if (is_opportunity !== undefined) {
    paramsDict['is_opportunity'] = renderParam(is_opportunity);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (managed_care_plan !== undefined) {
    paramsDict['managed_care_plan'] = renderParam(managed_care_plan);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (outcome !== undefined) {
    paramsDict['outcome'] = renderParam(outcome);
  }
  if (outcome_reason !== undefined) {
    paramsDict['outcome_reason'] = renderParam(outcome_reason);
  }
  if (patient !== undefined) {
    paramsDict['patient'] = renderParam(patient);
  }
  if (patient_assigned_tags !== undefined) {
    paramsDict['patient_assigned_tags'] = renderParam(patient_assigned_tags);
  }
  if (referral_source !== undefined) {
    paramsDict['referral_source'] = renderParam(referral_source);
  }
  if (referring_physician !== undefined) {
    paramsDict['referring_physician'] = renderParam(referring_physician);
  }
  if (region !== undefined) {
    paramsDict['region'] = renderParam(region);
  }
  if (staff_member !== undefined) {
    paramsDict['staff_member'] = renderParam(staff_member);
  }
  if (status !== undefined) {
    paramsDict['status'] = renderParam(status);
  }
  if (sub_referral_source !== undefined) {
    paramsDict['sub_referral_source'] = renderParam(sub_referral_source);
  }
  if (type !== undefined) {
    paramsDict['type'] = renderParam(type);
  }
  const url = `${Constants.API_BASE_URL}/appointments/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$appointments$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIGET$api$appointments$GET', args],
    () => gET$api$appointments$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$appointments$GETS',
        ]),
    }
  );
};

export const FetchGET$api$appointments$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  after_created_at,
  after_moment,
  appointment_type_general_type,
  assigned_tags,
  before_created_at,
  before_moment,
  clinic,
  format,
  hearing_test_conducted,
  is_completed,
  is_opportunity,
  limit,
  managed_care_plan,
  offset,
  ordering,
  outcome,
  outcome_reason,
  patient,
  patient_assigned_tags,
  referral_source,
  referring_physician,
  region,
  staff_member,
  status,
  sub_referral_source,
  type,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$appointments$GET(
    {
      after_created_at,
      after_moment,
      appointment_type_general_type,
      assigned_tags,
      before_created_at,
      before_moment,
      clinic,
      format,
      hearing_test_conducted,
      is_completed,
      is_opportunity,
      limit,
      managed_care_plan,
      offset,
      ordering,
      outcome,
      outcome_reason,
      patient,
      patient_assigned_tags,
      referral_source,
      referring_physician,
      region,
      staff_member,
      status,
      sub_referral_source,
      type,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$appointments$: refetch,
  });
};

export const gET$api$appointments$counters$GET = async (
  Constants,
  { format },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  const url = `${Constants.API_BASE_URL}/appointments/counters/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$appointments$counters$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIGET$api$appointments$counters$GET', args],
    () => gET$api$appointments$counters$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$appointments$counters$GETS',
        ]),
    }
  );
};

export const FetchGET$api$appointments$counters$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  format,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$appointments$counters$GET(
    { format },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$appointments$counters$: refetch,
  });
};

export const gET$api$appointments$patientsCount$GET = async (
  Constants,
  { format },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  const url = `${Constants.API_BASE_URL}/appointments/patients-count/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$appointments$patientsCount$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIGET$api$appointments$patientsCount$GET', args],
    () =>
      gET$api$appointments$patientsCount$GET(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$appointments$patientsCount$GETS',
        ]),
    }
  );
};

export const FetchGET$api$appointments$patientsCount$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  format,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$appointments$patientsCount$GET(
    { format },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$appointments$patientsCount$: refetch,
  });
};

export const gET$api$appointments$$id$$GET = async (
  Constants,
  { format, id },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  const url = `${Constants.API_BASE_URL}/appointments/${encodeQueryParam(
    id
  )}/${renderQueryString(paramsDict)}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$appointments$$id$$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIGET$api$appointments$$id$$GET', args],
    () => gET$api$appointments$$id$$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$appointments$$id$$GETS',
        ]),
    }
  );
};

export const FetchGET$api$appointments$$id$$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  format,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$appointments$$id$$GET(
    { format, id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$appointments$$id$$: refetch,
  });
};

export const gET$api$assignedTags$GET = async (
  Constants,
  {
    after_created_at,
    before_created_at,
    is_active,
    object_id,
    ordering,
    tag,
    type,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (after_created_at !== undefined) {
    paramsDict['after_created_at'] = renderParam(after_created_at);
  }
  if (before_created_at !== undefined) {
    paramsDict['before_created_at'] = renderParam(before_created_at);
  }
  if (is_active !== undefined) {
    paramsDict['is_active'] = renderParam(is_active);
  }
  if (object_id !== undefined) {
    paramsDict['object_id'] = renderParam(object_id);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (tag !== undefined) {
    paramsDict['tag'] = renderParam(tag);
  }
  if (type !== undefined) {
    paramsDict['type'] = renderParam(type);
  }
  const url = `${Constants.API_BASE_URL}/assigned-tags/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$assignedTags$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  return useQuery(
    ['assigned-tags', args],
    () => gET$api$assignedTags$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
    }
  );
};

export const FetchGET$api$assignedTags$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  after_created_at,
  before_created_at,
  is_active,
  object_id,
  ordering,
  tag,
  type,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$assignedTags$GET(
    {
      after_created_at,
      before_created_at,
      is_active,
      object_id,
      ordering,
      tag,
      type,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$assignedTags$: refetch,
  });
};

export const gET$api$assignedTags$$id$$GET = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/assigned-tags/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$assignedTags$$id$$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIGET$api$assignedTags$$id$$GET', args],
    () => gET$api$assignedTags$$id$$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$assignedTags$$id$$GETS',
        ]),
    }
  );
};

export const FetchGET$api$assignedTags$$id$$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$assignedTags$$id$$GET(
    { id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$assignedTags$$id$$: refetch,
  });
};

export const gET$api$audiometerConfiguration$GET = async (
  Constants,
  { clinic, is_active, limit, offset, ordering },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (clinic !== undefined) {
    paramsDict['clinic'] = renderParam(clinic);
  }
  if (is_active !== undefined) {
    paramsDict['is_active'] = renderParam(is_active);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  const url = `${Constants.API_BASE_URL}/audiometer-configuration/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$audiometerConfiguration$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  return useQuery(
    ['audiometer-configurations', args],
    () =>
      gET$api$audiometerConfiguration$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
    }
  );
};

export const FetchGET$api$audiometerConfiguration$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  clinic,
  is_active,
  limit,
  offset,
  ordering,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$audiometerConfiguration$GET(
    { clinic, is_active, limit, offset, ordering },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$audiometerConfiguration$: refetch,
  });
};

export const gET$api$audiometerConfiguration$$id$$GET = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/audiometer-configuration/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$audiometerConfiguration$$id$$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIGET$api$audiometerConfiguration$$id$$GET',
      args,
    ],
    () =>
      gET$api$audiometerConfiguration$$id$$GET(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$audiometerConfiguration$$id$$GETS',
        ]),
    }
  );
};

export const FetchGET$api$audiometerConfiguration$$id$$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$audiometerConfiguration$$id$$GET(
    { id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$audiometerConfiguration$$id$$: refetch,
  });
};

export const gET$api$audiometers$GET = async (
  Constants,
  { limit, offset, ordering, search },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (search !== undefined) {
    paramsDict['search'] = renderParam(search);
  }
  const url = `${Constants.API_BASE_URL}/audiometers/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$audiometers$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  return useQuery(
    ['audiometers', args],
    () => gET$api$audiometers$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
    }
  );
};

export const FetchGET$api$audiometers$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  limit,
  offset,
  ordering,
  search,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$audiometers$GET(
    { limit, offset, ordering, search },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$audiometers$: refetch,
  });
};

export const gET$api$audiometers$$id$$GET = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/audiometers/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$audiometers$$id$$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIGET$api$audiometers$$id$$GET', args],
    () => gET$api$audiometers$$id$$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$audiometers$$id$$GETS',
        ]),
    }
  );
};

export const FetchGET$api$audiometers$$id$$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$audiometers$$id$$GET(
    { id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$audiometers$$id$$: refetch,
  });
};

export const gET$api$auth$users$GET = async (
  Constants,
  _args,
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$auth$users$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  return useQuery(
    ['auths', args],
    () => gET$api$auth$users$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
    }
  );
};

export const FetchGET$api$auth$users$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$auth$users$GET(
    {},
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$auth$users$: refetch,
  });
};

export const gET$api$auth$users$me$GET = async (
  Constants,
  _args,
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/me/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$auth$users$me$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['auth', args],
    () => gET$api$auth$users$me$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () => queryClient.invalidateQueries(['auths']),
    }
  );
};

export const FetchGET$api$auth$users$me$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$auth$users$me$GET(
    {},
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$auth$users$me$: refetch,
  });
};

export const gET$api$auth$users$me$clinics$$clinicPk$$weeklySchedule$GET =
  async (Constants, { clinic_pk }, handlers, timeout) => {
    const url = `${Constants.API_BASE_URL}/auth/users/me/clinics/${encodeQueryParam(
      clinic_pk
    )}/weekly-schedule/`;
    const controller = new AbortController();
    let timeoutObj;
    if (timeout) {
      timeoutObj = setTimeout(() => {
        const err = new Error(`Timeout after ${timeout}ms`);
        err.__type = 'TIMEOUT';
        controller.abort(err);
      }, timeout);
    }
    try {
      const res = await fetch(url, {
        headers: cleanHeaders({
          Accept: 'application/json',
          Authorization: Constants['AUTH_HEADER'],
          'Content-Type': 'application/json',
        }),
        signal: controller.signal,
      });
      timeoutObj && clearTimeout(timeoutObj);
      return handleResponse(res, handlers);
    } catch (e) {
      if (e.__type === 'TIMEOUT') {
        handlers.onTimeout?.();
      } else if (timeoutObj) {
        clearTimeout(timeoutObj);
      }
      throw e;
    }
  };

export const useGET$api$auth$users$me$clinics$$clinicPk$$weeklySchedule$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['auth', args],
    () =>
      gET$api$auth$users$me$clinics$$clinicPk$$weeklySchedule$GET(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () => queryClient.invalidateQueries(['auths']),
    }
  );
};

export const FetchGET$api$auth$users$me$clinics$$clinicPk$$weeklySchedule$GET =
  ({
    children,
    onData = () => {},
    handlers = {},
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    clinic_pk,
  }) => {
    const Constants = GlobalVariables.useValues();
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);

    const {
      isLoading: loading,
      data,
      error,
      refetch,
    } = useGET$api$auth$users$me$clinics$$clinicPk$$weeklySchedule$GET(
      { clinic_pk },
      {
        refetchInterval,
        refetchOnWindowFocus,
        refetchOnMount,
        refetchOnReconnect,
        retry,
        staleTime,
        timeout,
        handlers: { onData, ...handlers },
      }
    );

    React.useEffect(() => {
      if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
        refetch();
      }
    }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

    React.useEffect(() => {
      if (error) {
        console.log(error);
        if (error.status) {
          console.log(
            'Fetch error: ' + error.status + ' ' + error.statusText
          );
        }
      }
    }, [error]);
    return children({
      loading,
      data,
      error,
      refetchGET$api$auth$users$me$clinics$$clinicPk$$weeklySchedule$: refetch,
    });
  };

export const gET$api$auth$users$me$sendbird$GET = async (
  Constants,
  _args,
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/me/sendbird/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$auth$users$me$sendbird$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['auth', args],
    () =>
      gET$api$auth$users$me$sendbird$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () => queryClient.invalidateQueries(['auths']),
    }
  );
};

export const FetchGET$api$auth$users$me$sendbird$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$auth$users$me$sendbird$GET(
    {},
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$auth$users$me$sendbird$: refetch,
  });
};

export const gET$api$auth$users$$id$$GET = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$auth$users$$id$$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['auth', args],
    () => gET$api$auth$users$$id$$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () => queryClient.invalidateQueries(['auths']),
    }
  );
};

export const FetchGET$api$auth$users$$id$$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$auth$users$$id$$GET(
    { id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$auth$users$$id$$: refetch,
  });
};

export const gET$api$chartNotes$GET = async (
  Constants,
  {
    after_moment,
    appointment,
    assigned_tags,
    before_moment,
    clinic,
    has_appointment,
    limit,
    offset,
    ordering,
    patient,
    pinned,
    region,
    search,
    status,
    type,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (after_moment !== undefined) {
    paramsDict['after_moment'] = renderParam(after_moment);
  }
  if (appointment !== undefined) {
    paramsDict['appointment'] = renderParam(appointment);
  }
  if (assigned_tags !== undefined) {
    paramsDict['assigned_tags'] = renderParam(assigned_tags);
  }
  if (before_moment !== undefined) {
    paramsDict['before_moment'] = renderParam(before_moment);
  }
  if (clinic !== undefined) {
    paramsDict['clinic'] = renderParam(clinic);
  }
  if (has_appointment !== undefined) {
    paramsDict['has_appointment'] = renderParam(has_appointment);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (patient !== undefined) {
    paramsDict['patient'] = renderParam(patient);
  }
  if (pinned !== undefined) {
    paramsDict['pinned'] = renderParam(pinned);
  }
  if (region !== undefined) {
    paramsDict['region'] = renderParam(region);
  }
  if (search !== undefined) {
    paramsDict['search'] = renderParam(search);
  }
  if (status !== undefined) {
    paramsDict['status'] = renderParam(status);
  }
  if (type !== undefined) {
    paramsDict['type'] = renderParam(type);
  }
  const url = `${Constants.API_BASE_URL}/chart-notes/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$chartNotes$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  return useQuery(
    ['chart-notes', args],
    () => gET$api$chartNotes$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
    }
  );
};

export const FetchGET$api$chartNotes$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  after_moment,
  appointment,
  assigned_tags,
  before_moment,
  clinic,
  has_appointment,
  limit,
  offset,
  ordering,
  patient,
  pinned,
  region,
  search,
  status,
  type,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$chartNotes$GET(
    {
      after_moment,
      appointment,
      assigned_tags,
      before_moment,
      clinic,
      has_appointment,
      limit,
      offset,
      ordering,
      patient,
      pinned,
      region,
      search,
      status,
      type,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$chartNotes$: refetch,
  });
};

export const gET$api$chartNotes$$id$$GET = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/chart-notes/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$chartNotes$$id$$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIGET$api$chartNotes$$id$$GET', args],
    () => gET$api$chartNotes$$id$$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$chartNotes$$id$$GETS',
        ]),
    }
  );
};

export const FetchGET$api$chartNotes$$id$$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$chartNotes$$id$$GET(
    { id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$chartNotes$$id$$: refetch,
  });
};

export const gET$api$clinics$GET = async (
  Constants,
  { is_active, ordering, region, search, staff_member, type, user },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (is_active !== undefined) {
    paramsDict['is_active'] = renderParam(is_active);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (region !== undefined) {
    paramsDict['region'] = renderParam(region);
  }
  if (search !== undefined) {
    paramsDict['search'] = renderParam(search);
  }
  if (staff_member !== undefined) {
    paramsDict['staff_member'] = renderParam(staff_member);
  }
  if (type !== undefined) {
    paramsDict['type'] = renderParam(type);
  }
  if (user !== undefined) {
    paramsDict['user'] = renderParam(user);
  }
  const url = `${Constants.API_BASE_URL}/clinics/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$clinics$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  return useQuery(
    ['clinics', args],
    () => gET$api$clinics$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
    }
  );
};

export const FetchGET$api$clinics$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  is_active,
  ordering,
  region,
  search,
  staff_member,
  type,
  user,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$clinics$GET(
    { is_active, ordering, region, search, staff_member, type, user },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGET$api$clinics$: refetch });
};

export const gET$api$clinics$$clinicPk$$campaigns$GET = async (
  Constants,
  { campaign_type, clinic_pk, is_active, ordering },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (campaign_type !== undefined) {
    paramsDict['campaign_type'] = renderParam(campaign_type);
  }
  if (is_active !== undefined) {
    paramsDict['is_active'] = renderParam(is_active);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/campaigns/${renderQueryString(paramsDict)}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$clinics$$clinicPk$$campaigns$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  return useQuery(
    ['clinics', args],
    () =>
      gET$api$clinics$$clinicPk$$campaigns$GET(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
    }
  );
};

export const FetchGET$api$clinics$$clinicPk$$campaigns$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  campaign_type,
  clinic_pk,
  is_active,
  ordering,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$clinics$$clinicPk$$campaigns$GET(
    { campaign_type, clinic_pk, is_active, ordering },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$clinics$$clinicPk$$campaigns$: refetch,
  });
};

export const gET$api$clinics$$clinicPk$$campaigns$$id$$GET = async (
  Constants,
  { clinic_pk, id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/campaigns/${encodeQueryParam(id)}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$clinics$$clinicPk$$campaigns$$id$$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIGET$api$clinics$$clinicPk$$campaigns$$id$$GET',
      args,
    ],
    () =>
      gET$api$clinics$$clinicPk$$campaigns$$id$$GET(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$clinics$$clinicPk$$campaigns$$id$$GETS',
        ]),
    }
  );
};

export const FetchGET$api$clinics$$clinicPk$$campaigns$$id$$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  clinic_pk,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$clinics$$clinicPk$$campaigns$$id$$GET(
    { clinic_pk, id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$clinics$$clinicPk$$campaigns$$id$$: refetch,
  });
};

export const gET$api$clinics$$clinicPk$$eDocuments$$id$$GET = async (
  Constants,
  { clinic_pk, id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/e-documents/${encodeQueryParam(id)}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$clinics$$clinicPk$$eDocuments$$id$$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIGET$api$clinics$$clinicPk$$eDocuments$$id$$GET',
      args,
    ],
    () =>
      gET$api$clinics$$clinicPk$$eDocuments$$id$$GET(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$clinics$$clinicPk$$eDocuments$$id$$GETS',
        ]),
    }
  );
};

export const FetchGET$api$clinics$$clinicPk$$eDocuments$$id$$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  clinic_pk,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$clinics$$clinicPk$$eDocuments$$id$$GET(
    { clinic_pk, id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$clinics$$clinicPk$$eDocuments$$id$$: refetch,
  });
};

export const gET$api$clinics$$clinicPk$$faxes$unreadFaxCount$GET = async (
  Constants,
  { clinic_pk },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/faxes/unread-fax-count/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$clinics$$clinicPk$$faxes$unreadFaxCount$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIGET$api$clinics$$clinicPk$$faxes$unreadFaxCount$GET',
      args,
    ],
    () =>
      gET$api$clinics$$clinicPk$$faxes$unreadFaxCount$GET(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$clinics$$clinicPk$$faxes$unreadFaxCount$GETS',
        ]),
    }
  );
};

export const FetchGET$api$clinics$$clinicPk$$faxes$unreadFaxCount$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  clinic_pk,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$clinics$$clinicPk$$faxes$unreadFaxCount$GET(
    { clinic_pk },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$clinics$$clinicPk$$faxes$unreadFaxCount$: refetch,
  });
};

export const gET$api$clinics$$clinicPk$$messages$GET = async (
  Constants,
  {
    clinic,
    clinic_pk,
    clinic_sms_phone,
    direction,
    is_read,
    limit,
    offset,
    ordering,
    patient,
    region,
    search,
    type,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (clinic !== undefined) {
    paramsDict['clinic'] = renderParam(clinic);
  }
  if (clinic_sms_phone !== undefined) {
    paramsDict['clinic_sms_phone'] = renderParam(clinic_sms_phone);
  }
  if (direction !== undefined) {
    paramsDict['direction'] = renderParam(direction);
  }
  if (is_read !== undefined) {
    paramsDict['is_read'] = renderParam(is_read);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (patient !== undefined) {
    paramsDict['patient'] = renderParam(patient);
  }
  if (region !== undefined) {
    paramsDict['region'] = renderParam(region);
  }
  if (search !== undefined) {
    paramsDict['search'] = renderParam(search);
  }
  if (type !== undefined) {
    paramsDict['type'] = renderParam(type);
  }
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/messages/${renderQueryString(paramsDict)}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$clinics$$clinicPk$$messages$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  return useQuery(
    ['clinics', args],
    () =>
      gET$api$clinics$$clinicPk$$messages$GET(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
    }
  );
};

export const FetchGET$api$clinics$$clinicPk$$messages$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  clinic,
  clinic_pk,
  clinic_sms_phone,
  direction,
  is_read,
  limit,
  offset,
  ordering,
  patient,
  region,
  search,
  type,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$clinics$$clinicPk$$messages$GET(
    {
      clinic,
      clinic_pk,
      clinic_sms_phone,
      direction,
      is_read,
      limit,
      offset,
      ordering,
      patient,
      region,
      search,
      type,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$clinics$$clinicPk$$messages$: refetch,
  });
};

export const gET$api$clinics$$clinicPk$$messages$unreadMessagesCount$GET =
  async (Constants, { clinic_pk }, handlers, timeout) => {
    const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
      clinic_pk
    )}/messages/unread-messages-count/`;
    const controller = new AbortController();
    let timeoutObj;
    if (timeout) {
      timeoutObj = setTimeout(() => {
        const err = new Error(`Timeout after ${timeout}ms`);
        err.__type = 'TIMEOUT';
        controller.abort(err);
      }, timeout);
    }
    try {
      const res = await fetch(url, {
        headers: cleanHeaders({
          Accept: 'application/json',
          Authorization: Constants['AUTH_HEADER'],
          'Content-Type': 'application/json',
        }),
        signal: controller.signal,
      });
      timeoutObj && clearTimeout(timeoutObj);
      return handleResponse(res, handlers);
    } catch (e) {
      if (e.__type === 'TIMEOUT') {
        handlers.onTimeout?.();
      } else if (timeoutObj) {
        clearTimeout(timeoutObj);
      }
      throw e;
    }
  };

export const useGET$api$clinics$$clinicPk$$messages$unreadMessagesCount$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  return useQuery(
    ['Unread MessageCounts', args],
    () =>
      gET$api$clinics$$clinicPk$$messages$unreadMessagesCount$GET(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
    }
  );
};

export const FetchGET$api$clinics$$clinicPk$$messages$unreadMessagesCount$GET =
  ({
    children,
    onData = () => {},
    handlers = {},
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    clinic_pk,
  }) => {
    const Constants = GlobalVariables.useValues();
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);

    const {
      isLoading: loading,
      data,
      error,
      refetch,
    } = useGET$api$clinics$$clinicPk$$messages$unreadMessagesCount$GET(
      { clinic_pk },
      {
        refetchInterval,
        refetchOnWindowFocus,
        refetchOnMount,
        refetchOnReconnect,
        retry,
        staleTime,
        timeout,
        handlers: { onData, ...handlers },
      }
    );

    React.useEffect(() => {
      if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
        refetch();
      }
    }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

    React.useEffect(() => {
      if (error) {
        console.log(error);
        if (error.status) {
          console.log(
            'Fetch error: ' + error.status + ' ' + error.statusText
          );
        }
      }
    }, [error]);
    return children({
      loading,
      data,
      error,
      refetchGET$api$clinics$$clinicPk$$messages$unreadMessagesCount$: refetch,
    });
  };

export const gET$api$clinics$$clinicPk$$messages$$id$$GET = async (
  Constants,
  { clinic_pk, id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/messages/${encodeQueryParam(id)}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$clinics$$clinicPk$$messages$$id$$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIGET$api$clinics$$clinicPk$$messages$$id$$GET',
      args,
    ],
    () =>
      gET$api$clinics$$clinicPk$$messages$$id$$GET(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$clinics$$clinicPk$$messages$$id$$GETS',
        ]),
    }
  );
};

export const FetchGET$api$clinics$$clinicPk$$messages$$id$$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  clinic_pk,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$clinics$$clinicPk$$messages$$id$$GET(
    { clinic_pk, id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$clinics$$clinicPk$$messages$$id$$: refetch,
  });
};

export const gET$api$clinics$$clinicPk$$taxes$GET = async (
  Constants,
  {
    clinic_pk,
    is_default,
    is_effective,
    is_expired,
    limit,
    offset,
    ordering,
    product_subtype,
    product_type,
    search,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (is_default !== undefined) {
    paramsDict['is_default'] = renderParam(is_default);
  }
  if (is_effective !== undefined) {
    paramsDict['is_effective'] = renderParam(is_effective);
  }
  if (is_expired !== undefined) {
    paramsDict['is_expired'] = renderParam(is_expired);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (product_subtype !== undefined) {
    paramsDict['product_subtype'] = renderParam(product_subtype);
  }
  if (product_type !== undefined) {
    paramsDict['product_type'] = renderParam(product_type);
  }
  if (search !== undefined) {
    paramsDict['search'] = renderParam(search);
  }
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/taxes/${renderQueryString(paramsDict)}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$clinics$$clinicPk$$taxes$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIGET$api$clinics$$clinicPk$$taxes$GET', args],
    () =>
      gET$api$clinics$$clinicPk$$taxes$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$clinics$$clinicPk$$taxes$GETS',
        ]),
    }
  );
};

export const FetchGET$api$clinics$$clinicPk$$taxes$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  clinic_pk,
  is_default,
  is_effective,
  is_expired,
  limit,
  offset,
  ordering,
  product_subtype,
  product_type,
  search,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$clinics$$clinicPk$$taxes$GET(
    {
      clinic_pk,
      is_default,
      is_effective,
      is_expired,
      limit,
      offset,
      ordering,
      product_subtype,
      product_type,
      search,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$clinics$$clinicPk$$taxes$: refetch,
  });
};

export const gET$api$clinics$$clinicPk$$taxes$$id$$GET = async (
  Constants,
  { clinic_pk, id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/taxes/${encodeQueryParam(id)}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$clinics$$clinicPk$$taxes$$id$$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIGET$api$clinics$$clinicPk$$taxes$$id$$GET',
      args,
    ],
    () =>
      gET$api$clinics$$clinicPk$$taxes$$id$$GET(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$clinics$$clinicPk$$taxes$$id$$GETS',
        ]),
    }
  );
};

export const FetchGET$api$clinics$$clinicPk$$taxes$$id$$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  clinic_pk,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$clinics$$clinicPk$$taxes$$id$$GET(
    { clinic_pk, id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$clinics$$clinicPk$$taxes$$id$$: refetch,
  });
};

export const gET$api$clinics$$clinicPk$$weeklySchedule$GET = async (
  Constants,
  { clinic_pk },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/weekly-schedule/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$clinics$$clinicPk$$weeklySchedule$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIGET$api$clinics$$clinicPk$$weeklySchedule$GET',
      args,
    ],
    () =>
      gET$api$clinics$$clinicPk$$weeklySchedule$GET(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$clinics$$clinicPk$$weeklySchedule$GETS',
        ]),
    }
  );
};

export const FetchGET$api$clinics$$clinicPk$$weeklySchedule$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  clinic_pk,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$clinics$$clinicPk$$weeklySchedule$GET(
    { clinic_pk },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$clinics$$clinicPk$$weeklySchedule$: refetch,
  });
};

export const gET$api$clinics$$id$$GET = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(id)}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$clinics$$id$$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIGET$api$clinics$$id$$GET', args],
    () => gET$api$clinics$$id$$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$clinics$$id$$GETS',
        ]),
    }
  );
};

export const FetchGET$api$clinics$$id$$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$clinics$$id$$GET(
    { id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$clinics$$id$$: refetch,
  });
};

export const gET$api$cptCodes$GET = async (
  Constants,
  { code, limit, offset, ordering, search },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (code !== undefined) {
    paramsDict['code'] = renderParam(code);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (search !== undefined) {
    paramsDict['search'] = renderParam(search);
  }
  const url = `${Constants.API_BASE_URL}/cpt-codes/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$cptCodes$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  return useQuery(
    ['cpt-codes', args],
    () => gET$api$cptCodes$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
    }
  );
};

export const FetchGET$api$cptCodes$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  code,
  limit,
  offset,
  ordering,
  search,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$cptCodes$GET(
    { code, limit, offset, ordering, search },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGET$api$cptCodes$: refetch });
};

export const gET$api$cptCodes$$id$$GET = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/cpt-codes/${encodeQueryParam(id)}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$cptCodes$$id$$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIGET$api$cptCodes$$id$$GET', args],
    () => gET$api$cptCodes$$id$$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$cptCodes$$id$$GETS',
        ]),
    }
  );
};

export const FetchGET$api$cptCodes$$id$$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$cptCodes$$id$$GET(
    { id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$cptCodes$$id$$: refetch,
  });
};

export const gET$api$credits$GET = async (
  Constants,
  { has_available_credit, ordering, patient },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (has_available_credit !== undefined) {
    paramsDict['has_available_credit'] = renderParam(has_available_credit);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (patient !== undefined) {
    paramsDict['patient'] = renderParam(patient);
  }
  const url = `${Constants.API_BASE_URL}/credits/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$credits$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  return useQuery(
    ['credits', args],
    () => gET$api$credits$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
    }
  );
};

export const FetchGET$api$credits$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  has_available_credit,
  ordering,
  patient,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$credits$GET(
    { has_available_credit, ordering, patient },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGET$api$credits$: refetch });
};

export const gET$api$credits$$id$$GET = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/credits/${encodeQueryParam(id)}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const useGET$api$credits$$id$$GET = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIGET$api$credits$$id$$GET', args],
    () => gET$api$credits$$id$$GET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIGET$api$credits$$id$$GETS',
        ]),
    }
  );
};

export const FetchGET$api$credits$$id$$GET = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGET$api$credits$$id$$GET(
    { id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGET$api$credits$$id$$: refetch,
  });
};

export const pATCH$api$accounts$$id$$PATCH = async (
  Constants,
  { id, product_type, quickbook_name_alias, quickbooks_realm_id, type },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/accounts/${encodeQueryParam(id)}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        quickbook_name_alias: quickbook_name_alias,
        type: type,
        product_type: product_type,
        quickbooks_realm_id: quickbooks_realm_id,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$accounts$$id$$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPATCH$api$accounts$$id$$PATCH', args],
    () => pATCH$api$accounts$$id$$PATCH(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$accounts$$id$$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$adjustments$$id$$PATCH = async (
  Constants,
  {
    adjustment_date,
    amount,
    created_by,
    description,
    external_id,
    format,
    id,
    insurance_policy,
    managed_care_plan,
    payer_type,
    sale,
    sale_item,
    type,
    updated_by,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  const url = `${Constants.API_BASE_URL}/adjustments/${encodeQueryParam(
    id
  )}/${renderQueryString(paramsDict)}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        created_by: created_by,
        updated_by: updated_by,
        sale: sale,
        sale_item: sale_item,
        payer_type: payer_type,
        adjustment_date: adjustment_date,
        amount: amount,
        description: description,
        external_id: external_id,
        managed_care_plan: managed_care_plan,
        insurance_policy: insurance_policy,
        type: type,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$adjustments$$id$$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPATCH$api$adjustments$$id$$PATCH', args],
    () => pATCH$api$adjustments$$id$$PATCH(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$adjustments$$id$$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$appointmentOutcomeReasons$$id$$PATCH = async (
  Constants,
  { id, name, outcome },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/appointment-outcome-reasons/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({ name: name, outcome: outcome }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$appointmentOutcomeReasons$$id$$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPATCH$api$appointmentOutcomeReasons$$id$$PATCH',
      args,
    ],
    () =>
      pATCH$api$appointmentOutcomeReasons$$id$$PATCH(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$appointmentOutcomeReasons$$id$$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$appointmentTypes$$id$$PATCH = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/appointment-types/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$appointmentTypes$$id$$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPATCH$api$appointmentTypes$$id$$PATCH', args],
    () =>
      pATCH$api$appointmentTypes$$id$$PATCH(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$appointmentTypes$$id$$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$appointments$$id$$PATCH = async (
  Constants,
  {
    allow_overlap,
    assigned_tags,
    clinic,
    companion_name,
    companion_present,
    companion_type,
    created_by,
    diagnosis,
    end_moment,
    extra,
    format,
    google_review_feedback_request,
    hearing_test_conducted,
    id,
    intake_form_request,
    is_opportunity,
    needs_reschedule,
    notes,
    notification_method,
    outcome,
    outcome_notes,
    outcome_reason,
    patient,
    physician_referral,
    private_feedback_submission_date,
    private_textual_feedback_request,
    private_textual_feedback_response,
    referral_source,
    referring_physician,
    rescheduled_appointment_id,
    room,
    schedule,
    should_create_intake_form_request,
    should_create_schedule_for_staff,
    should_notify,
    staff_member,
    start_moment,
    start_recurrence_id,
    status,
    sub_referral_source,
    sub_referral_source_content_type,
    sub_referral_source_object_id,
    telehealth_provider,
    title,
    type,
    updated_by,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  const url = `${Constants.API_BASE_URL}/appointments/${encodeQueryParam(
    id
  )}/${renderQueryString(paramsDict)}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        created_by: created_by,
        updated_by: updated_by,
        title: title,
        referral_source: referral_source,
        sub_referral_source: sub_referral_source,
        patient: patient,
        type: type,
        staff_member: staff_member,
        start_moment: start_moment,
        end_moment: end_moment,
        room: room,
        physician_referral: physician_referral,
        companion_type: companion_type,
        companion_name: companion_name,
        notes: notes,
        status: status,
        notification_method: notification_method,
        should_notify: should_notify,
        private_textual_feedback_request: private_textual_feedback_request,
        private_textual_feedback_response: private_textual_feedback_response,
        google_review_feedback_request: google_review_feedback_request,
        is_opportunity: is_opportunity,
        outcome: outcome,
        outcome_reason: outcome_reason,
        outcome_notes: outcome_notes,
        should_create_schedule_for_staff: should_create_schedule_for_staff,
        allow_overlap: allow_overlap,
        clinic: clinic,
        extra: extra,
        referring_physician: referring_physician,
        assigned_tags: assigned_tags,
        sub_referral_source_content_type: sub_referral_source_content_type,
        sub_referral_source_object_id: sub_referral_source_object_id,
        should_create_intake_form_request: should_create_intake_form_request,
        intake_form_request: intake_form_request,
        diagnosis: diagnosis,
        hearing_test_conducted: hearing_test_conducted,
        rescheduled_appointment_id: rescheduled_appointment_id,
        companion_present: companion_present,
        telehealth_provider: telehealth_provider,
        needs_reschedule: needs_reschedule,
        private_feedback_submission_date: private_feedback_submission_date,
        schedule: schedule,
        start_recurrence_id: start_recurrence_id,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$appointments$$id$$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPATCH$api$appointments$$id$$PATCH', args],
    () => pATCH$api$appointments$$id$$PATCH(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$appointments$$id$$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$appointments$$id$$sync$PATCH = async (
  Constants,
  {
    allow_overlap,
    assigned_tags,
    clinic,
    companion_name,
    companion_present,
    companion_type,
    created_by,
    diagnosis,
    end_moment,
    extra,
    format,
    google_review_feedback_request,
    hearing_test_conducted,
    id,
    intake_form_request,
    is_opportunity,
    needs_reschedule,
    notes,
    notification_method,
    outcome,
    outcome_notes,
    outcome_reason,
    patient,
    physician_referral,
    private_feedback_submission_date,
    private_textual_feedback_request,
    private_textual_feedback_response,
    referral_source,
    referring_physician,
    rescheduled_appointment_id,
    room,
    schedule,
    should_create_intake_form_request,
    should_create_schedule_for_staff,
    should_notify,
    staff_member,
    start_moment,
    start_recurrence_id,
    status,
    sub_referral_source,
    sub_referral_source_content_type,
    sub_referral_source_object_id,
    telehealth_provider,
    title,
    type,
    updated_by,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  const url = `${Constants.API_BASE_URL}/appointments/${encodeQueryParam(
    id
  )}/sync/${renderQueryString(paramsDict)}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        created_by: created_by,
        updated_by: updated_by,
        title: title,
        referral_source: referral_source,
        sub_referral_source: sub_referral_source,
        patient: patient,
        type: type,
        staff_member: staff_member,
        start_moment: start_moment,
        end_moment: end_moment,
        room: room,
        physician_referral: physician_referral,
        companion_type: companion_type,
        companion_name: companion_name,
        notes: notes,
        status: status,
        notification_method: notification_method,
        should_notify: should_notify,
        private_textual_feedback_request: private_textual_feedback_request,
        private_textual_feedback_response: private_textual_feedback_response,
        google_review_feedback_request: google_review_feedback_request,
        is_opportunity: is_opportunity,
        outcome: outcome,
        outcome_reason: outcome_reason,
        outcome_notes: outcome_notes,
        should_create_schedule_for_staff: should_create_schedule_for_staff,
        allow_overlap: allow_overlap,
        clinic: clinic,
        extra: extra,
        referring_physician: referring_physician,
        assigned_tags: assigned_tags,
        sub_referral_source_content_type: sub_referral_source_content_type,
        sub_referral_source_object_id: sub_referral_source_object_id,
        should_create_intake_form_request: should_create_intake_form_request,
        intake_form_request: intake_form_request,
        diagnosis: diagnosis,
        hearing_test_conducted: hearing_test_conducted,
        rescheduled_appointment_id: rescheduled_appointment_id,
        companion_present: companion_present,
        telehealth_provider: telehealth_provider,
        needs_reschedule: needs_reschedule,
        private_feedback_submission_date: private_feedback_submission_date,
        schedule: schedule,
        start_recurrence_id: start_recurrence_id,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$appointments$$id$$sync$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPATCH$api$appointments$$id$$sync$PATCH', args],
    () =>
      pATCH$api$appointments$$id$$sync$PATCH(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$appointments$$id$$sync$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$assignedTags$$id$$PATCH = async (
  Constants,
  { description, expires_at, id, object_id, tag },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/assigned-tags/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        tag: tag,
        description: description,
        object_id: object_id,
        expires_at: expires_at,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$assignedTags$$id$$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPATCH$api$assignedTags$$id$$PATCH', args],
    () => pATCH$api$assignedTags$$id$$PATCH(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$assignedTags$$id$$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$audiometerConfiguration$$id$$PATCH = async (
  Constants,
  { audiometer, calibration_date, clinic, id, is_active, serial_number, title },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/audiometer-configuration/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        audiometer: audiometer,
        clinic: clinic,
        calibration_date: calibration_date,
        serial_number: serial_number,
        title: title,
        is_active: is_active,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$audiometerConfiguration$$id$$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPATCH$api$audiometerConfiguration$$id$$PATCH',
      args,
    ],
    () =>
      pATCH$api$audiometerConfiguration$$id$$PATCH(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$audiometerConfiguration$$id$$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$audiometers$$id$$PATCH = async (
  Constants,
  { id, name },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/audiometers/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({ name: name }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$audiometers$$id$$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPATCH$api$audiometers$$id$$PATCH', args],
    () => pATCH$api$audiometers$$id$$PATCH(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$audiometers$$id$$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$auth$changePassword$PATCH = async (
  Constants,
  _args,
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/change-password/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$auth$changePassword$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPATCH$api$auth$changePassword$PATCH', args],
    () =>
      pATCH$api$auth$changePassword$PATCH(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$auth$changePassword$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$auth$users$me$PATCH = async (
  Constants,
  {
    can_see_manufacturer_cost,
    chat_sound_notification,
    color,
    comms_api_key,
    date_joined,
    first_name,
    last_login,
    last_name,
    license_number,
    noah_password,
    noah_username,
    npi,
    onboarding_form_notifications_enabled,
    patient_arrived_sound_enabled,
    payment_request_notifications_enabled,
    photo,
    podium_id,
    role,
    scheduler_persist_per_clinic,
    scheduler_select_all_staff,
    sendbird_chat_enabled,
    signature,
    suffix,
    sync_with_google_calendar,
    task_is_assigned_notifications_enabled,
    title,
    touchpoint_notifications_enabled,
    user_permissions,
    user_preferences,
    user_reminder_notifications_enabled,
    web_scheduler_enabled,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/me/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        first_name: first_name,
        last_name: last_name,
        title: title,
        suffix: suffix,
        npi: npi,
        photo: photo,
        signature: signature,
        noah_username: noah_username,
        noah_password: noah_password,
        role: role,
        color: color,
        scheduler_select_all_staff: scheduler_select_all_staff,
        date_joined: date_joined,
        last_login: last_login,
        user_permissions: user_permissions,
        license_number: license_number,
        touchpoint_notifications_enabled: touchpoint_notifications_enabled,
        payment_request_notifications_enabled:
          payment_request_notifications_enabled,
        task_is_assigned_notifications_enabled:
          task_is_assigned_notifications_enabled,
        onboarding_form_notifications_enabled:
          onboarding_form_notifications_enabled,
        sendbird_chat_enabled: sendbird_chat_enabled,
        patient_arrived_sound_enabled: patient_arrived_sound_enabled,
        user_preferences: user_preferences,
        user_reminder_notifications_enabled:
          user_reminder_notifications_enabled,
        scheduler_persist_per_clinic: scheduler_persist_per_clinic,
        sync_with_google_calendar: sync_with_google_calendar,
        web_scheduler_enabled: web_scheduler_enabled,
        chat_sound_notification: chat_sound_notification,
        can_see_manufacturer_cost: can_see_manufacturer_cost,
        comms_api_key: comms_api_key,
        podium_id: podium_id,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$auth$users$me$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPATCH$api$auth$users$me$PATCH', args],
    () => pATCH$api$auth$users$me$PATCH(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$auth$users$me$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$auth$users$$id$$PATCH = async (
  Constants,
  {
    can_see_manufacturer_cost,
    chat_sound_notification,
    color,
    comms_api_key,
    date_joined,
    first_name,
    id,
    last_login,
    last_name,
    license_number,
    noah_password,
    noah_username,
    npi,
    onboarding_form_notifications_enabled,
    patient_arrived_sound_enabled,
    payment_request_notifications_enabled,
    photo,
    podium_id,
    role,
    scheduler_persist_per_clinic,
    scheduler_select_all_staff,
    sendbird_chat_enabled,
    signature,
    suffix,
    sync_with_google_calendar,
    task_is_assigned_notifications_enabled,
    title,
    touchpoint_notifications_enabled,
    user_permissions,
    user_preferences,
    user_reminder_notifications_enabled,
    web_scheduler_enabled,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        first_name: first_name,
        last_name: last_name,
        title: title,
        suffix: suffix,
        npi: npi,
        photo: photo,
        signature: signature,
        noah_username: noah_username,
        noah_password: noah_password,
        role: role,
        color: color,
        scheduler_select_all_staff: scheduler_select_all_staff,
        date_joined: date_joined,
        last_login: last_login,
        user_permissions: user_permissions,
        license_number: license_number,
        touchpoint_notifications_enabled: touchpoint_notifications_enabled,
        payment_request_notifications_enabled:
          payment_request_notifications_enabled,
        task_is_assigned_notifications_enabled:
          task_is_assigned_notifications_enabled,
        onboarding_form_notifications_enabled:
          onboarding_form_notifications_enabled,
        sendbird_chat_enabled: sendbird_chat_enabled,
        patient_arrived_sound_enabled: patient_arrived_sound_enabled,
        user_preferences: user_preferences,
        user_reminder_notifications_enabled:
          user_reminder_notifications_enabled,
        scheduler_persist_per_clinic: scheduler_persist_per_clinic,
        sync_with_google_calendar: sync_with_google_calendar,
        web_scheduler_enabled: web_scheduler_enabled,
        chat_sound_notification: chat_sound_notification,
        can_see_manufacturer_cost: can_see_manufacturer_cost,
        comms_api_key: comms_api_key,
        podium_id: podium_id,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$auth$users$$id$$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPATCH$api$auth$users$$id$$PATCH', args],
    () => pATCH$api$auth$users$$id$$PATCH(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$auth$users$$id$$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$chartNotes$$id$$PATCH = async (
  Constants,
  {
    appointment,
    clinic,
    created_by,
    icd10_codes,
    id,
    patient,
    pinned,
    status,
    text,
    type,
    updated_by,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/chart-notes/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        type: type,
        text: text,
        created_by: created_by,
        updated_by: updated_by,
        appointment: appointment,
        patient: patient,
        clinic: clinic,
        status: status,
        icd10_codes: icd10_codes,
        pinned: pinned,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$chartNotes$$id$$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPATCH$api$chartNotes$$id$$PATCH', args],
    () => pATCH$api$chartNotes$$id$$PATCH(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$chartNotes$$id$$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$clinics$$clinicPk$$campaigns$$id$$PATCH = async (
  Constants,
  {
    campaign,
    clinic_pk,
    communication_method,
    created_by,
    end_date,
    id,
    is_active,
    start_date,
    updated_by,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/campaigns/${encodeQueryParam(id)}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        campaign: campaign,
        is_active: is_active,
        start_date: start_date,
        end_date: end_date,
        created_by: created_by,
        updated_by: updated_by,
        communication_method: communication_method,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$clinics$$clinicPk$$campaigns$$id$$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPATCH$api$clinics$$clinicPk$$campaigns$$id$$PATCH',
      args,
    ],
    () =>
      pATCH$api$clinics$$clinicPk$$campaigns$$id$$PATCH(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$clinics$$clinicPk$$campaigns$$id$$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$clinics$$clinicPk$$eDocuments$move$PATCH = async (
  Constants,
  {
    billing_name,
    city,
    clinic_pk,
    closed_date,
    country,
    dba,
    default_appointment_reminder_duration,
    default_assignee,
    display_name,
    ein,
    external_id,
    fax_phone,
    google_place_id,
    intake_form_completion_email_recipients,
    is_active,
    is_emailing_enabled,
    is_messaging_enabled,
    justifi_account_id,
    logo,
    name,
    no_reply_email,
    noah_alias,
    noah_auto_sync,
    noah_provider,
    noah_tenant_id,
    non_npi_id,
    non_npi_id_qualifier,
    npi,
    opened_date,
    phone,
    place_of_service,
    podium_id,
    practice,
    price_tables,
    products,
    quickbooks_realm_id,
    quickbooks_token,
    region,
    review_link,
    scheduling_staff_availability,
    sms_phone,
    state,
    street_address_1,
    street_address_2,
    tilled_account_id,
    timezone,
    type,
    users,
    web_scheduler_email_recipient,
    web_scheduler_email_recipients,
    web_scheduling_staff_selection,
    zip_code,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/e-documents/move/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        name: name,
        display_name: display_name,
        timezone: timezone,
        practice: practice,
        ein: ein,
        npi: npi,
        non_npi_id: non_npi_id,
        non_npi_id_qualifier: non_npi_id_qualifier,
        street_address_1: street_address_1,
        street_address_2: street_address_2,
        city: city,
        state: state,
        country: country,
        zip_code: zip_code,
        phone: phone,
        fax_phone: fax_phone,
        is_messaging_enabled: is_messaging_enabled,
        is_emailing_enabled: is_emailing_enabled,
        default_appointment_reminder_duration:
          default_appointment_reminder_duration,
        tilled_account_id: tilled_account_id,
        google_place_id: google_place_id,
        review_link: review_link,
        justifi_account_id: justifi_account_id,
        noah_provider: noah_provider,
        noah_alias: noah_alias,
        noah_tenant_id: noah_tenant_id,
        scheduling_staff_availability: scheduling_staff_availability,
        web_scheduling_staff_selection: web_scheduling_staff_selection,
        no_reply_email: no_reply_email,
        type: type,
        external_id: external_id,
        dba: dba,
        opened_date: opened_date,
        closed_date: closed_date,
        region: region,
        users: users,
        price_tables: price_tables,
        is_active: is_active,
        sms_phone: sms_phone,
        products: products,
        quickbooks_token: quickbooks_token,
        logo: logo,
        quickbooks_realm_id: quickbooks_realm_id,
        noah_auto_sync: noah_auto_sync,
        web_scheduler_email_recipient: web_scheduler_email_recipient,
        web_scheduler_email_recipients: web_scheduler_email_recipients,
        place_of_service: place_of_service,
        default_assignee: default_assignee,
        billing_name: billing_name,
        intake_form_completion_email_recipients:
          intake_form_completion_email_recipients,
        podium_id: podium_id,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$clinics$$clinicPk$$eDocuments$move$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPATCH$api$clinics$$clinicPk$$eDocuments$move$PATCH',
      args,
    ],
    () =>
      pATCH$api$clinics$$clinicPk$$eDocuments$move$PATCH(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$clinics$$clinicPk$$eDocuments$move$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$clinics$$clinicPk$$messages$$id$$PATCH = async (
  Constants,
  {
    assignee,
    clinic_pk,
    direction,
    external_id,
    id,
    is_read,
    send_message,
    status,
    touchpoint,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/messages/${encodeQueryParam(id)}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        send_message: send_message,
        direction: direction,
        status: status,
        assignee: assignee,
        is_read: is_read,
        external_id: external_id,
        touchpoint: touchpoint,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$clinics$$clinicPk$$messages$$id$$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPATCH$api$clinics$$clinicPk$$messages$$id$$PATCH',
      args,
    ],
    () =>
      pATCH$api$clinics$$clinicPk$$messages$$id$$PATCH(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$clinics$$clinicPk$$messages$$id$$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$clinics$$clinicPk$$taxes$$id$$PATCH = async (
  Constants,
  {
    city_rate,
    clinic_pk,
    country_rate,
    description,
    district_rate,
    effective_at,
    expired_at,
    id,
    is_default,
    product_subtype,
    product_type,
    state_rate,
    title,
    total_rate,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/taxes/${encodeQueryParam(id)}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        product_type: product_type,
        product_subtype: product_subtype,
        title: title,
        description: description,
        total_rate: total_rate,
        state_rate: state_rate,
        country_rate: country_rate,
        city_rate: city_rate,
        district_rate: district_rate,
        effective_at: effective_at,
        expired_at: expired_at,
        is_default: is_default,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$clinics$$clinicPk$$taxes$$id$$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPATCH$api$clinics$$clinicPk$$taxes$$id$$PATCH',
      args,
    ],
    () =>
      pATCH$api$clinics$$clinicPk$$taxes$$id$$PATCH(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$clinics$$clinicPk$$taxes$$id$$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$clinics$$id$$PATCH = async (
  Constants,
  {
    billing_name,
    city,
    closed_date,
    country,
    dba,
    default_appointment_reminder_duration,
    default_assignee,
    display_name,
    ein,
    external_id,
    fax_phone,
    google_place_id,
    id,
    intake_form_completion_email_recipients,
    is_active,
    is_emailing_enabled,
    is_messaging_enabled,
    justifi_account_id,
    logo,
    name,
    no_reply_email,
    noah_alias,
    noah_auto_sync,
    noah_provider,
    noah_tenant_id,
    non_npi_id,
    non_npi_id_qualifier,
    npi,
    opened_date,
    phone,
    place_of_service,
    podium_id,
    practice,
    price_tables,
    products,
    quickbooks_realm_id,
    quickbooks_token,
    region,
    review_link,
    scheduling_staff_availability,
    sms_phone,
    state,
    street_address_1,
    street_address_2,
    tilled_account_id,
    timezone,
    type,
    users,
    web_scheduler_email_recipient,
    web_scheduler_email_recipients,
    web_scheduling_staff_selection,
    zip_code,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(id)}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        name: name,
        display_name: display_name,
        timezone: timezone,
        practice: practice,
        ein: ein,
        npi: npi,
        non_npi_id: non_npi_id,
        non_npi_id_qualifier: non_npi_id_qualifier,
        street_address_1: street_address_1,
        street_address_2: street_address_2,
        city: city,
        state: state,
        country: country,
        zip_code: zip_code,
        phone: phone,
        fax_phone: fax_phone,
        is_messaging_enabled: is_messaging_enabled,
        is_emailing_enabled: is_emailing_enabled,
        default_appointment_reminder_duration:
          default_appointment_reminder_duration,
        tilled_account_id: tilled_account_id,
        google_place_id: google_place_id,
        review_link: review_link,
        justifi_account_id: justifi_account_id,
        noah_provider: noah_provider,
        noah_alias: noah_alias,
        noah_tenant_id: noah_tenant_id,
        scheduling_staff_availability: scheduling_staff_availability,
        web_scheduling_staff_selection: web_scheduling_staff_selection,
        no_reply_email: no_reply_email,
        type: type,
        external_id: external_id,
        dba: dba,
        opened_date: opened_date,
        closed_date: closed_date,
        region: region,
        users: users,
        price_tables: price_tables,
        is_active: is_active,
        sms_phone: sms_phone,
        products: products,
        quickbooks_token: quickbooks_token,
        logo: logo,
        quickbooks_realm_id: quickbooks_realm_id,
        noah_auto_sync: noah_auto_sync,
        web_scheduler_email_recipient: web_scheduler_email_recipient,
        web_scheduler_email_recipients: web_scheduler_email_recipients,
        place_of_service: place_of_service,
        default_assignee: default_assignee,
        billing_name: billing_name,
        intake_form_completion_email_recipients:
          intake_form_completion_email_recipients,
        podium_id: podium_id,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$clinics$$id$$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPATCH$api$clinics$$id$$PATCH', args],
    () => pATCH$api$clinics$$id$$PATCH(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$clinics$$id$$PATCHES',
        ]),
    }
  );
};

export const pATCH$api$credits$$id$$PATCH = async (
  Constants,
  {
    amount,
    bank_name,
    card_processing_provider,
    check_number,
    clinic,
    created_by,
    created_via_refund,
    description,
    id,
    justifi_payment_id,
    method,
    patient,
    payer_type,
    payment_date,
    payment_method_id,
    payment_reference,
    save_payment_method,
    tilled_charge_id,
    tilled_payment_intent_id,
    updated_by,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/credits/${encodeQueryParam(id)}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        created_by: created_by,
        updated_by: updated_by,
        patient: patient,
        payment_date: payment_date,
        payer_type: payer_type,
        amount: amount,
        description: description,
        method: method,
        bank_name: bank_name,
        check_number: check_number,
        tilled_payment_intent_id: tilled_payment_intent_id,
        tilled_charge_id: tilled_charge_id,
        justifi_payment_id: justifi_payment_id,
        card_processing_provider: card_processing_provider,
        created_via_refund: created_via_refund,
        payment_reference: payment_reference,
        save_payment_method: save_payment_method,
        payment_method_id: payment_method_id,
        clinic: clinic,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PATCH',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePATCH$api$credits$$id$$PATCH = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPATCH$api$credits$$id$$PATCH', args],
    () => pATCH$api$credits$$id$$PATCH(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPATCH$api$credits$$id$$PATCHES',
        ]),
    }
  );
};

export const pOST$api$adjustments$POST = async (
  Constants,
  {
    adjustment_date,
    amount,
    created_by,
    description,
    external_id,
    format,
    insurance_policy,
    managed_care_plan,
    payer_type,
    sale,
    sale_item,
    type,
    updated_by,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  const url = `${Constants.API_BASE_URL}/adjustments/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        created_by: created_by,
        updated_by: updated_by,
        sale: sale,
        sale_item: sale_item,
        payer_type: payer_type,
        adjustment_date: adjustment_date,
        amount: amount,
        description: description,
        external_id: external_id,
        managed_care_plan: managed_care_plan,
        insurance_policy: insurance_policy,
        type: type,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$adjustments$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$adjustments$POST', args],
    () => pOST$api$adjustments$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$adjustments$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$adjustments$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  adjustment_date,
  amount,
  created_by,
  description,
  external_id,
  format,
  insurance_policy,
  managed_care_plan,
  payer_type,
  sale,
  sale_item,
  type,
  updated_by,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$adjustments$POST(
    {
      adjustment_date,
      amount,
      created_by,
      description,
      external_id,
      format,
      insurance_policy,
      managed_care_plan,
      payer_type,
      sale,
      sale_item,
      type,
      updated_by,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$adjustments$: refetch,
  });
};

export const pOST$api$adjustments$$id$$sync$POST = async (
  Constants,
  { format, id },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  const url = `${Constants.API_BASE_URL}/adjustments/${encodeQueryParam(
    id
  )}/sync/${renderQueryString(paramsDict)}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$adjustments$$id$$sync$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$adjustments$$id$$sync$POST', args],
    () =>
      pOST$api$adjustments$$id$$sync$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$adjustments$$id$$sync$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$adjustments$$id$$sync$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  format,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$adjustments$$id$$sync$POST(
    { format, id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$adjustments$$id$$sync$: refetch,
  });
};

export const pOST$api$appointmentOutcomeReasons$POST = async (
  Constants,
  { name, outcome },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/appointment-outcome-reasons/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({ name: name, outcome: outcome }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$appointmentOutcomeReasons$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPOST$api$appointmentOutcomeReasons$POST',
      args,
    ],
    () =>
      pOST$api$appointmentOutcomeReasons$POST(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$appointmentOutcomeReasons$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$appointmentOutcomeReasons$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  name,
  outcome,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$appointmentOutcomeReasons$POST(
    { name, outcome },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$appointmentOutcomeReasons$: refetch,
  });
};

export const pOST$api$appointmentTypes$POST = async (
  Constants,
  _args,
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/appointment-types/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$appointmentTypes$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$appointmentTypes$POST', args],
    () => pOST$api$appointmentTypes$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$appointmentTypes$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$appointmentTypes$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$appointmentTypes$POST(
    {},
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$appointmentTypes$: refetch,
  });
};

export const pOST$api$appointments$POST = async (
  Constants,
  {
    allow_overlap,
    assigned_tags,
    clinic,
    companion_name,
    companion_present,
    companion_type,
    created_by,
    diagnosis,
    end_moment,
    extra,
    format,
    google_review_feedback_request,
    hearing_test_conducted,
    intake_form_request,
    is_opportunity,
    needs_reschedule,
    notes,
    notification_method,
    outcome,
    outcome_notes,
    outcome_reason,
    patient,
    physician_referral,
    private_feedback_submission_date,
    private_textual_feedback_request,
    private_textual_feedback_response,
    referral_source,
    referring_physician,
    rescheduled_appointment_id,
    room,
    schedule,
    should_create_intake_form_request,
    should_create_schedule_for_staff,
    should_notify,
    staff_member,
    start_moment,
    start_recurrence_id,
    status,
    sub_referral_source,
    sub_referral_source_content_type,
    sub_referral_source_object_id,
    telehealth_provider,
    title,
    type,
    updated_by,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  const url = `${Constants.API_BASE_URL}/appointments/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        created_by: created_by,
        updated_by: updated_by,
        title: title,
        referral_source: referral_source,
        sub_referral_source: sub_referral_source,
        patient: patient,
        type: type,
        staff_member: staff_member,
        start_moment: start_moment,
        end_moment: end_moment,
        room: room,
        physician_referral: physician_referral,
        companion_type: companion_type,
        companion_name: companion_name,
        notes: notes,
        status: status,
        notification_method: notification_method,
        should_notify: should_notify,
        private_textual_feedback_request: private_textual_feedback_request,
        private_textual_feedback_response: private_textual_feedback_response,
        google_review_feedback_request: google_review_feedback_request,
        is_opportunity: is_opportunity,
        outcome: outcome,
        outcome_reason: outcome_reason,
        outcome_notes: outcome_notes,
        should_create_schedule_for_staff: should_create_schedule_for_staff,
        allow_overlap: allow_overlap,
        clinic: clinic,
        extra: extra,
        referring_physician: referring_physician,
        assigned_tags: assigned_tags,
        sub_referral_source_content_type: sub_referral_source_content_type,
        sub_referral_source_object_id: sub_referral_source_object_id,
        should_create_intake_form_request: should_create_intake_form_request,
        intake_form_request: intake_form_request,
        diagnosis: diagnosis,
        hearing_test_conducted: hearing_test_conducted,
        rescheduled_appointment_id: rescheduled_appointment_id,
        companion_present: companion_present,
        telehealth_provider: telehealth_provider,
        needs_reschedule: needs_reschedule,
        private_feedback_submission_date: private_feedback_submission_date,
        schedule: schedule,
        start_recurrence_id: start_recurrence_id,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$appointments$POST = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      pOST$api$appointments$POST(
        Constants,
        { ...initialArgs, ...args },
        handlers
      ),
    {
      onError: (err, variables, { previousValue }) => {
        if (previousValue) {
          return queryClient.setQueryData('appointments', previousValue);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries('appointment');
        queryClient.invalidateQueries('appointments');
      },
    }
  );
};

export const FetchPOST$api$appointments$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  allow_overlap,
  assigned_tags,
  clinic,
  companion_name,
  companion_present,
  companion_type,
  created_by,
  diagnosis,
  end_moment,
  extra,
  format,
  google_review_feedback_request,
  hearing_test_conducted,
  intake_form_request,
  is_opportunity,
  needs_reschedule,
  notes,
  notification_method,
  outcome,
  outcome_notes,
  outcome_reason,
  patient,
  physician_referral,
  private_feedback_submission_date,
  private_textual_feedback_request,
  private_textual_feedback_response,
  referral_source,
  referring_physician,
  rescheduled_appointment_id,
  room,
  schedule,
  should_create_intake_form_request,
  should_create_schedule_for_staff,
  should_notify,
  staff_member,
  start_moment,
  start_recurrence_id,
  status,
  sub_referral_source,
  sub_referral_source_content_type,
  sub_referral_source_object_id,
  telehealth_provider,
  title,
  type,
  updated_by,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    mutate: refetch,
  } = usePOST$api$appointments$POST(
    {
      allow_overlap,
      assigned_tags,
      clinic,
      companion_name,
      companion_present,
      companion_type,
      created_by,
      diagnosis,
      end_moment,
      extra,
      format,
      google_review_feedback_request,
      hearing_test_conducted,
      intake_form_request,
      is_opportunity,
      needs_reschedule,
      notes,
      notification_method,
      outcome,
      outcome_notes,
      outcome_reason,
      patient,
      physician_referral,
      private_feedback_submission_date,
      private_textual_feedback_request,
      private_textual_feedback_response,
      referral_source,
      referring_physician,
      rescheduled_appointment_id,
      room,
      schedule,
      should_create_intake_form_request,
      should_create_schedule_for_staff,
      should_notify,
      staff_member,
      start_moment,
      start_recurrence_id,
      status,
      sub_referral_source,
      sub_referral_source_content_type,
      sub_referral_source_object_id,
      telehealth_provider,
      title,
      type,
      updated_by,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$appointments$: refetch,
  });
};

export const pOST$api$appointments$googleCalendar$sync$POST = async (
  Constants,
  {
    allow_overlap,
    assigned_tags,
    clinic,
    companion_name,
    companion_present,
    companion_type,
    created_by,
    diagnosis,
    end_moment,
    extra,
    format,
    google_review_feedback_request,
    hearing_test_conducted,
    intake_form_request,
    is_opportunity,
    needs_reschedule,
    notes,
    notification_method,
    outcome,
    outcome_notes,
    outcome_reason,
    patient,
    physician_referral,
    private_feedback_submission_date,
    private_textual_feedback_request,
    private_textual_feedback_response,
    referral_source,
    referring_physician,
    rescheduled_appointment_id,
    room,
    schedule,
    should_create_intake_form_request,
    should_create_schedule_for_staff,
    should_notify,
    staff_member,
    start_moment,
    start_recurrence_id,
    status,
    sub_referral_source,
    sub_referral_source_content_type,
    sub_referral_source_object_id,
    telehealth_provider,
    title,
    type,
    updated_by,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (format !== undefined) {
    paramsDict['format'] = renderParam(format);
  }
  const url = `${Constants.API_BASE_URL}/appointments/google-calendar/sync/${renderQueryString(
    paramsDict
  )}`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        created_by: created_by,
        updated_by: updated_by,
        title: title,
        referral_source: referral_source,
        sub_referral_source: sub_referral_source,
        patient: patient,
        type: type,
        staff_member: staff_member,
        start_moment: start_moment,
        end_moment: end_moment,
        room: room,
        physician_referral: physician_referral,
        companion_type: companion_type,
        companion_name: companion_name,
        notes: notes,
        status: status,
        notification_method: notification_method,
        should_notify: should_notify,
        private_textual_feedback_request: private_textual_feedback_request,
        private_textual_feedback_response: private_textual_feedback_response,
        google_review_feedback_request: google_review_feedback_request,
        is_opportunity: is_opportunity,
        outcome: outcome,
        outcome_reason: outcome_reason,
        outcome_notes: outcome_notes,
        should_create_schedule_for_staff: should_create_schedule_for_staff,
        allow_overlap: allow_overlap,
        clinic: clinic,
        extra: extra,
        referring_physician: referring_physician,
        assigned_tags: assigned_tags,
        sub_referral_source_content_type: sub_referral_source_content_type,
        sub_referral_source_object_id: sub_referral_source_object_id,
        should_create_intake_form_request: should_create_intake_form_request,
        intake_form_request: intake_form_request,
        diagnosis: diagnosis,
        hearing_test_conducted: hearing_test_conducted,
        rescheduled_appointment_id: rescheduled_appointment_id,
        companion_present: companion_present,
        telehealth_provider: telehealth_provider,
        needs_reschedule: needs_reschedule,
        private_feedback_submission_date: private_feedback_submission_date,
        schedule: schedule,
        start_recurrence_id: start_recurrence_id,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$appointments$googleCalendar$sync$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPOST$api$appointments$googleCalendar$sync$POST',
      args,
    ],
    () =>
      pOST$api$appointments$googleCalendar$sync$POST(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$appointments$googleCalendar$sync$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$appointments$googleCalendar$sync$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  allow_overlap,
  assigned_tags,
  clinic,
  companion_name,
  companion_present,
  companion_type,
  created_by,
  diagnosis,
  end_moment,
  extra,
  format,
  google_review_feedback_request,
  hearing_test_conducted,
  intake_form_request,
  is_opportunity,
  needs_reschedule,
  notes,
  notification_method,
  outcome,
  outcome_notes,
  outcome_reason,
  patient,
  physician_referral,
  private_feedback_submission_date,
  private_textual_feedback_request,
  private_textual_feedback_response,
  referral_source,
  referring_physician,
  rescheduled_appointment_id,
  room,
  schedule,
  should_create_intake_form_request,
  should_create_schedule_for_staff,
  should_notify,
  staff_member,
  start_moment,
  start_recurrence_id,
  status,
  sub_referral_source,
  sub_referral_source_content_type,
  sub_referral_source_object_id,
  telehealth_provider,
  title,
  type,
  updated_by,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$appointments$googleCalendar$sync$POST(
    {
      allow_overlap,
      assigned_tags,
      clinic,
      companion_name,
      companion_present,
      companion_type,
      created_by,
      diagnosis,
      end_moment,
      extra,
      format,
      google_review_feedback_request,
      hearing_test_conducted,
      intake_form_request,
      is_opportunity,
      needs_reschedule,
      notes,
      notification_method,
      outcome,
      outcome_notes,
      outcome_reason,
      patient,
      physician_referral,
      private_feedback_submission_date,
      private_textual_feedback_request,
      private_textual_feedback_response,
      referral_source,
      referring_physician,
      rescheduled_appointment_id,
      room,
      schedule,
      should_create_intake_form_request,
      should_create_schedule_for_staff,
      should_notify,
      staff_member,
      start_moment,
      start_recurrence_id,
      status,
      sub_referral_source,
      sub_referral_source_content_type,
      sub_referral_source_object_id,
      telehealth_provider,
      title,
      type,
      updated_by,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$appointments$googleCalendar$sync$: refetch,
  });
};

export const pOST$api$assignedTags$POST = async (
  Constants,
  { description, expires_at, object_id, tag },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/assigned-tags/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        tag: tag,
        description: description,
        object_id: object_id,
        expires_at: expires_at,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$assignedTags$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$assignedTags$POST', args],
    () => pOST$api$assignedTags$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$assignedTags$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$assignedTags$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  description,
  expires_at,
  object_id,
  tag,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$assignedTags$POST(
    { description, expires_at, object_id, tag },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$assignedTags$: refetch,
  });
};

export const pOST$api$audioTranscription$POST = async (
  Constants,
  _args,
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/audio-transcription/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$audioTranscription$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$audioTranscription$POST', args],
    () => pOST$api$audioTranscription$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$audioTranscription$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$audioTranscription$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$audioTranscription$POST(
    {},
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$audioTranscription$: refetch,
  });
};

export const pOST$api$audiometerConfiguration$POST = async (
  Constants,
  { audiometer, calibration_date, clinic, is_active, serial_number, title },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/audiometer-configuration/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        audiometer: audiometer,
        clinic: clinic,
        calibration_date: calibration_date,
        serial_number: serial_number,
        title: title,
        is_active: is_active,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$audiometerConfiguration$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$audiometerConfiguration$POST', args],
    () =>
      pOST$api$audiometerConfiguration$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$audiometerConfiguration$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$audiometerConfiguration$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  audiometer,
  calibration_date,
  clinic,
  is_active,
  serial_number,
  title,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$audiometerConfiguration$POST(
    { audiometer, calibration_date, clinic, is_active, serial_number, title },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$audiometerConfiguration$: refetch,
  });
};

export const pOST$api$audiometers$POST = async (
  Constants,
  { name },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/audiometers/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({ name: name }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$audiometers$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$audiometers$POST', args],
    () => pOST$api$audiometers$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$audiometers$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$audiometers$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  name,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$audiometers$POST(
    { name },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$audiometers$: refetch,
  });
};

export const pOST$api$auth$jwt$create$POST = async (
  Constants,
  { email, password },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/jwt/create/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({ email: email, password: password }),
      headers: cleanHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$auth$jwt$create$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$auth$jwt$create$POST', args],
    () => pOST$api$auth$jwt$create$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$auth$jwt$create$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$auth$jwt$create$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  email,
  password,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$auth$jwt$create$POST(
    { email, password },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$auth$jwt$create$: refetch,
  });
};

export const pOST$api$auth$jwt$refresh$POST = async (
  Constants,
  _args,
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/jwt/refresh/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$auth$jwt$refresh$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$auth$jwt$refresh$POST', args],
    () => pOST$api$auth$jwt$refresh$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$auth$jwt$refresh$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$auth$jwt$refresh$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$auth$jwt$refresh$POST(
    {},
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$auth$jwt$refresh$: refetch,
  });
};

export const pOST$api$auth$jwt$verify$POST = async (
  Constants,
  { token },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/jwt/verify/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({ token: token }),
      headers: cleanHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$auth$jwt$verify$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$auth$jwt$verify$POST', args],
    () => pOST$api$auth$jwt$verify$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$auth$jwt$verify$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$auth$jwt$verify$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  token,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$auth$jwt$verify$POST(
    { token },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$auth$jwt$verify$: refetch,
  });
};

export const pOST$api$auth$token$login$POST = async (
  Constants,
  { email, password },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/token/login/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({ password: password, email: email }),
      headers: cleanHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$auth$token$login$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$auth$token$login$POST', args],
    () => pOST$api$auth$token$login$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$auth$token$login$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$auth$token$login$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  email,
  password,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    mutate: refetch,
  } = usePOST$api$auth$token$login$POST(
    { email, password },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$auth$token$login$: refetch,
  });
};

export const pOST$api$auth$token$logout$POST = async (
  Constants,
  _args,
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/token/logout/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$auth$token$logout$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$auth$token$logout$POST', args],
    () => pOST$api$auth$token$logout$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$auth$token$logout$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$auth$token$logout$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$auth$token$logout$POST(
    {},
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$auth$token$logout$: refetch,
  });
};

export const pOST$api$auth$users$POST = async (
  Constants,
  { email, first_name, last_name, password },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: password,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$auth$users$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$auth$users$POST', args],
    () => pOST$api$auth$users$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$auth$users$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$auth$users$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  email,
  first_name,
  last_name,
  password,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$auth$users$POST(
    { email, first_name, last_name, password },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$auth$users$: refetch,
  });
};

export const pOST$api$auth$users$activation$POST = async (
  Constants,
  { new_password, token, uid },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/activation/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        uid: uid,
        token: token,
        new_password: new_password,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$auth$users$activation$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$auth$users$activation$POST', args],
    () =>
      pOST$api$auth$users$activation$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$auth$users$activation$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$auth$users$activation$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  new_password,
  token,
  uid,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$auth$users$activation$POST(
    { new_password, token, uid },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$auth$users$activation$: refetch,
  });
};

export const pOST$api$auth$users$resendActivation$POST = async (
  Constants,
  { email },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/resend_activation/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({ email: email }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$auth$users$resendActivation$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPOST$api$auth$users$resendActivation$POST',
      args,
    ],
    () =>
      pOST$api$auth$users$resendActivation$POST(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$auth$users$resendActivation$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$auth$users$resendActivation$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  email,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$auth$users$resendActivation$POST(
    { email },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$auth$users$resendActivation$: refetch,
  });
};

export const pOST$api$auth$users$resetEmail$POST = async (
  Constants,
  { email },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/reset_email/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({ email: email }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$auth$users$resetEmail$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$auth$users$resetEmail$POST', args],
    () =>
      pOST$api$auth$users$resetEmail$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$auth$users$resetEmail$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$auth$users$resetEmail$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  email,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$auth$users$resetEmail$POST(
    { email },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$auth$users$resetEmail$: refetch,
  });
};

export const pOST$api$auth$users$resetEmailConfirm$POST = async (
  Constants,
  { new_email },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/reset_email_confirm/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({ new_email: new_email }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$auth$users$resetEmailConfirm$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPOST$api$auth$users$resetEmailConfirm$POST',
      args,
    ],
    () =>
      pOST$api$auth$users$resetEmailConfirm$POST(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$auth$users$resetEmailConfirm$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$auth$users$resetEmailConfirm$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  new_email,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$auth$users$resetEmailConfirm$POST(
    { new_email },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$auth$users$resetEmailConfirm$: refetch,
  });
};

export const pOST$api$auth$users$resetPassword$POST = async (
  Constants,
  { email },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/reset_password/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({ email: email }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$auth$users$resetPassword$POST = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      pOST$api$auth$users$resetPassword$POST(
        Constants,
        { ...initialArgs, ...args },
        handlers
      ),
    {
      onError: (err, variables, { previousValue }) => {
        if (previousValue) {
          return queryClient.setQueryData('Post', previousValue);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries('Post');
        queryClient.invalidateQueries('Posts');
      },
    }
  );
};

export const FetchPOST$api$auth$users$resetPassword$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  email,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    mutate: refetch,
  } = usePOST$api$auth$users$resetPassword$POST(
    { email },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$auth$users$resetPassword$: refetch,
  });
};

export const pOST$api$auth$users$resetPasswordConfirm$POST = async (
  Constants,
  { new_password, token, uid },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/reset_password_confirm/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        uid: uid,
        token: token,
        new_password: new_password,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$auth$users$resetPasswordConfirm$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPOST$api$auth$users$resetPasswordConfirm$POST',
      args,
    ],
    () =>
      pOST$api$auth$users$resetPasswordConfirm$POST(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$auth$users$resetPasswordConfirm$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$auth$users$resetPasswordConfirm$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  new_password,
  token,
  uid,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$auth$users$resetPasswordConfirm$POST(
    { new_password, token, uid },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$auth$users$resetPasswordConfirm$: refetch,
  });
};

export const pOST$api$auth$users$setEmail$POST = async (
  Constants,
  { current_password, new_email },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/set_email/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        current_password: current_password,
        new_email: new_email,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$auth$users$setEmail$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$auth$users$setEmail$POST', args],
    () => pOST$api$auth$users$setEmail$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$auth$users$setEmail$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$auth$users$setEmail$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  current_password,
  new_email,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$auth$users$setEmail$POST(
    { current_password, new_email },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$auth$users$setEmail$: refetch,
  });
};

export const pOST$api$auth$users$setPassword$POST = async (
  Constants,
  { current_password, new_password },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/set_password/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        new_password: new_password,
        current_password: current_password,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$auth$users$setPassword$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$auth$users$setPassword$POST', args],
    () =>
      pOST$api$auth$users$setPassword$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$auth$users$setPassword$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$auth$users$setPassword$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  current_password,
  new_password,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$auth$users$setPassword$POST(
    { current_password, new_password },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$auth$users$setPassword$: refetch,
  });
};

export const pOST$api$chartNotes$POST = async (
  Constants,
  {
    appointment,
    clinic,
    created_by,
    icd10_codes,
    patient,
    pinned,
    status,
    text,
    type,
    updated_by,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/chart-notes/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        type: type,
        text: text,
        created_by: created_by,
        updated_by: updated_by,
        appointment: appointment,
        patient: patient,
        clinic: clinic,
        status: status,
        icd10_codes: icd10_codes,
        pinned: pinned,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$chartNotes$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$chartNotes$POST', args],
    () => pOST$api$chartNotes$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$chartNotes$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$chartNotes$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  appointment,
  clinic,
  created_by,
  icd10_codes,
  patient,
  pinned,
  status,
  text,
  type,
  updated_by,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$chartNotes$POST(
    {
      appointment,
      clinic,
      created_by,
      icd10_codes,
      patient,
      pinned,
      status,
      text,
      type,
      updated_by,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$chartNotes$: refetch,
  });
};

export const pOST$api$chartNotes$bulkPin$POST = async (
  Constants,
  {
    appointment,
    clinic,
    created_by,
    icd10_codes,
    patient,
    pinned,
    status,
    text,
    type,
    updated_by,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/chart-notes/bulk-pin/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        type: type,
        text: text,
        created_by: created_by,
        updated_by: updated_by,
        appointment: appointment,
        patient: patient,
        clinic: clinic,
        status: status,
        icd10_codes: icd10_codes,
        pinned: pinned,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$chartNotes$bulkPin$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$chartNotes$bulkPin$POST', args],
    () => pOST$api$chartNotes$bulkPin$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$chartNotes$bulkPin$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$chartNotes$bulkPin$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  appointment,
  clinic,
  created_by,
  icd10_codes,
  patient,
  pinned,
  status,
  text,
  type,
  updated_by,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$chartNotes$bulkPin$POST(
    {
      appointment,
      clinic,
      created_by,
      icd10_codes,
      patient,
      pinned,
      status,
      text,
      type,
      updated_by,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$chartNotes$bulkPin$: refetch,
  });
};

export const pOST$api$chartNotes$$chartNotePk$$completePOST = async (
  Constants,
  { chart_note_pk },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/chart-notes/${encodeQueryParam(
    chart_note_pk
  )}/complete`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$chartNotes$$chartNotePk$$completePOST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPOST$api$chartNotes$$chartNotePk$$completePOST',
      args,
    ],
    () =>
      pOST$api$chartNotes$$chartNotePk$$completePOST(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$chartNotes$$chartNotePk$$completePOSTS',
        ]),
    }
  );
};

export const FetchPOST$api$chartNotes$$chartNotePk$$completePOST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  chart_note_pk,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$chartNotes$$chartNotePk$$completePOST(
    { chart_note_pk },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$chartNotes$$chartNotePk$$complete: refetch,
  });
};

export const pOST$api$clinics$POST = async (
  Constants,
  {
    billing_name,
    city,
    closed_date,
    country,
    dba,
    default_appointment_reminder_duration,
    default_assignee,
    display_name,
    ein,
    external_id,
    fax_phone,
    google_place_id,
    intake_form_completion_email_recipients,
    is_active,
    is_emailing_enabled,
    is_messaging_enabled,
    justifi_account_id,
    logo,
    name,
    no_reply_email,
    noah_alias,
    noah_auto_sync,
    noah_provider,
    noah_tenant_id,
    non_npi_id,
    non_npi_id_qualifier,
    npi,
    opened_date,
    phone,
    place_of_service,
    podium_id,
    practice,
    price_tables,
    products,
    quickbooks_realm_id,
    quickbooks_token,
    region,
    review_link,
    scheduling_staff_availability,
    sms_phone,
    state,
    street_address_1,
    street_address_2,
    tilled_account_id,
    timezone,
    type,
    users,
    web_scheduler_email_recipient,
    web_scheduler_email_recipients,
    web_scheduling_staff_selection,
    zip_code,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        name: name,
        display_name: display_name,
        timezone: timezone,
        practice: practice,
        ein: ein,
        npi: npi,
        non_npi_id: non_npi_id,
        non_npi_id_qualifier: non_npi_id_qualifier,
        street_address_1: street_address_1,
        street_address_2: street_address_2,
        city: city,
        state: state,
        country: country,
        zip_code: zip_code,
        phone: phone,
        fax_phone: fax_phone,
        is_messaging_enabled: is_messaging_enabled,
        is_emailing_enabled: is_emailing_enabled,
        default_appointment_reminder_duration:
          default_appointment_reminder_duration,
        tilled_account_id: tilled_account_id,
        google_place_id: google_place_id,
        review_link: review_link,
        justifi_account_id: justifi_account_id,
        noah_provider: noah_provider,
        noah_alias: noah_alias,
        noah_tenant_id: noah_tenant_id,
        scheduling_staff_availability: scheduling_staff_availability,
        web_scheduling_staff_selection: web_scheduling_staff_selection,
        no_reply_email: no_reply_email,
        type: type,
        external_id: external_id,
        dba: dba,
        opened_date: opened_date,
        closed_date: closed_date,
        region: region,
        users: users,
        price_tables: price_tables,
        is_active: is_active,
        sms_phone: sms_phone,
        products: products,
        quickbooks_token: quickbooks_token,
        logo: logo,
        quickbooks_realm_id: quickbooks_realm_id,
        noah_auto_sync: noah_auto_sync,
        web_scheduler_email_recipient: web_scheduler_email_recipient,
        web_scheduler_email_recipients: web_scheduler_email_recipients,
        place_of_service: place_of_service,
        default_assignee: default_assignee,
        billing_name: billing_name,
        intake_form_completion_email_recipients:
          intake_form_completion_email_recipients,
        podium_id: podium_id,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$clinics$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$clinics$POST', args],
    () => pOST$api$clinics$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$clinics$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$clinics$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  billing_name,
  city,
  closed_date,
  country,
  dba,
  default_appointment_reminder_duration,
  default_assignee,
  display_name,
  ein,
  external_id,
  fax_phone,
  google_place_id,
  intake_form_completion_email_recipients,
  is_active,
  is_emailing_enabled,
  is_messaging_enabled,
  justifi_account_id,
  logo,
  name,
  no_reply_email,
  noah_alias,
  noah_auto_sync,
  noah_provider,
  noah_tenant_id,
  non_npi_id,
  non_npi_id_qualifier,
  npi,
  opened_date,
  phone,
  place_of_service,
  podium_id,
  practice,
  price_tables,
  products,
  quickbooks_realm_id,
  quickbooks_token,
  region,
  review_link,
  scheduling_staff_availability,
  sms_phone,
  state,
  street_address_1,
  street_address_2,
  tilled_account_id,
  timezone,
  type,
  users,
  web_scheduler_email_recipient,
  web_scheduler_email_recipients,
  web_scheduling_staff_selection,
  zip_code,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$clinics$POST(
    {
      billing_name,
      city,
      closed_date,
      country,
      dba,
      default_appointment_reminder_duration,
      default_assignee,
      display_name,
      ein,
      external_id,
      fax_phone,
      google_place_id,
      intake_form_completion_email_recipients,
      is_active,
      is_emailing_enabled,
      is_messaging_enabled,
      justifi_account_id,
      logo,
      name,
      no_reply_email,
      noah_alias,
      noah_auto_sync,
      noah_provider,
      noah_tenant_id,
      non_npi_id,
      non_npi_id_qualifier,
      npi,
      opened_date,
      phone,
      place_of_service,
      podium_id,
      practice,
      price_tables,
      products,
      quickbooks_realm_id,
      quickbooks_token,
      region,
      review_link,
      scheduling_staff_availability,
      sms_phone,
      state,
      street_address_1,
      street_address_2,
      tilled_account_id,
      timezone,
      type,
      users,
      web_scheduler_email_recipient,
      web_scheduler_email_recipients,
      web_scheduling_staff_selection,
      zip_code,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({ loading, data, error, refetchPOST$api$clinics$: refetch });
};

export const pOST$api$clinics$$clinicPk$$campaigns$POST = async (
  Constants,
  {
    campaign,
    clinic_pk,
    communication_method,
    created_by,
    end_date,
    is_active,
    start_date,
    updated_by,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/campaigns/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        campaign: campaign,
        is_active: is_active,
        start_date: start_date,
        end_date: end_date,
        created_by: created_by,
        updated_by: updated_by,
        communication_method: communication_method,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$clinics$$clinicPk$$campaigns$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPOST$api$clinics$$clinicPk$$campaigns$POST',
      args,
    ],
    () =>
      pOST$api$clinics$$clinicPk$$campaigns$POST(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$clinics$$clinicPk$$campaigns$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$clinics$$clinicPk$$campaigns$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  campaign,
  clinic_pk,
  communication_method,
  created_by,
  end_date,
  is_active,
  start_date,
  updated_by,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$clinics$$clinicPk$$campaigns$POST(
    {
      campaign,
      clinic_pk,
      communication_method,
      created_by,
      end_date,
      is_active,
      start_date,
      updated_by,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$clinics$$clinicPk$$campaigns$: refetch,
  });
};

export const pOST$api$clinics$$clinicPk$$eDocuments$upload$POST = async (
  Constants,
  {
    billing_name,
    city,
    clinic_pk,
    closed_date,
    country,
    dba,
    default_appointment_reminder_duration,
    default_assignee,
    display_name,
    ein,
    external_id,
    fax_phone,
    google_place_id,
    intake_form_completion_email_recipients,
    is_active,
    is_emailing_enabled,
    is_messaging_enabled,
    justifi_account_id,
    logo,
    name,
    no_reply_email,
    noah_alias,
    noah_auto_sync,
    noah_provider,
    noah_tenant_id,
    non_npi_id,
    non_npi_id_qualifier,
    npi,
    opened_date,
    phone,
    place_of_service,
    podium_id,
    practice,
    price_tables,
    products,
    quickbooks_realm_id,
    quickbooks_token,
    region,
    review_link,
    scheduling_staff_availability,
    sms_phone,
    state,
    street_address_1,
    street_address_2,
    tilled_account_id,
    timezone,
    type,
    users,
    web_scheduler_email_recipient,
    web_scheduler_email_recipients,
    web_scheduling_staff_selection,
    zip_code,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/e-documents/upload/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        name: name,
        display_name: display_name,
        timezone: timezone,
        practice: practice,
        ein: ein,
        npi: npi,
        non_npi_id: non_npi_id,
        non_npi_id_qualifier: non_npi_id_qualifier,
        street_address_1: street_address_1,
        street_address_2: street_address_2,
        city: city,
        state: state,
        country: country,
        zip_code: zip_code,
        phone: phone,
        fax_phone: fax_phone,
        is_messaging_enabled: is_messaging_enabled,
        is_emailing_enabled: is_emailing_enabled,
        default_appointment_reminder_duration:
          default_appointment_reminder_duration,
        tilled_account_id: tilled_account_id,
        google_place_id: google_place_id,
        review_link: review_link,
        justifi_account_id: justifi_account_id,
        noah_provider: noah_provider,
        noah_alias: noah_alias,
        noah_tenant_id: noah_tenant_id,
        scheduling_staff_availability: scheduling_staff_availability,
        web_scheduling_staff_selection: web_scheduling_staff_selection,
        no_reply_email: no_reply_email,
        type: type,
        external_id: external_id,
        dba: dba,
        opened_date: opened_date,
        closed_date: closed_date,
        region: region,
        users: users,
        price_tables: price_tables,
        is_active: is_active,
        sms_phone: sms_phone,
        products: products,
        quickbooks_token: quickbooks_token,
        logo: logo,
        quickbooks_realm_id: quickbooks_realm_id,
        noah_auto_sync: noah_auto_sync,
        web_scheduler_email_recipient: web_scheduler_email_recipient,
        web_scheduler_email_recipients: web_scheduler_email_recipients,
        place_of_service: place_of_service,
        default_assignee: default_assignee,
        billing_name: billing_name,
        intake_form_completion_email_recipients:
          intake_form_completion_email_recipients,
        podium_id: podium_id,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$clinics$$clinicPk$$eDocuments$upload$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPOST$api$clinics$$clinicPk$$eDocuments$upload$POST',
      args,
    ],
    () =>
      pOST$api$clinics$$clinicPk$$eDocuments$upload$POST(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$clinics$$clinicPk$$eDocuments$upload$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$clinics$$clinicPk$$eDocuments$upload$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  billing_name,
  city,
  clinic_pk,
  closed_date,
  country,
  dba,
  default_appointment_reminder_duration,
  default_assignee,
  display_name,
  ein,
  external_id,
  fax_phone,
  google_place_id,
  intake_form_completion_email_recipients,
  is_active,
  is_emailing_enabled,
  is_messaging_enabled,
  justifi_account_id,
  logo,
  name,
  no_reply_email,
  noah_alias,
  noah_auto_sync,
  noah_provider,
  noah_tenant_id,
  non_npi_id,
  non_npi_id_qualifier,
  npi,
  opened_date,
  phone,
  place_of_service,
  podium_id,
  practice,
  price_tables,
  products,
  quickbooks_realm_id,
  quickbooks_token,
  region,
  review_link,
  scheduling_staff_availability,
  sms_phone,
  state,
  street_address_1,
  street_address_2,
  tilled_account_id,
  timezone,
  type,
  users,
  web_scheduler_email_recipient,
  web_scheduler_email_recipients,
  web_scheduling_staff_selection,
  zip_code,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$clinics$$clinicPk$$eDocuments$upload$POST(
    {
      billing_name,
      city,
      clinic_pk,
      closed_date,
      country,
      dba,
      default_appointment_reminder_duration,
      default_assignee,
      display_name,
      ein,
      external_id,
      fax_phone,
      google_place_id,
      intake_form_completion_email_recipients,
      is_active,
      is_emailing_enabled,
      is_messaging_enabled,
      justifi_account_id,
      logo,
      name,
      no_reply_email,
      noah_alias,
      noah_auto_sync,
      noah_provider,
      noah_tenant_id,
      non_npi_id,
      non_npi_id_qualifier,
      npi,
      opened_date,
      phone,
      place_of_service,
      podium_id,
      practice,
      price_tables,
      products,
      quickbooks_realm_id,
      quickbooks_token,
      region,
      review_link,
      scheduling_staff_availability,
      sms_phone,
      state,
      street_address_1,
      street_address_2,
      tilled_account_id,
      timezone,
      type,
      users,
      web_scheduler_email_recipient,
      web_scheduler_email_recipients,
      web_scheduling_staff_selection,
      zip_code,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$clinics$$clinicPk$$eDocuments$upload$: refetch,
  });
};

export const pOST$api$clinics$$clinicPk$$faxes$readAll$POST = async (
  Constants,
  { clinic_pk },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/faxes/read-all/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$clinics$$clinicPk$$faxes$readAll$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPOST$api$clinics$$clinicPk$$faxes$readAll$POST',
      args,
    ],
    () =>
      pOST$api$clinics$$clinicPk$$faxes$readAll$POST(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$clinics$$clinicPk$$faxes$readAll$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$clinics$$clinicPk$$faxes$readAll$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  clinic_pk,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$clinics$$clinicPk$$faxes$readAll$POST(
    { clinic_pk },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$clinics$$clinicPk$$faxes$readAll$: refetch,
  });
};

export const pOST$api$clinics$$clinicPk$$messages$POST = async (
  Constants,
  {
    assignee,
    clinic_pk,
    direction,
    expires_at,
    external_id,
    is_read,
    patient,
    send_message,
    sender,
    status,
    text,
    touchpoint,
    type,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/messages/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        sender: sender,
        patient: patient,
        send_message: send_message,
        direction: direction,
        status: status,
        assignee: assignee,
        is_read: is_read,
        type: type,
        text: text,
        expires_at: expires_at,
        external_id: external_id,
        touchpoint: touchpoint,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$clinics$$clinicPk$$messages$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPOST$api$clinics$$clinicPk$$messages$POST',
      args,
    ],
    () =>
      pOST$api$clinics$$clinicPk$$messages$POST(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$clinics$$clinicPk$$messages$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$clinics$$clinicPk$$messages$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  assignee,
  clinic_pk,
  direction,
  expires_at,
  external_id,
  is_read,
  patient,
  send_message,
  sender,
  status,
  text,
  touchpoint,
  type,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$clinics$$clinicPk$$messages$POST(
    {
      assignee,
      clinic_pk,
      direction,
      expires_at,
      external_id,
      is_read,
      patient,
      send_message,
      sender,
      status,
      text,
      touchpoint,
      type,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$clinics$$clinicPk$$messages$: refetch,
  });
};

export const pOST$api$clinics$$clinicPk$$taxes$POST = async (
  Constants,
  {
    city_rate,
    clinic_pk,
    country_rate,
    description,
    district_rate,
    effective_at,
    expired_at,
    is_default,
    product_subtype,
    product_type,
    state_rate,
    title,
    total_rate,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/taxes/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        product_type: product_type,
        product_subtype: product_subtype,
        title: title,
        description: description,
        total_rate: total_rate,
        state_rate: state_rate,
        country_rate: country_rate,
        city_rate: city_rate,
        district_rate: district_rate,
        effective_at: effective_at,
        expired_at: expired_at,
        is_default: is_default,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$clinics$$clinicPk$$taxes$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$clinics$$clinicPk$$taxes$POST', args],
    () =>
      pOST$api$clinics$$clinicPk$$taxes$POST(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$clinics$$clinicPk$$taxes$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$clinics$$clinicPk$$taxes$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  city_rate,
  clinic_pk,
  country_rate,
  description,
  district_rate,
  effective_at,
  expired_at,
  is_default,
  product_subtype,
  product_type,
  state_rate,
  title,
  total_rate,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$clinics$$clinicPk$$taxes$POST(
    {
      city_rate,
      clinic_pk,
      country_rate,
      description,
      district_rate,
      effective_at,
      expired_at,
      is_default,
      product_subtype,
      product_type,
      state_rate,
      title,
      total_rate,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$clinics$$clinicPk$$taxes$: refetch,
  });
};

export const pOST$api$credits$POST = async (
  Constants,
  {
    amount,
    bank_name,
    card_processing_provider,
    check_number,
    clinic,
    created_by,
    created_via_refund,
    description,
    justifi_payment_id,
    method,
    patient,
    payer_type,
    payment_date,
    payment_method_id,
    payment_reference,
    save_payment_method,
    tilled_charge_id,
    tilled_payment_intent_id,
    updated_by,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/credits/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        created_by: created_by,
        updated_by: updated_by,
        patient: patient,
        payment_date: payment_date,
        payer_type: payer_type,
        amount: amount,
        description: description,
        method: method,
        bank_name: bank_name,
        check_number: check_number,
        tilled_payment_intent_id: tilled_payment_intent_id,
        tilled_charge_id: tilled_charge_id,
        justifi_payment_id: justifi_payment_id,
        card_processing_provider: card_processing_provider,
        created_via_refund: created_via_refund,
        payment_reference: payment_reference,
        save_payment_method: save_payment_method,
        payment_method_id: payment_method_id,
        clinic: clinic,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$credits$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$credits$POST', args],
    () => pOST$api$credits$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$credits$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$credits$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  amount,
  bank_name,
  card_processing_provider,
  check_number,
  clinic,
  created_by,
  created_via_refund,
  description,
  justifi_payment_id,
  method,
  patient,
  payer_type,
  payment_date,
  payment_method_id,
  payment_reference,
  save_payment_method,
  tilled_charge_id,
  tilled_payment_intent_id,
  updated_by,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$credits$POST(
    {
      amount,
      bank_name,
      card_processing_provider,
      check_number,
      clinic,
      created_by,
      created_via_refund,
      description,
      justifi_payment_id,
      method,
      patient,
      payer_type,
      payment_date,
      payment_method_id,
      payment_reference,
      save_payment_method,
      tilled_charge_id,
      tilled_payment_intent_id,
      updated_by,
    },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({ loading, data, error, refetchPOST$api$credits$: refetch });
};

export const pOST$api$credits$$id$$sync$POST = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/credits/${encodeQueryParam(
    id
  )}/sync/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePOST$api$credits$$id$$sync$POST = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPOST$api$credits$$id$$sync$POST', args],
    () => pOST$api$credits$$id$$sync$POST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPOST$api$credits$$id$$sync$POSTS',
        ]),
    }
  );
};

export const FetchPOST$api$credits$$id$$sync$POST = ({
  children,
  onData = () => {},
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePOST$api$credits$$id$$sync$POST(
    { id },
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      timeout,
      handlers: { onData, ...handlers },
    }
  );

  React.useEffect(() => {
    if (!prevIsFocused && isFocused && refetchOnWindowFocus !== false) {
      refetch();
    }
  }, [isFocused, prevIsFocused, refetchOnWindowFocus]);

  React.useEffect(() => {
    if (error) {
      console.log(error);
      if (error.status) {
        console.log('Fetch error: ' + error.status + ' ' + error.statusText);
      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPOST$api$credits$$id$$sync$: refetch,
  });
};

export const pUT$api$auth$users$me$PUT = async (
  Constants,
  {
    can_see_manufacturer_cost,
    chat_sound_notification,
    color,
    comms_api_key,
    date_joined,
    first_name,
    last_login,
    last_name,
    license_number,
    noah_password,
    noah_username,
    npi,
    onboarding_form_notifications_enabled,
    patient_arrived_sound_enabled,
    payment_request_notifications_enabled,
    photo,
    podium_id,
    role,
    scheduler_persist_per_clinic,
    scheduler_select_all_staff,
    sendbird_chat_enabled,
    signature,
    suffix,
    sync_with_google_calendar,
    task_is_assigned_notifications_enabled,
    title,
    touchpoint_notifications_enabled,
    user_permissions,
    user_preferences,
    user_reminder_notifications_enabled,
    web_scheduler_enabled,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/me/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        first_name: first_name,
        last_name: last_name,
        title: title,
        suffix: suffix,
        npi: npi,
        photo: photo,
        signature: signature,
        noah_username: noah_username,
        noah_password: noah_password,
        role: role,
        color: color,
        scheduler_select_all_staff: scheduler_select_all_staff,
        date_joined: date_joined,
        last_login: last_login,
        user_permissions: user_permissions,
        license_number: license_number,
        touchpoint_notifications_enabled: touchpoint_notifications_enabled,
        payment_request_notifications_enabled:
          payment_request_notifications_enabled,
        task_is_assigned_notifications_enabled:
          task_is_assigned_notifications_enabled,
        onboarding_form_notifications_enabled:
          onboarding_form_notifications_enabled,
        sendbird_chat_enabled: sendbird_chat_enabled,
        patient_arrived_sound_enabled: patient_arrived_sound_enabled,
        user_preferences: user_preferences,
        user_reminder_notifications_enabled:
          user_reminder_notifications_enabled,
        scheduler_persist_per_clinic: scheduler_persist_per_clinic,
        sync_with_google_calendar: sync_with_google_calendar,
        web_scheduler_enabled: web_scheduler_enabled,
        chat_sound_notification: chat_sound_notification,
        can_see_manufacturer_cost: can_see_manufacturer_cost,
        comms_api_key: comms_api_key,
        podium_id: podium_id,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PUT',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePUT$api$auth$users$me$PUT = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPUT$api$auth$users$me$PUT', args],
    () => pUT$api$auth$users$me$PUT(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPUT$api$auth$users$me$PUTS',
        ]),
    }
  );
};

export const pUT$api$auth$users$me$clinics$$clinicPk$$weeklySchedule$PUT =
  async (
    Constants,
    {
      clinic_pk,
      fri_end,
      fri_start,
      mon_end,
      mon_start,
      sat_end,
      sat_start,
      sun_end,
      sun_start,
      thu_end,
      thu_start,
      tue_end,
      tue_start,
      wed_end,
      wed_start,
    },
    handlers,
    timeout
  ) => {
    const url = `${Constants.API_BASE_URL}/auth/users/me/clinics/${encodeQueryParam(
      clinic_pk
    )}/weekly-schedule/`;
    const controller = new AbortController();
    let timeoutObj;
    if (timeout) {
      timeoutObj = setTimeout(() => {
        const err = new Error(`Timeout after ${timeout}ms`);
        err.__type = 'TIMEOUT';
        controller.abort(err);
      }, timeout);
    }
    try {
      const res = await fetch(url, {
        body: JSON.stringify({
          mon_start: mon_start,
          mon_end: mon_end,
          tue_start: tue_start,
          tue_end: tue_end,
          wed_start: wed_start,
          wed_end: wed_end,
          thu_start: thu_start,
          thu_end: thu_end,
          fri_start: fri_start,
          fri_end: fri_end,
          sat_start: sat_start,
          sat_end: sat_end,
          sun_start: sun_start,
          sun_end: sun_end,
        }),
        headers: cleanHeaders({
          Accept: 'application/json',
          Authorization: Constants['AUTH_HEADER'],
          'Content-Type': 'application/json',
        }),
        method: 'PUT',
        signal: controller.signal,
      });
      timeoutObj && clearTimeout(timeoutObj);
      return handleResponse(res, handlers);
    } catch (e) {
      if (e.__type === 'TIMEOUT') {
        handlers.onTimeout?.();
      } else if (timeoutObj) {
        clearTimeout(timeoutObj);
      }
      throw e;
    }
  };

export const usePUT$api$auth$users$me$clinics$$clinicPk$$weeklySchedule$PUT = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPUT$api$auth$users$me$clinics$$clinicPk$$weeklySchedule$PUT',
      args,
    ],
    () =>
      pUT$api$auth$users$me$clinics$$clinicPk$$weeklySchedule$PUT(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPUT$api$auth$users$me$clinics$$clinicPk$$weeklySchedule$PUTS',
        ]),
    }
  );
};

export const pUT$api$auth$users$$id$$PUT = async (
  Constants,
  {
    can_see_manufacturer_cost,
    chat_sound_notification,
    color,
    comms_api_key,
    date_joined,
    first_name,
    id,
    last_login,
    last_name,
    license_number,
    noah_password,
    noah_username,
    npi,
    onboarding_form_notifications_enabled,
    patient_arrived_sound_enabled,
    payment_request_notifications_enabled,
    photo,
    podium_id,
    role,
    scheduler_persist_per_clinic,
    scheduler_select_all_staff,
    sendbird_chat_enabled,
    signature,
    suffix,
    sync_with_google_calendar,
    task_is_assigned_notifications_enabled,
    title,
    touchpoint_notifications_enabled,
    user_permissions,
    user_preferences,
    user_reminder_notifications_enabled,
    web_scheduler_enabled,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/auth/users/${encodeQueryParam(
    id
  )}/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        first_name: first_name,
        last_name: last_name,
        title: title,
        suffix: suffix,
        npi: npi,
        photo: photo,
        signature: signature,
        noah_username: noah_username,
        noah_password: noah_password,
        role: role,
        color: color,
        scheduler_select_all_staff: scheduler_select_all_staff,
        date_joined: date_joined,
        last_login: last_login,
        user_permissions: user_permissions,
        license_number: license_number,
        touchpoint_notifications_enabled: touchpoint_notifications_enabled,
        payment_request_notifications_enabled:
          payment_request_notifications_enabled,
        task_is_assigned_notifications_enabled:
          task_is_assigned_notifications_enabled,
        onboarding_form_notifications_enabled:
          onboarding_form_notifications_enabled,
        sendbird_chat_enabled: sendbird_chat_enabled,
        patient_arrived_sound_enabled: patient_arrived_sound_enabled,
        user_preferences: user_preferences,
        user_reminder_notifications_enabled:
          user_reminder_notifications_enabled,
        scheduler_persist_per_clinic: scheduler_persist_per_clinic,
        sync_with_google_calendar: sync_with_google_calendar,
        web_scheduler_enabled: web_scheduler_enabled,
        chat_sound_notification: chat_sound_notification,
        can_see_manufacturer_cost: can_see_manufacturer_cost,
        comms_api_key: comms_api_key,
        podium_id: podium_id,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PUT',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePUT$api$auth$users$$id$$PUT = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    ['sunoHealthcareManagementAPIPUT$api$auth$users$$id$$PUT', args],
    () => pUT$api$auth$users$$id$$PUT(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPUT$api$auth$users$$id$$PUTS',
        ]),
    }
  );
};

export const pUT$api$clinics$$clinicPk$$weeklySchedule$PUT = async (
  Constants,
  {
    clinic_pk,
    fri_end,
    fri_start,
    mon_end,
    mon_start,
    sat_end,
    sat_start,
    sun_end,
    sun_start,
    thu_end,
    thu_start,
    tue_end,
    tue_start,
    wed_end,
    wed_start,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/clinics/${encodeQueryParam(
    clinic_pk
  )}/weekly-schedule/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }
  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        mon_start: mon_start,
        mon_end: mon_end,
        tue_start: tue_start,
        tue_end: tue_end,
        wed_start: wed_start,
        wed_end: wed_end,
        thu_start: thu_start,
        thu_end: thu_end,
        fri_start: fri_start,
        fri_end: fri_end,
        sat_start: sat_start,
        sat_end: sat_end,
        sun_start: sun_start,
        sun_end: sun_end,
      }),
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      method: 'PUT',
      signal: controller.signal,
    });
    timeoutObj && clearTimeout(timeoutObj);
    return handleResponse(res, handlers);
  } catch (e) {
    if (e.__type === 'TIMEOUT') {
      handlers.onTimeout?.();
    } else if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    throw e;
  }
};

export const usePUT$api$clinics$$clinicPk$$weeklySchedule$PUT = (
  args = {},
  {
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    retry,
    staleTime,
    timeout,
    handlers = {},
  } = {}
) => {
  const Constants = GlobalVariables.useValues();
  const queryClient = useQueryClient();
  return useQuery(
    [
      'sunoHealthcareManagementAPIPUT$api$clinics$$clinicPk$$weeklySchedule$PUT',
      args,
    ],
    () =>
      pUT$api$clinics$$clinicPk$$weeklySchedule$PUT(
        Constants,
        args,
        handlers,
        timeout
      ),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries([
          'sunoHealthcareManagementAPIPUT$api$clinics$$clinicPk$$weeklySchedule$PUTS',
        ]),
    }
  );
};
