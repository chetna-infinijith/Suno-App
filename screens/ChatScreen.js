import React, { useContext, useLayoutEffect, useState } from 'react';
import { Icon, ScreenContainer, withTheme } from '@draftbit/ui';
import { View, ActivityIndicator, TouchableOpacity, Image, Platform } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import * as Notifications from "expo-notifications";

import {
  useSendbirdChat,
  createGroupChannelListFragment,
  createGroupChannelCreateFragment,
  createGroupChannelFragment,
  GroupChannelListContexts,
} from '@sendbird/uikit-react-native';
import { useGroupChannel, useTotalUnreadMessageCount } from '@sendbird/uikit-chat-hooks';

import useWindowDimensions from '../utils/useWindowDimensions';

import * as GlobalVariables from '../config/GlobalVariableContext';
import * as SunoApi from '../apis/SunoApi.js';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import palettes from '../themes/palettes.js';
import * as StyleSheet from '../utils/StyleSheet';
import CustomHeaderBlock from '../components/CustomHeaderBlock.js';
import NewChannelPopup from '../global-functions/NewChannelPopup.js';
import imageSource from '../utils/imageSource.js';
import Images from '../config/Images.js';

export const useRouteParams = () => {
  const { params } = useRoute();
  return params;
};

export const useAppNavigation = () => {
  const navigation = useNavigation();
  const params = useRouteParams();

  return { navigation, params };
};


// ---- Your other imports remain untouched ----
const UseReactNavigationHeader = () => {
  const { navigation } = useAppNavigation();
  const fragment = useContext(GroupChannelListContexts.Fragment);
  const typeSelector = useContext(GroupChannelListContexts.TypeSelector);
  const Constants = GlobalVariables.useValues();
  const { SendBirdInfo } = Constants;

  const member = SendBirdInfo;
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Chetna',
      headerTitleAlign: 'left',
      headerLeft: () => (
        <View>
          {member?.profileUrl ?
            <Image
              source={{ uri: member?.profileUrl }}
              style={{
                width: 45,
                height: 45,
                borderRadius: 30,
                backgroundColor: '#ddd',
              }}
            /> :
            <Icon
              size={30}
              name={'FontAwesome/user-circle-o'}
              color={'#0000008a'}
            />
          }
        </View>
      ),
      headerRight: () => (     // ← MUST BE A FUNCTION
        <TouchableOpacity onPress={typeSelector.show} style={{ marginLeft: 10 }}>
          <Icon
            size={30}
            name={'MaterialCommunityIcons/chat-plus'}
            color={'#8b3bff'}
          />
        </TouchableOpacity>
      ),
    })
  }, [])

  return null;
}


const CustomListItem = ({ onPress }) => {
  const [showPopup, setShowPopup] = useState(false);

  const Constants = GlobalVariables.useValues();
  const { SendBirdInfo } = Constants;

  const member = SendBirdInfo;   // Show 1-to-1 chat partner

  return (

    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3, // Android shadow,
        padding: 20,
        marginTop: 10,
        marginHorizontal: 10,
        marginBottom: 10
      }}
    >
      {/* Avatar */}
      {/* <TouchableOpacity onPress={() => onPressAvatar?.(channel)}> */}
      {member?.profile_url ?
        <Image
          source={{ uri: member?.profile_url }}
          style={{
            width: 45,
            height: 45,
            borderRadius: 30,
            backgroundColor: '#ddd',
          }}
        /> :
        <Icon
          size={30}
          name={'FontAwesome/user-circle-o'}
          color={'#0000008a'}
        />
      }
      {/* </TouchableOpacity> */}

      {/* Title + Sub Title */}
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>
          {member?.nickname || channel.name}
        </Text>

        <Text style={{ fontSize: 12, color: '#888', paddingRight: 10 }} numberOfLines={1}>
          {member?.user_id}
        </Text>
      </View>

      {/* Action Button (chat bubble with +) */}
      <TouchableOpacity
        onPress={() => onPress()}
        style={{
          width: 32,
          height: 32,

          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* <Icon
          size={30}
          name={'MaterialCommunityIcons/chat-plus'}
          color={'#8b3bff'}
        /> */}


        <Image source={imageSource(Images['chat'])} style={{
          width: 32,
          height: 32,
          tintColor: '#8b3bff',   // ← applies color
        }} />
      </TouchableOpacity>
    </View>

  );
};


const GroupChannelListFragment = createGroupChannelListFragment({
  Header: () => null
});
// const GroupChannelListFragment = createGroupChannelListFragment({ Header: UseReactNavigationHeader });


const ChatScreen = (props) => {
  const { theme } = props;
  const { params } = useRoute();

  const navigation = useNavigation();
  const dimensions = useWindowDimensions();

  const { sdk } = useSendbirdChat();

  const totalUnreadMessages = useTotalUnreadMessageCount(sdk);
  Notifications.setBadgeCountAsync(totalUnreadMessages);

  // const { channel } = useGroupChannel(sdk, params.channelUrl);

  const Constants = GlobalVariables.useValues();
  const setGlobalVariableValue = GlobalVariables.useSetValue();

  const [showPopup, setShowPopup] = useState(false);

  React.useEffect(() => {
    
  }, []);
  return (
    <ScreenContainer
      scrollable={false}
      hasBottomSafeArea={false}
      hasSafeArea={false}
      hasTopSafeArea={true}
      style={StyleSheet.applyWidth(
        {
          backgroundColor: palettes.App['Custom Color_15'],
          justifyContent: 'space-between',
        },
        dimensions.width
      )}
    >
      <>
        <View
          style={StyleSheet.applyWidth(
            { backgroundColor: palettes.App['Custom Color_15'], flex: 1 },
            dimensions.width
          )}
        >
          <CustomHeaderBlock />
          <NewChannelPopup
            visible={showPopup}
            onClose={() => setShowPopup(false)}
            onSelectGroup={(channelType) => {
              setShowPopup(false);
              navigation.navigate('GroupChannelCreate', { channelType });
            }}
          />
          <CustomListItem
            onPress={() => {
              setShowPopup(true);
              // navigation.navigate('GroupChannelCreate', { channelType });
            }}
          />

          <GroupChannelListFragment

            onPressCreateChannel={(channelType) => {
              navigation.navigate('GroupChannelCreate', { channelType });
            }}
            onPressChannel={(channel) => {
              navigation.navigate('GroupChannel', { channelUrl: channel.url });
            }}
          />
        </View>
      </>
    </ScreenContainer>

  );
};

export default withTheme(ChatScreen);
