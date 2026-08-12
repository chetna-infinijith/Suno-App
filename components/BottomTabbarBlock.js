import React from 'react';
import { Icon, Surface, Touchable, withTheme } from '@draftbit/ui';
import { View } from 'react-native';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import useNavigation from '../utils/useNavigation';
import useWindowDimensions from '../utils/useWindowDimensions';

const BottomTabbarBlock = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();

  return (
    <Surface
      elevation={3}
      style={StyleSheet.applyWidth(
        { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
        dimensions.width
      )}
    >
      {/* Bottom Tab */}
      <View
        style={StyleSheet.applyWidth(
          {
            alignItems: 'center',
            backgroundColor: palettes.App['Custom #ffffff'],
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            flexDirection: 'row',
            height: 117,
            justifyContent: 'space-between',
            paddingBottom: 20,
            paddingLeft: 30,
            paddingRight: 30,
          },
          dimensions.width
        )}
      >
        {/* Home */}
        <Touchable activeOpacity={0.8} disabledOpacity={0.8}>
          <View
            style={StyleSheet.applyWidth(
              {
                alignItems: 'center',
                height: 48,
                justifyContent: 'center',
                width: 48,
              },
              dimensions.width
            )}
          >
            <Icon
              size={24}
              color={theme.colors.text.medium}
              name={'Ionicons/home-outline'}
            />
          </View>
        </Touchable>
        {/* Patients */}
        <Touchable activeOpacity={0.8} disabledOpacity={0.8}>
          <View
            style={StyleSheet.applyWidth(
              {
                alignItems: 'center',
                height: 48,
                justifyContent: 'center',
                width: 48,
              },
              dimensions.width
            )}
          >
            <Icon
              size={24}
              color={theme.colors.text.medium}
              name={'FontAwesome/user-o'}
            />
          </View>
        </Touchable>
        {/* Messages */}
        <Touchable activeOpacity={0.8} disabledOpacity={0.8}>
          <View
            style={StyleSheet.applyWidth(
              {
                alignItems: 'center',
                height: 48,
                justifyContent: 'center',
                width: 48,
              },
              dimensions.width
            )}
          >
            <Icon
              size={24}
              color={theme.colors.branding.primary}
              name={'Ionicons/chatbox'}
            />
          </View>
        </Touchable>
        {/* Task Transaction */}
        <Touchable activeOpacity={0.8} disabledOpacity={0.8}>
          <View
            style={StyleSheet.applyWidth(
              {
                alignItems: 'center',
                height: 48,
                justifyContent: 'center',
                width: 48,
              },
              dimensions.width
            )}
          >
            <Icon
              size={24}
              color={theme.colors.text.medium}
              name={'Entypo/list'}
            />
          </View>
        </Touchable>
        {/* Setting */}
        <Touchable activeOpacity={0.8} disabledOpacity={0.8}>
          <View
            style={StyleSheet.applyWidth(
              {
                alignItems: 'center',
                height: 48,
                justifyContent: 'center',
                width: 48,
              },
              dimensions.width
            )}
          >
            <Icon
              size={24}
              color={theme.colors.text.medium}
              name={'AntDesign/setting'}
            />
          </View>
        </Touchable>
      </View>
    </Surface>
  );
};

export default withTheme(BottomTabbarBlock);
