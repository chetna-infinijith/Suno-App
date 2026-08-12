import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as GlobalVariables from '../config/GlobalVariableContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logError } from '../index';
import { checkInternetAndProceed } from './InternetConnection';

const LIMIT = 30;
const DEFAULT_AVATAR = 'https://master-app.suno.tech/assets/user-CXthF0zB.png';
const FILTER_STORAGE_KEY = 'message_list_filter';
const LAST_REFRESH_KEY = 'message_list_last_refresh';

export const MessagesList = () => {
  const navigation = useNavigation();
  const globalValues = GlobalVariables.useValues();
  const { clinic_pk_id, senderID, MessageId, regionId, AUTH_HEADER } =
    globalValues;
  const setGlobalVariableValue = GlobalVariables.useSetValue();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All Messages');
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  const searchTimeoutRef = useRef(null);
  const flatListRef = useRef(null);
  const searchInputRef = useRef(null);
  const isMountedRef = useRef(true);
  const CLINIC_ID = clinic_pk_id;
  const REGION_ID = regionId;

  const threadUnreadCountsRef = useRef(new Map());
  // const unreadCountMapRef = useRef(new Map());
  const lastRefreshTimeRef = useRef(0);
  const dataInitializedRef = useRef(false);
  const shouldRefreshOnFocusRef = useRef(false);

  const filterOptions = useMemo(
    () => [
      { label: 'All Messages', value: 'all' },
      { label: 'Assigned to me', value: 'assigned' },
      { label: 'Unread', value: 'unread' },
      // { label: 'Newest First', value: 'newest' },
      { label: 'Oldest First', value: 'oldest' },
    ],
    []
  );

  useEffect(() => {
    isMountedRef.current = true;
    loadSavedFilter();
    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const loadSavedFilter = useCallback(async () => {
    try {
      const savedFilter = await AsyncStorage.getItem(FILTER_STORAGE_KEY);
      if (savedFilter && isMountedRef.current) {
        setSelectedFilter(savedFilter);
      }
    } catch (error) {
      logError('Error loading saved filter:', error);
      logError("Error loading saved filter:", error);

    }
  }, []);

  const saveFilter = useCallback(async filter => {
    try {
      await AsyncStorage.setItem(FILTER_STORAGE_KEY, filter);
    } catch (error) {
      logError('Error saving filter:', error);
      logError("Error saving filter:", error);

    }
  }, []);

  const getFilterValue = useCallback(
    label => {
      const option = filterOptions.find(opt => opt.label === label);
      return option ? option.value : 'all';
    },
    [filterOptions]
  );

  const fetchUnreadCount = useCallback(async () => {
    if (!AUTH_HEADER || !CLINIC_ID) return;
    const isConnected = await checkInternetAndProceed();
        if (!isConnected) {
          return;
        }

    try {
      const url = `${globalValues.API_BASE_URL}/messages/unread-messages-count/?clinics=${CLINIC_ID}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch unread count');

      const data = await response.json();
      if (isMountedRef.current) {
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      logError('Error fetching unread count:', error);
      logError("Error fetching unread count:", error);

    }
  }, [CLINIC_ID, AUTH_HEADER]);

  const markThreadAsReadOptimistically = useCallback(
    (threadId, threadUnreadCount) => {
      if (!threadId || !threadUnreadCount) return;

      threadUnreadCountsRef.current.set(threadId, threadUnreadCount);

      setUnreadCount(prev => Math.max(0, prev - threadUnreadCount));

      setMessages(prev =>
        prev.map(msg =>
          msg.id === threadId
            ? {
                ...msg,
                unread_inbound_message_count: 0,
                most_recent_inbound_message: msg.most_recent_inbound_message
                  ? { ...msg.most_recent_inbound_message, is_new: false }
                  : null,
              }
            : msg
        )
      );
    },
    []
  );

  // Handle thread close callback with proper count synchronization
  const handleThreadClose = useCallback(
    (threadId, actualReadCount, shouldRefresh = false) => {
      if (!threadId || !isMountedRef.current) return;

      try {
        const expectedReduction =
          threadUnreadCountsRef.current.get(threadId) || 0;
        if (
          actualReadCount !== undefined &&
          actualReadCount !== expectedReduction
        ) {
          const adjustment = expectedReduction - actualReadCount;
          setUnreadCount(prev => Math.max(0, prev + adjustment));
        }

        threadUnreadCountsRef.current.delete(threadId);

        if (shouldRefresh) {
          refreshData(true);
        }
      } catch (err) {
        console.warn('handleThreadClose error:', err);
      }
    },
    [refreshData]
  );

  // const handleThreadClose = useCallback(
  //   (threadId, actualReadCount) => {
  //     if (!threadId || !isMountedRef.current) return;

  //     try {
  //       const expectedReduction = threadUnreadCountsRef.current.get(threadId) || 0;

  //       if (actualReadCount !== undefined && actualReadCount !== expectedReduction) {
  //         const adjustment = expectedReduction - actualReadCount;
  //         setUnreadCount(prev => Math.max(0, prev + adjustment));
  //       }

  //       threadUnreadCountsRef.current.delete(threadId);

  //       refreshData(true);
  //     } catch (err) {
  //       console.warn('handleThreadClose error:', err);
  //       refreshData(true);
  //     }
  //   },
  //   [refreshData]
  // );

  const buildApiUrl = useCallback(
      (offset, search = '', filter = 'all') => {
        let ordering = '-most_recent_texting_message_created_at,-id';
  
        if (filter === 'oldest') {
          ordering = 'most_recent_texting_message_created_at,id';
        } else if (filter === 'newest') {
          ordering = '-most_recent_texting_message_created_at,-id';
        }
  
        const queryFields = `{id,first_name,middle_name,age_years,full_name,phone,email,last_name,preferred_name,title,photo,suffix,is_active,preferred_clinic{id},unread_inbound_message_count,most_recent_inbound_message{created_at,text},most_recent_message{id,created_at,text},most_recent_texting_message{id,created_at,text},staff_dialog_assignee{id,first_name,title,last_name,photo,suffix}}`;
  
          let url = `${globalValues.API_BASE_URL}/patients/?limit=${LIMIT}&offset=${offset}&ordering=${ordering}&query=${queryFields}`;
      
        // let url = `${globalValues.API_BASE_URL}/patients/?limit=${LIMIT}&offset=${offset}&ordering=${ordering}&preferred_clinic=${CLINIC_ID}&query=${queryFields}&region=${REGION_ID}`;
  
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }
  
        return url;
      },
      [CLINIC_ID, LIMIT, REGION_ID]
    );

  const fetchMessages = useCallback(
    async (
      offset = 0,
      search = '',
      filter = 'all',
      append = false,
      isSearch = false,
      isFilter = false
    ) => {
      if (!AUTH_HEADER) return;

      // Set appropriate loading states
      if (append) {
        setLoadingMore(true);
      } else if (isSearch) {
        setSearchLoading(true);
      } else if (isFilter) {
        setFilterLoading(true);
      } else {
        setLoading(true);
      }

      try {
        const url = buildApiUrl(offset, search, filter);
        const isConnected = await checkInternetAndProceed();
        if (!isConnected) {
          return;
        }
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: AUTH_HEADER,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch messages');

        const data = await response.json();
        const results = data.results || [];

        // Apply client-side filtering
        let filteredResults = results;
        if (filter === 'unread') {
          filteredResults = results.filter(
            item => item.unread_inbound_message_count > 0
          );
        } else if (filter === 'assigned') {
          filteredResults = results.filter(
            item => item.staff_dialog_assignee?.id === (senderID || 107)
          );
        }

        if (append && isMountedRef.current) {
          setMessages(prev => {
            const merged = [...prev, ...filteredResults];
            const seen = new Set();
            return merged.filter(item => {
              const duplicate = seen.has(item.id);
              seen.add(item.id);
              return !duplicate;
            });
          });
        } else if (isMountedRef.current) {
          setMessages(filteredResults);
        }

        if (isMountedRef.current) {
          setHasMore(results.length === LIMIT);
          setOffset(offset);
          dataInitializedRef.current = true;

          lastRefreshTimeRef.current = Date.now();
          AsyncStorage.setItem(
            LAST_REFRESH_KEY,
            lastRefreshTimeRef.current.toString()
          );
        }
      } catch (error) {
        logError('Error fetching messages:', error);
        logError("Error fetching messages:", error);

        if (isMountedRef.current && !append) {
          setMessages([]);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
          setSearchLoading(false);
          setFilterLoading(false);
        }
      }
    },
    [buildApiUrl, AUTH_HEADER, LIMIT, senderID]
  );

  // Refresh all data
  const refreshData = useCallback(
    (force = false) => {
      if (!isMountedRef.current) return;

      const now = Date.now();
      if (force || now - lastRefreshTimeRef.current > 30000) {
        setOffset(0);
        setHasMore(true);
        lastRefreshTimeRef.current = now;
        Promise.all([
          fetchMessages(0, searchQuery, getFilterValue(selectedFilter)),
          fetchUnreadCount(),
        ]);
      }
    },
    [
      searchQuery,
      selectedFilter,
      fetchMessages,
      fetchUnreadCount,
      getFilterValue,
    ]
  );

  useFocusEffect(
    useCallback(() => {
      if (!isMountedRef.current) return;

      if (!dataInitializedRef.current) {
        refreshData(true);
        dataInitializedRef.current = true;
      }

      return () => {};
    }, [refreshData])
  );

  // useEffect(() => {
  //   let mounted = true;
  //   const initializeData = async () => {
  //     if (mounted) {
  //       await Promise.all([
  //         fetchMessages(0, searchQuery, getFilterValue(selectedFilter)),
  //         fetchUnreadCount()
  //       ]);
  //     }
  //   };
  //   initializeData();
  //   return () => { mounted = false; };
  // }, []);

  const handleSearch = useCallback(
    text => {
      setSearchQuery(text);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;

        setOffset(0);
        fetchMessages(
          0,
          text,
          getFilterValue(selectedFilter),
          false,
          true,
          false
        );
      }, 500);
    },
    [selectedFilter, fetchMessages, getFilterValue]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setOffset(0);
    fetchMessages(0, '', getFilterValue(selectedFilter), false, true, false);
  }, [selectedFilter, fetchMessages, getFilterValue]);

  const handleFilterSelect = useCallback(
    async filter => {
      if (!isMountedRef.current) return;

      setSelectedFilter(filter.label);
      await saveFilter(filter.label);
      setFilterVisible(false);
      setOffset(0);
      fetchMessages(0, searchQuery, filter.value, false, false, true);
    },
    [searchQuery, fetchMessages, saveFilter]
  );

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && !loading && hasMore && messages.length >= LIMIT) {
      const newOffset = offset + LIMIT;
      fetchMessages(
        newOffset,
        searchQuery,
        getFilterValue(selectedFilter),
        true
      );
    }
  }, [
    loadingMore,
    loading,
    hasMore,
    messages.length,
    offset,
    searchQuery,
    selectedFilter,
    getFilterValue,
    fetchMessages,
    LIMIT,
  ]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setOffset(0);
    fetchMessages(0, searchQuery, getFilterValue(selectedFilter));
    fetchUnreadCount();
  }, [
    searchQuery,
    selectedFilter,
    getFilterValue,
    fetchMessages,
    fetchUnreadCount,
  ]);

  const handleNavigateToThread = useCallback(
    item => {
      // console.log('navigating to thread', item);
      if (!isMountedRef.current) return;

      const itemUnread = item.unread_inbound_message_count || 0;
      const threadId = item.id;

      if (itemUnread > 0) {
        markThreadAsReadOptimistically(threadId, itemUnread);
      }

      const threadData = {
        MessageDetail: item,
        MessageId: threadId,
        FirstName: item.first_name,
        LastName: item.last_name,
        Age: item.age_years,
        PhoneNumber: item.phone,
        fullName: item.full_name || `${item?.first_name ?? ''} ${item?.last_name ?? ''}`,
        photo: item.photo,
        unreadCount: itemUnread,
        messageId: threadId,
        hasNewMessages: itemUnread > 0,
        onThreadClose: handleThreadClose,
        clientId: item?.preferred_clinic?.id,
      };
      setGlobalVariableValue({ key: 'MessageId', value: item?.id }),
        navigation.navigate('InboxThreadsScreen', threadData);
    },
    [
      navigation,
      markThreadAsReadOptimistically,
      handleThreadClose,
      setGlobalVariableValue,
    ]
  );

  // Format date - memoized
  const formatDate = useCallback(dateString => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12;

      return `${month}/${day} ${hours
        .toString()
        .padStart(2, '0')}:${minutes} ${ampm}`;
    } catch (error) {
      logError('Error formatting date:', error);
      logError("Error formatting date:", error);

      return '';
    }
  }, []);

  const renderItem = useCallback(
    ({ item }) => {
      const message =
        item.most_recent_texting_message || item.most_recent_message;
      const assignee = item.staff_dialog_assignee;
      const unreadCount = item.unread_inbound_message_count || 0;

      return (
        <TouchableOpacity
          style={styles.messageItem}
          onPress={() => handleNavigateToThread(item)}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: item.photo || DEFAULT_AVATAR }}
              style={styles.avatar}
              defaultSource={{ uri: DEFAULT_AVATAR }}
            />
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageName}>
                {item.full_name || `${item.first_name} ${item.last_name}`}
              </Text>
              <Text style={styles.messageTime}>
                {formatDate(message?.created_at)}
              </Text>
            </View>

            <Text style={styles.messageText} numberOfLines={1}>
              {message?.text || 'No message'}
            </Text>

            {assignee && (
              <View style={styles.assigneeTag}>
                <Text style={styles.assigneeText}>
                  Assignee: {assignee.first_name}{' '}
                  {assignee.last_name?.[0] || ''}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [formatDate, handleNavigateToThread]
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#066858" />
        <Text style={styles.loadingText}>Loading more messages...</Text>
      </View>
    );
  }, [loadingMore]);

  const renderListHeader = useCallback(() => {
    if (!searchLoading && !filterLoading) return null;

    return (
      <View style={styles.listHeaderLoader}>
        <ActivityIndicator size="small" color="#066858" />
        <Text style={styles.loadingText}>
          {searchLoading ? 'Searching messages...' : 'Applying filter...'}
        </Text>
      </View>
    );
  }, [searchLoading, filterLoading]);

  const renderEmptyState = useCallback(() => {
    if (loading || searchLoading || filterLoading) {
      return null;
    }

    let emptyTitle = 'No messages found';
    let emptyDescription = 'There are no messages to display at the moment.';

    if (searchQuery) {
      emptyTitle = 'No messages found';
      emptyDescription = `No results found for "${searchQuery}". Try a different search term.`;
    } else if (selectedFilter === 'Assigned to me') {
      emptyTitle = 'No assigned messages';
      emptyDescription = "You don't have any messages assigned to you.";
    } else if (selectedFilter === 'Unread') {
      emptyTitle = 'No unread messages';
      emptyDescription = "You've read all your messages. Great job!";
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="chatbubble-outline" size={64} color="#9CA3AF" />
        <Text style={styles.emptyStateTitle}>{emptyTitle}</Text>
        <Text style={styles.emptyStateDescription}>{emptyDescription}</Text>
      </View>
    );
  }, [loading, searchLoading, filterLoading, searchQuery, selectedFilter]);

  const showListLoading = loading || searchLoading || filterLoading;
  const keyExtractor = useCallback(item => `message-${item.id}`, []);

  // // Handle navigation to InboxThreads
  // const handleNavigateToThread = useCallback((item) => {
  //   console.log("navigation to inboxThread", item);
  //     const threadData = {
  //       MessageDetail: item,
  //       MessageId: item.id,
  //       FirstName: item.first_name,
  //       LastName: item.last_name,
  //       Age: item.age_years,
  //       PhoneNumber: item.phone,
  //       fullName: item.full_name || `${item.first_name} ${item.last_name}`,
  //       photo: item.photo,
  //       unreadCount: item.unread_inbound_message_count,
  //       messageId: item.id,

  //       onThreadClose: () => {
  //         refreshData();
  //       }
  //     }
  //     // navigation.navigate('InboxThreadsScreen', {});
  //     console.log('Passing to InboxThreads:', {
  //       firstName: item.first_name,
  //       lastName: item.last_name
  //     });
  //     navigation.navigate('InboxThreadsScreen', threadData, {
  //                       messageData: item,
  //                       isMessageList: true
  //                     });
  // }, [navigation, refreshData]);

  return (
    <View style={styles.container}>
      {/* Header with shadow */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInnerContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#9CA3AF"
              style={styles.searchIcon}
            />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search messages..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="never"
            />
            <View style={styles.searchRightContainer}>
              {searchQuery ? (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearSearch}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="funnel-outline" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Message List */}
      <View style={styles.listContainer}>
        {showListLoading && messages.length === 0 ? (
          <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color="#066858" />
            <Text style={styles.loadingText}>
              {searchLoading
                ? 'Searching messages...'
                : filterLoading
                ? 'Applying filter...'
                : 'Loading messages...'}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            ListHeaderComponent={renderListHeader}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={
              messages.length === 0 ? styles.listContentEmpty : styles.listContent
            }
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          />
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFilterVisible(false)}
        >
          <View style={styles.filterModal}>
            {filterOptions.map(filter => (
              <TouchableOpacity
                key={filter.value}
                style={styles.filterOption}
                onPress={() => handleFilterSelect(filter)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedFilter === filter.label &&
                      styles.filterOptionSelected,
                  ]}
                >
                  {selectedFilter === filter.label && '✓ '}
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Shadow for Android
    elevation: 4,
  },
  searchInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 44,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchRightContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor : 'red'
  },
  clearButton: {
    // padding: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
    minHeight: 25,
  },
  filterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 44,
    minWidth: 44,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Shadow for Android
    elevation: 4,
  },
  filterButtonText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 16,
  },
  messageItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#066858',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    // Shadow for Android
    elevation: 3,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginBottom: 2,
  },
  messageTime: {
    fontSize: 12,
    color: '#15042B',
    marginLeft: 8,
    opacity: 0.5,
  },
  messageText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },
  assigneeTag: {
    backgroundColor: '#E6EBF4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Shadow for Android
    elevation: 2,
  },
  assigneeText: {
    fontSize: 12,
    color: '#525252',
    fontWeight: '500',
    opacity: 0.8,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
  },
  listHeaderLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  emptyStateDescription: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#FFFFFF',
    marginTop: 70,
    marginRight: 16,
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    // Enhanced shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Enhanced shadow for Android
    elevation: 10,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  filterOptionSelected: {
    color: '#066858',
    fontWeight: '600',
  },
});

export default MessagesList;
