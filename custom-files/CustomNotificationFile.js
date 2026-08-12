import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
  Animated,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import * as GlobalVariables from '../config/GlobalVariableContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { logError } from '../index';
import { checkInternetAndProceed } from './InternetConnection';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [flatListData, setFlatListData] = useState([]);
  const swipeableRefs = useRef({});
  const navigation = useNavigation();

  const globalValues = GlobalVariables.useValues();
  const setGlobalVariableValue = GlobalVariables.useSetValue();
  const { clinic_pk_id, regionId, senderID, AUTH_HEADER } = globalValues;
  const USER_ID = senderID;
  const CLINIC_ID = clinic_pk_id;
  const hasUnreadNotifications = notifications.some(notification => !notification.is_read);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    const isConnected = await checkInternetAndProceed();
    if (!isConnected) {
      return;
    }
    try {
     
      setError(null);
      const query = encodeURIComponent('{id,type,title,description,created_at,is_read,extra,is_active,clinic{id,name,timezone}}');
      const url = `${globalValues.API_BASE_URL}/notifications/?clinic=${CLINIC_ID}&provider=${USER_ID}&query=${query}&is_active=true`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Initial loading data:', data);
      setNotifications(data);
      prepareFlatListData(data);

      const initialUnreadCount = data.filter(
        notification => !notification.is_read
      ).length;

      console.log('Initial unread count:', initialUnreadCount);

      setGlobalVariableValue({
        key: 'UnreadNotifyCount',
        value: initialUnreadCount,
      });
    } catch (err) {
      logError('Error fetching notifications:', err);
      logError("Error fetching notifications:", err);

      setError('Failed to load notifications');
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const prepareFlatListData = (notificationsData) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = {};

    // Group notifications
    notificationsData.forEach(notification => {
      const notificationDate = new Date(notification.created_at);
      let groupKey = '';

      if (notificationDate.toDateString() === today.toDateString()) {
        groupKey = 'TODAY';
      }
      else if (notificationDate.toDateString() === yesterday.toDateString()) {
        groupKey = 'YESTERDAY';
      }
      else {
        groupKey = notificationDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }

      groups[groupKey].push(notification);
    });

    const flatData = [];
    const specialSections = ['TODAY', 'YESTERDAY'];

    specialSections.forEach(section => {
      if (groups[section] && groups[section].length > 0) {
        flatData.push({ type: 'header', id: `header-${section}`, title: section });

        groups[section].forEach(item => {
          flatData.push({ type: 'item', ...item });
        });
      }
    });

    // sections sorted by date
    const otherSections = Object.keys(groups)
      .filter(section => !specialSections.includes(section))
      .sort((a, b) => {
        const dateA = new Date(groups[a][0].created_at);
        const dateB = new Date(groups[b][0].created_at);
        return dateB - dateA;
      });

    otherSections.forEach(section => {
      if (groups[section] && groups[section].length > 0) {
        flatData.push({ type: 'header', id: `header-${section}`, title: section });

        groups[section].forEach(item => {
          flatData.push({ type: 'item', ...item });
        });
      }
    });

    setFlatListData(flatData);
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    console.log('Marking as read:', notificationId);
    try {
      const url = `${globalValues.API_BASE_URL}/notifications/${notificationId}/`;
      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
        body: JSON.stringify({ is_read: true })
      });

      if (response.ok) {
        const updatedNotifications = notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        );
        const remainingUnreadCount = updatedNotifications.filter(
          notification => !notification.is_read
        ).length;
        setGlobalVariableValue({
          key: 'UnreadNotifyCount',
          value: remainingUnreadCount,
        });

        setNotifications(updatedNotifications);
        prepareFlatListData(updatedNotifications);

        if (swipeableRefs.current[notificationId]) {
          swipeableRefs.current[notificationId].close();
        }
      } else {
        throw new Error('Failed to mark as read');
      }
    } catch (err) {
      logError('Error marking notification as read:', err);
      logError("Error marking notification as read:", err);

      // Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const fetchTaskDetails = async (taskId) => {
    try {
      // console.log('Fetching task details for ID:', taskId);
      const query = encodeURIComponent('{id,title,priority,status,description,due_at,completed_at,updated_at,created_at,patient{id,first_name,middle_name,last_name,title,suffix,preferred_name,photo},comments{id,text,user{id,full_name},created_at,created_by},assignees{user{id,first_name,last_name,full_name,suffix,title,is_active,photo}},assignee{id,first_name,last_name,full_name,suffix,title,is_active,photo},created_by}');
      const url = `${globalValues.API_BASE_URL}/staff-tasks/${taskId}/?query=${query}`;
      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // console.log('Task details fetched successfully:', data);
      return data;
    } catch (error) {
      logError('Error fetching task details:', error);
      logError("Error fetching task details:", error);

      throw error;
    }
  };

  const handleNotificationPress = async (notification) => {
    const { taskTitle, comment, additionalText } = parseDescription(notification.description);

    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    switch (notification.type) {
      case 5: // Task notification
        await handleTaskNotification(notification);
        break;

      case 2: // Message notification
        await handleMessageNotification(notification);
        break;

      default:
        Alert.alert('Info', 'This notification type is not supported yet');
        break;
    }
  };

  const handleTaskNotification = async (notification) => {
    let taskId = null;

    if (notification.extra) {
      if (notification.type === 5 && notification.extra.task) {
        taskId = notification.extra.task;
      } else if (notification.extra.id &&
        (notification.title?.includes('Task status') ||
          notification.title?.includes('Task was assigned'))) {
        taskId = notification.extra.id;
      } else if (notification.extra.task) {
        taskId = notification.extra.task;
      } else if (notification.extra.id) {
        taskId = notification.extra.id;
      }
    }

    console.log("Task ID to navigate to log:", taskId);

    if (taskId) {
      try {
        const taskData = await fetchTaskDetails(taskId);

        if (taskData) {
          navigation.navigate('ViewTaskScreen', {
            taskData: taskData,
            notificationData: notification,
          });
        } else {
          Alert.alert('Error', 'Failed to fetch task details');
        }
      } catch (error) {
        logError('Error fetching task details:', error);
        logError("Error fetching task details:", error);

        Alert.alert('Error', 'Failed to load task details');
      }
    } else {
      Alert.alert('Info', 'No task associated with this notification');
    }
  };

  const handleMessageNotification = async (notification) => {
    try {
      const patientId = notification.extra?.patient;

      if (!patientId) {
        Alert.alert('Error', 'No patient information found in notification');
        return;
      }

      const query = encodeURIComponent('{id,first_name,middle_name,last_name,full_name,age_years,phone,preferred_name,title,photo,suffix,is_active,preferred_clinic{id},unread_inbound_message_count,most_recent_inbound_message{created_at,text},most_recent_message{id,created_at,text},most_recent_texting_message{id,created_at,text},staff_dialog_assignee{id,first_name,title,last_name,photo,suffix}}');
      const url = `${globalValues.API_BASE_URL}/patients/?id=${patientId}&ordering=-id&search=&limit=50&offset=0&query=${query}`;

      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const patient = data.results[0];

        const itemUnread = patient.unread_inbound_message_count || 0;
        const threadId = patient.id;

        const threadData = {
          MessageDetail: patient,
          MessageId: threadId,
          FirstName: patient.first_name,
          LastName: patient.last_name,
          fullName: patient.full_name || `${patient.first_name} ${patient.last_name}`,
          Age: patient.age_years,
          PhoneNumber: patient.phone,
          photo: patient.photo,
          unreadCount: itemUnread,
          messageId: threadId,
          hasNewMessages: itemUnread > 0,
          onThreadClose: handleThreadClose,
          clientId: patient?.preferred_clinic?.id,
          // Include additional fields if needed
          // preferredName: patient.preferred_name,
          // suffix: patient.suffix,
          // title: patient.title,
          // staffDialogAssignee: patient.staff_dialog_assignee,
          // mostRecentMessage: patient.most_recent_message,
          // mostRecentInboundMessage: patient.most_recent_inbound_message,
          // mostRecentTextingMessage: patient.most_recent_texting_message,
        };

        setGlobalVariableValue({ key: 'MessageId', value: patient.id });
        navigation.navigate('InboxThreadsScreen', threadData);
      } else {
        Alert.alert('Error', 'Patient details not found');
      }
    } catch (error) {
      logError('Error fetching patient details:', error);
      logError("Error fetching patient details:", error);

      Alert.alert('Error', 'Failed to load patient details');
    }
  };

  const handleThreadClose = () => {
    fetchNotifications();
  };

  // const handleNotificationPress = async (notification) => {
  //   const { taskTitle, comment, additionalText } = parseDescription(notification.description);

  //   let taskId = null;

  //   if (notification.extra) {
  //   if (notification.type === 5 && notification.extra.task) {
  //     taskId = notification.extra.task;
  //     // console.log('Found task ID in extra.task:', taskId);
  //   }
  //   else if (notification.extra.id && 
  //            (notification.title?.includes('Task status') || 
  //             notification.title?.includes('Task was assigned'))) {
  //     taskId = notification.extra.id;
  //     // console.log('Found task ID in extra.id:', taskId);
  //   }
  //   else if (notification.extra.task) {
  //     taskId = notification.extra.task;
  //     // console.log('Found task ID in extra.task (general):', taskId);
  //   }
  //   else if (notification.extra.id) {
  //     taskId = notification.extra.id;
  //     // console.log('Found ID in extra.id (potential task):', taskId);
  //   }
  // }

  //   // Mark as read
  //   if (!notification.is_read) {
  //     await markAsRead(notification.id);
  //   }

  //   console.log("Id navigate to log:", taskId);

  //   if (taskId) {
  //     try {
  //       const taskData = await fetchTaskDetails(taskId);

  //       if (taskData) {
  //         navigation.navigate('ViewTaskScreen', { 
  //           taskData: taskData,
  //           notificationData: notification,
  //           // taskId: taskId
  //         });
  //       } else {
  //         Alert.alert('Error', 'Failed to fetch task details');
  //       }
  //     } catch (error) {
  //       logError('Error fetching task details:', error);
  //       Alert.alert('Error', 'Failed to load task details');
  //     }
  //   } else {
  //     Alert.alert('Info', 'No task associated with this notification');
  //   }
  // };

  const deleteNotification = async (notificationId) => {
    try {
      const url = `${globalValues.API_BASE_URL}/notifications/${notificationId}/`;
      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }
      await markAsRead(notificationId);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
        body: JSON.stringify({
          is_active: false,
          is_read: true
        })
      });

      if (response.ok) {
        const updatedNotifications = notifications.filter(
          notification => notification.id !== notificationId
        );

        const remainingUnreadCount = updatedNotifications.filter(
          notification => !notification.is_read
        ).length;

        setGlobalVariableValue({
          key: 'UnreadNotifyCount',
          value: remainingUnreadCount,
        });
        setNotifications(updatedNotifications);
        prepareFlatListData(updatedNotifications);

        Alert.alert('Success', 'Notification deleted successfully');
      } else {
        throw new Error('Failed to delete notification');
      }
    } catch (err) {
      logError('Error deleting notification:', err);
      logError('Error deleting notification:', err);
      // Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const markAllAsRead = async () => {
    if (!hasUnreadNotifications) return;

    try {
      Object.values(swipeableRefs.current).forEach(ref => {
        if (ref && ref.close) ref.close();
      });
      const url = `${globalValues.API_BASE_URL}/notifications/read/`;
      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
        body: JSON.stringify({ staff_member_id: USER_ID })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Mark all as read response:', result);

      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        is_read: true
      }));

      setGlobalVariableValue({
        key: 'UnreadNotifyCount',
        value: 0,
      });

      setNotifications(updatedNotifications);
      prepareFlatListData(updatedNotifications);

      Alert.alert('Success', 'All notifications marked as read');

    } catch (err) {
      logError('Error marking all notifications as read:', err);
      logError('Error marking all notifications as read:', err);

      Alert.alert('Error', 'Failed to mark all notifications as read. Please try again.');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(':', '.');
  };

  const parseDescription = (description) => {
    const lines = description.split('\n');
    const taskTitle = lines.find(line => line.startsWith('Task title:'))?.replace('Task title: ', '') || '';
    const comment = lines.find(line => line.startsWith('Comment:'))?.replace('Comment: ', '') || '';
    const additionalText = lines.filter(line => !line.startsWith('Task title:') && !line.startsWith('Comment:') && line.trim() !== '');

    return { taskTitle, comment, additionalText };
  };

  const renderRightActions = (progress, dragX, item) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [0, 0, 0, 1],
    });

    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteNotification(item.id)
              }
            ]
          );
        }}
      >
        <Animated.View
          style={[
            styles.deleteButtonContent,
            {
              transform: [{ translateX: trans }],
            },
          ]}
        >
          <Icon name="delete" size={24} color="#fff" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{item.title}</Text>
        </View>
      );
    }

    // Regular notification item
    const { taskTitle, comment, additionalText } = parseDescription(item.description);
    const isUnread = !item.is_read;

    return (
      <Swipeable
        ref={ref => swipeableRefs.current[item.id] = ref}
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
        rightThreshold={40}
        overshootRight={false}
        onSwipeableWillOpen={() => {
          Object.keys(swipeableRefs.current).forEach(key => {
            if (key !== item.id.toString() && swipeableRefs.current[key]) {
              swipeableRefs.current[key].close();
            }
          });
        }}
      >
        <TouchableOpacity
          style={[
            styles.cardContainer,
            isUnread && styles.unreadCard
          ]}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          {/* Card header with title and time */}
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.notificationTitle} numberOfLines={1}>
                {item.title}
              </Text>
              {isUnread && <View style={styles.unreadBadge} />}
            </View>
            <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
          </View>

          {/* Card content */}
          <View style={styles.cardContent}>
            {taskTitle ? (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Task title:</Text>
                <Text style={styles.fieldValue}>{taskTitle}</Text>
              </View>
            ) : null}

            {comment ? (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Comment:</Text>
                <Text style={styles.fieldValue}>{comment}</Text>
              </View>
            ) : null}

            {additionalText.map((text, index) => (
              <Text key={index} style={styles.additionalText}>
                {text}
              </Text>
            ))}
          </View>

          <View style={styles.swipeHint}>
            <Icon name="chevron-left" size={16} color="#999" />
            <Text style={styles.swipeHintText}>Swipe to delete</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const ItemSeparator = ({ leadingItem }) => {
    if (leadingItem && leadingItem.type === 'header') {
      return null;
    }
    return <View style={styles.separator} />;
  };

  // Key extractor for FlatList
  const keyExtractor = (item) => {
    if (item.type === 'header') {
      return item.id;
    }
    return item.id.toString();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#066858" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNotifications}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const FixedFooter = () => {
    return (
      <View style={styles.fixedFooterContainer}>
        <TouchableOpacity
          style={[
            styles.readAllButton,
            !hasUnreadNotifications && styles.readAllButtonDisabled
          ]}
          onPress={markAllAsRead}
          activeOpacity={0.7}
          disabled={!hasUnreadNotifications}
        >
          <Icon
            name="done-all"
            size={20}
            color={hasUnreadNotifications ? "#fff" : "#999"}
            style={styles.readAllIcon}
          />
          <Text style={[
            styles.readAllButtonText,
            !hasUnreadNotifications && styles.readAllButtonTextDisabled
          ]}>
            Read All Notifications
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {notifications.some(item => !item.is_read) && (
            <TouchableOpacity style={styles.readAllButton} onPress={markAllAsRead}>
              <Text style={styles.readAllButtonText}>READ ALL NOTIFICATIONS</Text>
            </TouchableOpacity>
          )}
        </View> */}
        <View style={styles.listContainer}>
          <FlatList
            data={flatListData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={ItemSeparator}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#0000ff']}
                tintColor="#0000ff"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No notifications found</Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
        <FixedFooter />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  readAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#066858',
    borderRadius: 4,
  },
  readAllButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContent: {
    flexGrow: 1,
    padding: 8,
  },
  listContainer: {
    flex: 1,
    marginBottom: 60,
  },
  sectionHeader: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginTop: 4,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#066858',
    textTransform: 'Auto-capitilize',
    paddingVertical: 8
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  unreadCard: {
    borderLeftColor: '#066858',
    backgroundColor: '#f8fbff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff',
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#066858',
    marginLeft: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  cardContent: {
    marginBottom: 0,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginRight: 4,
  },
  fieldValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  additionalText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  clinicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  clinicText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  markReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#066858',
  },
  markReadText: {
    fontSize: 12,
    color: '#066858',
    fontWeight: '500',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
    opacity: 0.6,
  },
  swipeHintText: {
    fontSize: 10,
    color: '#999',
    marginLeft: 2,
  },
  separator: {
    height: 8,
  },
  deleteButton: {
    width: 80,
    marginVertical: 4,
    marginRight: 8,
  },
  deleteButtonContent: {
    flex: 1,
    backgroundColor: '#dc3545',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  notificationTitle: {
    fontSize: 16,
    // fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },

  taskTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  comment: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  additionalText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#066858',
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  fixedFooterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 1000,
  },
  readAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    // backgroundColor: '#066858',
    // borderRadius: 8,
    width: '100%',
  },
  readAllButtonDisabled: {
    // backgroundColor: '#f5f5f5',
    // borderWidth: 1,
    // borderColor: '#e0e0e0',
    color: '#f5f5f5'
  },
  readAllIcon: {
    marginRight: 10,
  },
  readAllButtonText: {
    color: '#066858',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'Auto-capitilize'
  },
  readAllButtonTextDisabled: {
    color: '#999',
  },
});

export default NotificationList;