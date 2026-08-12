import React from 'react';
import { TextInput, withTheme } from '@draftbit/ui';
import { Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import useNavigation from '../utils/useNavigation';
import useWindowDimensions from '../utils/useWindowDimensions';

const defaultProps = {
  keyboardType: null,
  onSubmitNext: () => {},
  placeholder: null,
  ref: null,
  title: null,
  value: null,
};

const FormInputBlock = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const [textInputValue2, setTextInputValue2] = React.useState('');
  const [textInputValue, setTextInputValue] = React.useState('');

  return (
    <View>
      <Text
        accessible={true}
        selectable={false}
        {...GlobalStyles.TextStyles(theme)['Text 3'].props}
        style={StyleSheet.applyWidth(
          StyleSheet.compose(
            GlobalStyles.TextStyles(theme)['Text 3'].style,
            theme.typography.body1,
            {}
          ),
          dimensions.width
        )}
      >
        {props.title ?? defaultProps.title}
      </Text>
      <TextInput
        autoCapitalize={'none'}
        autoCorrect={true}
        changeTextDelay={500}
        onChangeText={newTextInputValue => {
          const textInputValue = newTextInputValue;
          try {
            setTextInputValue2(newTextInputValue);
          } catch (err) {
            console.log(err);
          }
        }}
        placeholder={'Enter a value...'}
        webShowOutline={true}
        {...GlobalStyles.TextInputStyles(theme)['Text Input'].props}
        placeholderTextColor={palettes.App.TextPlaceholder}
        style={StyleSheet.applyWidth(
          StyleSheet.compose(
            GlobalStyles.TextInputStyles(theme)['Text Input'].style,
            theme.typography.body2,
            { borderColor: palettes.App.TagBorder, height: 40 }
          ),
          dimensions.width
        )}
        value={textInputValue2}
      />
    </View>
  );
};

export default withTheme(FormInputBlock);
