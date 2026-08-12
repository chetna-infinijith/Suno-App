import React from 'react';
import { ScreenContainer, withTheme } from '@draftbit/ui';
import * as CustomCode from '../custom-files/CustomCode';
import * as PersonalClinicCustomView from '../custom-files/PersonalClinicCustomView';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const defaultProps = { clinicEvent: null, personalEvent: null };

const PersonalClinicEventScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const params = useParams();

  return (
    <ScreenContainer scrollable={false} hasSafeArea={true}>
      {/* CustomPersonalClinicView */}
      <Utils.CustomCodeErrorBoundary>
        <PersonalClinicCustomView.PersonalClinicView />
      </Utils.CustomCodeErrorBoundary>
    </ScreenContainer>
  );
};

export default withTheme(PersonalClinicEventScreen);
