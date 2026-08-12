import React from 'react';
import {
  ScreenContainer,
  SimpleStyleKeyboardAwareScrollView,
  withTheme,
} from '@draftbit/ui';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import * as CustomCode from '../custom-files/CustomCode';
import * as customNotificationPreference from '../custom-files/customNotificationPreference';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const NotificationPreferenceScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();

  return (
    <ScreenContainer
      scrollable={false}
      hasSafeArea={true}
      hasTopSafeArea={true}
    >
      <CustomChildHeaderBlock
        isNotificationVisible={false}
        isSettingVisible={false}
        name={'Notification Preferences'}
      />
      <SimpleStyleKeyboardAwareScrollView
        enableAutomaticScroll={false}
        enableOnAndroid={false}
        enableResetScrollToCoords={false}
        keyboardShouldPersistTaps={'never'}
        showsVerticalScrollIndicator={true}
        viewIsInsideTabBar={false}
        style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width)}
      >
        {/* CustomNotification */}
        <Utils.CustomCodeErrorBoundary>
          <customNotificationPreference.NotificationPreferenceView />
        </Utils.CustomCodeErrorBoundary>
      </SimpleStyleKeyboardAwareScrollView>
    </ScreenContainer>
  );
};

export default withTheme(NotificationPreferenceScreen);
