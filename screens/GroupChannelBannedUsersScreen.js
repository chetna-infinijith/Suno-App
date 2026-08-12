import React from 'react';

import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import { createGroupChannelBannedUsersFragment, useSendbirdChat } from '@sendbird/uikit-react-native';

import { useNavigation } from "@react-navigation/native";

const GroupChannelBannedUsersFragment = createGroupChannelBannedUsersFragment();
const GroupChannelBannedUsersScreen = (props) => {
  const navigation = useNavigation();

  const { params } = props.route
  const { sdk } = useSendbirdChat();
  const { channel } = useGroupChannel(sdk, params.channelUrl);
  if (!channel) return null;

  return (
    <GroupChannelBannedUsersFragment
      channel={channel}
      onPressHeaderLeft={() => {
        // Navigate back
        navigation.goBack();
      }}
    />
  );
};

export default GroupChannelBannedUsersScreen;
