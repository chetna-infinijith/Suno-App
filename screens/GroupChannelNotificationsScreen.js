import React from 'react';

import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import { createGroupChannelNotificationsFragment } from '@sendbird/uikit-react-native';
import { useNavigation } from "@react-navigation/native";

const GroupChannelNotificationsFragment = createGroupChannelNotificationsFragment();
const GroupChannelNotificationsScreen = (props) => {
    const navigation = useNavigation();

    const { params } = props.route
    const { sdk } = useSendbirdChat();
    const { channel } = useGroupChannel(sdk, params.channelUrl);

    if (!channel) return null;

    return (
        <GroupChannelNotificationsFragment
            channel={channel}
            onPressHeaderLeft={() => {
                navigation.goBack();
            }}
        />
    );
};

export default GroupChannelNotificationsScreen;
