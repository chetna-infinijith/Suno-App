import React from 'react';
import { ScreenContainer, withTheme } from '@draftbit/ui';
import * as CustomCode from '../custom-files/CustomCode';
import * as customSplashScreen from '../custom-files/customSplashScreen';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const SplashScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();

  return (
    <ScreenContainer
      scrollable={false}
      hasSafeArea={false}
      style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width)}
    >
      {/* CustomSplashScreen */}
      <Utils.CustomCodeErrorBoundary>
        <customSplashScreen.SplashScreenView />
      </Utils.CustomCodeErrorBoundary>
    </ScreenContainer>
  );
};

export default withTheme(SplashScreen);
