import React from 'react';
import { ScreenContainer, withTheme } from '@draftbit/ui';
import * as SunoHealthcareManagementAPIApi from '../apis/SunoHealthcareManagementAPIApi.js';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import * as GlobalVariables from '../config/GlobalVariableContext';
import palettes from '../themes/palettes';
import useIsFocused from '../utils/useIsFocused';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const EditProfileScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const isFocused = useIsFocused();
  React.useEffect(() => {
    const handler = async () => {
      try {
        if (!isFocused) {
          return;
        }
        const results = (
          await SunoHealthcareManagementAPIApi.gET$api$appointments$GET(
            Constants,
            {}
          )
        )?.json;
        const GetUsersData = (() => {
          const e = results;
          console.log(results, e);
          return e;
        })();
      } catch (err) {
        console.log(err);
      }
    };
    handler();
  }, [isFocused]);

  return (
    <ScreenContainer scrollable={false} hasSafeArea={true}>
      <CustomChildHeaderBlock name={'Profile'} />
    </ScreenContainer>
  );
};

export default withTheme(EditProfileScreen);
