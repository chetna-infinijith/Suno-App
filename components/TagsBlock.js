import React from 'react';
import {
  Pressable,
  SimpleStyleFlatList,
  Surface,
  withTheme,
} from '@draftbit/ui';
import { Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import useNavigation from '../utils/useNavigation';
import useWindowDimensions from '../utils/useWindowDimensions';

const defaultProps = {
  Header: 'Tags',
  TagsList: [
    { id: 1, label: 'Football' },
    { id: 2, label: 'Sports' },
    { id: 3, label: 'Entertainment' },
    { id: 4, label: 'Mind Game' },
    { id: 5, label: 'Superhero' },
    { id: 6, label: 'Dance' },
    { id: 7, label: 'AI Intelligence' },
    { id: 8, label: 'DeepSeek' },
    { id: 9, label: 'Technology' },
    { id: 10, label: 'Gaming' },
    { id: 11, label: 'Music' },
    { id: 12, label: 'Travel' },
  ],
  onPressEvent: null,
};

const TagsBlock = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const [selectedID, setSelectedID] = React.useState('');

  return (
    <View
      style={StyleSheet.applyWidth(
        { backgroundColor: theme.colors.background.brand, flex: 1 },
        dimensions.width
      )}
    >
      <Surface
        {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
        elevation={2}
        style={StyleSheet.applyWidth(
          StyleSheet.compose(
            GlobalStyles.SurfaceStyles(theme)['Surface'].style,
            {
              backgroundColor: theme.colors.background.base,
              borderColor: theme.colors.border.brand,
              borderRadius: 12,
              borderWidth: 1,
              gap: 8,
              padding: 16,
            }
          ),
          dimensions.width
        )}
      >
        <Text
          accessible={true}
          selectable={false}
          {...GlobalStyles.TextStyles(theme)['Text'].props}
          style={StyleSheet.applyWidth(
            StyleSheet.compose(GlobalStyles.TextStyles(theme)['Text'].style, {
              color: theme.colors.text.normal,
              fontFamily: 'Poppins_600SemiBold',
              fontSize: 17,
            }),
            dimensions.width
          )}
        >
          {props.Header ?? defaultProps.Header}
          {' : '}
        </Text>
        {/* Tags Container */}
        <View style={StyleSheet.applyWidth({ gap: 6 }, dimensions.width)}>
          <SimpleStyleFlatList
            data={props.TagsList ?? defaultProps.TagsList}
            decelerationRate={'normal'}
            horizontal={false}
            inverted={false}
            keyExtractor={(listData, index) => index}
            keyboardShouldPersistTaps={'never'}
            listKey={'Surface->Tags Container->List'}
            nestedScrollEnabled={false}
            numColumns={1}
            onEndReachedThreshold={0.5}
            pagingEnabled={false}
            renderItem={({ item, index }) => {
              const listData = item;
              return (
                <Pressable
                  onPress={() => {
                    try {
                      setSelectedID(
                        selectedID === listData?.id ? '' : listData?.id
                      );
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                  activeOpacity={0.3}
                >
                  <Surface
                    {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
                    elevation={0}
                    style={StyleSheet.applyWidth(
                      StyleSheet.compose(
                        GlobalStyles.SurfaceStyles(theme)['Surface'].style,
                        {
                          backgroundColor: [
                            {
                              minWidth: Breakpoints.Mobile,
                              value: theme.colors.branding.secondary,
                            },
                            {
                              minWidth: Breakpoints.Mobile,
                              value:
                                selectedID === listData?.id
                                  ? theme.colors.branding.primary
                                  : theme.colors.branding.secondary,
                            },
                          ],
                          borderColor: theme.colors.border.brand,
                          borderRadius: 20,
                          borderWidth: 1,
                          justifyContent: 'center',
                          paddingBottom: 6,
                          paddingLeft: 12,
                          paddingRight: 12,
                          paddingTop: 6,
                        }
                      ),
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      selectable={false}
                      {...GlobalStyles.TextStyles(theme)['Text'].props}
                      style={StyleSheet.applyWidth(
                        StyleSheet.compose(
                          GlobalStyles.TextStyles(theme)['Text'].style,
                          {
                            color: [
                              {
                                minWidth: Breakpoints.Mobile,
                                value: theme.colors.text.normal,
                              },
                              {
                                minWidth: Breakpoints.Mobile,
                                value:
                                  selectedID === listData?.id
                                    ? palettes.Slate[50]
                                    : theme.colors.text.normal,
                              },
                            ],
                            fontFamily: 'Poppins_500Medium',
                          }
                        ),
                        dimensions.width
                      )}
                    >
                      {listData?.label}
                    </Text>
                  </Surface>
                </Pressable>
              );
            }}
            showsHorizontalScrollIndicator={true}
            showsVerticalScrollIndicator={true}
            snapToAlignment={'start'}
            style={StyleSheet.applyWidth(
              { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
              dimensions.width
            )}
          />
        </View>
      </Surface>
    </View>
  );
};

export default withTheme(TagsBlock);
