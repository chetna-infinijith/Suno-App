import React from 'react';
import {
  Circle,
  CircleImage,
  Icon,
  IconButton,
  Picker,
  ScreenContainer,
  SimpleStyleFlatList,
  Surface,
  TextInput,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import { ActivityIndicator, Modal, Text, View } from 'react-native';
import { Fetch } from 'react-request';
import * as GlobalStyles from '../GlobalStyles.js';
import * as SunoApi from '../apis/SunoApi.js';
import CustomHeaderBlock from '../components/CustomHeaderBlock';
import * as GlobalVariables from '../config/GlobalVariableContext';
import * as CustomCode from '../custom-files/CustomCode';
import * as customMessagesList from '../custom-files/customMessagesList';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import Breakpoints from '../utils/Breakpoints';
import * as DateUtils from '../utils/DateUtils';
import * as StyleSheet from '../utils/StyleSheet';
import imageSource from '../utils/imageSource';
import showAlertUtil from '../utils/showAlert';
import useIsFocused from '../utils/useIsFocused';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const InboxBackupScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const setGlobalVariableValue = GlobalVariables.useSetValue();
  const [allMessagesList, setAllMessagesList] = React.useState([]);
  const [filteredMessageList, setFilteredMessageList] = React.useState([]);
  const [hasMoreData, setHasMoreData] = React.useState(true);
  const [isFilterActive, setIsFilterActive] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [limit, setLimit] = React.useState(30);
  const [messageCount, setMessageCount] = React.useState([]);
  const [messagesDataList, setMessagesDataList] = React.useState([]);
  const [multipleSelectValue, setMultipleSelectValue] = React.useState([
    { label: 'All Messages', value: 'all' },
    { label: 'Assigned to me', value: 'assigned' },
    { label: 'Unread', value: 'unread' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
  ]);
  const [newApptModal, setNewApptModal] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const [pickerValue, setPickerValue] = React.useState('all');
  const [searchInputValue, setSearchInputValue] = React.useState('');
  const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);
  const [unreadMessage, setUnreadMessage] = React.useState(
    'unread_inbound_message_count > 1'
      ? theme.colors.text.success
      : theme.colors.foreground.brand
  );
  const filterDropdownList = (messagesDataList, selectedFilter, senderID) => {
    console.log(
      'Filtering:',
      selectedFilter,
      'from',
      messagesDataList.length,
      'records'
    );

    // simple logic
    // let results = messagesDataList;
    // if (selectedFilter === "assigned") {
    //   results = messagesDataList.filter(msg => msg.staff_dialog_assignee?.id === senderID);
    // }
    // else if (selectedFilter === "unread") {
    //   results = messagesDataList.filter(msg => (msg.unread_inbound_message_count || 0) > 0);
    // }
    // else if (selectedFilter === "oldest") {
    //   results = [...messagesDataList].sort((a, b) => {
    //     const dateA = new Date(a.most_recent_message?.created_at || 0);
    //     const dateB = new Date(b.most_recent_message?.created_at || 0);
    //     return dateA - dateB;
    //   });
    // }
    // else if (selectedFilter === "newest") {
    //   results = [...messagesDataList].sort((a, b) => {
    //     const dateA = new Date(a.most_recent_message?.created_at || 0);
    //     const dateB = new Date(b.most_recent_message?.created_at || 0);
    //     return dateB - dateA;
    //   });
    // }

    // return results;

    ///////////////////////////////////////////////////////////

    // intermediate switch case methods
    let results = [...messagesDataList];
    switch (selectedFilter) {
      case 'assigned':
        results = results.filter(
          msg => msg.staff_dialog_assignee?.id === senderID
        );
        break;

      case 'unread':
        results = results.filter(
          msg => (msg.unread_inbound_message_count || 0) > 0
        );
        break;

      case 'oldest':
        results.sort((a, b) => {
          const dateA = new Date(
            a.most_recent_texting_message?.created_at || '2000-01-01'
          );
          const dateB = new Date(
            b.most_recent_texting_message?.created_at || '2000-01-01'
          );
          return dateA - dateB;
        });
        break;

      case 'newest':
        results.sort((a, b) => {
          const dateA = new Date(
            a.most_recent_texting_message?.created_at || '2000-01-01'
          );
          const dateB = new Date(
            b.most_recent_texting_message?.created_at || '2000-01-01'
          );
          return dateB - dateA;
        });
        break;
    }

    console.log('Filtered to:', results.length, 'records');
    return results;

    ////////////////////////////////////////////////////////////

    // conditional loop chaining method
    // let filteredResults = [...messagesDataList];

    // if (selectedFilter === "assigned") {
    //   filteredResults = messagesDataList.filter(message => {
    //     const hasAssignee = message.staff_dialog_assignee && message.staff_dialog_assignee.id === senderID;
    //     console.log("Message", message.id, "Assigned to me:", hasAssignee);
    //     return hasAssignee;
    //   });
    // }

    // if (selectedFilter === "unread") {
    //   filteredResults = messagesDataList.filter(message => {
    //     const hasUnread = message.unread_inbound_message_count > 0;
    //     console.log("Message", message.id, "Unread count:", message.unread_inbound_message_count);
    //     return hasUnread;
    //   });
    // }

    // if (selectedFilter === "oldest" || selectedFilter === "newest") {
    //   filteredResults.sort((a, b) => {
    //     // Use most_recent_texting_message_created_at or fallback to most_recent_message
    //     const getDate = (message) => {
    //       const dateStr = message.most_recent_texting_message?.created_at ||
    //                      message.most_recent_message?.created_at ||
    //                      message.most_recent_inbound_message?.created_at;

    //       if (dateStr) {
    //         const date = new Date(dateStr);
    //         return isNaN(date.getTime()) ? new Date('2000-01-01') : date;
    //       }
    //       return new Date('2000-01-01');
    //     };

    //     const dateA = getDate(a);
    //     const dateB = getDate(b);

    //     // OLDEST first: ascending order (smaller dates first)
    //     if (selectedFilter === "oldest") {
    //       return dateA - dateB;
    //     }
    //     // NEWEST first: descending order (larger dates first)
    //     else {
    //       return dateB - dateA;
    //     }
    //   });
    // }

    // console.log("Final filtered count:", filteredResults.length);
    // console.log("First 3 results:");
    // filteredResults.slice(0, 3).forEach((msg, i) => {
    //   console.log(`${i+1}. ID:${msg.id}, Date:${msg.most_recent_texting_message?.created_at}, Unread:${msg.unread_inbound_message_count}`);
    // });

    // return filteredResults;
  };

  const getDisplayMessages = (
    allMessagesList,
    messageFilterList,
    isFiltering
  ) => {
    console.log('📊 Display Data Check:', {
      isFiltering: isFiltering,
      allCount: allMessagesList?.length,
      filteredCount: messageFilterList?.length,
    });

    // If "all" is selected or no filter, return original list
    if (isFiltering) {
      console.log('✅ Returning filtered messages');
      return messageFilterList || [];
    }

    // Otherwise return all messages
    console.log('📋 Returning all messages');
    return allMessagesList || [];
  };

  const messageListPagination = (messagesDataList, msgPaginationData) => {
    const messageCombineData = [...messagesDataList, ...msgPaginationData];

    const matchingList = messageCombineData.filter(
      (item, index, self) => index === self.findIndex(t => t.id === item.id)
    );
    return matchingList;
  };
  const isFocused = useIsFocused();
  React.useEffect(() => {
    const handler = async () => {
      try {
        if (!isFocused) {
          return;
        }
        const unReadMsgCount = (
          await SunoApi.getUnreadMessagesCountGET(Constants, {
            clinics: Constants['clinic_pk_id'],
          })
        )?.json;
      } catch (err) {
        console.log(err);
      }
    };
    handler();
  }, [isFocused]);

  return (
    <ScreenContainer
      scrollable={false}
      hasSafeArea={true}
      hasTopSafeArea={false}
      style={StyleSheet.applyWidth({ height: '100%' }, dimensions.width)}
    >
      <CustomHeaderBlock isNotificationVisible={false} />
      {/* CustomMsgList */}
      <Utils.CustomCodeErrorBoundary>
        <customMessagesList.MessagesList />
      </Utils.CustomCodeErrorBoundary>
      {/* Fab Button View */}
      <View
        style={StyleSheet.applyWidth(
          { bottom: 18, position: 'absolute', right: 20 },
          dimensions.width
        )}
      >
        <Touchable
          onPress={() => {
            try {
              setNewApptModal(true);
            } catch (err) {
              console.log(err);
            }
          }}
        >
          <Circle
            bgColor={palettes.App['Custom Color_5']}
            size={50}
            style={StyleSheet.applyWidth(
              { backgroundColor: theme.colors.branding.secondary },
              dimensions.width
            )}
          >
            <Icon
              size={24}
              color={theme.colors.background.base}
              name={'Feather/plus'}
            />
          </Circle>
        </Touchable>
      </View>
    </ScreenContainer>
  );
};

export default withTheme(InboxBackupScreen);
