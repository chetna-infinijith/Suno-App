import React from 'react';
import { Icon, Touchable, withTheme } from '@draftbit/ui';
import { Text, View } from 'react-native';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import useNavigation from '../utils/useNavigation';
import useWindowDimensions from '../utils/useWindowDimensions';

const defaultProps = {
  icon_color: null,
  icon_name: 'Feather/plus',
  onPressEvent: () => {},
  title: 'Schedule New Appointment',
  tttle_color: null,
};

const CustomAddBlock = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const [appointmentType, setAppointmentType] = React.useState(0);
  const [menuOption, setMenuOption] = React.useState(0);
  const [selectedTag, setSelectedTag] = React.useState('');

  return (
    <View
      style={StyleSheet.applyWidth(
        { alignItems: 'center', alignSelf: 'center' },
        dimensions.width
      )}
    >
      {/* Unselected 4 */}
      <Touchable
        onPress={() => {
          try {
            props.onPressEvent?.();
          } catch (err) {
            console.log(err);
          }
        }}
        activeOpacity={0.8}
        disabledOpacity={0.8}
        style={StyleSheet.applyWidth(
          { marginBottom: 4, marginLeft: 4, marginRight: 4, marginTop: 4 },
          dimensions.width
        )}
      >
        {/* <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              alignSelf: 'auto',
              borderRadius: 8,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingBottom: 8,
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 8,
            },
            dimensions.width
          )}
        > */}
        <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#E8EFED',
                        borderRadius: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                      }}
                    >
          <Icon
            size={18}
            color={
              props.icon_color ??
              defaultProps.icon_color ??
              theme.colors.branding.secondary
            }
            name={props.icon_name ?? defaultProps.icon_name}
          />
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: [
                  {
                    minWidth: Breakpoints.Mobile,
                    value: theme.colors.branding.secondary,
                  },
                  {
                    minWidth: Breakpoints.Mobile,
                    value: props.tttle_color ?? defaultProps.tttle_color,
                  },
                ],
               
                fontFamily: 'Inter_500Medium',
                          fontSize: 13,
                          marginLeft: 6,
              },
              dimensions.width
            )}
          >
            {props.title ?? defaultProps.title}
          </Text>
        </View>
      </Touchable>
    </View>
  );
};

export default withTheme(CustomAddBlock);
