import React from 'react';
import { ScreenContainer, withTheme } from '@draftbit/ui';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import palettes from '../themes/palettes';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const CaptureVisitScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();

  return (
    <ScreenContainer scrollable={false} hasSafeArea={true}>
      <CustomChildHeaderBlock name={'Capture Visit'} />
    </ScreenContainer>
  );
};

export default withTheme(CaptureVisitScreen);
