import React from 'react';

import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import { createGroupChannelMutedMembersFragment, useSendbirdChat } from '@sendbird/uikit-react-native';
import { useNavigation } from "@react-navigation/native";


const GroupChannelMutedMembersFragment = createGroupChannelMutedMembersFragment();
const GroupChannelMutedMembersScreen = (props) => {
    const navigation = useNavigation();

    const { params } = props.route
    const { sdk } = useSendbirdChat();
    const { channel } = useGroupChannel(sdk, params.channelUrl);
    if (!channel) return null;

    return (
        <GroupChannelMutedMembersFragment
            channel={channel}
            onPressHeaderLeft={() => {
                // Navigate back
                navigation.goBack();
            }}
        />
    );
};

export default GroupChannelMutedMembersScreen;
