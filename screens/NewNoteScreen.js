import React from 'react';
import { ScreenContainer, withTheme } from '@draftbit/ui';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import * as ChartNoteEditor from '../custom-files/ChartNoteEditor';
import * as CustomCode from '../custom-files/CustomCode';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';
import { logError } from '..';

const defaultProps = { chartNoteData: null, id: null, clientID : null };

const NewNoteScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const params = useParams();
  React.useEffect(() => {
    try {
      /* 'Set Variable' action requires configuration: choose a variable */
    } catch (err) {
      logError(err);
    }
  }, []);

  return (
    <ScreenContainer scrollable={false} hasSafeArea={true}>
<CustomChildHeaderBlock
  name={
    Object.keys(params?.chartNoteData ?? defaultProps.chartNoteData ?? {}).length === 0
      ? 'Chart Note'
      : 'Update Chart Note'
  }
/>
      <Utils.CustomCodeErrorBoundary>
        <ChartNoteEditor.ChartNoteEditor
          patientData={{
            patientID: params?.id ?? defaultProps.id,
            type: 1,
            clinic: params?.clientID ?? defaultProps.clientID,
            icd10_codes: [],
          }}
          chartNoteData={
            params?.chartNoteData ?? defaultProps.chartNoteData ?? {}
          }
        />
      </Utils.CustomCodeErrorBoundary>
    </ScreenContainer>
  );
};

export default withTheme(NewNoteScreen);