// sendbirdManager.js

let sendbirdSDK = null;

export const SetSendbirdSDK = (sdk) => {
  sendbirdSDK = sdk;
};

export const GetSendbirdSDK = () => sendbirdSDK;