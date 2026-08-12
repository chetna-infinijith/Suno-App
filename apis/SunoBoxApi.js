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

export const getDocumentFolderGET = async (
  Constants,
  { direction, fields, id, limit, offset, sort },
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
  if (sort !== undefined) {
    paramsDict['sort'] = renderParam(sort);
  }
  if (fields !== undefined) {
    paramsDict['fields'] = renderParam(fields);
  }
  if (direction !== undefined) {
    paramsDict['direction'] = renderParam(direction);
  }
  const url = `https://api.box.com/2.0/folders/${encodeQueryParam(
    id
  )}${renderQueryString(paramsDict)}`;
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
        Authorization:
          'Bearer 1!8I7KHVxWp1ONhmJOS1Fi9391A9ArPUQ_udBFIU9fOIufUbsCYB1wxJmUkQRZzK8Mg2yBTIgqHDDLMc9-sTuffDJiclZGxch7FXSos-3LfZGiDZcnqllu7-H3h2WGQ2R2AE-4pvn72i42gb5sxWd3CF1OoI_O2ZHhDUPB8Srr3lzuavcWkDSkKdT_4_3UrB5hX7VXbqPDqoQp25ThmmU_6rLeQ3t38AhbGXE9ET4fZ1QF2hsl2c3mws1Hr6f5zs-cG4xuzGcPNIWQkT6uGLpyaMfisX9iABFUHJmVDNYoLDS-FoaMxoJim8qwGgfWKBZ1Rlu9LeqaLGoAh5xfXw4CvL_qzF4k9rxSih5uR0T4bMiE-MBSPxI5zYKzAWfsFSZ87e9Kdwjy2QaJN92OwyrEj4CryZxhNMKv9fo1l0lUDYkhjrIzBLHdXXs_rCBr6JRKQJT8lyb1TjrK4aIFH1zQ1iZQ72yHjlrVAnda3GMktq_g4QLfTQ0Ehdr2XuuchldfWqsT4xDNuCDBXZ7YkUs40fOuVQbc0EMBXP_tt0ps04Z8TEsJypNRUSVFJ71tKf1DH0xEpXcpvIu22aNj7v7i_6RLQbpM_L3mbvkSoQAdZ-t9wXdkFYWF-QNiNnONn22Beki-brTiaN7YcTtygqybDY1t_Y9c7s68o6VWbekDwLorcbNgIS6AledNQ-V9kWMDJXqAv_QyQB9MH_5nCTzM9HG_WL6OVzirFrTXVWpcSHBPF6HMdsyfMKbUDqI0XNvLXaRnNOVX8ZWuDQqYcYt9V6Kij6UbbHfTuaf7-FMrPm90-coSKk4I01LceA--8evJlqrC9T_M2jt3ApiV5SYdQCWvXKi5h_KnXppxeSlFuEgBIlQ2YljbymAymZUccGFPtE0hdARyM2E1Yc7jjNHXz8wrnVi46V-17MtYN-kBvBmekh7JP4pMASqYloTL-yabAMkQ_mw74CbhAgRMkdnWT5Jbwqcxh3TyWPzJvD1hJqABlpDYfiaUz9sS2bbqGX4fqWk3HqruPrB_l1i0HHFAUb1SpiJqxJ6mhKE1vIIoY1XbhtW5Z2XU64CoVmU7c3Ys2EtdH-10lcqn9ZkeEPwYqpvXqEx1fX0jpzNnm4MWr7kosxX-V7lff8Kq3iZn3FZv2KkoVqD073I1AebCJ3OGyTcJaQK4Zlxz3v-Bjkz2qcAZvhH8q4ZIGD2j7GDjIR0fv0wj1vn_Hqo0WVq51R7dGeYtA6LWPJTftUKbXYkqkzdxD2564zZkAPt9k2yqbInRWOnYwz4KToIw3N0vheAuuuF6_VJ2qDz79i4nuAZcOMUAhSTv0ReSIsrC_Sy_I-xHr9YxlIDt21yVB9b51QUD19Pn2kSD0Gol-4xqI0RdzOng8S8pL4hhqAbZgDSxy-91Oy5B4zoM_PJ8EeAUaJ9YZghQVLjyhrmbzzTGCdjkJzoHxKTgO_W1s5MYi6nNzrM-mTn9EeD_l6km1tIu7jbwy9nfSs2A1zWjwKHepgzV0MJsRK78HbwplnhbTPMdPYxZ2hrHJgVXH8WCi0d_aNYno0LKNwB_J714IDOtHpyXP83jSI4QMD9RGIk9OlUn7tl5pl-0-XBGpBjIp_m4H-9AHMLy87r_nx2xX_7aY1Ph',
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

export const useGetDocumentFolderGET = (
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
    ['sunoBoxGetDocumentFolderGET', args],
    () => getDocumentFolderGET(Constants, args, handlers, timeout),
    {
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      staleTime,
      onSuccess: () =>
        queryClient.invalidateQueries(['sunoBoxGetDocumentFolderGETS']),
    }
  );
};

export const FetchGetDocumentFolderGET = ({
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
  direction,
  fields,
  id,
  limit,
  offset,
  sort,
}) => {
  const Constants = GlobalVariables.useValues();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {
    isLoading: loading,
    data,
    error,
    refetch,
  } = useGetDocumentFolderGET(
    { direction, fields, id, limit, offset, sort },
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
  return children({ loading, data, error, refetchGetDocumentFolder: refetch });
};
