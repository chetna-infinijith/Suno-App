import React from 'react';
import { withTheme } from '@draftbit/ui';
import { Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import useNavigation from '../utils/useNavigation';
import useWindowDimensions from '../utils/useWindowDimensions';

const defaultProps = { full_name: null, message: null, patientData: null };

const EmptyListBlock = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();

  return (
    <View
      style={StyleSheet.applyWidth(
        { alignSelf: 'center', marginTop: 20, paddingBottom: 10 },
        dimensions.width
      )}
    >
      <Text
        accessible={true}
        selectable={false}
        {...GlobalStyles.TextStyles(theme)['Text 2'].props}
        style={StyleSheet.applyWidth(
          StyleSheet.compose(
            GlobalStyles.TextStyles(theme)['Text 2'].style,
            theme.typography.body1,
            { color: palettes.Zinc[700] }
          ),
          dimensions.width
        )}
      >
        {props.message ?? defaultProps.message}
      </Text>
    </View>
  );
};

export default withTheme(EmptyListBlock);
