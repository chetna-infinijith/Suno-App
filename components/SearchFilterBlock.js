import React from 'react';
import { Icon, Surface, TextInput, Touchable, withTheme } from '@draftbit/ui';
import { View } from 'react-native';
import * as GlobalVariables from '../config/GlobalVariableContext';
import * as CustomCode from '../custom-files/CustomCode';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import useNavigation from '../utils/useNavigation';
import useWindowDimensions from '../utils/useWindowDimensions';

const defaultProps = { placeholder: null, value: null };

const SearchFilterBlock = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const [textInputValue, setTextInputValue] = React.useState('');
  const formatPhoneNumber = phoneNumber => {
    // Type the code for the body of your function or hook here.
    // Functions can be triggered via Button/Touchable actions.
    // Hooks are run per ReactJS rules.

    /* String line breaks are accomplished with backticks ( example: `line one
line two` ) and will not work with special characters inside of quotes ( example: "line one line two" ) */

    if (phoneNumber.length === 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
        3,
        6
      )}-${phoneNumber.slice(6)}`;
    }
    return phoneNumber; // Or handle other lengths as needed
  };

  return (
    <View
      style={StyleSheet.applyWidth(
        {
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
          paddingBottom: 16,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 16,
          width: '100%',
        },
        dimensions.width
      )}
    >
      <View style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width)}>
        <Surface
          elevation={3}
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              backgroundColor: palettes.Brand.Surface,
              borderRadius: 12,
              flex: 1,
              flexDirection: 'row',
              height: 48,
              justifyContent: 'space-between',
              minHeight: 48,
              paddingRight: 16,
            },
            dimensions.width
          )}
        >
          <Icon
            size={24}
            color={palettes.App.TextPlaceholder}
            name={'Feather/search'}
            style={StyleSheet.applyWidth({ left: 7 }, dimensions.width)}
          />
          <TextInput
            autoCapitalize={'none'}
            autoCorrect={true}
            changeTextDelay={500}
            onChangeText={newTextInputValue => {
              try {
                setTextInputValue(newTextInputValue);
              } catch (err) {
                console.log(err);
              }
            }}
            webShowOutline={true}
            placeholder={'Search patients by name, phone...'}
            placeholderTextColor={palettes.App.TextPlaceholder}
            style={StyleSheet.applyWidth(
              {
                borderRadius: 8,
                color: theme.colors.text.medium,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                height: 48,
                paddingBottom: 8,
                paddingLeft: 12,
                paddingRight: 0,
                paddingTop: 8,
                width: '90%',
              },
              dimensions.width
            )}
            value={textInputValue}
          />
        </Surface>
      </View>

      <View style={StyleSheet.applyWidth({ marginLeft: 16 }, dimensions.width)}>
        <Touchable>
          <Icon
            color={theme.colors.branding.secondary}
            name={'AntDesign/filter'}
            size={30}
          />
        </Touchable>
      </View>
    </View>
  );
};

export default withTheme(SearchFilterBlock);
