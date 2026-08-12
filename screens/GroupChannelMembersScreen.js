import React from 'react';

import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import { createGroupChannelMembersFragment, useSendbirdChat } from '@sendbird/uikit-react-native';
import { useNavigation } from "@react-navigation/native";


const GroupChannelMembersFragment = createGroupChannelMembersFragment();

const GroupChannelMembersScreen = (props) => {
    const navigation = useNavigation();

    const { params } = props.route
    const { sdk } = useSendbirdChat();
    const { channel } = useGroupChannel(sdk, params.channelUrl);
    if (!channel) return null;

    return (
        <GroupChannelMembersFragment
            channel={channel}
            onPressHeaderLeft={() => {
                navigation.goBack();
            }}
            onPressHeaderRight={() => {
                navigation.push('GroupChannelInvite', params);
            }}
        />
    );
};

export default GroupChannelMembersScreen;
