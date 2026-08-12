import React from 'react';
import { ScreenContainer, withTheme } from '@draftbit/ui';
import { View } from 'react-native';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import * as CustomCode from '../custom-files/CustomCode';
import * as CustomNotificationFile from '../custom-files/CustomNotificationFile';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const NotificationScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();

  return (
    <ScreenContainer
      scrollable={false}
      hasSafeArea={true}
      hasTopSafeArea={true}
    >
      <CustomChildHeaderBlock name={'Notifications'} />
      <View style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width)}>
        <Utils.CustomCodeErrorBoundary>
          <CustomNotificationFile.NotificationList />
        </Utils.CustomCodeErrorBoundary>
      </View>
    </ScreenContainer>
  );
};

export default withTheme(NotificationScreen);
