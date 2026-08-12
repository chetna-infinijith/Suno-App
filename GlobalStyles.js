import * as StyleSheet from './utils/StyleSheet';

import Breakpoints from './utils/Breakpoints';

import palettes from './themes/palettes';

export const TextFieldStyles = theme =>
  StyleSheet.create({ 'Styled Text Field': { style: {}, props: {} } });

export const TextInputStyles = theme =>
  StyleSheet.create({
    'Text Area': {
      style: {
        borderBottomWidth: 1,
        borderColor: theme.colors.border.base,
        borderLeftWidth: 1,
        borderRadius: 8,
        borderRightWidth: 1,
        borderTopWidth: 1,
        paddingBottom: 8,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 8,
      },
      props: {},
    },
    'Text Input': {
      style: {
        borderBottomWidth: 1,
        borderColor: theme.colors.border.base,
        borderLeftWidth: 1,
        borderRadius: 8,
        borderRightWidth: 1,
        borderTopWidth: 1,
        paddingBottom: 8,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 8,
      },
      props: {},
    },
  });

export const ExpoImageStyles = theme =>
  StyleSheet.create({
    Image: { style: { height: 100, width: 100 }, props: {} },
  });

export const LinearGradientStyles = theme =>
  StyleSheet.create({ 'Linear Gradient': { style: { flex: 1 }, props: {} } });

export const TabViewItemStyles = theme =>
  StyleSheet.create({ 'Tab View Item': { style: { flex: 1 }, props: {} } });

export const BottomSheetStyles = theme =>
  StyleSheet.create({
    'Bottom Sheet': {
      style: {
        paddingBottom: 10,
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 10,
      },
      props: {},
    },
  });

export const DividerStyles = theme =>
  StyleSheet.create({ Divider: { style: { height: 1 }, props: {} } });

export const TextStyles = theme =>
  StyleSheet.create({
    Text: { style: { color: theme.colors.text.strong }, props: {} },
    'Text 2': { style: { color: theme.colors.text.strong }, props: {} },
    'Text 3': {
      style: {
        color: theme.colors.text.strong,
        fontFamily: 'Poppins_400Regular',
      },
      props: {},
    },
  });

export const ImageStyles = theme =>
  StyleSheet.create({
    'Image 2': { style: { height: 100, width: 100 }, props: {} },
  });

export const FetchStyles = theme =>
  StyleSheet.create({ Fetch: { style: { minHeight: 40 }, props: {} } });

export const CheckboxRowStyles = theme =>
  StyleSheet.create({
    'Checkbox Row': { style: { minHeight: 50 }, props: {} },
  });

export const DatePickerStyles = theme =>
  StyleSheet.create({ 'Date Picker': { style: {}, props: {} } });

export const HStackStyles = theme =>
  StyleSheet.create({
    'H Stack': {
      style: { alignItems: 'center', flexDirection: 'row' },
      props: {},
    },
  });

export const ActionSheetItemStyles = theme =>
  StyleSheet.create({
    'Action Sheet Item': { style: { textAlign: 'center' }, props: {} },
  });

export const SwipeableItemStyles = theme =>
  StyleSheet.create({
    'Swipeable Item': { style: { overflow: 'hidden' }, props: {} },
  });

export const SwiperStyles = theme =>
  StyleSheet.create({
    Swiper: { style: { height: 300, width: '100%' }, props: {} },
  });

export const NumberInputStyles = theme =>
  StyleSheet.create({
    'Number Input': {
      style: {
        borderBottomWidth: 1,
        borderColor: theme.colors.border.base,
        borderLeftWidth: 1,
        borderRadius: 8,
        borderRightWidth: 1,
        borderTopWidth: 1,
        paddingBottom: 8,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 8,
      },
      props: {},
    },
  });

export const MultiSelectPickerStyles = theme =>
  StyleSheet.create({ 'Multi Select Picker': { style: {}, props: {} } });

export const PickerStyles = theme =>
  StyleSheet.create({ Picker: { style: {}, props: {} } });

export const SurfaceStyles = theme =>
  StyleSheet.create({
    Surface: { style: { minHeight: 40 }, props: {} },
    'Surface 2': { style: { minHeight: 40 }, props: {} },
  });

export const CircleStyles = theme =>
  StyleSheet.create({
    Circle: {
      style: {
        alignItems: 'center',
        backgroundColor: theme.colors.branding.primary,
        justifyContent: 'center',
      },
      props: {},
    },
  });

export const WebViewStyles = theme =>
  StyleSheet.create({ 'HTML View': { style: { flex: 1 }, props: {} } });

export const ActivityIndicatorStyles = theme =>
  StyleSheet.create({
    'Activity Indicator': { style: { height: 36, width: 36 }, props: {} },
  });

export const ButtonStyles = theme =>
  StyleSheet.create({
    Button: {
      style: {
        backgroundColor: theme.colors.branding.primary,
        borderRadius: 8,
        fontFamily: 'System',
        fontWeight: '700',
        textAlign: 'center',
      },
      props: {},
    },
  });
