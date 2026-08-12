let sessionId = null;

export const generateSessionId = () => {
  sessionId = `${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 8)}`;
  return sessionId;
};

export const getSessionId = () => {
  return sessionId;
};
