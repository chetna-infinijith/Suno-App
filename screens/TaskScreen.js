import React from 'react';
import {
  Circle,
  Icon,
  ScreenContainer,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import { ActivityIndicator, Modal, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeaderBlock from '../components/CustomHeaderBlock';
import { TaskListSection } from '../components/TaskListView';
import * as GlobalVariables from '../config/GlobalVariableContext';
import { checkInternetAndProceed } from '../custom-files/InternetConnection.js';
import fetchClinic from '../global-functions/fetchClinic';
import fetchInsurance from '../global-functions/fetchInsurance';
import fetchManageCarePlan from '../global-functions/fetchManageCarePlan';
import fetchProviders from '../global-functions/fetchProviders';
import fetchReferenceSource from '../global-functions/fetchReferenceSource';
import palettes from '../themes/palettes';
import useNavigation from '../utils/useNavigation';
import useWindowDimensions from '../utils/useWindowDimensions';
import * as SunoApi from '../apis/SunoApi.js';
import { logError } from '../index.js';

const TaskScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const Constants = GlobalVariables.useValues();
  const [, setClinic] = React.useState([]);
  const [, setGlobalTags] = React.useState([]);
  const [, setInsuranceTypes] = React.useState([]);
  const [, setManageCarePlan] = React.useState([]);
  const [, setProviders] = React.useState([]);
  const [, setReferenceSource] = React.useState([]);
  const [, setSubReferenceSource] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [toggleFilter] = React.useState(false);

  React.useEffect(() => {
    const handler = async () => {
      try {
        const isConnected = await checkInternetAndProceed();
        if (!isConnected) {
          return;
        }
        const AllGlobalTags = (
          await SunoApi.getGlobalTagsGET(Constants, {
            limit: 300,
            type: 'Patient',
          })
        )?.json;
        setGlobalTags(AllGlobalTags);
        const allProviderData = (
          await SunoApi.getProvidersGET(Constants, {
            is_active: true,
            limit: 300,
            query:
              '{id,touchpoint_notifications_enabled,scheduler_select_all_staff,scheduler_persist_per_clinic,last_name,non_npi_id_qualifier,npi,role,patient_arrived_sound_enabled,user_preferences,first_name,task_is_assigned_notifications_enabled,signature,photo,title,suffix,license_number,user_reminder_notifications_enabled,suno_comms_id,date_joined,payment_request_notifications_enabled,is_active,fax_phone,full_name,last_login,user_permissions,non_npi_id,onboarding_form_notifications_enabled,name,color,noah_username,groups{id,name,permissions},email,clinics{id,name,timezone,noah_provider,noah_alias,noah_tenant_id},default_clinic{id,name,timezone},can_see_manufacturer_cost}',
          })
        )?.json;
        setProviders(fetchProviders(allProviderData));
        const allInsurenceData = (
          await SunoApi.getInsurersGET(Constants, {
            country: 'United States of America',
            is_active: true,
            limit: 300,
            offset: 0,
            query: '{*}',
          })
        )?.json;
        setInsuranceTypes(fetchInsurance(allInsurenceData));
        const AllClinicData = (
          await SunoApi.getClinicGET(Constants, {
            ordering: 'name',
            query:
              '{id,name,logo,display_name,extra{billng_street_address_1,billng_street_address_2,billng_city,billng_state,billng_zip,billng_phone},street_address_1,street_address_2,city,state,zip_code,phone,region{id},practice{id,logo,name}}',
            region: Constants['UserInfo']?.default_clinic?.region?.id,
            user: Constants['UserInfo']?.id,
          })
        )?.json;
        setClinic(fetchClinic(AllClinicData));
        const AllReferernceData = (
          await SunoApi.getReferenceSourceGET(Constants, {
            parent__isnull: true,
            query: '{-children}',
          })
        )?.json;
        const referernceData = fetchReferenceSource(AllReferernceData, 1);
        const AllSubReferernceData = (
          await SunoApi.getReferenceSourceGET(Constants, {
            parent__isnull: false,
            query: '{-children}',
          })
        )?.json;
        const subReferernceData = fetchReferenceSource(AllSubReferernceData, 2);
        const AllManageCarePlanData = (
          await SunoApi.getManageCarePlanGET(Constants, {
            is_active: true,
            limit: 300,
          })
        )?.json;
        setManageCarePlan(fetchManageCarePlan(AllManageCarePlanData));
        setReferenceSource(referernceData);
        setSubReferenceSource(subReferernceData);
      } catch (err) {
        logError('API Error Task : ', err);
      }
    };
    handler();
  }, []);

  return (
    <ScreenContainer scrollable={false} hasSafeArea={false} hasBottomSafeArea={false} hasTopSafeArea={true}>
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

      {toggleFilter ? null : (
        <View style={{ flex: 1, backgroundColor: palettes.App['Custom Color_15'] }}>
          <CustomHeaderBlock />

          <View
            style={{
              flex: 1,
              backgroundColor: '#fff',
              marginTop: 5,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              overflow: 'hidden',
            }}
          >
            <View style={{ flex: 1, width: dimensions.width }}>
              <TaskListSection
                theme={theme}
                listBottomPadding={insets.bottom + 88}
                listKeyPrefix="TaskScreen"
                onDeleteLoadingChange={setLoading}
              />
            </View>
          </View>

          <View
            style={{
              position: 'absolute',
              right: 20,
              bottom: Math.max(insets.bottom, 16) + 8,
            }}
          >
            <Touchable
              onPress={() => {
                try {
                  navigation.navigate('NewTaskScreen', {}, { pop: true });
                } catch (err) {
                  logError('Navigation Error : ', err);
                }
              }}
            >
              <Circle
                bgColor={palettes.App['Custom Color_5']}
                size={56}
                style={{
                  backgroundColor: theme.colors.branding.secondary,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 6,
                }}
              >
                <Icon
                  size={26}
                  color={theme.colors.background.base}
                  name="Feather/plus"
                />
              </Circle>
            </Touchable>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
};

export default withTheme(TaskScreen);
