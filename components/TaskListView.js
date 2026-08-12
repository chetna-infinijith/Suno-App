import React from 'react';
import {
  Icon,
  SimpleStyleFlashList,
  Surface,
  Touchable,
} from '@draftbit/ui';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as SunoApi from '../apis/SunoApi.js';
import EmptyListBlock from '../components/EmptyListBlock';
import * as GlobalVariables from '../config/GlobalVariableContext';
import * as CustomSegment from '../custom-files/CustomSegment';
import getTaskPriority from '../global-functions/getTaskPriority';
import getTaskPriorityColor from '../global-functions/getTaskPriorityColor';
import getTaskStatus from '../global-functions/getTaskStatus';
import getTaskStatusColor from '../global-functions/getTaskStatusColor';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import * as DateUtils from '../utils/DateUtils';
import useNavigation from '../utils/useNavigation';
import { logError } from '../index.js';

export const TASK_QUERY =
  '{id,title,priority,status,description,due_at,completed_at,updated_at,created_at,patient{id,full_name,first_name,middle_name,last_name,title,suffix,preferred_name,photo,preferred_clinic{id,name}},comments{id,text,user{id,full_name},created_at,created_by},assignees{user{id,first_name,last_name,full_name,suffix,title,is_active,photo}},assignee{id,first_name,last_name,full_name,suffix,title,is_active,photo},created_by,attachments{id,file,original_filename,created_at,created_by,updated_by}}';

export const PATIENT_TASK_QUERY =
  '{id,title,priority,status,description,due_at,completed_at,updated_at,created_at,patient{id,first_name,middle_name,last_name,title,suffix,preferred_name,photo},comments{id,text,user{id,full_name},created_at,created_by},assignees{user{id,first_name,last_name,full_name,suffix,title,is_active,photo}},assignee{id,first_name,last_name,full_name,suffix,title,is_active,photo},created_by,assigned_tags,attachments{id,file,original_filename,created_at,created_by,updated_by}}';

const PRIORITY_ORDER = [1, 2, 3, 4, 0];

export const staffStatusGroupBy = tasks => {
  return PRIORITY_ORDER.flatMap(
    priority => tasks.find(group => group.priority === priority)?.tasks || []
  );
};

export const sortTasksByPriority = tasks =>
  [...(tasks || [])].sort((a, b) => {
    const aIndex = PRIORITY_ORDER.indexOf(a?.priority);
    const bIndex = PRIORITY_ORDER.indexOf(b?.priority);
    return (
      (aIndex === -1 ? PRIORITY_ORDER.length : aIndex) -
      (bIndex === -1 ? PRIORITY_ORDER.length : bIndex)
    );
  });

const MetaLabel = ({ children }) => (
  <Text
    style={{
      fontFamily: 'Inter_400Regular',
      fontSize: 11,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: palettes.App.TextPlaceholder,
      marginBottom: 2,
    }}
  >
    {children}
  </Text>
);

const MetaValue = ({ children, style }) => (
  <Text
    numberOfLines={2}
    style={{
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
      color: palettes.App.FilterTextColor,
      ...style,
    }}
  >
    {children}
  </Text>
);

const IconActionButton = ({
  icon,
  onPress,
  backgroundColor = '#F3F6F5',
  color = '#066858',
}) => (
  <TouchableOpacity
    onPress={onPress}
    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    style={{
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Icon name={icon} size={20} color={color} />
  </TouchableOpacity>
);

const PriorityBadge = ({ Variables, priority }) => {
  const color = getTaskPriorityColor(Variables, priority);
  return (
    <View
      style={{
        backgroundColor: `${color}22`,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color }}>
        {getTaskPriority(Variables, priority)}
      </Text>
    </View>
  );
};

const TaskStatusBadge = ({ Variables, status }) => {
  const color = getTaskStatusColor(Variables, status);
  return (
    <View
      style={{
        backgroundColor: color,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
          color: palettes.App['Custom Color_18'],
        }}
      >
        {getTaskStatus(Variables, status)}
      </Text>
    </View>
  );
};

export const TaskListCard = ({
  task,
  theme,
  Variables,
  onPress,
  onEdit,
  onDelete,
  onPatientPress,
  showPatient = true,
  readOnly = false,
}) => (
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
    <View style={{ padding: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Touchable onPress={onPress} activeOpacity={0.85} style={{ flex: 1, paddingRight: 12 }}>
          <Text
            numberOfLines={2}
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 16,
              lineHeight: 22,
              color: palettes.App.FilterTextColor,
            }}
          >
            {task?.title}
          </Text>
        </Touchable>
        {!readOnly ? (
          <IconActionButton icon="MaterialIcons/edit-square" onPress={onEdit} />
        ) : null}
      </View>

      <Touchable onPress={onPress} activeOpacity={0.85}>
        {task?.description ? (
          <Text
            numberOfLines={2}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              lineHeight: 18,
              color: palettes.App.TextPlaceholder,
              marginBottom: 12,
            }}
          >
            {task.description}
          </Text>
        ) : null}

        <View style={{ gap: 10, marginBottom: 14 }}>
          <View>
            <MetaLabel>Due Date</MetaLabel>
            <MetaValue>
              {task?.due_at ? DateUtils.format(task.due_at, 'MMM DD, YYYY') : '—'}
            </MetaValue>
          </View>

          <View>
            <MetaLabel>Assignee</MetaLabel>
            <MetaValue>{task?.assignee?.full_name || '—'}</MetaValue>
          </View>

          {showPatient && task?.patient ? (
            <View>
              <MetaLabel>Patient</MetaLabel>
              <Touchable onPress={onPatientPress}>
                <MetaValue
                  style={{
                    color: theme.colors.branding.secondary,
                    textDecorationLine: 'underline',
                  }}
                >
                  {task.patient.full_name}
                </MetaValue>
              </Touchable>
            </View>
          ) : null}
        </View>
      </Touchable>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, flex: 1 }}>
          <TaskStatusBadge Variables={Variables} status={task?.status} />
          <PriorityBadge Variables={Variables} priority={task?.priority} />
        </View>
        {!readOnly ? (
          <IconActionButton
            icon="MaterialCommunityIcons/delete-outline"
            onPress={onDelete}
            backgroundColor="#FEF2F2"
            color="#DC2626"
          />
        ) : null}
      </View>
    </View>
  </Surface>
);

const normalizePatientTaskResults = fetchData =>
  fetchData?.results ?? (Array.isArray(fetchData) ? fetchData : []);

export const TaskListSection = ({
  theme,
  patientId,
  showPatientLink = true,
  showSegmentTabs = true,
  readOnly = false,
  listBottomPadding = 24,
  contentPadding = 16,
  emptyMessage = 'No tasks available',
  listKeyPrefix = 'TaskList',
  onDeleteLoadingChange,
}) => {
  const navigation = useNavigation();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const setGlobalVariableValue = GlobalVariables.useSetValue();
  const patientLimit = 10;

  const [selectedStatusType, setSelectedStatusType] = React.useState(0);
  const [taskListData, setTaskListData] = React.useState([]);
  const [listLoading, setListLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const sunoDeleteTaskDELETE = SunoApi.useDeleteTaskDELETE();
  const userId = Constants['UserInfo']?.id;
  const isPatientTaskList = Boolean(patientId) && !showSegmentTabs;

  React.useEffect(() => {
    setListLoading(true);
  }, [selectedStatusType, patientId, showSegmentTabs]);

  const confirmDeleteTask = (task, refetch) => {
    Alert.alert(
      'Are you sure you want to delete this task?',
      `Delete ${task?.title}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              onDeleteLoadingChange?.(true);
              await sunoDeleteTaskDELETE.mutateAsync({ task_id: task?.id });
              await refetch();
            } catch (err) {
              logError('API Error : Delete Task : ', err);
            } finally {
              onDeleteLoadingChange?.(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderTaskList = refetch => {
    if (listLoading) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
          <ActivityIndicator size="large" color={theme.colors.branding.secondary} />
        </View>
      );
    }

    if (!taskListData?.length) {
      return <EmptyListBlock message={emptyMessage} />;
    }

    return (
      <SimpleStyleFlashList
        data={taskListData}
        estimatedItemSize={180}
        horizontal={false}
        keyExtractor={(item, index) =>
          item?.id?.toString() ?? item?.uuid ?? index.toString()
        }
        listKey={`${listKeyPrefix}->TaskList`}
        numColumns={1}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await refetch();
              } catch (e) {
                logError('API Error refetch tasks : ', e);
              }
              setRefreshing(false);
            }}
            tintColor={theme.colors.branding.secondary}
          />
        }
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: listBottomPadding, paddingTop: 4 }}
        renderItem={({ item }) => (
          <TaskListCard
            task={item}
            theme={theme}
            Variables={Variables}
            showPatient={showPatientLink}
            readOnly={readOnly}
            onPress={() => {
              try {
                navigation.navigate('ViewTaskScreen', { taskData: item }, { pop: true });
              } catch (err) {
                logError('Navigation Error : ', err);
              }
            }}
            onEdit={() => {
              navigation.navigate('NewTaskScreen', { isEdit: true, taskData: item });
            }}
            onDelete={() => confirmDeleteTask(item, refetch)}
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

  const renderFetchChild = (fetchLoading, error, data, refetch) => {
    if (fetchLoading || error || data?.status < 200 || data?.status >= 300) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
          <ActivityIndicator size="large" color={theme.colors.branding.secondary} />
        </View>
      );
    }

    return renderTaskList(refetch);
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: contentPadding }}>
      {showSegmentTabs ? (
        <Utils.CustomCodeErrorBoundary>
          <CustomSegment.CustomSegment
            value={selectedStatusType}
            setValue={setSelectedStatusType}
            theme={theme}
          />
        </Utils.CustomCodeErrorBoundary>
      ) : null}

      {patientId ? (
        <SunoApi.FetchGetCompletedTasksGET
          assignee={isPatientTaskList ? undefined : selectedStatusType === 0 ? userId : undefined}
          group_by_priority={isPatientTaskList ? false : undefined}
          is_active={isPatientTaskList ? undefined : true}
          is_complete={isPatientTaskList ? undefined : selectedStatusType === 2}
          limit={isPatientTaskList ? 25 : 100}
          offset={0}
          ordering={isPatientTaskList ? '-created_at' : selectedStatusType === 1 ? '-created_at' : 'due_at,-created_at'}
          patient={patientId}
          query={isPatientTaskList ? PATIENT_TASK_QUERY : TASK_QUERY}
          refreshKey={isPatientTaskList ? 0 : undefined}
          handlers={{
            onData: fetchData => {
              try {
                const tasks = normalizePatientTaskResults(fetchData);
                if (isPatientTaskList) {
                  setTaskListData(tasks);
                } else {
                  setTaskListData(
                    tasks.filter(task => {
                      if (selectedStatusType === 1) {
                        return String(task?.created_by?.id) === String(userId);
                      }
                      if (selectedStatusType === 0) {
                        return ['1', '2'].includes(String(task?.status));
                      }
                      return true;
                    })
                  );
                }
                setListLoading(false);
                if (refreshing) setRefreshing(false);
              } catch (err) {
                logError('API Error Task : ', err);
              }
            },
          }}
        >
          {({ loading, error, data, refetchGetCompletedTasks }) =>
            renderFetchChild(loading, error, data, refetchGetCompletedTasks)
          }
        </SunoApi.FetchGetCompletedTasksGET>
      ) : (
        <SunoApi.FetchGetMyAssigneeTasksGET
          assignee={selectedStatusType !== 1 ? userId : undefined}
          created_by={selectedStatusType === 1 ? userId : undefined}
          group_by_priority={true}
          handlers={{
            onData: fetchData => {
              const handler = async () => {
                try {
                  setTaskListData(staffStatusGroupBy(fetchData));
                  setListLoading(false);
                  await setGlobalVariableValue({
                    key: 'taskOffsetFilter',
                    value: Constants['taskOffsetFilter'] + patientLimit,
                  });
                  if (refreshing) setRefreshing(false);
                } catch (err) {
                  logError('API Error Task : ', err);
                }
              };
              handler();
            },
          }}
          is_active={true}
          is_complete={selectedStatusType === 2}
          ordering={selectedStatusType === 1 ? '-created_at' : 'due_at,-created_at'}
          query={TASK_QUERY}
          status={
            selectedStatusType === 1
              ? '1,2,3'
              : selectedStatusType === 0
                ? '1,2'
                : undefined
          }
        >
          {({ loading, error, data, refetchGetMyAssigneeTasks }) =>
            renderFetchChild(loading, error, data, refetchGetMyAssigneeTasks)
          }
        </SunoApi.FetchGetMyAssigneeTasksGET>
      )}
    </View>
  );
};
