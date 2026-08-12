import React from 'react';
import { withTheme } from '@draftbit/ui';
import { View } from 'react-native';
import * as CalendarCustomView from '../custom-files/CalendarCustomView';
import * as CustomCode from '../custom-files/CustomCode';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import useNavigation from '../utils/useNavigation';
import useWindowDimensions from '../utils/useWindowDimensions';

const CustomCalenderBlock = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();

  return (
    <View>
      <Utils.CustomCodeErrorBoundary>
        <CalendarCustomView.CalendarAppointments />
      </Utils.CustomCodeErrorBoundary>
    </View>
  );
};

export default withTheme(CustomCalenderBlock);
