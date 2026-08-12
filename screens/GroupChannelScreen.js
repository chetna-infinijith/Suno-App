import { withTheme } from '@draftbit/ui';
import { useNavigation } from '@react-navigation/native';
import {
    useSendbirdChat,
    createGroupChannelFragment,
} from '@sendbird/uikit-react-native';
import { useGroupChannel } from "@sendbird/uikit-chat-hooks";


// import { useNavigation, useRoute } from '@react-navigation/native';


// export const useRouteParams = () => {
//   const { params } = useRoute();
//   return params ;
// };

// export const useAppNavigation = () => {
//   const navigation = useNavigation();
//   const params = useRouteParams();

//   return { navigation, params };
// };


const GroupChannelFragment = createGroupChannelFragment();

 const GroupChannelScreen = (props) => {
  const {params} = props.route

    const navigation = useNavigation();
    const { sdk } = useSendbirdChat();
    const { channel } = useGroupChannel(sdk, params.channelUrl);
    if (!channel) return null;
    return (
      <GroupChannelFragment
      channel={channel}
      searchItem={params.searchItem}
      onPressMediaMessage={(fileMessage, deleteMessage) => {
        // Navigate to media viewer
        // navigation.navigate(Routes.FileViewer, {
        //   serializedFileMessage: fileMessage.serialize(),
        //   deleteMessage,
        // });
      }}
      onChannelDeleted={() => {
        // Should leave channel, navigate to channel list
        navigation.navigate('GroupChannelList');
      }}
      onPressHeaderLeft={() => {
        // Navigate back
        navigation.goBack();
      }}
      onPressHeaderRight={() => {
        // Navigate to group channel settings
        navigation.push('GroupChannelSettings', params);
      }}
    />
    );
  };

  export default withTheme(GroupChannelScreen);
