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
import { logError } from '../index';

const cleanHeaders = headers =>
  Object.fromEntries(Object.entries(headers).filter(kv => kv[1] != null));


export const getTaskDetailsGET = async (
  Constants,
  { query, task_id },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  const url = `${Constants.API_BASE_URL}/staff-tasks/${encodeQueryParam(
    task_id
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

export const useGetTaskDetailsGET = (
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
    ['Gets', args],
    () => getTaskDetailsGET(Constants, args, handlers, timeout),
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

export const FetchGetTaskDetailsGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  query,
  task_id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetTaskDetailsGET(
    { query, task_id },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : /staff-tasks/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetTaskDetails: refetch });
};

export const editStaffTasksPATCH = async (
  Constants,
  {
    assignee,
    assignees,
    description,
    due_at,
    patient,
    priority,
    status,
    task_id,
    title,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/staff-tasks/${encodeQueryParam(
    task_id
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
        title: title,
        description: description,
        priority: priority,
        status: status,
        assignee: assignee,
        assignees: assignees,
        due_at: due_at,
        patient: patient,
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

export const editBillingStatusPATCH = async (
  Constants,
  {
    
    sale_id,
    status,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/sales/${sale_id}/`;
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
        status: status,
        // description: description,
        // priority: priority,
        // status: status,
        // assignee: assignee,
        // assignees: assignees,
        // due_at: due_at,
        // patient: patient,
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
export const useEditStaffTasksPATCH = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      editStaffTasksPATCH(Constants, { ...initialArgs, ...args }, handlers),
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

export const useEditBliingStatusPATCH = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      editBillingStatusPATCH(Constants, { ...initialArgs, ...args }, handlers),
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
export const deleteTaskCommentsDELETE = async (
  Constants,
  { comment_id, task_id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/staff-tasks/${encodeQueryParam(
    task_id
  )}/comments/${encodeQueryParam(comment_id)}/`;
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

export const deleteTaskDELETE = async (
  Constants,
  { task_id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/staff-tasks/${encodeQueryParam(
    task_id
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

export const useAddTaskCommentsPOST = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      addTaskCommentsPOST(Constants, { ...initialArgs, ...args }, handlers),
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

export const addTaskCommentsPOST = async (
  Constants,
  { id, text, user_id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/staff-tasks/${encodeQueryParam(
    id
  )}/comments/`;
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
      body: JSON.stringify({ text: text, user: user_id }),
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

export const uploadTaskAttachmentPOST = async (
  Constants,
  { task_id, uri, name },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/staff-tasks/${encodeQueryParam(
    task_id
  )}/attachments/`;
  const controller = new AbortController();
  let timeoutObj;
  if (timeout) {
    timeoutObj = setTimeout(() => {
      const err = new Error(`Timeout after ${timeout}ms`);
      err.__type = 'TIMEOUT';
      controller.abort(err);
    }, timeout);
  }

  const formData = new FormData();
  formData.append('file', {
    uri,
    name: name || 'attachment.pdf',
    type: 'application/pdf',
  });

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
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

export const deleteTaskAttachmentDELETE = async (
  Constants,
  { task_id, attachment_id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/staff-tasks/${encodeQueryParam(
    task_id
  )}/attachments/${encodeQueryParam(attachment_id)}/`;
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

export const FetchAddTaskCommentsPOST = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  id,
  text,
  user_id,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    mutate: refetch,
  } = useAddTaskCommentsPOST(
    { id, text, user_id },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError(`API_FAILED : /staff-tasks/${id}/comment `,  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchAddTaskComments: refetch });
};

export const useDeleteTaskCommentsDELETE = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      deleteTaskCommentsDELETE(
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
export const useDeleteTaskDELETE = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      deleteTaskDELETE(
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
export const createPatientPOST = async (
  Constants,
  {
    birthdate,
    email,
    first_name,
    gender,
    last_name,
    middle_name,
    phone,
    preferred_clinic,
    referral_source,
    sex,
  },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/patients/`;
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
        middle_name: middle_name,
        last_name: last_name,
        sex: sex,
        gender: gender,
        birthdate: birthdate,
        phone: phone,
        email: email,
        referral_source: referral_source,
        preferred_clinic: preferred_clinic,
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

export const useCreatePatientPOST = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args => createPatientPOST(Constants, { ...initialArgs, ...args }, handlers),
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

export const FetchCreatePatientPOST = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  birthdate,
  email,
  first_name,
  gender,
  last_name,
  middle_name,
  phone,
  preferred_clinic,
  referral_source,
  sex,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    mutate: refetch,
  } = useCreatePatientPOST(
    {
      birthdate,
      email,
      first_name,
      gender,
      last_name,
      middle_name,
      phone,
      preferred_clinic,
      referral_source,
      sex,
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Create /patients/ ',  error.status + ' ' + error.statusText )
      }
    }
  }, [error]);
  return children({ loading, data, error, refetchCreatePatient: refetch });
};

export const createPatientsNoahPOST = async (
  Constants,
  { patient_pk },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/noah/${encodeQueryParam(
    patient_pk
  )}/noah-es`;
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
      body: JSON.stringify({ key: 'value' }),
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

export const useCreatePatientsNoahPOST = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      createPatientsNoahPOST(Constants, { ...initialArgs, ...args }, handlers),
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

export const FetchCreatePatientsNoahPOST = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  patient_pk,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    mutate: refetch,
  } = useCreatePatientsNoahPOST(
    { patient_pk },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Create Noah Patinet /noah ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchCreatePatientsNoah: refetch });
};

export const deleteNoteDELETE = async (
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

export const useDeleteNoteDELETE = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args => deleteNoteDELETE(Constants, { ...initialArgs, ...args }, handlers),
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

export const getAppointmentTypesGET = async (
  Constants,
  { exclude_type, is_active, limit, query },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (is_active !== undefined) {
    paramsDict['is_active'] = renderParam(is_active);
  }
  if (exclude_type !== undefined) {
    paramsDict['exclude_type'] = renderParam(exclude_type);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  const url = `${Constants.API_BASE_URL}/appointment-types/${renderQueryString(
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

export const useGetAppointmentTypesGET = (
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
    ['Gets', args],
    () => getAppointmentTypesGET(Constants, args, handlers, timeout),
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

export const FetchGetAppointmentTypesGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  exclude_type,
  is_active,
  limit,
  query,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetAppointmentTypesGET(
    { exclude_type, is_active, limit, query },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED :  /appointment-types/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGetAppointmentTypes: refetch,
  });
};

export const getAssigneeTasksGET = async (
  Constants,
  {
    assignee,
    is_active,
    is_complete,
    limit,
    offset,
    ordering,
    patient,
    query,
    refreshKey,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  if (patient !== undefined) {
    paramsDict['patient'] = renderParam(patient);
  }
  if (is_active !== undefined) {
    paramsDict['is_active'] = renderParam(is_active);
  }
  if (is_complete !== undefined) {
    paramsDict['is_complete'] = renderParam(is_complete);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (refreshKey !== undefined) {
    paramsDict['refreshKey'] = renderParam(refreshKey);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (assignee !== undefined) {
    paramsDict['assignee'] = renderParam(assignee);
  }
  const url = `${Constants.API_BASE_URL}/staff-tasks/${renderQueryString(
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

export const useGetAssigneeTasksGET = (
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
    ['Gets', args],
    () => getAssigneeTasksGET(Constants, args, handlers, timeout),
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

export const FetchGetAssigneeTasksGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  assignee,
  is_active,
  is_complete,
  limit,
  offset,
  ordering,
  patient,
  query,
  refreshKey,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetAssigneeTasksGET(
    {
      assignee,
      is_active,
      is_complete,
      limit,
      offset,
      ordering,
      patient,
      query,
      refreshKey,
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Assignee of task /staff-tasks/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetAssigneeTasks: refetch });
};

export const getBoxAccessTokenGET = async (
  Constants,
  _args,
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/practices/my/box-access-token/`;
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

export const useGetBoxAccessTokenGET = (
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
    ['Gets', args],
    () => getBoxAccessTokenGET(Constants, args, handlers, timeout),
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

export const FetchGetBoxAccessTokenGET = ({
  children,
  onData = () => { },
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
  } = useGetBoxAccessTokenGET(
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED :  /practices/my/box-access-token/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetBoxAccessToken: refetch });
};

export const getClinicGET = async (
  Constants,
  { ordering, query, region, user },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  if (region !== undefined) {
    paramsDict['region'] = renderParam(region);
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

export const useGetClinicGET = (
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
    ['Gets', args],
    () => getClinicGET(Constants, args, handlers, timeout),
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

export const FetchGetClinicGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  ordering,
  query,
  region,
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
  } = useGetClinicGET(
    { ordering, query, region, user },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get Clinic /clinics/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetClinic: refetch });
};

export const getCompletedTasksGET = async (
  Constants,
  {
    assignee,
    group_by_priority,
    is_active,
    is_complete,
    limit,
    offset,
    ordering,
    patient,
    query,
    refreshKey,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  if (patient !== undefined) {
    paramsDict['patient'] = renderParam(patient);
  }
  if (is_active !== undefined) {
    paramsDict['is_active'] = renderParam(is_active);
  }
  if (is_complete !== undefined) {
    paramsDict['is_complete'] = renderParam(is_complete);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (refreshKey !== undefined) {
    paramsDict['refreshKey'] = renderParam(refreshKey);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (assignee !== undefined) {
    paramsDict['assignee'] = renderParam(assignee);
  }
  if (group_by_priority !== undefined) {
    paramsDict['group_by_priority'] = renderParam(group_by_priority);
  }
  const url = `${Constants.API_BASE_URL}/staff-tasks/${renderQueryString(
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

export const useGetCompletedTasksGET = (
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
    ['Gets', args],
    () => getCompletedTasksGET(Constants, args, handlers, timeout),
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

export const FetchGetCompletedTasksGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  assignee,
  group_by_priority,
  is_active,
  is_complete,
  limit,
  offset,
  ordering,
  patient,
  query,
  refreshKey,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetCompletedTasksGET(
    {
      assignee,
      group_by_priority,
      is_active,
      is_complete,
      limit,
      offset,
      ordering,
      patient,
      query,
      refreshKey,
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get Completed task  /staff-tasks/',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetCompletedTasks: refetch });
};

export const getEventsGET = async (
  Constants,
  { from_date, query, staff_member, status, to_date, type },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (from_date !== undefined) {
    paramsDict['from_date'] = renderParam(from_date);
  }
  if (to_date !== undefined) {
    paramsDict['to_date'] = renderParam(to_date);
  }
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  if (staff_member !== undefined) {
    paramsDict['staff_member'] = renderParam(staff_member);
  }
  if (type !== undefined) {
    paramsDict['type'] = renderParam(type);
  }
  if (status !== undefined) {
    paramsDict['status'] = renderParam(status);
  }
  const url = `${Constants.API_BASE_URL}/events-optimized/${renderQueryString(
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

export const useGetEventsGET = (
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
    ['Gets', args],
    () => getEventsGET(Constants, args, handlers, timeout),
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

export const FetchGetEventsGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  from_date,
  query,
  staff_member,
  status,
  to_date,
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
  } = useGetEventsGET(
    { from_date, query, staff_member, status, to_date, type },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED :  Get Schedules /events-optimized/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetEvents: refetch });
};

export const getGlobalTagsGET = async (
  Constants,
  { is_active, limit, type },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (is_active !== undefined) {
    paramsDict['is_active'] = renderParam(is_active);
  }
  if (type !== undefined) {
    paramsDict['type'] = renderParam(type);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  const url = `${Constants.API_BASE_URL}/global-tags/${renderQueryString(
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

export const useGetGlobalTagsGET = (
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
    ['Gets', args],
    () => getGlobalTagsGET(Constants, args, handlers, timeout),
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

export const FetchGetGlobalTagsGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  is_active,
  limit,
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
  } = useGetGlobalTagsGET(
    { is_active, limit, type },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get Global Tags  /global-tags/',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetGlobalTags: refetch });
};

export const getInsurersGET = async (
  Constants,
  { country, is_active, limit, offset, query, search, verified },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (search !== undefined) {
    paramsDict['search'] = renderParam(search);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  if (verified !== undefined) {
    paramsDict['verified'] = renderParam(verified);
  }
  if (is_active !== undefined) {
    paramsDict['is_active'] = renderParam(is_active);
  }
  if (country !== undefined) {
    paramsDict['country'] = renderParam(country);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  const url = `${Constants.API_BASE_URL}/insurers/${renderQueryString(
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

export const useGetInsurersGET = (
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
    ['Gets', args],
    () => getInsurersGET(Constants, args, handlers, timeout),
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

export const FetchGetInsurersGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  country,
  is_active,
  limit,
  offset,
  query,
  search,
  verified,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetInsurersGET(
    { country, is_active, limit, offset, query, search, verified },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get Insurer  /insurers/',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetInsurers: refetch });
};

export const getIntakeFormRequestsGET = async (
  Constants,
  { appointment, id, ordering },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (appointment !== undefined) {
    paramsDict['appointment'] = renderParam(appointment);
  }
  const url = `${Constants.API_BASE_URL}/patients/${encodeQueryParam(
    id
  )}/intake-form-requests/${renderQueryString(paramsDict)}`;
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

export const useGetIntakeFormRequestsGET = (
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
    ['Gets', args],
    () => getIntakeFormRequestsGET(Constants, args, handlers, timeout),
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

export const FetchGetIntakeFormRequestsGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  appointment,
  id,
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
  } = useGetIntakeFormRequestsGET(
    { appointment, id, ordering },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get Intake Form /patients/',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGetIntakeFormRequests: refetch,
  });
};

export const getManageCarePlanGET = async (
  Constants,
  { is_active, limit },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (is_active !== undefined) {
    paramsDict['is_active'] = renderParam(is_active);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  const url = `${Constants.API_BASE_URL}/referral-sources/${renderQueryString(
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

export const useGetManageCarePlanGET = (
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
    ['Gets', args],
    () => getManageCarePlanGET(Constants, args, handlers, timeout),
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

export const FetchGetManageCarePlanGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  is_active,
  limit,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetManageCarePlanGET(
    { is_active, limit },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get Manage Care Plan /referral-sources/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetManageCarePlan: refetch });
};

export const getMyAssigneeTasksGET = async (
  Constants,
  {
    assignee,
    created_by,
    group_by_priority,
    is_active,
    is_complete,
    ordering,
    query,
    status,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  if (is_active !== undefined) {
    paramsDict['is_active'] = renderParam(is_active);
  }
  if (is_complete !== undefined) {
    paramsDict['is_complete'] = renderParam(is_complete);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (assignee !== undefined) {
    paramsDict['assignee'] = renderParam(assignee);
  }
  if (status !== undefined) {
    paramsDict['status'] = renderParam(status);
  }
  if (created_by !== undefined) {
    paramsDict['created_by'] = renderParam(created_by);
  }
  if (group_by_priority !== undefined) {
    paramsDict['group_by_priority'] = renderParam(group_by_priority);
  }
  const url = `${Constants.API_BASE_URL}/staff-tasks/${renderQueryString(
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

export const getBillingGET = async (
  Constants,
  {
    has_active_subscription,
    patient,
    offset,
    limit,
    nulls_first,
    query,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  if (has_active_subscription !== undefined) {
    paramsDict['has_active_subscription'] = renderParam(has_active_subscription);
  }
  if (patient !== undefined) {
    paramsDict['patient'] = renderParam(patient);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (nulls_first !== undefined) {
    paramsDict['nulls_first'] = renderParam(nulls_first);
  }
  const url = `${Constants.API_BASE_URL}/sales/${renderQueryString(
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
export const getInsurancePolicyGET = async (
  Constants,
  {
    patient,
    query,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  if (patient !== undefined) {
    paramsDict['patient'] = renderParam(patient);
  }
  
  const url = `${Constants.API_BASE_URL}/insurance-policies/${renderQueryString(
    paramsDict
  )}`;

  console.log("==== url :", url)
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

export const getBillingLineItemsGET = async (
  Constants,
  {
    sale_id,
    query,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  // if (sale_id !== undefined) {
  //   paramsDict['sale_id'] = renderParam(sale_id);
  // }

  const url = `${Constants.API_BASE_URL}/sales/${sale_id}/items/${renderQueryString(
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

export const getBillingPaymentsGET = async (
  Constants,
  {
    sale,
    offset,
    limit,
    query,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (sale !== undefined) {
    paramsDict['sale'] = renderParam(sale);
  }


  const url = `${Constants.API_BASE_URL}/payments/${renderQueryString(
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

export const getBillingAdjustmenentsGET = async (
  Constants,
  {
    sale,
    limit,
    query,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }

  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
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

export const useGetMyAssigneeTasksGET = (
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
    ['Gets', args],
    () => getMyAssigneeTasksGET(Constants, args, handlers, timeout),
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

export const useGetBillingGET = (
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
    ['Gets', args],
    () => getBillingGET(Constants, args, handlers, timeout),
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

export const useGetInsurancePolicyGET = (
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
    ['Gets', args],
    () => getInsurancePolicyGET(Constants, args, handlers, timeout),
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
export const useGetBillingLineItemsGET = (
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
    ['Gets', args],
    () => getBillingLineItemsGET(Constants, args, handlers, timeout),
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
export const useGetBillingPaymentsGET = (
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
    ['Gets', args],
    () => getBillingPaymentsGET(Constants, args, handlers, timeout),
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
export const useGetBillingAdjustmentsGET = (
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
    ['Gets', args],
    () => getBillingAdjustmenentsGET(Constants, args, handlers, timeout),
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

export const FetchGetMyAssigneeTasksGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  assignee,
  created_by,
  group_by_priority,
  is_active,
  is_complete,
  ordering,
  query,
  status,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetMyAssigneeTasksGET(
    {
      assignee,
      created_by,
      group_by_priority,
      is_active,
      is_complete,
      ordering,
      query,
      status,
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get My Assignee  /staff-tasks/',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetMyAssigneeTasks: refetch });
};

export const FetchBillingLineItemGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  sale_id,
  query,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetBillingLineItemsGET(
    {
      sale_id,
      query,
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get Billing Item /sales/${sale_id}/items/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetMyAssigneeTasks: refetch });
};

export const FetchBillingPaymentsGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  sale,
  offset,
  limit,
  query,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetBillingPaymentsGET(
    {
      sale,
      offset,
      limit,
      query,
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get Billing Payment  /payments/',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetMyAssigneeTasks: refetch });
};

export const FetchBillingAdjustmentGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  sale,
  limit,
  query,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetBillingAdjustmentsGET(
    {
      sale,
      limit,
      query,
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get Billing Adjustment  /adjustments/',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetMyAssigneeTasks: refetch });
};

export const FetchBillingGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  has_active_subscription,
  patient,
  offset,
  limit,
  nulls_first,
  query,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetBillingGET(
    {
      has_active_subscription,
      patient,
      offset,
      limit,
      nulls_first,
      query,
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get Billing  /sales/',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetMyAssigneeTasks: refetch });
};
export const FetchInsurancePolicyGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  patient,
  query,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetInsurancePolicyGET(
    {
      patient,
      query,
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get Insurance Policy /insurance-policies/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetMyAssigneeTasks: refetch });
};

export const getPatientProductsGET = async (
  Constants,
  { is_active, limit, patient, query },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  if (is_active !== undefined) {
    paramsDict['is_active'] = renderParam(is_active);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  paramsDict['patient'] = patient !== undefined ? renderParam(patient) : '';
  const url = `${Constants.API_BASE_URL}/patient-products/${renderQueryString(
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

export const useGetPatientProductsGET = (
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
    ['Gets', args],
    () => getPatientProductsGET(Constants, args, handlers, timeout),
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

export const FetchGetPatientProductsGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  is_active,
  limit,
  patient,
  query,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetPatientProductsGET(
    { is_active, limit, patient, query },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get Patient Product /patient-products/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetPatientProducts: refetch });
};

export const getPatientProductByIdGET = async (
  Constants,
  { id, query },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  const url = `${Constants.API_BASE_URL}/patient-products/${encodeQueryParam(
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

export const updatePatientProductPATCH = async (
  Constants,
  { id, body },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/patient-products/${encodeQueryParam(
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
      body: JSON.stringify(body),
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

export const getPatientsGET = async (
  Constants,
  {
    assigned_tags,
    crm_segment,
    insurer,
    is_active,
    last_outcome,
    latest_referral_source,
    latest_sub_referral_source,
    limit,
    managed_care_plan,
    manufacturer_warranty_is_expiring_in_less_than_days,
    offset,
    ordering,
    payment_source_type,
    preferred_clinic,
    preferred_communication_method,
    preferred_provider,
    query,
    search,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (is_active !== undefined) {
    paramsDict['is_active'] = renderParam(is_active);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
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
  if (preferred_provider !== undefined) {
    paramsDict['preferred_provider'] = renderParam(preferred_provider);
  }
  if (payment_source_type !== undefined) {
    paramsDict['payment_source_type'] = renderParam(payment_source_type);
  }
  if (assigned_tags !== undefined) {
    paramsDict['assigned_tags'] = renderParam(assigned_tags);
  }
  if (latest_referral_source !== undefined) {
    paramsDict['latest_referral_source'] = renderParam(latest_referral_source);
  }
  if (last_outcome !== undefined) {
    paramsDict['last_outcome'] = renderParam(last_outcome);
  }
  if (manufacturer_warranty_is_expiring_in_less_than_days !== undefined) {
    paramsDict['manufacturer_warranty_is_expiring_in_less_than_days'] =
      renderParam(manufacturer_warranty_is_expiring_in_less_than_days);
  }
  if (preferred_clinic !== undefined) {
    paramsDict['preferred_clinic'] = renderParam(preferred_clinic);
  }
  if (latest_sub_referral_source !== undefined) {
    paramsDict['latest_sub_referral_source'] = renderParam(
      latest_sub_referral_source
    );
  }
  if (crm_segment !== undefined) {
    paramsDict['crm_segment'] = renderParam(crm_segment);
  }
  if (preferred_communication_method !== undefined) {
    paramsDict['preferred_communication_method'] = renderParam(
      preferred_communication_method
    );
  }
  if (insurer !== undefined) {
    paramsDict['insurer'] = renderParam(insurer);
  }
  if (managed_care_plan !== undefined) {
    paramsDict['managed_care_plan'] = renderParam(managed_care_plan);
  }
  const url = `${Constants.API_BASE_URL}/patients/${renderQueryString(
    paramsDict
  )}`;
  // console.log("===== prama : ", paramsDict)
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

export const useGetPatientsGET = (
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
    ['Gets', args],
    () => getPatientsGET(Constants, args, handlers, timeout),
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

export const FetchGetPatientsGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  assigned_tags,
  crm_segment,
  insurer,
  is_active,
  last_outcome,
  latest_referral_source,
  latest_sub_referral_source,
  limit,
  managed_care_plan,
  manufacturer_warranty_is_expiring_in_less_than_days,
  offset,
  ordering,
  payment_source_type,
  preferred_clinic,
  preferred_communication_method,
  preferred_provider,
  query,
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
  } = useGetPatientsGET(
    {
      assigned_tags,
      crm_segment,
      insurer,
      is_active,
      last_outcome,
      latest_referral_source,
      latest_sub_referral_source,
      limit,
      managed_care_plan,
      manufacturer_warranty_is_expiring_in_less_than_days,
      offset,
      ordering,
      payment_source_type,
      preferred_clinic,
      preferred_communication_method,
      preferred_provider,
      query,
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED :  Fetch Patients /patient/',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetPatients: refetch });
};

export const getPatientsInboxGET = async (
  Constants,
  { limit, offset, ordering, preferred_clinic, query, region, search },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (preferred_clinic !== undefined) {
    paramsDict['preferred_clinic'] = renderParam(preferred_clinic);
  }
  if (region !== undefined) {
    paramsDict['region'] = renderParam(region);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (search !== undefined) {
    paramsDict['search'] = renderParam(search);
  }
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  const url = `${Constants.API_BASE_URL}/patients/${renderQueryString(
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

export const useGetPatientsInboxGET = (
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
    ['Gets', args],
    () => getPatientsInboxGET(Constants, args, handlers, timeout),
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

export const FetchGetPatientsInboxGET = ({
  children,
  onData = () => { },
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
  preferred_clinic,
  query,
  region,
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
  } = useGetPatientsInboxGET(
    { limit, offset, ordering, preferred_clinic, query, region, search },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED :  Patient Inbox /patients/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetPatientsInbox: refetch });
};

export const getPatientsInboxFilterGET = async (
  Constants,
  {
    limit,
    offset,
    ordering,
    preferred_clinic,
    query,
    region,
    staff_dialog_assignee,
  },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (preferred_clinic !== undefined) {
    paramsDict['preferred_clinic'] = renderParam(preferred_clinic);
  }
  if (region !== undefined) {
    paramsDict['region'] = renderParam(region);
  }
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (staff_dialog_assignee !== undefined) {
    paramsDict['staff_dialog_assignee'] = renderParam(staff_dialog_assignee);
  }
  const url = `${Constants.API_BASE_URL}/patients/${renderQueryString(
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

export const useGetPatientsInboxFilterGET = (
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
    ['Gets', args],
    () => getPatientsInboxFilterGET(Constants, args, handlers, timeout),
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

export const FetchGetPatientsInboxFilterGET = ({
  children,
  onData = () => { },
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
  preferred_clinic,
  query,
  region,
  staff_dialog_assignee,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetPatientsInboxFilterGET(
    {
      limit,
      offset,
      ordering,
      preferred_clinic,
      query,
      region,
      staff_dialog_assignee,
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED :  Patiemt inbox filter /patients/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGetPatientsInboxFilter: refetch,
  });
};

export const getProvidersGET = async (
  Constants,
  { clinics, groups__name, is_active, limit, query },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (is_active !== undefined) {
    paramsDict['is_active'] = renderParam(is_active);
  }
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (clinics !== undefined) {
    paramsDict['clinics'] = renderParam(clinics);
  }
  if (groups__name !== undefined) {
    paramsDict['groups__name'] = renderParam(groups__name);
  }
  const url = `${Constants.API_BASE_URL}/staff/${renderQueryString(
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

export const useGetProvidersGET = (
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
    ['Gets', args],
    () => getProvidersGET(Constants, args, handlers, timeout),
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

export const FetchGetProvidersGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  clinics,
  groups__name,
  is_active,
  limit,
  query,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetProvidersGET(
    { clinics, groups__name, is_active, limit, query },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get Provider  /staff/',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetProviders: refetch });
};

export const getReferenceSourceGET = async (
  Constants,
  { parent__isnull, query },
  handlers,
  timeout
) => {
  const paramsDict = {};
  paramsDict['parent__isnull'] =
    parent__isnull !== undefined ? renderParam(parent__isnull) : '';
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
  }
  const url = `${Constants.API_BASE_URL}/referral-sources/${renderQueryString(
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

export const useGetReferenceSourceGET = (
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
    ['Gets', args],
    () => getReferenceSourceGET(Constants, args, handlers, timeout),
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

export const FetchGetReferenceSourceGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  parent__isnull,
  query,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetReferenceSourceGET(
    { parent__isnull, query },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get Refereance Source  /referral-sources/',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchGetReferenceSource: refetch });
};

export const getUnreadMessagesCountGET = async (
  Constants,
  { clinics },
  handlers,
  timeout
) => {
  const paramsDict = {};
  paramsDict['clinics'] = clinics !== undefined ? renderParam(clinics) : '';
  const url = `${Constants.API_BASE_URL}/messages/unread-messages-count/${renderQueryString(
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

export const useGetUnreadMessagesCountGET = (
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
    ['Gets', args],
    () => getUnreadMessagesCountGET(Constants, args, handlers, timeout),
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

export const FetchGetUnreadMessagesCountGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  clinics,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetUnreadMessagesCountGET(
    { clinics },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get Unread Message /messages/unread-messages-count/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchGetUnreadMessagesCount: refetch,
  });
};


export const newStaffTasksPOST = async (
  Constants,
  { title, description, priority, status, assignee, assignees, due_at, patient },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/staff-tasks/`;
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
        title: title,
        description: description,
        priority: priority,
        status: status,
        assignee: assignee,
        assignees: assignees,
        due_at: due_at,
        patient: patient,
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

export const useNewStaffTasksPOST = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args => newStaffTasksPOST(Constants, { ...initialArgs, ...args }, handlers),
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

export const FetchNewStaffTasksPOST = ({
  children,
  onData = () => { },
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
    mutate: refetch,
  } = useNewStaffTasksPOST(
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get Staff task /staff-tasks/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchNewStaffTasks: refetch });
};

export const patientAppointmentsGET = async (
  Constants,
  { after_moment, before_moment, id, limit, offset, ordering, patient, status },
  handlers,
  timeout
) => {
  const paramsDict = {};
  paramsDict['id'] = id !== undefined ? renderParam(id) : '';
  paramsDict['query'] =
    '{id,schedule,notes,replacement_appointment{id},needs_reschedule,patient_feedback_rating,outcome,outcome_reason,title,outcome_notes,start_moment,end_moment,status,referral_source{id,name},staff_member{id,first_name,last_name,suffix,title,is_active},room{clinic{id,name,logo,practice{id,name,logo}}},clinic{id,timezone,name,logo,practice{id,name,logo}},type{id,name,default_duration,is_opportunity,general_type,color},assigned_tags,patient{id,first_name,last_name}}';
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  paramsDict['patient'] = patient !== undefined ? renderParam(patient) : '';
  paramsDict['before_moment'] =
    before_moment !== undefined ? renderParam(before_moment) : '';
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  paramsDict['after_moment'] =
    after_moment !== undefined ? renderParam(after_moment) : '';
  if (status !== undefined) {
    paramsDict['status'] = renderParam(status);
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
export const scribesGET = async (
  Constants,
  { query, patient, status, limit, offset, refreshKey },
  handlers,
  timeout
) => {
  const paramsDict = {};
  paramsDict['query'] = query !== undefined ? renderParam(query) : '';
  paramsDict['patient'] = patient !== undefined ? renderParam(patient) : '';
  paramsDict['status'] = status !== undefined ? renderParam(status) : '';
  if (refreshKey !== undefined) {
    paramsDict['refreshKey'] = renderParam(refreshKey);
  }
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (status !== undefined) {
    paramsDict['status'] = renderParam(status);
  }
  const url = `${Constants.API_BASE_URL}/ai/ambient-scribes/${renderQueryString(
    paramsDict
  )}`;
  // console.log("========= url :",url)
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
export const scribeDetailsGET = async (
  Constants,
  { query, id },
  handlers,
  timeout
) => {
  const paramsDict = {};
  paramsDict['query'] = query !== undefined ? renderParam(query) : '';

  const url = `${Constants.API_BASE_URL}/ai/ambient-scribes/${id}/${renderQueryString(
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

export const scribeTemplatesGET = async (
  Constants,
  { limit, offset, ordering },
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

  const url = `${Constants.API_BASE_URL}/ai/ambient-scribes/templates/${renderQueryString(
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

export const scribeAudioChunksGET = async (
  Constants,
  { id},
  handlers,
  timeout
) => {
  const paramsDict = {};

  const url = `${Constants.API_BASE_URL}/ai/ambient-scribes/${id}/audio-chunks/${renderQueryString(
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

export const scribeCompletePOST = async (
  Constants,
  { id},
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/ai/ambient-scribes/${id}/complete/`;
  const body = {};

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
      method: 'POST',
      headers: cleanHeaders({
        Accept: 'application/json',
        Authorization: Constants['AUTH_HEADER'],
        'Content-Type': 'application/json',
      }),
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
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

export const useScribeTemplateGeneratePOST = (
  initialArgs = {},
  { handlers = {} } = {}
) => {  
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args => scribeTemplateGeneratePOST(Constants, { ...initialArgs, ...args }, handlers),
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

export const scribeTemplateGeneratePOST = async (
  Constants,
  { ambient_scribe_template_id, format, transform_type, id, type },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/ai/ambient-scribes/${id}/${type}/`;
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
        ambient_scribe_template_id: ambient_scribe_template_id,
        format: format,
        transform_type: transform_type,
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

export const usePatientAppointmentsGET = (
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
    ['Gets', args],
    () => patientAppointmentsGET(Constants, args, handlers, timeout),
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
export const useScribesGET = (
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
    ['Gets', args],
    () => scribesGET(Constants, args, handlers, timeout),
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
export const useScribeDetailsGET = (
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
    ['Gets', args],
    () => scribeDetailsGET(Constants, args, handlers, timeout),
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
export const FetchPatientAppointmentsGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  after_moment,
  before_moment,
  id,
  limit,
  offset,
  ordering,
  patient,
  status,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = usePatientAppointmentsGET(
    {
      after_moment,
      before_moment,
      id,
      limit,
      offset,
      ordering,
      patient,
      status,
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Patient Appointment /appointments/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPatientAppointments: refetch,
  });
};
export const FetchScribesGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  query,
  patient,
  status,
  limit,
  offset,
  refreshKey,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useScribesGET(
    {
      query,
      patient,
      status,
      limit,
      offset,
      refreshKey,
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Patient Appointment /appointments/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchScribes: refetch,
    
  });
};

export const FetchScribeDetailsGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  query,
  id
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useScribeDetailsGET(
    {
      query,
      id,
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Patient Appointment /appointments/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchScribes: refetch,
  });
};
export const patientChartNoteGET = async (
  Constants,
  { limit, offset, ordering, patient, query, refreshKey, type },
  handlers,
  timeout
) => {
  const paramsDict = {};
  if (limit !== undefined) {
    paramsDict['limit'] = renderParam(limit);
  }
  paramsDict['patient'] = patient !== undefined ? renderParam(patient) : '';
  if (ordering !== undefined) {
    paramsDict['ordering'] = renderParam(ordering);
  }
  if (offset !== undefined) {
    paramsDict['offset'] = renderParam(offset);
  }
  if (refreshKey !== undefined) {
    paramsDict['refreshKey'] = renderParam(refreshKey);
  }
  if (query !== undefined) {
    paramsDict['query'] = renderParam(query);
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

export const usePatientChartNoteGET = (
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
    ['Gets', args],
    () => patientChartNoteGET(Constants, args, handlers, timeout),
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

export const FetchPatientChartNoteGET = ({
  children,
  onData = () => { },
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
  patient,
  query,
  refreshKey,
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
  } = usePatientChartNoteGET(
    { limit, offset, ordering, patient, query, refreshKey, type },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Patient Chart Note  /chart-notes/',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchPatientChartNote: refetch });
};

export const patientDeatilGET = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  // const paramsDict = {};
  // paramsDict['id'] = id !== undefined ? renderParam(id) : '';
  // paramsDict['query'] ='{id,suno_comms_id,external_id,is_active,full_name,first_name,middle_name,last_name,preferred_name,quickbooks_customer_id,title,suffix,birthdate,sex,marital_status,health_card_number,primary_contact_notes,available_credit,secondary_contact_notes,ssn,employer_name,employment_status,phone,email,street_address_1,street_address_2,city,state,country,zip_code,secondary_phone,secondary_phone_type,secondary_email,secondary_street_address_1,secondary_street_address_2,secondary_city,secondary_state,secondary_country,secondary_zip_code,emergency_contact_relationship,emergency_contact_first_name,emergency_contact_last_name,emergency_contact_email,emergency_contact_phone,emergency_contact_street_address_1,emergency_contact_street_address_2,emergency_contact_city,emergency_contact_state,emergency_contact_zip_code,emergency_contact_country,secondary_emergency_contact_relationship,secondary_emergency_contact_first_name,secondary_emergency_contact_last_name,secondary_emergency_contact_email,secondary_emergency_contact_phone,secondary_emergency_contact_street_address_1,secondary_emergency_contact_street_address_2,secondary_emergency_contact_city,secondary_emergency_contact_state,secondary_emergency_contact_zip_code,secondary_emergency_contact_country,tertiary_emergency_contact_relationship,tertiary_emergency_contact_first_name,tertiary_emergency_contact_last_name,tertiary_emergency_contact_email,tertiary_emergency_contact_phone,tertiary_emergency_contact_street_address_1,tertiary_emergency_contact_street_address_2,tertiary_emergency_contact_city,tertiary_emergency_contact_state,tertiary_emergency_contact_zip_code,tertiary_emergency_contact_country,responsible_party_relationship,responsible_party_first_name,responsible_party_last_name,responsible_party_street_address_1,responsible_party_street_address_2,responsible_party_city,responsible_party_state,responsible_party_country,responsible_party_zip_code,responsible_party_phone,responsible_party_email,bill_to_responsible_party,hipaa_sign_date,preferred_provider,preferred_clinic{id,timezone,display_name,name,noah_provider,state},age_years,photo,next_appointment_moment,next_appointment,following_appointment_moment,following_appointment,previous_appointment_moment,previous_appointment,referral_source{id,name,is_active,referred_type},sub_referral_source{id,name,is_active,object_id,object_type,parent{id}},referring_physician,physicians,primary_care_physician,payment_source_type,balance,phone_type,preferred_communication_method,noah_id,noah_patient_id,patient_responsibility_balance,insurer_responsibility_balance,managed_care_responsibility_balance,primary_insurance_policy{id,hearing_benefit,deductible,copay,notes,insurer{name}},box_folder_id,crm_segment,managed_care_plan,hearing_loss_left,hearing_loss_right,left_ear_hearing_aid{id,status,is_in_use,display_name,delivered_at_display,service_plan_expiration_date,is_active,sale{id},inventory_product{id,status,condition,loanable,demoable,product{display_name},serial_number,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date},description,extended_warranty_expiration_date,manufacturer_warranty_expiration_date,purchase_date,serial_number,ear,due_date,type,subtype},right_ear_hearing_aid{id,status,is_active,is_in_use,display_name,delivered_at_display,service_plan_expiration_date,sale{id},inventory_product{id,condition,loanable,demoable,product{display_name},serial_number,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date},description,extended_warranty_expiration_date,manufacturer_warranty_expiration_date,purchase_date,serial_number,ear,due_date,type,subtype},hearing_loss_type_left,hearing_loss_type_right,hearing_loss_shape_left,hearing_loss_shape_right,most_recent_report{id,pure_tone_audiogram_report},assigned_tags,active_products_request{id},patient_notes,patient_staff_tasks,block_reviews,created_at_display,do_not_mail,do_not_email,do_not_message,do_not_call,staff_dialog_assignee{id},noah_verified,migration_source_id,updated_at,last_audiogram_date,gender}';
  
  const paramsDict = {}; 
  paramsDict['query'] ='{id,external_id,podium_id,podium_sync,full_name,is_active,first_name,middle_name,last_name,preferred_name,quickbooks_customer_id,title,suffix,birthdate,sex,marital_status,health_card_number,primary_contact_notes,available_credit,secondary_contact_notes,ssn,employer_name,employment_status,phone,email,street_address_1,street_address_2,city,state,country,zip_code,secondary_phone,secondary_phone_type,secondary_email,secondary_street_address_1,secondary_street_address_2,secondary_city,secondary_state,secondary_country,secondary_zip_code,emergency_contact_relationship,emergency_contact_relationship_other,emergency_contact_first_name,emergency_contact_last_name,emergency_contact_email,emergency_contact_phone,emergency_contact_street_address_1,emergency_contact_street_address_2,emergency_contact_city,emergency_contact_state,emergency_contact_zip_code,emergency_contact_country,secondary_emergency_contact_relationship,secondary_emergency_contact_relationship_other,secondary_emergency_contact_first_name,secondary_emergency_contact_last_name,secondary_emergency_contact_email,secondary_emergency_contact_phone,secondary_emergency_contact_street_address_1,secondary_emergency_contact_street_address_2,secondary_emergency_contact_city,secondary_emergency_contact_state,secondary_emergency_contact_zip_code,secondary_emergency_contact_country,tertiary_emergency_contact_relationship,tertiary_emergency_contact_relationship_other,tertiary_emergency_contact_first_name,tertiary_emergency_contact_last_name,tertiary_emergency_contact_email,tertiary_emergency_contact_phone,tertiary_emergency_contact_street_address_1,tertiary_emergency_contact_street_address_2,tertiary_emergency_contact_city,tertiary_emergency_contact_state,tertiary_emergency_contact_zip_code,tertiary_emergency_contact_country,responsible_party_relationship,responsible_party_first_name,responsible_party_last_name,responsible_party_street_address_1,responsible_party_street_address_2,responsible_party_city,responsible_party_state,responsible_party_country,responsible_party_zip_code,responsible_party_phone,responsible_party_email,bill_to_responsible_party,hipaa_sign_date,preferred_provider,preferred_clinic{id,timezone,display_name,name,noah_provider,state},age_years,photo,next_appointment_moment,next_appointment{id,type{id,name},needs_reschedule,title,start_moment,clinic{name,timezone},status,patient_feedback_rating,staff_member{first_name,last_name}},following_appointment_moment,following_appointment{id,type{id,name},needs_reschedule,title,start_moment,clinic{name,timezone},status,patient_feedback_rating,staff_member{first_name,last_name}},previous_appointment_moment,previous_appointment{id,type{id,name},needs_reschedule,title,start_moment,status,clinic{name,timezone},patient_feedback_rating,staff_member{first_name,last_name}},referral_source{id,name,is_active,referred_type},sub_referral_source{id,name,is_active,object_id,object_type,parent{id}},referring_physician,physicians,primary_care_physician,payment_source_type,balance,phone_type,preferred_communication_method,noah_id,noah_patient_id,patient_responsibility_balance,insurer_responsibility_balance,managed_care_responsibility_balance,secondary_insurance_policy{id,hearing_benefit,deductible,copay,notes,insurer{name}},primary_insurance_policy{id,hearing_benefit,deductible,copay,notes,insurer{name}},box_folder_id,crm_segment,managed_care_plan,hearing_loss_left,hearing_loss_right,left_ear_hearing_aid{id,status,is_in_use,display_name,delivered_at_display,service_plan_expiration_date,is_active,sale{id},inventory_product{id,status,condition,loanable,demoable,product{display_name},serial_number,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date},description,extended_warranty_expiration_date,manufacturer_warranty_expiration_date,purchase_date,serial_number,ear,due_date,type,subtype},right_ear_hearing_aid{id,status,is_active,is_in_use,display_name,delivered_at_display,service_plan_expiration_date,sale{id},inventory_product{id,condition,loanable,demoable,product{display_name},serial_number,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date},description,extended_warranty_expiration_date,manufacturer_warranty_expiration_date,purchase_date,serial_number,ear,due_date,type,subtype},hearing_loss_type_left,hearing_loss_type_right,hearing_loss_shape_left,hearing_loss_shape_right,most_recent_report{id,pure_tone_audiogram_report},assigned_tags,active_products_request{id},patient_notes,patient_staff_tasks,block_reviews,created_at_display,do_not_mail,do_not_email,do_not_message,do_not_call,staff_dialog_assignee{id},noah_verified,migration_source_id,updated_at,last_audiogram_date,gender,gender_other,caption_call_lead,latest_right_noah_device,latest_left_noah_device,referred_count}';

    const url = `${Constants.API_BASE_URL}/patients/${id !== undefined ? renderParam(id) : ''}/${renderQueryString(
    paramsDict
  )}`;
  // console.log("==== url :", url)
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
    // console.log("==== res :", res)

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

export const usePatientDeatilGET = (
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
    ['Gets', args],
    () => patientDeatilGET(Constants, args, handlers, timeout),
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

export const FetchPatientDeatilGET = ({
  children,
  onData = () => { },
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
  } = usePatientDeatilGET(
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : PAtient Details /patients/${id} ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchPatientDeatil: refetch });
};

export const patientDeatilWithIDGET = async (
  Constants,
  { id },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/patients/${encodeQueryParam(id)}`;
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

export const usePatientDeatilWithIDGET = (
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
    ['Gets', args],
    () => patientDeatilWithIDGET(Constants, args, handlers, timeout),
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

export const FetchPatientDeatilWithIDGET = ({
  children,
  onData = () => { },
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
  } = usePatientDeatilWithIDGET(
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : PAtient Detail using ID /patients/id ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({
    loading,
    data,
    error,
    refetchPatientDeatilWithID: refetch,
  });
};

export const patientsGET = async (
  Constants,
  { is_active, limit, offset, search },
  handlers,
  timeout
) => {
  const paramsDict = {};
  paramsDict['is_active'] =
    is_active !== undefined ? renderParam(is_active) : '';
  paramsDict['limit'] = limit !== undefined ? renderParam(limit) : '';
  paramsDict['offset'] = offset !== undefined ? renderParam(offset) : '';
  paramsDict['ordering'] = 'next_appointment,last_name,first_name,id';
  if (search !== undefined) {
    paramsDict['search'] = renderParam(search);
  }
  paramsDict['query'] =
    '{id,first_name,last_name,patient_responsibility_balance,balance,available_credit,insurer_responsibility_balance,managed_care_responsibility_balance,full_name,photo,birthdate,age_years,phone,assigned_tags{id,tag,description,expires_at},previous_appointment{id,type{name},status,start_moment,clinic{timezone},staff_member{first_name,last_name}},next_appointment{id,type{name},status,start_moment,clinic{name,timezone},staff_member{first_name,last_name}}}';
  const url = `${Constants.API_BASE_URL}/patients${renderQueryString(
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

export const usePatientsGET = (
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
    ['Gets', args],
    () => patientsGET(Constants, args, handlers, timeout),
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

export const FetchPatientsGET = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  is_active,
  limit,
  offset,
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
  } = usePatientsGET(
    { is_active, limit, offset, search },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Get PAtients  /patients ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchPatients: refetch });
};

export const patientsChartNotesPOST = async (
  Constants,
  _args,
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/chart-notes`;
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
        text: '<p></p>',
        icd10_codes: [],
        patient: 5419,
        type: 1,
        clinic: 1,
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

export const usePatientsChartNotesPOST = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      patientsChartNotesPOST(Constants, { ...initialArgs, ...args }, handlers),
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

export const FetchPatientsChartNotesPOST = ({
  children,
  onData = () => { },
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
    mutate: refetch,
  } = usePatientsChartNotesPOST(
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Add Patient Chart Note /chart-notes',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchPatientsChartNotes: refetch });
};

export const resetPasswordPOST = async (
  Constants,
  { emailId },
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
      body: JSON.stringify({ email: emailId }),
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

export const useResetPasswordPOST = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args => resetPasswordPOST(Constants, { ...initialArgs, ...args }, handlers),
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

export const FetchResetPasswordPOST = ({
  children,
  onData = () => { },
  handlers = {},
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  retry,
  staleTime,
  timeout,
  emailId,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    mutate: refetch,
  } = useResetPasswordPOST(
    { emailId },
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Reset Password  /auth/users/reset_password/ ',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchResetPassword: refetch });
};

export const signinPOST = async (
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

export const useSigninPOST = (
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
    ['Post', args],
    () => signinPOST(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () => queryClient.invalidateQueries(['Posts']),
    }
  );
};

export const FetchSigninPOST = ({
  children,
  onData = () => { },
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
  } = useSigninPOST(
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
      logError('API_FAILED :', error);
      if (error.status) {
        logError('API_FAILED :  ' + error.status + ' ' + error.statusText);
        logError('API_FAILED : Sign in /auth/token/login/',  error.status + ' ' + error.statusText )

      }
    }
  }, [error]);
  return children({ loading, data, error, refetchSignin: refetch });
};

export const updatePatientsInfoPATCH = async (
  Constants,
  { id, phone_type, email, street_address_1, street_address_2, city, zip_code, country, phone, state, first_name, last_name, middle_name },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/patients/${encodeQueryParam(
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
        phone_type: phone_type,
        email: email,
        street_address_2: street_address_2,
        street_address_1: street_address_1,
        city: city,
        state: state,
        zip_code: zip_code,
        country: country,
        phone: phone,
        first_name: first_name,
        middle_name: middle_name,
        last_name: last_name,
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

export const useUpdatePatientsInfoPATCH = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      updatePatientsInfoPATCH(
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

export const updateAppointmentsStatusPATCH = async (
  Constants,
  { id, status },
  handlers,
  timeout
) => {
  const url = `${Constants.API_BASE_URL}/appointments/${encodeQueryParam(
    id
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
        status: status,
        intake_form_request: {
          intake_form_request_submissions: { create: [] },
        },
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

export const useUpdateAppointmentsStatusPATCH = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      updateAppointmentsStatusPATCH(
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

export const updateNoteStatusPATCH = async (
  Constants,
  { id, note, icd10_codes },
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
      body: JSON.stringify({ text: note, icd10_codes: icd10_codes, status: 2 }),
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

export const useUpdateNoteStatusPATCH = (
  initialArgs = {},
  { handlers = {} } = {}
) => {
  const queryClient = useQueryClient();
  const Constants = GlobalVariables.useValues();
  return useMutation(
    args =>
      updateNoteStatusPATCH(Constants, { ...initialArgs, ...args }, handlers),
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
