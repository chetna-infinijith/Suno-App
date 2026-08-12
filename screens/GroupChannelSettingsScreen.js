import React from "react";

import { useGroupChannel } from "@sendbird/uikit-chat-hooks";
import {
    createGroupChannelSettingsFragment,
    useSendbirdChat,
} from "@sendbird/uikit-react-native";

import { useNavigation } from "@react-navigation/native";

const GroupChannelSettingsFragment = createGroupChannelSettingsFragment();
const GroupChannelSettingsScreen = (props) => {
    const navigation = useNavigation();

    const { params } = props.route
    const { sdk } = useSendbirdChat();
    const { channel } = useGroupChannel(sdk, params.channelUrl);
    if (!channel) return null;

    return (
        <GroupChannelSettingsFragment
            channel={channel}
            onPressHeaderLeft={() => {
                // Navigate back
                navigation.goBack();
            }}
            
            onPressMenuModeration={() => {
                // Navigate to group channel moderation
                navigation.push('GroupChannelModeration', params);
            }}
            onPressMenuSearchInChannel={() => {
                // Navigate to group channel message search
                navigation.push('MessageSearch', params);
            }}
            onPressMenuMembers={() => {
                // Navigate to group channel members
                navigation.push('GroupChannelMembers', params);
            }}
            onPressMenuLeaveChannel={() => {
                console.log("==== Leave Channel")
                // Navigate to group channel list
                // navigation.navigate('ChatScreen');
                // navigation.reset({
                //     index: 0,
                //     routes: [{ name: 'ChatScreen' }],
                //   });

                navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'BottomTabNavigator',
                        state: {
                            index: 4, // ← Chat tab position
                            routes: [
                              { name: 'ScheduleScreen' },
                              { name: 'PatientScreen' },
                              { name: 'InboxScreen' },
                              { name: 'TaskScreen' },
                              { name: 'ChatScreen' }]
                        }
                      }
                    ]
                  });
            }}
            onPressMenuNotification={() => {
                // Navigate to group channel notifications
                navigation.navigate('GroupChannelNotifications', params);
            }}
        />
    );
};

export default GroupChannelSettingsScreen;
