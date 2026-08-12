import React, { useMemo } from 'react';
import {
  Button,
  Icon,
  IconButton,
  ScreenContainer,
  Touchable,
  TextInput,
  withTheme,
  SimpleStyleFlatList,
  Surface,
  SimpleStyleFlashList,
  SimpleStyleScrollView,
} from '@draftbit/ui';
import {
  Text, View, Platform,
  Modal,
  Alert,
  ActivityIndicator, Image,
  Keyboard,

} from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import * as SunoApi from '../apis/SunoApi.js';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import * as GlobalVariables from '../config/GlobalVariableContext';
import * as CustomCode from '../custom-files/CustomCode';
import getTaskPriority from '../global-functions/getTaskPriority';
import getTaskPriorityColor from '../global-functions/getTaskPriorityColor';
import getTaskStatus from '../global-functions/getTaskStatus';
import getTaskStatusColor from '../global-functions/getTaskStatusColor';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as DateUtils from '../utils/DateUtils';
import * as StyleSheet from '../utils/StyleSheet';
import showAlertUtil from '../utils/showAlert';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';
import { KeyboardAwareFlatList, KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import imageSource from '../utils/imageSource.js';
import DropDownPicker from "react-native-dropdown-picker";
import getBillingStatusColor from '../global-functions/getBillingStatusColor.js';
import EmptyListBlock from '../components/EmptyListBlock.js';
import getBillingStatus from '../global-functions/getBillingStatus.js';
import { logError } from '../index.js';

const defaultProps = { billingData: null };

const ViewBillingScreen = props => {
  const { theme } = props;
  const navigation = useNavigation();
  const dimensions = useWindowDimensions();
  const params = useParams();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const [refreshData, setRefreshData] = React.useState(false);
  const [taskData, setTaskData] = React.useState({});
  const [textInputValue, setTextInputValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(String((params?.billingData ?? defaultProps.billingData)?.status ?? ""));
  const [menuOption, setMenuOption] = React.useState(0);
  const [selectedTag, setSelectedTag] = React.useState('');
  const [billingLineItemsData, setBillingLineItemsData] = React.useState([]);
  const [billingPaymentsData, setBillingPaymentsData] = React.useState([]);
  const [billingAdjustmentsData, setBillingAdjustmentsData] = React.useState([]);

  // billingStatus: [
  //   { color: '#505f7a', bgColor : '#465c841a' , label: 'Draft', value: '1' },
  //   { color: '#f87171' , bgColor : '#ff6a6a1a' , label: 'Ready To Bill', value: '2' },
  //   { color: '#fcc02a', bgColor : '#ffc1271a', label: 'In Billing', value: '3' },
  //   { color: '#059669', bgColor : '#009b6b1a', label: 'Completed', value: '999' },
  //   { color: '#bfc2c1', bgColor : '#b9c8c31a', label: 'Cancelled', value: '1000' },
  // ],

  const [items, setItems] = React.useState([
    {
      label: "DRAFT",
      value: "1",
      icon: () => <View style={[styles.dot, { backgroundColor: "#505f7a" }]} />,
    },
    {
      label: "READY TO BILL",
      value: "2",
      icon: () => <View style={[styles.dot, { backgroundColor: "#f87171" }]} />,
    },
    {
      label: "IN BILLING",
      value: "3",
      icon: () => <View style={[styles.dot, { backgroundColor: "#fcc02a" }]} />,
    },
    {
      label: "COMPLETED",
      value: "999",
      icon: () => <View style={[styles.dot, { backgroundColor: "#059669" }]} />,
    },
    {
      label: "CANCELLED",
      value: "1000",
      icon: () => <View style={[styles.dot, { backgroundColor: "#bfc2c1" }]} />,
    },
  ]);


  const sunoAddTaskCommentsPOST = SunoApi.useAddTaskCommentsPOST();
  const sunoDeleteTaskCommentsDELETE = SunoApi.useDeleteTaskCommentsDELETE();
  const sunoEditBillingStatusPATCH = SunoApi.useEditBliingStatusPATCH();
  React.useEffect(() => {
    const handler = async () => {
      try {
        setLoading(true);

        const alltaskData = (
          await SunoApi.getTaskDetailsGET(Constants, {
            query:
              '{id,title,priority,status,description,due_at,completed_at,updated_at,created_at,patient{id,first_name,middle_name,last_name,title,suffix,preferred_name,photo},comments{id,text,user{id,full_name,photo},created_at,created_by},assignees{user{id,first_name,last_name,full_name,suffix,title,is_active,photo}},assignee{id,first_name,last_name,full_name,suffix,title,is_active,photo},created_by}',
            task_id: (params?.billingData ?? defaultProps.taskData)?.id,
          })
        )?.json;
        setTaskData(alltaskData);
        setValue(String(alltaskData?.status ?? ""));
        setLoading(false);

      } catch (err) {
        logError("API Error getTaskDetails : ", err);
      }
    };
    // handler();
  }, []);



  const getOverdueDays = (dueDate) => {
    if (!dueDate) return null;

    const today = new Date();
    const due = new Date(dueDate);

    // Difference in milliseconds
    const diffMs = today - due;

    // Convert to days
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    console.log("=== due : ", diffDays)

    return diffDays > 0 ? diffDays : 0;
  };
  const billingData = params?.billingData ?? defaultProps.billingData
  // console.log("===== BillingData : ", params?.billingData)
  // Header (all content above the comments)



  return (
    <ScreenContainer scrollable={false} hasSafeArea={true}>

      <Modal transparent visible={loading} animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
        >
          <ActivityIndicator size="large" color="#066858" />
        </View>
      </Modal>
      <CustomChildHeaderBlock name={'View Billing'} />

      {/* <View style={StyleSheet.applyWidth({ padding: 20, paddingHorizontal: 20, flex : 1 }, dimensions.width)}> */}
      <SimpleStyleScrollView
        bounces={true}
        horizontal={false}
        keyboardShouldPersistTaps={'never'}
        nestedScrollEnabled={false}
        showsHorizontalScrollIndicator={true}
        showsVerticalScrollIndicator={true}
        style={StyleSheet.applyWidth(
          { padding: 20, },
          dimensions.width
        )}
      >

        {/* Title */}
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between'
            },
            dimensions.width
          )}
        >
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.TextPlaceholder,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'left',
                textTransform: 'uppercase',
              },
              dimensions.width
            )}
          >
            {'Service Date'}
          </Text>
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.TextPlaceholder,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'right',
                textTransform: 'uppercase',
              },
              dimensions.width
            )}
          >
            {'Balance'}
          </Text>
        </View>
        {/* Name 3 */}
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between'
            },
            dimensions.width
          )}
        >
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_500Medium',
                fontSize: 20,
                marginBottom: 30,
                marginTop: 3,
                textAlign: 'left',
              },
              dimensions.width
            )}
          >
            {billingData?.service_date === null
              ? 'Future fitting'
              : DateUtils.format(
                billingData?.service_date,
                'MM/DD/YYYY'
              )}

          </Text>
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                fontFamily: 'Inter_500Medium',
                fontSize: 20,
                marginBottom: 30,
                marginTop: 3,
                textAlign: 'right',
                color: billingData?.balance > 0 ? '#ef4444' :
                  palettes.App['Custom Color_18'],

                textDecorationLine: billingData?.balance > 0 && (billingData?.status == 999 || billingData?.status == 1000) ? 'line-through' : 'none',
                fontStyle: billingData?.balance > 0 && (billingData?.status == 999 || billingData?.status == 1000) ? 'italic' : 'normal'

              },
              dimensions.width
            )}
          >
            ${billingData?.balance}

          </Text>
        </View>
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between'
            },
            dimensions.width
          )}
        >
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.TextPlaceholder,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'left',
                textTransform: 'uppercase',
              },
              dimensions.width
            )}
          >
            {'Invoice Number'}
          </Text>
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.TextPlaceholder,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'left',
                textTransform: 'uppercase',
              },
              dimensions.width
            )}
          >
            {'Status'}
          </Text>
        </View>
        {/* Name 3 */}
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              zIndex: 9999,
            },
            dimensions.width
          )}
        >
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                marginBottom: 30,
                marginTop: 3,
                textAlign: 'left',
              },
              dimensions.width
            )}
          >
            {billingData?.id}
          </Text>
          <View style={{
            width: 190,
            zIndex: 9999, marginBottom: 30, marginTop: 5
          }}>

            <DropDownPicker
              open={open}
              value={value}
              items={value == 1 ? items : items.slice(0, -1)}
              setOpen={setOpen}
              // setValue={setValue}
              setValue={async (callback) => {
                const newValue = callback(value);

                // update UI
                setValue(newValue);
                setLoading(true);
                const statusData = (
                  await sunoEditBillingStatusPATCH.mutateAsync({
                    sale_id: (params?.billingData ?? defaultProps.billingData)?.id,
                    status: newValue,
                  })
                )?.json;
                setLoading(false)
              }}
              setItems={setItems}
              style={{
                // backgroundColor: getBillingStatusColor(
                //   Variables,
                //   billingData?.status,
                // 1
                // ),
                borderColor: value == '1' ? "#465c841a" : value == '2' ? "#ff6a6a1a" : value == '3' ? "#ffc1271a" : value == '999' ? "#009b6b1a" : "#b9c8c31a",

                backgroundColor: value == '1' ? "#465c841a" : value == '2' ? "#ff6a6a1a" : value == '3' ? "#ffc1271a" : value == '999' ? "#009b6b1a" : "#b9c8c31a",
                // borderColor: value == '1' ? "#505f7a" : value == '2' ? "#f87171" : value == '3' ? "#fcc02a" : value == '999' ? "#059669" : "#bfc2c1",
                borderRadius: 5,
                // paddingLeft: 10,
                // height: 30,
              }}
              dropDownContainerStyle={{
                borderColor: "#F0F0F0",
                borderRadius: 12,
              }}
              // arrowIconStyle={styles.arrow}
              placeholder="Status"
            />
          </View>
        </View>


        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between'
            },
            dimensions.width
          )}
        >
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.TextPlaceholder,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'left',
                textTransform: 'uppercase',
              },
              dimensions.width
            )}
          >
            {'Provider'}
          </Text>
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.TextPlaceholder,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'left',
                textTransform: 'uppercase',
              },
              dimensions.width
            )}
          >
            {'Clinic'}
          </Text>
        </View>
        {/* Name 7 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                marginBottom: 30,
                marginTop: 3,
                textAlign: 'left',
              },
              dimensions.width
            )}
          >
            {billingData?.provider?.first_name} {billingData?.provider?.last_name}
          </Text>
          {/* {getOverdueDays((params?.billingData ?? defaultProps.taskData)?.due_at) > 0 &&
    <Text
      accessible={true}
      selectable={false}
      style={StyleSheet.applyWidth(
        {
          color: '#ffffff',
          fontFamily: 'Inter_500Medium',
          fontSize: 14,
          marginBottom: 30,
          marginTop: 3,
          textAlign: 'left',
          backgroundColor: '#f44336',
          paddingHorizontal: 10,
          paddingVertical: 5,
          marginLeft: 15,
          borderRadius: 12,
          overflow: 'hidden', 
        },
        dimensions.width
      )}
    >
      {getOverdueDays((params?.billingData ?? defaultProps.taskData)?.due_at)} days overdue
    </Text>
  } */}
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                marginBottom: 30,
                marginTop: 3,
                textAlign: 'left',
              },
              dimensions.width
            )}
          >
            {billingData?.clinic?.name}
          </Text>
        </View>
        {/* Assignee */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>

          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.TextPlaceholder,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'left',
                textTransform: 'uppercase',
                textDecorationLine: billingData?.balance > 0 && (billingData?.status == 999 || billingData?.status == 1000) ? 'line-through' : 'none',
                fontStyle: billingData?.balance > 0 && (billingData?.status == 999 || billingData?.status == 1000) ? 'italic' : 'normal'

              },
              dimensions.width
            )}
          >
            {'PT Bal'}
          </Text>
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.TextPlaceholder,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'left',
                textTransform: 'uppercase',

              },
              dimensions.width
            )}
          >
            {'INS Bal'}
          </Text>
        </View>
        {/* View 2 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Name 4 */}
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                // marginLeft: 7,
                textAlign: 'left',
                textDecorationLine: billingData?.balance > 0 && (billingData?.status == 999 || billingData?.status == 1000) ? 'line-through' : 'none',
                fontStyle: billingData?.balance > 0 && (billingData?.status == 999 || billingData?.status == 1000) ? 'italic' : 'normal'

              },
              dimensions.width
            )}
          >
            ${billingData?.patient_responsibility_balance}
          </Text>
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                // marginLeft: 7,
                textAlign: 'left',
                textDecorationLine: billingData?.balance > 0 && (billingData?.status == 999 || billingData?.status == 1000) ? 'line-through' : 'none',
                fontStyle: billingData?.balance > 0 && (billingData?.status == 999 || billingData?.status == 1000) ? 'italic' : 'normal'

              },
              dimensions.width
            )}
          >
            ${billingData?.insurer_responsibility_balance}
          </Text>
        </View>
        {/* Additional Assignees */}
        <>
          {!(
            billingData?.created_by
          ) ? null : (
            <Text
              accessible={true}
              selectable={false}
              style={StyleSheet.applyWidth(
                {
                  color: palettes.App.TextPlaceholder,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  textAlign: 'left',
                  textTransform: 'uppercase',
                  paddingTop: 25
                },
                dimensions.width
              )}
            >
              {'Created By'}
            </Text>
          )}
        </>
        {/* Name 5 */}
        <>
          {!(
            billingData?.created_by
          ) ? null : (
            <Text
              accessible={true}
              selectable={false}
              style={StyleSheet.applyWidth(
                {
                  color: palettes.App.FilterTextColor,
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  marginBottom: 30,
                  marginTop: 3,
                  textAlign: 'left',
                },
                dimensions.width
              )}
            >
              {
                billingData?.created_by?.full_name
              }
            </Text>
          )}
        </>

        {/* <Surface
    {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
    elevation={2}
    style={StyleSheet.applyWidth(
      StyleSheet.compose(
        GlobalStyles.SurfaceStyles(theme)['Surface'].style,
        { minHeight: 12 }
      ),
      dimensions.width
    )}
  /> */}
        <SimpleStyleFlatList
          data={[{ speciality: 'Line Items' }, { speciality: 'Payments' }, { speciality: 'Adjustments' }]} // , { speciality: 'Billing' }
          decelerationRate={'normal'}
          inverted={false}
          keyExtractor={(list2Data, index) =>
            list2Data?.id ??
            list2Data?.uuid ??
            index?.toString() ??
            JSON.stringify(list2Data)
          }
          style={{ paddingTop: 30 }}
          keyboardShouldPersistTaps={'never'}
          listKey={'Scroll View->ScrollTab->List 2'}
          nestedScrollEnabled={false}
          numColumns={1}
          onEndReachedThreshold={0.5}
          pagingEnabled={false}
          renderItem={({ item, index }) => {
            const list2Data = item;
            return (
              <View
                style={StyleSheet.applyWidth(
                  { alignItems: 'flex-start', justifyContent: 'center' },
                  dimensions.width
                )}
              >
                {/* Unselected */}
                <Touchable
                  onPress={() => {
                    try {
                      setSelectedTag(index);
                      setMenuOption(index);

                    } catch (err) {
                      logError(err);
                    }
                  }}
                  activeOpacity={0.8}
                  disabledOpacity={0.8}
                  style={StyleSheet.applyWidth(
                    { marginRight: 12 },
                    dimensions.width
                  )}
                >
                  <Surface
                    {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
                    elevation={2}
                    style={StyleSheet.applyWidth(
                      StyleSheet.compose(
                        GlobalStyles.SurfaceStyles(theme)['Surface'].style,
                        {
                          alignItems: 'center',
                          backgroundColor:
                            index === menuOption
                              ? theme.colors.branding.secondary
                              : palettes.App['Custom #ffffff'],
                          borderColor: palettes.App.TagBorder,
                          borderRadius: 8,
                          borderWidth: 0.22,
                          justifyContent: 'center',
                          marginBottom: 10,
                          paddingLeft: 10,
                          paddingRight: 10,
                        }
                      ),
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: [
                            {
                              minWidth: Breakpoints.Mobile,
                              value: theme.colors.text.strong,
                            },
                            {
                              minWidth: Breakpoints.Mobile,
                              value:
                                index === menuOption
                                  ? palettes.App['Custom #ffffff']
                                  : theme.colors.text.medium,
                            },
                          ],
                          fontFamily: 'Inter_400Regular',
                        },
                        dimensions.width
                      )}
                    >
                      {list2Data?.speciality}
                    </Text>
                  </Surface>
                </Touchable>
              </View>
            );
          }}
          snapToAlignment={'start'}
          horizontal={true}
          showsHorizontalScrollIndicator={true}
          showsVerticalScrollIndicator={false}
        />



        {/* Overview */}

        {!(menuOption === 0) ? null : (
          <View
            accessible={false}
            style={StyleSheet.applyWidth(
              { flex: 1, position: 'relative' },
              dimensions.width
            )}
          >


            <View
              style={StyleSheet.applyWidth({ flex: 1, }, dimensions.width)}
            >


              <SunoApi.FetchBillingLineItemGET
                sale_id={billingData?.id}
                //   offqset={0}
                // has_active_subscription={true}
                // limit={25}
                // nulls_first={true}
                handlers={{
                  onData: fetchData => {
                    const handler = async () => {
                      try {
                        setBillingLineItemsData(fetchData);
                        console.log("===== fetchData : ", fetchData)
                        // await setGlobalVariableValue({
                        //   key: 'taskOffsetFilter',
                        //   value: Constants['taskOffsetFilter'] + patientLimit,
                        // });
                        /* hidden 'Set Variable' action */
                        // if (refreshing) setRefreshing(false);

                      } catch (err) {
                        logError(err);
                      }
                    };
                    handler();
                  },
                }}
                query={`{id,discount_type{id,is_active,type,subtype,product{id,type,display_name,master_product{subtype}},mode,value,title},cpt_code{id,code},description,exchanged_at,returned_at,discount,insurer_responsibility,patient_responsibility,price,price_table_item{id,price,max_discount,is_active,price_table{id,name}},inventory_product{id,status,serial_number,condition,loanable,demoable,specification,manufacturer_warranty_expiration_date,available_quantity},patient_products{id,status,inventory_product{id,status,serial_number,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date,condition,checked_in_at,ear,specification,is_active,quantity,ordered_quantity,reserved_quantity,loanable,demoable}},product{id,display_name,max_discount,cpt_code{id,code},master_product{id,type,subtype,specification}},quantity,quickbooks_line_id,tax_rate,taxable,total,insurers{amount,balance,id,insurer{id}},created_by,updated_by,delivered_at,order_item{id,patient_product{id,serial_number,ear},inventory_product{id,serial_number,product{id,display_name}}},order{id,type,clinic_order_number,status},claim_form_data}`}
              >
                {({ loading, error, data, refetchGetMyAssigneeTasks }) => {
                  const fetchData = data?.json;
                  if (loading) {
                    return <ActivityIndicator size="large" color="#066858" />;
                  }

                  if (error || data?.status < 200 || data?.status >= 300) {
                    return <ActivityIndicator size="large" color="#066858" />;
                  }
                  // if (listLoading) {
                  //   return <ActivityIndicator size="large" color="#066858" />;
                  // }


                  return (
                    <View style={{ flex: 1 }}>


                      {!(billingLineItemsData?.length === 0) ? null : (
                        <EmptyListBlock
                          message={'No billing line items history available'}
                        />
                      )}


                      <SimpleStyleFlashList
                        data={billingLineItemsData}
                        estimatedItemSize={50}
                        horizontal={false}
                        inverted={false}
                        keyExtractor={(flashListData, index) =>
                          flashListData?.id ??
                          flashListData?.uuid ??
                          index?.toString() ??
                          JSON.stringify(flashListData)
                        }
                        listKey={'Task->View->Task->Fetch->FlashList'}
                        numColumns={1}

                        // onRefresh={async () => {
                        //   setRefreshing(true);

                        //   try {
                        //     await refetchGetMyAssigneeTasks();   // ⬅️ re-fetch API
                        //   } catch (e) {
                        //     logError(e);
                        //   }

                        //   setRefreshing(false);
                        // }}

                        // refreshing={refreshing}
                        // onEndReachedThreshold={0.5}
                        renderItem={({ item, index }) => {
                          const flashListData = item;
                          const totalAmount = parseFloat(flashListData?.price);
                          const deduction = parseFloat(flashListData?.discount);
                          const taxRate = parseFloat(flashListData?.tax_rate);

                          const netAmount = totalAmount - deduction;
                          const taxAmount = (netAmount * taxRate) / 100;
                          const percentage = (deduction / totalAmount) * 100;

                          return (
                            <Surface
                              {...GlobalStyles.SurfaceStyles(theme)['Surface']
                                .props}
                              elevation={1}
                              style={StyleSheet.applyWidth(
                                StyleSheet.compose(
                                  GlobalStyles.SurfaceStyles(theme)['Surface']
                                    .style,
                                  {
                                    backgroundColor:
                                      palettes.App['Custom #ffffff'],
                                    borderColor: palettes.App.TagBorder,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    marginBottom: 10,
                                  }
                                ),
                                dimensions.width
                              )}
                            >
                              <Touchable
                                onPress={() => {
                                  try {
                                    // navigation.navigate(
                                    //   'ViewBillingScreen',
                                    //   { billingData: flashListData },
                                    //   { pop: true }
                                    // );
                                  } catch (err) {
                                    logError(err);
                                  }
                                }}
                              >
                                <View
                                  style={StyleSheet.applyWidth(
                                    {
                                      alignItems: 'center',
                                      backgroundColor:
                                        palettes.App['Custom Color_15'],
                                      borderBottomLeftRadius: 10,
                                      borderBottomRightRadius: 10,
                                      borderTopLeftRadius: 10,
                                      borderTopRightRadius: 10,
                                      flexDirection: 'row',
                                      paddingBottom: 10,
                                      paddingLeft: 10,
                                      paddingRight: 10,
                                      paddingTop: 10,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {/* Details */}
                                  <View
                                    style={StyleSheet.applyWidth(
                                      {
                                        flex: 1, marginLeft: 10
                                      },
                                      dimensions.width
                                    )}
                                  >
                                    {/* View 5 */}
                                    <View
                                      style={StyleSheet.applyWidth(
                                        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
                                        dimensions.width
                                      )}
                                    >
                                      {/* Name */}
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_500Medium',
                                            fontSize: 16,
                                            textAlign: 'left',
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {'Type: '}
                                        {flashListData?.product?.master_product?.type == 1
                                          ? 'Service'
                                          : flashListData?.product?.master_product?.type == 2 ? 'Hearing Aid'
                                            : flashListData?.product?.master_product?.type == 3 ? 'Accessory'
                                              : flashListData?.product?.master_product?.type == 4 ? 'Fee'
                                                : 'Supply'}
                                      </Text>

                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color: flashListData?.balance > 0 ? '#ef4444' :
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_500Medium',
                                            fontSize: 16,
                                            textAlign: 'left',
                                            // textDecorationLine: flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'line-through' : 'none',
                                            // fontStyle:  flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'italic' : 'normal'

                                          },
                                          dimensions.width
                                        )}
                                      >
                                        ${flashListData?.total}
                                      </Text>

                                    </View>
                                    {/* View 2 */}
                                    <View
                                      style={StyleSheet.applyWidth(
                                        {
                                          alignItems: 'center',
                                          flexDirection: 'row',
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      {/* Review */}
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 13,
                                            lineHeight: 16,
                                            marginTop: 8,
                                            opacity: 0.6,
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {"CPT Code : "}
                                      </Text>
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 14,
                                            lineHeight: 16,
                                            marginTop: 8,
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {flashListData?.cpt_code?.code}
                                      </Text>

                                      {/* <View
                                      style={StyleSheet.applyWidth(
                                        {
                                          backgroundColor:
                                            getTaskPriorityColor(
                                              Variables,
                                              flashListData?.priority
                                            ),
                                          borderRadius: 12,
                                          marginLeft: 10,
                                          marginTop: 5,
                                          paddingBottom: 2,
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        style={StyleSheet.applyWidth(
                                          {
                                            alignSelf: 'center',
                                            color: [
                                              {
                                                minWidth: Breakpoints.Mobile,
                                                value:
                                                  palettes.App[
                                                  'Custom Color_18'
                                                  ],
                                              },
                                              {
                                                minWidth: Breakpoints.Mobile,
                                                value:
                                                  flashListData?.tag?.color,
                                              },
                                            ],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 12,
                                            marginLeft: 10,
                                            marginRight: 10,
                                            marginTop: 2,
                                            opacity: 0.7,
                                            textAlign: 'center',
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {getTaskPriority(
                                          Variables,
                                          flashListData?.priority
                                        )}
                                      </Text>
                                    </View> */}
                                    </View>
                                    <Text
                                      accessible={true}
                                      selectable={false}
                                      numberOfLines={3}
                                      style={StyleSheet.applyWidth(
                                        {
                                          color:
                                            palettes.App['Custom Color_18'],
                                          // fontFamily: 'Inter_400Regular',
                                          fontSize: 15,
                                          lineHeight: 16,
                                          marginTop: 7,
                                          fontStyle: 'italic'
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      {"Unit Info "}
                                    </Text>
                                    {/* View 3 */}
                                    <View
                                      style={StyleSheet.applyWidth(
                                        {
                                          flexDirection: 'row',
                                          justifyContent: 'space-between',
                                          paddingTop: 5
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      {/* status */}
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 13,
                                            lineHeight: 16,
                                            opacity: 0.6,
                                            flex: 1
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {'Price'}
                                        {/* {flashListData?.provider?.first_name} {flashListData?.provider?.last_name
                                      } */}
                                      </Text>
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 13,
                                            lineHeight: 16,
                                            opacity: 0.6,
                                            flex: 1
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {'Discount'}
                                        {/* {flashListData?.provider?.first_name} {flashListData?.provider?.last_name
                                      } */}
                                      </Text>
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 13,
                                            lineHeight: 16,
                                            textAlign: 'right',
                                            opacity: 0.6,
                                            flex: 1
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {'Tax'}
                                        {/* {flashListData?.provider?.first_name} {flashListData?.provider?.last_name
                                      } */}
                                      </Text>
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 13,
                                            lineHeight: 16,
                                            flex: 1,
                                            opacity: 0.6,
                                            textAlign: 'right',
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {'Quantity'}
                                        {/* {flashListData?.provider?.first_name} {flashListData?.provider?.last_name
                                      } */}
                                      </Text>
                                    </View>

                                    <View
                                      style={StyleSheet.applyWidth(
                                        {
                                          flexDirection: 'row',
                                          justifyContent: 'space-between',
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      {/* status */}
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 14,
                                            lineHeight: 16,
                                            flex: 1
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        ${flashListData?.price}

                                      </Text>
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 14,
                                            lineHeight: 16,
                                            flex: 1
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        ${flashListData?.discount}
                                        {"\n"}
                                        {percentage}%
                                      </Text>
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 14,
                                            lineHeight: 16,
                                            textAlign: 'right',
                                            flex: 1
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {parseFloat(flashListData?.tax_rate)}%
                                        {"\n"}
                                        ${taxAmount}</Text>
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 14,
                                            lineHeight: 16,
                                            flex: 1,
                                            textAlign: 'right',
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {flashListData?.quantity}
                                      </Text>
                                    </View>



                                    {/* status */}
                                    <View style={{
                                      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8,
                                    }}>
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 13,
                                            lineHeight: 16,
                                            marginTop: 8,
                                            opacity: 0.6,

                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {'Patient Responsibility '}</Text>


                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 13,
                                            lineHeight: 16,
                                            marginTop: 8,
                                            opacity: 0.6,
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {'Insurance Responsibility'}</Text>


                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>

                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 14,
                                            lineHeight: 16,


                                            // textDecorationLine: flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'line-through' : 'none',
                                            // fontStyle:  flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'italic' : 'normal'

                                          },
                                          dimensions.width
                                        )}
                                      >
                                        ${flashListData?.patient_responsibility}
                                      </Text>

                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 14,
                                            lineHeight: 16,
                                            // textDecorationLine: flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'line-through' : 'none',
                                            // fontFamily:  flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'italic' : 'normal'

                                          },
                                          dimensions.width
                                        )}
                                      >
                                        ${flashListData?.insurer_responsibility}
                                      </Text>
                                    </View>


                                    {/* View 4 */}
                                    {/* <View
                                  style={StyleSheet.applyWidth(
                                    {
                                      alignItems: 'flex-start',
                                      alignSelf: 'flex-end',
                                      backgroundColor: getTaskStatusColor(
                                        Variables,
                                        flashListData?.status
                                      ),
                                      borderRadius: 5,
                                      marginTop: 5,
                                      paddingBottom: 2,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  <Text
                                    accessible={true}
                                    selectable={false}
                                    style={StyleSheet.applyWidth(
                                      {
                                        alignSelf: 'center',
                                        color: [
                                          {
                                            minWidth: Breakpoints.Mobile,
                                            value:
                                              palettes.App[
                                              'Custom Color_18'
                                              ],
                                          },
                                          {
                                            minWidth: Breakpoints.Mobile,
                                            value:
                                              flashListData?.tag?.color,
                                          },
                                        ],
                                        fontFamily: 'Inter_400Regular',
                                        fontSize: 12,
                                        marginLeft: 10,
                                        marginRight: 10,
                                        marginTop: 2,
                                        opacity: 0.7,
                                        paddingBottom: 4,
                                        paddingTop: 4,
                                        textAlign: 'center',
                                      },
                                      dimensions.width
                                    )}
                                  >
                                    {getTaskStatus(
                                      Variables,
                                      flashListData?.status
                                    )}
                                  </Text>
                                </View> */}

                                    <View
                                      style={StyleSheet.applyWidth(
                                        {
                                          flexDirection: 'row',
                                          justifyContent: 'space-between',
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      {/* status */}
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 14,
                                            lineHeight: 16,
                                            marginTop: 8,
                                            opacity: 0.6,
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {'Description: '}
                                      </Text>
                                    </View>
                                    <Text
                                      accessible={true}
                                      selectable={false}
                                      numberOfLines={3}
                                      style={StyleSheet.applyWidth(
                                        {
                                          color:
                                            palettes.App['Custom Color_18'],
                                          fontFamily: 'Inter_400Regular',
                                          fontSize: 14,
                                          lineHeight: 16,
                                          marginTop: 2,
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      {flashListData?.description}
                                    </Text>
                                    {flashListData?.created_by && Object.keys(flashListData?.created_by).length > 0 &&

                                      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 1 }}>


                                        <Text
                                          accessible={true}
                                          selectable={false}
                                          numberOfLines={3}
                                          style={StyleSheet.applyWidth(
                                            {
                                              color:
                                                palettes.App['Custom Color_18'],
                                              fontFamily: 'Inter_400Regular',
                                              fontSize: 13,
                                              lineHeight: 16,
                                              marginTop: 8,
                                              opacity: 0.6,
                                              textAlign: 'right'
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          {'Created By:  '}
                                        </Text>
                                        <Text
                                          accessible={true}
                                          selectable={false}
                                          numberOfLines={3}
                                          style={StyleSheet.applyWidth(
                                            {
                                              color:
                                                palettes.App['Custom Color_18'],
                                              fontFamily: 'Inter_400Regular',
                                              fontSize: 13,
                                              lineHeight: 16,
                                              marginTop: 8,
                                              paddingLeft: 5
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          {flashListData?.created_by?.full_name}
                                        </Text>
                                        {/* <TouchableOpacity onPress={() => {
                                       const handler = async () => {

                                        try {
                      
                                          Alert.alert(
                                            `Are you sure you want to delete this task?`,
                                            `Delete ${flashListData?.title}`,
                                            [
                                              {
                                                text: 'Cancel',
                                                onPress: () => console.log('Cancel Pressed'),
                                                style: 'cancel', // iOS bolds "Cancel"
                                              },
                                              {
                                                text: 'Yes',
                                                onPress: async () => {
                                                  setLoading(true);
                                                  const deleted = (
                                                    await sunoDeleteTaskDELETE.mutateAsync({
                                                      task_id: flashListData?.id,
                                                    })
                                                  )?.json;
                                                  await refetchGetMyAssigneeTasks();

                                                  // const alltaskData = (
                                                  //   await SunoApi.getTaskDetailsGET(Constants, {
                                                  //     query:
                                                  //       '{id,title,priority,status,description,due_at,completed_at,updated_at,created_at,patient{id,first_name,middle_name,last_name,title,suffix,preferred_name,photo},comments{id,text,user{id,full_name,photo},created_at,created_by},assignees{user{id,first_name,last_name,full_name,suffix,title,is_active,photo}},assignee{id,first_name,last_name,full_name,suffix,title,is_active,photo},created_by}',
                                                  //     task_id: (params?.taskData ?? defaultProps.taskData)?.id,
                                                  //   })
                                                  // )?.json;
                                                  // setTaskData(alltaskData);
                                                  // setValue(String(alltaskData?.status ?? ""));
                      
                                                  setLoading(false);
                      
                                                }
                                              }
                                            ],
                                            { cancelable: true } // ✅ Android back button closes alert
                                          );
                      
                      
                                        } catch (err) {
                                          logError(err);
                                        }
                                      };
                                      handler();
                                    }} style={{ height : 35, width : 40, alignItems : 'center', justifyContent  :'center'}}>
                                      <Icon
                                        color={'#032c2a'}
                                        name={'MaterialIcons/delete'}
                                        size={25}
                                      />
                                    </TouchableOpacity> */}
                                      </View>
                                    }
                                  </View>

                                </View>
                              </Touchable>
                            </Surface>
                          );
                        }}
                        showsHorizontalScrollIndicator={true}
                        showsVerticalScrollIndicator={true}
                        style={StyleSheet.applyWidth(
                          {
                            borderRadius: 12,
                            overflow: 'hidden',
                            paddingBottom: 10,
                            paddingTop: 10,
                          },
                          dimensions.width
                        )}
                      />

                    </View>
                  );
                }}
              </SunoApi.FetchBillingLineItemGET>

            </View>
          </View>
        )}


        {!(menuOption === 1) ? null : (
          <View
            accessible={false}
            style={StyleSheet.applyWidth(
              { flex: 1, position: 'relative' },
              dimensions.width
            )}
          >


            <View
              style={StyleSheet.applyWidth({ flex: 1, }, dimensions.width)}
            >


              <SunoApi.FetchBillingPaymentsGET
                sale={billingData?.id}
                offqset={0}
                // has_active_subscription={true}
                limit={100}
                // nulls_first={true}
                handlers={{
                  onData: fetchData => {
                    const handler = async () => {
                      try {
                        setBillingLineItemsData(fetchData);
                        console.log("===== fetchData : ", fetchData)
                        // await setGlobalVariableValue({
                        //   key: 'taskOffsetFilter',
                        //   value: Constants['taskOffsetFilter'] + patientLimit,
                        // });
                        /* hidden 'Set Variable' action */
                        // if (refreshing) setRefreshing(false);

                      } catch (err) {
                        logError(err);
                      }
                    };
                    handler();
                  },
                }}
                query={`{id,payer_type,payment_date,description,method,method_display,amount,quickbooks_payment_id,quickbooks_sync{sync_status,error},is_migrated,tilled_payment_intent_id,tilled_charge_id,justifi_payment_id,payment_reference,created_by,updated_by,payment_source_type,insurance_policy{id,insurer{name}},managed_care_plan{id,name,managed_care_provider{id,name}},sale{id,payment_source_type,patient{id},clinic{tilled_account_id}},refunds{id,amount,tilled_refund_id}}`}
              >
                {({ loading, error, data, refetchGetMyAssigneeTasks }) => {
                  const fetchData = data?.json;
                  if (loading) {
                    return <ActivityIndicator size="large" color="#066858" />;
                  }

                  if (error || data?.status < 200 || data?.status >= 300) {
                    return <ActivityIndicator size="large" color="#066858" />;
                  }
                  // if (listLoading) {
                  //   return <ActivityIndicator size="large" color="#066858" />;
                  // }


                  return (
                    <View style={{ flex: 1 }}>


                      {!(billingLineItemsData?.length === 0) ? null : (
                        <EmptyListBlock
                          message={'Sale has no payments'}
                        />
                      )}


                      <SimpleStyleFlashList
                        data={billingLineItemsData}
                        estimatedItemSize={50}
                        horizontal={false}
                        inverted={false}
                        keyExtractor={(flashListData, index) =>
                          flashListData?.id ??
                          flashListData?.uuid ??
                          index?.toString() ??
                          JSON.stringify(flashListData)
                        }
                        listKey={'Task->View->Task->Fetch->FlashList'}
                        numColumns={1}

                        // onRefresh={async () => {
                        //   setRefreshing(true);

                        //   try {
                        //     await refetchGetMyAssigneeTasks();   // ⬅️ re-fetch API
                        //   } catch (e) {
                        //     logError(e);
                        //   }

                        //   setRefreshing(false);
                        // }}

                        // refreshing={refreshing}
                        // onEndReachedThreshold={0.5}
                        renderItem={({ item, index }) => {
                          const flashListData = item;
                          const totalAmount = parseFloat(flashListData?.price);
                          const deduction = parseFloat(flashListData?.discount);
                          const taxRate = parseFloat(flashListData?.tax_rate);

                          const netAmount = totalAmount - deduction;
                          const taxAmount = (netAmount * taxRate) / 100;
                          const percentage = (deduction / totalAmount) * 100;

                          return (
                            <Surface
                              {...GlobalStyles.SurfaceStyles(theme)['Surface']
                                .props}
                              elevation={1}
                              style={StyleSheet.applyWidth(
                                StyleSheet.compose(
                                  GlobalStyles.SurfaceStyles(theme)['Surface']
                                    .style,
                                  {
                                    backgroundColor:
                                      palettes.App['Custom #ffffff'],
                                    borderColor: palettes.App.TagBorder,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    marginBottom: 10,
                                  }
                                ),
                                dimensions.width
                              )}
                            >
                              <Touchable
                                onPress={() => {
                                  try {
                                    // navigation.navigate(
                                    //   'ViewBillingScreen',
                                    //   { billingData: flashListData },
                                    //   { pop: true }
                                    // );
                                  } catch (err) {
                                    logError(err);
                                  }
                                }}
                              >
                                <View
                                  style={StyleSheet.applyWidth(
                                    {
                                      alignItems: 'center',
                                      backgroundColor:
                                        palettes.App['Custom Color_15'],
                                      borderBottomLeftRadius: 10,
                                      borderBottomRightRadius: 10,
                                      borderTopLeftRadius: 10,
                                      borderTopRightRadius: 10,
                                      flexDirection: 'row',
                                      paddingBottom: 10,
                                      paddingLeft: 10,
                                      paddingRight: 10,
                                      paddingTop: 10,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {/* Details */}
                                  <View
                                    style={StyleSheet.applyWidth(
                                      {
                                        flex: 1, marginLeft: 10
                                      },
                                      dimensions.width
                                    )}
                                  >
                                    {/* View 5 */}
                                    <View
                                      style={StyleSheet.applyWidth(
                                        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
                                        dimensions.width
                                      )}
                                    >
                                      {/* Name */}
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_500Medium',
                                            fontSize: 16,
                                            textAlign: 'left',
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {'Date: '}
                                        {flashListData?.payment_date === null
                                          ? ''
                                          : DateUtils.format(
                                            flashListData?.payment_date,
                                            'MMM DD,YYYY'
                                          )}
                                      </Text>

                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color: flashListData?.balance > 0 ? '#ef4444' :
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_500Medium',
                                            fontSize: 16,
                                            textAlign: 'left',
                                            // textDecorationLine: flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'line-through' : 'none',
                                            // fontStyle:  flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'italic' : 'normal'

                                          },
                                          dimensions.width
                                        )}
                                      >
                                        ${flashListData?.amount}
                                      </Text>

                                    </View>
                                    {/* View 2 */}
                                    <View
                                      style={StyleSheet.applyWidth(
                                        {
                                          alignItems: 'center',
                                          flexDirection: 'row',
                                          paddingTop: 4
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      {/* Review */}
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 13,
                                            lineHeight: 16,
                                            marginTop: 8,
                                            opacity: 0.6,
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {"Payment by : "}
                                      </Text>
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 14,
                                            lineHeight: 16,
                                            marginTop: 8,

                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {flashListData?.payment_source_type == 1 ?
                                          'Patient' : `Insurer (${flashListData?.insurance_policy?.insurer?.name})`}
                                      </Text>

                                      {/* <View
                                      style={StyleSheet.applyWidth(
                                        {
                                          backgroundColor:
                                            getTaskPriorityColor(
                                              Variables,
                                              flashListData?.priority
                                            ),
                                          borderRadius: 12,
                                          marginLeft: 10,
                                          marginTop: 5,
                                          paddingBottom: 2,
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        style={StyleSheet.applyWidth(
                                          {
                                            alignSelf: 'center',
                                            color: [
                                              {
                                                minWidth: Breakpoints.Mobile,
                                                value:
                                                  palettes.App[
                                                  'Custom Color_18'
                                                  ],
                                              },
                                              {
                                                minWidth: Breakpoints.Mobile,
                                                value:
                                                  flashListData?.tag?.color,
                                              },
                                            ],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 12,
                                            marginLeft: 10,
                                            marginRight: 10,
                                            marginTop: 2,
                                            opacity: 0.7,
                                            textAlign: 'center',
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {getTaskPriority(
                                          Variables,
                                          flashListData?.priority
                                        )}
                                      </Text>
                                    </View> */}
                                    </View>

                                    {/* View 3 */}
                                    <View
                                      style={StyleSheet.applyWidth(
                                        {
                                          flexDirection: 'row',
                                          // justifyContent: 'space-between',
                                          paddingTop: 12
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      {/* status */}
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 13,
                                            lineHeight: 16,
                                            opacity: 0.6,

                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {'Payment Method : '}
                                        {/* {flashListData?.provider?.first_name} {flashListData?.provider?.last_name
                                      } */}
                                      </Text>
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 14,
                                            lineHeight: 16,
                                            paddingLeft: 3,

                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {flashListData?.method_display?.toUpperCase() || '-'}

                                      </Text>
                                    </View>





                                    {/* status */}
                                    <View style={{
                                      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12,
                                    }}>
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 13,
                                            lineHeight: 16,
                                            // marginTop: 8,
                                            opacity: 0.6,

                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {'Payment Reference'}</Text>


                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 13,
                                            lineHeight: 16,
                                            // marginTop: 8,
                                            opacity: 0.6,
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {'Charge ID'}</Text>


                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>

                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 14,
                                            lineHeight: 16,


                                            // textDecorationLine: flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'line-through' : 'none',
                                            // fontStyle:  flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'italic' : 'normal'

                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {flashListData?.payment_reference || '-'}
                                      </Text>

                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 14,
                                            lineHeight: 16,
                                            // textDecorationLine: flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'line-through' : 'none',
                                            // fontFamily:  flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'italic' : 'normal'

                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {flashListData?.tilled_charge_id || '-'}
                                      </Text>
                                    </View>



                                    <View
                                      style={StyleSheet.applyWidth(
                                        {
                                          flexDirection: 'row',
                                          justifyContent: 'space-between',
                                          paddingTop: 6
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      {/* status */}
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 14,
                                            lineHeight: 16,
                                            marginTop: 8,
                                            opacity: 0.6,
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {'Description : '}
                                      </Text>
                                    </View>
                                    <Text
                                      accessible={true}
                                      selectable={false}
                                      numberOfLines={3}
                                      style={StyleSheet.applyWidth(
                                        {
                                          color:
                                            palettes.App['Custom Color_18'],
                                          fontFamily: 'Inter_400Regular',
                                          fontSize: 14,
                                          lineHeight: 16,
                                          marginTop: 2,
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      {flashListData?.description || '-'}
                                    </Text>
                                    {flashListData?.created_by && Object.keys(flashListData?.created_by).length > 0 &&

                                      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 1 }}>


                                        <Text
                                          accessible={true}
                                          selectable={false}
                                          numberOfLines={3}
                                          style={StyleSheet.applyWidth(
                                            {
                                              color:
                                                palettes.App['Custom Color_18'],
                                              fontFamily: 'Inter_400Regular',
                                              fontSize: 13,
                                              lineHeight: 16,
                                              marginTop: 8,
                                              opacity: 0.6,
                                              textAlign: 'right'
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          {'Created By:  '}
                                        </Text>
                                        <Text
                                          accessible={true}
                                          selectable={false}
                                          numberOfLines={3}
                                          style={StyleSheet.applyWidth(
                                            {
                                              color:
                                                palettes.App['Custom Color_18'],
                                              fontFamily: 'Inter_400Regular',
                                              fontSize: 13,
                                              lineHeight: 16,
                                              marginTop: 8,
                                              paddingLeft: 5
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          {flashListData?.created_by?.full_name}
                                        </Text>
                                        {/* <TouchableOpacity onPress={() => {
                                       const handler = async () => {

                                        try {
                      
                                          Alert.alert(
                                            `Are you sure you want to delete this task?`,
                                            `Delete ${flashListData?.title}`,
                                            [
                                              {
                                                text: 'Cancel',
                                                onPress: () => console.log('Cancel Pressed'),
                                                style: 'cancel', // iOS bolds "Cancel"
                                              },
                                              {
                                                text: 'Yes',
                                                onPress: async () => {
                                                  setLoading(true);
                                                  const deleted = (
                                                    await sunoDeleteTaskDELETE.mutateAsync({
                                                      task_id: flashListData?.id,
                                                    })
                                                  )?.json;
                                                  await refetchGetMyAssigneeTasks();

                                                  // const alltaskData = (
                                                  //   await SunoApi.getTaskDetailsGET(Constants, {
                                                  //     query:
                                                  //       '{id,title,priority,status,description,due_at,completed_at,updated_at,created_at,patient{id,first_name,middle_name,last_name,title,suffix,preferred_name,photo},comments{id,text,user{id,full_name,photo},created_at,created_by},assignees{user{id,first_name,last_name,full_name,suffix,title,is_active,photo}},assignee{id,first_name,last_name,full_name,suffix,title,is_active,photo},created_by}',
                                                  //     task_id: (params?.taskData ?? defaultProps.taskData)?.id,
                                                  //   })
                                                  // )?.json;
                                                  // setTaskData(alltaskData);
                                                  // setValue(String(alltaskData?.status ?? ""));
                      
                                                  setLoading(false);
                      
                                                }
                                              }
                                            ],
                                            { cancelable: true } // ✅ Android back button closes alert
                                          );
                      
                      
                                        } catch (err) {
                                          logError(err);
                                        }
                                      };
                                      handler();
                                    }} style={{ height : 35, width : 40, alignItems : 'center', justifyContent  :'center'}}>
                                      <Icon
                                        color={'#032c2a'}
                                        name={'MaterialIcons/delete'}
                                        size={25}
                                      />
                                    </TouchableOpacity> */}
                                      </View>
                                    }
                                  </View>

                                </View>
                              </Touchable>
                            </Surface>
                          );
                        }}
                        showsHorizontalScrollIndicator={true}
                        showsVerticalScrollIndicator={true}
                        style={StyleSheet.applyWidth(
                          {
                            borderRadius: 12,
                            overflow: 'hidden',
                            paddingBottom: 10,
                            paddingTop: 10,
                          },
                          dimensions.width
                        )}
                      />

                    </View>
                  );
                }}
              </SunoApi.FetchBillingPaymentsGET>

            </View>
          </View>
        )}

        {!(menuOption === 2) ? null : (
          <View
            accessible={false}
            style={StyleSheet.applyWidth(
              { flex: 1, position: 'relative' },
              dimensions.width
            )}
          >


            <View
              style={StyleSheet.applyWidth({ flex: 1, }, dimensions.width)}
            >


              <SunoApi.FetchBillingAdjustmentGET
                sale={billingData?.id}
                // has_active_subscription={true}
                limit={300}
                // nulls_first={true}
                handlers={{
                  onData: fetchData => {
                    const handler = async () => {
                      try {
                        setBillingLineItemsData(fetchData);
                        console.log("===== fetchData : ", fetchData)
                        // await setGlobalVariableValue({
                        //   key: 'taskOffsetFilter',
                        //   value: Constants['taskOffsetFilter'] + patientLimit,
                        // });
                        /* hidden 'Set Variable' action */
                        // if (refreshing) setRefreshing(false);

                      } catch (err) {
                        logError(err);
                      }
                    };
                    handler();
                  },
                }}
                query={`{id,adjustment_date,type,description,amount,quickbooks_payment_id,quickbooks_sync{sync_status},quickbooks_line_id,is_migrated,created_by,updated_by,payer_type,sale{id,payment_source_type,managed_care_plan{id,name,managed_care_provider{id,name}},insurance_policy{id,insurer{id,name}}},insurance_policy{id,insurer{name}},managed_care_plan{id,managed_care_provider{id,name}}}`}
              >
                {({ loading, error, data, refetchGetMyAssigneeTasks }) => {
                  const fetchData = data?.json;
                  if (loading) {
                    return <ActivityIndicator size="large" color="#066858" />;
                  }

                  if (error || data?.status < 200 || data?.status >= 300) {
                    return <ActivityIndicator size="large" color="#066858" />;
                  }
                  // if (listLoading) {
                  //   return <ActivityIndicator size="large" color="#066858" />;
                  // }


                  return (
                    <View style={{ flex: 1 }}>


                      {!(billingLineItemsData?.length === 0) ? null : (
                        <EmptyListBlock
                          message={'Sale has no adjustments'}
                        />
                      )}


                      <SimpleStyleFlashList
                        data={billingLineItemsData}
                        estimatedItemSize={50}
                        horizontal={false}
                        inverted={false}
                        keyExtractor={(flashListData, index) =>
                          flashListData?.id ??
                          flashListData?.uuid ??
                          index?.toString() ??
                          JSON.stringify(flashListData)
                        }
                        listKey={'Task->View->Task->Fetch->FlashList'}
                        numColumns={1}

                        // onRefresh={async () => {
                        //   setRefreshing(true);

                        //   try {
                        //     await refetchGetMyAssigneeTasks();   // ⬅️ re-fetch API
                        //   } catch (e) {
                        //     logError(e);
                        //   }

                        //   setRefreshing(false);
                        // }}

                        // refreshing={refreshing}
                        // onEndReachedThreshold={0.5}
                        renderItem={({ item, index }) => {
                          const flashListData = item;
                          const totalAmount = parseFloat(flashListData?.price);
                          const deduction = parseFloat(flashListData?.discount);
                          const taxRate = parseFloat(flashListData?.tax_rate);

                          const netAmount = totalAmount - deduction;
                          const taxAmount = (netAmount * taxRate) / 100;
                          const percentage = (deduction / totalAmount) * 100;

                          return (
                            <Surface
                              {...GlobalStyles.SurfaceStyles(theme)['Surface']
                                .props}
                              elevation={1}
                              style={StyleSheet.applyWidth(
                                StyleSheet.compose(
                                  GlobalStyles.SurfaceStyles(theme)['Surface']
                                    .style,
                                  {
                                    backgroundColor:
                                      palettes.App['Custom #ffffff'],
                                    borderColor: palettes.App.TagBorder,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    marginBottom: 10,
                                  }
                                ),
                                dimensions.width
                              )}
                            >
                              <Touchable
                                onPress={() => {
                                  try {
                                    // navigation.navigate(
                                    //   'ViewBillingScreen',
                                    //   { billingData: flashListData },
                                    //   { pop: true }
                                    // );
                                  } catch (err) {
                                    logError(err);
                                  }
                                }}
                              >
                                <View
                                  style={StyleSheet.applyWidth(
                                    {
                                      alignItems: 'center',
                                      backgroundColor:
                                        palettes.App['Custom Color_15'],
                                      borderBottomLeftRadius: 10,
                                      borderBottomRightRadius: 10,
                                      borderTopLeftRadius: 10,
                                      borderTopRightRadius: 10,
                                      flexDirection: 'row',
                                      paddingBottom: 10,
                                      paddingLeft: 10,
                                      paddingRight: 10,
                                      paddingTop: 10,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {/* Details */}
                                  <View
                                    style={StyleSheet.applyWidth(
                                      {
                                        flex: 1, marginLeft: 10
                                      },
                                      dimensions.width
                                    )}
                                  >
                                    {/* View 5 */}
                                    <View
                                      style={StyleSheet.applyWidth(
                                        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
                                        dimensions.width
                                      )}
                                    >
                                      {/* Name */}
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_500Medium',
                                            fontSize: 16,
                                            textAlign: 'left',
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {'Date: '}
                                        {flashListData?.payment_date === null
                                          ? ''
                                          : DateUtils.format(
                                            flashListData?.payment_date,
                                            'MMM DD,YYYY'
                                          )}
                                      </Text>

                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color: flashListData?.balance > 0 ? '#ef4444' :
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_500Medium',
                                            fontSize: 16,
                                            textAlign: 'left',
                                            // textDecorationLine: flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'line-through' : 'none',
                                            // fontStyle:  flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'italic' : 'normal'

                                          },
                                          dimensions.width
                                        )}
                                      >
                                        ${Math.abs(Number(flashListData?.amount))}
                                      </Text>

                                    </View>
                                    {/* View 2 */}
                                    <View
                                      style={StyleSheet.applyWidth(
                                        {
                                          alignItems: 'center',
                                          flexDirection: 'row',
                                          paddingTop: 4
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      {/* Review */}
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 13,
                                            lineHeight: 16,
                                            marginTop: 8,
                                            opacity: 0.6,
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {"Type : "}
                                      </Text>
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 14,
                                            lineHeight: 16,
                                            marginTop: 8,
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {flashListData?.type == 1 ? 'Bad Debt' : flashListData?.type == 2 ? 'Courtesy' : flashListData?.type == 3 ? 'Insurance Contractual' :
                                          flashListData?.type == 4 ? 'Insurance Write Off' : flashListData?.type == 5 ? 'Error' :
                                            flashListData?.type == 99 ? 'Other' : 'None'}
                                      </Text>

                                    </View>

                                    {/* View 3 */}
                                    <View
                                      style={StyleSheet.applyWidth(
                                        {
                                          flexDirection: 'row',
                                          // justifyContent: 'space-between',
                                          paddingTop: 12
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      {/* status */}
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 13,
                                            lineHeight: 16,
                                            opacity: 0.6,

                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {'Source : '}
                                        {/* {flashListData?.provider?.first_name} {flashListData?.provider?.last_name
                                      } */}
                                      </Text>
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 14,
                                            lineHeight: 16,
                                            paddingLeft: 3
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {flashListData?.payment_source_type === 1
                                          ? 'Patient'
                                          : flashListData?.insurance_policy?.insurer?.name
                                            ? `Insurer (${flashListData.insurance_policy.insurer.name})`
                                            : 'Insurer'}
                                      </Text>
                                    </View>

                                    <View
                                      style={StyleSheet.applyWidth(
                                        {
                                          flexDirection: 'row',
                                          justifyContent: 'space-between',
                                          paddingTop: 6
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      {/* status */}
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        numberOfLines={3}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_400Regular',
                                            fontSize: 14,
                                            lineHeight: 16,
                                            marginTop: 8,
                                            opacity: 0.6,
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {'Description : '}
                                      </Text>
                                    </View>
                                    <Text
                                      accessible={true}
                                      selectable={false}
                                      numberOfLines={3}
                                      style={StyleSheet.applyWidth(
                                        {
                                          color:
                                            palettes.App['Custom Color_18'],
                                          fontFamily: 'Inter_400Regular',
                                          fontSize: 14,
                                          lineHeight: 16,
                                          marginTop: 2,
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      {flashListData?.description || '-'}
                                    </Text>
                                    {flashListData?.created_by && Object.keys(flashListData?.created_by).length > 0 &&

                                      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 1 }}>


                                        <Text
                                          accessible={true}
                                          selectable={false}
                                          numberOfLines={3}
                                          style={StyleSheet.applyWidth(
                                            {
                                              color:
                                                palettes.App['Custom Color_18'],
                                              fontFamily: 'Inter_400Regular',
                                              fontSize: 13,
                                              lineHeight: 16,
                                              marginTop: 8,
                                              opacity: 0.6,
                                              textAlign: 'right'
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          {'Created By:  '}
                                        </Text>
                                        <Text
                                          accessible={true}
                                          selectable={false}
                                          numberOfLines={3}
                                          style={StyleSheet.applyWidth(
                                            {
                                              color:
                                                palettes.App['Custom Color_18'],
                                              fontFamily: 'Inter_400Regular',
                                              fontSize: 13,
                                              lineHeight: 16,
                                              marginTop: 8,
                                              paddingLeft: 5
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          {flashListData?.created_by?.full_name}
                                        </Text>
                                        {/* <TouchableOpacity onPress={() => {
                                       const handler = async () => {

                                        try {
                      
                                          Alert.alert(
                                            `Are you sure you want to delete this task?`,
                                            `Delete ${flashListData?.title}`,
                                            [
                                              {
                                                text: 'Cancel',
                                                onPress: () => console.log('Cancel Pressed'),
                                                style: 'cancel', // iOS bolds "Cancel"
                                              },
                                              {
                                                text: 'Yes',
                                                onPress: async () => {
                                                  setLoading(true);
                                                  const deleted = (
                                                    await sunoDeleteTaskDELETE.mutateAsync({
                                                      task_id: flashListData?.id,
                                                    })
                                                  )?.json;
                                                  await refetchGetMyAssigneeTasks();

                                                  // const alltaskData = (
                                                  //   await SunoApi.getTaskDetailsGET(Constants, {
                                                  //     query:
                                                  //       '{id,title,priority,status,description,due_at,completed_at,updated_at,created_at,patient{id,first_name,middle_name,last_name,title,suffix,preferred_name,photo},comments{id,text,user{id,full_name,photo},created_at,created_by},assignees{user{id,first_name,last_name,full_name,suffix,title,is_active,photo}},assignee{id,first_name,last_name,full_name,suffix,title,is_active,photo},created_by}',
                                                  //     task_id: (params?.taskData ?? defaultProps.taskData)?.id,
                                                  //   })
                                                  // )?.json;
                                                  // setTaskData(alltaskData);
                                                  // setValue(String(alltaskData?.status ?? ""));
                      
                                                  setLoading(false);
                      
                                                }
                                              }
                                            ],
                                            { cancelable: true } // ✅ Android back button closes alert
                                          );
                      
                      
                                        } catch (err) {
                                          logError(err);
                                        }
                                      };
                                      handler();
                                    }} style={{ height : 35, width : 40, alignItems : 'center', justifyContent  :'center'}}>
                                      <Icon
                                        color={'#032c2a'}
                                        name={'MaterialIcons/delete'}
                                        size={25}
                                      />
                                    </TouchableOpacity> */}
                                      </View>
                                    }
                                  </View>

                                </View>
                              </Touchable>
                            </Surface>
                          );
                        }}
                        showsHorizontalScrollIndicator={true}
                        showsVerticalScrollIndicator={true}
                        style={StyleSheet.applyWidth(
                          {
                            borderRadius: 12,
                            overflow: 'hidden',
                            paddingBottom: 10,
                            paddingTop: 10,
                          },
                          dimensions.width
                        )}
                      />

                    </View>
                  );
                }}
              </SunoApi.FetchBillingAdjustmentGET>

            </View>
          </View>
        )}

        {/* {billingData?.created_by && Object.keys(billingData?.created_by).length > 0 &&
  <View>
    <Text
      accessible={true}
      selectable={false}
      style={StyleSheet.applyWidth(
        {
          color: palettes.App.TextPlaceholder,
          fontFamily: 'Inter_400Regular',
          fontSize: 14,
          textAlign: 'left',
          textTransform: 'uppercase',
        },
        dimensions.width
      )}
    >
      {'Patient'}
    </Text>
    <Touchable
      onPress={() => {
        try {
          navigation.navigate(
            'PatientDetailsScreen',
            {
              id: (params?.billingData ?? defaultProps.taskData)?.patient?.id,
            },
            { pop: true }
          );
        } catch (err) {
          logError(err);
        }
      }}
    >
      <Text
        accessible={true}
        selectable={false}
        style={StyleSheet.applyWidth(
          {
            color: palettes.App.FilterTextColor,
            fontFamily: 'Inter_500Medium',
            fontSize: 14,
            marginBottom: 30,
            marginTop: 3,
            textAlign: 'left',
            textDecorationLine:
              'underline',
          },
          dimensions.width
        )}
      >{(params?.billingData ?? defaultProps.taskData)?.patient?.full_name}</Text>
    </Touchable>
  </View>
} */}


      </SimpleStyleScrollView>


    </ScreenContainer>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF'
  },
  headerSection: {
    marginBottom: 12
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827'
  },
  taskPriority: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4
  },
  taskDesc: {
    fontSize: 15,
    color: '#374151',
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    color: '#111827'
  },
  commentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 15
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10
  },
  placeholderAvatar: {
    backgroundColor: '#E5E7EB'
  },
  commentUser: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2
  },
  commentText: {
    color: '#374151'
  },
  footerSection: {
    marginTop: 16,
    paddingHorizontal: 15
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    minHeight: 40,
    textAlignVertical: 'top'
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: '600'
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 3,
    marginRight: 8,
  }
});
export default withTheme(ViewBillingScreen);
