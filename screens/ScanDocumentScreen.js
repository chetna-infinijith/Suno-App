import React from 'react';
import { ScreenContainer, withTheme } from '@draftbit/ui';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import * as CustomCode from '../custom-files/CustomCode';
import * as ScanDocument from '../custom-files/ScanDocument';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const defaultProps = { box_folder_id: null, id: null };

const ScanDocumentScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const params = useParams();

  return (
    <ScreenContainer scrollable={false} hasSafeArea={true}>
      <CustomChildHeaderBlock name={'Scan Document'} />
      <Utils.CustomCodeErrorBoundary>
        <ScanDocument.ScanDocument
          patientData={{
            patientID: params?.id ?? defaultProps.id,
            BoxID: params?.box_folder_id ?? defaultProps.box_folder_id,
          }}
        />
      </Utils.CustomCodeErrorBoundary>
    </ScreenContainer>
  );
};

export default withTheme(ScanDocumentScreen);
