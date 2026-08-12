import React from 'react';

import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import { createGroupChannelRegisterOperatorFragment, useSendbirdChat } from '@sendbird/uikit-react-native';
import { useNavigation } from "@react-navigation/native";

const GroupChannelRegisterOperatorFragment = createGroupChannelRegisterOperatorFragment();
const GroupChannelRegisterOperatorScreen = (props) => {
    const navigation = useNavigation();

    const { params } = props.route
    const { sdk } = useSendbirdChat();
    const { channel } = useGroupChannel(sdk, params.channelUrl);
    if (!channel) return null;

    return (
        <GroupChannelRegisterOperatorFragment
            channel={channel}
            onPressHeaderLeft={() => {
                // Navigate back
                navigation.goBack();
            }}
            onPressHeaderRight={() => {
                // Navigate to group channel operators
                navigation.navigate('GroupChannelOperators', params);
            }}
        />
    );
};

export default GroupChannelRegisterOperatorScreen;
