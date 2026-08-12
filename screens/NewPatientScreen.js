import React from 'react';
import { ScreenContainer, withTheme } from '@draftbit/ui';
import * as SunoApi from '../apis/SunoApi.js';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import * as GlobalVariables from '../config/GlobalVariableContext';
import * as CustomCode from '../custom-files/CustomCode';
import * as CustomPatientScreen from '../custom-files/CustomPatientScreen';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import useIsFocused from '../utils/useIsFocused';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const NewPatientScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const [textInputValue, setTextInputValue] = React.useState('');
  const [textInputValue2, setTextInputValue2] = React.useState('');
  const sunoCreatePatientsNoahPOST = SunoApi.useCreatePatientsNoahPOST();
  const isFocused = useIsFocused();
  React.useEffect(() => {
    const handler = async () => {
      try {
        if (!isFocused) {
          return;
        }
        (await sunoCreatePatientsNoahPOST.mutateAsync({ patient_pk: 9836 }))
          ?.json;
      } catch (err) {
        console.log(err);
      }
    };
    handler();
  }, [isFocused]);

  return (
    <ScreenContainer scrollable={false} hasSafeArea={true}>
      <CustomChildHeaderBlock name={'New Patient'} />
      <Utils.CustomCodeErrorBoundary>
        <CustomPatientScreen.CustomPatientScreen theme={theme} />
      </Utils.CustomCodeErrorBoundary>
    </ScreenContainer>
  );
};

export default withTheme(NewPatientScreen);
