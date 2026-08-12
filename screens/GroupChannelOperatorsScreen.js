import React from 'react';

import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import { createGroupChannelOperatorsFragment, useSendbirdChat } from '@sendbird/uikit-react-native';
import { useNavigation } from "@react-navigation/native";


const GroupChannelOperatorsFragment = createGroupChannelOperatorsFragment();
const GroupChannelOperatorsScreen = (props) => {
    const navigation = useNavigation();

    const { params } = props.route

    const { sdk } = useSendbirdChat();
    const { channel } = useGroupChannel(sdk, params.channelUrl);
    if (!channel) return null;

    return (
        <GroupChannelOperatorsFragment
            channel={channel}
            onPressHeaderLeft={() => {
                // Navigate back
                navigation.goBack();
            }}
            onPressHeaderRight={() => {
                // Navigate to group channel set as operators
                navigation.navigate('GroupChannelRegisterOperator', params);
            }}
        />
    );
};

export default GroupChannelOperatorsScreen;
