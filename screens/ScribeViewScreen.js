import React, { useCallback, useEffect, useState } from 'react';
import {
  ScreenContainer,
  SimpleStyleFlashList,
  Surface,
  withTheme,
  Icon,
  Touchable,
} from '@draftbit/ui';
import {
  ActivityIndicator,
  Text,
  View,
  Alert,
  RefreshControl,
} from 'react-native';
import * as SunoApi from '../apis/SunoApi.js';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import EmptyListBlock from '../components/EmptyListBlock';
import palettes from '../themes/palettes';
import * as DateUtils from '../utils/DateUtils';
import useIsFocused from '../utils/useIsFocused';
import usePrevious from '../utils/usePrevious';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';
import * as GlobalVariables from '../config/GlobalVariableContext.js';
import { logError } from '../index.js';

const defaultProps = { id: null };

const SCRIBE_LIST_QUERY =
  '{id,created_at,updated_at,status,duration,is_generating_summary,is_generating_soap,has_transcription,recording,patient{id,first_name,middle_name,last_name,preferred_name,title,suffix,preferred_clinic{id}},staff{id,first_name,last_name,suffix,title,is_active}}';

const ALL_STATUSES = '0,1,2,3,4,5,6,7,8';
const PAGE_SIZE = 25;

export const RECORDING_STATUS = {
  0: {
    label: 'Recording',
    color: '#8e9391',
    icon: 'MaterialIcons/pending',
  },
  1: {
    label: 'Uploaded',
    color: '#8e9391',
    icon: 'MaterialIcons/upload',
  },
  2: {
    label: 'Processing',
    color: '#9E9E9E',
    icon: 'MaterialCommunityIcons/autorenew',
  },
  3: {
    label: 'Transcribed',
    color: '#059669',
    icon: 'Octicons/check',
  },
  4: {
    label: 'Completed',
    color: '#065f46',
    icon: 'Ionicons/checkmark-done-sharp',
  },
  5: {
    label: 'Failed',
    color: '#F44336',
    icon: 'MaterialIcons/error',
  },
  6: {
    label: 'Retrying',
    color: '#8e9391',
    icon: 'MaterialIcons/replay',
  },
  7: {
    label: 'Cancelled',
    color: '#9E9E9E',
    icon: 'Entypo/block',
  },
  8: {
    label: 'Paused',
    color: 'rgba(18, 20, 44, 1)',
    icon: 'Foundation/pause',
  },
};

const getRecordingStatus = status =>
  RECORDING_STATUS[status] ?? {
    label: 'Unknown',
    color: '#9E9E9E',
    icon: 'MaterialIcons/help-outline',
  };

const getPersonName = (person, fallback = '—') => {
  const parts = [person?.first_name, person?.last_name].filter(Boolean);
  return parts.length ? parts.join(' ') : fallback;
};

const StatusBadge = ({ status }) => {
  const info = getRecordingStatus(status);
  const isSuccess = status === 3 || status === 4;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: isSuccess
          ? '#ECFDF5'
          : status === 8
            ? 'rgba(18, 20, 44, 0.08)'
            : `${info.color}18`,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
      }}
    >
      <Icon name={info.icon} size={16} color={info.color} />
      <Text
        style={{
          marginLeft: 6,
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
          color: isSuccess ? '#065f46' : info.color,
        }}
      >
        {info.label}
      </Text>
    </View>
  );
};

const MetaLabel = ({ children }) => (
  <Text
    style={{
      fontFamily: 'Inter_400Regular',
      fontSize: 11,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: palettes.App.TextPlaceholder,
      marginBottom: 2,
    }}
  >
    {children}
  </Text>
);

const ScribeListCard = ({
  item,
  theme,
  onPress,
  onDelete,
  onPatientPress,
}) => {
  const statusInfo = getRecordingStatus(item?.status);

  return (
    <Surface
      elevation={2}
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E8EEEC',
        marginBottom: 12,
        overflow: 'hidden',
      }}
    >
      <Touchable
        onPress={onPress}
        activeOpacity={1}
        style={{ padding: 16 }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 16,
                color: palettes.App.FilterTextColor,
                marginBottom: 4,
              }}
            >
              {DateUtils.format(item?.created_at, 'MM/DD/YYYY')}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                color: palettes.App.TextPlaceholder,
              }}
            >
              {DateUtils.format(item?.created_at, 'hh:mm a')}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                backgroundColor: '#E6F7F1',
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 8,
                alignItems: 'center',
                minWidth: 72,
              }}
            >
              <Icon
                name="MaterialCommunityIcons/clock-outline"
                size={14}
                color={theme.colors.branding.secondary}
              />
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 13,
                  color: theme.colors.branding.secondary,
                  marginTop: 2,
                }}
              >
                {item?.duration || '—'}
              </Text>
            </View>

            <Touchable
              onPress={onDelete}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: '#FEF2F2',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon
                  name="MaterialCommunityIcons/delete-outline"
                  size={20}
                  color="#DC2626"
                />
              </View>
            </Touchable>
          </View>
        </View>

        <StatusBadge status={item?.status} />

        <View
          style={{
            flexDirection: 'row',
            marginTop: 14,
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: '#F0F4F3',
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <MetaLabel>Patient</MetaLabel>
            <Touchable onPress={onPatientPress}>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: theme.colors.branding.secondary,
                  textDecorationLine: 'underline',
                }}
              >
                {getPersonName(item?.patient)}
              </Text>
            </Touchable>
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <MetaLabel>Staff</MetaLabel>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 14,
                color: palettes.App.FilterTextColor,
              }}
            >
              {getPersonName(item?.staff)}
            </Text>
          </View>
        </View>

        {/* <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginTop: 12,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 13,
              color: theme.colors.branding.secondary,
              marginRight: 4,
            }}
          >
            View details
          </Text>
          <Icon
            name="MaterialIcons/chevron-right"
            size={20}
            color={theme.colors.branding.secondary}
          />
        </View> */}
      </Touchable>

      {/* <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: statusInfo.color,
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
        }}
      /> */}
    </Surface>
  );
};

const ScribeViewScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const params = useParams();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);
  const Constants = GlobalVariables.useValues();

  const patientId = params?.id ?? defaultProps.id;

  const [scribeData, setScribeData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchScribes = useCallback(
    async ({ nextOffset = 0, append = false } = {}) => {
      try {
        const response = await SunoApi.scribesGET(Constants, {
          limit: PAGE_SIZE,
          offset: nextOffset,
          status: ALL_STATUSES,
          patient: patientId,
          refreshKey: Date.now(),
          query: SCRIBE_LIST_QUERY,
        });

        const payload = response?.json;
        const results = Array.isArray(payload?.results) ? payload.results : [];

        setScribeData(prev => (append ? [...prev, ...results] : results));
        setTotalCount(payload?.count ?? results.length);
        setOffset(nextOffset + results.length);
        setError(null);

        return results;
      } catch (err) {
        logError(err);
        setError('Unable to load scribe recordings.');
        return [];
      }
    },
    [Constants, patientId]
  );

  const loadInitial = useCallback(async () => {
    setIsInitialLoading(true);
    await fetchScribes({ nextOffset: 0, append: false });
    setIsInitialLoading(false);
  }, [fetchScribes]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    if (prevIsFocused === undefined) {
      loadInitial();
      return;
    }

    if (prevIsFocused === false) {
      fetchScribes({ nextOffset: 0, append: false });
    }
  }, [isFocused, prevIsFocused, loadInitial, fetchScribes]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchScribes({ nextOffset: 0, append: false });
    setIsRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || isInitialLoading || scribeData.length >= totalCount) {
      return;
    }

    setIsLoadingMore(true);
    await fetchScribes({ nextOffset: offset, append: true });
    setIsLoadingMore(false);
  };

  const deleteAudioRecording = async id => {
    try {
      const response = await fetch(
        `${Constants.API_BASE_URL}/ai/ambient-scribes/${id}/`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: Constants.AUTH_HEADER,
          },
        }
      );

      if (response.ok) {
        setScribeData(prev => prev.filter(item => item.id !== id));
        setTotalCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      logError(err);
    }
  };

  const confirmDelete = id => {
    Alert.alert(
      'Delete recording',
      'Are you sure you want to delete this audio recording? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAudioRecording(id),
        },
      ]
    );
  };

  const renderListHeader = () => (
    <View style={{ marginBottom: 8 }}>
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 22,
          color: palettes.App.FilterTextColor,
          marginBottom: 4,
        }}
      >
        Recordings
      </Text>
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 14,
          color: palettes.App.TextPlaceholder,
          marginBottom: 16,
        }}
      >
        {totalCount === 1
          ? '1 scribe recording'
          : `${totalCount} scribe recordings`}
      </Text>
    </View>
  );

  const renderContent = () => {
    if (isInitialLoading && scribeData.length === 0) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.branding.secondary} />
          <Text
            style={{
              marginTop: 12,
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: palettes.App.TextPlaceholder,
            }}
          >
            Loading recordings…
          </Text>
        </View>
      );
    }

    if (error && scribeData.length === 0) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="MaterialIcons/error-outline" size={40} color="#DC2626" />
          <Text
            style={{
              marginTop: 12,
              fontFamily: 'Inter_500Medium',
              fontSize: 15,
              color: palettes.App.FilterTextColor,
              textAlign: 'center',
            }}
          >
            {error}
          </Text>
          <Touchable onPress={loadInitial} style={{ marginTop: 16 }}>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 14,
                color: theme.colors.branding.secondary,
                textDecorationLine: 'underline',
              }}
            >
              Try again
            </Text>
          </Touchable>
        </View>
      );
    }

    if (scribeData.length === 0) {
      return (
        <View style={{ flex: 1, paddingTop: 40 }}>
          {renderListHeader()}
          <EmptyListBlock message="No medical scribe recordings found" />
        </View>
      );
    }

    return (
      <SimpleStyleFlashList
        data={scribeData}
        estimatedItemSize={180}
        horizontal={false}
        keyExtractor={(item, index) =>
          item?.id?.toString() ?? item?.uuid ?? index.toString()
        }
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.colors.branding.secondary} />
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.branding.secondary}
          />
        }
        renderItem={({ item }) => (
          <ScribeListCard
            item={item}
            theme={theme}
            onPress={() => {
              navigation.navigate(
                'ScribeHistoryScreen',
                {
                  id: patientId,
                  scribeData: item,
                },
                { pop: true }
              );
            }}
            onDelete={() => confirmDelete(item?.id)}
            onPatientPress={() => {
              try {
                navigation.navigate(
                  'PatientDetailsScreen',
                  {
                    id: item?.patient?.id,
                    clientID: item?.patient?.preferred_clinic?.id,
                  },
                  { pop: true }
                );
              } catch (err) {
                logError('Navigation Error : ', err);
              }
            }}
          />
        )}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      />
    );
  };

  return (
    <ScreenContainer scrollable={false} hasSafeArea={true}>
      <CustomChildHeaderBlock name="Scribes" />
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 24,
          width: dimensions.width,
        }}
      >
        {renderContent()}
      </View>
    </ScreenContainer>
  );
};

export default withTheme(ScribeViewScreen);
