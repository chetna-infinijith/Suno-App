import React from 'react';

import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import { createGroupChannelInviteFragment, useSendbirdChat } from '@sendbird/uikit-react-native';
import { SendbirdUser } from '@sendbird/uikit-utils';
import { useNavigation } from "@react-navigation/native";


const GroupChannelInviteFragment = createGroupChannelInviteFragment();

const GroupChannelInviteScreen = (props) => {
    const navigation = useNavigation();

    const { params } = props.route

    const { sdk } = useSendbirdChat();
    const { channel } = useGroupChannel(sdk, params.channelUrl);
    if (!channel) return null;

    return (
        <GroupChannelInviteFragment
            channel={channel}
            onPressHeaderLeft={() => {
                navigation.goBack();
            }}
            onInviteMembers={(channel) => {
                navigation.navigate('GroupChannel', { channelUrl: channel.url });
            }}
        />
    );
};

export default GroupChannelInviteScreen;
