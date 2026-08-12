import React from 'react';
import { Icon, Pressable, withTheme } from '@draftbit/ui';
import { Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import useNavigation from '../utils/useNavigation';
import useWindowDimensions from '../utils/useWindowDimensions';

const defaultProps = {
  full_name: null,
  header_name: 'Upcoming Appointments',
  icon_name: 'MaterialCommunityIcons/email',
  leftIconVisible: true,
  onPressEvent: () => {},
  patientData: null,
  rightIcon: 'Feather/printer',
  rightIconVisible: false,
  rightTextVisible: false,
  viewall: 'View All',
};

const HeaderEventsBlock = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();

  return (
    <View
      style={StyleSheet.applyWidth(
        {
          alignItems: 'center',
          flexDirection: 'row',
          marginLeft: 20,
          marginRight: 20,
          marginTop: 20,
        },
        dimensions.width
      )}
    >
      <>
        {!(props.leftIconVisible ?? defaultProps.leftIconVisible) ? null : (
          <Icon
            color={theme.colors.branding.secondary}
            name={props.icon_name ?? defaultProps.icon_name}
            size={22}
          />
        )}
      </>
      <View
        style={StyleSheet.applyWidth(
          { alignItems: 'flex-start', flex: 1, marginLeft: 10 },
          dimensions.width
        )}
      >
        <Text
          accessible={true}
          selectable={false}
          style={StyleSheet.applyWidth(
            {
              color: palettes.App['Custom Color_18'],
              fontFamily: 'Inter_500Medium',
              fontSize: 18,
            },
            dimensions.width
          )}
        >
          {props.header_name ?? defaultProps.header_name}
        </Text>
      </View>
      <>
        {props.rightTextVisible ?? defaultProps.rightTextVisible ? null : (
          <Pressable
            onPress={() => {
              try {
                props.onPressEvent?.();
              } catch (err) {
                console.log(err);
              }
            }}
          >
            <View
              style={StyleSheet.applyWidth(
                {
                  alignItems: 'center',
                  alignSelf: 'auto',
                  flexDirection: 'row',
                },
                dimensions.width
              )}
            >
              {/* Icon 2 */}
              <>
                {!(
                  props.rightIconVisible ?? defaultProps.rightIconVisible
                ) ? null : (
                  <Icon
                    color={theme.colors.branding.secondary}
                    name={props.rightIcon ?? defaultProps.rightIcon}
                    size={16}
                  />
                )}
              </>
              <Text
                accessible={true}
                selectable={false}
                {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                style={StyleSheet.applyWidth(
                  StyleSheet.compose(
                    GlobalStyles.TextStyles(theme)['Text 2'].style,
                    theme.typography.headline1,
                    {
                      alignSelf: 'flex-end',
                      color: theme.colors.branding.secondary,
                      fontFamily: 'Inter_500Medium',
                      fontSize: 14,
                      marginLeft: 5,
                    }
                  ),
                  dimensions.width
                )}
              >
                {props.viewall ?? defaultProps.viewall}
              </Text>
            </View>
          </Pressable>
        )}
      </>
    </View>
  );
};

export default withTheme(HeaderEventsBlock);