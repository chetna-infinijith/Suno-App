import React from 'react';
import { Icon, Surface, Touchable, withTheme } from '@draftbit/ui';
import { Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import useNavigation from '../utils/useNavigation';
import useWindowDimensions from '../utils/useWindowDimensions';

const defaultProps = {
  full_name: null,
  icon: null,
  name: null,
  patientData: null,
  routeName: () => {},
  routeParam: null,
};

const MenuButtonBlock = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();

  return (
    <View
      style={StyleSheet.applyWidth(
        {
          backgroundColor: palettes.App['Custom Color'],
          borderColor: palettes.App.TagBorder,
          borderRadius: 10,
          borderWidth: 1,
          flex: 1,
          marginLeft: 5,
          marginRight: 5,
          paddingBottom: 8,
          paddingTop: 8,
        },
        dimensions.width
      )}
    >
      <Touchable
        onPress={() => {
          try {
            props.routeName?.();
          } catch (err) {
            console.log(err);
          }
        }}
      >
        <Surface
          {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
          elevation={0}
          style={StyleSheet.applyWidth(
            StyleSheet.compose(
              GlobalStyles.SurfaceStyles(theme)['Surface'].style,
              { backgroundColor: palettes.App['Custom #ffffff'] }
            ),
            dimensions.width
          )}
        >
          <View
            style={StyleSheet.applyWidth(
              {
                alignItems: 'center',
                backgroundColor: palettes.App['Custom #ffffff'],
                flex: 1,
              },
              dimensions.width
            )}
          >
            <Icon
              color={theme.colors.text.strong}
              name={`${props.icon ?? defaultProps.icon}`}
              size={20}
              style={StyleSheet.applyWidth({ marginTop: 5 }, dimensions.width)}
            />
            <Text
              accessible={true}
              selectable={false}
              {...GlobalStyles.TextStyles(theme)['Text 2'].props}
              style={StyleSheet.applyWidth(
                StyleSheet.compose(
                  GlobalStyles.TextStyles(theme)['Text 2'].style,
                  theme.typography.body1,
                  {
                    color: palettes.App['Custom Color_18'],
                    fontSize: 10,
                    marginTop: 5,
                  }
                ),
                dimensions.width
              )}
              numberOfLines={1}
            >
              {props.name ?? defaultProps.name}
            </Text>
          </View>
        </Surface>
      </Touchable>
    </View>
  );
};

export default withTheme(MenuButtonBlock);
