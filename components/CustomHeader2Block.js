import React from 'react';
import { CircleImage, Icon, Surface, Touchable, withTheme } from '@draftbit/ui';
import { Text, View } from 'react-native';
import Images from '../config/Images';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import imageSource from '../utils/imageSource';
import useNavigation from '../utils/useNavigation';
import useWindowDimensions from '../utils/useWindowDimensions';

const CustomHeader2Block = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();

  return (
    <View>
      {/* Top Navigation Header */}
      <View
        style={StyleSheet.applyWidth(
          {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
            paddingBottom: 8,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 8,
          },
          dimensions.width
        )}
      >
        {/* Left Section */}
        <View
          style={StyleSheet.applyWidth(
            { alignItems: 'flex-start', justifyContent: 'center' },
            dimensions.width
          )}
        >
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: theme.colors.text.strong,
                fontFamily: 'Inter_800ExtraBold',
                fontSize: 20,
                letterSpacing: 0.5,
              },
              dimensions.width
            )}
          >
            {'Hearing Care Clinic'}
          </Text>
        </View>
        {/* Right Section */}
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            },
            dimensions.width
          )}
        >
          <Touchable>
            <View
              style={StyleSheet.applyWidth(
                {
                  alignItems: 'center',
                  height: 46,
                  justifyContent: 'center',
                  width: 40,
                },
                dimensions.width
              )}
            >
              <Icon
                color={theme.colors.branding.secondary}
                name={'Ionicons/notifications'}
                size={24}
                style={StyleSheet.applyWidth(
                  { marginTop: 14 },
                  dimensions.width
                )}
              />
              <View
                style={StyleSheet.applyWidth(
                  {
                    backgroundColor: theme.colors.text.strong,
                    borderBottomWidth: 3,
                    borderColor: palettes.App['Custom Color_2'],
                    borderLeftWidth: 3,
                    borderRadius: 7,
                    borderRightWidth: 3,
                    borderTopWidth: 3,
                    height: 14,
                    left: 6,
                    top: -30,
                    width: 14,
                  },
                  dimensions.width
                )}
              />
            </View>
          </Touchable>
          {/* Touchable settings */}
          <Touchable>
            <View
              style={StyleSheet.applyWidth(
                {
                  alignItems: 'center',
                  height: 46,
                  justifyContent: 'center',
                  width: 40,
                },
                dimensions.width
              )}
            >
              <Icon
                color={theme.colors.branding.secondary}
                name={'Feather/settings'}
                size={24}
                style={StyleSheet.applyWidth(
                  { marginTop: 14 },
                  dimensions.width
                )}
              />
              <View
                style={StyleSheet.applyWidth(
                  { height: 14, left: 6, top: -30, width: 14 },
                  dimensions.width
                )}
              />
            </View>
          </Touchable>

          <Touchable
            style={StyleSheet.applyWidth({ marginLeft: 8 }, dimensions.width)}
          >
            <Surface
              elevation={3}
              style={StyleSheet.applyWidth(
                {
                  borderRadius: 20,
                  justifyContent: 'center',
                  minHeight: 34,
                  overflow: 'hidden',
                },
                dimensions.width
              )}
            >
              <CircleImage size={32} source={Images.Avatar} />
            </Surface>
          </Touchable>
        </View>
      </View>
    </View>
  );
};

export default withTheme(CustomHeader2Block);
