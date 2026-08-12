import React from 'react';
import { Icon, ScreenContainer, Touchable, withTheme } from '@draftbit/ui';
import { Text, View } from 'react-native';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const LoginScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const [listMissing, setListMissing] = React.useState(false);
  const [menuTab1, setMenuTab1] = React.useState(false);
  const [menuTab2, setMenuTab2] = React.useState(false);
  const [menuTab3, setMenuTab3] = React.useState(false);
  const [styledTextFieldValue, setStyledTextFieldValue] = React.useState('');
  const [textInputValue, setTextInputValue] = React.useState('');

  return (
    <ScreenContainer
      hasSafeArea={false}
      scrollable={false}
      style={StyleSheet.applyWidth(
        {
          alignContent: 'flex-start',
          alignItems: 'flex-start',
          alignSelf: 'auto',
          flexDirection: 'column',
        },
        dimensions.width
      )}
    >
      {/* Second Navigation Frame */}
      <View
        style={StyleSheet.applyWidth(
          { paddingLeft: 12, paddingRight: 12 },
          dimensions.width
        )}
      >
        {/* 3 Options Frame */}
        <View
          style={StyleSheet.applyWidth(
            { flexDirection: 'row', paddingBottom: 12, paddingTop: 12 },
            dimensions.width
          )}
        >
          {/* Option 1 Frame */}
          <View
            style={StyleSheet.applyWidth(
              {
                backgroundColor: palettes.App.Community_Icon_BG_Color,
                borderBottomLeftRadius: 64,
                borderTopLeftRadius: 64,
                flex: 1,
                flexGrow: 1,
                flexShrink: 0,
                justifyContent: 'center',
              },
              dimensions.width
            )}
          >
            {/* Flex Frame for Touchable */}
            <>
              {!menuTab1 ? null : (
                <View>
                  <Touchable
                    onPress={() => {
                      try {
                        setMenuTab1(true);
                        setMenuTab2(false);
                        setMenuTab3(false);
                        setListMissing(false);
                      } catch (err) {
                        console.log(err);
                      }
                    }}
                  >
                    {/* Button Frame True */}
                    <View
                      style={StyleSheet.applyWidth(
                        {
                          alignItems: 'center',
                          backgroundColor: theme.colors.branding.secondary,
                          borderBottomWidth: 2,
                          borderColor: theme.colors.branding.secondary,
                          borderLeftWidth: 2,
                          borderRadius: 64,
                          borderRightWidth: 2,
                          borderTopWidth: 2,
                          flexGrow: 0,
                          flexShrink: 0,
                          justifyContent: 'center',
                          paddingBottom: 9,
                          paddingLeft: 9,
                          paddingRight: 9,
                          paddingTop: 9,
                        },
                        dimensions.width
                      )}
                    >
                      {/* Label */}
                      <Text
                        accessible={true}
                        selectable={false}
                        style={StyleSheet.applyWidth(
                          {
                            color: palettes.App.Community_White,
                            fontFamily: 'Rubik_500Medium',
                            fontSize: 13,
                            lineHeight: 18,
                          },
                          dimensions.width
                        )}
                      >
                        {'Day'}
                      </Text>
                    </View>
                  </Touchable>
                </View>
              )}
            </>
            {/* Flex Frame for Touchable */}
            <>
              {menuTab1 ? null : (
                <View
                  style={StyleSheet.applyWidth(
                    {
                      backgroundColor: palettes.App.Community_Icon_BG_Color,
                      borderBottomLeftRadius: 64,
                      borderTopLeftRadius: 64,
                    },
                    dimensions.width
                  )}
                >
                  <Touchable
                    onPress={() => {
                      try {
                        setMenuTab1(true);
                        setMenuTab2(false);
                        setMenuTab3(false);
                        setListMissing(false);
                      } catch (err) {
                        console.log(err);
                      }
                    }}
                  >
                    {/* Button Frame False */}
                    <View
                      style={StyleSheet.applyWidth(
                        {
                          alignItems: 'center',
                          backgroundColor: palettes.App.Community_Icon_BG_Color,
                          borderBottomWidth: 2,
                          borderColor: palettes.App.Community_Icon_BG_Color,
                          borderLeftWidth: 2,
                          borderRadius: 64,
                          borderRightWidth: 2,
                          borderTopWidth: 2,
                          flexGrow: 0,
                          flexShrink: 0,
                          justifyContent: 'center',
                          paddingBottom: 9,
                          paddingLeft: 9,
                          paddingRight: 9,
                          paddingTop: 9,
                        },
                        dimensions.width
                      )}
                    >
                      {/* Label */}
                      <Text
                        accessible={true}
                        selectable={false}
                        style={StyleSheet.applyWidth(
                          {
                            color: palettes.Brand.Community_Dark_UI,
                            fontFamily: 'Rubik_400Regular',
                            fontSize: 13,
                            lineHeight: 18,
                          },
                          dimensions.width
                        )}
                      >
                        {'Day'}
                      </Text>
                    </View>
                  </Touchable>
                </View>
              )}
            </>
          </View>
          {/* Option 2 Frame */}
          <View
            style={StyleSheet.applyWidth(
              { flex: 1, flexGrow: 1, flexShrink: 0 },
              dimensions.width
            )}
          >
            {/* Flex Frame for Touchable */}
            <>
              {!menuTab2 ? null : (
                <View
                  style={StyleSheet.applyWidth(
                    { backgroundColor: palettes.App.Community_Icon_BG_Color },
                    dimensions.width
                  )}
                >
                  <Touchable
                    onPress={() => {
                      try {
                        setMenuTab1(false);
                        setMenuTab2(true);
                        setMenuTab3(false);
                      } catch (err) {
                        console.log(err);
                      }
                    }}
                  >
                    {/* Button Frame True */}
                    <View
                      style={StyleSheet.applyWidth(
                        {
                          alignItems: 'center',
                          backgroundColor: theme.colors.branding.secondary,
                          borderBottomWidth: 2,
                          borderColor: theme.colors.branding.secondary,
                          borderLeftWidth: 2,
                          borderRadius: 64,
                          borderRightWidth: 2,
                          borderTopWidth: 2,
                          flexGrow: 0,
                          flexShrink: 0,
                          justifyContent: 'center',
                          paddingBottom: 9,
                          paddingLeft: 9,
                          paddingRight: 9,
                          paddingTop: 9,
                        },
                        dimensions.width
                      )}
                    >
                      {/* Label */}
                      <Text
                        accessible={true}
                        selectable={false}
                        style={StyleSheet.applyWidth(
                          {
                            color: palettes.App.Community_White,
                            fontFamily: 'Rubik_500Medium',
                            fontSize: 13,
                            lineHeight: 18,
                          },
                          dimensions.width
                        )}
                      >
                        {'Week'}
                      </Text>
                    </View>
                  </Touchable>
                </View>
              )}
            </>
            {/* Flex Frame for Touchable */}
            <>
              {menuTab2 ? null : (
                <View
                  style={StyleSheet.applyWidth(
                    {
                      backgroundColor: palettes.App.Community_Icon_BG_Color,
                      paddingBottom: 1,
                      paddingTop: 1,
                    },
                    dimensions.width
                  )}
                >
                  <Touchable
                    onPress={() => {
                      try {
                        setMenuTab1(false);
                        setMenuTab3(false);
                        setMenuTab2(true);
                        setListMissing(true);
                      } catch (err) {
                        console.log(err);
                      }
                    }}
                  >
                    {/* Button Frame False */}
                    <View
                      style={StyleSheet.applyWidth(
                        {
                          alignItems: 'center',
                          backgroundColor: palettes.App.Community_Icon_BG_Color,
                          borderBottomWidth: 2,
                          borderColor: palettes.App.Community_Icon_BG_Color,
                          borderLeftWidth: 2,
                          borderRadius: 64,
                          borderRightWidth: 2,
                          borderTopWidth: 2,
                          flexGrow: 0,
                          flexShrink: 0,
                          justifyContent: 'center',
                          paddingBottom: 9,
                          paddingLeft: 9,
                          paddingRight: 9,
                          paddingTop: 9,
                        },
                        dimensions.width
                      )}
                    >
                      {/* Label */}
                      <Text
                        accessible={true}
                        selectable={false}
                        style={StyleSheet.applyWidth(
                          {
                            color: palettes.Brand.Community_Dark_UI,
                            fontFamily: 'Rubik_400Regular',
                            fontSize: 13,
                            lineHeight: 18,
                          },
                          dimensions.width
                        )}
                      >
                        {'Week'}
                      </Text>
                    </View>
                  </Touchable>
                </View>
              )}
            </>
          </View>
          {/* Option 3 Frame */}
          <View
            style={StyleSheet.applyWidth(
              {
                borderBottomRightRadius: 64,
                borderTopRightRadius: 64,
                flex: 1,
                flexGrow: 1,
                flexShrink: 0,
              },
              dimensions.width
            )}
          >
            {/* Flex Frame for Touchable */}
            <>
              {!menuTab3 ? null : (
                <View
                  style={StyleSheet.applyWidth(
                    {
                      backgroundColor: palettes.App.Community_Icon_BG_Color,
                      borderBottomRightRadius: 64,
                      borderTopRightRadius: 64,
                      paddingBottom: 1,
                      paddingTop: 1,
                    },
                    dimensions.width
                  )}
                >
                  <Touchable
                    onPress={() => {
                      try {
                        setMenuTab1(false);
                        setMenuTab2(false);
                        setMenuTab3(true);
                      } catch (err) {
                        console.log(err);
                      }
                    }}
                  >
                    {/* Button Frame True */}
                    <View
                      style={StyleSheet.applyWidth(
                        {
                          alignItems: 'center',
                          backgroundColor: theme.colors.branding.secondary,
                          borderBottomWidth: 2,
                          borderColor: theme.colors.branding.secondary,
                          borderLeftWidth: 2,
                          borderRadius: 64,
                          borderRightWidth: 2,
                          borderTopWidth: 2,
                          flexGrow: 0,
                          flexShrink: 0,
                          justifyContent: 'center',
                          paddingBottom: 9,
                          paddingLeft: 9,
                          paddingRight: 9,
                          paddingTop: 9,
                        },
                        dimensions.width
                      )}
                    >
                      {/* Label */}
                      <Text
                        accessible={true}
                        selectable={false}
                        style={StyleSheet.applyWidth(
                          {
                            color: palettes.App.Community_White,
                            fontFamily: 'Rubik_500Medium',
                            fontSize: 13,
                            lineHeight: 18,
                          },
                          dimensions.width
                        )}
                      >
                        {'Month'}
                      </Text>
                    </View>
                  </Touchable>
                </View>
              )}
            </>
            {/* Flex Frame for Touchable */}
            <>
              {menuTab3 ? null : (
                <View
                  style={StyleSheet.applyWidth(
                    {
                      backgroundColor: palettes.App.Community_Icon_BG_Color,
                      borderBottomRightRadius: 64,
                      borderTopRightRadius: 64,
                      paddingBottom: 1,
                      paddingTop: 1,
                    },
                    dimensions.width
                  )}
                >
                  <Touchable
                    onPress={() => {
                      try {
                        setMenuTab1(false);
                        setMenuTab2(false);
                        setMenuTab3(true);
                        setListMissing(true);
                      } catch (err) {
                        console.log(err);
                      }
                    }}
                  >
                    {/* Button Frame False */}
                    <View
                      style={StyleSheet.applyWidth(
                        {
                          alignItems: 'center',
                          backgroundColor: palettes.App.Community_Icon_BG_Color,
                          borderBottomWidth: 2,
                          borderColor: palettes.App.Community_Icon_BG_Color,
                          borderLeftWidth: 2,
                          borderRadius: 64,
                          borderRightWidth: 2,
                          borderTopWidth: 2,
                          flexGrow: 0,
                          flexShrink: 0,
                          justifyContent: 'center',
                          paddingBottom: 9,
                          paddingLeft: 9,
                          paddingRight: 9,
                          paddingTop: 9,
                        },
                        dimensions.width
                      )}
                    >
                      {/* Label */}
                      <Text
                        accessible={true}
                        selectable={false}
                        style={StyleSheet.applyWidth(
                          {
                            color: palettes.Brand.Community_Dark_UI,
                            fontFamily: 'Rubik_400Regular',
                            fontSize: 13,
                            lineHeight: 18,
                          },
                          dimensions.width
                        )}
                      >
                        {'Month'}
                      </Text>
                    </View>
                  </Touchable>
                </View>
              )}
            </>
          </View>
        </View>
        {/* Providers section */}
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingBottom: 6,
              paddingTop: 6,
            },
            dimensions.width
          )}
        >
          <View
            style={StyleSheet.applyWidth(
              {
                alignItems: 'flex-end',
                alignSelf: 'auto',
                flexDirection: 'row',
                justifyContent: 'flex-end',
              },
              dimensions.width
            )}
          >
            <Touchable />
            <Icon
              color={theme.colors.text.strong}
              name={'Feather/users'}
              size={18}
            />
            <Text
              accessible={true}
              selectable={false}
              style={StyleSheet.applyWidth(
                {
                  color: theme.colors.text.strong,
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  paddingLeft: 6,
                },
                dimensions.width
              )}
            >
              {'All Providers'}
            </Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default withTheme(LoginScreen);
