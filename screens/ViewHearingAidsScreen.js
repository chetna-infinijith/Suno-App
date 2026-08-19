import React, { useMemo, useState, useRef } from 'react';
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
  BottomSheet,
} from '@draftbit/ui';
import {
  Text, View, Platform,
  Modal,
  Alert,
  ActivityIndicator, Image, TouchableOpacity,

} from 'react-native';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import * as GlobalVariables from '../config/GlobalVariableContext';
import palettes from '../themes/palettes';
import * as StyleSheet from '../utils/StyleSheet';
import showAlertUtil from '../utils/showAlert';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';
import * as SunoApi from '../apis/SunoApi.js';
import * as GlobalStyles from '../GlobalStyles.js';
import {
  formatPatientProductDate,
  fetchPatientProductDetail,
  getDeliveryDate,
  getExtendedWarrantyDate,
  getInvoiceDate,
  getLossDamageWarrantyDate,
  getManufacturerWarrantyDate,
  getPatientProductSerial,
  getReturnDueDate,
  getServicePlanDate,
} from '../utils/patientProductFields';
import { getProductStatusColor, getProductStatusName, getProductStatusTextColor } from './PatientDetailsScreen.js';
import moment from 'moment';

const defaultProps = { hearingAidsData: null, patientID: null };

const ViewHearingAidsScreen = props => {
  const { theme } = props;
  const navigation = useNavigation();
  const dimensions = useWindowDimensions();
  const params = useParams();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const [loading, setIsLoaderVisible] = React.useState(false);
  const [patientID, setPatientID] = useState(params?.patientID ?? defaultProps.patientID);

  const [hearingAidsData, setHearingAidsData] = useState(params?.hearingAidsData ?? defaultProps.hearingAidsData);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      if (!hearingAidsData?.id) {
        return;
      }
      try {
        const detail = await fetchPatientProductDetail(
          SunoApi.getPatientProductByIdGET,
          Constants,
          hearingAidsData.id
        );
        if (detail) {
          setHearingAidsData(detail);
        }
      } catch (error) {
        console.log('Failed to refresh hearing aid details:', error);
      }
    });
    return unsubscribe;
  }, [Constants, hearingAidsData?.id, navigation]);

  // React.useEffect(() => {
  //   const handler = async () => {
  //     try {
  //       console.log("==== handler : ", patientID)
  //       setIsLoaderVisible(true)
  //       const data = (
  //         await SunoApi.getHearingAidsGET(Constants, {
  //           patient: patientID,
  //           query: `{id,policyholder_member_id,plan_name,is_active,type,hearing_benefit,deductible,copay,has_hearing_aid,policyholder_relationship,policyholder_first_name,policyholder_last_name,policyholder_middle_name,policyholder_sex,policyholder_birthdate,policyholder_employer_name,policyholder_group_number,policyholder_street_address_1,policyholder_street_address_2,policyholder_city,policyholder_state,policyholder_country,policyholder_zip_code,policyholder_phone,notes,insurance_card_front,insurance_card_back,insurer_phone_number,coverage_type,insurer{id,name,payer_id,payer_name,email,fax_phone},effective_date,expiration_date,policy_type,verified,intake_form_submission}`,
  //         })
  //       )?.json;
  //       const tempData = data[0];
  //       setHearingAidsData(tempData);
  //       setIsLoaderVisible(false)

  //     } catch (err) {
  //       console.log(err);
  //       setIsLoaderVisible(false)

  //     }
  //   };
  //   handler();
  // }, []);

  const deleteInsuranceImages = async (type) => {

    try {
      setTimeout(() => {
        setIsLoaderVisible(true);
      }, 300);
      const apiUrl = `${Constants.API_BASE_URL}/hearing-aids/${hearingAidsData?.id}/`;
      if (Platform.OS === 'android') {
        const formData = new FormData();
        formData.append(type == 'front' ? 'insurance_card_front' : 'insurance_card_back', '');

        const response = await fetch(apiUrl, {
          method: 'PATCH',
          body: formData,
          headers: {
            // ❌ DO NOT set Content-Type manually
            'Content-Type': 'multipart/form-data',
            Authorization: Constants.AUTH_HEADER, // if needed
          },
        });


        const result = await response.json();
        // console.log('Upload response:', result);

        // if (status < 200 || status >= 300) {
        //   setIsLoaderVisible(false);
        //   return
        // }

        setIsLoaderVisible(false);
        setInsuranceFrontCard(result.insurance_card_front)
        setInsuranceBackCard(result.insurance_card_back)
        Alert.alert('Success', 'Image deleted successfully.', [
          {
            text: 'Ok',
            onPress: () => {
              setIsLoaderVisible(false);

            },
          },
        ]);


      } else {
        const formData = new FormData();
        formData.append(type == 'front' ? 'insurance_card_front' : 'insurance_card_back', {
        });

        const response = await fetch(
          `${apiUrl}`,
          {
            method: 'PATCH',
            headers: {
              Accept: 'application/json',
              Authorization: Constants.AUTH_HEADER,
            },
            body: formData,
          }
        );

        const result = await response.json();

        if (!response.ok) {

        }
        setIsLoaderVisible(false);
        setInsuranceFrontCard(result.insurance_card_front)
        setInsuranceBackCard(result.insurance_card_back)
        Alert.alert('Success', 'Image deleted successfully', [
          {
            text: 'Ok',
            onPress: () => {
              setIsLoaderVisible(false);

            },
          },
        ]);
      }

    } catch (error) {
      console.log('Upload failed:', error);
      setIsLoaderVisible(false);

      Alert.alert('Upload Failed', error.message, [
        {
          text: 'Ok',
          onPress: () => {
            // navigation.goBack();
          },
        },
      ]);
    }
  };

  const formatDate = value => {
    const formatted = formatPatientProductDate(value);
    return formatted === '-' ? '--' : formatted;
  };

  const formatDeliveredDate = value => formatDate(value);

  const getValue = value => (value || value === 0 ? value : '--');

  const getDateBadgeColor = rawDate => {
    if (!rawDate || rawDate === null) {
      return 'transparent';
    }
    let parsed = moment(rawDate, [moment.ISO_8601, 'MM/DD/YYYY'], true);
    if (!parsed.isValid()) {
      parsed = moment(rawDate);
    }
    if (!parsed.isValid()) {
      return 'transparent';
    }
    return parsed.endOf('day').isBefore(moment()) ? '#F04438' : '#22A06B';
  };

  const headerName =
    hearingAidsData?.inventory_product?.product?.display_name ||
    'Existing Hearing Aid';
  const isExistingHearingAid = headerName === 'Existing Hearing Aid';

  const manufacturerName =
    hearingAidsData?.inventory_product?.product?.master_product?.manufacturer
      ?.name || '--';

  const colorName =
    hearingAidsData?.inventory_product?.specification?.color || '--';

  const batteryName =
    hearingAidsData?.inventory_product?.specification?.battery || '--';

  const serialNumber = getPatientProductSerial(hearingAidsData);
  const serialNumberDisplay = serialNumber === '-' ? '--' : serialNumber;

    const additionalNotes = isExistingHearingAid ? hearingAidsData?.notes : 
    hearingAidsData?.inventory_product?.specification?.additional_notes || '--';

    const description =
    hearingAidsData?.description || '--';
    

  const topRows = [
    ...(!isExistingHearingAid
      ? [
          [
            { label: 'Manufacturer', value: manufacturerName },
            {
              label: 'Serial No',
              value: serialNumberDisplay,
            },
          ],
          [{ label: 'Name', value: headerName }],
          [
            { label: 'Color', value: colorName },
            { label: 'Battery', value: batteryName },
          ],
        ]
      : [
          [{ label: 'Existing Hearing Aid', value: description }],
          [{ label: 'Serial No', value: serialNumberDisplay }],
        ]),
    [
      {
        label: 'Invoice',
        value: hearingAidsData?.sale?.id ? `#${hearingAidsData?.sale?.id}` : '--',
      },
      {
        label: 'Invoice Date',
        value: formatDate(getInvoiceDate(hearingAidsData)),
        rawDate: getInvoiceDate(hearingAidsData),
        dateBadge: false,
      },
    ],
    [
      {
        label: 'MFR Warranty',
        value: formatDate(getManufacturerWarrantyDate(hearingAidsData)),
        rawDate: getManufacturerWarrantyDate(hearingAidsData),
        dateBadge: true,
      },
      {
        label: 'L&D Warranty',
        value: formatDate(getLossDamageWarrantyDate(hearingAidsData)),
        rawDate: getLossDamageWarrantyDate(hearingAidsData),
        dateBadge: true,
      },
    ],
    [
      {
        label: 'Service Plan',
        value: formatDate(getServicePlanDate(hearingAidsData)),
        rawDate: getServicePlanDate(hearingAidsData),
        dateBadge: true,
      },
      {
        label: 'Return Due Date',
        value: formatDate(getReturnDueDate(hearingAidsData)),
        rawDate: getReturnDueDate(hearingAidsData),
        dateBadge: true,
      },
    ],
    [
      {
        label: 'Delivery Date',
        value: formatDeliveredDate(getDeliveryDate(hearingAidsData)),
        rawDate: getDeliveryDate(hearingAidsData),
        dateBadge: false,
      },
      {
        label: 'Extended Warranty',
        value: formatDate(getExtendedWarrantyDate(hearingAidsData)),
        rawDate: getExtendedWarrantyDate(hearingAidsData),
        dateBadge: true,
      },
    ],
  ];

  const formatStatusDateTime = value => {
    if (!value || value === null) {
      return '--';
    }
    const parsed = moment(value);
    return parsed.isValid() ? parsed.format('MMM DD, YYYY HH:mm') : '--';
  };

  const statusHistory = (hearingAidsData?.statuses || [])
    .map((item, index) => {
      const stamp =
        item?.created_at 
        // ||
        // item?.updated_at ||
        // item?.timestamp ||
        // item?.date ||
        // null;
      return {
        id: `${item?.value ?? 'unknown'}-${index}`,
        value: item?.value,
        label: getProductStatusName(Variables, item?.value),
        color: getProductStatusColor(Variables, item?.value),
        textColor: getProductStatusTextColor(Variables, item?.value),
        dateText: formatStatusDateTime(stamp),
        sortStamp: stamp ? moment(stamp).valueOf() : Number.MIN_SAFE_INTEGER,
      };
    })
    .sort((a, b) => b.sortStamp - a.sortStamp);

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
      <CustomChildHeaderBlock name={'Hearing Aids Details'} />
      <View
        style={StyleSheet.applyWidth(
          {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingHorizontal: 20,
            paddingTop: 8,
          },
          dimensions.width
        )}
      >
        <Touchable
          onPress={() => {
            try {
              navigation.navigate('EditHearingAidScreen', {
                hearingAidsData,
                patientID,
                sectionTitle: params?.sectionTitle,
              });
            } catch (err) {
              console.log(err);
            }
          }}
        >
          <View
            style={{
              alignItems: 'center',
              backgroundColor: '#E8F5F3',
              borderRadius: 10,
              flexDirection: 'row',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Icon color={'#066858'} name={'Feather/edit-2'} size={16} />
            <Text
              style={{
                color: '#066858',
                fontFamily: 'Inter_600SemiBold',
                fontSize: 14,
              }}
            >
              Edit
            </Text>
          </View>
        </Touchable>
      </View>

      {/* <View style={StyleSheet.applyWidth({ padding: 20, paddingHorizontal: 20, flex : 1 }, dimensions.width)}> */}
      <SimpleStyleScrollView
        bounces={true}
        horizontal={false}
        keyboardShouldPersistTaps={'never'}
        nestedScrollEnabled={false}
        showsHorizontalScrollIndicator={true} // ✅ Add this line
        showsVerticalScrollIndicator={true}
        style={StyleSheet.applyWidth(
          { padding: 20, },
          dimensions.width
        )}
      >

        <View
          style={StyleSheet.applyWidth(
            {
              backgroundColor: '#FFFFFF',
              borderColor: '#D8DEE8',
              borderRadius: 12,
              borderWidth: 1,
              overflow: 'hidden',
            },
            dimensions.width
          )}
        >
          <View
            style={{
              backgroundColor: '#DCE7FB',
              borderBottomColor: '#D8DEE8',
              borderBottomWidth: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <View style={{ alignItems: 'center', flexDirection: 'row' }}>
              <Icon
                color={'#253144'}
                name={'Ionicons/ear-outline'}
                size={19}
                style={{
                  transform: [{ scaleX: hearingAidsData?.ear === 'R' ? -1 : 1 }],
                }}
              />
              <Text
                style={{
                  color: '#253144',
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 19,
                  marginLeft: 6,
                }}
              >
                {hearingAidsData?.ear === 'R' ? 'Right' : 'Left'}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: getProductStatusColor(Variables, hearingAidsData?.status),
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text
                style={{
                  color: getProductStatusTextColor(Variables, hearingAidsData?.status),
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 12,
                }}
              >
                {getProductStatusName(Variables, hearingAidsData?.status)}
              </Text>
            </View>
          </View>

          {topRows.map((row, rowIndex) => (
            <View
              key={`row-${rowIndex}`}
              style={{
                borderBottomWidth: rowIndex === topRows.length - 1 ? 0 : 1,
                borderColor: '#E6EBF2',
                flexDirection: 'row',
              }}
            >
              {row.map((cell, cellIndex) => (
                <View
                  key={`${cell.label}-${cellIndex}`}
                  style={{
                    backgroundColor: cell.statusCell
                      ? getProductStatusColor(Variables, hearingAidsData?.status)
                      : '#FFFFFF',
                    borderRightWidth: cellIndex === 0 ? 1 : 0,
                    borderColor: '#E6EBF2',
                    flex: 1,
                    minHeight: 78,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
                  <Text
                    style={{
                      color: cell.statusCell ? getProductStatusTextColor(Variables, hearingAidsData?.status) : '#667085',
                      fontFamily: 'Inter_500Medium',
                      fontSize: 12,
                      marginBottom: 4,
                      textTransform: 'uppercase',
                    }}
                  >
                    {cell.label}
                  </Text>
                  <Text
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: cell.dateBadge
                        ? getDateBadgeColor(cell.rawDate)
                        : 'transparent',
                      borderRadius: cell.dateBadge ? 6 : 0,
                      color: cell.value == '--' ? '#667085' : cell.dateBadge
                        ? '#FFFFFF'
                        : cell.statusCell
                          ? getProductStatusTextColor(Variables, hearingAidsData?.status)
                          : palettes.App.FilterTextColor,
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 14,
                      overflow: 'hidden',
                      paddingHorizontal: cell.dateBadge ? 8 : 0,
                      paddingVertical: cell.dateBadge ? 2 : 0,
                    }}
                  >
                    {getValue(cell.value)}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          <View style={{ borderTopColor: '#E6EBF2', borderTopWidth: 1, padding: 12 }}>
            <Text
              style={{
                color: '#667085',
                fontFamily: 'Inter_500Medium',
                fontSize: 12,
                marginBottom: 6,
                textTransform: 'uppercase',
              }}
            >
              Additional Notes
            </Text>
            <Text
              style={{
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_500Medium',
                fontSize: 16,
              }}
            >
              {additionalNotes}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              color: '#101828',
              fontFamily: 'Inter_600SemiBold',
              fontSize: 16,
              marginBottom: 14,
            }}
          >
            Status History
          </Text>

          {(statusHistory || []).length ? (
            statusHistory.map((item, index) => {
              const isLast = index === statusHistory.length - 1;
              return (
                <View
                  key={item.id}
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    marginBottom: isLast ? 8 : 14,
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text
                      style={{
                        color: '#344054',
                        fontFamily: 'Inter_500Medium',
                        fontSize: 12,
                        marginBottom: 6,
                        textAlign: 'right',
                      }}
                    >
                      {item.dateText}
                    </Text>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={{
                          backgroundColor: item.color,
                          borderRadius: 14,
                          color: item.textColor,
                          fontFamily: 'Inter_500Medium',
                          fontSize: 13,
                          overflow: 'hidden',
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                        }}
                      >
                        {item.label}
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'center', width: 26 , paddingTop : 4}}>
                    <View
                      style={{
                        backgroundColor: item.color,
                        borderRadius: 5,
                        height: 10,
                        width: 10,
                      }}
                    />
                    {/* {!isLast ? ( */}
                      <View
                        style={{
                          backgroundColor: isLast ? 'transparent' : '#C9CDD4',
                          marginTop: 4,
                          minHeight: 40,
                          width: 3,
                        }}
                      />
                    {/* ) : null} */}
                  </View>
                </View>
              );
            })
          ) : (
            <Text
              style={{
                color: '#667085',
                fontFamily: 'Inter_500Medium',
                fontSize: 15,
              }}
            >
              No status history available
            </Text>
          )}
        </View>
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
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 0.5,
    borderColor: 'gray'
    // borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  placeholder: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginBottom: 5,
  },
  label: {
    marginTop: 8,
    // fontSize : '11'
    fontWeight: '500',
    textAlign: 'center'
  },
  sheetContent: {
    padding: 16,
  },
  sheetItem: {
    fontSize: 16,
    paddingVertical: 12,
  },
});
export default withTheme(ViewHearingAidsScreen);
