import React from 'react';
import { ScreenContainer, withTheme } from '@draftbit/ui';
import { View } from 'react-native';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import * as CustomTaskScreen from '../custom-files/CustomTaskScreen';
import palettes from '../themes/palettes';
import * as Utils from '../utils';

const NewTaskScreen = props => {
  const { theme } = props;
  const routeParams = props?.route?.params ?? {};
  const isEdit = Boolean(routeParams?.isEdit);

  return (
    <ScreenContainer scrollable={false} hasSafeArea={true} hasTopSafeArea={false}>
      <CustomChildHeaderBlock name={isEdit ? 'Edit Task' : 'New Task'} />
      <View
        style={{
          flex: 1,
          backgroundColor: palettes.App['Custom Color_15'],
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
            marginTop: 5,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: 'hidden',
          }}
        >
          <Utils.CustomCodeErrorBoundary>
            <CustomTaskScreen.CustomTaskScreen theme={theme} props={routeParams} />
          </Utils.CustomCodeErrorBoundary>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default withTheme(NewTaskScreen);
