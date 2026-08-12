import { withTheme } from '@draftbit/ui';
import { useNavigation } from '@react-navigation/native';
import {
    useSendbirdChat,
    createGroupChannelListFragment,
} from '@sendbird/uikit-react-native';

const GroupChannelListFragment = createGroupChannelListFragment();

 const GroupChannelListScreen = () => {
    const navigation = useNavigation();
  
    return (
      <GroupChannelListFragment
        onPressCreateChannel={(channelType) => {
          navigation.navigate('GroupChannelCreate', { channelType });
        }}
        onPressChannel={(channel) => {
          console.log('Open Channel →', channel.url);
          navigation.navigate('GroupChannel', { channelUrl: channel.url });
        }}
      />
    );
  };

  export default withTheme(GroupChannelListScreen);
