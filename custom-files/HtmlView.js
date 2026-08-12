import React from 'react';
import {
  Dimensions,
  View,
  Image,
  TouchableOpacity,
  Text,
  Linking,
} from 'react-native';
import HTMLView from 'react-native-htmlview';

export const HtmlView = ({
  htmlContent,
  patientData,
  fontSize = 1,
  textColor = '#333',
  collapsible = false,
  collapsedMaxHeight = 120,
  moreColor = '#0F766E',
}) => {
  const { width: screenWidth } = Dimensions.get('window');
  const [expanded, setExpanded] = React.useState(false);
  const [contentHeight, setContentHeight] = React.useState(0);

  React.useEffect(() => {
    setExpanded(false);
    setContentHeight(0);
  }, [htmlContent]);

  const replacePlaceholders = (html, data) => {
    const fullName = `${data?.patient?.first_name || ''} ${data?.patient?.last_name || ''}`;

    const providerName = `${data?.appointment?.staff_member?.first_name || ''} ${data?.appointment?.staff_member?.last_name || ''}`;

    const dateOfBirth = data?.patient?.birthdate || '';
    const visitDate = data?.appointment?.start_moment || '';
    const currentDateTime = new Date().toLocaleString();

    const signatureUrl =
      data?.appointment?.staff_member?.signature ||
      data?.updated_by?.signature ||
      '';

    return html
      .replace(/{{Patient\.FullName}}/g, fullName)
      .replace(/{{Patient\.DateOfBirth}}/g, dateOfBirth)
      .replace(/{{Patient\.LastAppointment\.DateTime}}/g, visitDate)
      .replace(/{{Patient\.PreferredProviderFullName}}/g, providerName)

      // 🔥 Replace with IMAGE
      .replace(
        /{{Patient\.PreferredProviderSignature}}/g,
        signatureUrl
          ? `<img src="${signatureUrl}" style="width:120px;height:60px;" />`
          : ''
      )

      .replace(/{{CurrentDateTime}}/g, currentDateTime);
  };
  const renderNode = (node, index, siblings, parent, defaultRenderer) => {
    if (node.name === 'img') {
      const { src, width, height } = node.attribs;

      const w = Number(width) || screenWidth * 0.8; // fallback if missing
      const h = Number(height) || w * 0.6; // maintain aspect ratio

      return (
        <Image
          key={index}
          source={{ uri: src }}
          style={{
            width: w,
            height: h,
            resizeMode: 'contain',
          }}
        />
      );
    }
    // Handle links
    if (node.name === 'a') {
      const href = node.attribs.href;
      const text =
        node.children && node.children.length > 0 && node.children[0].data;

      // Normalize href: add protocol if missing, or base URL logic
      let url = href;
      if (!/^https?:\/\//i.test(href)) {
        url = 'https://master-app.suno.tech/' + href; // adjust to your base domain
      }

      return (
        <TouchableOpacity key={index} onPress={() => Linking.openURL(url)}>
          <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
            {text || url}
          </Text>
        </TouchableOpacity>
      );
    }
    if (node.name === 'table') {
      return (
        <View
          key={index}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            // marginVertical: 8,
          }}
        >
          {defaultRenderer(node.children, parent)}
        </View>
      );
    }
    if (node.name === 'tr') {
      return (
        <View key={index} style={{ flexDirection: 'row' }}>
          {defaultRenderer(node.children, parent)}
        </View>
      );
    }
    if (node.name === 'td') {
      return (
        <View
          key={index}
          style={{
            flex: 1,
            // borderWidth: 1,
            borderColor: '#ccc',
            padding: 6,
          }}
        >
          {defaultRenderer(node.children, parent)}
        </View>
      );
    }

    if (node.name === 'iframe') {
      return null;
    }

    // Default for others
    return undefined;
  };
  const formattedHtml = replacePlaceholders(htmlContent, patientData)
    .replace(/\n+/g, '') // remove new lines
    .replace(/<\/p>\s*<p>/g, '</p><p>');

  const isCollapsed = collapsible && !expanded;
  const showToggle =
    collapsible && contentHeight > collapsedMaxHeight + 1;

  const renderHtml = () => (
    <HTMLView
      value={formattedHtml}
      renderNode={renderNode}
      stylesheet={{
        body: {
          fontSize: 13,
          color: 'rgb(31, 41, 55)',
          marginBottom: 8,
          marginTop: 0,
          fontFamily: 'Inter_500Medium',
          marginBottom: 4,
        },
        p: {
          fontSize: 13,
          color: 'rgb(31, 41, 55)',
          marginBottom: 8,
          marginTop: 0,
          fontFamily: 'Inter_500Medium',
          marginBottom: 4,
        },
        h3: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
        table: { borderWidth: 1, borderColor: '#ccc', marginVertical: 10 },
        td: { borderWidth: 1, borderColor: '#ccc', padding: 6 },
      }}
    />
  );

  if (!collapsible) {
    return renderHtml();
  }

  return (
    <View>
      {/* Measure full content height without clipping */}
      <View
        pointerEvents="none"
        style={{
          left: 0,
          opacity: 0,
          position: 'absolute',
          right: 0,
          zIndex: -1,
        }}
        onLayout={event => {
          const nextHeight = event?.nativeEvent?.layout?.height || 0;
          if (nextHeight > 0) {
            setContentHeight(prev =>
              Math.abs(prev - nextHeight) > 1 ? nextHeight : prev
            );
          }
        }}
      >
        {renderHtml()}
      </View>

      <View
        style={
          isCollapsed
            ? { maxHeight: collapsedMaxHeight, overflow: 'hidden' }
            : undefined
        }
      >
        {renderHtml()}
      </View>
      {showToggle ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setExpanded(prev => !prev)}
          style={{ alignSelf: 'flex-start', marginTop: 6, paddingVertical: 2 }}
        >
          <Text
            style={{
              color: moreColor,
              fontFamily: 'Inter_600SemiBold',
              fontSize: 13,
            }}
          >
            {expanded ? 'Less' : 'More'}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
