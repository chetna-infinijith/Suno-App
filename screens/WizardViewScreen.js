import React from 'react';
import { ScreenContainer, withTheme } from '@draftbit/ui';
import * as CustomCode from '../custom-files/CustomCode';
import * as WizardCustomView from '../custom-files/WizardCustomView';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const defaultProps = {
  firstname: null,
  fullname: null,
  inboxRoute: null,
  middlename: null,
  lastname: null,
};

const WizardViewScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const params = useParams();
  const [newApptModal, setNewApptModal] = React.useState(false);

  return (
    <ScreenContainer scrollable={false} hasSafeArea={true}>
      {/* WizardView */}
      <Utils.CustomCodeErrorBoundary>
        <WizardCustomView.AppointmentWizard theme={theme}/>
      </Utils.CustomCodeErrorBoundary>
    </ScreenContainer>
  );
};

export default withTheme(WizardViewScreen);
