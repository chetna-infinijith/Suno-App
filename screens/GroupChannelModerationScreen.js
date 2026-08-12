import React from 'react';

import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import { createGroupChannelModerationFragment, useSendbirdChat } from '@sendbird/uikit-react-native';
import { useNavigation } from "@react-navigation/native";


const GroupChannelModerationFragment = createGroupChannelModerationFragment();
const GroupChannelModerationScreen = (props) => {
    const navigation = useNavigation();

    const { params } = props.route
    const { sdk } = useSendbirdChat();
    const { channel } = useGroupChannel(sdk, params.channelUrl);
    if (!channel) return null;

    return (
        <GroupChannelModerationFragment
            channel={channel}
            onPressMenuOperators={() => {
                // Navigate to group channel operators
                navigation.push('GroupChannelOperators', params);
            }}
            onPressMenuMutedMembers={() => {
                // Navigate to group channel muted members
                navigation.push('GroupChannelMutedMembers', params);
            }}
            onPressMenuBannedUsers={() => {
                // Navigate to group channel banned users
                navigation.push('GroupChannelBannedUsers', params);
            }}
            onPressHeaderLeft={() => {
                // Navigate back
                navigation.goBack();
            }}
        />
    );
};

export default GroupChannelModerationScreen;
